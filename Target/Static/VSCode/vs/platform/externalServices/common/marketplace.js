var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IHeaders } from "../../../base/parts/request/common/request.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { getServiceMachineId } from "./serviceMachineId.js";
import { IFileService } from "../../files/common/files.js";
import { IProductService } from "../../product/common/productService.js";
import { IStorageService } from "../../storage/common/storage.js";
import { ITelemetryService, TelemetryLevel } from "../../telemetry/common/telemetry.js";
import { getTelemetryLevel, supportsTelemetry } from "../../telemetry/common/telemetryUtils.js";
async function resolveMarketplaceHeaders(version, productService, environmentService, configurationService, fileService, storageService, telemetryService) {
  const headers = {
    "X-Market-Client-Id": `VSCode ${version}`,
    "User-Agent": `VSCode ${version} (${productService.nameShort})`
  };
  if (supportsTelemetry(productService, environmentService) && getTelemetryLevel(configurationService) === TelemetryLevel.USAGE) {
    const serviceMachineId = await getServiceMachineId(environmentService, fileService, storageService);
    headers["X-Market-User-Id"] = serviceMachineId;
    headers["VSCode-SessionId"] = telemetryService.machineId || serviceMachineId;
  }
  return headers;
}
__name(resolveMarketplaceHeaders, "resolveMarketplaceHeaders");
export {
  resolveMarketplaceHeaders
};
//# sourceMappingURL=marketplace.js.map
