/**
 * @module Effect/StatusBar/Layer/StatusBarLive
 * @description
 * Live layer for StatusBar service.
 * Provides the production implementation using SubscriptionRef for reactive state management.
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Service interface
 * @see {@link Effect/StatusBar/Layer/StatusBarMock} Mock layer
 * @category Layer
 */
import { Layer } from "effect";
import StatusBarTag from "../Tag/StatusBarTag.js";
/**
 * Live layer for StatusBar service.
 * Provides reactive status bar item management with SubscriptionRef-based state.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { StatusBarLive } from "./Effect/StatusBar/Layer/StatusBarLive.js";
 * import { TelemetryLive } from "./Effect/Telemetry/index.js";
 *
 * const appLayer = Layer.mergeAll(TelemetryLive, StatusBarLive);
 * ```
 */
declare const StatusBarLive: Layer.Layer<StatusBarTag, never, import("../../Telemetry.js").TelemetryTag>;
export default StatusBarLive;
//# sourceMappingURL=StatusBarLive.d.ts.map