/**
 * @module Effect/StatusBar
 * @description
 * Main re-export module for StatusBar service.
 * Provides all exports for backward compatibility with existing imports.
 *
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Service interface
 * @see {@link Effect/StatusBar/Layer/StatusBarLive} Live layer
 * @see {@link Effect/StatusBar/Layer/StatusBarMock} Mock layer
 * @category Re-export
 */
export type { StatusBarItem, CreateStatusBarItem } from "./Type/StatusBarType.js";
export type { StatusBarService } from "./Interface/StatusBarService.js";
export { default as StatusBarTag, StatusBar } from "./Tag/StatusBarTag.js";
export { default as StatusBarLive } from "./Layer/StatusBarLive.js";
export { default as StatusBarMockLive } from "./Layer/StatusBarMock.js";
export { makeMockStatusBar } from "./Layer/StatusBarMock.js";
export { default as StatusBarItemNotFoundError } from "./Error/StatusBarItemNotFoundError.js";
export { default as StatusBarUpdateError } from "./Error/StatusBarUpdateError.js";
//# sourceMappingURL=index.d.ts.map