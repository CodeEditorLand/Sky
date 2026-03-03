/**
 * @module Effect/Configuration
 * @description
 * Main re-export module for Configuration service.
 * Provides atomic exports for configuration management.
 *
 * @example
 * ```ts
 * import { Configuration, ConfigurationLive, ConfigurationTag } from "./Effect/Configuration/index.js";
 *
 * // Using the service
 * const program = Effect.gen(function* () {
 *   const configuration = yield* ConfigurationTag;
 *   const config = yield* configuration.get;
 *   return config;
 * });
 *
 * // Providing the layer
 * const runnable = program.pipe(Effect.provide(ConfigurationLive));
 * ```
 *
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Live implementation
 * @see [Effect-TS Documentation](https://effect.website/docs/guide/context)
 * @category Service
 */
export { default as ConfigFetchError } from "./Error/ConfigFetchError.js";
export { default as ConfigValidationError } from "./Error/ConfigValidationError.js";
export { default as ConfigApplyError } from "./Error/ConfigApplyError.js";
export type { ConfigSchemaIssue } from "./Type/ConfigurationSchemaType.js";
export type { ConfigurationService } from "./Interface/ConfigurationService.js";
export { ConfigurationTag } from "./Tag/ConfigurationTag.js";
export { ValidateConfiguration, MakeValidate, MakeApply, GetConfigValue } from "./Implementation/ConfigurationHelper.js";
export { ConfigurationLive, ConfigurationWithSyncLive } from "./Implementation/ConfigurationImplementation.js";
export { ConfigurationMock, makeMockConfiguration } from "./Layer/ConfigurationMock.js";
import { ConfigurationTag } from "./Tag/ConfigurationTag.js";
export { ConfigurationTag as Configuration };
//# sourceMappingURL=index.d.ts.map