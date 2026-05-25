/**
 * Editor + Output bridge: routes the close-window, file-open, save-all,
 * applyEdit, showTextDocument, applyEdits, and diff channels into workbench
 * commands; routes the output channel-lifecycle channels into the
 * local OutputChannels map.
 *
 * `sky://window/close-requested` is the macOS Cmd+W handler -
 * Mountain has already `prevent_close()`d the underlying Tauri close,
 * so we try to close the active editor first and fall through to
 * `nativeHost:closeWindow` only if the workbench has no editor (welcome
 * screen / empty / not yet installed).
 *
 * `applyEdit` and `showTextDocument` are round-trip request channels
 * (`{ RequestIdentifier, Payload }`); we MUST call `ResolveUiRequest`
 * on completion or the extension's awaited promise hangs for 300s.
 *
 * `sky://editor/diff` is the round-trip channel for `vscode.diff` /
 * `$scm:openDiff`. The vscode.git extension calls it when the user
 * clicks a staged or unstaged file in the SCM sidebar; Mountain
 * serialises the positional args `[leftUri, rightUri, title?, options?]`
 * and forwards them here. We dispatch `vscode.diff` into the workbench
 * and resolve the round-trip so the extension's awaited promise settles.
 */
import { invoke } from "@tauri-apps/api/core";

type Invoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

type ResolveUiRequest = (RequestId: string, Result: unknown) => unknown;

interface Workbench {
	commands: { executeCommand: (id: string, ...args: unknown[]) => any };

	env: { openUri(target: unknown): Promise<boolean> };
}

export default async (Dependencies: {
	Register: (
		Channel: string,

		Handler: (Payload: any) => void | Promise<void>,
	) => Promise<void>;
	GetWorkbench: () => Workbench | null;
	Invoke: Invoke;
	BuildOpenArg: (Source: unknown) => unknown;
	ResolveUiRequest: ResolveUiRequest;
	GetOrCreateChannel: (Id: string, Name?: string) => string[];
	OutputChannels: Map<string, string[]>;
}): Promise<void> => {
	const {
		Register,

		GetWorkbench,

		Invoke,

		BuildOpenArg,

		ResolveUiRequest,

		GetOrCreateChannel,

		OutputChannels,
	} = Dependencies;

	const SwallowCatch = (Promise: { catch?: (h: () => void) => void }) =>
		Promise?.catch?.(() => undefined);

	await Register("sky://window/close-requested", async () => {
		const Workbench = GetWorkbench();
		const Services: any = (globalThis as any).__CEL_SERVICES__;
		const ActiveEditorCount = (() => {
			try {
				const Editor = Services?.Editor;
				const Snapshot = Editor?.snapshot?.() ?? Editor;
				if (Array.isArray(Snapshot?.visibleEditors)) {
					return Snapshot.visibleEditors.length;
				}
				if (Snapshot?.activeEditor) return 1;
			} catch {
				/* fall through */
			}
			return -1;
		})();
		if (Workbench && ActiveEditorCount !== 0) {
			try {
				await Workbench.commands.executeCommand(
					"workbench.action.closeActiveEditor",
				);
				return;
			} catch {
				/* fall through to actual close */
			}
		}
		try {
			await Invoke("MountainIPCInvoke", {
				method: "nativeHost:closeWindow",
				params: [],
			});
		} catch {
			/* nothing to do; window will stay open if Mountain rejects */
		}
	});

	await Register("sky://editor/openDocument", ({ uri, viewColumn }: any) => {
		const Wb = GetWorkbench();
		if (!Wb) return;
		SwallowCatch(
			Wb.commands.executeCommand(
				"vscode.open",

				BuildOpenArg(uri),

				viewColumn,
			),
		);
	});

	await Register("sky://editor/saveAll", () => {
		const Wb = GetWorkbench();
		if (!Wb) return;
		SwallowCatch(
			Wb.commands.executeCommand("workbench.action.files.saveAll"),
		);
	});

	// `workspace.save(uri)` round-trip - saves a specific document URI via
	// the workbench's ITextFileService and resolves the awaited promise.
	await Register(
		"sky://workspace/save",
		async ({ RequestIdentifier, Payload }: any) => {
			const UriArg =
				Payload?.external ??
				Payload?.toString?.() ??
				(typeof Payload === "string" ? Payload : null);
			try {
				const Services: any = (globalThis as any).__CEL_SERVICES__;
				const TextFileService =
					Services?.TextFileService ?? Services?.textFileService;
				if (TextFileService && UriArg) {
					await TextFileService.save({
						toString: () => UriArg,
					} as any);
				} else {
					const Wb = GetWorkbench();
					if (Wb) {
						await Wb.commands.executeCommand(
							"workbench.action.files.save",
						);
					}
				}
			} catch {
				// Best-effort; Mountain already wrote to disk in SaveOperations.rs.
			}
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, UriArg ?? null);
			}
		},
	);

	// `workspace.saveAll()` round-trip - saves all dirty documents.
	await Register(
		"sky://workspace/saveAll",
		async ({ RequestIdentifier }: any) => {
			try {
				const Wb = GetWorkbench();
				if (Wb) {
					await Wb.commands.executeCommand(
						"workbench.action.files.saveAll",
					);
				}
			} catch {
				/* best-effort */
			}
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, true);
			}
		},
	);

	// `workspace.saveAs(uri)` round-trip - opens save-as dialog.
	await Register(
		"sky://workspace/saveAs",
		async ({ RequestIdentifier, Payload }: any) => {
			const UriArg =
				Payload?.external ??
				Payload?.toString?.() ??
				(typeof Payload === "string" ? Payload : null);
			try {
				const Wb = GetWorkbench();
				if (Wb) {
					await Wb.commands.executeCommand(
						"workbench.action.files.saveAs",
					);
				}
			} catch {
				/* best-effort */
			}
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, UriArg ?? null);
			}
		},
	);

	// `applyEdit` round-trip - Mountain blocks the extension's awaited
	// promise until we resolve. Applies a WorkspaceEdit by routing
	// each resource's text edits to the matching Monaco text model via
	// IBulkEditService (if available) or direct model operations.
	await Register(
		"sky://workspace/applyEdit",

		async ({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;
			try {
				const Services: any = (globalThis as any).__CEL_SERVICES__;
				// Normalize WorkspaceEdit to a flat list of {resource, edits: TextEdit[]} entries.
				// Handles multiple wire shapes:
				//  1. { edits: [{resource|uri, edits|textEdits}] } - standard
				//  2. Raw array of entries
				//  3. { _edits: [{_type, uri, textEdit}] } - extHostTypes.WorkspaceEdit internal
				const NormalizedEdits: Array<{
					resource: unknown;
					edits: unknown[];
				}> = [];
				const NormalizeUri = (Raw: unknown): unknown => {
					if (!Raw) return Raw;
					if (typeof Raw === "string") return Raw;
					return Raw;
				};
				const RawEditsSource: any[] = Array.isArray(Payload?.edits)
					? Payload.edits
					: Array.isArray(Payload?._edits)
						? Payload._edits
						: Array.isArray(Payload)
							? Payload
							: [];
				for (const E of RawEditsSource) {
					if (!E) continue;
					// extHostTypes.WorkspaceEdit serialized format:
					// FileEditType.Text = 2: { _type: 2, uri, edit: TextEdit{_range, _newText}, metadata }
					// FileEditType.File = 1: { _type: 1, from?, to?, options, metadata }
					// Legacy format: { resource|uri, edits|textEdits: [] }
					if (
						typeof E._type === "number" ||
						typeof E._type === "string"
					) {
						const Type = Number(E._type);
						if (Type === 2) {
							// Text edit: normalize TextEdit from extHostTypes format
							const Uri = NormalizeUri(E.uri);
							const RawEdit = E.edit ?? E.textEdit;
							if (Uri && RawEdit) {
								// TextEdit has _range ({_start:{_line,_character},_end:{...}}) and _newText
								const RawRange =
									RawEdit._range ?? RawEdit.range;
								const NewText =
									RawEdit._newText ??
									RawEdit.newText ??
									RawEdit.newText ??
									"";
								const NormalizedEdit = {
									range: RawRange
										? {
												startLineNumber:
													(RawRange._start?._line ??
														RawRange.start?.line ??
														0) + 1,
												startColumn:
													(RawRange._start
														?._character ??
														RawRange.start
															?.character ??
														0) + 1,
												endLineNumber:
													(RawRange._end?._line ??
														RawRange.end?.line ??
														0) + 1,
												endColumn:
													(RawRange._end
														?._character ??
														RawRange.end
															?.character ??
														0) + 1,
											}
										: {
												startLineNumber: 1,
												startColumn: 1,
												endLineNumber: 1,
												endColumn: 1,
											},
									newText: NewText,
									text: NewText,
								};
								const UriKey =
									typeof Uri === "string"
										? Uri
										: JSON.stringify(Uri);
								const Entry = NormalizedEdits.find((X: any) => {
									const XKey =
										typeof X.resource === "string"
											? X.resource
											: JSON.stringify(X.resource);
									return XKey === UriKey;
								});
								if (Entry) {
									Entry.edits.push(NormalizedEdit);
								} else {
									NormalizedEdits.push({
										resource: Uri,
										edits: [NormalizedEdit],
									});
								}
							}
						}
						// Type === 1: file operation (rename/create/delete) - handled in fileEdits section
					} else {
						const Resource = E.resource ?? E.uri;
						const Edits = Array.isArray(E.edits)
							? E.edits
							: Array.isArray(E.textEdits)
								? E.textEdits
								: [];
						if (Resource && Edits.length > 0) {
							NormalizedEdits.push({
								resource: NormalizeUri(Resource),
								edits: Edits,
							});
						}
					}
				}
				const RawEdits = NormalizedEdits;

				// Prefer IBulkEditService when accessible (handles rename/create/delete too).
				const BulkEdit =
					Services?.BulkEdit ?? Services?.bulkEditService;
				if (
					BulkEdit &&
					typeof BulkEdit.apply === "function" &&
					RawEdits.length > 0
				) {
					try {
						// Build VS Code resource text edit array for IBulkEditService.
						const ExtractUriForBulk = (Raw: any): any => {
							if (!Raw) return null;
							// Try to hydrate into a real URI using workbench's URI ctor.
							const UriCtor =
								Services?.URI ?? (globalThis as any).__cel_URI;
							const Scheme = Raw._scheme ?? Raw.scheme ?? "file";
							const Authority =
								Raw._authority ?? Raw.authority ?? "";
							const Path = Raw._path ?? Raw.path ?? "";
							if (UriCtor?.from)
								return UriCtor.from({
									scheme: Scheme,
									authority: Authority,
									path: Path,
								});
							return Raw;
						};
						const ResourceEdits = RawEdits.filter(
							(E: any) => E?.resource || E?.uri,
						).map((E: any) => ({
							resource: ExtractUriForBulk(E.resource ?? E.uri),
							edits: E.edits as any[],
						}));
						await BulkEdit.apply(ResourceEdits);
						void ResolveUiRequest(RequestIdentifier, true);
						return;
					} catch {
						// Fall through to direct model path.
					}
				}

				// Direct model path: find Monaco model by URI, execute edits.
				const ModelService =
					Services?.ModelService ?? Services?.modelService;
				const ExtractUriString = (Raw: any): string | null => {
					if (!Raw) return null;
					if (typeof Raw === "string") return Raw;
					// Real toString method (not Object.prototype.toString)
					if (
						typeof Raw.toString === "function" &&
						Raw.toString !== Object.prototype.toString
					) {
						const S = Raw.toString();
						if (S && S !== "[object Object]") return S;
					}
					// Serialized vscode.Uri: has _scheme, _path etc.
					const Scheme = Raw._scheme ?? Raw.scheme ?? "file";
					const Authority = Raw._authority ?? Raw.authority ?? "";
					const Path = Raw._path ?? Raw.path ?? Raw.fsPath ?? "";
					if (Path) return `${Scheme}://${Authority}${Path}`;
					return null;
				};
				let Applied = false;
				for (const Entry of RawEdits) {
					const UriStr =
						ExtractUriString(Entry?.resource) ??
						ExtractUriString(Entry?.uri);
					const TextEdits: any[] = Array.isArray(Entry?.edits)
						? Entry.edits
						: Array.isArray(Entry?.textEdits)
							? Entry.textEdits
							: [];
					if (!UriStr || !TextEdits.length) continue;
					try {
						const Model =
							ModelService?.getModel?.({
								toString: () => UriStr,
							}) ?? ModelService?.getModel?.(UriStr);
						if (!Model) continue;
						// Handle VS Code 0-based ranges (_start._line from extHostTypes)
						// and already-1-based Monaco ranges (startLineNumber).
						const ExtL2 = (Val: any, Fb: number): number =>
							typeof Val?._line === "number"
								? Val._line + 1
								: typeof Val?.line === "number"
									? Val.line + 1
									: Fb;
						const ExtC2 = (Val: any, Fb: number): number =>
							typeof Val?._character === "number"
								? Val._character + 1
								: typeof Val?.character === "number"
									? Val.character + 1
									: Fb;
						const Ops = TextEdits.map((E: any) => {
							const R = E.range ?? E._range ?? {};
							const S = R._start ?? R.start ?? {};
							const En = R._end ?? R.end ?? {};
							return {
								range: {
									startLineNumber:
										R.startLineNumber ?? ExtL2(S, 1),
									startColumn: R.startColumn ?? ExtC2(S, 1),
									endLineNumber:
										R.endLineNumber ?? ExtL2(En, 1),
									endColumn: R.endColumn ?? ExtC2(En, 1),
								},
								text: E.newText ?? E.text ?? "",
								forceMoveMarkers: true,
							};
						});
						Model.applyEdits?.(Ops);
						Applied = true;
					} catch {
						/* skip bad entry */
					}
				}

				// Fire-and-forget workbench file-ops (create/rename/delete).
				// Collect from both Payload?.fileEdits (legacy) and _edits with _type=1.
				const FileEdits: any[] = [
					...(Array.isArray(Payload?.fileEdits)
						? Payload.fileEdits
						: []),
					...RawEditsSource.filter(
						(E: any) => E && Number(E._type) === 1,
					),
				];
				for (const FileOp of FileEdits) {
					try {
						// extHostTypes FileEditType.File = 1, with from/to fields.
						// Legacy format: type = "create"|"rename"|"delete", uri/oldUri/newUri fields.
						const IsCreate =
							FileOp.type === "create" ||
							(Number(FileOp._type) === 1 &&
								!FileOp.from &&
								FileOp.to);
						const IsRename =
							FileOp.type === "rename" ||
							(Number(FileOp._type) === 1 &&
								FileOp.from &&
								FileOp.to);
						const IsDelete =
							FileOp.type === "delete" ||
							(Number(FileOp._type) === 1 &&
								FileOp.from &&
								!FileOp.to);
						if (IsCreate) {
							const TargetUri =
								FileOp.uri ?? FileOp.newUri ?? FileOp.to;
							if (TargetUri) {
								await Invoke("MountainIPCInvoke", {
									method: "file:writeFile",
									params: [TargetUri, ""],
								}).catch(() => {});
							}
						} else if (IsRename) {
							const FromUri = FileOp.oldUri ?? FileOp.from;
							const ToUri = FileOp.newUri ?? FileOp.to;
							if (FromUri && ToUri) {
								await Invoke("MountainIPCInvoke", {
									method: "file:rename",
									params: [
										FromUri,
										ToUri,
										{
											overwrite:
												FileOp.options?.overwrite ??
												false,
										},
									],
								}).catch(() => {});
							}
						} else if (IsDelete) {
							const TargetUri =
								FileOp.uri ?? FileOp.oldUri ?? FileOp.from;
							if (TargetUri) {
								await Invoke("MountainIPCInvoke", {
									method: "file:delete",
									params: [
										TargetUri,
										{
											recursive:
												FileOp.options?.recursive ??
												false,
										},
									],
								}).catch(() => {});
							}
						}
					} catch {
						/* continue */
					}
				}

				void ResolveUiRequest(
					RequestIdentifier,
					Applied || RawEdits.length === 0 ? true : true,
				);
			} catch (Error) {
				invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"sky-bridge",
						"[SkyBridge] applyEdit failed",
						Error,
					],
				}).catch(() => {});
				void ResolveUiRequest(RequestIdentifier, false);
			}
		},
	);

	await Register("sky://window/showTextDocument", async (RawPayload: any) => {
		const RequestIdentifier = RawPayload?.RequestIdentifier;
		const Payload = RawPayload?.Payload ?? RawPayload;
		const UriValue =
			Payload?.[0]?.uri ?? Payload?.uri ?? Payload?.[0] ?? null;
		const ViewColumn =
			Payload?.[1]?.viewColumn ??
			Payload?.viewColumn ??
			Payload?.[1] ??
			null;
		try {
			const Wb = GetWorkbench();
			if (Wb && UriValue) {
				await Wb.commands.executeCommand(
					"vscode.open",

					BuildOpenArg(UriValue),

					ViewColumn,
				);
			}
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, {
					uri: UriValue,
					viewColumn: ViewColumn,
				});
			}
		} catch (Error) {
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"sky-bridge",
					"[SkyBridge] showTextDocument failed",
					Error,
				],
			}).catch(() => {});
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, null);
			}
		}
	});

	// `sky://editor/diff` - opened by the vscode.diff / $scm:openDiff
	// Mountain effect arm when the user clicks a staged or unstaged file
	// in the SCM sidebar. The vscode.git extension calls:
	//   commands.executeCommand("vscode.diff", leftUri, rightUri, title, opts?)
	// Mountain serialises all four positional args as a JSON array and
	// sends them here as a round-trip request (RequestIdentifier +
	// Payload). We must call ResolveUiRequest on completion so the
	// extension's awaited promise resolves.
	//
	// Payload shape (array): [leftUri, rightUri, title?, options?]
	//   leftUri  - the "before" side (e.g. git:// scheme, HEAD content)
	//   rightUri - the "after"  side (working-tree or index file URI)
	//   title    - optional string label for the editor tab
	//   options  - optional { preview, viewColumn, ... }
	await Register("sky://editor/diff", async (RawPayload: any) => {
		const RequestIdentifier = RawPayload?.RequestIdentifier;
		const Payload = RawPayload?.Payload ?? RawPayload;

		// Payload is the raw positional-args array from the extension call.
		// Mountain wraps it: { RequestIdentifier, Payload: [left, right, title?, opts?] }
		// but may also arrive unwrapped as a bare array for fire-and-forget paths.
		const Args: unknown[] = Array.isArray(Payload)
			? Payload
			: Array.isArray(Payload?.args)
				? Payload.args
				: [];

		const LeftUri = Args[0] ?? null;
		const RightUri = Args[1] ?? null;
		const Title = typeof Args[2] === "string" ? Args[2] : undefined;
		const Options =
			Args[3] != null && typeof Args[3] === "object"
				? (Args[3] as Record<string, unknown>)
				: {};

		const ViewColumn = (Options as any)?.viewColumn ?? null;

		try {
			const Wb = GetWorkbench();
			if (Wb && LeftUri != null && RightUri != null) {
				await Wb.commands.executeCommand(
					"vscode.diff",
					BuildOpenArg(LeftUri),
					BuildOpenArg(RightUri),
					Title,
					{ viewColumn: ViewColumn, preview: true, ...Options },
				);
			}
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, {
					viewColumn: ViewColumn,
				});
			}
		} catch (Error) {
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: ["sky-bridge", "[SkyBridge] vscode.diff failed", Error],
			}).catch(() => {});
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, null);
			}
		}
	});

	await Register("sky://editor/applyEdits", ({ edits }: any) => {
		if (!Array.isArray(edits) || !edits.length) return;
		const Wb = GetWorkbench();
		if (!Wb) return;
		SwallowCatch(
			Wb.commands.executeCommand(
				"workbench.action.applyThemeFromFile",

				edits,
			),
		);
	});

	await Register("sky://output/create", ({ id, name }: any) => {
		GetOrCreateChannel(id, name);
	});

	await Register("sky://output/append", ({ channel, text }: any) => {
		const Lines = GetOrCreateChannel(channel);
		Lines.push(text);
		(window as any).__CEL_WORKBENCH__?.logger?.log?.(
			5 /* Info */,

			`[${channel}] ${text}`,
		);
	});

	await Register("sky://output/clear", ({ channel }: any) => {
		OutputChannels.set(channel, []);
	});

	// `outputChannel.replace(value)` is atomic in upstream VS Code:
	// clear + append rendered as one paint. We model that here by
	// replacing the buffer outright. Without this handler, replace
	// fell through to the dispatcher's null path and never reached
	// the workbench's logger or the in-memory snapshot.
	await Register("sky://output/replace", ({ channel, value }: any) => {
		const Channel = String(channel ?? "");
		const Text = String(value ?? "");
		OutputChannels.set(Channel, [Text]);
		(window as any).__CEL_WORKBENCH__?.logger?.log?.(
			5 /* Info */,
			`[${Channel}] ${Text}`,
		);
	});

	await Register("sky://output/show", ({ visible, preserveFocus }: any) => {
		if (visible === false) return;
		const Wb = GetWorkbench();
		if (!Wb) return;
		// `workbench.action.output.show` accepts an optional channelId.
		// Honoring `preserveFocus` means we do NOT call `focus()` on
		// the panel afterwards; the workbench command itself doesn't
		// re-focus, so the no-op is the correct preserveFocus behavior.
		void preserveFocus;
		SwallowCatch(
			Wb.commands.executeCommand("workbench.action.output.show"),
		);
	});

	await Register("sky://output/dispose", ({ channel }: any) => {
		OutputChannels.delete(channel);
	});
};
