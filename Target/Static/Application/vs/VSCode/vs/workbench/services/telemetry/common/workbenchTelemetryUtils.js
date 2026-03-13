var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getTelemetryLevel } from "../../../../platform/telemetry/common/telemetryUtils.js";
function experimentsEnabled(configurationService, productService, environmentService) {
  return getTelemetryLevel(configurationService) === 3 && !!productService.tasConfig && !environmentService.disableExperiments && !environmentService.extensionTestsLocationURI && !environmentService.enableSmokeTestDriver && configurationService.getValue("workbench.enableExperiments") === true;
}
__name(experimentsEnabled, "experimentsEnabled");
export {
  experimentsEnabled
};
//# sourceMappingURL=workbenchTelemetryUtils.js.map
