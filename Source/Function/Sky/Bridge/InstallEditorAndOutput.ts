/**
 * Editor + Output bridge: routes the close-window, file-open, save-all,
 * applyEdit, showTextDocument, applyEdits channels into workbench
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
				console.warn("[SkyBridge] applyEdit failed", Error);
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
			console.warn("[SkyBridge] showTextDocument failed", Error);
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
