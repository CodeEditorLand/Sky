/**
 * @module Effect/Panel/Error/PanelViewNotFoundError
 * @description
 * Error thrown when a requested panel view cannot be found.
 * @see {@link Effect/Panel/Interface/PanelService} Usage context
 * @see {@link Effect/Panel/Error/PanelUpdateError} Update error
 * @category Error
 */
/**
 * Error thrown when attempting to access, update, or remove a panel view that doesn't exist.
 * Includes the view ID that was not found.
 */
export default class PanelViewNotFoundError extends Error {
    readonly _tag = "PanelViewNotFoundError";
    constructor(viewId: string);
    get name(): string;
}
//# sourceMappingURL=PanelViewNotFoundError.d.ts.map