/**
 * @module Effect/Panel
 * @description
 * Main re-export module for Panel service.
 * Provides all exports for backward compatibility with existing imports.
 *
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @see {@link Effect/Panel/Layer/PanelLive} Live layer
 * @see {@link Effect/Panel/Layer/PanelMock} Mock layer
 * @category Re-export
 */
export type { PanelView, CreatePanelView, PanelViewType } from "./Type/PanelType.js";
export type { PanelService } from "./Interface/PanelService.js";
export { default as PanelTag, Panel } from "./Tag/PanelTag.js";
export { default as PanelLive } from "./Layer/PanelLive.js";
export { default as PanelMockLive } from "./Layer/PanelMock.js";
export { makeMockPanel } from "./Layer/PanelMock.js";
export { default as PanelViewNotFoundError } from "./Error/PanelViewNotFoundError.js";
export { default as PanelUpdateError } from "./Error/PanelUpdateError.js";
//# sourceMappingURL=index.d.ts.map