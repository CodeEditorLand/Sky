/**
 * @module Workbench/Interface/WorkbenchIntegrationService
 * @description
 * Service interface for VSCode browser workbench integration.
 * Manages the integration of Mountain file system provider with VSCode's workbench.
 * @see {@link Workbench/Implementation/WorkbenchIntegrationImplementation} Default implementation
 * @category Interface
 */
import type { Effect } from "effect";
import type { WorkbenchIntegrationError } from "../Type/WorkbenchIntegrationType.js";
import type { ProviderRegistrationResult, WorkbenchDiagnostics, WorkbenchInitState, WorkbenchIntegrationConfig, WorkspaceContext } from "../Type/WorkbenchIntegrationType.js";
/**
 * Service interface for VSCode workbench integration.
 * Manages the lifecycle of integrating Mountain's file system provider with VSCode.
 */
export interface WorkbenchIntegrationService {
    /**
     * Initialize workbench integration.
     * Waits for workbench to be ready, unregisters default providers,
     * and registers Mountain file system provider.
     * @param config - Integration configuration
     * @returns Effect that completes when integration is initialized
     */
    readonly initialize: (config: WorkbenchIntegrationConfig) => Effect.Effect<void, WorkbenchIntegrationError>;
    /**
     * Get current workbench initialization state.
     * @returns Effect that resolves to current state
     */
    readonly getState: Effect.Effect<WorkbenchInitState, never>;
    /**
     * Stream of workbench state changes.
     * @returns Effect that resolves to a stream of state changes
     */
    readonly stateChanges: Effect.Effect<import("effect/Stream").Stream<WorkbenchInitState, never>>;
    /**
     * Register Mountain file system provider with VSCode workbench.
     * @param scheme - File scheme to register (e.g., "file")
     * @returns Effect that resolves to registration result
     */
    readonly registerProvider: (scheme: string) => Effect.Effect<ProviderRegistrationResult, WorkbenchIntegrationError>;
    /**
     * Unregister VSCode's default file system providers.
     * Optional step before registering Mountain provider.
     * @returns Effect that completes when default providers are unregistered
     */
    readonly unregisterDefaultProviders: Effect.Effect<void, WorkbenchIntegrationError>;
    /**
     * Configure workspace for VSCode workbench.
     * Sets up workspace root, folders, and configuration from Mountain.
     * @param workspaceContext - Workspace configuration
     * @returns Effect that completes when workspace is configured
     */
    readonly configureWorkspace: (workspaceContext: WorkspaceContext) => Effect.Effect<void, WorkbenchIntegrationError>;
    /**
     * Get diagnostics about the current integration state.
     * Useful for debugging and monitoring.
     * @returns Effect that resolves to diagnostic information
     */
    readonly getDiagnostics: Effect.Effect<WorkbenchDiagnostics, never>;
    /**
     * Check if workbench is ready for integration.
     * Returns true when VSCode APIs and service collection are available.
     * @returns Effect that resolves to boolean
     */
    readonly isWorkbenchReady: Effect.Effect<boolean, never>;
    /**
     * Reset workbench integration state.
     * Clears all registered providers and resets to initial state.
     * @returns Effect that completes when reset is done
     */
    readonly reset: Effect.Effect<void, WorkbenchIntegrationError>;
    /**
     * Wait for workbench to be ready.
     * Polls until workbench APIs are available or timeout is reached.
     * @param timeout - Maximum time to wait in milliseconds
     * @returns Effect that completes when workbench is ready
     */
    readonly waitForWorkbench: (timeout: number) => Effect.Effect<void, WorkbenchIntegrationError>;
}
//# sourceMappingURL=WorkbenchIntegrationService.d.ts.map