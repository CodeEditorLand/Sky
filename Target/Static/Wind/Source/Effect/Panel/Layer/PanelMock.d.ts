/**
 * @module Effect/Panel/Layer/PanelMock
 * @description
 * Mock layer for Panel service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Panel/Layer/PanelLive} Live layer
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @category Layer
 */
import { Layer } from "effect";
import PanelTag from "../Tag/PanelTag.js";
import type { PanelService } from "../Interface/PanelService.js";
/**
 * Creates a mock Panel service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock Panel service instance
 */
declare const makeMockPanel: () => PanelService;
/**
 * Mock layer for Panel service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { PanelMockLive } from "./Effect/Panel/Layer/PanelMock.js";
 *
 * const testLayer = PanelMockLive;
 * ```
 */
declare const PanelMockLive: Layer.Layer<PanelTag, never, never>;
export default PanelMockLive;
export { makeMockPanel };
//# sourceMappingURL=PanelMock.d.ts.map