/**
 * Effect-TS bootstrap for Electron workbench (A3).
 * Zero console.* output. Results captured via performance.mark().
 *
 * Atom N2: when `Render` is false at build time, the Wind
 * bootstrap is replaced with a single performance-mark so the workbench
 * loads the native VS Code stack with no Effect-TS service layer on top.
 * Useful for "Mountain + bare workbench" integration tests and for the
 * smallest shippable surface where gRPC/Tauri IPC isn't desired.
 *
 * Vite inlines `import.meta.env.Render` at build time - the
 * inline comparison drops the entire import chain when the flag is
 * `"false"`, so tree-shaking removes the Wind bundle from production.
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

if (import.meta.env["Render"] === "false") {

	performance.mark("land:bootstrap:skipped-wind-disabled");
} else {

	try {
		performance.mark("land:bootstrap:start");

		const { runBootstrap } =
			await import("@codeeditorland/wind/Target/Element/Wind/Source/Effect/Bootstrap");

		const { Effect } = await import("effect");

		const BootstrapResult: BootstrapResult = await runBootstrap({
				skipHealthCheck: true,
				debugMode: true,
			});

		performance.mark("land:bootstrap:done", {
			detail: {
				success: BootstrapResult.success,
				duration: BootstrapResult.totalDuration,
				stages: BootstrapResult.stages.map(
					(S: BootstrapStage) =>
						`${S.stageName}:${S.success ? "ok" : "fail"}:${S.duration}ms`,
				),
			},
		});

		performance.measure(
			"land:bootstrap",

			"land:bootstrap:start",

			"land:bootstrap:done",
		);

		// Wave 7: subscribe to Mountain's extension install/uninstall events
		// so the sidebar refreshes live after a VSIX install (K2/K3) - no
		// workbench reload required. Fire-and-forget; the subscriber logs
		// its own performance.mark on start / error / skipped states.
		const { default: StartExtensionSubscriber } =
			await import("./Extension/Change/Subscriber.js");

		void StartExtensionSubscriber();

		// B7-S6: Initialize Mist WebSocket for direct Sky<->Cocoon path.
		void (async () => {
			try {
				const { invoke } = await import("@tauri-apps/api/core");

				const WsCfg = await invoke<{ port: number; secret: string }>(
					"MountainIPCInvoke",

					{ method: "nativeHost:getWebSocketConfig", params: [] },
				);

				if (WsCfg?.port && WsCfg.port > 0 && WsCfg.secret) {
					const { InitializeWebSocket } = await import(
						"@codeeditorland/wind/Target/Element/Wind/Source/Service/TauriMainProcessService"
					);

					InitializeWebSocket(WsCfg.port, WsCfg.secret);
				}
			} catch {}
		})();
	} catch {
		performance.mark("land:bootstrap:error");
	}
}

export default {};
