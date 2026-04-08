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
 *
 * IMPORTANT: workbench.js is an async IIFE (async function() { ... })().
 * The import() resolves after the IIFE STARTS, not after it completes.
 * The IIFE runs in the background — its errors are surfaced by Step 8's
 * unhandledrejection listener (patched into workbench.js by astro.config.ts).
 */

console.log("[Electron] ===== Loading Electron VSCode workbench =====");

// Pre-flight: verify prerequisites
console.log("[Electron] Pre-flight checks:");

console.log("[Electron]   window.vscode:", typeof (window as any).vscode);

console.log(
	"[Electron]   window.vscode.context:",
	typeof (window as any).vscode?.context,
);

console.log(
	"[Electron]   window.vscode.ipcRenderer:",
	typeof (window as any).vscode?.ipcRenderer,
);

console.log(
	"[Electron]   window.vscode.process:",
	typeof (window as any).vscode?.process,
);

console.log("[Electron]   window.__TAURI__:", typeof (window as any).__TAURI__);

console.log(
	"[Electron]   _VSCODE_FILE_ROOT:",
	(globalThis as any)._VSCODE_FILE_ROOT,
);

console.log(
	"[Electron]   _VSCODE_USE_RELATIVE_IMPORTS:",
	(globalThis as any)._VSCODE_USE_RELATIVE_IMPORTS,
);

console.log(
	"[Electron]   VSCODE_DEV:",
	(window as any).vscode?.process?.env?.VSCODE_DEV,
);

try {
	const WorkbenchUrl =
		"/Static/Application/vs/code/electron-browser/workbench/workbench.js";

	console.log("[Electron] Importing:", WorkbenchUrl);

	await import(/* @vite-ignore */ WorkbenchUrl);

	// The import() resolved — the IIFE has STARTED (not completed).
	// workbench.js runs: resolveConfiguration → load(workbench.desktop.main.js) → main(config)
	// All of that happens asynchronously. Step 8's error listeners surface any failures.
	console.log(
		"[Electron] Workbench module imported (IIFE running in background)",
	);

	// Diagnostic: poll for workbench render state.
	// This helps identify whether the IIFE completes or silently dies.
	const CheckIntervals = [2000, 5000, 10000, 20000];

	for (const Delay of CheckIntervals) {
		setTimeout(() => {
			const HasSplash = !!document.getElementById("monaco-parts-splash");

			const HasWorkbench = !!document.querySelector(".monaco-workbench");

			const HasShellColors = !!document.querySelector(
				".initialShellColors",
			);

			if (HasWorkbench) {
				console.log(
					`[Electron] +${Delay}ms: Workbench rendered successfully`,
				);
			} else {
				console.warn(
					`[Electron] +${Delay}ms: Workbench NOT rendered (splash=${HasSplash}, shellColors=${HasShellColors})`,
				);

				if (Delay === CheckIntervals[CheckIntervals.length - 1]) {
					console.error(
						"[Electron] Workbench did not render within %dms. Check console for errors above.",
						Delay,
					);
				}
			}
		}, Delay);
	}
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

	if (Error instanceof globalThis.Error && Error.stack) {
		console.error(Error.stack);
	}
}

export default {};
