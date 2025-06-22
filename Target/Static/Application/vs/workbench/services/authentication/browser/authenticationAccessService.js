var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
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
const IAuthenticationAccessService = createDecorator("IAuthenticationAccessService");
let AuthenticationAccessService = class AuthenticationAccessService2 extends Disposable {
  static {
    __name(this, "AuthenticationAccessService");
  }
  constructor(_storageService, _productService) {
    super();
    this._storageService = _storageService;
    this._productService = _productService;
    this._onDidChangeExtensionSessionAccess = this._register(new Emitter());
    this.onDidChangeExtensionSessionAccess = this._onDidChangeExtensionSessionAccess.event;
  }
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
      const trustedExtensionSrc = this._storageService.get(
        `${providerId}-${accountName}`,
        -1
        /* StorageScope.APPLICATION */
      );
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
    this._storageService.store(
      `${providerId}-${accountName}`,
      JSON.stringify(allowList),
      -1,
      0
      /* StorageTarget.USER */
    );
    this._onDidChangeExtensionSessionAccess.fire({ providerId, accountName });
  }
  removeAllowedExtensions(providerId, accountName) {
    this._storageService.remove(
      `${providerId}-${accountName}`,
      -1
      /* StorageScope.APPLICATION */
    );
    this._onDidChangeExtensionSessionAccess.fire({ providerId, accountName });
  }
};
AuthenticationAccessService = __decorate([
  __param(0, IStorageService),
  __param(1, IProductService)
], AuthenticationAccessService);
registerSingleton(
  IAuthenticationAccessService,
  AuthenticationAccessService,
  1
  /* InstantiationType.Delayed */
);
export {
  AuthenticationAccessService,
  IAuthenticationAccessService
};
//# sourceMappingURL=authenticationAccessService.js.map
