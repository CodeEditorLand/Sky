/**
 * Wind preload installation for Electron workbench (A3).
 * Zero console.* output. Tracing via performance.mark().
 */

import Install from "@codeeditorland/wind/Target/Function/Install";

try {
	performance.mark("land:preload:start");
	await Install();
	performance.mark("land:preload:done");
	performance.measure("land:preload", "land:preload:start", "land:preload:done");
} catch {
	performance.mark("land:preload:error");
}
