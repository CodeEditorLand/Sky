/**
 * @module Effect/Sidebar/Error/SidebarPanelNotFoundError
 * @description
 * Error thrown when a requested sidebar panel cannot be found.
 * @see {@link Effect/Sidebar/Interface/SidebarService} Usage context
 * @see {@link Effect/Sidebar/Error/SidebarUpdateError} Update error
 * @category Error
 */
/**
 * Error thrown when attempting to access, update, or remove a sidebar panel that doesn't exist.
 * Includes the panel ID that was not found.
 */
export default class SidebarPanelNotFoundError extends Error {
    readonly _tag = "SidebarPanelNotFoundError";
    constructor(panelId: string);
    get name(): string;
}
//# sourceMappingURL=SidebarPanelNotFoundError.d.ts.map