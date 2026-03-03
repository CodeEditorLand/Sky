/**
 * @module Effect/MountainSync/Tag/MountainSyncTag
 * @description
 * Service tag for MountainSync dependency injection.
 * Provides the Context.Tag for accessing MountainSync service in Effect programs.
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @see {@link Effect/MountainSync/Implementation/MountainSyncImplementation} Implementation
 * @category Tag
 */
import { Context } from "effect";
import type { MountainSyncService } from "../Interface/MountainSyncService.js";
declare const MountainSyncTag_base: Context.TagClass<MountainSyncTag, "Effect/MountainSync", MountainSyncService>;
/**
 * Context.Tag for MountainSync service dependency injection.
 * Use this tag to access MountainSync in Effect programs.
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { MountainSyncTag } from "./Effect/MountainSync/Tag/MountainSyncTag.js";
 *
 * const syncNow = Effect.gen(function* () {
 *   const mountainSync = yield* MountainSyncTag;
 *   return yield* mountainSync.syncNow();
 * });
 * ```
 */
export default class MountainSyncTag extends MountainSyncTag_base {
}
export {};
//# sourceMappingURL=MountainSyncTag.d.ts.map