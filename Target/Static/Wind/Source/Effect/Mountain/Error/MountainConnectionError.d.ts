/**
 * @module Effect/Mountain/Error/MountainConnectionError
 * @description
 * Error thrown when connection to Mountain backend fails.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
export declare class MountainConnectionError extends Error {
    readonly _tag = "MountainConnectionError";
    readonly cause: unknown;
    constructor(cause: unknown);
}
export default MountainConnectionError;
//# sourceMappingURL=MountainConnectionError.d.ts.map