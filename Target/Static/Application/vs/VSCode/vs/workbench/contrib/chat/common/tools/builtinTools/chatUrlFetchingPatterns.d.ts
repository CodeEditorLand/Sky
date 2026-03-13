import { URI } from '../../../../../../base/common/uri.js';
/**
 * Approval settings for a URL pattern
 */
export interface IUrlApprovalSettings {
    approveRequest?: boolean;
    approveResponse?: boolean;
}
/**
 * Extracts domain patterns from a URL for use in approval actions
 * @param url The URL to extract patterns from
 * @returns An array of patterns in order of specificity (most specific first)
 */
export declare function extractUrlPatterns(url: URI): string[];
/**
 * Generates user-friendly labels for URL patterns to show in quick pick
 * @param url The original URL
 * @param pattern The pattern to generate a label for
 * @returns A user-friendly label describing what the pattern matches (without protocol)
 */
export declare function getPatternLabel(url: URI, pattern: string): string;
/**
 * Checks if a URL matches any approved pattern
 * @param url The URL to check
 * @param approvedUrls Map of approved URL patterns to their settings
 * @param checkRequest Whether to check request approval (true) or response approval (false)
 * @returns true if the URL is approved for the specified action
 */
export declare function isUrlApproved(url: URI, approvedUrls: Record<string, boolean | IUrlApprovalSettings>, checkRequest: boolean): boolean;
/**
 * Gets the most specific matching pattern for a URL
 * @param url The URL to find a matching pattern for
 * @param approvedUrls Map of approved URL patterns
 * @returns The most specific matching pattern, or undefined if none match
 */
export declare function getMatchingPattern(url: URI, approvedUrls: Record<string, boolean | IUrlApprovalSettings>): string | undefined;
