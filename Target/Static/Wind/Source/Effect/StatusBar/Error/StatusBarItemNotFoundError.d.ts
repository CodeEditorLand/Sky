/**
 * @module Effect/StatusBar/Error/StatusBarItemNotFoundError
 * @description
 * Error thrown when a requested status bar item cannot be found.
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Usage context
 * @see {@link Effect/StatusBar/Error/StatusBarUpdateError} Update error
 * @category Error
 */
/**
 * Error thrown when attempting to access or modify a status bar item that doesn't exist.
 * Includes the item ID that was not found.
 */
export default class StatusBarItemNotFoundError extends Error {
    readonly itemId: string;
    readonly _tag = "StatusBarItemNotFoundError";
    constructor(itemId: string);
    get name(): string;
}
//# sourceMappingURL=StatusBarItemNotFoundError.d.ts.map