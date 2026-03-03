/**
 * @module Effect/Sandbox/Layer/SandboxMock
 * @description
 * Mock layer for Sandbox service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/Sandbox/Layer/SandboxLive} Live layer
 * @see {@link Effect/Sandbox/Interface/SandboxService} Service interface
 * @category Layer
 */
import { Layer } from "effect";
import type { SandboxService } from "../Interface/SandboxService.js";
/**
 * Mock layer for Sandbox service.
 * Provides a failing implementation for testing non-vscode environments.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { SandboxMockLive } from "./Effect/Sandbox/Layer/SandboxMock.js";
 *
 * const testLayer = SandboxMockLive;
 * ```
 */
declare const SandboxMockLive: Layer.Layer<SandboxService, never, never>;
export default SandboxMockLive;
//# sourceMappingURL=SandboxMock.d.ts.map