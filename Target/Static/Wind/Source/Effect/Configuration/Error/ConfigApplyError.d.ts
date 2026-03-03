/**
 * @module Effect/Configuration/Error/ConfigApplyError
 * @description
 * Error thrown when configuration application fails.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
export declare class ConfigApplyError extends Error {
    readonly key: string;
    readonly cause: unknown;
    readonly _tag = "ConfigApplyError";
    constructor(key: string, cause: unknown);
}
export default ConfigApplyError;
//# sourceMappingURL=ConfigApplyError.d.ts.map