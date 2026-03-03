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
import { WindowIdleValue } from "../../../../base/browser/dom.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { TRUSTED_DOMAINS_STORAGE_KEY, readStaticTrustedDomains } from "./trustedDomains.js";
import { isURLDomainTrusted } from "../../../../platform/url/common/trustedDomains.js";
import { Emitter } from "../../../../base/common/event.js";
import { ITrustedDomainService } from "../common/trustedDomainService.js";
let TrustedDomainService = class TrustedDomainService2 extends Disposable {
  static {
    __name(this, "TrustedDomainService");
  }
  constructor(_instantiationService, _storageService) {
    super();
    this._instantiationService = _instantiationService;
    this._storageService = _storageService;
    this._onDidChangeTrustedDomains = this._register(new Emitter());
    this.onDidChangeTrustedDomains = this._onDidChangeTrustedDomains.event;
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
    this._register(this._storageService.onDidChangeValue(-1, TRUSTED_DOMAINS_STORAGE_KEY, this._store)(() => {
      this._staticTrustedDomainsResult?.dispose();
      this._staticTrustedDomainsResult = initStaticDomainsResult();
      this._onDidChangeTrustedDomains.fire();
    }));
  }
  get trustedDomains() {
    return this._staticTrustedDomainsResult.value;
  }
  isValid(resource) {
    const { defaultTrustedDomains, trustedDomains } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
    const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains];
    return isURLDomainTrusted(resource, allTrustedDomains);
  }
};
TrustedDomainService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IStorageService)
], TrustedDomainService);
export {
  ITrustedDomainService,
  TrustedDomainService
};
//# sourceMappingURL=trustedDomainService.js.map
