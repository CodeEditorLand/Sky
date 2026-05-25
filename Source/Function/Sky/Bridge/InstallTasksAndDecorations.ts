/**
 * Compact installer for the Tasks, Workspace-edit / focus, Editor
 * decorations, Output-channel lifecycle, and webview message relays
 * - all groups are thin DOM-event re-dispatchers and share the same
 * "Mountain emits → Sky fans out via CustomEvent" shape.
 *
 * The decoration relay demultiplexes 16-ms-batched
 * `{ batch: [<payload>, ...] }` payloads
 * (`Vine/Server/Notification/DecorationTypeLifecycle.rs`) back into
 * one event per entry so individual listeners stay simple, and falls
 * back to the bare-payload shape for any non-batched runtime emit.
 *
 * Output-channel lifecycle covers the six-action loop (`create`,
 * `append`, `clear`, `show`, `hide`, `dispose`) - each just routes to
 * the matching `cel:output-channel:<action>` DOM event.
 */
type Handler = (Payload: any) => void;

const SimpleRelay = (DomEventName: string): Handler => {
	return (Payload: any): void => {
		document.dispatchEvent(
			new CustomEvent(DomEventName, { detail: Payload }),
		);
	};
};

const DispatchDecorationBatch = (
	DomEvent: string,

	Payload: { batch?: unknown[] } | unknown,
): void => {
	const Maybe = (Payload as { batch?: unknown[] } | undefined)?.batch;

	if (Array.isArray(Maybe)) {
		for (const Entry of Maybe) {
			document.dispatchEvent(
				new CustomEvent(DomEvent, { detail: Entry }),
			);
		}
	} else {
		document.dispatchEvent(new CustomEvent(DomEvent, { detail: Payload }));
	}
};

export default async (Dependencies: {
	Register: (Channel: string, Handler: Handler) => Promise<void>;
}): Promise<void> => {
	const { Register } = Dependencies;

	// Tasks
	await Register("sky://task/execute", SimpleRelay("cel:task:execute"));

	await Register("sky://task/terminate", SimpleRelay("cel:task:terminate"));

	// sky://workspace/applyEdit and sky://window/showTextDocument have real
	// handlers in InstallEditorAndOutput.ts that wire BulkEditService and
	// EditorService. Registering SimpleRelays here caused double-handling:
	// both the DOM relay and the real handler fired on every Mountain emit.

	// Editor decorations - real workbench `ICodeEditorService.registerDecorationType`
	// call. The previous DOM-event-only relay was inert: the workbench never
	// learned the decoration type existed, so when `setDecorationsByType` was
	// later called with the same key, Monaco's renderer had no styling registered
	// and silently rendered nothing. Every extension that uses
	// `createTextEditorDecorationType` (ESLint squiggles, GitLens current-line
	// blame, Error Lens inline messages, Continue inline completions) appeared
	// to no-op.
	//
	// Real registration: pull `ICodeEditorService` from `__CEL_SERVICES__`,
	// call `registerDecorationType("ext", key, options)`. The "ext" description
	// is the standard MainThreadCodeEditors marker so workbench code paths that
	// inspect the parentTypeKey still recognise these as extension-origin.
	await Register(
		"sky://decoration/createTextEditorDecorationType",

		(Payload: any) => {
			// Batch may carry many decoration registrations in one tick.
			const Entries: any[] = Array.isArray(Payload?.batch)
				? Payload.batch
				: [Payload];
			const Services: any = (globalThis as any).__CEL_SERVICES__;
			const CodeEditor = Services?.CodeEditor;
			if (!CodeEditor?.registerDecorationType) {
				DispatchDecorationBatch("cel:decoration:create", Payload);
				return;
			}
			for (const Entry of Entries) {
				try {
					const Key = String(Entry?.key ?? "");
					if (!Key) continue;
					const Options = Entry?.options ?? {};
					CodeEditor.registerDecorationType("ext", Key, Options);
				} catch {
					/* swallow per-entry - one bad reg mustn't kill the rest */
				}
			}
			DispatchDecorationBatch("cel:decoration:create", Payload);
		},
	);

	await Register(
		"sky://decoration/disposeTextEditorDecorationType",

		(Payload: any) => {
			const Entries: any[] = Array.isArray(Payload?.batch)
				? Payload.batch
				: [Payload];
			const Services: any = (globalThis as any).__CEL_SERVICES__;
			const CodeEditor = Services?.CodeEditor;
			if (CodeEditor?.removeDecorationType) {
				for (const Entry of Entries) {
					try {
						const Key = String(Entry?.key ?? "");
						if (Key) CodeEditor.removeDecorationType(Key);
					} catch {
						/* swallow */
					}
				}
			}
			DispatchDecorationBatch("cel:decoration:dispose", Payload);
		},
	);

	// Output-channel lifecycle (6 actions).
	for (const Action of [
		"create",

		"append",

		"clear",

		"show",

		"hide",

		"dispose",
	]) {
		await Register(
			`sky://output-channel/${Action}`,

			SimpleRelay(`cel:output-channel:${Action}`),
		);
	}

	// Webview message + dispose relays. The `panelId, method, params`
	// shape comes from the workbench-RPC path
	// (`RPC/CocoonService/mod.rs::webview.postMessage`); the raw
	// extension `postMessage` path emits `{ handle, message }` on the
	// kebab-case channel.
	await Register(
		"sky://webview/message",

		({ panelId, method, params }: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:webview:message", {
					detail: { panelId, method, params },
				}),
			);
		},
	);

	await Register("sky://webview/post-message", ({ handle, message }: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:post-message", {
				detail: { handle, message },
			}),
		);
	});

	// sky://webview/dispose is handled in InstallWebview.ts with the real
	// panel cleanup. A DOM-relay duplicate here caused double-disposal.
};
