/**
 * @module Effect/Telemetry/Layer/TelemetryMock
 * @description
 * Mock layer for Telemetry service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Telemetry/Layer/TelemetryLive} Live layer
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @category Layer
 */
import { Layer } from "effect";
import TelemetryTag from "../Tag/TelemetryTag.js";
import type { TelemetryService } from "../Interface/TelemetryService.js";
/**
 * Creates a mock Telemetry service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock Telemetry service instance
 */
declare const makeMockTelemetry: () => TelemetryService;
/**
 * Mock layer for Telemetry service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { TelemetryMockLive } from "./Effect/Telemetry/Layer/TelemetryMock.js";
 *
 * const testLayer = TelemetryMockLive;
 * ```
 */
declare const TelemetryMockLive: Layer.Layer<TelemetryTag, never, never>;
export default TelemetryMockLive;
export { makeMockTelemetry };
//# sourceMappingURL=TelemetryMock.d.ts.map