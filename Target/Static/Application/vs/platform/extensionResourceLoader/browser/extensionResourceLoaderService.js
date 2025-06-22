var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerSingleton } from "../../instantiation/common/extensions.js";
import { IFileService } from "../../files/common/files.js";
import { FileAccess, Schemas } from "../../../base/common/network.js";
import { IProductService } from "../../product/common/productService.js";
import { IStorageService } from "../../storage/common/storage.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { ILogService } from "../../log/common/log.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { AbstractExtensionResourceLoaderService, IExtensionResourceLoaderService } from "../common/extensionResourceLoader.js";
import { IExtensionGalleryManifestService } from "../../extensionManagement/common/extensionGalleryManifest.js";
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
let ExtensionResourceLoaderService = class ExtensionResourceLoaderService2 extends AbstractExtensionResourceLoaderService {
  static {
    __name(this, "ExtensionResourceLoaderService");
  }
  constructor(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, logService) {
    super(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, logService);
  }
  async readExtensionResource(uri) {
    uri = FileAccess.uriToBrowserUri(uri);
    if (uri.scheme !== Schemas.http && uri.scheme !== Schemas.https && uri.scheme !== Schemas.data) {
      const result = await this._fileService.readFile(uri);
      return result.value.toString();
    }
    const requestInit = {};
    if (await this.isExtensionGalleryResource(uri)) {
      requestInit.headers = await this.getExtensionGalleryRequestHeaders();
      requestInit.mode = "cors";
    }
    const response = await fetch(uri.toString(true), requestInit);
    if (response.status !== 200) {
      this._logService.info(`Request to '${uri.toString(true)}' failed with status code ${response.status}`);
      throw new Error(response.statusText);
    }
    return response.text();
  }
};
ExtensionResourceLoaderService = __decorate([
  __param(0, IFileService),
  __param(1, IStorageService),
  __param(2, IProductService),
  __param(3, IEnvironmentService),
  __param(4, IConfigurationService),
  __param(5, IExtensionGalleryManifestService),
  __param(6, ILogService)
], ExtensionResourceLoaderService);
registerSingleton(
  IExtensionResourceLoaderService,
  ExtensionResourceLoaderService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=extensionResourceLoaderService.js.map
