/**
 * browser-proxy-workbench.ts - VSCode browser workbench loading script for Browser Proxy
 *
 * This script loads the browser VSCode workbench and verifies the initial state
 * after the workbench is loaded.
 */

interface MountainProxyWindow extends Window {
	__MOUNTAIN_PROXY__?: unknown;
}

try {
	// Variable URL: Rollup only analyzes string literals - an identifier
	// reference is treated as truly dynamic and never resolved at build time.
	const WorkbenchUrl = "/vs/code/browser/workbench/workbench.js";
	await import(WorkbenchUrl);

	// Log initial state after workbench load
	setTimeout(async () => {
		const mountainProxy = (window as MountainProxyWindow)[
			"__MOUNTAIN_PROXY__"
		];
	}, 2000);
} catch (error: unknown) {
}

export default {};
