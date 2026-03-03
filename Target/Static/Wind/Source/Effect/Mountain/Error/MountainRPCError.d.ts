/**
 * @module Effect/Mountain/Error/MountainRPCError
 * @description
 * Error thrown when Mountain RPC call fails.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
export declare class MountainRPCError extends Error {
    readonly _tag = "MountainRPCError";
    readonly method: string;
    readonly cause: unknown;
    constructor(method: string, cause: unknown);
}
export default MountainRPCError;
//# sourceMappingURL=MountainRPCError.d.ts.map