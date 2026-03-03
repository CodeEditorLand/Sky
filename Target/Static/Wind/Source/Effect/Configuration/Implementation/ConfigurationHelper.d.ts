/**
 * @module Effect/Configuration/Implementation/ConfigurationHelper
 * @description
 * Helper functions for Configuration service implementation.
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Main implementation
 * @category Implementation
 */
import { Effect } from "effect";
import type { ISandboxConfiguration } from "../../../Types/Sandbox.js";
import type { ConfigSchemaIssue } from "../Type/ConfigurationSchemaType.js";
import { ConfigValidationError } from "../Error/ConfigValidationError.js";
import { ConfigApplyError } from "../Error/ConfigApplyError.js";
/**
 * Validates configuration structure and returns schema issues if any.
 */
declare const ValidateConfiguration: (Config: unknown) => ReadonlyArray<ConfigSchemaIssue>;
/**
 * Creates the validate effect implementation.
 */
declare const MakeValidate: () => (Config: unknown) => Effect.Effect<ISandboxConfiguration, ConfigValidationError>;
/**
 * Creates the apply effect implementation.
 */
declare const MakeApply: () => (Config: ISandboxConfiguration) => Effect.Effect<void, ConfigApplyError>;
/**
 * Get configuration value with path (dot notation).
 */
declare const GetConfigValue: <T>(Config: ISandboxConfiguration, Path: string) => T | undefined;
export { ValidateConfiguration, MakeValidate, MakeApply, GetConfigValue, };
//# sourceMappingURL=ConfigurationHelper.d.ts.map