/**
 * @module Effect/Mountain/Error/MountainStateError
 * @description
 * Error thrown when Mountain state is invalid.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
export declare class MountainStateError extends Error {
    readonly _tag = "MountainStateError";
    readonly expected: string;
    readonly actual: string;
    constructor(expected: string, actual: string);
}
export default MountainStateError;
//# sourceMappingURL=MountainStateError.d.ts.map