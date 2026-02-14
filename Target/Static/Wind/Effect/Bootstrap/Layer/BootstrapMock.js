var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer } from "effect";
import { BootstrapTag } from "../Tag/BootstrapTag.js";
const makeMockBootstrap = /* @__PURE__ */ __name(() => ({
  run: /* @__PURE__ */ __name((options) => Effect.gen(function* () {
    yield* Effect.sleep("1 millis");
    return {
      success: true,
      totalDuration: 1,
      stages: [
        { stageName: "Environment", success: true, duration: 0, error: void 0 },
        { stageName: "Preload", success: true, duration: 0, error: void 0 },
        { stageName: "Configuration", success: true, duration: 0, error: void 0 },
        { stageName: "Services", success: true, duration: 0, error: void 0 },
        { stageName: "Preparation", success: true, duration: 0, error: void 0 },
        { stageName: "Initialization", success: true, duration: 0, error: void 0 },
        ...options?.skipHealthCheck ? [] : [{ stageName: "HealthCheck", success: true, duration: 0, error: void 0 }]
      ],
      error: void 0
    };
  }), "run")
}), "makeMockBootstrap");
const BootstrapMock = Layer.effect(BootstrapTag, Effect.succeed(makeMockBootstrap()));
var BootstrapMock_default = BootstrapMock;
export {
  BootstrapMock,
  BootstrapMock_default as default,
  makeMockBootstrap
};
//# sourceMappingURL=BootstrapMock.js.map
