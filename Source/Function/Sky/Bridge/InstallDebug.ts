/**
 * Debug + custom-editor channel relays. All eight channels in this
 * group are pure DOM-event re-dispatchers; the workbench's own
 * `IDebugService` and `ICustomEditorService` already handle the
 * underlying flows through stock VS Code internals. The relays exist
 * so future Sky-side observers (debug-toolbar React component, code-
 * lens overlays for breakpoints, gitlens diff overlays for custom-
 * editor save events) can subscribe via
 * `document.addEventListener("cel:debug:*" / "cel:customEditor:*")`
 * without each adding its own Tauri listener.
 *
 * `sky://debug/dap-message` carries parsed DAP frames from the
 * adapter's stdout (see Mountain `Environment/DebugProvider.rs`); the
 * workbench's `RawDebugSession` correlates responses by `request_seq`
 * - the relay forwards the raw `{ sessionId, message }` shape so a
 * future RawDebugSession shim can subscribe and forward without re-
 * implementing DAP framing.
 */
type Handler = (Payload: any) => void;

const SimpleRelay = (DomEventName: string): Handler => {
	return (Payload: any): void => {
		document.dispatchEvent(
			new CustomEvent(DomEventName, { detail: Payload }),
		);
	};
};

const Relays: Array<readonly [string, Handler]> = [
	["sky://exthost/debug-reload", SimpleRelay("cel:exthost:debug-reload")],
	["sky://exthost/debug-close", SimpleRelay("cel:exthost:debug-close")],
	["sky://debug/sessionStart", SimpleRelay("cel:debug:sessionStart")],
	["sky://debug/sessionEnd", SimpleRelay("cel:debug:sessionEnd")],
	["sky://debug/addBreakpoints", SimpleRelay("cel:debug:addBreakpoints")],
	[
		"sky://debug/removeBreakpoints",
		SimpleRelay("cel:debug:removeBreakpoints"),
	],
	["sky://debug/consoleAppend", SimpleRelay("cel:debug:consoleAppend")],
	["sky://debug/dap-message", SimpleRelay("cel:debug:dap-message")],
	["sky://customEditor/saved", SimpleRelay("cel:customEditor:saved")],
];

export default async (Dependencies: {
	Register: (Channel: string, Handler: Handler) => Promise<void>;
}): Promise<void> => {
	const { Register } = Dependencies;
	for (const [Channel, Handle] of Relays) {
		await Register(Channel, Handle);
	}
};
