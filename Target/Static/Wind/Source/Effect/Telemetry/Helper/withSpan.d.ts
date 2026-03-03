/**
 * @module Effect/Telemetry/Helper/withSpan
 * @description
 * Helper function to wrap an effect with automatic span tracking.
 * Creates a span before the effect and ends it after completion, recording success/failure.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Helper/withMetric} Metric helper
 * @category Helper
 */
import { Effect } from "effect";
/**
 * Wraps an effect with automatic span tracking.
 * Creates a span before the effect, tracks its duration, and records success/failure.
 *
 * @param name - Name of the operation being tracked
 * @param effect - The effect to wrap
 * @param labels - Optional labels to attach to the span
 * @returns The wrapped effect with automatic span tracking
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { withSpan } from "./Effect/Telemetry/Helper/withSpan.js";
 *
 * const fetchData = withSpan(
 *   "fetchData",
 *   Effect.tryPromise(() => fetch('/api/data'))
 * );
 * ```
 */
export default function withSpan<A, E, R>(name: string, effect: Effect.Effect<A, E, R>, labels?: Record<string, string>): Effect.Effect<Effect.Effect<A, E, R>, never, import("../index.js").TelemetryTag>;
//# sourceMappingURL=withSpan.d.ts.map