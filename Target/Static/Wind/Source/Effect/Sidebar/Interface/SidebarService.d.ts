/**
 * @module Effect/Sidebar/Interface/SidebarService
 * @description
 * Service interface for Sidebar management.
 * Provides methods to manage VSCode sidebar panels.
 * @see {@link Effect/Sidebar/Type/SidebarType} Type definitions
 * @see {@link Effect/Sidebar/Tag/SidebarTag} Service tag
 * @see {@link Effect/Sidebar/Layer/SidebarLive} Live implementation
 * @category Interface
 */
import type { Effect } from "effect";
import type { Stream } from "effect";
import type { SidebarPanel, CreateSidebarPanel } from "../Type/SidebarType.js";
import type SidebarPanelNotFoundError from "../Error/SidebarPanelNotFoundError.js";
import type SidebarUpdateError from "../Error/SidebarUpdateError.js";
/**
 * Sidebar service interface for managing VSCode sidebar panels.
 * Provides CRUD operations, collapse/expand control, and stream-based reactivity.
 */
export interface SidebarService {
    /** Create a new sidebar panel with auto-generated ID */
    readonly createPanel: (panel: CreateSidebarPanel) => Effect.Effect<SidebarPanel, never>;
    /** Update an existing sidebar panel */
    readonly updatePanel: (id: string, updates: Partial<Omit<SidebarPanel, "id">>) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;
    /** Remove a sidebar panel */
    readonly removePanel: (id: string) => Effect.Effect<void, SidebarPanelNotFoundError>;
    /** Get a specific sidebar panel by ID */
    readonly getPanel: (id: string) => Effect.Effect<SidebarPanel | undefined, never>;
    /** Get all sidebar panels */
    readonly panels: Effect.Effect<ReadonlyArray<SidebarPanel>, never>;
    /** Stream of sidebar panel changes for reactive updates */
    readonly panelsChanges: Stream.Stream<ReadonlyArray<SidebarPanel>, never>;
    /** Set the active (focused) sidebar panel */
    readonly setActivePanel: (id: string) => Effect.Effect<void, SidebarPanelNotFoundError>;
    /** Get the currently active sidebar panel ID */
    readonly getActivePanel: Effect.Effect<string | undefined, never>;
    /** Stream of active panel changes for reactive updates */
    readonly activePanelChanges: Stream.Stream<string | undefined, never>;
    /** Toggle a sidebar panel's collapsed state */
    readonly togglePanel: (id: string) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;
    /** Collapse a sidebar panel */
    readonly collapsePanel: (id: string) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;
    /** Expand a sidebar panel */
    readonly expandPanel: (id: string) => Effect.Effect<void, SidebarPanelNotFoundError | SidebarUpdateError>;
    /** Get panels by position filter (left/right) */
    readonly getPanelsByPosition: (position: "left" | "right") => Effect.Effect<ReadonlyArray<SidebarPanel>, never>;
}
//# sourceMappingURL=SidebarService.d.ts.map