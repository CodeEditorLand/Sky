var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Stream } from "effect";
import { ConfigurationNotReadyError } from "../../../Types/Sandbox.js";
import { ConfigFetchError } from "../Error/ConfigFetchError.js";
import { ConfigValidationError } from "../Error/ConfigValidationError.js";
import { ConfigApplyError } from "../Error/ConfigApplyError.js";
const ValidateConfiguration = /* @__PURE__ */ __name((Config) => {
  const Issues = [];
  if (!Config || typeof Config !== "object") {
    Issues.push({ path: "", message: "Configuration must be an object" });
    return Issues;
  }
  const ConfigData = Config;
  if (ConfigData["zoomLevel"] !== void 0) {
    if (typeof ConfigData["zoomLevel"] !== "number") {
      Issues.push({ path: "zoomLevel", message: "Must be a number" });
    } else if (ConfigData["zoomLevel"] < -10 || ConfigData["zoomLevel"] > 10) {
      Issues.push({
        path: "zoomLevel",
        message: "Must be between -10 and 10"
      });
    }
  }
  if (ConfigData["userEnv"] !== void 0 && typeof ConfigData["userEnv"] !== "object") {
    Issues.push({ path: "userEnv", message: "Must be an object" });
  }
  if (ConfigData["workspace"] !== void 0) {
    if (typeof ConfigData["workspace"] !== "object" || ConfigData["workspace"] === null) {
      Issues.push({ path: "workspace", message: "Must be an object" });
    } else {
      const Workspace = ConfigData["workspace"];
      if (Workspace["id"] !== void 0 && typeof Workspace["id"] !== "string") {
        Issues.push({
          path: "workspace.id",
          message: "Must be a string"
        });
      }
      if (Workspace["uri"] !== void 0 && typeof Workspace["uri"] !== "string") {
        Issues.push({
          path: "workspace.uri",
          message: "Must be a string"
        });
      }
    }
  }
  return Issues;
}, "ValidateConfiguration");
const MakeValidate = /* @__PURE__ */ __name(() => {
  return (Config) => Effect.sync(() => ValidateConfiguration(Config)).pipe(
    Effect.flatMap(
      (Issues) => Issues.length > 0 ? Effect.fail(
        new ConfigValidationError(
          Issues.map((Issue) => `${Issue.path}: ${Issue.message}`)
        )
      ) : Effect.succeed(Config)
    )
  );
}, "MakeValidate");
const MakeApply = /* @__PURE__ */ __name(() => {
  return (Config) => Effect.gen(function* () {
    if (Config.zoomLevel !== void 0) {
      yield* Effect.try({
        try: /* @__PURE__ */ __name(() => {
          if (window && window.vscode) {
            window.vscode.postMessage({
              type: "setZoomLevel",
              payload: Config.zoomLevel
            });
          }
        }, "try"),
        catch: /* @__PURE__ */ __name((Error2) => new ConfigApplyError("zoomLevel", Error2), "catch")
      });
    }
    if (Config.userEnv) {
      for (const [Key, Value] of Object.entries(Config.userEnv || {})) {
        yield* Effect.try({
          try: /* @__PURE__ */ __name(() => {
            if (typeof process !== "undefined" && process.env) {
              process.env[Key] = Value;
            }
          }, "try"),
          catch: /* @__PURE__ */ __name((Error2) => new ConfigApplyError(Key, Error2), "catch")
        });
      }
    }
  });
}, "MakeApply");
const GetConfigValue = /* @__PURE__ */ __name((Config, Path) => {
  const Parts = Path.split(".");
  let Current = Config;
  for (const Part of Parts) {
    if (Current && typeof Current === "object" && Part in Current) {
      Current = Current[Part];
    } else {
      return void 0;
    }
  }
  return Current;
}, "GetConfigValue");
export {
  GetConfigValue,
  MakeApply,
  MakeValidate,
  ValidateConfiguration
};
//# sourceMappingURL=ConfigurationHelper.js.map
