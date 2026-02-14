var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer } from "effect";
import { BootstrapTag } from "../Tag/BootstrapTag.js";
import { Telemetry } from "../../Telemetry.js";
import {
  stage0_Environment,
  stage1_Preload,
  stage2_Configuration,
  stage3_Services,
  stage4_Preparation,
  stage5_Initialization,
  stage6_HealthCheck
} from "./BootstrapStage.js";
const makeBootstrap = /* @__PURE__ */ __name(() => ({
  run: /* @__PURE__ */ __name((Options) => Effect.gen(function* () {
    const TelemetryService = yield* Telemetry;
    const StartTime = Date.now();
    const { skipHealthCheck = false, debugMode = false } = Options ?? {};
    TelemetryService.log("info", "[Bootstrap] ===============================================");
    TelemetryService.log("info", "[Bootstrap] Wind VSCode Workbench Bootstrap");
    TelemetryService.log("info", "[Bootstrap] Debug mode: " + debugMode);
    TelemetryService.log("info", "[Bootstrap] ===============================================");
    const Stages = [
      stage0_Environment,
      stage1_Preload,
      stage2_Configuration,
      stage3_Services,
      stage4_Preparation,
      stage5_Initialization,
      ...skipHealthCheck ? [] : [stage6_HealthCheck]
    ];
    const Results = [];
    for (const Stage of Stages) {
      const StageStartTime = Date.now();
      let Result;
      try {
        const StageResult = yield* Effect.suspend(() => Stage);
        Result = { ...StageResult, duration: Date.now() - StageStartTime };
      } catch (E) {
        const Error2 = E instanceof Error2 ? E : new Error2(String(E));
        Result = {
          stageName: "Unknown",
          success: false,
          duration: Date.now() - StageStartTime,
          error: Error2
        };
      }
      Results.push(Result);
    }
    const EndTime = Date.now();
    const TotalDuration = EndTime - StartTime;
    const AllSuccess = Results.every((R) => R.success);
    TelemetryService.log("info", "[Bootstrap] ===============================================");
    TelemetryService.log(
      "info",
      `[Bootstrap] ${AllSuccess ? "\u2713 Bootstrap completed successfully" : "\u2717 Bootstrap failed"}`
    );
    TelemetryService.log("info", `[Bootstrap] Total duration: ${TotalDuration}ms`);
    TelemetryService.log("info", "[Bootstrap] ===============================================");
    if (!AllSuccess) {
      const FailedStages = Results.filter((R) => !R.success);
      TelemetryService.log("error", "[Bootstrap] Failed stages:");
      for (const Failed of FailedStages) {
        TelemetryService.log("error", `[Bootstrap]   - ${Failed.stageName}: ${Failed.error?.message || "Unknown error"}`);
      }
    }
    return {
      success: AllSuccess,
      totalDuration: TotalDuration,
      stages: Results,
      error: AllSuccess ? void 0 : new Error("Bootstrap failed")
    };
  }), "run")
}), "makeBootstrap");
const BootstrapLive = Layer.effect(
  BootstrapTag,
  Effect.succeed(makeBootstrap())
);
var BootstrapImplementation_default = BootstrapLive;
export {
  BootstrapLive,
  BootstrapImplementation_default as default
};
//# sourceMappingURL=BootstrapImplementation.js.map
