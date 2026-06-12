/**
 * Best-effort tracker for which `cel:*` CustomEvents have at least
 * one consumer registered. Patches `Document.prototype.addEventListener`
 * to record any `cel:`-prefixed type on subscribe; the
 * `_CelDispatchLog` log line then reports `consumer-present=true|false`
 * so post-mortem analysis can tell "Mountain emits but no React
 * component subscribed" apart from "Mountain emits but the listener
 * itself errored".
 *
 * Tracking is intentionally fail-soft. WebKit/Safari sometimes treats
 * `Document.prototype.addEventListener` as non-writable; reassigning
 * it throws under strict mode (ES modules are strict by default) and
 * would crash the bundle at load. The `try/catch` degrades to
 * `consumer-present=?` reporting instead of taking down boot. SSR
 * is also bypassed via the `typeof document` guard because Astro
 * imports SkyBridge during pre-render.
 */
type Invoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

export default (
	Invoke: Invoke,
): {
	HasConsumer: (DomEvent: string) => boolean;

	Log: (DomEvent: string, HasConsumer: boolean) => void;
} => {
	const Consumers = new Set<string>();

	const HasDOM =
		typeof globalThis !== "undefined" &&
		typeof (globalThis as any).document !== "undefined";

	let TrackingActive = false;

	if (HasDOM && !(globalThis as any).__Track) {
		try {
			const TargetDocument = (globalThis as any).document as Document;

			const OriginalAdd =
				TargetDocument.addEventListener.bind(TargetDocument);

			Object.defineProperty(TargetDocument, "addEventListener", {
				configurable: true,
				writable: true,
				value: function PatchedAdd(
					Type: string,

					Listener: EventListenerOrEventListenerObject | null,

					Options?: boolean | AddEventListenerOptions,
				) {
					if (typeof Type === "string" && Type.startsWith("cel:")) {
						Consumers.add(Type);
					}

					return OriginalAdd(
						Type,

						Listener as EventListener,

						Options,
					);
				},
			});

			(globalThis as any).__Track = true;

			TrackingActive = true;
		} catch {
			TrackingActive = false;
		}
	}

	return {
		HasConsumer: (DomEvent) => Consumers.has(DomEvent),

		Log: (DomEvent, Has) => {
			if (!HasDOM) return;

			if (!(globalThis as any).__LAND_TRACE_CEL_DISPATCH__) return;

			const Flag = TrackingActive ? String(Has) : "?";

			try {
				Invoke("RenderDevLog", {
					Tag: "cel-dispatch",
					Message: `[CelDispatch] event=${DomEvent} consumer-present=${Flag}`,
					tag: "cel-dispatch",
					message: `[CelDispatch] event=${DomEvent} consumer-present=${Flag}`,
				}).catch(() => {});
			} catch {
				/* swallow */
			}
		},
	};
};
