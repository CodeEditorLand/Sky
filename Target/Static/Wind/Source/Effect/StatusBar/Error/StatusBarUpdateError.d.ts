/**
 * @module Effect/StatusBar/Error/StatusBarUpdateError
 * @description
 * Error thrown when updating a status bar item fails.
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Usage context
 * @see {@link Effect/StatusBar/Error/StatusBarItemNotFoundError} Item not found error
 * @category Error
 */
/**
 * Error thrown when attempting to update a status bar item and the operation fails.
 * Includes the item ID and the underlying cause of the failure.
 */
export default class StatusBarUpdateError extends Error {
    readonly _tag = "StatusBarUpdateError";
    readonly cause: unknown;
    readonly itemId: string;
    constructor(itemId: string, cause: unknown);
    get name(): string;
}
//# sourceMappingURL=StatusBarUpdateError.d.ts.map