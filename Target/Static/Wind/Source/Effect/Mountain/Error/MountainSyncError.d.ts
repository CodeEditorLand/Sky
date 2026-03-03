/**
 * @module Effect/Mountain/Error/MountainSyncError
 * @description
 * Error thrown when Mountain sync operation fails.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
export declare class MountainSyncError extends Error {
    readonly _tag = "MountainSyncError";
    readonly resource: string;
    readonly cause: unknown;
    constructor(resource: string, cause: unknown);
}
export default MountainSyncError;
//# sourceMappingURL=MountainSyncError.d.ts.map