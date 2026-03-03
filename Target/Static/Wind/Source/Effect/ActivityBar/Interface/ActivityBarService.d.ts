/**
 * @module Effect/ActivityBar/Interface/ActivityBarService
 * @description
 * Service interface for managing activity bar items, their display, and active state.
 * Provides methods to create, update, remove, and query activity bar items.
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Default implementation
 * @see {@link Effect/ActivityBar/Type/ActivityBarType} Type definitions
 * @see [Effect-TS Services](https://effect.website/docs/guide/context)
 * @category Interface
 */
import { Effect, Stream } from "effect";
import type { ActivityBarBadge, ActivityBarItem } from "../Type/ActivityBarType.js";
import type { ActivityBarItemNotFoundError } from "../Error/ActivityBarItemNotFoundError.js";
import type { ActivityBarUpdateError } from "../Error/ActivityBarUpdateError.js";
/**
 * Service interface for Activity Bar operations.
 * Manages activity bar items, their display state, badges, and active item.
 */
export interface ActivityBarService {
    /**
     * Create a new activity bar item.
     * @param item - The item data (without id, which is auto-generated)
     * @returns The created activity bar item with generated id
     */
    readonly createItem: (item: import("../Type/ActivityBarType.js").CreateActivityBarItem) => Effect.Effect<ActivityBarItem, never>;
    /**
     * Update an existing activity bar item.
     * @param id - The item id to update
     * @param updates - Partial updates to apply
     */
    readonly updateItem: (id: string, updates: Partial<Omit<ActivityBarItem, "id">>) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;
    /**
     * Remove an activity bar item.
     * @param id - The item id to remove
     */
    readonly removeItem: (id: string) => Effect.Effect<void, ActivityBarItemNotFoundError>;
    /**
     * Get a specific activity bar item by ID.
     * @param id - The item id to retrieve
     * @returns The item or undefined if not found
     */
    readonly getItem: (id: string) => Effect.Effect<ActivityBarItem | undefined, never>;
    /**
     * Get all activity bar items.
     * @returns Readonly array of all activity bar items
     */
    readonly items: Effect.Effect<ReadonlyArray<ActivityBarItem>, never>;
    /**
     * Stream of activity bar item changes.
     * Emits new array of items whenever any item changes.
     */
    readonly itemsChanges: Stream.Stream<ReadonlyArray<ActivityBarItem>, never>;
    /**
     * Set the active activity bar item.
     * @param id - The item id to set as active
     */
    readonly setActiveItem: (id: string) => Effect.Effect<void, ActivityBarItemNotFoundError>;
    /**
     * Get the currently active activity bar item ID.
     * @returns The active item id or undefined if none is active
     */
    readonly getActiveItem: Effect.Effect<string | undefined, never>;
    /**
     * Stream of active item changes.
     * Emits new active item id (or undefined) whenever active item changes.
     */
    readonly activeItemChanges: Stream.Stream<string | undefined, never>;
    /**
     * Set badge for an activity bar item.
     * @param id - The item id to set badge on
     * @param badge - The badge to set, or undefined to clear
     */
    readonly setBadge: (id: string, badge: ActivityBarBadge | undefined) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;
    /**
     * Get badge for an activity bar item.
     * @param id - The item id to get badge from
     * @returns The badge or undefined if not set
     */
    readonly getBadge: (id: string) => Effect.Effect<ActivityBarBadge | undefined, never>;
    /**
     * Clear badge for an activity bar item.
     * @param id - The item id to clear badge from
     */
    readonly clearBadge: (id: string) => Effect.Effect<void, ActivityBarItemNotFoundError | ActivityBarUpdateError>;
}
//# sourceMappingURL=ActivityBarService.d.ts.map