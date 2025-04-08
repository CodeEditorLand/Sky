var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IStorageService, StorageScope } from "../../../../platform/storage/common/storage.js";
import { resolveCommonProperties } from "../../../../platform/telemetry/common/commonProperties.js";
import { ICommonProperties, firstSessionDateStorageKey, lastSessionDateStorageKey } from "../../../../platform/telemetry/common/telemetry.js";
import { cleanRemoteAuthority } from "../../../../platform/telemetry/common/telemetryUtils.js";
import { INodeProcess } from "../../../../base/common/platform.js";
function resolveWorkbenchCommonProperties(storageService, release, hostname, commit, version, machineId, sqmId, devDeviceId, isInternalTelemetry, process, remoteAuthority) {
  const result = resolveCommonProperties(release, hostname, process.arch, commit, version, machineId, sqmId, devDeviceId, isInternalTelemetry);
  const firstSessionDate = storageService.get(firstSessionDateStorageKey, StorageScope.APPLICATION);
  const lastSessionDate = storageService.get(lastSessionDateStorageKey, StorageScope.APPLICATION);
  result["common.version.shell"] = process.versions?.["electron"];
  result["common.version.renderer"] = process.versions?.["chrome"];
  result["common.firstSessionDate"] = firstSessionDate;
  result["common.lastSessionDate"] = lastSessionDate || "";
  result["common.isNewSession"] = !lastSessionDate ? "1" : "0";
  result["common.remoteAuthority"] = cleanRemoteAuthority(remoteAuthority);
  result["common.cli"] = !!process.env["VSCODE_CLI"];
  return result;
}
__name(resolveWorkbenchCommonProperties, "resolveWorkbenchCommonProperties");
export {
  resolveWorkbenchCommonProperties
};
//# sourceMappingURL=workbenchCommonProperties.js.map
