/**
 * Bundled base workbench entry - Rollup graph root.
 *
 * Counterpart to Bundled/Electron/Entry.ts targeting VS Code's base
 * workbench module at `vs/workbench/browser/workbench.js` (the
 * shared contribution-registering module that every concrete
 * workbench - Electron / Browser / Sessions - extends).
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

performance.mark("land:bundled:workbench:start");

await import("@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/browser/workbench.js");

performance.mark("land:bundled:workbench:imported");

performance.measure(
	"land:bundled:workbench:import",

	"land:bundled:workbench:start",

	"land:bundled:workbench:imported",
);

export default {};
