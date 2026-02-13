/*---------------------------------------------------------------------------------------------
 * Sky Shared Utilities
 * --------------------------------------------------------------------------------------------
 * Shared constants and utilities used across Astro components.
 *
 * This module provides:
 * - On: Development/debug mode flag
 * - Bust: Cache-busting function for static asset URLs
 *--------------------------------------------------------------------------------------------*/

/**
 * "On" represents the active development/debugging state.
 * True if NODE_ENV is 'development' OR TAURI_ENV_DEBUG is set.
 */
export const On =
	process.env["NODE_ENV"] === "development" ||
	process.env["TAURI_ENV_DEBUG"] === "true";

/**
 * Bust - Cache-busting utility for static asset URLs
 *
 * Appends a timestamp query parameter to URLs to force cache invalidation
 * during development or when needed.
 *
 * @param Base - The base URL or path
 * @returns The URL with a cache-busting timestamp parameter
 *
 * @example
 * Bust("/Static/Application/vs/workbench.js")
 * // Returns: "/Static/Application/vs/workbench.js?Time=1234567890"
 */
export const Bust = (Base: string): string =>
	`${Base}${Base.includes("?") ? "&" : "?"}Time=${encodeURIComponent(Date.now())}`;
