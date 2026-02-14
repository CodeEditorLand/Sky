var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer } from "effect";
import { EnvironmentTag } from "../Tag/EnvironmentTag.js";
import {
  DetectPlatform,
  DetectArchitecture,
  DetectLocale,
  DetectTimezone,
  GetUserAgent
} from "./EnvironmentHelper.js";
const MakeLiveEnvironment = {
  getInfo: Effect.sync(() => ({
    platform: DetectPlatform(),
    architecture: DetectArchitecture(),
    locale: DetectLocale(),
    timezone: DetectTimezone(),
    userAgent: GetUserAgent(),
    isSecureContext: typeof window !== "undefined" && window.isSecureContext,
    language: DetectLocale().split("-")[0] || "en"
  })),
  getPlatform: Effect.sync(DetectPlatform),
  getArchitecture: Effect.sync(DetectArchitecture),
  isWindows: Effect.map(Effect.sync(DetectPlatform), (p) => p === "win32"),
  isMac: Effect.map(Effect.sync(DetectPlatform), (p) => p === "darwin"),
  isLinux: Effect.map(Effect.sync(DetectPlatform), (p) => p === "linux"),
  isWeb: Effect.map(Effect.sync(DetectPlatform), (p) => p === "web")
};
const EnvironmentLive = Layer.effect(
  EnvironmentTag,
  Effect.succeed(MakeLiveEnvironment)
);
const makeMockEnvironment = /* @__PURE__ */ __name((overrides) => {
  const mockInfo = {
    platform: "web",
    architecture: "x64",
    locale: "en-US",
    timezone: "UTC",
    userAgent: "Mock",
    isSecureContext: true,
    language: "en",
    ...overrides
  };
  return {
    getInfo: Effect.sync(() => mockInfo),
    getPlatform: Effect.sync(() => mockInfo.platform),
    getArchitecture: Effect.sync(() => mockInfo.architecture),
    isWindows: Effect.sync(() => mockInfo.platform === "win32"),
    isMac: Effect.sync(() => mockInfo.platform === "darwin"),
    isLinux: Effect.sync(() => mockInfo.platform === "linux"),
    isWeb: Effect.sync(() => mockInfo.platform === "web")
  };
}, "makeMockEnvironment");
const EnvironmentMock = Layer.effect(
  EnvironmentTag,
  Effect.succeed(makeMockEnvironment())
);
var EnvironmentImplementation_default = EnvironmentLive;
export {
  EnvironmentLive,
  EnvironmentMock,
  EnvironmentImplementation_default as default,
  makeMockEnvironment
};
//# sourceMappingURL=EnvironmentImplementation.js.map
