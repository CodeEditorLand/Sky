/**
 * @module Effect/Sandbox
 * @description
 * Main re-export module for Sandbox service.
 * Provides all exports for backward compatibility with existing imports.
 *
 * @see {@link Effect/Sandbox/Interface/SandboxService} Service interface
 * @see {@link Effect/Sandbox/Layer/SandboxLive} Live layer
 * @see {@link Effect/Sandbox/Layer/SandboxMock} Mock layer
 * @category Re-export
 */
export type { SandboxService } from "./Interface/SandboxService.js";
export { Sandbox, default as SandboxTag } from "./Tag/SandboxTag.js";
export { default as SandboxLive } from "./Layer/SandboxLive.js";
export { default as SandboxMockLive } from "./Layer/SandboxMock.js";
//# sourceMappingURL=index.d.ts.map