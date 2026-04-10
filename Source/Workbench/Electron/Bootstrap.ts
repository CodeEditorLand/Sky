/**
 * Effect-TS bootstrap script for Electron workbench (A3)
 *
 * runBootstrap() returns an Effect, not a Promise.
 * Must be executed via Effect.runPromise().
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

console.log("[Electron] ===== Starting Wind Effect-TS bootstrap =====");

try {
	const { runBootstrap } =
		await import("@codeeditorland/wind/Target/Effect/Bootstrap");
	const { Effect } = await import("effect");

	console.log("[Electron] Bootstrap module loaded successfully");

	// runBootstrap returns an Effect — run it via Effect.runPromise.
	// skipHealthCheck: true because the minimal layer (TelemetryLive only)
	// doesn't provide HealthTag, EnvironmentTag, etc. Individual stages
	// catch their own errors gracefully.
	const BootstrapResult: BootstrapResult = await Effect.runPromise(
		runBootstrap({
			skipHealthCheck: true,
			debugMode: true,
		}),
	);

	if (BootstrapResult.success) {
		console.log("[Electron] Bootstrap completed successfully");
		console.log(
			"[Electron] - Total duration:",
			BootstrapResult.totalDuration,
			"ms",
		);

		// Log individual stage results
		BootstrapResult.stages.forEach((Stage: BootstrapStage) => {
			const Status = Stage.success ? "OK" : "FAIL";
			console.log(
				`[Electron] - ${Status} ${Stage.stageName}: ${Stage.duration}ms`,
			);
		});
	} else {
		console.error("[Electron] Bootstrap failed:", BootstrapResult.error);
	}
} catch (Error: unknown) {
	console.error("[Electron] Failed to load/run bootstrap:", Error);
}

console.log("[Electron] ===== Wind bootstrap sequence complete =====");

export default {};
