var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IExtensionStorageService } from "../../../../platform/extensionManagement/common/extensionStorage.js";
import { migrateUnsupportedExtensions } from "../../../../platform/extensionManagement/common/unsupportedExtensionsMigration.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IExtensionManagementServerService } from "../../../services/extensionManagement/common/extensionManagement.js";
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
let UnsupportedExtensionsMigrationContrib = class UnsupportedExtensionsMigrationContrib2 {
  static {
    __name(this, "UnsupportedExtensionsMigrationContrib");
  }
  constructor(extensionManagementServerService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService) {
    if (extensionManagementServerService.remoteExtensionManagementServer) {
      migrateUnsupportedExtensions(extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
    }
    if (extensionManagementServerService.webExtensionManagementServer) {
      migrateUnsupportedExtensions(extensionManagementServerService.webExtensionManagementServer.extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
    }
  }
};
UnsupportedExtensionsMigrationContrib = __decorate([
  __param(0, IExtensionManagementServerService),
  __param(1, IExtensionGalleryService),
  __param(2, IExtensionStorageService),
  __param(3, IGlobalExtensionEnablementService),
  __param(4, ILogService)
], UnsupportedExtensionsMigrationContrib);
export {
  UnsupportedExtensionsMigrationContrib
};
//# sourceMappingURL=unsupportedExtensionsMigrationContribution.js.map
