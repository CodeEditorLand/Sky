/**
 * @module Effect/Configuration/Type/ConfigurationSchemaType
 * @description
 * Type definitions for configuration schema validation.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface using these types
 * @category Type
 */
/**
 * Represents a configuration schema validation issue.
 */
export interface ConfigSchemaIssue {
    /** Path to the configuration property with the issue */
    readonly path: string;
    /** Description of the validation issue */
    readonly message: string;
}
//# sourceMappingURL=ConfigurationSchemaType.d.ts.map