var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getdevDeviceId } from "../../../base/node/id.js";
import { ILogService } from "../../log/common/log.js";
import { IStateService } from "../../state/node/state.js";
import { machineIdKey, sqmIdKey, devDeviceIdKey } from "../common/telemetry.js";
import { resolveMachineId as resolveNodeMachineId, resolveSqmId as resolveNodeSqmId, resolvedevDeviceId as resolveNodedevDeviceId } from "../node/telemetryUtils.js";
async function resolveMachineId(stateService, logService) {
  const machineId = await resolveNodeMachineId(stateService, logService);
  stateService.setItem(machineIdKey, machineId);
  return machineId;
}
__name(resolveMachineId, "resolveMachineId");
async function resolveSqmId(stateService, logService) {
  const sqmId = await resolveNodeSqmId(stateService, logService);
  stateService.setItem(sqmIdKey, sqmId);
  return sqmId;
}
__name(resolveSqmId, "resolveSqmId");
async function resolvedevDeviceId(stateService, logService) {
  const devDeviceId = await resolveNodedevDeviceId(stateService, logService);
  stateService.setItem(devDeviceIdKey, devDeviceId);
  return devDeviceId;
}
__name(resolvedevDeviceId, "resolvedevDeviceId");
async function validatedevDeviceId(stateService, logService) {
  const actualDeviceId = await getdevDeviceId(logService.error.bind(logService));
  const currentDeviceId = await resolveNodedevDeviceId(stateService, logService);
  if (actualDeviceId !== currentDeviceId) {
    stateService.setItem(devDeviceIdKey, actualDeviceId);
  }
}
__name(validatedevDeviceId, "validatedevDeviceId");
export {
  resolveMachineId,
  resolveSqmId,
  resolvedevDeviceId,
  validatedevDeviceId
};
//# sourceMappingURL=telemetryUtils.js.map
