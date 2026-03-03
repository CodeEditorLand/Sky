/**
 * @module Effect/Bootstrap
 * @description
 * Bootstrap orchestration using Effect-TS.
 * Replaces legacy BootstrapOrchestrator with Effect-based stage sequencing.
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from {@link ./Bootstrap/index.ts} instead.
 *
 * @example
 * ```ts
 * // Old (still works):
 * import { Bootstrap, BootstrapLive } from "./Effect/Bootstrap.js";
 *
 * // New (recommended):
 * import { Bootstrap, BootstrapLive } from "./Effect/Bootstrap/index.js";
 * ```
 */
export { type BootstrapOptions, type StageResult, type BootstrapResult, type BootstrapService, BootstrapTag, stage0_Environment, stage1_Preload, stage2_Configuration, stage3_Services, stage4_Preparation, stage5_Initialization, stage6_HealthCheck, BootstrapLive, BootstrapMock, makeMockBootstrap, runBootstrap, } from "./Bootstrap/index.js";
//# sourceMappingURL=Bootstrap.d.ts.map