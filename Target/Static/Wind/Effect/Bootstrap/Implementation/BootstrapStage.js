import { Effect } from "effect";
import {} from "../../Environment/index.js";
import { EnvironmentTag } from "../../Environment/index.js";
import { Telemetry, withSpan } from "../../Telemetry.js";
import { Sandbox } from "../../Sandbox.js";
import { Configuration } from "../../Configuration.js";
import { MountainTag } from "../../Mountain.js";
import { HealthTag } from "../../Health.js";
const stage0_Environment = withSpan(
  "stage0_environment",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const environment = yield* EnvironmentTag;
    telemetry.log("info", "[Bootstrap] Stage 0: Detecting environment...");
    const envInfo = yield* environment.getInfo;
    telemetry.log(
      "info",
      `[Bootstrap] Environment: ${envInfo.platform}/${envInfo.architecture}`
    );
    telemetry.log("info", `[Bootstrap] Locale: ${envInfo.locale}, Timezone: ${envInfo.timezone}`);
    return {
      stageName: "Environment",
      success: true,
      duration: 0,
      // Will be set by caller
      error: void 0
    };
  })
);
const stage1_Preload = withSpan(
  "stage1_preload",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const sandbox = yield* Sandbox;
    telemetry.log("info", "[Bootstrap] Stage 1: Waiting for preload...");
    void (yield* sandbox.awaitReady);
    telemetry.log("info", "[Bootstrap] Preload ready, globals available");
    return {
      stageName: "Preload",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage2_Configuration = withSpan(
  "stage2_configuration",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    yield* (yield* Configuration).get;
    telemetry.log("info", "[Bootstrap] Stage 2: Loading configuration...");
    telemetry.log("info", "[Bootstrap] Configuration applied");
    return {
      stageName: "Configuration",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage3_Services = withSpan(
  "stage3_services",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    telemetry.log("info", "[Bootstrap] Stage 3: Connecting to Mountain backend...");
    yield* (yield* MountainTag).connect;
    telemetry.log("info", "[Bootstrap] Mountain connected");
    return {
      stageName: "Services",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage4_Preparation = withSpan(
  "stage4_preparation",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    telemetry.log("info", "[Bootstrap] Stage 4: Preparing workbench resources...");
    telemetry.log("info", "[Bootstrap] Workbench resources prepared");
    return {
      stageName: "Preparation",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage5_Initialization = withSpan(
  "stage5_initialization",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    telemetry.log("info", "[Bootstrap] Stage 5: Initializing VSCode workbench...");
    telemetry.log("info", "[Bootstrap] VSCode workbench initialized");
    yield* Effect.sync(() => {
      window.dispatchEvent(
        new CustomEvent("vscode-wind-bootstrap-complete", {
          detail: { success: true }
        })
      );
    });
    return {
      stageName: "Initialization",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage6_HealthCheck = withSpan(
  "stage6_healthcheck",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const health = yield* HealthTag;
    telemetry.log("info", "[Bootstrap] Stage 6: Running health checks...");
    const systemHealth = yield* health.checkAllServices();
    telemetry.log(
      "info",
      `[Bootstrap] Health check result: ${systemHealth.overallStatus}`
    );
    if (systemHealth.overallStatus === "unhealthy") {
      telemetry.log("error", "[Bootstrap] Some services are unhealthy!");
    }
    return {
      stageName: "HealthCheck",
      success: systemHealth.overallStatus !== "unhealthy",
      duration: 0,
      error: void 0
    };
  })
);
var BootstrapStage_default = {
  stage0_Environment,
  stage1_Preload,
  stage2_Configuration,
  stage3_Services,
  stage4_Preparation,
  stage5_Initialization,
  stage6_HealthCheck
};
export {
  BootstrapStage_default as default,
  stage0_Environment,
  stage1_Preload,
  stage2_Configuration,
  stage3_Services,
  stage4_Preparation,
  stage5_Initialization,
  stage6_HealthCheck
};
//# sourceMappingURL=BootstrapStage.js.map
