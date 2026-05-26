/**
 * @module Bridge/InstallEditorOperations
 *
 * ---- Editor operations bridge ----
 *
 * Covers:
 *  - `sky://decoration/set-ranges`   (editor.setDecorations)
 *  - `sky://editor/apply-text-edits` (editor.edit)
 *  - Active editor / selection push  (CodeEditorService events → Mountain IPC)
 *  - `sky://editor/revealRange`      (editor.revealRange)
 */

export default async (Dependencies: {
	Register: (
		Channel: string,
		Handler: (Payload: any) => void,
	) => Promise<void>;
	GetServices: () => {
		CodeEditorService?: {
			listCodeEditors?(): unknown[];
			onDidChangeActiveCodeEditor?(
				handler: (editor: unknown) => void,
			): void;
		};
		[key: string]: unknown;
	} | null;
	Invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}): Promise<void> => {
	const { Register, GetServices, Invoke } = Dependencies;

	// ---- setDecorations (apply ranges to a decoration type) ----
	// Mountain emits this when an extension calls
	// `editor.setDecorations(type, ranges)`. We route each entry to
	// ICodeEditorService → find editor by URI →
	// `editor.setDecorations(key, ranges)`. The payload is
	// `{ batch: [{ decorationTypeKey, uri, rangesOrOptions }] }`.
	await Register("sky://decoration/set-ranges", (Payload: any) => {
		const Services = GetServices();
		const CodeEditorService = (Services as any)?.CodeEditorService;
		const Entries: any[] = Array.isArray(Payload?.batch)
			? Payload.batch
			: [Payload];
		for (const Entry of Entries) {
			try {
				const Key = Entry?.decorationTypeKey;
				const Uri = Entry?.uri;
				const RangesOrOptions = Entry?.rangesOrOptions ?? [];
				if (!Key || !Uri) continue;
				const Editors: any[] =
					CodeEditorService?.listCodeEditors?.() ?? [];
				for (const Ed of Editors) {
					try {
						const EditorUri = Ed?.getModel?.()?.uri?.toString?.();
						if (
							EditorUri !== Uri &&
							!EditorUri?.endsWith(Uri.split("/").pop() ?? "")
						) {
							continue;
						}
						// Monaco's CodeEditor exposes `setDecorationsByType
						// (description, decorationTypeKey, decorations)` -
						// the form that resolves styling against the
						// type registered through `registerDecorationType`.
						// The earlier `editor.setDecorations(key, ranges)`
						// call hit a different API (the deprecated
						// `editor.setDecorations` no longer exists on
						// current Monaco), so decorations silently dropped.
						// "ext" matches the description we registered in
						// `InstallTasksAndDecorations.ts`.
						if (typeof Ed.setDecorationsByType === "function") {
							Ed.setDecorationsByType(
								"ext",
								Key,
								RangesOrOptions,
							);
						} else if (typeof Ed.setDecorations === "function") {
							// Older Monaco fallback - kept for graceful
							// degradation, but the registered-type path
							// above is what production paint relies on.
							Ed.setDecorations(Key, RangesOrOptions);
						}
					} catch {
						/* skip bad editor */
					}
				}
			} catch {
				/* skip bad entry */
			}
		}
	});

	// ---- editor.edit() text mutations ----
	// Mountain emits this when an extension calls `editor.edit(cb)`.
	// Payload: `{ uri, edits: [{range, text}] }`.
	await Register("sky://editor/apply-text-edits", (Payload: any) => {
		const Services = GetServices();
		const CodeEditorService = (Services as any)?.CodeEditorService;
		const Uri = Payload?.uri;
		const Edits: any[] = Array.isArray(Payload?.edits) ? Payload.edits : [];
		if (!Uri || !Edits.length) return;
		const Editors: any[] = CodeEditorService?.listCodeEditors?.() ?? [];
		for (const Ed of Editors) {
			try {
				const EditorUri = Ed?.getModel?.()?.uri?.toString?.();
				if (
					EditorUri !== Uri &&
					!EditorUri?.endsWith(Uri.split("/").pop() ?? "")
				)
					continue;
				// Convert to Monaco edit operations and apply.
				// Handles both VS Code 0-based Range (_start._line) and
				// already-1-based Monaco ranges (startLineNumber).
				const ExtL = (Val: any, Fb: number): number =>
					typeof Val?._line === "number"
						? Val._line + 1
						: typeof Val?.line === "number"
							? Val.line + 1
							: Fb;
				const ExtC = (Val: any, Fb: number): number =>
					typeof Val?._character === "number"
						? Val._character + 1
						: typeof Val?.character === "number"
							? Val.character + 1
							: Fb;
				const Ops = Edits.map((E: any) => {
					const R = E.range ?? E._range ?? {};
					const S = R._start ?? R.start ?? {};
					const En = R._end ?? R.end ?? {};
					return {
						range: {
							startLineNumber: R.startLineNumber ?? ExtL(S, 1),
							startColumn: R.startColumn ?? ExtC(S, 1),
							endLineNumber: R.endLineNumber ?? ExtL(En, 1),
							endColumn: R.endColumn ?? ExtC(En, 1),
						},
						text: E.text ?? E._newText ?? E.newText ?? "",
						forceMoveMarkers: true,
					};
				});
				Ed.executeEdits?.("extension-host", Ops);
				break;
			} catch {
				/* skip */
			}
		}
	});

	// ---- Sky → Mountain: push active editor and selection state ----
	// Wire into the workbench's ICodeEditorService events so Mountain
	// (and through it, Cocoon) always knows the current editor and
	// selection.
	try {
		const Services = GetServices();
		const CodeEditorService = (Services as any)?.CodeEditorService;

		// Resolve the view column (1-based) for the active editor group.
		// `EditorGroups.activeGroup.index` is 0-based, so we add 1.
		// Falls back to 1 when the service isn't yet available.
		const GetViewColumn = (): number => {
			try {
				const Groups = (Services as any)?.EditorGroups;
				const Idx = Groups?.activeGroup?.index;
				return typeof Idx === "number" ? Idx + 1 : 1;
			} catch {
				return 1;
			}
		};

		// Single onDidChangeActiveCodeEditor subscription handles both
		// sky:editor:activeChanged AND selection-change wiring. Two separate
		// subscriptions caused the service event to fire twice on every editor
		// switch - once per listener - doubling all downstream IPC calls.
		if (CodeEditorService?.onDidChangeActiveCodeEditor) {
			let SelectionDisposable: (() => void) | null = null;
			CodeEditorService.onDidChangeActiveCodeEditor((Ed: any) => {
				// Fire active-editor IPC (was the first standalone subscription).
				try {
					const Uri = Ed?.getModel?.()?.uri?.toString?.();
					if (Uri) {
						const Sels = Ed?.getSelections?.() ?? [];
						Invoke("MountainIPCInvoke", {
							method: "sky:editor:activeChanged",
							params: [
								{
									uri: Uri,
									selections: Sels,
									viewColumn: GetViewColumn(),
								},
							],
						}).catch(() => {});
					}
				} catch {}
				// Dispose the previous editor's selection listener to prevent
				// unbounded accumulation (one permanent listener per switch).
				try {
					SelectionDisposable?.();
				} catch {}
				SelectionDisposable = null;
				if (!Ed) return;
				const D = Ed.onDidChangeCursorSelection?.((E: any) => {
					try {
						const Uri = Ed.getModel?.()?.uri?.toString?.();
						if (!Uri) return;
						const Sels = E?.selection
							? [E.selection, ...(E.secondarySelections ?? [])]
							: [];
						Invoke("MountainIPCInvoke", {
							method: "sky:editor:selectionChanged",
							params: [
								{
									uri: Uri,
									selections: Sels,
									viewColumn: GetViewColumn(),
								},
							],
						}).catch(() => {});
					} catch {}
				});

				// Scroll / visible-ranges change. Monaco's
				// `onDidScrollChange` fires per frame while the user
				// scrolls; debounce to 60ms so we ship at most ~16fps
				// of IPC. Payload mirrors VS Code's
				// `TextEditorVisibleRangesChangeEvent` shape - a
				// single `visibleRanges` array. Subscribers (code lens
				// providers, "Open Reference in Peek View", `vscode.git`'s
				// minimap) consume this to lazy-load decorations.
				let ScrollFlushTimer: ReturnType<typeof setTimeout> | null =
					null;
				Ed.onDidScrollChange?.(() => {
					if (ScrollFlushTimer !== null) return;
					ScrollFlushTimer = setTimeout(() => {
						ScrollFlushTimer = null;
						try {
							const Uri = Ed.getModel?.()?.uri?.toString?.();
							if (!Uri) return;
							const VisibleRanges =
								typeof Ed.getVisibleRanges === "function"
									? Ed.getVisibleRanges()
									: [];
							Invoke("MountainIPCInvoke", {
								method: "sky:editor:visibleRangesChanged",
								params: [
									{
										uri: Uri,
										viewColumn: GetViewColumn(),
										visibleRanges: VisibleRanges,
									},
								],
							}).catch(() => {});
						} catch {
							/* swallow */
						}
					}, 60);
				});

				// Editor option changes (tab size, word wrap, etc.).
				// VS Code exposes `TextEditorOptions`; the workbench's
				// option-mutation surfaces fire `onDidChangeConfiguration`
				// on Monaco. Forward the resolved options so the
				// `vscode.window.onDidChangeTextEditorOptions` event
				// fires for extensions reading active editor options.
				Ed.onDidChangeConfiguration?.((E: any) => {
					try {
						const Uri = Ed.getModel?.()?.uri?.toString?.();
						if (!Uri) return;
						const Opts = Ed.getOptions?.();
						const TabSize = Opts?.get?.(
							/* EditorOption.tabSize */ undefined,
						);
						const InsertSpaces =
							Ed.getModel?.()?.getOptions?.()?.insertSpaces;
						Invoke("MountainIPCInvoke", {
							method: "sky:editor:optionsChanged",
							params: [
								{
									uri: Uri,
									viewColumn: GetViewColumn(),
									options: {
										tabSize:
											typeof TabSize === "number"
												? TabSize
												: undefined,
										insertSpaces:
											typeof InsertSpaces === "boolean"
												? InsertSpaces
												: undefined,
										changedConfiguration: E,
									},
								},
							],
						}).catch(() => {});
					} catch {
						/* swallow */
					}
				});
				// IDisposable from Monaco is either { dispose() } or a function.
				if (D && typeof D.dispose === "function") {
					SelectionDisposable = () => D.dispose();
				} else if (typeof D === "function") {
					SelectionDisposable = D;
				}
			});
		}
		// Wire Monaco model content changes → Mountain → Cocoon `onDidChangeTextDocument`.
		// Debounce at 300ms per model so fast typists don't flood Mountain with IPC.
		// This is the critical path for LSP (diagnostics, completions, etc.) to see
		// up-to-date content.
		if (CodeEditorService) {
			const PendingChanges = new Map<
				string,
				ReturnType<typeof setTimeout>
			>();

			const FlushChanges = (Ed: any) => {
				const Uri = Ed?.getModel?.()?.uri?.toString?.();
				if (!Uri) return;
				const Content = Ed?.getModel?.()?.getValue?.() ?? "";
				const Version = Ed?.getModel?.()?.getVersionId?.() ?? 1;
				Invoke("MountainIPCInvoke", {
					method: "sky:model:contentChanged",
					params: [{ uri: Uri, content: Content, version: Version }],
				}).catch(() => {});
			};

			const SetupEditorListener = (Ed: any) => {
				if (!Ed || (Ed as any).__celContentListened) return;
				(Ed as any).__celContentListened = true;
				Ed.onDidChangeModelContent?.(() => {
					const Uri = Ed?.getModel?.()?.uri?.toString?.() ?? "";
					if (!Uri) return;
					if (PendingChanges.has(Uri))
						clearTimeout(PendingChanges.get(Uri)!);
					PendingChanges.set(
						Uri,
						setTimeout(() => {
							PendingChanges.delete(Uri);
							FlushChanges(Ed);
						}, 300),
					);
				});
			};

			// Wire into all currently-open editors
			const ExistingEditors: any[] =
				CodeEditorService.listCodeEditors?.() ?? [];
			for (const Ed of ExistingEditors) {
				try {
					SetupEditorListener(Ed);
				} catch {}
			}

			// Wire into future editors
			CodeEditorService.onCodeEditorAdd?.((Ed: any) => {
				try {
					SetupEditorListener(Ed);
				} catch {}
			});
		}
	} catch {
		/* workbench events not yet available */
	}

	// ---- onDidChangeTextEditorDiffInformation ----
	// When the active editor pane is a diff editor (file vs git index,
	// vs disk, vs HEAD, …), Monaco's diff widget exposes `onDidUpdateDiff`
	// which fires once the diff computation settles. Stock VS Code
	// re-emits this as `vscode.window.onDidChangeTextEditorDiffInformation`
	// so extensions surfacing diff-relative annotations (GitLens, Pull
	// Requests, Git Graph) can refresh their inline counters.
	//
	// We subscribe at active-editor changes: each time the user opens a
	// diff (or moves between diffs), check whether the active pane's
	// control quacks like a diff editor and hook `onDidUpdateDiff`. The
	// per-diff disposable is dropped on the next active-editor change.
	try {
		const Services = GetServices();
		const EditorService = (Services as any)?.Editor;
		if (EditorService?.onDidActiveEditorChange) {
			let DiffDisposable: (() => void) | null = null;
			const HookDiff = () => {
				// Tear down any previous diff subscription so we never
				// accumulate listeners across editor switches.
				try {
					DiffDisposable?.();
				} catch {
					/* swallow */
				}
				DiffDisposable = null;
				try {
					const Pane = EditorService.activeEditorPane;
					const Control = Pane?.getControl?.();
					// Diff widgets expose both `getOriginalEditor()` and
					// `getModifiedEditor()` plus `onDidUpdateDiff`.
					if (
						!Control ||
						typeof Control.onDidUpdateDiff !== "function" ||
						typeof Control.getModifiedEditor !== "function"
					) {
						return;
					}
					const Modified = Control.getModifiedEditor();
					const ModifiedUri =
						Modified?.getModel?.()?.uri?.toString?.() ?? null;
					const Original = Control.getOriginalEditor?.();
					const OriginalUri =
						Original?.getModel?.()?.uri?.toString?.() ?? null;
					const Emit = () => {
						try {
							// `getLineChanges()` returns the diff hunk
							// array (or null while a computation is in
							// flight). The shape mirrors VS Code's
							// `LineChange[]`: `{
							//   originalStartLineNumber,
							//   originalEndLineNumber,
							//   modifiedStartLineNumber,
							//   modifiedEndLineNumber,
							//   charChanges?
							// }`.
							const Changes =
								typeof Control.getLineChanges === "function"
									? (Control.getLineChanges() ?? [])
									: [];
							Invoke("MountainIPCInvoke", {
								method: "sky:editor:diffInformationChanged",
								params: [
									{
										modifiedUri: ModifiedUri,
										originalUri: OriginalUri,
										changes: Changes,
									},
								],
							}).catch(() => {});
						} catch {
							/* swallow */
						}
					};
					// Emit once at hook-time (initial diff is settled by
					// the time `onDidActiveEditorChange` fires for a diff
					// pane), then again on every recomputation.
					Emit();
					const D = Control.onDidUpdateDiff(Emit);
					if (D && typeof D.dispose === "function") {
						DiffDisposable = () => D.dispose();
					} else if (typeof D === "function") {
						DiffDisposable = D;
					}
				} catch {
					/* swallow - diff editor may have torn down mid-hook */
				}
			};
			EditorService.onDidActiveEditorChange(HookDiff);
			// And hook the current active pane on first wire-up so a diff
			// that was already open at boot fires immediately.
			HookDiff();
		}
	} catch {
		/* IEditorService not yet exposed */
	}

	// ---- onDidChangeVisibleTextEditors ----
	// Subscribe to IEditorService.onDidVisibleEditorsChange and forward
	// every change as a single Mountain IPC call. Mountain then fans out
	// to Cocoon as `$acceptVisibleEditorsChanged` so extensions hooking
	// `vscode.window.onDidChangeVisibleTextEditors` (linters, lazy code
	// lens, diagnostic clearers) react when the user opens / closes /
	// switches tabs. Without this, those subscribers never fire and
	// stale diagnostics accumulate against closed files.
	try {
		const Services = GetServices();
		const EditorService = (Services as any)?.Editor;
		if (EditorService?.onDidVisibleEditorsChange) {
			// Dedupe consecutive identical snapshots - the workbench fires
			// `onDidVisibleEditorsChange` from multiple internal sources for
			// a single user action (active editor change, group focus change,
			// tab reorder). Sending the same URI array repeatedly produces
			// duplicated `$acceptVisibleEditorsChanged` callbacks in Cocoon
			// for every interaction, which inflates IPC traffic and (with
			// the `applyDecorations` re-run cost) shows up as input lag.
			let LastVisibleSerialized = "";
			EditorService.onDidVisibleEditorsChange(() => {
				try {
					const Visible: any[] =
						EditorService.visibleTextEditorControls ??
						EditorService.visibleEditorPanes ??
						[];
					const Uris: string[] = [];
					for (const Pane of Visible) {
						try {
							const Uri =
								Pane?.getModel?.()?.uri?.toString?.() ??
								Pane?.input?.resource?.toString?.() ??
								Pane?.input?.editorInput?.resource?.toString?.();
							if (Uri) Uris.push(Uri);
						} catch {
							/* one pane failed, keep iterating */
						}
					}
					const Serialized = Uris.join("\n");
					if (Serialized === LastVisibleSerialized) return;
					LastVisibleSerialized = Serialized;
					Invoke("MountainIPCInvoke", {
						method: "sky:editor:visibleChanged",
						params: [{ uris: Uris }],
					}).catch(() => {});
				} catch {
					/* swallow - workbench may be tearing down */
				}
			});
		}
	} catch {
		/* IEditorService not yet exposed */
	}

	// ---- onDidChangeTabs / onDidChangeTabGroups ----
	// Tab-level events are produced by IEditorGroupsService when the user
	// opens, closes, moves, or pins a tab. The workbench fires
	// `onDidChangeActiveGroup` and `onDidAddGroup` / `onDidRemoveGroup` at
	// group granularity; tab-level changes per group come through each
	// group's own `onDidModelChange` event (the group model holds the
	// ordered editor list = tabs).
	try {
		const Services = GetServices();
		const EditorGroups = (Services as any)?.EditorGroups;
		if (EditorGroups?.onDidChangeActiveGroup) {
			// `FlushTabs` is bound to three group-level events plus every
			// per-group `onDidModelChange`. A single tab-click fires three to
			// four of these in close succession; without a snapshot dedupe
			// every click sends three identical `sky:editor:tabsChanged`
			// payloads to Mountain, which re-fans to Cocoon and re-runs every
			// extension's tab/diagnostic listener. Compare the serialised
			// snapshot to the last one we shipped and bail when they match.
			let LastTabsSerialized = "";
			const FlushTabs = () => {
				try {
					const Groups: any[] = EditorGroups.groups ?? [];
					const Snapshot = Groups.map((G) => ({
						id: G?.id,
						isActive: G?.id === EditorGroups.activeGroup?.id,
						tabs: (G?.editors ?? []).map((E: any) => ({
							label:
								typeof E?.getName === "function"
									? E.getName()
									: (E?.name ?? ""),
							uri:
								E?.resource?.toString?.() ??
								E?.editorInput?.resource?.toString?.() ??
								"",
						})),
					}));
					const Serialized = JSON.stringify(Snapshot);
					if (Serialized === LastTabsSerialized) return;
					LastTabsSerialized = Serialized;
					Invoke("MountainIPCInvoke", {
						method: "sky:editor:tabsChanged",
						params: [{ groups: Snapshot }],
					}).catch(() => {});
				} catch {
					/* swallow */
				}
			};

			EditorGroups.onDidChangeActiveGroup?.(FlushTabs);
			EditorGroups.onDidAddGroup?.(FlushTabs);
			EditorGroups.onDidRemoveGroup?.(FlushTabs);

			// Wire per-group model changes so opening / closing / moving
			// a tab inside a group triggers FlushTabs. The wiring lasts
			// for the lifetime of the group; new groups inherit the
			// hook via `onDidAddGroup` re-flushing the snapshot.
			//
			// Per-group `onDidMoveEditor` covers the
			// `vscode.window.onDidChangeTextEditorViewColumn` event.
			// Stock VS Code fires when an editor is moved between groups
			// (split-view shuffle, drag-and-drop tab to another column,
			// `View: Move Editor to Group` command). The group's event
			// carries `{editor, target?}` - target identifies the
			// destination group when the move is cross-group.
			const NotifyViewColumnChange = (
				MovedEditor: any,
				TargetGroup: any,
			) => {
				try {
					const Uri =
						MovedEditor?.resource?.toString?.() ??
						MovedEditor?.editorInput?.resource?.toString?.() ??
						null;
					if (!Uri) return;
					// Destination group's index → 1-based viewColumn.
					// Fall back to current activeGroup index if target
					// is omitted (intra-group move).
					const DestIdx =
						typeof TargetGroup?.index === "number"
							? TargetGroup.index
							: typeof EditorGroups.activeGroup?.index ===
								  "number"
								? EditorGroups.activeGroup.index
								: 0;
					Invoke("MountainIPCInvoke", {
						method: "sky:editor:viewColumnChanged",
						params: [{ uri: Uri, viewColumn: DestIdx + 1 }],
					}).catch(() => {});
				} catch {
					/* swallow */
				}
			};
			const HookGroup = (G: any) => {
				try {
					if (!G || G.__celTabsHooked) return;
					G.__celTabsHooked = true;
					G.onDidModelChange?.(FlushTabs);
					G.onDidMoveEditor?.((E: any) => {
						NotifyViewColumnChange(
							E?.editor ?? null,
							E?.target ?? G,
						);
					});
				} catch {
					/* swallow */
				}
			};
			for (const G of EditorGroups.groups ?? []) HookGroup(G);
			EditorGroups.onDidAddGroup?.(HookGroup);
		}
	} catch {
		/* IEditorGroupsService not yet exposed */
	}

	// ---- editor.revealRange - scroll Monaco to a range ----
	// Mountain emits this when an extension calls
	// `editor.revealRange(range, revealType)`.
	// Payload: `{ uri, range: {startLineNumber, startColumn,
	// endLineNumber, endColumn}, revealType }`.
	// RevealType enum: 0=Simple, 1=Center, 2=CenterIfOutsideViewport,
	// 3=NearTop, 4=NearTopIfOutsideViewport
	await Register("sky://editor/revealRange", (Payload: any) => {
		const Services = GetServices();
		const CodeEditorService = (Services as any)?.CodeEditorService;
		if (!CodeEditorService) return;
		const Uri = Payload?.uri;
		const R = Payload?.range;
		const RevealType = Payload?.revealType ?? 1; // Center
		if (!Uri || !R) return;
		const Editors: any[] = CodeEditorService.listCodeEditors?.() ?? [];
		for (const Ed of Editors) {
			try {
				const EdUri = Ed?.getModel?.()?.uri?.toString?.();
				if (
					EdUri !== Uri &&
					!EdUri?.endsWith(Uri.split("/").pop() ?? "")
				)
					continue;
				// Monaco range is 1-based; payload already in Mountain
				// 1-based form.
				const MonacoRange = {
					startLineNumber:
						R?.startLineNumber ?? (R?.start?.line ?? 0) + 1,
					startColumn:
						R?.startColumn ?? (R?.start?.character ?? 0) + 1,
					endLineNumber: R?.endLineNumber ?? (R?.end?.line ?? 0) + 1,
					endColumn: R?.endColumn ?? (R?.end?.character ?? 0) + 1,
				};
				Ed.revealRange?.(MonacoRange, RevealType);
				break;
			} catch {
				/* skip */
			}
		}
	});
};
