var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../../base/common/network.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
function parseExtensionDevOptions(environmentService) {
  const isExtensionDevHost = environmentService.isExtensionDevelopment;
  let debugOk = true;
  const extDevLocs = environmentService.extensionDevelopmentLocationURI;
  if (extDevLocs) {
    for (const x of extDevLocs) {
      if (x.scheme !== Schemas.file) {
        debugOk = false;
      }
    }
  }
  const isExtensionDevDebug = debugOk && typeof environmentService.debugExtensionHost.port === "number";
  const isExtensionDevDebugBrk = debugOk && !!environmentService.debugExtensionHost.break;
  const isExtensionDevTestFromCli = isExtensionDevHost && !!environmentService.extensionTestsLocationURI && !environmentService.debugExtensionHost.debugId;
  return {
    isExtensionDevHost,
    isExtensionDevDebug,
    isExtensionDevDebugBrk,
    isExtensionDevTestFromCli
  };
}
__name(parseExtensionDevOptions, "parseExtensionDevOptions");
export {
  parseExtensionDevOptions
};
//# sourceMappingURL=extensionDevOptions.js.map
