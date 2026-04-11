/**
 * browser-proxy-wind-preload.ts - Wind preload installation script for Browser Proxy
 *
 * This script installs the Wind preload polyfill which provides VSCode-compatible
 * globals (window.vscode, window.preloadGlobals) for the browser workbench.
 */

import Install from "@codeeditorland/wind/Target/Function/Install";

// Install the Wind preload polyfill (window.vscode globals)
Install()
	.then(() => {

		// Verify preloadGlobals is available
		if (window.preloadGlobals && window.preloadGlobals.process) {
			const process = window.preloadGlobals.process;
		} else {
		}

		// Verify window.vscode is available
		if (window.vscode) {
		} else {
		}

		// Verify Wind preload ready flag
		if (window.__WIND_PRELOAD_READY__) {
		} else {
		}
	})
	.catch((error: unknown) => {
	});
