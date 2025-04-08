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
import { WindowIdleValue } from "../../../../base/browser/dom.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IInstantiationService, createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService, StorageScope } from "../../../../platform/storage/common/storage.js";
import { TRUSTED_DOMAINS_STORAGE_KEY, readStaticTrustedDomains } from "./trustedDomains.js";
import { isURLDomainTrusted } from "../common/trustedDomains.js";
import { Event, Emitter } from "../../../../base/common/event.js";
const ITrustedDomainService = createDecorator("ITrustedDomainService");
let TrustedDomainService = class extends Disposable {
  constructor(_instantiationService, _storageService) {
    super();
    this._instantiationService = _instantiationService;
    this._storageService = _storageService;
    const initStaticDomainsResult = /* @__PURE__ */ __name(() => {
      return new WindowIdleValue(mainWindow, () => {
        const { defaultTrustedDomains, trustedDomains } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
        return [
          ...defaultTrustedDomains,
          ...trustedDomains
        ];
      });
    }, "initStaticDomainsResult");
    this._staticTrustedDomainsResult = initStaticDomainsResult();
    this._register(this._storageService.onDidChangeValue(StorageScope.APPLICATION, TRUSTED_DOMAINS_STORAGE_KEY, this._store)(() => {
      this._staticTrustedDomainsResult?.dispose();
      this._staticTrustedDomainsResult = initStaticDomainsResult();
      this._onDidChangeTrustedDomains.fire();
    }));
  }
  static {
    __name(this, "TrustedDomainService");
  }
  _serviceBrand;
  _staticTrustedDomainsResult;
  _onDidChangeTrustedDomains = this._register(new Emitter());
  onDidChangeTrustedDomains = this._onDidChangeTrustedDomains.event;
  isValid(resource) {
    const { defaultTrustedDomains, trustedDomains } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
    const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains];
    return isURLDomainTrusted(resource, allTrustedDomains);
  }
};
TrustedDomainService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IStorageService)
], TrustedDomainService);
export {
  ITrustedDomainService,
  TrustedDomainService
};
//# sourceMappingURL=trustedDomainService.js.map
