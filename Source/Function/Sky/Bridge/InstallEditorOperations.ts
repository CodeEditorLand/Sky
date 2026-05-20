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
				// Find Monaco editor matching the URI.
				const Editors: any[] =
					CodeEditorService?.listCodeEditors?.() ?? [];
				for (const Ed of Editors) {
					try {
						const EditorUri = Ed?.getModel?.()?.uri?.toString?.();
						if (
							EditorUri === Uri ||
							EditorUri?.endsWith(Uri.split("/").pop() ?? "")
						) {
							Ed.setDecorations?.(Key, RangesOrOptions);
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
				const Ops = Edits.map((E: any) => ({
					range: {
						startLineNumber:
							E.range?.startLineNumber ??
							E.range?.start?.line + 1 ??
							1,
						startColumn:
							E.range?.startColumn ??
							E.range?.start?.character + 1 ??
							1,
						endLineNumber:
							E.range?.endLineNumber ??
							E.range?.end?.line + 1 ??
							1,
						endColumn:
							E.range?.endColumn ??
							E.range?.end?.character + 1 ??
							1,
					},
					text: E.text ?? "",
					forceMoveMarkers: true,
				}));
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

		if (CodeEditorService?.onDidChangeActiveCodeEditor) {
			CodeEditorService.onDidChangeActiveCodeEditor((Ed: any) => {
				try {
					const Uri = Ed?.getModel?.()?.uri?.toString?.();
					if (!Uri) return;
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
				} catch {}
			});
		}
		// Also wire selection changes
		if (CodeEditorService?.onDidChangeActiveCodeEditor) {
			CodeEditorService.onDidChangeActiveCodeEditor((Ed: any) => {
				if (!Ed) return;
				Ed.onDidChangeCursorSelection?.((E: any) => {
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
			});
		}
	} catch {
		/* workbench events not yet available */
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
