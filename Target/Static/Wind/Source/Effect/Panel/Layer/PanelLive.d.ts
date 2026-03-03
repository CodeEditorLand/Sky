/**
 * @module Effect/Panel/Layer/PanelLive
 * @description
 * Live layer for Panel service.
 * Provides the production implementation using SubscriptionRef for reactive state management.
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @see {@link Effect/Panel/Layer/PanelMock} Mock layer
 * @category Layer
 */
import { Layer } from "effect";
import PanelTag from "../Tag/PanelTag.js";
/**
 * Live layer for Panel service.
 * Provides reactive panel management with SubscriptionRef-based state.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { PanelLive } from "./Effect/Panel/Layer/PanelLive.js";
 * import { TelemetryLive } from "./Effect/Telemetry/index.js";
 *
 * const appLayer = Layer.mergeAll(TelemetryLive, PanelLive);
 * ```
 */
declare const PanelLive: Layer.Layer<PanelTag, never, import("../../Telemetry.js").TelemetryTag>;
export default PanelLive;
//# sourceMappingURL=PanelLive.d.ts.map