/**
 * @module Effect/Sidebar/Layer/SidebarLive
 * @description
 * Live layer for Sidebar service.
 * Provides the production implementation using SubscriptionRef for reactive state management.
 * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
 * @see {@link Effect/Sidebar/Layer/SidebarMock} Mock layer
 * @category Layer
 */
import { Layer } from "effect";
import SidebarTag from "../Tag/SidebarTag.js";
/**
 * Live layer for Sidebar service.
 * Provides reactive sidebar panel management with SubscriptionRef-based state.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { SidebarLive } from "./Effect/Sidebar/Layer/SidebarLive.js";
 * import { TelemetryLive } from "./Effect/Telemetry/index.js";
 *
 * const appLayer = Layer.mergeAll(TelemetryLive, SidebarLive);
 * ```
 */
declare const SidebarLive: Layer.Layer<SidebarTag, never, import("../../Telemetry.js").TelemetryTag>;
export default SidebarLive;
//# sourceMappingURL=SidebarLive.d.ts.map