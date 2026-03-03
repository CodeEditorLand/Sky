/**
 * @module Effect/ActivityBar/Type/ActivityBarType
 * @description
 * Type definitions for activity bar items and badges.
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface using these types
 * @see [Effect-TS Types](https://effect.website/docs/guide/type-system)
 * @category Type
 */
/**
 * Represents a badge displayed on an activity bar item.
 */
export interface ActivityBarBadge {
    readonly text: string;
    readonly color?: string;
}
/**
 * Represents a complete activity bar item with all properties.
 */
export interface ActivityBarItem {
    readonly id: string;
    readonly title: string;
    readonly icon: string;
    readonly command: string;
    readonly position: number;
    readonly badge?: ActivityBarBadge;
}
/**
 * Represents the data required to create a new activity bar item
 * (without the auto-generated id).
 */
export type CreateActivityBarItem = Omit<ActivityBarItem, "id">;
//# sourceMappingURL=ActivityBarType.d.ts.map