/**
 * @module TraceparentBridge
 * @description
 * W3C traceparent extraction + child-span linking for Tauri events that
 * arrive from Mountain. Mirrors `Common::Telemetry::Traceparent` (Rust)
 * field-for-field so the same header round-trips between tiers.
 *
 * Mountain calls `EmitWithTraceparent::Fn(name, payload)` which stamps
 * `_traceparent: "<version>-<trace>-<span>-<flags>"` onto the JSON
 * payload. This bridge's `ConsumeFromPayload` is invoked by every Sky
 * event handler that receives one of those payloads; it parses the
 * header, registers the resulting `TraceContext` so the OTLP bridge
 * uses the same `traceId` for spans emitted while the handler runs,
 * and returns the original payload minus the `_traceparent` key.
 *
 * Tree-shaking: every export is gated on `import.meta.env.DEV` at the
 * call site so production builds drop the entire bridge from the
 * bundle (the imports never resolve).
 */

export type TraceContext = {

	readonly TraceId: string;

	readonly ParentSpanId: string;

	readonly Sampled: boolean;
};

let CurrentContext: TraceContext | undefined;

const VERSION = "00";

export const Parse = (Header: string): TraceContext | undefined => {

	const Parts = Header.split("-");

	if (Parts.length !== 4) return undefined;

	if (Parts[0] !== VERSION) return undefined;

	if (!/^[0-9a-f]{32}$/.test(Parts[1]!)) return undefined;

	if (!/^[0-9a-f]{16}$/.test(Parts[2]!)) return undefined;

	const Sampled = Parts[3] === "01";

	return {
		TraceId: Parts[1]!,

		ParentSpanId: Parts[2]!,

		Sampled,
	};
};

/**
 * Called by every Sky event handler that receives a Tauri event from
 * Mountain. Strips `_traceparent` off the payload, registers the
 * decoded context, and returns the cleaned payload to the caller. If
 * `_traceparent` isn't present (Mountain hasn't been migrated to use
 * `EmitWithTraceparent` for this event yet), the payload is returned
 * unchanged and the trace context falls back to whatever Sky's local
 * OTLPBridge would have used.
 */
export const ConsumeFromPayload = <Payload extends Record<string, unknown>>(
	Payload: Payload | undefined,
): Payload => {

	if (!import.meta.env.DEV) return Payload as Payload;

	if (!Payload || typeof Payload !== "object") return Payload as Payload;

	const Header = (Payload as Record<string, unknown>)["_traceparent"];

	if (typeof Header === "string" && Header.length > 0) {
		const Decoded = Parse(Header);

		if (Decoded) {
			CurrentContext = Decoded;
		}
	}

	const Cleaned = { ...Payload } as Record<string, unknown>;

	delete Cleaned["_traceparent"];

	return Cleaned as Payload;
};

/**
 * Read the trace context registered by the most-recent
 * `ConsumeFromPayload`. Used by `OTELBridge.ts` so spans emitted
 * inside a handler share the parent trace ID.
 */
export const Current = (): TraceContext | undefined => {

	if (!import.meta.env.DEV) return undefined;

	return CurrentContext;
};

/**
 * Manually clear the registered context. Sky's IPC dispatcher can
 * call this in a `finally` after a handler completes, so a later
 * untraced event doesn't accidentally inherit the previous handler's
 * trace ID.
 */
export const Clear = (): void => {

	if (!import.meta.env.DEV) return;

	CurrentContext = undefined;
};

/**
 * Build a fresh outgoing traceparent header for Sky → Mountain
 * TauriInvoke calls. Reuses `CurrentContext.TraceId` if present so the
 * round-trip stays under one trace; falls back to a new random trace
 * when no parent has registered yet (workbench-initiated action).
 */
const RandomHex = (Bytes: number): string => {

	const Buffer = new Uint8Array(Bytes);

	crypto.getRandomValues(Buffer);

	return Array.from(Buffer, (B) => B.toString(16).padStart(2, "0")).join("");
};

export const Build = (): string => {

	if (!import.meta.env.DEV) return "";

	const TraceId = CurrentContext?.TraceId ?? RandomHex(16);

	const SpanId = RandomHex(8);

	return `${VERSION}-${TraceId}-${SpanId}-01`;
};

export default { Parse, ConsumeFromPayload, Current, Clear, Build };
