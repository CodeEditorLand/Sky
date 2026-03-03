/**
 * @module Effect/StatusBar/Type/StatusBarType
 * @description
 * Type definitions for StatusBar service.
 * Defines status bar item types, structures, and creation types.
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Service interface
 * @see {@link Effect/StatusBar/Layer/StatusBarLive} Live implementation
 * @category Type
 */
/**
 * Represents a status bar item in VSCode.
 * Contains all configurable properties for a status bar item.
 */
export interface StatusBarItem {
    /** Unique identifier for the status bar item */
    readonly id: string;
    /** Text displayed in the status bar */
    readonly text: string;
    /** Alignment of the item within the status bar */
    readonly alignment: "left" | "right";
    /** Priority for ordering - lower values appear first */
    readonly priority: number;
    /** Text color override */
    readonly color?: string;
    /** Background color override */
    readonly backgroundColor?: string;
    /** Tooltip text shown on hover */
    readonly tooltip?: string;
    /** Command to execute on click */
    readonly command?: string;
    /** Icon identifier */
    readonly icon?: string;
}
/**
 * Type for creating a new status bar item.
 * Omits the `id` field as it's auto-generated.
 */
export type CreateStatusBarItem = Omit<StatusBarItem, "id">;
//# sourceMappingURL=StatusBarType.d.ts.map