/**
 * @module Effect/ActivityBar/Error/ActivityBarUpdateError
 * @description
 * Error thrown when an activity bar item update fails.
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
export declare class ActivityBarUpdateError extends Error {
    readonly _tag = "ActivityBarUpdateError";
    constructor(itemId: string, cause: unknown);
    get name(): string;
}
export default ActivityBarUpdateError;
//# sourceMappingURL=ActivityBarUpdateError.d.ts.map