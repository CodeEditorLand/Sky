/**
 * browser-proxy-bootstrap.ts - Effect-TS bootstrap script for Browser Proxy
 *
 * This script runs the Wind Effect-TS bootstrap which initializes all
 * Wind services and verifies their health.
 */

interface BootstrapStage {
	success: boolean;
	stageName: string;
	duration: number;
}

interface BootstrapResult {
	success: boolean;
	totalDuration: number;
	stages: BootstrapStage[];
	error?: unknown;
}

console.log("[BrowserProxy] ===== Starting Wind Effect-TS bootstrap =====");

try {
	const { runBootstrap } =
		await import("@codeeditorland/wind/Target/Effect/Bootstrap");

	console.log("[BrowserProxy] ✓ Bootstrap module loaded successfully");

	// Run the bootstrap with options
	const bootstrapResult: BootstrapResult = await runBootstrap({
		skipHealthCheck: false,
		debugMode: true,
	});

	if (bootstrapResult.success) {
		console.log("[BrowserProxy] ✓ Bootstrap completed successfully");
		console.log(
			"[BrowserProxy] - Total duration:",
			bootstrapResult.totalDuration,
			"ms",
		);

		// Log individual stage results
		bootstrapResult.stages.forEach(function (stage: BootstrapStage) {
			const status = stage.success ? "✓" : "✗";
			console.log(
				`[BrowserProxy] - ${status} ${stage.stageName}: ${stage.duration}ms`,
			);
		});
	} else {
		console.error(
			"[BrowserProxy] ✗ Bootstrap failed:",
			bootstrapResult.error,
		);
	}
} catch (error: unknown) {
	console.error("[BrowserProxy] ✗ Failed to load/run bootstrap:", error);
}

console.log("[BrowserProxy] ===== Wind bootstrap sequence complete =====");

export default {};
