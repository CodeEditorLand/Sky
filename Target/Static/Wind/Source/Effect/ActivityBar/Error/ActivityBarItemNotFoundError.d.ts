/**
 * @module Effect/ActivityBar/Error/ActivityBarItemNotFoundError
 * @description
 * Error thrown when an activity bar item cannot be found by its ID.
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
export declare class ActivityBarItemNotFoundError extends Error {
    readonly _tag = "ActivityBarItemNotFoundError";
    constructor(itemId: string);
    get name(): string;
}
export default ActivityBarItemNotFoundError;
//# sourceMappingURL=ActivityBarItemNotFoundError.d.ts.map