var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Stream } from "effect";
import TelemetryTag from "../Tag/TelemetryTag.js";
const makeMockTelemetry = /* @__PURE__ */ __name(() => ({
  recordMetric: /* @__PURE__ */ __name(() => Effect.void, "recordMetric"),
  startSpan: /* @__PURE__ */ __name(() => Effect.succeed({
    end: /* @__PURE__ */ __name(() => Effect.void, "end")
  }), "startSpan"),
  log: /* @__PURE__ */ __name(() => Effect.void, "log"),
  events: Stream.empty,
  getMetrics: /* @__PURE__ */ __name(() => Effect.succeed([]), "getMetrics"),
  getAverageDuration: /* @__PURE__ */ __name(() => Effect.succeed(0), "getAverageDuration"),
  getSuccessRate: /* @__PURE__ */ __name(() => Effect.succeed(0), "getSuccessRate"),
  flush: Effect.void
}), "makeMockTelemetry");
const TelemetryMockLive = Layer.succeed(TelemetryTag, makeMockTelemetry());
var TelemetryMock_default = TelemetryMockLive;
export {
  TelemetryMock_default as default,
  makeMockTelemetry
};
//# sourceMappingURL=TelemetryMock.js.map
