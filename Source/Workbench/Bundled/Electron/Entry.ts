/**
 * Bundled Electron workbench entry - Rollup graph root.
 *
 * Sky's astro.config.ts maps `BUNDLED_WORKBENCHES` (set by the
 * release-electron-bundled / debug-electron-bundled profile) to a
 * `vite.build.rollupOptions.input` entry pointing at this file. Rollup
 * follows the static `import` below and pulls every transitive `.js` /
 * `.css` through Vite's native pipeline - tree-shake, chunk dedup,
 * CSS extraction with hashed filenames, the lot.
 *
 * Import target:
 *   `@codeeditorland/output/Target/Microsoft/VSCode/vs/code/
 *    electron-browser/workbench/workbench.js`
 *
 * No package-exports-map indirection: the path is the on-disk path
 * inside the Output package. The same shape works locally
 * (`../../../../../Output/Target/Microsoft/VSCode/vs/.../workbench.js`)
 * once the monorepo waterfall populates Output's Target. Output's
 * prepublishOnly runs before Sky's Vite step (Turbo task graph), so
 * Rollup sees real files when it walks the module graph.
 *
 * Globals required by VS Code before workbench.js loads:
 *   - `_VSCODE_FILE_ROOT` - origin/path the desktop loader dereferences
 *   - `_VSCODE_PRODUCT_JSON` - product metadata (defaulted empty)
 *   - `__name` - esbuild's name-shim (set by the existing Blob patch
 *     on the non-bundled path; reproduced here for parity)
 *
 * Diagnostic timing marks share the `land:bundled:*` namespace so the
 * benchmarking pass can subtract them from `land:wb:*` for the
 * non-bundled comparison.
 */

// `__name` shim, WKWebView polyfills (requestIdleCallback, cancelIdle
// Callback, queryLocalFonts), and Blob worker URL rewrite are now
// injected directly into VS Code's `vs/code/electron-browser/workbench
// /workbench.js` by Output's `InjectWebViewPolyfills` transform plugin
// (runs at Output's prepublishOnly tail). Both Sky paths consume the
// same pre-shimmed file, so this Entry only needs to set the VS Code
// loader globals before kicking off the workbench import.
//
// `_VSCODE_FILE_ROOT` is the base URL the workbench bootstrap uses to
// resolve runtime `await import(computedURL)` chains - e.g.
// `vs/workbench/workbench.desktop.main.js`. Vite/Rollup cannot follow
// computed-string dynamic imports, so those land at runtime regardless
// of the bundled chunk. Pin to `/Static/Application/` (Sky's existing
// pipeline still produces this tree even in bundled profiles) so
// runtime resolutions hit real files instead of `_astro/vs/...` 404s.
(globalThis as never as { _VSCODE_FILE_ROOT?: string })._VSCODE_FILE_ROOT ??=
	`${window.location.origin}/Static/Application/`;

(
	globalThis as never as { _VSCODE_PRODUCT_JSON?: object }
)._VSCODE_PRODUCT_JSON ??= {};

performance.mark("land:bundled:electron:start");

// Just load `workbench.js` - its `load()` function (patched by Output's
// `RewriteWorkbenchBaseURL` transform) does the dynamic import of
// `workbench.desktop.main.js` itself, AFTER setting up
// `_VSCODE_FILE_ROOT`, NLS, and the resolved configuration. The
// transform rewrites the runtime-computed-URL import to a literal-
// string `await import("../../../workbench/workbench.desktop.main.js")`
// so Vite/Rollup can statically follow it and bundle the entire
// desktop graph into a separate chunk that loads on demand.
//
// We previously pre-imported desktop.main.js here, which broke
// initialisation order: desktop.main.js evaluates immediately when
// its chunk loads, but the Electron-side service registrations (Disk
// FileSystemProvider, NativeHostService, etc.) only fire when
// `isElectron` returns true, which depends on the process polyfill
// being live and the workbench config being attached - both done by
// workbench.js's `load()` chain. Pre-importing meant desktop.main.js
// evaluated before that setup, mode-detected as "web", skipped every
// Electron registration, and surfaced as ENOPRO file-system errors.
await import("@codeeditorland/output/Target/Microsoft/VSCode/vs/code/electron-browser/workbench/workbench.js");

performance.mark("land:bundled:electron:imported");

performance.measure(
	"land:bundled:electron:import",

	"land:bundled:electron:start",

	"land:bundled:electron:imported",
);

// Boot-time smoke harness. Walks Wind's generated `CommandCatalog`
// and asserts each command id is known to the workbench's command
// service. Opt-in via `?land-smoke=1` query param or
// `localStorage.LAND_SMOKE_TEST="1"` so a normal run pays zero
// observable overhead - the deferred await below settles the promise
// chain so the export still resolves immediately and Vite/Rollup can
// tree-shake the harness when neither flag is set at build time
// (the gate runs at runtime so this stays in the chunk, but the
// harness body itself only runs when explicitly enabled).
//
// The smoke run is fired *after* the workbench import settles so
// `__CEL_WORKBENCH__` and `__CEL_SERVICES__` are populated by
// `Output/ExposeWorkbenchAccessor` before the harness probes them.
// We wait one macrotask (`setTimeout(_, 0)`) for any synchronous
// post-import service registration to finish.
// Master "disable Land customisations" gate. When `Disable=true` is
// set at build or runtime, the smoke-test harness import is skipped
// entirely so the workbench loads without ANY Land probe attaching to
// it. Useful for bisecting input regressions: `Disable=true` proves
// whether typing breakage is upstream / Tauri / WKWebView (still
// broken under Disable) or in our customisations (works under Disable).
const LandDisabled = (() => {
	try {
		const Meta = (import.meta as { env?: Record<string, unknown> }).env;

		if (Meta) {
			const Flag = Meta["Disable"];

			if (Flag === "true" || Flag === true || Flag === "1") return true;
		}
	} catch {
		/* no-op */
	}

	try {
		if (typeof localStorage !== "undefined") {
			const Stored = localStorage.getItem("Disable");

			if (Stored === "1" || Stored === "true") return true;
		}
	} catch {
		/* no-op */
	}

	return false;
})();

// Install Wind's `__CEL_WIND__` bridge after `__CEL_SERVICES__` is
// populated by Output's `ExposeWorkbenchAccessor` transform (which
// dispatches `cel:services-ready` once the workbench DI container is
// up). InstallLandWorkbench() is idempotent and dispatches
// `cel:wind-ready` for downstream subscribers (SkyBridge, Astro
// components, in-page Wind tasks). Skipped under `Disable=true` so
// the bisect mode keeps the workbench probe-free.
if (!LandDisabled) {
	window.addEventListener(
		"cel:services-ready",

		() => {
			void (async () => {
				const { InstallLandWorkbench } =
					await import("@codeeditorland/wind/Target/Effect/LandWorkbench/LandWorkbenchGlobal.js");

				InstallLandWorkbench();
			})();
		},

		{ once: true },
	);
}

if (!LandDisabled) {
	void (async () => {
		const { RunCommandCatalogSmokeTest } =
			await import("../../../Function/SmokeTest/Run/Command/Catalog/Smoke/Test.js");

		await new Promise<void>((Resolve) => setTimeout(Resolve, 0));

		await RunCommandCatalogSmokeTest();
	})();
} else {
	// Under `Disable=true` we skip the smoke harness but install the
	// hands-off auto-diagnose probe instead. It logs to console which
	// editor instance has focus, classifies it (chat input / file
	// editor / search / settings), and tells the user whether typing
	// SHOULD work in that target. Saves a round-trip of pasting probe
	// scripts into DevTools every time something feels off.
	void (async () => {
		const { AutoDiagnoseInput } =
			await import("../../../Function/SmokeTest/Auto/Diagnose/Input.js");

		AutoDiagnoseInput();
	})();
}

export default {};
