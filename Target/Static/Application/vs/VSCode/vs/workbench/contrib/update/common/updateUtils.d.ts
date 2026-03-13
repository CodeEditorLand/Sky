import { Downloading } from '../../../../platform/update/common/update.js';
/**
 * Returns the progress percentage based on the current and maximum progress values.
 */
export declare function computeProgressPercent(current: number | undefined, max: number | undefined): number | undefined;
/**
 * Computes an estimate of remaining download time in seconds.
 */
export declare function computeDownloadTimeRemaining(state: Downloading): number | undefined;
/**
 * Computes the current download speed in bytes per second.
 */
export declare function computeDownloadSpeed(state: Downloading): number | undefined;
/**
 * Computes the version to use for fetching update info.
 * - If the minor version differs: returns `{major}.{minor}` (e.g., 1.108.2 -> 1.109.5 => 1.109)
 * - If the same minor: returns the target version as-is (e.g., 1.109.2 -> 1.109.5 => 1.109.5)
 */
export declare function computeUpdateInfoVersion(currentVersion: string, targetVersion: string): string | undefined;
/**
 * Computes the URL to fetch update info from.
 * Follows the release notes URL pattern but with `_update` suffix.
 */
export declare function getUpdateInfoUrl(version: string): string;
/**
 * Formats the time remaining as a human-readable string.
 */
export declare function formatTimeRemaining(seconds: number): string;
/**
 * Formats a byte count as a human-readable string.
 */
export declare function formatBytes(bytes: number): string;
/**
 * Tries to parse a date string and returns the timestamp or undefined if parsing fails.
 */
export declare function tryParseDate(date: string | undefined): number | undefined;
/**
 * Formats a timestamp as a localized date string.
 */
export declare function formatDate(timestamp: number): string;
/**
 * Formats a number to 1 decimal place, omitting ".0" for whole numbers.
 */
export declare function formatDecimal(value: number): string;
export interface IVersion {
    major: number;
    minor: number;
    patch: number;
}
/**
 * Parses a version string in the format "major.minor.patch" and returns an object with the components.
 */
export declare function tryParseVersion(version: string | undefined): IVersion | undefined;
/**
 * Processes an error message and returns a user-friendly version of it, or undefined if the error should be ignored.
 */
export declare function preprocessError(error?: string): string | undefined;
