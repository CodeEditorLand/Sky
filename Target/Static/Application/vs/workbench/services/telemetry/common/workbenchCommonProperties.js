var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { resolveCommonProperties } from "../../../../platform/telemetry/common/commonProperties.js";
import { firstSessionDateStorageKey, lastSessionDateStorageKey } from "../../../../platform/telemetry/common/telemetry.js";
import { cleanRemoteAuthority } from "../../../../platform/telemetry/common/telemetryUtils.js";
function resolveWorkbenchCommonProperties(storageService, productService, release, hostname, machineId, sqmId, devDeviceId, isInternalTelemetry, process, remoteAuthority) {
  const { commit, version, date: releaseDate } = productService ?? {};
  const result = resolveCommonProperties(release, hostname, process.arch, commit, version, machineId, sqmId, devDeviceId, isInternalTelemetry, releaseDate);
  const firstSessionDate = storageService.get(
    firstSessionDateStorageKey,
    -1
    /* StorageScope.APPLICATION */
  );
  const lastSessionDate = storageService.get(
    lastSessionDateStorageKey,
    -1
    /* StorageScope.APPLICATION */
  );
  result["common.version.shell"] = process.versions?.["electron"];
  result["common.version.renderer"] = process.versions?.["chrome"];
  result["common.firstSessionDate"] = firstSessionDate;
  result["common.lastSessionDate"] = lastSessionDate || "";
  result["common.isNewSession"] = !lastSessionDate ? "1" : "0";
  result["common.remoteAuthority"] = cleanRemoteAuthority(remoteAuthority, productService);
  result["common.cli"] = !!process.env["VSCODE_CLI"];
  return result;
}
__name(resolveWorkbenchCommonProperties, "resolveWorkbenchCommonProperties");
export {
  resolveWorkbenchCommonProperties
};
//# sourceMappingURL=workbenchCommonProperties.js.map
