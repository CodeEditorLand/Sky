/**
 * @module Effect/Sidebar/Type/SidebarType
 * @description
 * Type definitions for Sidebar service.
 * Defines sidebar panel types, structures, and creation types.
 * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
 * @see {@link Effect/Sidebar/Implementation/SidebarImplementation} Implementation
 * @category Type
 */
/**
 * Represents a sidebar panel in VSCode.
 * Contains all configurable properties for a sidebar panel.
 */
export interface SidebarPanel {
    /** Unique identifier for the sidebar panel */
    readonly id: string;
    /** Display title shown in the sidebar */
    readonly title: string;
    /** Icon identifier for the sidebar panel */
    readonly icon: string;
    /** Position of the sidebar panel */
    readonly position: "left" | "right";
    /** Priority for ordering - lower values appear first */
    readonly priority: number;
    /** ID of the view that this panel contains */
    readonly viewId: string;
    /** Whether the sidebar panel is currently collapsed */
    readonly collapsed: boolean;
}
/**
 * Type for creating a new sidebar panel.
 * Omits the `id` field as it's auto-generated.
 */
export type CreateSidebarPanel = Omit<SidebarPanel, "id">;
//# sourceMappingURL=SidebarType.d.ts.map