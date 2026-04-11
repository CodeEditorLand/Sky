/**
 * Build-baked OTEL bridge.
 *
 * Injected by Sky's build when On=true (dev). Removed entirely in production.
 * No runtime SDK, no window.__LAND_DEV_LOG checks.
 *
 * How it works:
 * 1. PerformanceObserver watches all `land:*` marks and measures
 * 2. Batches them into OTLP-compatible spans
 * 3. Sends via fetch to the local OTLP collector every 2s
 * 4. Falls back to console.debug if no collector is running
 *
 * OTLP endpoint: http://localhost:4318/v1/traces (standard OTLP/HTTP)
 * Start a collector: `docker run -p 4318:4318 otel/opentelemetry-collector`
 * Or use Jaeger: `docker run -p 4318:4318 -p 16686:16686 jaegertracing/jaeger:2`
 */

const ServiceName = "land-editor";
const ServiceVersion = "0.0.1";
// Same-origin path - proxied by Vite (dev) or Mountain (prod) to the real
// OTLP collector. No CORS preflight, no cross-origin issues.
const OTLPEndpoint = "/v1/traces";
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
						spans: Spans.map((S) => ({
							traceId: TraceId,
							spanId: S.SpanId,
							name: S.Name,
							kind: 1, // INTERNAL
							startTimeUnixNano: S.StartTimeUnixNano,
							endTimeUnixNano: S.EndTimeUnixNano,
							attributes: S.Detail
								? Object.entries(S.Detail).map(
										([K, V]) => ({
											key: K,
											value: { stringValue: String(V) },
										}),
									)
								: [],
							status: S.Name.includes("error")
								? { code: 2 } // ERROR
								: { code: 1 }, // OK
						})),
					},
				],
			},
		],
	};

	// sendBeacon avoids CORS preflight - fire-and-forget, no OPTIONS request.
	// Content-Type is set to text/plain by sendBeacon which bypasses CORS,
	// but OTLP/HTTP accepts JSON regardless of Content-Type header.
	const Queued = navigator.sendBeacon(
		OTLPEndpoint,
		new Blob([JSON.stringify(Payload)], { type: "application/json" }),
	);
	if (!Queued) CollectorAvailable = false;
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
				(Entry as any).detail && typeof (Entry as any).detail === "object"
					? (Entry as any).detail
					: undefined,
		});

		ScheduleFlush();
	}
});

Observer.observe({ type: "mark", buffered: true });
Observer.observe({ type: "measure", buffered: true });

// Flush on page unload
addEventListener("visibilitychange", () => {
	if (document.visibilityState === "hidden") Flush();
});

export default {};
