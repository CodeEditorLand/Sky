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
 *   `@codeeditorland/output/vs/code/electron-browser/workbench/workbench`
 *
 * The Output package's `exports` map (`"./*"` ->
 * `./Target/Microsoft/VSCode/*.js`) resolves this through
 * `node_modules/@codeeditorland/output/Target/...`. Output's own
 * prepublishOnly populates that tree before Sky's Vite step runs, so
 * Rollup sees real files when it walks the module graph.
 *
 * Using the package specifier (not a relative path into Dependency/)
 * means the existing `Static/Application/` pipeline is untouched -
 * Sky's `astro:build:done` still copies + transforms the same files
 * for the non-bundled boot path.
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

if (typeof (globalThis as never as { __name?: unknown }).__name !== "function") {
	(globalThis as never as { __name: unknown }).__name = (
		Target: object,
		Value: string,
	) => {
		Object.defineProperty(Target, "name", {
			value: Value,
			configurable: true,
		});
		return Target;
	};
}

(globalThis as never as { _VSCODE_FILE_ROOT?: string })._VSCODE_FILE_ROOT ??=
	new URL("./", import.meta.url).href;

(globalThis as never as { _VSCODE_PRODUCT_JSON?: object })._VSCODE_PRODUCT_JSON ??=
	{};

performance.mark("land:bundled:electron:start");

await import(
	"@codeeditorland/output/vs/code/electron-browser/workbench/workbench"
);

performance.mark("land:bundled:electron:imported");
performance.measure(
	"land:bundled:electron:import",
	"land:bundled:electron:start",
	"land:bundled:electron:imported",
);

export default {};
