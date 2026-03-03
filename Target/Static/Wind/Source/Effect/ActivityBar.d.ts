/**
 * @module Effect/ActivityBar
 * @description
 * Atomic Activity Bar service using Effect-TS.
 * Manages activity bar items, their display, and active state.
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from {@link ./ActivityBar/index.ts} instead.
 *
 * @example
 * ```ts
 * // Old (still works):
 * import { ActivityBar, ActivityBarLive } from "./Effect/ActivityBar.js";
 *
 * // New (recommended):
 * import { ActivityBar, ActivityBarLive } from "./Effect/ActivityBar/index.js";
 * ```
 */
export { ActivityBarItemNotFoundError, ActivityBarUpdateError, type ActivityBarBadge, type ActivityBarItem, type CreateActivityBarItem, type ActivityBarService, ActivityBarTag, ActivityBar, MakeCreateItem, MakeUpdateItem, MakeRemoveItem, MakeGetItem, MakeSetActiveItem, MakeSetBadge, MakeGetBadge, GenerateItemId, ActivityBarLive, ActivityBarMockLive, } from "./ActivityBar/index.js";
//# sourceMappingURL=ActivityBar.d.ts.map