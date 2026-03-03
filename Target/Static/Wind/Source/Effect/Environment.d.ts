/**
 * @module Effect/Environment
 * @description
 * Environment service for platform detection and environment setup.
 * Replaces VSCode's platform detection from Stage0.
 *
 * @see {@link Effect/Environment/Interface/EnvironmentService} Service interface
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Live implementation
 * @see {@link Effect/Environment/Tag/EnvironmentTag} Service tag
 * @category Service
 * @example
 * ```typescript
 * import Environment from "./Effect/Environment.js";
 * import { Effect } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const env = yield* Environment.EnvironmentTag;
 *   const info = yield* env.getInfo;
 *   console.log("Platform:", info.platform);
 * });
 *
 * Effect.runPromise(program.pipe(Effect.provide(Environment)));
 * ```
 */
import EnvironmentLive, { EnvironmentTag as EnvTag } from "./Environment/index.js";
export { default, EnvironmentMock, makeMockEnvironment, EnvironmentTag } from "./Environment/index.js";
export { EnvironmentLive };
export type { Platform, Architecture, EnvironmentInfo, EnvironmentService, } from "./Environment/index.js";
export { DetectPlatform, DetectArchitecture, DetectLocale, DetectTimezone, GetUserAgent, } from "./Environment/index.js";
export declare const Environment: typeof EnvTag;
export type { EnvironmentInfo as Type } from "./Environment/index.js";
//# sourceMappingURL=Environment.d.ts.map