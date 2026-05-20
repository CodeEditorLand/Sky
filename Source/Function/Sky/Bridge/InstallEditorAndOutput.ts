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

	// `applyEdit` round-trip - Mountain blocks the extension's awaited
	// promise until we resolve. The actual workbench-edit machinery is
	// pending; for now we acknowledge with `true` after best-effort
	// command dispatch.
	await Register(
		"sky://workspace/applyEdit",

		async ({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;
			try {
				const Wb = GetWorkbench();
				const Edits = Payload?.edits ?? Payload ?? [];
				if (Wb && Edits) {
					await Wb.commands.executeCommand(
						"workbench.action.applyThemeFromFile",

						Edits,
					);
				}
				void ResolveUiRequest(RequestIdentifier, true);
			} catch (Error) {
				invoke("MountainIPCInvoke", { method: "diagnostic:log", params: ["sky-bridge", "[SkyBridge] applyEdit failed", Error] }).catch(() => {});
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
			invoke("MountainIPCInvoke", { method: "diagnostic:log", params: ["sky-bridge", "[SkyBridge] showTextDocument failed", Error] }).catch(() => {});
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
			invoke("MountainIPCInvoke", { method: "diagnostic:log", params: ["sky-bridge", "[SkyBridge] vscode.diff failed", Error] }).catch(() => {});
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

	await Register("sky://output/show", ({ visible }: any) => {
		if (visible !== false) {
			const Wb = GetWorkbench();
			if (!Wb) return;
			SwallowCatch(
				Wb.commands.executeCommand("workbench.action.output.show"),
			);
		}
	});

	await Register("sky://output/dispose", ({ channel }: any) => {
		OutputChannels.delete(channel);
	});
};
