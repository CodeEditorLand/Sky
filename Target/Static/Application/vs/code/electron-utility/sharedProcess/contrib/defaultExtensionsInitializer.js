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
import { dirname, join } from "../../../../base/common/path.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isWindows } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { INativeEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { INativeServerExtensionManagementService } from "../../../../platform/extensionManagement/node/extensionManagementService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IFileService, toFileOperationResult } from "../../../../platform/files/common/files.js";
import { getErrorMessage } from "../../../../base/common/errors.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
const defaultExtensionsInitStatusKey = "initializing-default-extensions";
let DefaultExtensionsInitializer = class DefaultExtensionsInitializer2 extends Disposable {
  static {
    __name(this, "DefaultExtensionsInitializer");
  }
  constructor(environmentService, extensionManagementService, storageService, fileService, logService, productService) {
    super();
    this.environmentService = environmentService;
    this.extensionManagementService = extensionManagementService;
    this.fileService = fileService;
    this.logService = logService;
    this.productService = productService;
    if (isWindows && storageService.getBoolean(defaultExtensionsInitStatusKey, -1, true)) {
      storageService.store(
        defaultExtensionsInitStatusKey,
        true,
        -1,
        1
        /* StorageTarget.MACHINE */
      );
      this.initializeDefaultExtensions().then(() => storageService.store(
        defaultExtensionsInitStatusKey,
        false,
        -1,
        1
        /* StorageTarget.MACHINE */
      ));
    }
  }
  async initializeDefaultExtensions() {
    const extensionsLocation = this.getDefaultExtensionVSIXsLocation();
    let stat;
    try {
      stat = await this.fileService.resolve(extensionsLocation);
      if (!stat.children) {
        this.logService.debug("There are no default extensions to initialize", extensionsLocation.toString());
        return;
      }
    } catch (error) {
      if (toFileOperationResult(error) === 1) {
        this.logService.debug("There are no default extensions to initialize", extensionsLocation.toString());
        return;
      }
      this.logService.error("Error initializing extensions", error);
      return;
    }
    const vsixs = stat.children.filter((child) => child.name.toLowerCase().endsWith(".vsix"));
    if (vsixs.length === 0) {
      this.logService.debug("There are no default extensions to initialize", extensionsLocation.toString());
      return;
    }
    this.logService.info("Initializing default extensions", extensionsLocation.toString());
    await Promise.all(vsixs.map(async (vsix) => {
      this.logService.info("Installing default extension", vsix.resource.toString());
      try {
        await this.extensionManagementService.install(vsix.resource, { donotIncludePackAndDependencies: true, keepExisting: false });
        this.logService.info("Default extension installed", vsix.resource.toString());
      } catch (error) {
        this.logService.error("Error installing default extension", vsix.resource.toString(), getErrorMessage(error));
      }
    }));
    this.logService.info("Default extensions initialized", extensionsLocation.toString());
  }
  getDefaultExtensionVSIXsLocation() {
    if (this.productService.quality === "insider") {
      return URI.file(join(dirname(dirname(dirname(this.environmentService.appRoot))), "bootstrap", "extensions"));
    } else {
      return URI.file(join(dirname(dirname(this.environmentService.appRoot)), "bootstrap", "extensions"));
    }
  }
};
DefaultExtensionsInitializer = __decorate([
  __param(0, INativeEnvironmentService),
  __param(1, INativeServerExtensionManagementService),
  __param(2, IStorageService),
  __param(3, IFileService),
  __param(4, ILogService),
  __param(5, IProductService)
], DefaultExtensionsInitializer);
export {
  DefaultExtensionsInitializer
};
//# sourceMappingURL=defaultExtensionsInitializer.js.map
