var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionStorageService, IExtensionStorageService } from "../../../../platform/extensionManagement/common/extensionStorage.js";
import { migrateUnsupportedExtensions } from "../../../../platform/extensionManagement/common/unsupportedExtensionsMigration.js";
import { INativeServerExtensionManagementService } from "../../../../platform/extensionManagement/node/extensionManagementService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
let ExtensionsContributions = class extends Disposable {
  static {
    __name(this, "ExtensionsContributions");
  }
  constructor(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, storageService, logService) {
    super();
    extensionManagementService.cleanUp();
    migrateUnsupportedExtensions(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
    ExtensionStorageService.removeOutdatedExtensionVersions(extensionManagementService, storageService);
  }
};
ExtensionsContributions = __decorateClass([
  __decorateParam(0, INativeServerExtensionManagementService),
  __decorateParam(1, IExtensionGalleryService),
  __decorateParam(2, IExtensionStorageService),
  __decorateParam(3, IGlobalExtensionEnablementService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, ILogService)
], ExtensionsContributions);
export {
  ExtensionsContributions
};
//# sourceMappingURL=extensions.js.map
