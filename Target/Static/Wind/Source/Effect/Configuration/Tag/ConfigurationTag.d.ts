/**
 * @module Effect/Configuration/Tag/ConfigurationTag
 * @description
 * Context Tag for Configuration service dependency injection.
 * Enables service composition and layering in Effect programs.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface
 * @see [Effect-TS Context](https://effect.website/docs/guide/context)
 * @category Tag
 */
import { Context } from "effect";
import type { ConfigurationService } from "../Interface/ConfigurationService.js";
declare const ConfigurationTag_base: Context.TagClass<ConfigurationTag, "Configuration", ConfigurationService>;
/**
 * Context Tag for Configuration service.
 * Use this to inject the Configuration service into Effect programs.
 *
 * @example
 * ```ts
 * import { ConfigurationTag } from "./Tag/ConfigurationTag.js";
 *
 * const effect = Effect.gen(function* () {
 *   const configuration = yield* ConfigurationTag;
 *   const config = yield* configuration.get;
 *   return config;
 * });
 * ```
 */
export declare class ConfigurationTag extends ConfigurationTag_base {
}
export default ConfigurationTag;
//# sourceMappingURL=ConfigurationTag.d.ts.map