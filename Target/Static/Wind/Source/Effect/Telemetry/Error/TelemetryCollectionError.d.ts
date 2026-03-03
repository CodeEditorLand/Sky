/**
 * @module Effect/Telemetry/Error/TelemetryCollectionError
 * @description
 * Error thrown when telemetry collection fails.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Usage context
 * @category Error
 */
/**
 * Error thrown when telemetry data collection fails for a specific operation.
 * Includes the operation name and the underlying cause of the failure.
 */
export default class TelemetryCollectionError extends Error {
    readonly _tag = "TelemetryCollectionError";
    readonly operation: string;
    readonly cause: unknown;
    constructor(operation: string, cause: unknown);
    get name(): string;
}
//# sourceMappingURL=TelemetryCollectionError.d.ts.map