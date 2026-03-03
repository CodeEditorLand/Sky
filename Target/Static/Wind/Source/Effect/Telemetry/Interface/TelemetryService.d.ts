/**
 * @module Effect/Telemetry/Interface/TelemetryService
 * @description
 * Service interface for Telemetry management.
 * Provides methods for metrics, spans, and logging with stream-based reactivity.
 * @see {@link Effect/Telemetry/Type/TelemetryType} Type definitions
 * @see {@link Effect/Telemetry/Tag/TelemetryTag} Service tag
 * @see {@link Effect/Telemetry/Layer/TelemetryLive} Live implementation
 * @category Interface
 */
import type { Effect } from "effect";
import type { Stream } from "effect";
import type { TelemetryMetric, TelemetryLog, TelemetryEvent, SpanHandle } from "../Type/TelemetryType.js";
/**
 * Telemetry service interface for unified monitoring and logging.
 * Provides metrics recording, span tracking, and comprehensive logging capabilities.
 */
export interface TelemetryService {
    /** Record a metric value with optional labels */
    readonly recordMetric: (name: string, value: number, labels?: Record<string, string>) => Effect.Effect<void, never>;
    /** Start a timed span and return a handle for ending it */
    readonly startSpan: (name: string, labels?: Record<string, string>) => Effect.Effect<SpanHandle, never>;
    /** Log an event at the specified level */
    readonly log: (level: TelemetryLog["level"], message: string, context?: Record<string, unknown>) => Effect.Effect<void, never>;
    /** Stream of all telemetry events for reactive updates */
    readonly events: Stream.Stream<ReadonlyArray<TelemetryEvent>, never>;
    /** Get all metrics recorded for a specific name */
    readonly getMetrics: (name: string) => Effect.Effect<ReadonlyArray<TelemetryMetric>, never>;
    /** Get average duration for spans with the given name */
    readonly getAverageDuration: (name: string) => Effect.Effect<number, never>;
    /** Get success rate for spans with the given name */
    readonly getSuccessRate: (name: string) => Effect.Effect<number, never>;
    /** Flush/clear all telemetry data */
    readonly flush: Effect.Effect<void, never>;
}
//# sourceMappingURL=TelemetryService.d.ts.map