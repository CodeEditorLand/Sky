/**
 * @module Effect/Telemetry/Helper/withMetric
 * @description
 * Helper function to record metrics from an effect execution.
 * Records the duration as a metric and logs failures.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Helper/withSpan} Span helper
 * @category Helper
 */
import { Effect } from "effect";
/**
 * Wraps an effect with automatic metric recording.
 * Records the execution duration as a metric and logs any failures.
 *
 * @param name - Base name for the metric (formatted as `{name}_duration`)
 * @param effect - The effect to wrap
 * @param labels - Optional labels to attach to the metric
 * @returns The wrapped effect with automatic metric recording
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { withMetric } from "./Effect/Telemetry/Helper/withMetric.js";
 *
 * const fetchData = withMetric(
 *   "fetchData",
 *   Effect.tryPromise(() => fetch('/api/data'))
 * );
 * ```
 */
export default function withMetric<A, E, R>(name: string, effect: Effect.Effect<A, E, R>, labels?: Record<string, string>): Effect.Effect<Effect.Effect<A, E, R>, never, import("../index.js").TelemetryTag>;
//# sourceMappingURL=withMetric.d.ts.map