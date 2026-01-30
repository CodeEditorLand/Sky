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
import { IAllowedExtensionsService, IExtensionGalleryService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IRequestService } from "../../../../platform/request/common/request.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { AbstractExtensionGalleryService } from "../../../../platform/extensionManagement/common/extensionGalleryService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IExtensionGalleryManifestService } from "../../../../platform/extensionManagement/common/extensionGalleryManifest.js";
let WorkbenchExtensionGalleryService = class WorkbenchExtensionGalleryService2 extends AbstractExtensionGalleryService {
  static {
    __name(this, "WorkbenchExtensionGalleryService");
  }
  constructor(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService) {
    super(storageService, requestService, logService, environmentService, telemetryService, fileService, productService, configurationService, allowedExtensionsService, extensionGalleryManifestService);
  }
};
WorkbenchExtensionGalleryService = __decorate([
  __param(0, IStorageService),
  __param(1, IRequestService),
  __param(2, ILogService),
  __param(3, IEnvironmentService),
  __param(4, ITelemetryService),
  __param(5, IFileService),
  __param(6, IProductService),
  __param(7, IConfigurationService),
  __param(8, IAllowedExtensionsService),
  __param(9, IExtensionGalleryManifestService)
], WorkbenchExtensionGalleryService);
registerSingleton(
  IExtensionGalleryService,
  WorkbenchExtensionGalleryService,
  1
  /* InstantiationType.Delayed */
);
export {
  WorkbenchExtensionGalleryService
};
//# sourceMappingURL=extensionGalleryService.js.map
