/**
 * Bundled Sessions workbench entry - Rollup graph root.
 *
 * Counterpart to Bundled/Electron/Entry.ts targeting the Sessions
 * workbench shape at `vs/sessions/browser/workbench.js`. The Sessions
 * tree is Land-specific (not present in stock VS Code's `out-build`);
 * adjust the import target if the on-disk path differs.
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

performance.mark("land:bundled:sessions:start");

await import(
	"@codeeditorland/output/Target/Microsoft/VSCode/vs/sessions/browser/workbench.js"
);

performance.mark("land:bundled:sessions:imported");
performance.measure(
	"land:bundled:sessions:import",
	"land:bundled:sessions:start",
	"land:bundled:sessions:imported",
);

export default {};
