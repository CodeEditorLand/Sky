/**
 * @module Effect/Telemetry/Layer/TelemetryLive
 * @description
 * Live layer for Telemetry service.
 * Provides the production implementation using SubscriptionRef for reactive state.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Layer/TelemetryMock} Mock layer
 * @category Layer
 */
import { Layer } from "effect";
import TelemetryTag from "../Tag/TelemetryTag.js";
/**
 * Live layer for Telemetry service.
 * Provides reactive telemetry management with SubscriptionRef-based state.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { TelemetryLive } from "./Effect/Telemetry/Layer/TelemetryLive.js";
 *
 * const appLayer = TelemetryLive;
 * ```
 */
declare const TelemetryLive: Layer.Layer<TelemetryTag, never, never>;
export default TelemetryLive;
//# sourceMappingURL=TelemetryLive.d.ts.map