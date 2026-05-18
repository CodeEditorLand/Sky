/**
 * PostHog analytics bridge - semantic events by component.
 *
 * Guarded by import.meta.env.DEV - Vite dead-code-eliminates in production.
 *
 * Event taxonomy (filterable in PostHog by $component):
 *   land:exthost:*   - Extension host lifecycle, activation, errors
 *   land:cocoon:*    - Cocoon sidecar gRPC, bootstrap, health
 *   land:wind:*      - Wind service layer, Effect-TS bootstrap
 *   land:sky:*       - Sky rendering, Astro, Workbench DOM
 *   land:ipc:*       - IPC channel calls and failures
 *   land:vscode:*    - VS Code workbench internals
 *   land:console:*   - Intercepted console.error/warn
 *   land:resource:*  - Failed script/image/CSS loads
 *   land:boot:*      - Boot timing, navigation performance
 *   land:session:*   - Session start/end
 *
 * All events carry $component for PostHog filtering.
 * Marks are batched per-component (max 10 per flush, 2s window).
 * Errors always sent immediately via captureException.
 */

// Atom PH1: read configuration from `import.meta.env` injection set by
// astro.config.ts `vite.define`. Hardcoded fallback keeps a fresh clone
// working before `.env.Land.PostHog` is sourced.
const PostHogAPIKey =
	((import.meta.env as any).Authorize as string | undefined) ?? "";

const PostHogHost =
	((import.meta.env as any).Beam as string | undefined) ??
	"https://eu.i.posthog.com";

// `Capture=false` is the master telemetry kill switch shared with
// Mountain / Cocoon. Honored regardless of `Report` so a single env
// flip stops every Sky PostHog + OTLP emit. Distinct from
// `.env.Land.Diagnostics`'s `Disable` (polyfill / shim kill switch).
const TelemetryCaptureEnabled =
	((import.meta.env as any).Capture as string | undefined) !== "false";

const PostHogEnabled =
	TelemetryCaptureEnabled &&
	((import.meta.env as any).Report as string | undefined) !== "false";

// Atom PH2: Sky was hitting PostHog's built-in rate limiter (observed as
// `[PostHog.js] This capture call is ignored due to client rate limiting.`
// in the webview console). Apply our own rate cap + a larger batch window
// so we stay under the client-side limit without dropping the error path.
const PostHogMaxEventsPerSecond = Number(
	(import.meta.env as any).Throttle ?? "5",
);

const PostHogBatchWindowMs = Number((import.meta.env as any).Buffer ?? "3000");

const PostHogBatchMax = Number((import.meta.env as any).Batch ?? "20");

const PostHogDistinctIdSeed =
	((import.meta.env as any).Brand as string | undefined) ?? "";

const GetOrCreateSkyIdentifier = (): string => {
	const StorageKey = "land-posthog-id";

	const Existing = localStorage.getItem(StorageKey);

	if (Existing) return Existing;

	const Generated = `land-dev-sky-${Math.random().toString(36).slice(2, 10)}`;

	localStorage.setItem(StorageKey, Generated);

	return Generated;
};

const LoadPostHog = async (): Promise<any> => {
	if (!PostHogEnabled) return null;

	try {
		if ((window as any).posthog) return (window as any).posthog;

		const AssetsHost = PostHogHost.replace("://", "://")
			.replace("//eu.i.", "//eu-assets.i.")
			.replace("//us.i.", "//us-assets.i.");

		return await new Promise((Resolve) => {
			const Script = document.createElement("script");
			Script.src = `${AssetsHost}/static/array.js`;
			Script.async = true;
			Script.onload = () => {
				const PH = (window as any).posthog;
				if (PH) {
					PH.init(PostHogAPIKey, {
						api_host: PostHogHost,
						autocapture: false,
						capture_pageview: false,
						capture_pageleave: false,
						// Atom PH8: posthog-js's built-in exception
						// autocapture fires `$exception` events from
						// window.onerror / unhandledrejection without
						// the rich Error stack data, producing the
						// `$$_posthog_breakdown_null_$$` bucket on the
						// Exceptions Type Breakdown chart. Sky has its
						// own typed `land:resource:error` /
						// `land:error:rejection` handlers below that
						// preserve the message + source; turn the
						// SDK's built-in capture off so it stops
						// duplicating with null-property events.
						capture_uncaught_errors: false,
						capture_unhandled_promise_rejections: false,
						disable_session_recording:
							(import.meta.env as any).Replay === "true"
								? false
								: true,
						disable_surveys:
							(import.meta.env as any).Ask === "true"
								? false
								: true,
						advanced_disable_decide: true,
						disable_external_dependency_loading: true,
						persistence: "memory",
						// Atom PH2: reduce client-side rate-limit pressure.
						// posthog-js enforces a request rate internally;
						// these settings keep us well below its cap so the
						// `ignored due to client rate limiting` warning
						// stops firing.
						rate_limiting: {
							events_per_second: PostHogMaxEventsPerSecond,
							events_burst_limit: Math.max(
								10,

								PostHogMaxEventsPerSecond * 2,
							),
						},
						bootstrap: {
							distinctID: PostHogDistinctIdSeed
								? PostHogDistinctIdSeed
								: GetOrCreateSkyIdentifier(),
						},
						loaded: (Instance: any) => {
							Instance.register({
								$app: "fiddee",
								$app_version: "0.0.1",
								$build_mode: "debug",
								$platform: navigator.platform,
								$tier: "sky",
							});
							Resolve(Instance);
						},
					});
				} else {
					Resolve(null);
				}
			};
			Script.onerror = () => Resolve(null);
			document.head.appendChild(Script);
		});
	} catch {
		return null;
	}
};

// Component mapping: mark prefix → PostHog $component value
const ComponentMap: Record<string, string> = {
	exthost: "extension-host",

	cocoon: "cocoon",

	wind: "wind",

	sky: "sky",

	ipc: "ipc",

	vscode: "vscode",

	console: "vscode",

	resource: "sky",

	boot: "sky",

	session: "all",
};

interface BufferedMark {
	Name: string;

	Component: string;

	Category: string;

	Action: string;

	TimestampMs: number;

	DurationMs: number;

	Detail: unknown;
}

// Client-side throttle. posthog-js's CDN `array.js` ignores the
// `rate_limiting` config option; its internal limiter caps at
// 10 events per event-name per 10 s and silently drops overflow
// with the `ignored due to client rate limiting` console warning.
// Dropping here instead means the warning never fires AND the
// PostHog dashboard gets a single "dropped=N" reporting event
// per window so volume loss is visible.
//
// Exceptions share the posthog-js `$exception` event-name slot, so a
// single workbench boot's worth of CSP refusals / console.error /
// unhandledrejection callbacks used to blow straight through the
// 10 / 10 s cap. Throttle them by a stable signature (first 200 chars
// of the message) so unique exceptions still reach PostHog while
// bursts of the *same* exception collapse into one.
const ThrottleWindowMs = 10_000;

const ThrottleLimitPerName = Math.max(1, PostHogMaxEventsPerSecond * 2);

const ExceptionThrottleLimitPerSignature = Math.max(1, ThrottleLimitPerName);

// Global exception cap. posthog-js's CDN `array.js` enforces a hard
// 10 events / 10 s per event-name limit on `$exception` - all our
// `captureException` calls share that single slot regardless of
// signature. Without a *global* counter we can still flood the cap by
// firing 11 unique signatures × 1 each. Cap total exception captures
// to a value safely below posthog-js's own limit (7/10 s by default),
// leaving a margin for the `throttle-dropped` summary event and any
// explicit `PH.capture("land:*")` calls that happen to share the slot.
const ExceptionGlobalLimit = Math.max(
	1,

	Number((import.meta.env as any).Cap ?? "7"),
);

const ThrottleCounters = new Map<string, { Count: number; ResetAt: number }>();

const ThrottleDropped = new Map<string, number>();

const ExceptionCounters = new Map<string, { Count: number; ResetAt: number }>();

const ExceptionDropped = new Map<string, number>();

let ExceptionGlobalCount = 0;

let ExceptionGlobalResetAt = 0;

let ExceptionGlobalDropped = 0;

const ShouldThrottle = (Name: string): boolean => {
	const Now = Date.now();

	const Entry = ThrottleCounters.get(Name);

	if (!Entry || Entry.ResetAt <= Now) {
		ThrottleCounters.set(Name, {
			Count: 1,
			ResetAt: Now + ThrottleWindowMs,
		});

		return false;
	}

	Entry.Count += 1;

	if (Entry.Count > ThrottleLimitPerName) {
		ThrottleDropped.set(Name, (ThrottleDropped.get(Name) ?? 0) + 1);

		return true;
	}

	return false;
};

// Build a stable signature for an exception. Uses the first 200 chars of the
// message (or the `String(Error)` fallback) so identical errors from
// different call sites still collapse onto one counter. Avoids stack-trace
// fingerprinting because addresses / minified names drift between builds.
const ExceptionSignature = (Error: unknown): string => {
	if (Error && typeof Error === "object" && "message" in Error) {
		const Message = String((Error as { message: unknown }).message ?? "");

		return Message.slice(0, 200) || "unknown";
	}

	return String(Error).slice(0, 200) || "unknown";
};

const ShouldThrottleException = (Signature: string): boolean => {
	const Now = Date.now();

	// Global exception cap first - posthog-js's `$exception` slot fills
	// up regardless of signature, so a diverse-error boot can still
	// blow through the CDN limiter unless the *total* is capped.
	if (ExceptionGlobalResetAt <= Now) {
		ExceptionGlobalCount = 1;

		ExceptionGlobalResetAt = Now + ThrottleWindowMs;
	} else {
		ExceptionGlobalCount += 1;

		if (ExceptionGlobalCount > ExceptionGlobalLimit) {
			ExceptionGlobalDropped += 1;

			return true;
		}
	}

	const Entry = ExceptionCounters.get(Signature);

	if (!Entry || Entry.ResetAt <= Now) {
		ExceptionCounters.set(Signature, {
			Count: 1,
			ResetAt: Now + ThrottleWindowMs,
		});

		return false;
	}

	Entry.Count += 1;

	if (Entry.Count > ExceptionThrottleLimitPerSignature) {
		ExceptionDropped.set(
			Signature,

			(ExceptionDropped.get(Signature) ?? 0) + 1,
		);

		return true;
	}

	return false;
};

const DrainThrottleMetrics = (PH: any): void => {
	if (
		ThrottleDropped.size === 0 &&
		ExceptionDropped.size === 0 &&
		ExceptionGlobalDropped === 0
	) {
		return;
	}

	const Summary: Record<string, number> = {};

	for (const [Name, Count] of ThrottleDropped.entries()) {
		Summary[Name] = Count;
	}

	ThrottleDropped.clear();

	const ExceptionSummary: Record<string, number> = {};

	for (const [Signature, Count] of ExceptionDropped.entries()) {
		ExceptionSummary[Signature] = Count;
	}

	ExceptionDropped.clear();

	const GlobalDropped = ExceptionGlobalDropped;

	ExceptionGlobalDropped = 0;

	// Single event per window - counted as one against the
	// throttle itself, so always safe under the limit.
	try {
		PH.capture?.("land:sky:throttle-dropped", {
			$component: "sky",
			dropped: Summary,
			dropped_exceptions: ExceptionSummary,
			dropped_exceptions_global: GlobalDropped,
			exception_global_limit: ExceptionGlobalLimit,
			window_ms: ThrottleWindowMs,
		});
	} catch {}
};

const Initialize = async (): Promise<void> => {
	// Belt-and-braces production gate. The single caller below is already
	// wrapped in `if (import.meta.env.DEV) {...}`, but Vite's tree-shake
	// only drops Initialize entirely when nothing else references it.
	// Adding the inner gate guarantees every string literal / object
	// payload constructed from this point on is dead-coded by Vite even
	// if a future caller forgets the outer gate.
	if (!import.meta.env.DEV) return;

	const Raw = await LoadPostHog();

	if (!Raw) return;

	// Wrap `capture` + `captureException` with the throttle so every
	// consumer in this module (and anywhere else that uses the
	// returned `PH` handle) gets the same drop semantics.
	const PH: any = {
		...Raw,

		capture: (Name: string, Properties?: Record<string, unknown>) => {
			if (ShouldThrottle(Name)) return;

			return Raw.capture(Name, Properties);
		},

		captureException: (
			Error: unknown,

			Properties?: Record<string, unknown>,
		) => {
			// Exceptions share the posthog-js `$exception` event-name
			// slot for the purposes of its internal limiter, so a
			// bursty stream (workbench boot produces dozens of
			// duplicate CSP refusals, hook callbacks, etc.) used to
			// blow through the 10/10 s cap and surface as
			// "ignored due to client rate limiting" in the webview
			// console. Collapse by message signature here so unique
			// exceptions still reach PostHog and bursts of the same
			// error show up as a single `throttle-dropped` summary.
			const Signature = ExceptionSignature(Error);

			if (ShouldThrottleException(Signature)) return;

			return Raw.captureException(Error, Properties);
		},
	};

	// Periodic drain of dropped-event counters so the PostHog
	// dashboard sees *that* we dropped events even when every
	// capture of the affected name was rate-limited.
	const DrainTimer = setInterval(
		() => DrainThrottleMetrics(Raw),

		ThrottleWindowMs,
	);

	(DrainTimer as unknown as { unref?: () => void }).unref?.();

	// Wire up Output's polyfill telemetry hook. The polyfills load
	// long before this bridge runs, so they install
	// `globalThis.__LAND_POLYFILL_TELEMETRY__` early as a no-op and we
	// swap in a real handler here. Categories are kept low-cardinality
	// (e.g. `ipc.fire-and-forget`, `polyfill.install`) so the
	// `$exception` slot can be grouped sensibly in PostHog. The detail
	// payload is passed through under `polyfill_*` properties so it
	// doesn't collide with PH's reserved `$exception_*` keys.
	const PolyfillTelemetry = (
		globalThis as {
			__LAND_POLYFILL_TELEMETRY__?: {
				Set: (
					H: (
						Category: string,

						Error: unknown,

						Detail?: Record<string, unknown>,
					) => void,
				) => void;
			};
		}
	).__LAND_POLYFILL_TELEMETRY__;

	PolyfillTelemetry?.Set((Category, RawError, Detail) => {
		const ErrorObj =
			RawError instanceof Error
				? RawError
				: new Error(
						typeof RawError === "string"
							? RawError
							: `polyfill[${Category}] failure`,
					);
		const Properties: Record<string, unknown> = {
			polyfill_category: Category,
			$exception_type: `land:polyfill:${Category}`,
			$exception_origin: "polyfill",
		};
		if (Detail) {
			for (const [Key, Value] of Object.entries(Detail)) {
				Properties[`polyfill_${Key.toLowerCase()}`] = Value;
			}
		}
		PH.captureException(ErrorObj, Properties);
	});

	// Per-component buffers - flushed independently
	const Buffers = new Map<string, BufferedMark[]>();

	const Timers = new Map<string, ReturnType<typeof setTimeout>>();

	const MaxPerFlush = PostHogBatchMax;

	const FlushComponent = (Component: string) => {
		Timers.delete(Component);

		const Buffer = Buffers.get(Component);

		if (!Buffer || Buffer.length === 0) return;

		const Marks = Buffer.splice(0);

		// Split into chunks of MaxPerFlush
		for (let I = 0; I < Marks.length; I += MaxPerFlush) {
			const Chunk = Marks.slice(I, I + MaxPerFlush);

			PH.capture(`land:${Component}:marks`, {
				$component: Component,
				marks: Chunk,
				mark_count: Chunk.length,
				first_mark_ms: Chunk[0]?.TimestampMs,
				last_mark_ms: Chunk[Chunk.length - 1]?.TimestampMs,
			});
		}
	};

	const FlushAll = () => {
		for (const Component of Buffers.keys()) {
			FlushComponent(Component);
		}
	};

	const BufferMark = (Mark: BufferedMark) => {
		const Component = Mark.Component;

		if (!Buffers.has(Component)) Buffers.set(Component, []);

		Buffers.get(Component)!.push(Mark);

		if (!Timers.has(Component)) {
			Timers.set(
				Component,

				setTimeout(
					() => FlushComponent(Component),

					PostHogBatchWindowMs,
				),
			);
		}
	};

	// PerformanceObserver - routes to component buffers
	const Observer = new PerformanceObserver((List) => {
		for (const Entry of List.getEntries()) {
			if (!Entry.name.startsWith("land:")) continue;

			const Parts = Entry.name.split(":");
			const Category = Parts[1] || "unknown";
			const Action = Parts.slice(2).join(":");
			const Component = ComponentMap[Category] || "all";
			const IsError = Entry.name.includes("error");

			if (IsError) {
				// Errors sent immediately with full component context
				PH.captureException(new Error(Entry.name), {
					$component: Component,
					$exception_type: `land:${Category}`,
					$exception_message: Action,
					$exception_origin: "performance.mark",
					timestamp_ms: performance.timeOrigin + Entry.startTime,
					detail: (Entry as any).detail,
				});
			} else {
				BufferMark({
					Name: Entry.name,
					Component,
					Category,
					Action,
					TimestampMs: performance.timeOrigin + Entry.startTime,
					DurationMs:
						Entry.entryType === "measure"
							? (Entry as PerformanceMeasure).duration
							: 0,
					Detail: (Entry as any).detail,
				});
			}
		}
	});

	Observer.observe({ type: "mark", buffered: true });

	Observer.observe({ type: "measure", buffered: true });

	addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") FlushAll();
	});

	// === Error capture: window.onerror ===
	window.addEventListener("error", (Event) => {
		if (!Event.message || Event.message === "Script error.") return;
		PH.captureException(Event.error || new Error(Event.message), {
			$component: "vscode",
			$exception_source: Event.filename,
			$exception_lineno: Event.lineno,
			$exception_colno: Event.colno,
			$exception_origin: "window.onerror",
		});
	});

	// === Error capture: unhandled promise rejections ===
	window.addEventListener("unhandledrejection", (Event) => {
		const Reason = Event.reason;
		if (!Reason) return;
		const Message = String(Reason.message || Reason);
		if (Message.includes("Canceled")) return;
		PH.captureException(
			Reason instanceof Error ? Reason : new Error(Message),

			{
				$component: "vscode",
				$exception_origin: "unhandledrejection",
			},
		);
	});

	// === Error capture: console.error → PostHog + OTEL ===
	const OriginalConsoleError = console.error;

	let ConsoleErrorCount = 0;

	console.error = (...Args: unknown[]) => {
		OriginalConsoleError.apply(console, Args);

		ConsoleErrorCount++;

		const Message = Args.map(String).join(" ").slice(0, 500);

		if (
			Message.includes("Canceled") ||
			Message.includes("[PostHog.js]") ||
			Message.includes("sourceMappingURL")
		)
			return;

		try {
			performance.mark("land:console:error", {
				detail: { message: Message, count: ConsoleErrorCount },
			});
		} catch {}

		PH.captureException(new Error(Message), {
			$component: "vscode",
			$exception_origin: "console.error",
			$exception_count: ConsoleErrorCount,
		});
	};

	// === Warning capture: console.warn → OTEL only ===
	const OriginalConsoleWarn = console.warn;

	let ConsoleWarnCount = 0;

	console.warn = (...Args: unknown[]) => {
		OriginalConsoleWarn.apply(console, Args);

		ConsoleWarnCount++;

		const Message = Args.map(String).join(" ").slice(0, 500);

		try {
			performance.mark("land:console:warn", {
				detail: { message: Message, count: ConsoleWarnCount },
			});
		} catch {}
	};

	// === VS Code error hook ===
	(window as any)._Catch = (Error: unknown) => {
		const Message =
			Error instanceof globalThis.Error ? Error.message : String(Error);

		PH.captureException(
			Error instanceof globalThis.Error
				? Error
				: new globalThis.Error(Message),

			{
				$component: "vscode",
				$exception_origin: "vscode.onUnexpectedError",
			},
		);

		try {
			performance.mark("land:vscode:error", {
				detail: { message: Message.slice(0, 200) },
			});
		} catch {}
	};

	// === Resource load failures (capture phase) ===
	window.addEventListener(
		"error",

		(Event) => {
			const Target = Event.target as HTMLElement;
			if (Target && Target !== window && "src" in Target) {
				PH.capture("land:resource:error", {
					$component: "sky",
					tag: Target.tagName,
					src: (Target as HTMLScriptElement).src?.slice(0, 200),
				});
				try {
					performance.mark("land:resource:error", {
						detail: {
							tag: Target.tagName,
							src: (Target as HTMLScriptElement).src?.slice(
								0,

								200,
							),
						},
					});
				} catch {}
			}
		},

		true,
	);

	// === Boot timing ===
	window.addEventListener("load", () => {
		const Navigation = performance.getEntriesByType(
			"navigation",
		)[0] as PerformanceNavigationTiming;
		if (Navigation) {
			PH.capture("land:boot:timing", {
				$component: "sky",
				dom_interactive_ms: Navigation.domInteractive,
				dom_complete_ms: Navigation.domComplete,
				load_event_ms: Navigation.loadEventEnd,
				ttfb_ms: Navigation.responseStart - Navigation.requestStart,
			});
		}
	});

	// === Session lifecycle ===
	addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") {
			PH.capture("land:session:end", {
				$component: "all",
				console_errors: ConsoleErrorCount,
				console_warns: ConsoleWarnCount,
			});
		}
	});

	PH.capture("land:session:start", { $component: "all" });
};

if (import.meta.env.DEV) {
	Initialize().catch(() => {});
}

export default {};
