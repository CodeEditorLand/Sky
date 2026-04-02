/**
 * electron-wind-preload.ts - Wind preload installation script for Electron
 *
 * This script installs the Wind preload polyfill which provides VSCode-compatible
 * globals (window.vscode, window.preloadGlobals) for the Electron workbench.
 */

import Install from "@codeeditorland/wind/Target/Function/Install";

console.log("[Electron] ===== Starting Wind preload installation =====");
console.log("[Electron] Workbench: Electron (A3)");
console.log(
	"[Electron] Approach: Electron workbench + complete Electron API polyfills",
);

// Install the Wind preload polyfill (window.vscode globals)
Install()
	.then(() => {
		console.log("[Electron] ✓ Wind preload installed successfully");

		// Verify preloadGlobals is available
		if (window.preloadGlobals && window.preloadGlobals.process) {
			console.log("[Electron] ✓ preloadGlobals.process is available");
			const process = window.preloadGlobals.process;
			console.log("[Electron] - Platform:", process.platform);
			console.log("[Electron] - Arch:", process.arch);
			console.log("[Electron] - Type:", process.type);
		} else {
			console.warn("[Electron] ⚠ preloadGlobals.process not available");
		}

		// Verify window.vscode is available
		if (window.vscode) {
			console.log("[Electron] ✓ window.vscode is available");
			console.log(
				"[Electron] - ipcRenderer:",
				typeof window.vscode.ipcRenderer,
			);
			console.log("[Electron] - process:", typeof window.vscode.process);
			console.log("[Electron] - context:", typeof window.vscode.context);
		} else {
			console.error("[Electron] ✗ window.vscode not available");
		}

		// Verify Wind preload ready flag
		if (window.__WIND_PRELOAD_READY__) {
			console.log("[Electron] ✓ Wind preload ready flag is set");
		} else {
			console.warn("[Electron] ⚠ Wind preload ready flag is not set");
		}

		console.log(
			"[Electron] ===== Wind preload installation complete =====",
		);
	})
	.catch((error: unknown) => {
		console.error("[Electron] ✗ Wind preload install error:", error);
	});
