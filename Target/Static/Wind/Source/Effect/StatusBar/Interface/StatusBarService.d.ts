/**
 * @module Effect/StatusBar/Interface/StatusBarService
 * @description
 * Service interface for StatusBar management.
 * Provides methods to manage VSCode status bar items.
 * @see {@link Effect/StatusBar/Type/StatusBarType} Type definitions
 * @see {@link Effect/StatusBar/Tag/StatusBarTag} Service tag
 * @see {@link Effect/StatusBar/Layer/StatusBarLive} Live implementation
 * @category Interface
 */
import type { Effect } from "effect";
import type { Stream } from "effect";
import type { StatusBarItem, CreateStatusBarItem } from "../Type/StatusBarType.js";
import type StatusBarItemNotFoundError from "../Error/StatusBarItemNotFoundError.js";
import type StatusBarUpdateError from "../Error/StatusBarUpdateError.js";
/**
 * StatusBar service interface for managing VSCode status bar items.
 * Provides CRUD operations and stream-based reactivity.
 */
export interface StatusBarService {
    /** Create a new status bar item with auto-generated ID */
    readonly createItem: (item: CreateStatusBarItem) => Effect.Effect<StatusBarItem, never>;
    /** Update an existing status bar item */
    readonly updateItem: (id: string, updates: Partial<Omit<StatusBarItem, "id">>) => Effect.Effect<void, StatusBarItemNotFoundError | StatusBarUpdateError>;
    /** Remove a status bar item */
    readonly removeItem: (id: string) => Effect.Effect<void, StatusBarItemNotFoundError>;
    /** Get a specific status bar item by ID */
    readonly getItem: (id: string) => Effect.Effect<StatusBarItem | undefined, never>;
    /** Get all status bar items */
    readonly items: Effect.Effect<ReadonlyArray<StatusBarItem>, never>;
    /** Stream of status bar item changes for reactive updates */
    readonly itemsChanges: Stream.Stream<ReadonlyArray<StatusBarItem>, never>;
    /** Set the visibility of a status bar item */
    readonly setItemVisibility: (id: string, visible: boolean) => Effect.Effect<void, StatusBarItemNotFoundError>;
    /** Get the text of a status bar item */
    readonly getItemText: (id: string) => Effect.Effect<string | undefined, never>;
    /** Set the text of a status bar item */
    readonly setItemText: (id: string, text: string) => Effect.Effect<void, StatusBarItemNotFoundError | StatusBarUpdateError>;
}
//# sourceMappingURL=StatusBarService.d.ts.map