/**
 * Wind preload for BrowserProxy workbench (A1).
 * Zero console.* output. Tracing via performance.mark().
 */

import Install from "@codeeditorland/wind/Target/Function/Install/Function/Install";

try {
	performance.mark("land:browserproxy:preload:start");
	await Install();
	performance.mark("land:browserproxy:preload:done");
} catch {
	performance.mark("land:browserproxy:preload:error");
}
