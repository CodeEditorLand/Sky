/**
 * @module Sky/Bridge/InstallTests
 * @description
 * Receives test-controller lifecycle events from Mountain/Cocoon and relays
 * them to the VS Code workbench Testing panel. When an extension registers a
 * TestController via `vscode.tests.createTestController(id, label)` and
 * creates test runs, Cocoon forwards the lifecycle events to Mountain, which
 * emits `sky://tests/*` Tauri events. This bridge receives those events and
 * publishes them as `cel:tests:*` DOM CustomEvents for workbench consumers.
 *
 * ## `ITestService` availability
 *
 * The VS Code workbench's `ITestService` is now exposed as
 * `globalThis.__CEL_SERVICES__.TestService` via
 * `Output/Source/Service/CEL/Expose/Accessor.ts`. This bridge:
 *  1. Dispatches `cel:tests:*` DOM CustomEvents so any Sky-side
 *     consumer (future Testing viewlet, monaco contribution) can
 *     react.
 *  2. Probes `__CEL_SERVICES__?.TestService` and, if found, invokes
 *     native `ITestService` methods (the probe path makes this
 *     forward-compatible - no code change needed once the workbench
 *     plugin exposes the service).
 *  3. Logs via `MountainIPCInvoke` when a service is missing so the gap
 *     is visible in Mountain's dev log.
 */

type Handler = (Payload: any) => void;

/**
 * Check whether `ITestService` is available. Returns the service
 * object or `null` so callers can gracefully degrade.
 */
const GetTestService = (): any => {

	try {
		const Services = (globalThis as any).__CEL_SERVICES__;

		return Services?.TestService ?? null;
	} catch {
		return null;
	}
};

/**
 * Forward test lifecycle data to `ITestService` if available. Wraps
 * every method call in try/catch so one bad shape doesn't silence the
 * rest of the bridge.
 */
const ForwardToWorkbench = (Method: string, Args: any[]): void => {

	const Svc = GetTestService();

	if (!Svc) return;

	try {
		const Fn = Svc[Method];

		if (typeof Fn === "function") {
			Fn.apply(Svc, Args);
		}
	} catch {
		/* swallow - service method may not exist or shape may differ */
	}
};

/**
 * Log a diagnostic message to Mountain for post-mortem analysis.
 */
const ToMountain = (Tag: string, Message: string): void => {

	try {
		const Inv =
			(globalThis as any).__TAURI__?.core?.invoke ??
			(globalThis as any).__TAURI__?.invoke;

		if (typeof Inv === "function") {
			Inv("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [Tag, Message],
			}).catch(() => {});
		}
	} catch {
		/* swallow */
	}
};

/**
 * A new TestController was created via `vscode.tests.createTestController(id, label)`.
 * Cocoon stores the controller state in `Context.ExtensionRegistry` and forwards
 * the creation notification so Sky can prepare the Testing panel.
 */
const HandleControllerCreated: Handler = (Payload: any): void => {

	try {
		document.dispatchEvent(
			new CustomEvent("cel:tests:controller-created", {
				detail: Payload,
			}),
		);
	} catch {
		/* swallow */
	}

	const Svc = GetTestService();

	if (!Svc) {
		let Logged = false;

		try {
			Logged = !!(globalThis as any).__CEL_TESTS_GAP_LOGGED;
		} catch {
			/* use default false */
		}

		if (!Logged) {
			ToMountain(
				"sky-bridge",

				"[Sky:Tests] ITestService not exposed in __CEL_SERVICES__ - test lifecycle dispatched as cel:tests:* DOM events only (no Testing panel rendering)",
			);

			try {
				(globalThis as any).__CEL_TESTS_GAP_LOGGED = true;
			} catch {
				/* best effort */
			}
		}

		return;
	}

	try {
		const { controllerId, label } = Payload ?? {};

		if (typeof Svc.registerTestController === "function") {
			Svc.registerTestController(controllerId, label);
		}
	} catch (Error) {
		ToMountain(
			"sky-bridge",

			`[Sky:Tests] HandleControllerCreated failed: ${String(Error)}`,
		);
	}
};

/**
 * A TestRun has started. Extensions call `controller.createTestRun(request, name)`
 * which Cocoon forwards through Mountain → `sky://tests/run-started`.
 */
const HandleRunStarted: Handler = (Payload: any): void => {

	try {
		document.dispatchEvent(
			new CustomEvent("cel:tests:run-started", {
				detail: Payload,
			}),
		);
	} catch {
		/* swallow */
	}

	ForwardToWorkbench("onTestRunStarted", [Payload]);
};

/**
 * A TestRun has ended (`run.end()` called). Cocoon's `MakeTestRun.end()`
 * emits `tests.didChangeTestResults` with accumulated results.
 */
const HandleRunEnded: Handler = (Payload: any): void => {

	try {
		document.dispatchEvent(
			new CustomEvent("cel:tests:run-ended", {
				detail: Payload,
			}),
		);
	} catch {
		/* swallow */
	}

	ForwardToWorkbench("onTestRunEnded", [Payload]);
};

/**
 * Individual test result state change (passed/failed/errored/skipped/queued/started).
 * Extensions call `run.passed(item)`, `run.failed(item, message)`, etc. which Cocoon
 * accumulates in the run's Results map. Forwarded per-item so the Testing panel can
 * update tree node icons incrementally rather than waiting for `run.end()`.
 */
const HandleTestResult: Handler = (Payload: any): void => {

	try {
		document.dispatchEvent(
			new CustomEvent("cel:tests:result", {
				detail: Payload,
			}),
		);
	} catch {
		/* swallow */
	}

	ForwardToWorkbench("onTestResult", [Payload]);
};

/**
 * Probe `ITestService` availability at install time so the one-shot
 * gap log fires as early as possible (before any extension creates a
 * test controller).
 */
const ProbeTestService = (): void => {

	const Svc = GetTestService();

	if (Svc) {
		const Methods = Object.keys(Svc)
			.filter((K) => typeof Svc[K] === "function")
			.join(",");

		ToMountain(
			"cel-services",

			`TestService=object methods=${Methods || "(none)"}`,
		);
	}
};

/**
 * Register test-related channel handlers.
 *
 * Channels:
 *   - `sky://tests/controller-created` → new TestController created
 *   - `sky://tests/run-started`         → TestRun.begin() / run start
 *   - `sky://tests/run-ended`           → TestRun.end() with results
 *   - `sky://tests/result`              → per-item state change
 */
export default async (Dependencies: {
	Register: (Channel: string, Handler: Handler) => Promise<void>;
}): Promise<void> => {

	const { Register } = Dependencies;

	ProbeTestService();

	await Register("sky://tests/controller-created", HandleControllerCreated);

	await Register("sky://tests/run-started", HandleRunStarted);

	await Register("sky://tests/run-ended", HandleRunEnded);

	await Register("sky://tests/result", HandleTestResult);
};
