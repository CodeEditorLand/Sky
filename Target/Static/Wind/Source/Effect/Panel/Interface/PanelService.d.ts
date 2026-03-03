/**
 * @module Effect/Panel/Interface/PanelService
 * @description
 * Service interface for Panel management.
 * Provides methods to manage bottom panel views in VSCode.
 * @see {@link Effect/Panel/Type/PanelType} Type definitions
 * @see {@link Effect/Panel/Tag/PanelTag} Service tag
 * @see {@link Effect/Panel/Implementation/PanelImplementation} Implementation
 * @category Interface
 */
import type { Effect } from "effect";
import type { Stream } from "effect";
import type { PanelView, CreatePanelView, PanelViewType } from "../Type/PanelType.js";
import type PanelViewNotFoundError from "../Error/PanelViewNotFoundError.js";
import type PanelUpdateError from "../Error/PanelUpdateError.js";
/**
 * Panel service interface for managing bottom panel views.
 * Provides CRUD operations, visibility control, and stream-based reactivity.
 */
export interface PanelService {
    /** Create a new panel view with auto-generated ID */
    readonly createView: (view: CreatePanelView) => Effect.Effect<PanelView, never>;
    /** Update an existing panel view */
    readonly updateView: (id: string, updates: Partial<Omit<PanelView, "id">>) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;
    /** Remove a panel view */
    readonly removeView: (id: string) => Effect.Effect<void, PanelViewNotFoundError>;
    /** Get a specific panel view by ID */
    readonly getView: (id: string) => Effect.Effect<PanelView | undefined, never>;
    /** Get all panel views */
    readonly views: Effect.Effect<ReadonlyArray<PanelView>, never>;
    /** Stream of panel view changes for reactive updates */
    readonly viewsChanges: Stream.Stream<ReadonlyArray<PanelView>, never>;
    /** Set the active (focused) panel view */
    readonly setActiveView: (id: string) => Effect.Effect<void, PanelViewNotFoundError>;
    /** Get the currently active panel view ID */
    readonly getActiveView: Effect.Effect<string | undefined, never>;
    /** Stream of active view changes for reactive updates */
    readonly activeViewChanges: Stream.Stream<string | undefined, never>;
    /** Show a panel view */
    readonly showView: (id: string) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;
    /** Hide a panel view */
    readonly hideView: (id: string) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;
    /** Toggle a panel view's visibility */
    readonly toggleView: (id: string) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;
    /** Maximize a panel view to take full height */
    readonly maximizeView: (id: string) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;
    /** Restore a panel view from maximized state */
    readonly restoreView: (id: string) => Effect.Effect<void, PanelViewNotFoundError | PanelUpdateError>;
    /** Get views by type filter */
    readonly getViewsByType: (type: PanelViewType) => Effect.Effect<ReadonlyArray<PanelView>, never>;
    /** Get all visible panel views */
    readonly getVisibleViews: Effect.Effect<ReadonlyArray<PanelView>, never>;
    /** Get the currently maximized panel view */
    readonly getMaximizedView: Effect.Effect<PanelView | undefined, never>;
}
//# sourceMappingURL=PanelService.d.ts.map