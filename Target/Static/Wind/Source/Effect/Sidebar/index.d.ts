/**
 * @module Effect/Sidebar
 * @description
 * Main re-export module for Sidebar service.
 * Provides all exports for backward compatibility with existing imports.
 *
 * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
 * @see {@link Effect/Sidebar/Layer/SidebarLive} Live layer
 * @see {@link Effect/Sidebar/Layer/SidebarMock} Mock layer
 * @category Re-export
 */
export type { SidebarPanel, CreateSidebarPanel } from "./Type/SidebarType.js";
export type { SidebarService } from "./Interface/SidebarService.js";
export { default as SidebarTag, Sidebar } from "./Tag/SidebarTag.js";
export { default as SidebarLive } from "./Layer/SidebarLive.js";
export { default as SidebarMockLive } from "./Layer/SidebarMock.js";
export { makeMockSidebar } from "./Layer/SidebarMock.js";
export { default as SidebarPanelNotFoundError } from "./Error/SidebarPanelNotFoundError.js";
export { default as SidebarUpdateError } from "./Error/SidebarUpdateError.js";
//# sourceMappingURL=index.d.ts.map