/**
 * @module Effect/NetworkRestrictions/Implementation/NetworkRestrictionsHelper
 * @description
 * Helper functions for NetworkRestrictions implementation. Provides URL and IPC channel
 * checking logic used by the main service implementation.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Main implementation
 * @category Implementation
 */
import type { NetworkRestrictionConfig } from "../Type/NetworkRestrictionConfig.js";
/**
 * Check if URL is internal (localhost, Mountain backend, etc.)
 * @param config - The current network restriction configuration
 * @param url - The URL to check
 * @returns true if the URL is internal and should be allowed
 */
export declare const IsInternalURL: (Config: NetworkRestrictionConfig, Url: string) => boolean;
/**
 * Check if URL matches any blocked patterns
 * @param config - The current network restriction configuration
 * @param url - The URL to check
 * @returns true if the URL should be blocked
 */
export declare const IsBlockedURL: (Config: NetworkRestrictionConfig, Url: string) => boolean;
/**
 * Check if URL matches any allowed patterns (whitelist)
 * @param config - The current network restriction configuration
 * @param url - The URL to check
 * @returns true if the URL is in the whitelist
 */
export declare const IsAllowedURL: (Config: NetworkRestrictionConfig, Url: string) => boolean;
/**
 * Check if IPC channel is allowed
 * @param channel - The IPC channel to check
 * @returns true if the IPC channel is allowed
 */
export declare const IsIPCAllowed: (Channel: string) => boolean;
declare const helpers: {
    IsInternalURL: (Config: NetworkRestrictionConfig, Url: string) => boolean;
    IsBlockedURL: (Config: NetworkRestrictionConfig, Url: string) => boolean;
    IsAllowedURL: (Config: NetworkRestrictionConfig, Url: string) => boolean;
    IsIPCAllowed: (Channel: string) => boolean;
};
export default helpers;
//# sourceMappingURL=NetworkRestrictionsHelper.d.ts.map