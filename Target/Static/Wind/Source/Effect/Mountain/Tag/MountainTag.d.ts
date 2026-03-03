/**
 * @module Effect/Mountain/Tag/MountainTag
 * @description
 * Context Tag for Mountain service dependency injection.
 * Enables service composition and layering in Effect programs.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface
 * @see [Effect-TS Context](https://effect.website/docs/guide/context)
 * @category Tag
 */
import { Context } from "effect";
import type { MountainService } from "../Interface/MountainService.js";
declare const MountainTag_base: Context.TagClass<MountainTag, "Mountain", MountainService>;
/**
 * Context Tag for Mountain service.
 * Use this to inject the Mountain service into Effect programs.
 *
 * @example
 * ```ts
 * import { MountainTag } from "./Tag/MountainTag.js";
 *
 * const effect = Effect.gen(function* () {
 *   const mountain = yield* MountainTag;
 *   const version = yield* mountain.version;
 *   return version;
 * });
 * ```
 */
export declare class MountainTag extends MountainTag_base {
}
export default MountainTag;
//# sourceMappingURL=MountainTag.d.ts.map