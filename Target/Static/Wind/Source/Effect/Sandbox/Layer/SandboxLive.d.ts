/**
 * @module Effect/Sandbox/Layer/SandboxLive
 * @description
 * Live layer for Sandbox service.
 * Provides access to VSCode preload globals from window.vscode.
 * @see {@link Effect/Sandbox/Interface/SandboxService} Service interface
 * @see {@link Effect/Sandbox/Layer/SandboxMock} Mock layer
 * @category Layer
 */
import { Layer } from "effect";
import type { SandboxService } from "../Interface/SandboxService.js";
/**
 * Live layer for Sandbox service.
 * Provides access to window.vscode preload globals with polling-based ready check.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { SandboxLive } from "./Effect/Sandbox/Layer/SandboxLive.js";
 *
 * const appLayer = SandboxLive;
 * ```
 */
declare const SandboxLive: Layer.Layer<SandboxService, never, never>;
export default SandboxLive;
//# sourceMappingURL=SandboxLive.d.ts.map