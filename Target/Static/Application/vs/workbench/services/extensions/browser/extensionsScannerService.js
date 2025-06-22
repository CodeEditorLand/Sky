var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IExtensionsProfileScannerService } from "../../../../platform/extensionManagement/common/extensionsProfileScannerService.js";
import { AbstractExtensionsScannerService, IExtensionsScannerService } from "../../../../platform/extensionManagement/common/extensionsScannerService.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
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
let ExtensionsScannerService = class ExtensionsScannerService2 extends AbstractExtensionsScannerService {
  static {
    __name(this, "ExtensionsScannerService");
  }
  constructor(userDataProfileService, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
    super(uriIdentityService.extUri.joinPath(environmentService.userRoamingDataHome, "systemExtensions"), uriIdentityService.extUri.joinPath(environmentService.userRoamingDataHome, "userExtensions"), uriIdentityService.extUri.joinPath(environmentService.userRoamingDataHome, "userExtensions", "control.json"), userDataProfileService.currentProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
  }
  async getTranslations() {
    return {};
  }
};
ExtensionsScannerService = __decorate([
  __param(0, IUserDataProfileService),
  __param(1, IUserDataProfilesService),
  __param(2, IExtensionsProfileScannerService),
  __param(3, IFileService),
  __param(4, ILogService),
  __param(5, IWorkbenchEnvironmentService),
  __param(6, IProductService),
  __param(7, IUriIdentityService),
  __param(8, IInstantiationService)
], ExtensionsScannerService);
registerSingleton(
  IExtensionsScannerService,
  ExtensionsScannerService,
  1
  /* InstantiationType.Delayed */
);
export {
  ExtensionsScannerService
};
//# sourceMappingURL=extensionsScannerService.js.map
