/**
 * Electron workbench loading script (Approach A3).
 * Zero console.* output. Dev tracing via performance.mark/measure.
 *
 * Loads workbench.js which runs an async IIFE:
 * resolveConfiguration → load(workbench.desktop.main.js) → main(config)
 */

// WKWebView polyfills: requestIdleCallback, queryLocalFonts, __name.
if (typeof window.requestIdleCallback !== "function") {
	(window as any).requestIdleCallback = (
		Callback: IdleRequestCallback,

		Options?: IdleRequestOptions,
	): number => {
		const Timeout = Options?.timeout ?? 1;

		const Start = Date.now();

		return setTimeout(() => {
			Callback({
				didTimeout: Timeout <= 0,
				timeRemaining: () =>
					Math.max(0, Timeout - (Date.now() - Start)),
			});
		}, Timeout) as unknown as number;
	};
}

if (typeof window.cancelIdleCallback !== "function") {
	(window as any).cancelIdleCallback = (Id: number): void => {
		clearTimeout(Id);
	};
}

if (typeof (window as any).queryLocalFonts !== "function") {
	(window as any).queryLocalFonts = () => Promise.resolve([]);
}

if (typeof (globalThis as any).__name !== "function") {
	(globalThis as any).__name = (Target: any, Value: string) => {
		Object.defineProperty(Target, "name", {
			value: Value,
			configurable: true,
		});

		return Target;
	};
}

// Blob patch: inject __name + rewrite vscode-file:// to http://localhost in worker blobs.
{
	const OriginalBlob = globalThis.Blob;

	const NameShim =
		"var __defProp=Object.defineProperty;var __name=(t,v)=>__defProp(t,'name',{value:v,configurable:true});\n";

	const Origin = window.location.origin;

	(globalThis as any).Blob = function PatchedBlob(
		Parts?: BlobPart[],

		Options?: BlobPropertyBag,
	) {
		if (
			Options?.type === "application/javascript" &&
			Parts?.length &&
			typeof Parts[0] === "string"
		) {
			Parts = Parts.map((Part) => {
				if (typeof Part !== "string") return Part;

				let Rewritten = Part.replace(
					/vscode-file:\/\/vscode-app\/Static\/Application\/out\//g,

					`${Origin}/Static/Application/`,
				);

				Rewritten = Rewritten.replace(
					/vscode-file:\/\/vscode-app\//g,

					`${Origin}/`,
				);

				return Rewritten;
			});

			Parts = [NameShim, ...Parts];
		}

		return new OriginalBlob(Parts, Options);
	} as unknown as typeof Blob;

	(globalThis as any).Blob.prototype = OriginalBlob.prototype;
}

try {
	performance.mark("land:workbench:start");

	const WorkbenchUrl =
		"/Static/Application/vs/code/electron-browser/workbench/workbench.js";

	await import(/* @vite-ignore */ WorkbenchUrl);

	performance.mark("land:workbench:imported");

	performance.measure(
		"land:workbench:import",

		"land:workbench:start",

		"land:workbench:imported",
	);

	// Diagnostic: poll for workbench render state via performance marks.
	const CheckIntervals = [2000, 5000, 10000, 20000];

	for (const Delay of CheckIntervals) {
		setTimeout(() => {
			const HasWorkbench = !!document.querySelector(".monaco-workbench");

			performance.mark(`land:workbench:check:${Delay}ms`, {
				detail: { rendered: HasWorkbench },
			});
		}, Delay);
	}
} catch {
	performance.mark("land:workbench:error");
}

export default {};
