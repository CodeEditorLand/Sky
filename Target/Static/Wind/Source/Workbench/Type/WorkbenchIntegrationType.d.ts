/**
 * @module Workbench/Type/WorkbenchIntegrationType
 * @description
 * Type definitions for VSCode browser workbench integration.
 * Defines the state, configuration, and error types for integrating Mountain file system provider.
 * @category Type
 */
/**
 * Current workbench initialization state
 */
export declare enum WorkbenchState {
    /** Workbench not yet initialized */
    NotInitialized = "NotInitialized",
    /** Waiting for workbench to be ready */
    WaitingForReady = "WaitingForReady",
    /** Workbench is ready for provider registration */
    ReadyForProviderRegistration = "ReadyForProviderRegistration",
    /** Default providers unregistered */
    DefaultProvidersUnregistered = "DefaultProvidersUnregistered",
    /** Mountain provider registered */
    MountainProviderRegistered = "MountainProviderRegistered",
    /** Workspace configuration set */
    WorkspaceConfigured = "WorkspaceConfigured",
    /** Integration complete */
    IntegrationComplete = "IntegrationComplete",
    /** Integration failed */
    Failed = "Failed"
}
/**
 * Workbench initialization state with metadata
 */
export interface WorkbenchInitState {
    /** Current state enum value */
    readonly state: WorkbenchState;
    /** Timestamp when state was last updated */
    readonly lastUpdated: number;
}
/**
 * Configuration for workbench integration
 */
export interface WorkbenchIntegrationConfig {
    /** Root URI for the workspace (e.g., "codeeditorland://workspace") */
    readonly workspaceRootUri: string;
    /** File scheme to use (default: "file") */
    readonly fileScheme?: string;
    /** Maximum timeout for workbench initialization (ms) */
    readonly initTimeout?: number;
    /** Maximum timeout for provider registration (ms) */
    readonly registrationTimeout?: number;
    /** Whether to enable debug logging */
    readonly debugMode?: boolean;
    /** Whether to override default VSCode providers */
    readonly overrideDefaultProviders?: boolean;
}
/**
 * Result of provider registration attempt
 */
export interface ProviderRegistrationResult {
    /** Whether registration was successful */
    readonly success: boolean;
    /** Name of the provider that was registered */
    readonly providerName: string;
    /** Scheme the provider was registered for (e.g., "file") */
    scheme?: string;
    /** Error if registration failed */
    error?: Error;
    /** Additional registration details */
    details?: Record<string, unknown>;
}
/**
 * Workspace context information
 */
export interface WorkspaceContext {
    /** Root directory URI for the workspace */
    readonly rootUri: string;
    /** Workspace name */
    readonly name: string;
    /** Whether this is the default workspace */
    readonly isDefault: boolean;
    /** Additional workspace folders */
    readonly folders: ReadonlyArray<{
        readonly uri: string;
        readonly name: string;
    }>;
}
/**
 * Diagnostic information about workbench integration
 */
export interface WorkbenchDiagnostics {
    /** Workbench initialization state */
    readonly state: WorkbenchInitState;
    /** Whether VSCode APIs are available */
    readonly vscodeAvailable: boolean;
    /** Whether Monaco editor is available */
    readonly monacoAvailable: boolean;
    /** Whether workbench service collection is accessible */
    readonly serviceCollectionAccessible: boolean;
    /** List of default providers that were found */
    readonly defaultProvidersFound: ReadonlyArray<string>;
    /** Provider registration result */
    registrationResult?: ProviderRegistrationResult;
    /** Workspace context if configured */
    workspaceContext?: WorkspaceContext;
    /** Any warnings or informational messages */
    readonly messages: ReadonlyArray<{
        readonly type: "info" | "warning" | "error";
        readonly message: string;
        readonly timestamp: number;
    }>;
}
/**
 * Base error type for workbench integration
 */
export declare class WorkbenchIntegrationError extends Error {
    readonly code: WorkbenchIntegrationErrorCode;
    constructor(message: string, code: WorkbenchIntegrationErrorCode);
}
/**
 * Error codes for workbench integration operations
 */
export declare enum WorkbenchIntegrationErrorCode {
    /** Workbench did not initialize within timeout */
    InitTimeout = "InitTimeout",
    /** Workbench services are not available */
    ServiceUnavailable = "ServiceUnavailable",
    /** Failed to unregister default providers */
    ProviderUnregisterFailed = "ProviderUnregisterFailed",
    /** Failed to register Mountain provider */
    ProviderRegistrationFailed = "ProviderRegistrationFailed",
    /** Workspace configuration failed */
    WorkspaceConfigFailed = "WorkspaceConfigFailed",
    /** File system provider not available */
    FileSystemProviderUnavailable = "FileSystemProviderUnavailable",
    /** Invalid workspace configuration */
    InvalidWorkspaceConfig = "InvalidWorkspaceConfig",
    /** Unknown error */
    Unknown = "Unknown"
}
//# sourceMappingURL=WorkbenchIntegrationType.d.ts.map