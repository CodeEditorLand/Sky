/**
 * @module Effect/Configuration/Error/ConfigFetchError
 * @description
 * Error thrown when configuration fetch fails.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
export declare class ConfigFetchError extends Error {
    readonly cause: unknown;
    readonly _tag = "ConfigFetchError";
    constructor(cause: unknown);
}
export default ConfigFetchError;
//# sourceMappingURL=ConfigFetchError.d.ts.map