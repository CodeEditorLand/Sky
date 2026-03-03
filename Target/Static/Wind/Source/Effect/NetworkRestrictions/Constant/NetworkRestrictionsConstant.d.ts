/**
 * @module Effect/NetworkRestrictions/Constant/NetworkRestrictionsConstant
 * @description
 * Constants and default values for the NetworkRestrictions service including default
 * configuration, endpoint lists, and IPC channel patterns.
 * @see {@link Effect/NetworkRestrictions/Type/NetworkRestrictionConfig} Related type
 * @see [Effect-TS Documentation](https://effect.website/docs/guide/context)
 * @category Constant
 */
/**
 * Default network restrictions configuration - blocks all external network traffic
 * while allowing internal communication and specific whitelisted domains
 */
export declare const DEFAULT_NETWORK_RESTRICTIONS: {
    blockHTTP: true;
    blockHTTPS: true;
    blockWebSocket: true;
    blockMarketplace: true;
    blockExtensionUpdates: true;
    blockTelemetry: true;
    blockExtensionTelemetry: true;
    allowInternal: true;
    allowLocalhost: true;
    allowMountain: true;
    logBlocked: true;
    allowedDomains: never[];
    blockedDomains: string[];
};
/**
 * Common telemetry endpoints that should always be blocked
 */
export declare const TelemetryEndpoint: string[];
/**
 * Marketplace and extension endpoints that should be blocked
 */
export declare const MarketplaceEndpoint: string[];
/**
 * Update server endpoints that should be blocked
 */
export declare const UpdateEndpoint: string[];
/**
 * AI and Copilot endpoints that should be blocked
 */
export declare const AiEndpoint: string[];
/**
 * VSCode-specific IPC channels that SHOULD BE ALLOWED (internal)
 */
export declare const ALLOWED_IPC_CHANNELS: string[];
/**
 * VSCode IPC channels that MUST BE BLOCKED (telemetry/external)
 */
export declare const BLOCKED_IPC_CHANNELS: string[];
declare const constants: {
    readonly DEFAULT_NETWORK_RESTRICTIONS: {
        blockHTTP: true;
        blockHTTPS: true;
        blockWebSocket: true;
        blockMarketplace: true;
        blockExtensionUpdates: true;
        blockTelemetry: true;
        blockExtensionTelemetry: true;
        allowInternal: true;
        allowLocalhost: true;
        allowMountain: true;
        logBlocked: true;
        allowedDomains: never[];
        blockedDomains: string[];
    };
    readonly TelemetryEndpoint: string[];
    readonly MarketplaceEndpoint: string[];
    readonly UpdateEndpoint: string[];
    readonly AiEndpoint: string[];
    readonly ALLOWED_IPC_CHANNELS: string[];
    readonly BLOCKED_IPC_CHANNELS: string[];
};
export default constants;
//# sourceMappingURL=NetworkRestrictionsConstant.d.ts.map