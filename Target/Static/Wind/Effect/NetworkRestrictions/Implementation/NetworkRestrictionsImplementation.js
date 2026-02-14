var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Ref } from "effect";
import { Telemetry } from "../../Telemetry.js";
import { NetworkRestrictions } from "../Tag/NetworkRestrictionsTag.js";
import CreateNetworkBlockError from "../Error/NetworkBlockError.js";
import CreateIPCBlockError from "../Error/IPCBlockError.js";
import {
  DEFAULT_NETWORK_RESTRICTIONS
} from "../Constant/NetworkRestrictionsConstant.js";
import {
  IsInternalURL,
  IsBlockedURL,
  IsAllowedURL,
  IsIPCAllowed
} from "./NetworkRestrictionsHelper.js";
const NetworkRestrictionsLive = Layer.effect(
  NetworkRestrictions,
  Effect.gen(function* () {
    const TelemetryService = yield* Telemetry;
    const ConfigRef = yield* Ref.make(
      JSON.parse(JSON.stringify(DEFAULT_NETWORK_RESTRICTIONS))
    );
    const BlockedRequestsRef = yield* Ref.make([]);
    const TelemetryLevelRef = yield* Ref.make("NONE");
    const CheckURL = /* @__PURE__ */ __name((Url) => Effect.gen(function* () {
      const CurrentConfig = yield* ConfigRef.get;
      if (CurrentConfig.allowInternal && IsInternalURL(CurrentConfig, Url)) {
        return true;
      }
      if (IsAllowedURL(CurrentConfig, Url)) {
        return true;
      }
      if (IsBlockedURL(CurrentConfig, Url)) {
        return yield* Effect.fail(CreateNetworkBlockError(Url, "URL is blocked by network restrictions"));
      }
      if (CurrentConfig.blockHTTP || CurrentConfig.blockHTTPS) {
        const UrlObj = new URL(Url);
        if (UrlObj.protocol === "http:" && CurrentConfig.blockHTTP) {
          return yield* Effect.fail(CreateNetworkBlockError(Url, "HTTP requests are blocked"));
        }
        if (UrlObj.protocol === "https:" && CurrentConfig.blockHTTPS) {
          return yield* Effect.fail(CreateNetworkBlockError(Url, "HTTPS requests are blocked"));
        }
      }
      return false;
    }), "CheckURL");
    const BlockURL = /* @__PURE__ */ __name((Url, Reason) => Effect.gen(function* () {
      const CurrentConfig = yield* ConfigRef.get;
      if (CurrentConfig.logBlocked) {
        yield* TelemetryService.log("warn", `[NetworkRestrictions] Blocked URL: ${Url} - ${Reason}`);
        yield* Ref.update(BlockedRequestsRef, (Logs) => [
          ...Logs,
          {
            timestamp: Date.now(),
            type: Url.startsWith("https:") ? "https" : "http",
            target: Url,
            reason: Reason
          }
        ]);
      }
    }), "BlockURL");
    const CheckIPCChannel = /* @__PURE__ */ __name((Channel) => Effect.gen(function* () {
      if (!IsIPCAllowed(Channel)) {
        return yield* Effect.fail(CreateIPCBlockError(
          Channel,
          "IPC channel is blocked by network restrictions"
        ));
      }
      return true;
    }), "CheckIPCChannel");
    const Config = ConfigRef.get;
    const UpdateConfig = /* @__PURE__ */ __name((Updates) => Effect.gen(function* () {
      const Current = yield* ConfigRef.get;
      yield* Ref.set(ConfigRef, { ...Current, ...Updates });
      yield* TelemetryService.log("info", `[NetworkRestrictions] Configuration updated`);
    }), "UpdateConfig");
    const GetBlockedRequests = BlockedRequestsRef.get;
    const ClearBlockedRequests = Ref.set(BlockedRequestsRef, []);
    const SetTelemetryLevel = /* @__PURE__ */ __name((Level) => Effect.gen(function* () {
      yield* Ref.set(TelemetryLevelRef, Level);
      yield* TelemetryService.log("info", `[NetworkRestrictions] Telemetry level set to: ${Level}`);
    }), "SetTelemetryLevel");
    const GetTelemetryLevel = TelemetryLevelRef.get;
    yield* TelemetryService.log("info", "[NetworkRestrictions] Network restrictions service initialized");
    const service = {
      checkURL: CheckURL,
      blockURL: BlockURL,
      checkIPCChannel: CheckIPCChannel,
      config: Config,
      updateConfig: UpdateConfig,
      getBlockedRequests: GetBlockedRequests,
      clearBlockedRequests: ClearBlockedRequests,
      setTelemetryLevel: SetTelemetryLevel,
      getTelemetryLevel: GetTelemetryLevel
    };
    return service;
  })
);
var NetworkRestrictionsImplementation_default = NetworkRestrictionsLive;
export {
  NetworkRestrictionsLive,
  NetworkRestrictionsImplementation_default as default
};
//# sourceMappingURL=NetworkRestrictionsImplementation.js.map
