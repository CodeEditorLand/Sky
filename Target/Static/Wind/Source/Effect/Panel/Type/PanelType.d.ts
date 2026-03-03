/**
 * @module Effect/Panel/Type/PanelType
 * @description
 * Type definitions for Panel service.
 * Defines panel view types, structures, and creation types.
 * @see {@link Effect/Panel/Interface/PanelService} Service interface
 * @see {@link Effect/Panel/Implementation/PanelImplementation} Implementation
 * @category Type
 */
/**
 * Possible types of panel views.
 * Corresponds to VSCode's built-in panel view types.
 */
export type PanelViewType = "output" | "debug" | "terminal" | "problems" | "custom";
/**
 * Represents a panel view in the VSCode bottom panel area.
 * Contains all configurable properties for a panel view.
 */
export interface PanelView {
    /** Unique identifier for the panel view */
    readonly id: string;
    /** Display title shown in the panel tab */
    readonly title: string;
    /** Type of panel view content */
    readonly type: PanelViewType;
    /** Priority for ordering - lower values appear first */
    readonly priority: number;
    /** Whether the panel view is currently visible */
    readonly visible: boolean;
    /** Whether the panel view is maximized (taking full height) */
    readonly maximized: boolean;
}
/**
 * Type for creating a new panel view.
 * Omits the `id` field as it's auto-generated.
 */
export type CreatePanelView = Omit<PanelView, "id">;
//# sourceMappingURL=PanelType.d.ts.map