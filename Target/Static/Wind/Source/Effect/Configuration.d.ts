/**
 * @module Effect/Configuration
 * @description
 * Atomic configuration service using Effect-TS.
 * Consolidates configuration fetching, validation, and reactive updates.
 * Replaces duplicated logic in Preload, MountainIntegrationService, and MountainWindSync.
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from {@link ./Configuration/index.ts} instead.
 *
 * @example
 * ```ts
 * // Old (still works):
 * import { Configuration, ConfigurationLive } from "./Effect/Configuration.js";
 *
 * // New (recommended):
 * import { Configuration, ConfigurationLive } from "./Effect/Configuration/index.js";
 * ```
 */
export { ConfigFetchError, ConfigValidationError, ConfigApplyError, type ConfigSchemaIssue, type ConfigurationService, ConfigurationTag, ValidateConfiguration, MakeValidate, MakeApply, GetConfigValue, ConfigurationLive, ConfigurationWithSyncLive, ConfigurationMock, makeMockConfiguration, Configuration, } from "./Configuration/index.js";
//# sourceMappingURL=Configuration.d.ts.map