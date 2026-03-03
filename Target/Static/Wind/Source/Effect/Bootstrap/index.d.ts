/**
 * @module Effect/Bootstrap
 * @description
 * Main re-export module for Bootstrap service.
 * Provides atomic exports for bootstrap orchestration.
 *
 * @example
 * ```ts
 * import { Bootstrap, BootstrapLive, BootstrapTag } from "./Effect/Bootstrap/index.js";
 *
 * // Using the service
 * const program = Effect.gen(function* () {
 *   const bootstrap = yield* BootstrapTag;
 *   const result = yield* bootstrap.run({ debugMode: true });
 *   return result;
 * });
 *
 * // Providing the layer
 * const runnable = program.pipe(Effect.provide(BootstrapLive));
 * ```
 *
 * @see {@link Effect/Bootstrap/Interface/BootstrapService} Service interface
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Live implementation
 * @see [Effect-TS Documentation](https://effect.website/docs/guide/context)
 * @category Service
 */
export type { BootstrapOptions, StageResult, BootstrapResult } from "./Type/BootstrapType.js";
export type { BootstrapService } from "./Interface/BootstrapService.js";
export { BootstrapTag } from "./Tag/BootstrapTag.js";
export { stage0_Environment, stage1_Preload, stage2_Configuration, stage3_Services, stage4_Preparation, stage5_Initialization, stage6_HealthCheck, } from "./Implementation/BootstrapStage.js";
export { BootstrapLive } from "./Implementation/BootstrapImplementation.js";
export { BootstrapMock, makeMockBootstrap } from "./Layer/BootstrapMock.js";
import { Effect } from "effect";
export declare const runBootstrap: (options?: import("./Type/BootstrapType.js").BootstrapOptions) => Effect.Effect<import("./index.js").BootstrapResult, never, never>;
//# sourceMappingURL=index.d.ts.map