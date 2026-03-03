/**
 * @module Effect/Telemetry
 * @description
 * Main re-export module for Telemetry service.
 * Provides all exports for backward compatibility with existing imports.
 *
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Layer/TelemetryLive} Live layer
 * @see {@link Effect/Telemetry/Layer/TelemetryMock} Mock layer
 * @category Re-export
 */
export type { TelemetryMetric, TelemetrySpan, TelemetryLog, TelemetryEvent, SpanHandle } from "./Type/TelemetryType.js";
export type { TelemetryService } from "./Interface/TelemetryService.js";
export { default as TelemetryTag, Telemetry } from "./Tag/TelemetryTag.js";
export { default as TelemetryLive } from "./Layer/TelemetryLive.js";
export { default as TelemetryMockLive } from "./Layer/TelemetryMock.js";
export { makeMockTelemetry } from "./Layer/TelemetryMock.js";
export { default as withSpan } from "./Helper/withSpan.js";
export { default as withMetric } from "./Helper/withMetric.js";
export { default as TelemetryCollectionError } from "./Error/TelemetryCollectionError.js";
//# sourceMappingURL=index.d.ts.map