/**
 * @module SharedProcessProxy
 *
 * @description
 * Polyfill for Electron's shared process.
 * The shared process in VSCode handles:
 * - Remote extension host requests
 * - Search service
 * - Debug service
 * - Other background services
 *
 * In Tauri, these services are routed to Cocoon via gRPC.
 *
 * @service_map
 * - IExtensionHostService → Cocoon extension host via gRPC
 * - ISearchService → Cocoon search service via gRPC
 * - IDebugService → Cocoon debug service via gRPC
 * - IStorageService → Mountain storage service
 * - IUpdateService → Mountain update service
 *
 * @phase 6 of Approach A3 implementation
 */
/**
 * Shared process service type
 */
type SharedProcessService = "extension-host" | "search" | "debug" | "storage" | "update" | "telemetry" | "remote-ssh" | "remote-tunnel" | "webview" | "terminal" | "sharedProcess";
/**
 * Service proxy interface
 */
interface ServiceProxy {
    service: SharedProcessService;
    ready: boolean;
    healthCheck(): Promise<boolean>;
    invoke(method: string, ...args: unknown[]): Promise<unknown>;
    on(event: string, handler: (...args: unknown[]) => void): void;
    once(event: string, handler: (...args: unknown[]) => void): void;
    removeListener(event: string, handler: (...args: unknown[]) => void): void;
    removeAllListeners(event?: string): void;
}
/**
 * Extension host service proxy
 * Routes extension host operations to Cocoon
 */
export declare const ExtensionHostService: ServiceProxy;
/**
 * Search service proxy
 * Routes search operations to Cocoon
 */
export declare const SearchService: ServiceProxy;
/**
 * Debug service proxy
 * Routes debug operations to Cocoon
 */
export declare const DebugService: ServiceProxy;
/**
 * Storage service proxy
 * Routes storage operations to Mountain
 */
export declare const StorageService: ServiceProxy;
/**
 * Update service proxy
 * Routes update operations to Mountain
 */
export declare const UpdateService: ServiceProxy;
/**
 * Shared process manager
 * Manages all shared process services
 */
declare class SharedProcessManager {
    private services;
    private healthCheckInterval;
    constructor();
    /**
     * Register a service proxy
     */
    registerService(proxy: ServiceProxy): void;
    /**
     * Get service proxy
     */
    getService(service: SharedProcessService): ServiceProxy | undefined;
    /**
     * Get all services
     */
    getAllServices(): Map<SharedProcessService, ServiceProxy>;
    /**
     * Start health checks
     */
    startHealthChecks(intervalMs?: number): void;
    /**
     * Stop health checks
     */
    stopHealthChecks(): void;
    /**
     * Initialize all services
     */
    initialize(): Promise<void>;
    /**
     * Shutdown all services
     */
    shutdown(): Promise<void>;
}
/**
 * Get or create the shared process manager
 */
export declare function getSharedProcessManager(): SharedProcessManager;
/**
 * Install the shared process proxy
 */
export declare function installSharedProcessProxy(): Promise<void>;
declare const _default: {
    install: typeof installSharedProcessProxy;
    getManager: typeof getSharedProcessManager;
    ExtensionHostService: ServiceProxy;
    SearchService: ServiceProxy;
    DebugService: ServiceProxy;
    StorageService: ServiceProxy;
    UpdateService: ServiceProxy;
    SharedProcessManager: typeof SharedProcessManager;
};
export default _default;
//# sourceMappingURL=SharedProcessProxy.d.ts.map