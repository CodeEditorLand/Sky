var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  TelemetryEndpoint,
  MarketplaceEndpoint,
  UpdateEndpoint,
  AiEndpoint,
  ALLOWED_IPC_CHANNELS,
  BLOCKED_IPC_CHANNELS
} from "../Constant/NetworkRestrictionsConstant.js";
const IsInternalURL = /* @__PURE__ */ __name((Config, Url) => {
  try {
    const UrlObj = new URL(Url);
    if (UrlObj.hostname === "localhost" || UrlObj.hostname === "127.0.0.1" || UrlObj.hostname === "::1") {
      return true;
    }
    if (Config.allowMountain && (UrlObj.hostname.includes("localhost") || UrlObj.hostname === "127.0.0.1" || UrlObj.port !== void 0)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}, "IsInternalURL");
const IsBlockedURL = /* @__PURE__ */ __name((Config, Url) => {
  if (Config.blockTelemetry) {
    for (const Pattern of TelemetryEndpoint) {
      if (Url.includes(Pattern)) {
        return true;
      }
    }
  }
  if (Config.blockedDomains.length > 0) {
    for (const Pattern of Config.blockedDomains) {
      if (Url.includes(Pattern)) {
        return true;
      }
    }
  }
  if (Url.includes("telemetry") || Url.includes("telemetryAppender") || Url.includes("vortex")) {
    return true;
  }
  if (Config.blockMarketplace) {
    for (const Pattern of MarketplaceEndpoint) {
      if (Url.includes("marketplace") || Url.includes("extensions")) {
        return true;
      }
    }
  }
  if (Config.blockExtensionUpdates) {
    for (const Pattern of UpdateEndpoint) {
      if (Url.includes("update") || Url.includes("vscode-update")) {
        return true;
      }
    }
  }
  for (const Pattern of AiEndpoint) {
    if (Url.includes("github.com") || Url.includes("copilot")) {
      return true;
    }
  }
  return false;
}, "IsBlockedURL");
const IsAllowedURL = /* @__PURE__ */ __name((Config, Url) => {
  if (Config.allowedDomains.length === 0) {
    return false;
  }
  for (const Pattern of Config.allowedDomains) {
    if (Url.includes(Pattern)) {
      return true;
    }
  }
  return false;
}, "IsAllowedURL");
const IsIPCAllowed = /* @__PURE__ */ __name((Channel) => {
  if (!Channel.startsWith("vscode:")) {
    return false;
  }
  for (const Pattern of BLOCKED_IPC_CHANNELS) {
    if (Channel.startsWith(Pattern)) {
      return false;
    }
  }
  for (const Allowed of ALLOWED_IPC_CHANNELS) {
    if (Channel.startsWith(Allowed)) {
      return true;
    }
  }
  return false;
}, "IsIPCAllowed");
const helpers = {
  IsInternalURL,
  IsBlockedURL,
  IsAllowedURL,
  IsIPCAllowed
};
var NetworkRestrictionsHelper_default = helpers;
export {
  IsAllowedURL,
  IsBlockedURL,
  IsIPCAllowed,
  IsInternalURL,
  NetworkRestrictionsHelper_default as default
};
//# sourceMappingURL=NetworkRestrictionsHelper.js.map
