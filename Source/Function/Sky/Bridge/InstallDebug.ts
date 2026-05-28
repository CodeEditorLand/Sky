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

	// sky://debug/addBreakpoints and removeBreakpoints are NOT in the Relays
	// array: they have dedicated handlers below that wire IDebugService too.
	// Keeping them here caused double-registration: the DOM relay fired AND
	// the real handler fired, double-dispatching cel:debug:addBreakpoints
	// on every Mountain emit.

	["sky://debug/consoleAppend", SimpleRelay("cel:debug:consoleAppend")],

	["sky://debug/dap-message", SimpleRelay("cel:debug:dap-message")],

	["sky://customEditor/saved", SimpleRelay("cel:customEditor:saved")],
];

export default async (Dependencies: {
	Register: (Channel: string, Handler: Handler) => Promise<void>;

	GetServices?: () => Record<string, unknown> | null;
}): Promise<void> => {
	const { Register, GetServices } = Dependencies;

	for (const [Channel, Handle] of Relays) {
		await Register(Channel, Handle);
	}

	// Wire breakpoint changes to the workbench's IDebugService so breakpoint
	// glyphs appear in the Monaco gutter when extensions call
	// `vscode.debug.addBreakpoints()` / `removeBreakpoints()`.
	if (GetServices) {
		await Register("sky://debug/addBreakpoints", (Payload: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:debug:addBreakpoints", {
					detail: Payload,
				}),
			);

			try {
				const Services = GetServices();

				const DebugService = (Services as any)?.Debug;

				if (!DebugService?.addBreakpoints) return;

				const Breakpoints = Array.isArray(Payload)
					? Payload
					: (Payload?.breakpoints ?? []);

				if (Breakpoints.length === 0) return;

				// Convert to workbench IBreakpoint shape
				const Bps = Breakpoints.map((B: any) => {
					const Uri = (Services as any)?.URI?.parse?.(
						B?.location?.uri ?? B?.uri ?? "",
					);

					return {
						uri: Uri,
						lineNumber:
							B?.location?.range?.start?.line != null
								? B.location.range.start.line + 1
								: (B?.lineNumber ?? 1),
						column:
							B?.location?.range?.start?.character != null
								? B.location.range.start.character + 1
								: undefined,
						enabled: B?.enabled !== false,
						condition: B?.condition,
						hitCondition: B?.hitCondition,
						logMessage: B?.logMessage,
					};
				}).filter((B: any) => B.uri);

				if (Bps.length > 0) {
					void DebugService.addBreakpoints(Bps).catch(() => {});
				}
			} catch {
				/* non-fatal */
			}
		});

		await Register("sky://debug/removeBreakpoints", (Payload: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:debug:removeBreakpoints", {
					detail: Payload,
				}),
			);

			try {
				const Services = GetServices();

				const DebugService = (Services as any)?.Debug;

				if (!DebugService?.removeBreakpoints) return;

				const Breakpoints = Array.isArray(Payload)
					? Payload
					: (Payload?.breakpoints ?? []);

				if (Breakpoints.length === 0) return;

				// Remove by URI+line matching
				const Existing: any[] =
					DebugService.getModel?.()?.getBreakpoints?.() ?? [];

				const ToRemove = Existing.filter((Bp: any) => {
					return Breakpoints.some((B: any) => {
						const UriStr = B?.location?.uri ?? B?.uri ?? "";

						return Bp.uri?.toString?.() === UriStr;
					});
				});

				if (ToRemove.length > 0) {
					void DebugService.removeBreakpoints(ToRemove).catch(
						() => {},
					);
				}
			} catch {
				/* non-fatal */
			}
		});
	}
};
