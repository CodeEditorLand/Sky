/**
 * Electron workbench loading script (Approach A3)
 *
 * The Electron workbench is an async IIFE that:
 * 1. Reads window.vscode (preloadGlobals) for ipcRenderer + process + context
 * 2. Calls context.resolveConfiguration() -> INativeWindowConfiguration
 * 3. Computes baseUrl from configuration.appRoot
 * 4. Imports vs/workbench/workbench.desktop.main.js relative to baseUrl
 *
 * Wind's Install.ts provides all of these via the preload polyfill.
 * The _VSCODE_FILE_ROOT global is set by Base.astro before this script
 * runs, redirecting all VS Code asset loads to /Static/Application/.
 *
 * This path is served from Target/Static/Application/vs/ which is
 * populated by CopyVSCodeAssets in astro.config.ts (astro:build:done hook).
 * The electron-browser files are only available when Electron=true in the
 * build profile (debug-electron), which un-excludes electron-browser paths
 * in Output's ESBuild Exclude/Electron.ts and Exclude/Bootstrap.ts.
 */

console.log("[Electron] ===== Loading Electron VSCode workbench =====");
console.log(
	"[Electron] Workbench: vs/code/electron-browser/workbench/workbench.js",
);

try {
	const WorkbenchUrl =
		"/Static/Application/vs/code/electron-browser/workbench/workbench.js";

	console.log("[Electron] Importing:", WorkbenchUrl);
	await import(/* @vite-ignore */ WorkbenchUrl);

	console.log("[Electron] Workbench script loaded successfully");
	console.log("[Electron] ===== Workbench load complete =====");
} catch (Error: unknown) {
	console.error("[Electron] Failed to load Electron workbench:", Error);

	if (Error instanceof TypeError && String(Error).includes("MIME")) {
		console.error(
			"[Electron] MIME error: the file may not exist in Target/Static/Application/vs/",
		);
		console.error(
			"[Electron] Ensure Electron=true is set and CopyVSCodeAssets copies electron-browser/",
		);
	}
}

console.log("[Electron] ===== Workbench load sequence complete =====");

export default {};
