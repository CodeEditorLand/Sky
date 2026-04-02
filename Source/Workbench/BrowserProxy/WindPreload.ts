/**
 * browser-proxy-wind-preload.ts - Wind preload installation script for Browser Proxy
 *
 * This script installs the Wind preload polyfill which provides VSCode-compatible
 * globals (window.vscode, window.preloadGlobals) for the browser workbench.
 */

import Install from "@codeeditorland/wind/Target/Function/Install";

console.log("[BrowserProxy] ===== Starting Wind preload installation =====");
console.log("[BrowserProxy] Workbench: Browser Proxy (A1)");
console.log(
	"[BrowserProxy] Approach: Browser workbench + Mountain services proxy",
);

// Install the Wind preload polyfill (window.vscode globals)
Install()
	.then(() => {
		console.log("[BrowserProxy] ✓ Wind preload installed successfully");

		// Verify preloadGlobals is available
		if (window.preloadGlobals && window.preloadGlobals.process) {
			console.log("[BrowserProxy] ✓ preloadGlobals.process is available");
			const process = window.preloadGlobals.process;
			console.log("[BrowserProxy] - Platform:", process.platform);
			console.log("[BrowserProxy] - Arch:", process.arch);
			console.log("[BrowserProxy] - Type:", process.type);
		} else {
			console.warn(
				"[BrowserProxy] ⚠ preloadGlobals.process not available",
			);
		}

		// Verify window.vscode is available
		if (window.vscode) {
			console.log("[BrowserProxy] ✓ window.vscode is available");
		} else {
			console.error("[BrowserProxy] ✗ window.vscode not available");
		}

		// Verify Wind preload ready flag
		if (window.__WIND_PRELOAD_READY__) {
			console.log("[BrowserProxy] ✓ Wind preload ready flag is set");
		} else {
			console.warn("[BrowserProxy] ⚠ Wind preload ready flag is not set");
		}

		console.log(
			"[BrowserProxy] ===== Wind preload installation complete =====",
		);
	})
	.catch((error: unknown) => {
		console.error("[BrowserProxy] ✗ Wind preload install error:", error);
	});
