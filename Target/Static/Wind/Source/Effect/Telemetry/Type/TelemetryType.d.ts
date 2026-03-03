/**
 * @module Effect/Telemetry/Type/TelemetryType
 * @description
 * Type definitions for Telemetry service.
 * Defines telemetry metric types, span types, and event types.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Layer/TelemetryLive} Live implementation
 * @category Type
 */
import type { Effect } from "effect";
/**
 * Represents a single metric measurement.
 * Contains the metric name, value, timestamp, and optional labels.
 */
export interface TelemetryMetric {
    /** Name/identifier of the metric */
    readonly name: string;
    /** Numeric value of the metric */
    readonly value: number;
    /** Timestamp when the metric was recorded */
    readonly timestamp: number;
    /** Optional labels for categorizing the metric */
    readonly labels: Readonly<Record<string, string>> | undefined;
}
/**
 * Represents a timed operation span.
 * Tracks start/end time, success/failure, and duration.
 */
export interface TelemetrySpan {
    /** Name of the operation */
    readonly name: string;
    /** Start timestamp in milliseconds */
    readonly startTime: number;
    /** End timestamp in milliseconds */
    readonly endTime?: number;
    /** Duration in milliseconds */
    readonly duration?: number;
    /** Whether the operation succeeded */
    readonly success: boolean;
    /** Error message if the operation failed */
    readonly error?: string;
    /** Optional labels for categorizing the span */
    readonly labels?: Readonly<Record<string, string>>;
}
/**
 * Represents a logging event.
 * Contains log level, message, and optional context.
 */
export interface TelemetryLog {
    /** Log level: debug, info, warn, or error */
    readonly level: "debug" | "info" | "warn" | "error";
    /** Log message */
    readonly message: string;
    /** Additional context data */
    readonly context?: Record<string, unknown>;
}
/**
 * Represents any telemetry event.
 * Can be a metric, span, or log event.
 */
export interface TelemetryEvent {
    /** Type of event */
    readonly type: "metric" | "span" | "log";
    /** Timestamp when the event occurred */
    readonly timestamp: number;
    /** Event data (metric, span, or log) */
    readonly data: TelemetryMetric | TelemetrySpan | TelemetryLog;
}
/**
 * Handle for an active span.
 * Provides a method to end the span with success/failure status.
 */
export interface SpanHandle {
    /**
     * End the span and record the result.
     * @param success - Whether the operation succeeded
     * @param error - Optional error message if the operation failed
     */
    readonly end: (success: boolean, error?: string) => Effect.Effect<void, never>;
}
//# sourceMappingURL=TelemetryType.d.ts.map