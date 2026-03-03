/**
 * @module Effect/NetworkRestrictions/Type/NetworkRestrictionConfig
 * @description
 * Configuration interface for the NetworkRestrictions service. Defines what network
 * traffic should be blocked or allowed.
 * @see {@link Effect/NetworkRestrictions/Constant/NetworkRestrictionsConstant} Default values
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Usage context
 * @category Type
 */
/**
 * Network restriction configuration
 */
export interface NetworkRestrictionConfig {
    /** Block all HTTP requests */
    readonly blockHTTP: boolean;
    /** Block all HTTPS requests */
    readonly blockHTTPS: boolean;
    /** Block WebSocket connections */
    readonly blockWebSocket: boolean;
    /** Block extension marketplace requests */
    readonly blockMarketplace: boolean;
    /** Block extension update checks */
    readonly blockExtensionUpdates: boolean;
    /**
     * Allow specific domains (whitelist)
     * Examples: ['localhost', '127.0.0.1', 'company-internal.com']
     */
    readonly allowedDomains: Array<string>;
    /**
     * Block specific domains (blacklist)
     * Examples: ['telemetry.vscode.azure.net', 'marketplace.visualstudio.com']
     */
    readonly blockedDomains: Array<string>;
    /** Block all telemetry endpoints */
    readonly blockTelemetry: boolean;
    /** Block extension telemetry */
    readonly blockExtensionTelemetry: boolean;
    /** Allow internal communication */
    readonly allowInternal: boolean;
    /** Allow localhost development connections */
    readonly allowLocalhost: boolean;
    /** Allow connections to Mountain backend */
    readonly allowMountain: boolean;
    /**
     * Log blocked requests for debugging (internal only)
     */
    readonly logBlocked: boolean;
}
//# sourceMappingURL=NetworkRestrictionConfig.d.ts.map