var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Schedule } from "effect";
import { EnvironmentTag } from "../../Environment.js";
import { TelemetryTag } from "../../Telemetry.js";
import { MountainTag } from "../../Mountain.js";
import { ConfigurationTag } from "../../Configuration.js";
import { HealthTag } from "../Tag/HealthTag.js";
const makeHealthChecker = /* @__PURE__ */ __name(() => ({
  checkService: /* @__PURE__ */ __name((ServiceName) => Effect.gen(function* () {
    const StartTime = Date.now();
    switch (ServiceName.toLowerCase()) {
      case "environment":
        const EnvTime = Date.now() - StartTime;
        return Effect.succeed({
          serviceName: "Environment",
          status: "healthy",
          message: "Environment service available",
          lastChecked: Date.now(),
          responseTime: EnvTime
        });
      case "telemetry":
        const TelemetryService = yield* TelemetryTag;
        const TelemetryTime = Date.now() - StartTime;
        return yield* TelemetryService.log("info", "[Health] Telemetry health check").pipe(
          Effect.map(
            () => ({
              serviceName: "Telemetry",
              status: "healthy",
              message: "Telemetry service available",
              lastChecked: Date.now(),
              responseTime: TelemetryTime
            })
          ),
          Effect.catchAll(
            () => Effect.succeed(
              {
                serviceName: "Telemetry",
                status: "unhealthy",
                message: "Telemetry service error",
                lastChecked: Date.now(),
                responseTime: Date.now() - StartTime
              }
            )
          )
        );
      case "mountain": {
        const Mountain = yield* MountainTag;
        const MountainTime = Date.now() - StartTime;
        return yield* Mountain.version.pipe(
          Effect.map(
            (version) => ({
              serviceName: "Mountain",
              status: "healthy",
              message: `Mountain backend connected (v${version})`,
              lastChecked: Date.now(),
              responseTime: MountainTime,
              details: { version }
            })
          ),
          Effect.catchAll(
            (error) => Effect.succeed(
              {
                serviceName: "Mountain",
                status: "unhealthy",
                message: `Mountain connection failed: ${String(error)}`,
                lastChecked: Date.now(),
                responseTime: Date.now() - StartTime
              }
            )
          )
        );
      }
      case "ipc":
        const IpcTime = Date.now() - StartTime;
        return Effect.succeed(
          {
            serviceName: "IPC",
            status: "healthy",
            message: "IPC service available",
            lastChecked: Date.now(),
            responseTime: IpcTime
          }
        );
      case "configuration": {
        const Config = yield* ConfigurationTag;
        const ConfigTime = Date.now() - StartTime;
        return yield* Config.get.pipe(
          Effect.map(
            () => ({
              serviceName: "Configuration",
              status: "healthy",
              message: "Configuration service available",
              lastChecked: Date.now(),
              responseTime: ConfigTime
            })
          ),
          Effect.catchAll(
            () => Effect.succeed(
              {
                serviceName: "Configuration",
                status: "unhealthy",
                message: "Configuration service error",
                lastChecked: Date.now(),
                responseTime: ConfigTime
              }
            )
          )
        );
      }
      default:
        return Effect.succeed(
          {
            serviceName: ServiceName,
            status: "unknown",
            message: `Unknown service: ${ServiceName}`,
            lastChecked: Date.now(),
            responseTime: 0
          }
        );
    }
  }), "checkService"),
  checkAllServices: /* @__PURE__ */ __name(() => Effect.gen(function* () {
    const Env = yield* EnvironmentTag;
    const EnvInfo = yield* Env.getInfo;
    const Services = ["environment", "telemetry", "mountain", "ipc", "configuration"];
    const HealthChecker = makeHealthChecker();
    const ServiceHealthChecks = Services.map(
      (Service) => HealthChecker.checkService(Service)
    );
    const HealthResults = yield* Effect.all(ServiceHealthChecks);
    const UnhealthyCount = HealthResults.filter((h) => h.status === "unhealthy").length;
    const DegradedCount = HealthResults.filter((h) => h.status === "degraded").length;
    let OverallStatus = "healthy";
    if (UnhealthyCount > 0) {
      OverallStatus = "unhealthy";
    } else if (DegradedCount > 0) {
      OverallStatus = "degraded";
    }
    return {
      overallStatus: OverallStatus,
      services: HealthResults,
      systemInfo: {
        platform: EnvInfo.platform,
        architecture: EnvInfo.architecture,
        upSince: Date.now()
      },
      lastChecked: Date.now()
    };
  }), "checkAllServices"),
  getOverallStatus: /* @__PURE__ */ __name(() => Effect.gen(function* () {
    const HealthChecker = makeHealthChecker();
    const SystemHealth = yield* HealthChecker.checkAllServices();
    return SystemHealth.overallStatus;
  }), "getOverallStatus"),
  monitorService: /* @__PURE__ */ __name((ServiceName, IntervalMs) => Effect.gen(function* () {
    yield* makeHealthChecker().checkService(ServiceName).pipe(
      Effect.repeat(Schedule.spaced(`${IntervalMs} millis`))
    );
  }), "monitorService")
}), "makeHealthChecker");
const HealthLive = Layer.effect(
  HealthTag,
  Effect.succeed(makeHealthChecker())
);
const makeMockHealth = /* @__PURE__ */ __name((Overrides) => ({
  checkService: /* @__PURE__ */ __name((ServiceName) => Effect.gen(function* () {
    const DefaultStatus = "healthy";
    const Status = Overrides?.[ServiceName] ?? DefaultStatus;
    return {
      serviceName: ServiceName,
      status: Status,
      message: Status === "healthy" ? "Mock service healthy" : "Mock service unhealthy",
      lastChecked: Date.now(),
      responseTime: 0
    };
  }), "checkService"),
  checkAllServices: /* @__PURE__ */ __name(() => Effect.gen(function* () {
    const Services = ["environment", "telemetry", "mountain", "ipc", "configuration"];
    const Results = Services.map(
      (Name) => ({
        serviceName: Name,
        status: Overrides?.[Name] ?? "healthy",
        message: "Mock service check",
        lastChecked: Date.now(),
        responseTime: 0
      })
    );
    return {
      overallStatus: "healthy",
      services: Results,
      systemInfo: {
        platform: "mock",
        architecture: "mock",
        upSince: Date.now()
      },
      lastChecked: Date.now()
    };
  }), "checkAllServices"),
  getOverallStatus: /* @__PURE__ */ __name(() => Effect.succeed("healthy"), "getOverallStatus"),
  monitorService: /* @__PURE__ */ __name(() => Effect.void, "monitorService")
}), "makeMockHealth");
const HealthMock = Layer.effect(HealthTag, Effect.succeed(makeMockHealth()));
export {
  HealthLive,
  HealthMock,
  makeHealthChecker,
  makeMockHealth
};
//# sourceMappingURL=HealthImplementation.js.map
