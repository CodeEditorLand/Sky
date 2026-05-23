/**
 * Build-baked OTEL bridge.
 *
 * Guarded by import.meta.env.DEV - Vite dead-code-eliminates in production.
 * No runtime SDK, no window.__Trace checks.
 *
 * How it works:
 * 1. PerformanceObserver watches all `land:*` marks and measures
 * 2. Batches them into OTLP-compatible spans
 * 3. Sends via fetch to the local OTLP collector every 2s
 * 4. Falls back to console.debug if no collector is running
 *
 * OTLP endpoint: http://localhost:4318/v1/traces (standard OTLP/HTTP)
 * Start Jaeger with CORS enabled:
 *   docker run -e COLLECTOR_OTLP_HTTP_CORS_ALLOWED_ORIGINS='*' \
 *     -e COLLECTOR_OTLP_HTTP_CORS_ALLOWED_HEADERS='Content-Type' \
 *     -p 4318:4318 -p 16686:16686 jaegertracing/jaeger:2
 */

const ServiceName = "fiddee";

const ServiceVersion = "0.0.1";

// `Capture=false` is the master telemetry kill shared with Mountain /
// Cocoon. `OTLPEnabled=false` disables only this pipe.
// Default is "false" so telemetry is completely disabled unless
// explicitly opted in.
const TelemetryCaptureEnabled =
	((import.meta.env as Record<string, string | undefined>)["Capture"] ??
		"false") === "true";

const OTLPPipeEnabled =
	TelemetryCaptureEnabled &&
	((import.meta.env as Record<string, string | undefined>)["OTLPEnabled"] ??
		"false") === "true";

// Build-baked endpoint from `import.meta.env.OTLPEndpoint`
// (`astro.config.ts` Vite define). Falls back to the docker-compose
// default if the env var is missing. In the Vite dev server, `/v1/traces`
// is proxied; in Tauri desktop it must be the real collector URL.
const ConfiguredOTLPEndpoint =
	(import.meta.env as Record<string, string | undefined>)["OTLPEndpoint"] ??
	"http://127.0.0.1:4318";

const OTLPEndpoint =
	typeof (window as any).__TAURI_INTERNALS__ !== "undefined"
		? `${ConfiguredOTLPEndpoint.replace(/\/$/, "")}/v1/traces`
		: "/v1/traces";

const BatchIntervalMs = 2000;

const TraceId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
	.map((B) => B.toString(16).padStart(2, "0"))
	.join("");

interface PendingSpan {
	Name: string;

	StartTimeUnixNano: string;

	EndTimeUnixNano: string;

	SpanId: string;

	Detail?: Record<string, unknown>;
}

const Batch: PendingSpan[] = [];

let FlushTimer: ReturnType<typeof setTimeout> | null = null;

let CollectorAvailable: boolean | null = null;

const MakeSpanId = (): string =>
	Array.from(crypto.getRandomValues(new Uint8Array(8)))
		.map((B) => B.toString(16).padStart(2, "0"))
		.join("");

const HrTimeNano = (Ms: number): string =>
	(BigInt(Math.floor(Ms)) * 1000000n).toString();

const ScheduleFlush = (): void => {
	if (FlushTimer) return;

	// Don't re-arm once we know the collector is unreachable - stops the
	// 2-second fetch/SubresourceLoader allocation loop in the profiler.
	if (CollectorAvailable === false) return;

	FlushTimer = setTimeout(Flush, BatchIntervalMs);
};

const Flush = (): void => {
	FlushTimer = null;

	if (Batch.length === 0) return;

	const Spans = Batch.splice(0);

	// Skip network if we already know collector is down
	if (CollectorAvailable === false) return;

	const Payload = {
		resourceSpans: [
			{
				resource: {
					attributes: [
						{
							key: "service.name",

							value: { stringValue: ServiceName },
						},

						{
							key: "service.version",

							value: { stringValue: ServiceVersion },
						},

						{
							key: "browser.user_agent",

							value: { stringValue: navigator.userAgent },
						},
					],
				},

				scopeSpans: [
					{
						scope: { name: "land.otel.bridge", version: "1.0.0" },

						spans: Spans.map((S) => {
							const IsError = S.Name.includes("error");
							const DetailObj = S.Detail as
								| Record<string, unknown>
								| undefined;
							const Attributes = S.Detail
								? Object.entries(S.Detail).map(([K, V]) => ({
										key: K,
										value: {
											stringValue: String(V).slice(
												0,

												500,
											),
										},
									}))
								: [];
							const Events = IsError
								? [
										{
											name: "exception",
											timeUnixNano: S.StartTimeUnixNano,
											attributes: [
												{
													key: "exception.type",
													value: {
														stringValue: S.Name,
													},
												},
												{
													key: "exception.message",
													value: {
														stringValue: String(
															DetailObj?.message ||
																S.Name,
														).slice(0, 500),
													},
												},
											],
										},
									]
								: [];
							return {
								traceId: TraceId,
								spanId: S.SpanId,
								name: S.Name,
								kind: 1,
								startTimeUnixNano: S.StartTimeUnixNano,
								endTimeUnixNano: S.EndTimeUnixNano,
								attributes: Attributes,
								events: Events,
								status: IsError
									? {
											code: 2,
											message: String(
												DetailObj?.message || "",
											).slice(0, 200),
										}
									: { code: 1 },
							};
						}),
					},
				],
			},
		],
	};

	// Fire-and-forget telemetry. If Jaeger has CORS enabled, this works.
	// If not, the catch silently marks collector as unavailable.
	// Start Jaeger with CORS:
	//   docker run -e COLLECTOR_OTLP_HTTP_CORS_ALLOWED_ORIGINS='*' \
	//     -e COLLECTOR_OTLP_HTTP_CORS_ALLOWED_HEADERS='Content-Type' \
	//     -p 4318:4318 -p 16686:16686 jaegertracing/jaeger:2
	try {
		fetch(OTLPEndpoint, {
			method: "POST",
			body: JSON.stringify(Payload),
			headers: { "Content-Type": "application/json" },
		}).catch(() => {
			CollectorAvailable = false;
		});
	} catch {
		CollectorAvailable = false;
	}
};

// PerformanceObserver: watch all land:* marks and measures
const Observer = new PerformanceObserver((List) => {
	for (const Entry of List.getEntries()) {
		if (!Entry.name.startsWith("land:")) continue;

		const Now = performance.timeOrigin + Entry.startTime;
		const Duration =
			Entry.entryType === "measure"
				? (Entry as PerformanceMeasure).duration
				: 0;

		Batch.push({
			Name: Entry.name,
			StartTimeUnixNano: HrTimeNano(Now),
			EndTimeUnixNano: HrTimeNano(Now + Duration),
			SpanId: MakeSpanId(),
			Detail:
				(Entry as any).detail &&
				typeof (Entry as any).detail === "object"
					? (Entry as any).detail
					: undefined,
		});

		ScheduleFlush();
	}
});

if (import.meta.env.DEV && OTLPPipeEnabled) {
	Observer.observe({ type: "mark", buffered: true });

	Observer.observe({ type: "measure", buffered: true });

	// Flush on page unload
	addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") Flush();
	});
}

export default {};
