/**
 * @module Effect/Environment/Implementation/EnvironmentHelper
 * @description
 * Helper functions for detecting platform, architecture, and environment settings.
 * Used by the Environment service implementation.
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Main implementation
 * @category Implementation
 */
import type { Platform, Architecture } from "../Type/EnvironmentType.js";
/**
 * Detect the current platform
 * @returns The detected platform type
 */
export declare const DetectPlatform: () => Platform;
/**
 * Detect the current CPU architecture
 * @returns The detected architecture type
 */
export declare const DetectArchitecture: () => Architecture;
/**
 * Detect the current locale
 * @returns The detected locale string
 */
export declare const DetectLocale: () => string;
/**
 * Detect the current timezone
 * @returns The detected timezone string
 */
export declare const DetectTimezone: () => string;
/**
 * Get the user agent string
 * @returns The user agent string
 */
export declare const GetUserAgent: () => string;
declare const helpers: {
    DetectPlatform: () => Platform;
    DetectArchitecture: () => Architecture;
    DetectLocale: () => string;
    DetectTimezone: () => string;
    GetUserAgent: () => string;
};
export default helpers;
//# sourceMappingURL=EnvironmentHelper.d.ts.map