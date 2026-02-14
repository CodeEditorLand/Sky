var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const DetectPlatform = /* @__PURE__ */ __name(() => {
  if (typeof navigator === "undefined") {
    return "web";
  }
  const PlatformStr = navigator.platform?.toLowerCase() || "";
  if (PlatformStr.includes("win")) {
    return "win32";
  }
  if (PlatformStr.includes("mac")) {
    return "darwin";
  }
  if (PlatformStr.includes("linux") || PlatformStr.includes("ubuntu")) {
    return "linux";
  }
  return "web";
}, "DetectPlatform");
const DetectArchitecture = /* @__PURE__ */ __name(() => {
  if (typeof navigator === "undefined") {
    return "web";
  }
  const UserAgent = navigator.userAgent.toLowerCase();
  if (UserAgent.includes("arm") || UserAgent.includes("aarch64")) {
    return "arm64";
  }
  return "x64";
}, "DetectArchitecture");
const DetectLocale = /* @__PURE__ */ __name(() => {
  if (typeof navigator === "undefined") {
    return "en-US";
  }
  return navigator.language || "en-US";
}, "DetectLocale");
const DetectTimezone = /* @__PURE__ */ __name(() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}, "DetectTimezone");
const GetUserAgent = /* @__PURE__ */ __name(() => {
  if (typeof navigator === "undefined") {
    return "Unknown";
  }
  return navigator.userAgent || "Unknown";
}, "GetUserAgent");
const helpers = {
  DetectPlatform,
  DetectArchitecture,
  DetectLocale,
  DetectTimezone,
  GetUserAgent
};
var EnvironmentHelper_default = helpers;
export {
  DetectArchitecture,
  DetectLocale,
  DetectPlatform,
  DetectTimezone,
  GetUserAgent,
  EnvironmentHelper_default as default
};
//# sourceMappingURL=EnvironmentHelper.js.map
