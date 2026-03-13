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
import { registerSingleton } from "../../instantiation/common/extensions.js";
import { IFileService } from "../../files/common/files.js";
import { IProductService } from "../../product/common/productService.js";
import { asTextOrError, IRequestService } from "../../request/common/request.js";
import { IStorageService } from "../../storage/common/storage.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { AbstractExtensionResourceLoaderService, IExtensionResourceLoaderService } from "./extensionResourceLoader.js";
import { IExtensionGalleryManifestService } from "../../extensionManagement/common/extensionGalleryManifest.js";
import { ILogService } from "../../log/common/log.js";
let ExtensionResourceLoaderService = class ExtensionResourceLoaderService2 extends AbstractExtensionResourceLoaderService {
  static {
    __name(this, "ExtensionResourceLoaderService");
  }
  constructor(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, _requestService, logService) {
    super(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, logService);
    this._requestService = _requestService;
  }
  async readExtensionResource(uri) {
    if (await this.isExtensionGalleryResource(uri)) {
      const headers = await this.getExtensionGalleryRequestHeaders();
      const requestContext = await this._requestService.request({ url: uri.toString(), headers, callSite: "extensionResourceLoader.readExtensionResource" }, CancellationToken.None);
      return await asTextOrError(requestContext) || "";
    }
    const result = await this._fileService.readFile(uri);
    return result.value.toString();
  }
};
ExtensionResourceLoaderService = __decorate([
  __param(0, IFileService),
  __param(1, IStorageService),
  __param(2, IProductService),
  __param(3, IEnvironmentService),
  __param(4, IConfigurationService),
  __param(5, IExtensionGalleryManifestService),
  __param(6, IRequestService),
  __param(7, ILogService)
], ExtensionResourceLoaderService);
registerSingleton(
  IExtensionResourceLoaderService,
  ExtensionResourceLoaderService,
  1
  /* InstantiationType.Delayed */
);
export {
  ExtensionResourceLoaderService
};
//# sourceMappingURL=extensionResourceLoaderService.js.map
