/**
 * @module Effect/Configuration/Interface/ConfigurationService
 * @description
 * Service interface for configuration management.
 * Provides methods to fetch, validate, apply, and react to configuration changes.
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Default implementation
 * @see [Effect-TS Services](https://effect.website/docs/guide/context)
 * @category Interface
 */
import { Effect, Stream } from "effect";
import type { ISandboxConfiguration } from "../../../Types/Sandbox.js";
import type { ConfigurationNotReadyError } from "../../../Types/Sandbox.js";
import type { ConfigFetchError } from "../Error/ConfigFetchError.js";
import type { ConfigValidationError } from "../Error/ConfigValidationError.js";
import type { ConfigApplyError } from "../Error/ConfigApplyError.js";
/**
 * Service interface for Configuration operations.
 * Manages configuration fetching, validation, and reactive updates.
 */
export interface ConfigurationService {
    /**
     * Get current configuration snapshot.
     * @returns Effect that resolves to the current configuration
     */
    readonly get: Effect.Effect<ISandboxConfiguration, ConfigurationNotReadyError>;
    /**
     * Fetch configuration from backend.
     * @returns Effect that resolves to the fetched configuration
     */
    readonly fetch: Effect.Effect<ISandboxConfiguration, ConfigFetchError>;
    /**
     * Validate configuration structure.
     * @param config - The configuration to validate
     * @returns Effect that resolves to validated configuration or validation error
     */
    readonly validate: (config: unknown) => Effect.Effect<ISandboxConfiguration, ConfigValidationError>;
    /**
     * Apply configuration (zoom, userEnv, etc.).
     * @param config - The configuration to apply
     * @returns Effect that completes when configuration is applied
     */
    readonly apply: (config: ISandboxConfiguration) => Effect.Effect<void, ConfigApplyError>;
    /**
     * Stream of configuration changes.
     * Emits new configuration whenever it changes.
     */
    readonly changes: Stream.Stream<ISandboxConfiguration, never>;
    /**
     * Force refresh configuration from backend.
     * @returns Effect that resolves to the refreshed configuration
     */
    readonly refresh: Effect.Effect<ISandboxConfiguration, ConfigFetchError>;
}
//# sourceMappingURL=ConfigurationService.d.ts.map