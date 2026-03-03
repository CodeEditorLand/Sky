/**
 * @module Effect/Environment/Implementation/EnvironmentImplementation
 * @description
 * Main implementation of the Environment service. Provides live and mock layers
 * for detecting platform, architecture, and environment settings.
 * @see {@link Effect/Environment/Interface/EnvironmentService} Service interface
 * @see {@link Effect/Environment/Tag/EnvironmentTag} Service tag
 * @category Implementation
 * @example
 * ```typescript
 * import { EnvironmentLive } from "./Effect/Environment/Implementation/EnvironmentImplementation.js";
 * import { Effect } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const env = yield* EnvironmentTag;
 *   const info = yield* env.getInfo;
 *   console.log("Platform:", info.platform);
 * });
 *
 * Effect.runPromise(program.pipe(Effect.provide(EnvironmentLive)));
 * ```
 */
import { Layer } from "effect";
import { EnvironmentTag } from "../Tag/EnvironmentTag.js";
import type { EnvironmentService } from "../Interface/EnvironmentService.js";
import type { Platform, Architecture } from "../Type/EnvironmentType.js";
/**
 * Live layer for Environment service
 */
export declare const EnvironmentLive: Layer.Layer<EnvironmentTag, never, never>;
/**
 * Create a mock environment service with custom overrides
 * @param overrides - Optional partial environment info to override defaults
 * @returns A mock environment service
 */
export declare const makeMockEnvironment: (overrides?: Partial<{
    readonly platform: Platform;
    readonly architecture: Architecture;
    readonly locale: string;
    readonly timezone: string;
    readonly userAgent: string;
    readonly isSecureContext: boolean;
    readonly language: string;
}>) => EnvironmentService;
/**
 * Mock layer for Environment service
 */
export declare const EnvironmentMock: Layer.Layer<EnvironmentTag, never, never>;
export default EnvironmentLive;
//# sourceMappingURL=EnvironmentImplementation.d.ts.map