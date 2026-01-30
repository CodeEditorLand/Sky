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
import { ILogService } from "../../log/common/log.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { AbstractExtensionsProfileScannerService, IExtensionsProfileScannerService } from "../common/extensionsProfileScannerService.js";
import { IFileService } from "../../files/common/files.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { URI } from "../../../base/common/uri.js";
import { registerSingleton } from "../../instantiation/common/extensions.js";
let ExtensionsProfileScannerService = class ExtensionsProfileScannerService2 extends AbstractExtensionsProfileScannerService {
  static {
    __name(this, "ExtensionsProfileScannerService");
  }
  constructor(environmentService, fileService, userDataProfilesService, uriIdentityService, logService) {
    super(URI.file(environmentService.extensionsPath), fileService, userDataProfilesService, uriIdentityService, logService);
  }
};
ExtensionsProfileScannerService = __decorate([
  __param(0, INativeEnvironmentService),
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
