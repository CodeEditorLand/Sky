var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isLinuxSnap, platform, Platform, PlatformToString } from "../../../base/common/platform.js";
import { env, platform as nodePlatform } from "../../../base/common/process.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { ICommonProperties } from "./telemetry.js";
function getPlatformDetail(hostname) {
  if (platform === Platform.Linux && /^penguin(\.|$)/i.test(hostname)) {
    return "chromebook";
  }
  return void 0;
}
__name(getPlatformDetail, "getPlatformDetail");
function resolveCommonProperties(release, hostname, arch, commit, version, machineId, sqmId, devDeviceId, isInternalTelemetry, product) {
  const result = /* @__PURE__ */ Object.create(null);
  result["common.machineId"] = machineId;
  result["common.sqmId"] = sqmId;
  result["common.devDeviceId"] = devDeviceId;
  result["sessionID"] = generateUuid() + Date.now();
  result["commitHash"] = commit;
  result["version"] = version;
  result["common.platformVersion"] = (release || "").replace(/^(\d+)(\.\d+)?(\.\d+)?(.*)/, "$1$2$3");
  result["common.platform"] = PlatformToString(platform);
  result["common.nodePlatform"] = nodePlatform;
  result["common.nodeArch"] = arch;
  result["common.product"] = product || "desktop";
  if (isInternalTelemetry) {
    result["common.msftInternal"] = isInternalTelemetry;
  }
  let seq = 0;
  const startTime = Date.now();
  Object.defineProperties(result, {
    // __GDPR__COMMON__ "timestamp" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
    "timestamp": {
      get: /* @__PURE__ */ __name(() => /* @__PURE__ */ new Date(), "get"),
      enumerable: true
    },
    // __GDPR__COMMON__ "common.timesincesessionstart" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
    "common.timesincesessionstart": {
      get: /* @__PURE__ */ __name(() => Date.now() - startTime, "get"),
      enumerable: true
    },
    // __GDPR__COMMON__ "common.sequence" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
    "common.sequence": {
      get: /* @__PURE__ */ __name(() => seq++, "get"),
      enumerable: true
    }
  });
  if (isLinuxSnap) {
    result["common.snap"] = "true";
  }
  const platformDetail = getPlatformDetail(hostname);
  if (platformDetail) {
    result["common.platformDetail"] = platformDetail;
  }
  return result;
}
__name(resolveCommonProperties, "resolveCommonProperties");
function verifyMicrosoftInternalDomain(domainList) {
  const userDnsDomain = env["USERDNSDOMAIN"];
  if (!userDnsDomain) {
    return false;
  }
  const domain = userDnsDomain.toLowerCase();
  return domainList.some((msftDomain) => domain === msftDomain);
}
__name(verifyMicrosoftInternalDomain, "verifyMicrosoftInternalDomain");
export {
  resolveCommonProperties,
  verifyMicrosoftInternalDomain
};
//# sourceMappingURL=commonProperties.js.map
