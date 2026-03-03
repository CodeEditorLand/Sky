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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionStorageService, IExtensionStorageService } from "../../../../platform/extensionManagement/common/extensionStorage.js";
import { migrateUnsupportedExtensions } from "../../../../platform/extensionManagement/common/unsupportedExtensionsMigration.js";
import { INativeServerExtensionManagementService } from "../../../../platform/extensionManagement/node/extensionManagementService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
let ExtensionsContributions = class ExtensionsContributions2 extends Disposable {
  static {
    __name(this, "ExtensionsContributions");
  }
  constructor(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, userDataProfilesService, storageService, logService) {
    super();
    this.extensionManagementService = extensionManagementService;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionStorageService = extensionStorageService;
    this.extensionEnablementService = extensionEnablementService;
    this.userDataProfilesService = userDataProfilesService;
    this.logService = logService;
    extensionManagementService.cleanUp();
    this.migrateUnsupportedExtensions();
    ExtensionStorageService.removeOutdatedExtensionVersions(extensionManagementService, storageService);
  }
  async migrateUnsupportedExtensions() {
    for (const profile of this.userDataProfilesService.profiles) {
      await migrateUnsupportedExtensions(profile, this.extensionManagementService, this.extensionGalleryService, this.extensionStorageService, this.extensionEnablementService, this.logService);
    }
  }
};
ExtensionsContributions = __decorate([
  __param(0, INativeServerExtensionManagementService),
  __param(1, IExtensionGalleryService),
  __param(2, IExtensionStorageService),
  __param(3, IGlobalExtensionEnablementService),
  __param(4, IUserDataProfilesService),
  __param(5, IStorageService),
  __param(6, ILogService)
], ExtensionsContributions);
export {
  ExtensionsContributions
};
//# sourceMappingURL=extensions.js.map
