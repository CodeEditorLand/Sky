/**
 * @module Effect/Sandbox/Tag/SandboxTag
 * @description
 * Service tag for Sandbox dependency injection.
 * Provides the Context.Tag for accessing Sandbox service in Effect programs.
 * @see {@link Effect/Sandbox/Interface/SandboxService} Service interface
 * @see {@link Effect/Sandbox/Layer/SandboxLive} Live implementation
 * @category Tag
 */
import { Context } from "effect";
import type { SandboxService } from "../Interface/SandboxService.js";
/**
 * Context.Tag for Sandbox service dependency injection.
 * Use this tag to access Sandbox in Effect programs.
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { Sandbox } from "./Effect/Sandbox/Tag/SandboxTag.js";
 *
 * const getGlobals = Effect.gen(function* () {
 *   const sandbox = yield* Sandbox;
 *   return yield* sandbox.globals;
 * });
 * ```
 */
export declare const Sandbox: Context.Tag<SandboxService, SandboxService>;
/**
 * Alias for Sandbox with clearer naming.
 */
export default Sandbox;
//# sourceMappingURL=SandboxTag.d.ts.map