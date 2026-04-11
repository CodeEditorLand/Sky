/**
 * Effect-TS bootstrap for Electron workbench (A3).
 * Zero console.* output. Results captured via performance.mark().
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

try {
	performance.mark("land:bootstrap:start");

	const { runBootstrap } =
		await import("@codeeditorland/wind/Target/Effect/Bootstrap");
	const { Effect } = await import("effect");

	const BootstrapResult: BootstrapResult = await Effect.runPromise(
		runBootstrap({
			skipHealthCheck: true,
			debugMode: true,
		}),
	);

	performance.mark("land:bootstrap:done", {
		detail: {
			success: BootstrapResult.success,
			duration: BootstrapResult.totalDuration,
			stages: BootstrapResult.stages.map((S: BootstrapStage) => `${S.stageName}:${S.success ? "ok" : "fail"}:${S.duration}ms`),
		},
	});
	performance.measure("land:bootstrap", "land:bootstrap:start", "land:bootstrap:done");
} catch {
	performance.mark("land:bootstrap:error");
}

export default {};
