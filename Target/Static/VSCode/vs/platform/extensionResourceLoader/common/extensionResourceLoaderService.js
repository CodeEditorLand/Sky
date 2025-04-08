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
import { URI } from "../../../base/common/uri.js";
import { InstantiationType, registerSingleton } from "../../instantiation/common/extensions.js";
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
let ExtensionResourceLoaderService = class extends AbstractExtensionResourceLoaderService {
  constructor(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, _requestService, logService) {
    super(fileService, storageService, productService, environmentService, configurationService, extensionGalleryManifestService, logService);
    this._requestService = _requestService;
  }
  static {
    __name(this, "ExtensionResourceLoaderService");
  }
  async readExtensionResource(uri) {
    if (await this.isExtensionGalleryResource(uri)) {
      const headers = await this.getExtensionGalleryRequestHeaders();
      const requestContext = await this._requestService.request({ url: uri.toString(), headers }, CancellationToken.None);
      return await asTextOrError(requestContext) || "";
    }
    const result = await this._fileService.readFile(uri);
    return result.value.toString();
  }
};
ExtensionResourceLoaderService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IExtensionGalleryManifestService),
  __decorateParam(6, IRequestService),
  __decorateParam(7, ILogService)
], ExtensionResourceLoaderService);
registerSingleton(IExtensionResourceLoaderService, ExtensionResourceLoaderService, InstantiationType.Delayed);
export {
  ExtensionResourceLoaderService
};
//# sourceMappingURL=extensionResourceLoaderService.js.map
