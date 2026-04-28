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

(globalThis as never as { _VSCODE_PRODUCT_JSON?: object })._VSCODE_PRODUCT_JSON ??=
	{};

performance.mark("land:bundled:electron:start");

// Pre-import the workbench's desktop entry shim with a LITERAL string so
// Vite/Rollup follows desktop.main.js's static import graph (~1500
// modules: contrib/*, services/*, platform/*, base/*, editor/*) and
// pulls them into the bundled chunk. Without this, only workbench.js
// + its small synchronous graph land in the bundle (~26 MB), and the
// workbench loader's runtime `await import(computedURL)` resolves
// against `/Static/Application/` - re-fetching ~1500 separate files
// from disk every cold boot.
//
// The browser's module cache deduplicates: when workbench.js later
// runs `await import("vs/workbench/workbench.desktop.main.js")` the
// resolved URL hits the same cache entry as the static import here,
// so order-of-execution is preserved (desktop.main.js side-effects
// happen first, registering DI services; workbench.js then runs
// `result.main(configuration)` against the registered surface).
//
// `workbench.web.main.internal.js` is statically imported by
// `workbench.web.main.js`, which `workbench.desktop.main.js` shares
// many modules with - Rollup chunk-deduplicates so we're not paying
// the import twice.
await import(
	"@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/workbench.desktop.main.js"
);

await import(
	"@codeeditorland/output/Target/Microsoft/VSCode/vs/code/electron-browser/workbench/workbench.js"
);

performance.mark("land:bundled:electron:imported");
performance.measure(
	"land:bundled:electron:import",
	"land:bundled:electron:start",
	"land:bundled:electron:imported",
);

export default {};
