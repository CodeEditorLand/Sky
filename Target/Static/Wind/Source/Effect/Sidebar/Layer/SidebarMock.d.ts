/**
 * @module Effect/Sidebar/Layer/SidebarMock
 * @description
 * Mock layer for Sidebar service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Sidebar/Layer/SidebarLive} Live layer
 * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
 * @category Layer
 */
import { Layer } from "effect";
import SidebarTag from "../Tag/SidebarTag.js";
import type { SidebarService } from "../Interface/SidebarService.js";
/**
 * Creates a mock Sidebar service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock Sidebar service instance
 */
declare const makeMockSidebar: () => SidebarService;
/**
 * Mock layer for Sidebar service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { SidebarMockLive } from "./Effect/Sidebar/Layer/SidebarMock.js";
 *
 * const testLayer = SidebarMockLive;
 * ```
 */
declare const SidebarMockLive: Layer.Layer<SidebarTag, never, never>;
export default SidebarMockLive;
export { makeMockSidebar };
//# sourceMappingURL=SidebarMock.d.ts.map