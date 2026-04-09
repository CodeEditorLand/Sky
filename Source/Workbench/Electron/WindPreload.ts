/**
 * electron-wind-preload.ts - Wind preload installation script for Electron
 *
 * This script installs the Wind preload polyfill which provides VSCode-compatible
 * globals (window.vscode, window.preloadGlobals) for the Electron workbench.
 */

import Install from "@codeeditorland/wind/Target/Function/Install";

// Initialize LAND_DEV_LOG from localStorage (persistent) or URL param (?devlog=config,vfs)
// Can also be set at runtime: window.__LAND_DEV_LOG = "all"
{
	const Stored = localStorage.getItem("LAND_DEV_LOG");
	const UrlParam = new URLSearchParams(window.location.search).get("devlog");
	const Value = UrlParam ?? Stored ?? "";
	if (Value) {
		(window as any).__LAND_DEV_LOG = Value;
		console.log(
			`[DevLog] Enabled tags: ${Value} (source: ${UrlParam ? "url" : "localStorage"})`,
		);
	}
}

console.log("[Electron] ===== Starting Wind preload installation =====");

console.log("[Electron] Workbench: Electron (A3)");

console.log(
	"[Electron] Approach: Electron workbench + complete Electron API polyfills",
);

// Install the Wind preload polyfill (window.vscode globals).
// Top-level await ensures Install() completes before Layout.astro
// proceeds to Polyfills.js — the .then() chain was fire-and-forget.
try {
	await Install();

	console.log("[Electron] Wind preload installed successfully");

	if (window.preloadGlobals?.process) {
		const Process = window.preloadGlobals.process;

		console.log(
			"[Electron] preloadGlobals.process:",
			Process.platform,
			Process.arch,
			Process.type,
		);
	} else {
		console.warn("[Electron] preloadGlobals.process not available");
	}

	if (window.vscode) {
		console.log(
			"[Electron] window.vscode: ipcRenderer=%s process=%s context=%s",
			typeof window.vscode.ipcRenderer,
			typeof window.vscode.process,
			typeof window.vscode.context,
		);
	} else {
		console.error("[Electron] window.vscode not available");
	}

	if (!window.__WIND_PRELOAD_READY__) {
		console.warn("[Electron] __WIND_PRELOAD_READY__ flag not set");
	}

	console.log("[Electron] ===== Wind preload installation complete =====");
} catch (Error: unknown) {
	console.error("[Electron] Wind preload install error:", Error);

	if (Error instanceof globalThis.Error && Error.stack) {
		console.error(Error.stack);
	}
}
