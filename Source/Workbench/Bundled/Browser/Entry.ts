/**
 * Bundled Browser workbench entry - Rollup graph root.
 *
 * Counterpart to Bundled/Electron/Entry.ts targeting VS Code's
 * `vs/code/browser/workbench/workbench.js`. See that file's header
 * for the shared bundled-pipeline contract.
 */

if (
	typeof (globalThis as never as { __name?: unknown }).__name !== "function"
) {
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

(
	globalThis as never as { _VSCODE_PRODUCT_JSON?: object }
)._VSCODE_PRODUCT_JSON ??= {};

performance.mark("land:bundled:browser:start");

await import("@codeeditorland/output/Target/Microsoft/VSCode/vs/code/browser/workbench/workbench.js");

performance.mark("land:bundled:browser:imported");
performance.measure(
	"land:bundled:browser:import",
	"land:bundled:browser:start",
	"land:bundled:browser:imported",
);

export default {};
