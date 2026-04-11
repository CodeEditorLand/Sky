/**
 * Build-baked PostHog analytics bridge (debug builds only).
 *
 * Injected by Sky's build when On=true (dev). Tree-shaken in production.
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
		return new Promise((Resolve, Reject) => {
			const Script = document.createElement("script");
			Script.src = "https://eu-assets.i.posthog.com/static/array.js";
			Script.async = true;
			Script.onload = () => {
				const PH = (window as any).posthog;
				if (PH) {
					PH.init(PostHogAPIKey, {
						api_host: PostHogHost,
						autocapture: false, // No click tracking in editor
						capture_pageview: false, // SPA — manual pageviews
						capture_pageleave: false,
						persistence: "memory", // No cookies/localStorage in debug
						bootstrap: {
							distinctID: `land-dev-${Date.now()}`,
						},
						loaded: (Instance: any) => {
							// Tag all events with debug context
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
					Reject(new Error("posthog not found after script load"));
				}
			};
			Script.onerror = () => Reject(new Error("Failed to load posthog-js"));
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

	// Capture performance marks as PostHog events
	const Observer = new PerformanceObserver((List) => {
		for (const Entry of List.getEntries()) {
			if (!Entry.name.startsWith("land:")) continue;

			const IsError = Entry.name.includes("error");
			const Parts = Entry.name.split(":");
			const Category = Parts[1] || "unknown";
			const Action = Parts.slice(2).join(":");

			if (IsError) {
				// Error tracking — capture as exception
				PH.captureException(new Error(Entry.name), {
					$exception_type: `land:${Category}`,
					$exception_message: Action,
					timestamp_ms: performance.timeOrigin + Entry.startTime,
					detail: (Entry as any).detail,
				});
			} else {
				// Regular event
				PH.capture(`land:${Category}`, {
					action: Action,
					mark_name: Entry.name,
					timestamp_ms: performance.timeOrigin + Entry.startTime,
					duration_ms:
						Entry.entryType === "measure"
							? (Entry as PerformanceMeasure).duration
							: 0,
					detail: (Entry as any).detail,
				});
			}
		}
	});

	Observer.observe({ type: "mark", buffered: true });
	Observer.observe({ type: "measure", buffered: true });

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

Initialize();

export default {};
