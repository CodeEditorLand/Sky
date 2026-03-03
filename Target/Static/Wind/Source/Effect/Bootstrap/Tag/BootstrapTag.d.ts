/**
 * @module Effect/Bootstrap/Tag/BootstrapTag
 * @description
 * Context Tag for Bootstrap service dependency injection.
 * Enables service composition and layering in Effect programs.
 * @see {@link Effect/Bootstrap/Interface/BootstrapService} Service interface
 * @see [Effect-TS Context](https://effect.website/docs/guide/context)
 * @category Tag
 */
import { Context } from "effect";
import type { BootstrapService } from "../Interface/BootstrapService.js";
declare const BootstrapTag_base: Context.TagClass<BootstrapTag, "Effect/BootstrapService", BootstrapService>;
/**
 * Context Tag for Bootstrap service.
 * Use this to inject the Bootstrap service into Effect programs.
 *
 * @example
 * ```ts
 * import { BootstrapTag } from "./Tag/BootstrapTag.js";
 *
 * const effect = Effect.gen(function* () {
 *   const bootstrap = yield* BootstrapTag;
 *   const result = yield* bootstrap.run({ debugMode: true });
 * });
 * ```
 */
export declare class BootstrapTag extends BootstrapTag_base {
}
export default BootstrapTag;
//# sourceMappingURL=BootstrapTag.d.ts.map