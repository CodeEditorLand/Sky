var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { ILogService } from "../../../../platform/log/common/log.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { AbstractExtensionsProfileScannerService, IExtensionsProfileScannerService } from "../../../../platform/extensionManagement/common/extensionsProfileScannerService.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
let ExtensionsProfileScannerService = class ExtensionsProfileScannerService2 extends AbstractExtensionsProfileScannerService {
  static {
    __name(this, "ExtensionsProfileScannerService");
  }
  constructor(environmentService, fileService, userDataProfilesService, uriIdentityService, logService) {
    super(environmentService.userRoamingDataHome, fileService, userDataProfilesService, uriIdentityService, logService);
  }
};
ExtensionsProfileScannerService = __decorate([
  __param(0, IWorkbenchEnvironmentService),
  __param(1, IFileService),
  __param(2, IUserDataProfilesService),
  __param(3, IUriIdentityService),
  __param(4, ILogService)
], ExtensionsProfileScannerService);
registerSingleton(
  IExtensionsProfileScannerService,
  ExtensionsProfileScannerService,
  1
  /* InstantiationType.Delayed */
);
export {
  ExtensionsProfileScannerService
};
//# sourceMappingURL=extensionsProfileScannerService.js.map
