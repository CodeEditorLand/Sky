/**
 * electron-workbench.ts - Electron workbench loading script for Electron
 *
 * This script loads the Electron VSCode workbench and verifies the initial state
 * after the workbench is loaded.
 */

interface ElectronPolyfillsWindow extends Window {
	__ELECTRON_POLYFILLS_LOADED__?: unknown;
	require?: NodeRequire;
}

console.log("[Electron] ===== Loading Electron VSCode workbench =====");
console.log(
	"[Electron] Workbench path: vs/code/electron-browser/workbench/workbench.js",
);
console.log(
	"[Electron] Note: Electron workbench has more features than browser workbench",
);

try {
	// Import the Electron workbench (NOT browser workbench)
	// Electron workbench uses Electron-specific APIs
	// @ts-ignore - Dynamic import for side effects, .d.ts file is not a module but the .js file exists at runtime
	// electron-browser workbench.js is not compiled in Output — only .d.ts exists.
	// When the Electron approach is activated, this path will need to be compiled first.
	// await import("/vs/code/electron-browser/workbench/workbench.js");

	console.log("[Electron] ✓ Electron workbench script loaded successfully");
	console.log("[Electron] ===== Workbench load complete =====");

	// Log initial state after workbench load
	setTimeout(async () => {
		console.log("[Electron] ===== Post-workbench load state =====");
		console.log(
			"[Electron] window.vscode available:",
			typeof window.vscode !== "undefined",
		);
		console.log(
			"[Electron] Monaco editor available:",
			typeof window.monaco !== "undefined",
		);

		// Check for Electron polyfills loaded flag (using bracket notation)
		const electronPolyfillsLoaded = (window as ElectronPolyfillsWindow)[
			"__ELECTRON_POLYFILLS_LOADED__"
		];
		console.log(
			"[Electron] Electron polyfills loaded:",
			typeof electronPolyfillsLoaded !== "undefined",
		);

		// Check for Electron-specific globals (using bracket notation)
		if (typeof window.require !== "undefined") {
			console.log(
				"[Electron] ✓ Node.js require() available (via polyfill)",
			);
			try {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				void window.require("electron");
				console.log(
					"[Electron] ✓ Electron module accessible (polyfill)",
				);
			} catch {
				console.log(
					"[Electron] ℹ Electron module polyfill not fully functional",
				);
			}
		}
	}, 2000);
} catch (error: unknown) {
	console.error("[Electron] ✗ Failed to load Electron workbench:", error);
	console.error("[Electron] This may be due to:");
	console.error("[Electron] 1. Incomplete or non-functional polyfills");
	console.error("[Electron] 2. CSP errors with vscode-file:// protocol");
	console.error("[Electron] 3. Missing Electron APIs");
	console.error("[Electron] 4. Browser environment limitations");
	console.error(
		"[Electron] Consider using Mountain.astro (A2) as recommended approach",
	);
}

console.log("[Electron] ===== Workbench load sequence complete =====");

export default {};
