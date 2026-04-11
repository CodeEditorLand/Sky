/**
 * Build-baked PostHog analytics bridge (debug builds only).
 *
 * Guarded by import.meta.env.DEV — Vite dead-code-eliminates in production.
 * Captures:
 * - All land:* performance marks (same as OTELBridge but for PostHog)
 * - Unhandled errors and rejections (error tracking)
 * - Page lifecycle events (load, visibility)
 * - Custom IPC command timing
 *
 * PostHog project: codeeditorland (debug only — no production telemetry).
 * Uses posthog-js loaded from CDN to avoid bundling in production.
 */

const PostHogAPIKey = "phc_mCwHy7LgvbnEqh6a2DyMiLUJcaZvmmj7JNmmpQzvr7mA";
const PostHogHost = "https://eu.i.posthog.com";

// Load posthog-js from CDN — no npm dependency, tree-shaken in prod
const LoadPostHog = async (): Promise<any> => {
	try {
		// Check if already loaded (e.g. by another script)
		if ((window as any).posthog) return (window as any).posthog;

		// Dynamic script injection — no bundler dependency
		// Gracefully returns null if CSP blocks the CDN or network fails
		return await new Promise((Resolve) => {
			const Script = document.createElement("script");
			Script.src = "https://eu-assets.i.posthog.com/static/array.js";
			Script.async = true;
			Script.onload = () => {
				const PH = (window as any).posthog;
				if (PH) {
					PH.init(PostHogAPIKey, {
						api_host: PostHogHost,
						autocapture: false,
						capture_pageview: false,
						capture_pageleave: false,
						disable_session_recording: true,
						persistence: "memory",
						bootstrap: {
							distinctID: `land-dev-${Date.now()}`,
						},
						loaded: (Instance: any) => {
							Instance.register({
								$app: "land-editor",
								$app_version: "0.0.1",
								$build_mode: "debug",
								$platform: navigator.platform,
							});
							Resolve(Instance);
						},
					});
				} else {
					Resolve(null);
				}
			};
			Script.onerror = () => Resolve(null); // CSP block or network fail — degrade silently
			document.head.appendChild(Script);
		});
	} catch {
		return null;
	}
};

// Initialize PostHog and start capturing
const Initialize = async (): Promise<void> => {
	const PH = await LoadPostHog();
	if (!PH) return;

	// Batch performance marks to avoid rate limiting.
	// Collects marks for 2 seconds, then flushes as a single event.
	let MarkBuffer: Array<{
		Name: string;
		Category: string;
		Action: string;
		TimestampMs: number;
		DurationMs: number;
		Detail: unknown;
	}> = [];
	let FlushTimer: ReturnType<typeof setTimeout> | null = null;

	const FlushMarks = () => {
		FlushTimer = null;
		if (MarkBuffer.length === 0) return;

		const Marks = MarkBuffer;
		MarkBuffer = [];

		PH.capture("land:boot_marks", {
			marks: Marks,
			mark_count: Marks.length,
			first_mark_ms: Marks[0]?.TimestampMs,
			last_mark_ms: Marks[Marks.length - 1]?.TimestampMs,
		});
	};

	const Observer = new PerformanceObserver((List) => {
		for (const Entry of List.getEntries()) {
			if (!Entry.name.startsWith("land:")) continue;

			const IsError = Entry.name.includes("error");
			const Parts = Entry.name.split(":");
			const Category = Parts[1] || "unknown";
			const Action = Parts.slice(2).join(":");

			if (IsError) {
				// Errors always sent immediately
				PH.captureException(new Error(Entry.name), {
					$exception_type: `land:${Category}`,
					$exception_message: Action,
					timestamp_ms: performance.timeOrigin + Entry.startTime,
					detail: (Entry as any).detail,
				});
			} else {
				// Buffer regular marks
				MarkBuffer.push({
					Name: Entry.name,
					Category,
					Action,
					TimestampMs: performance.timeOrigin + Entry.startTime,
					DurationMs:
						Entry.entryType === "measure"
							? (Entry as PerformanceMeasure).duration
							: 0,
					Detail: (Entry as any).detail,
				});

				if (!FlushTimer) {
					FlushTimer = setTimeout(FlushMarks, 2000);
				}
			}
		}
	});

	Observer.observe({ type: "mark", buffered: true });
	Observer.observe({ type: "measure", buffered: true });

	// Flush remaining marks on page hide
	addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden" && MarkBuffer.length > 0) {
			FlushMarks();
		}
	});

	// Capture unhandled errors
	window.addEventListener("error", (Event) => {
		if (!Event.message || Event.message === "Script error.") return;
		PH.captureException(
			Event.error || new Error(Event.message),
			{
				$exception_source: Event.filename,
				$exception_lineno: Event.lineno,
				$exception_colno: Event.colno,
			},
		);
	});

	window.addEventListener("unhandledrejection", (Event) => {
		const Reason = Event.reason;
		if (!Reason) return;
		const Message = String(Reason.message || Reason);
		if (
			Message.includes("Canceled") ||
			Message.includes("FileNotFound") ||
			Message.includes("No such file or directory")
		)
			return;
		PH.captureException(Reason instanceof Error ? Reason : new Error(Message));
	});

	// Capture boot timing
	window.addEventListener("load", () => {
		const Navigation = performance.getEntriesByType(
			"navigation",
		)[0] as PerformanceNavigationTiming;
		if (Navigation) {
			PH.capture("land:boot:timing", {
				dom_interactive_ms: Navigation.domInteractive,
				dom_complete_ms: Navigation.domComplete,
				load_event_ms: Navigation.loadEventEnd,
				ttfb_ms: Navigation.responseStart - Navigation.requestStart,
			});
		}
	});

	// Flush on page hide
	addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") {
			PH.capture("land:session:end");
		}
	});

	PH.capture("land:session:start");
};

if (import.meta.env.DEV) {
	Initialize().catch(() => {});
}

export default {};
