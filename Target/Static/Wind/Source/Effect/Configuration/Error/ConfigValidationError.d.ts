/**
 * @module Effect/Configuration/Error/ConfigValidationError
 * @description
 * Error thrown when configuration validation fails.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */
export declare class ConfigValidationError extends Error {
    readonly issues: ReadonlyArray<string>;
    readonly _tag = "ConfigValidationError";
    constructor(issues: ReadonlyArray<string>);
}
export default ConfigValidationError;
//# sourceMappingURL=ConfigValidationError.d.ts.map