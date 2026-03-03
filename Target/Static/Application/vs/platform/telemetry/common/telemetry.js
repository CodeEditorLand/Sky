var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
const ITelemetryService = createDecorator("telemetryService");
function telemetryLevelEnabled(service, level) {
  return service.telemetryLevel >= level;
}
__name(telemetryLevelEnabled, "telemetryLevelEnabled");
const ICustomEndpointTelemetryService = createDecorator("customEndpointTelemetryService");
const currentSessionDateStorageKey = "telemetry.currentSessionDate";
const firstSessionDateStorageKey = "telemetry.firstSessionDate";
const lastSessionDateStorageKey = "telemetry.lastSessionDate";
const machineIdKey = "telemetry.machineId";
const sqmIdKey = "telemetry.sqmId";
const devDeviceIdKey = "telemetry.devDeviceId";
const TELEMETRY_SECTION_ID = "telemetry";
const TELEMETRY_SETTING_ID = "telemetry.telemetryLevel";
const TELEMETRY_CRASH_REPORTER_SETTING_ID = "telemetry.enableCrashReporter";
const TELEMETRY_OLD_SETTING_ID = "telemetry.enableTelemetry";
var TelemetryLevel;
(function(TelemetryLevel2) {
  TelemetryLevel2[TelemetryLevel2["NONE"] = 0] = "NONE";
  TelemetryLevel2[TelemetryLevel2["CRASH"] = 1] = "CRASH";
  TelemetryLevel2[TelemetryLevel2["ERROR"] = 2] = "ERROR";
  TelemetryLevel2[TelemetryLevel2["USAGE"] = 3] = "USAGE";
})(TelemetryLevel || (TelemetryLevel = {}));
var TelemetryConfiguration;
(function(TelemetryConfiguration2) {
  TelemetryConfiguration2["OFF"] = "off";
  TelemetryConfiguration2["CRASH"] = "crash";
  TelemetryConfiguration2["ERROR"] = "error";
  TelemetryConfiguration2["ON"] = "all";
})(TelemetryConfiguration || (TelemetryConfiguration = {}));
export {
  ICustomEndpointTelemetryService,
  ITelemetryService,
  TELEMETRY_CRASH_REPORTER_SETTING_ID,
  TELEMETRY_OLD_SETTING_ID,
  TELEMETRY_SECTION_ID,
  TELEMETRY_SETTING_ID,
  TelemetryConfiguration,
  TelemetryLevel,
  currentSessionDateStorageKey,
  devDeviceIdKey,
  firstSessionDateStorageKey,
  lastSessionDateStorageKey,
  machineIdKey,
  sqmIdKey,
  telemetryLevelEnabled
};
//# sourceMappingURL=telemetry.js.map
