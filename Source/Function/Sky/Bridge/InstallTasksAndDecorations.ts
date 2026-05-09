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

	// Workspace edits / focus - extension `workspace.applyEdit(edit)` /
	// `window.showTextDocument(uri)` round-trips. Sky re-dispatches; the
	// workbench's BulkEditService + EditorService consume the events.
	await Register(
		"sky://workspace/applyEdit",

		SimpleRelay("cel:workspace:applyEdit"),
	);

	await Register(
		"sky://window/showTextDocument",

		SimpleRelay("cel:window:showTextDocument"),
	);

	// Editor decorations - 16ms-batched create/dispose.
	await Register(
		"sky://decoration/createTextEditorDecorationType",

		(Payload: any) => {
			DispatchDecorationBatch("cel:decoration:create", Payload);
		},
	);

	await Register(
		"sky://decoration/disposeTextEditorDecorationType",

		(Payload: any) => {
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

	await Register("sky://webview/dispose", ({ panelId }: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:dispose", { detail: { panelId } }),
		);
	});
};
