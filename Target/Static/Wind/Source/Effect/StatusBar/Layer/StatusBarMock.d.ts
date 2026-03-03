/**
 * @module Effect/StatusBar/Layer/StatusBarMock
 * @description
 * Mock layer for StatusBar service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/StatusBar/Layer/StatusBarLive} Live layer
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Service interface
 * @category Layer
 */
import { Layer } from "effect";
import StatusBarTag from "../Tag/StatusBarTag.js";
import type { StatusBarService } from "../Interface/StatusBarService.js";
/**
 * Creates a mock StatusBar service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock StatusBar service instance
 */
declare const makeMockStatusBar: () => StatusBarService;
/**
 * Mock layer for StatusBar service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { StatusBarMockLive } from "./Effect/StatusBar/Layer/StatusBarMock.js";
 *
 * const testLayer = StatusBarMockLive;
 * ```
 */
declare const StatusBarMockLive: Layer.Layer<StatusBarTag, never, never>;
export default StatusBarMockLive;
export { makeMockStatusBar };
//# sourceMappingURL=StatusBarMock.d.ts.map