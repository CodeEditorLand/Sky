/**
 * @module Effect/ActivityBar
 * @description
 * Main re-export module for ActivityBar service.
 * Provides atomic exports for activity bar item management.
 *
 * @example
 * ```ts
 * import { ActivityBar, ActivityBarLive, ActivityBarTag } from "./Effect/ActivityBar/index.js";
 *
 * // Using the service
 * const program = Effect.gen(function* () {
 *   const activityBar = yield* ActivityBarTag;
 *   const items = yield* activityBar.items;
 *   return items;
 * });
 *
 * // Providing the layer
 * const runnable = program.pipe(Effect.provide(ActivityBarLive));
 * ```
 *
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Live implementation
 * @see [Effect-TS Documentation](https://effect.website/docs/guide/context)
 * @category Service
 */
export { default as ActivityBarItemNotFoundError } from "./Error/ActivityBarItemNotFoundError.js";
export { default as ActivityBarUpdateError } from "./Error/ActivityBarUpdateError.js";
export type { ActivityBarBadge, ActivityBarItem, CreateActivityBarItem } from "./Type/ActivityBarType.js";
export type { ActivityBarService } from "./Interface/ActivityBarService.js";
export { ActivityBarTag } from "./Tag/ActivityBarTag.js";
export { MakeCreateItem, MakeUpdateItem, MakeRemoveItem, MakeGetItem, MakeSetActiveItem, MakeSetBadge, MakeGetBadge, GenerateItemId, } from "./Implementation/ActivityBarHelper.js";
export { ActivityBarLive } from "./Implementation/ActivityBarImplementation.js";
export { ActivityBarMockLive } from "./Layer/ActivityBarMock.js";
import { ActivityBarTag } from "./Tag/ActivityBarTag.js";
export { ActivityBarTag as ActivityBar };
//# sourceMappingURL=index.d.ts.map