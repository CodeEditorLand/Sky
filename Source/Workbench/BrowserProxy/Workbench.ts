/**
 * browser-proxy-workbench.ts - VSCode browser workbench loading script for Browser Proxy
 *
 * This script loads the browser VSCode workbench and verifies the initial state
 * after the workbench is loaded.
 */

interface MountainProxyWindow extends Window {
	__MOUNTAIN_PROXY__?: unknown;
}

console.log("[BrowserProxy] ===== Loading browser VSCode workbench =====");

try {
	// Variable URL: Rollup only analyzes string literals — an identifier
	// reference is treated as truly dynamic and never resolved at build time.
	const WorkbenchUrl = "/vs/code/browser/workbench/workbench.js";
	await import(WorkbenchUrl);

	console.log(
		"[BrowserProxy] ✓ Browser workbench script loaded successfully",
	);
	console.log("[BrowserProxy] ===== Workbench load complete =====");

	// Log initial state after workbench load
	setTimeout(async () => {
		console.log("[BrowserProxy] ===== Post-workbench load state =====");
		const mountainProxy = (window as MountainProxyWindow)[
			"__MOUNTAIN_PROXY__"
		];
		console.log(
			"[BrowserProxy] Services proxy active:",
			typeof mountainProxy !== "undefined",
		);
	}, 2000);
} catch (error: unknown) {
	console.error("[BrowserProxy] ✗ Failed to load browser workbench:", error);
}

console.log("[BrowserProxy] ===== Workbench load sequence complete =====");

export default {};
