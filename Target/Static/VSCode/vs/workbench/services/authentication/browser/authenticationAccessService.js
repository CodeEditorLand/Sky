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
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { AllowedExtension } from "../common/authentication.js";
const IAuthenticationAccessService = createDecorator("IAuthenticationAccessService");
let AuthenticationAccessService = class extends Disposable {
  constructor(_storageService, _productService) {
    super();
    this._storageService = _storageService;
    this._productService = _productService;
  }
  static {
    __name(this, "AuthenticationAccessService");
  }
  _serviceBrand;
  _onDidChangeExtensionSessionAccess = this._register(new Emitter());
  onDidChangeExtensionSessionAccess = this._onDidChangeExtensionSessionAccess.event;
  isAccessAllowed(providerId, accountName, extensionId) {
    const trustedExtensionAuthAccess = this._productService.trustedExtensionAuthAccess;
    if (Array.isArray(trustedExtensionAuthAccess)) {
      if (trustedExtensionAuthAccess.includes(extensionId)) {
        return true;
      }
    } else if (trustedExtensionAuthAccess?.[providerId]?.includes(extensionId)) {
      return true;
    }
    const allowList = this.readAllowedExtensions(providerId, accountName);
    const extensionData = allowList.find((extension) => extension.id === extensionId);
    if (!extensionData) {
      return void 0;
    }
    return extensionData.allowed !== void 0 ? extensionData.allowed : true;
  }
  readAllowedExtensions(providerId, accountName) {
    let trustedExtensions = [];
    try {
      const trustedExtensionSrc = this._storageService.get(`${providerId}-${accountName}`, StorageScope.APPLICATION);
      if (trustedExtensionSrc) {
        trustedExtensions = JSON.parse(trustedExtensionSrc);
      }
    } catch (err) {
    }
    return trustedExtensions;
  }
  updateAllowedExtensions(providerId, accountName, extensions) {
    const allowList = this.readAllowedExtensions(providerId, accountName);
    for (const extension of extensions) {
      const index = allowList.findIndex((e) => e.id === extension.id);
      if (index === -1) {
        allowList.push(extension);
      } else {
        allowList[index].allowed = extension.allowed;
      }
    }
    this._storageService.store(`${providerId}-${accountName}`, JSON.stringify(allowList), StorageScope.APPLICATION, StorageTarget.USER);
    this._onDidChangeExtensionSessionAccess.fire({ providerId, accountName });
  }
  removeAllowedExtensions(providerId, accountName) {
    this._storageService.remove(`${providerId}-${accountName}`, StorageScope.APPLICATION);
    this._onDidChangeExtensionSessionAccess.fire({ providerId, accountName });
  }
};
AuthenticationAccessService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IProductService)
], AuthenticationAccessService);
registerSingleton(IAuthenticationAccessService, AuthenticationAccessService, InstantiationType.Delayed);
export {
  AuthenticationAccessService,
  IAuthenticationAccessService
};
//# sourceMappingURL=authenticationAccessService.js.map
