var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream, SubscriptionRef, HashMap } from "effect";
import TelemetryTag from "../Tag/TelemetryTag.js";
const TelemetryLive = Layer.effect(
  TelemetryTag,
  Effect.gen(function* () {
    const metricsRef = yield* SubscriptionRef.make(HashMap.empty());
    const spansRef = yield* SubscriptionRef.make(HashMap.empty());
    const eventsRef = yield* SubscriptionRef.make([]);
    const recordMetric = /* @__PURE__ */ __name((name, value, labels) => Effect.gen(function* () {
      const metric = {
        name,
        value,
        timestamp: Date.now(),
        labels: labels ?? {}
      };
      const currentMetrics = yield* metricsRef.get;
      const existing = HashMap.get(currentMetrics, name).pipe(Effect.runSync) || [];
      yield* SubscriptionRef.set(
        metricsRef,
        HashMap.set(currentMetrics, name, [...existing, metric].slice(-1e3))
      );
      const currentEvents = yield* eventsRef.get;
      yield* SubscriptionRef.set(
        eventsRef,
        [
          ...currentEvents,
          {
            type: "metric",
            timestamp: Date.now(),
            data: metric
          }
        ].slice(-1e4)
      );
      console.log(`[Telemetry] Metric: ${name} = ${value}`);
    }), "recordMetric");
    const startSpan = /* @__PURE__ */ __name((name, labels) => Effect.sync(() => {
      const startTime = Date.now();
      const end = /* @__PURE__ */ __name((success, error) => Effect.gen(function* () {
        const endTime = Date.now();
        const span = {
          name,
          startTime,
          endTime,
          duration: endTime - startTime,
          success,
          error: error ?? "",
          labels: labels ?? {}
        };
        const currentSpans = yield* spansRef.get;
        const existing = HashMap.get(currentSpans, name).pipe(Effect.runSync) || [];
        yield* SubscriptionRef.set(spansRef, HashMap.set(currentSpans, name, [...existing, span].slice(-1e3)));
        const currentEvents = yield* eventsRef.get;
        yield* SubscriptionRef.set(
          eventsRef,
          [
            ...currentEvents,
            {
              type: "span",
              timestamp: Date.now(),
              data: span
            }
          ].slice(-1e4)
        );
        console.log(`[Telemetry] Span: ${name} completed in ${span.duration}ms (success: ${success})`);
      }), "end");
      return { end };
    }), "startSpan");
    const log = /* @__PURE__ */ __name((level, message, context) => Effect.gen(function* () {
      const logEntry = {
        level,
        message,
        context: context ?? {}
      };
      const currentEvents = yield* eventsRef.get;
      yield* SubscriptionRef.set(
        eventsRef,
        [
          ...currentEvents,
          {
            type: "log",
            timestamp: Date.now(),
            data: logEntry
          }
        ].slice(-1e4)
      );
      const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : level === "debug" ? console.debug : console.log;
      consoleMethod(`[Telemetry] [${level.toUpperCase()}] ${message}`, context ?? {});
    }), "log");
    const events = eventsRef.changes;
    const getMetrics = /* @__PURE__ */ __name((name) => metricsRef.get.pipe(Effect.map((map) => HashMap.get(map, name).pipe(Effect.runSync) || [])), "getMetrics");
    const getAverageDuration = /* @__PURE__ */ __name((name) => spansRef.get.pipe(
      Effect.map((map) => {
        const spans = HashMap.get(map, name).pipe(Effect.runSync) || [];
        if (spans.length === 0) return 0;
        const total = spans.reduce((sum, s) => sum + (s.duration || 0), 0);
        return total / spans.length;
      })
    ), "getAverageDuration");
    const getSuccessRate = /* @__PURE__ */ __name((name) => spansRef.get.pipe(
      Effect.map((map) => {
        const spans = HashMap.get(map, name).pipe(Effect.runSync) || [];
        if (spans.length === 0) return 0;
        const successful = spans.filter((s) => s.success).length;
        return successful / spans.length;
      })
    ), "getSuccessRate");
    const flush = Effect.void;
    yield* Effect.log("[Telemetry] Telemetry service initialized");
    const service = {
      recordMetric,
      startSpan,
      log,
      events,
      getMetrics,
      getAverageDuration,
      getSuccessRate,
      flush
    };
    return service;
  })
);
var TelemetryLive_default = TelemetryLive;
export {
  TelemetryLive_default as default
};
//# sourceMappingURL=TelemetryLive.js.map
