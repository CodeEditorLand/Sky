var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Queue } from "../../../../base/common/async.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IAuthenticationService } from "../common/authentication.js";
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
const IAuthenticationUsageService = createDecorator("IAuthenticationUsageService");
let AuthenticationUsageService = class AuthenticationUsageService2 extends Disposable {
  static {
    __name(this, "AuthenticationUsageService");
  }
  constructor(_storageService, _authenticationService, _logService, productService) {
    super();
    this._storageService = _storageService;
    this._authenticationService = _authenticationService;
    this._logService = _logService;
    this._queue = this._register(new Queue());
    this._extensionsUsingAuth = /* @__PURE__ */ new Set();
    this._disposed = false;
    this._register(toDisposable(() => this._disposed = true));
    const trustedExtensionAuthAccess = productService.trustedExtensionAuthAccess;
    if (Array.isArray(trustedExtensionAuthAccess)) {
      for (const extensionId of trustedExtensionAuthAccess) {
        this._extensionsUsingAuth.add(extensionId);
      }
    } else if (trustedExtensionAuthAccess) {
      for (const extensions of Object.values(trustedExtensionAuthAccess)) {
        for (const extensionId of extensions) {
          this._extensionsUsingAuth.add(extensionId);
        }
      }
    }
    this._register(this._authenticationService.onDidRegisterAuthenticationProvider((provider) => this._queue.queue(() => this._addExtensionsToCache(provider.id))));
  }
  async initializeExtensionUsageCache() {
    await this._queue.queue(() => Promise.all(this._authenticationService.getProviderIds().map((providerId) => this._addExtensionsToCache(providerId))));
  }
  async extensionUsesAuth(extensionId) {
    await this._queue.whenIdle();
    return this._extensionsUsingAuth.has(extensionId);
  }
  readAccountUsages(providerId, accountName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    const storedUsages = this._storageService.get(
      accountKey,
      -1
      /* StorageScope.APPLICATION */
    );
    let usages = [];
    if (storedUsages) {
      try {
        usages = JSON.parse(storedUsages);
      } catch (e) {
      }
    }
    return usages;
  }
  removeAccountUsage(providerId, accountName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    this._storageService.remove(
      accountKey,
      -1
      /* StorageScope.APPLICATION */
    );
  }
  addAccountUsage(providerId, accountName, scopes, extensionId, extensionName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    const usages = this.readAccountUsages(providerId, accountName);
    const existingUsageIndex = usages.findIndex((usage) => usage.extensionId === extensionId);
    if (existingUsageIndex > -1) {
      usages.splice(existingUsageIndex, 1, {
        extensionId,
        extensionName,
        scopes,
        lastUsed: Date.now()
      });
    } else {
      usages.push({
        extensionId,
        extensionName,
        scopes,
        lastUsed: Date.now()
      });
    }
    this._storageService.store(
      accountKey,
      JSON.stringify(usages),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
    this._extensionsUsingAuth.add(extensionId);
  }
  async _addExtensionsToCache(providerId) {
    if (this._disposed) {
      return;
    }
    try {
      const accounts = await this._authenticationService.getAccounts(providerId);
      for (const account of accounts) {
        const usage = this.readAccountUsages(providerId, account.label);
        for (const u of usage) {
          this._extensionsUsingAuth.add(u.extensionId);
        }
      }
    } catch (e) {
      this._logService.error(e);
    }
  }
};
AuthenticationUsageService = __decorate([
  __param(0, IStorageService),
  __param(1, IAuthenticationService),
  __param(2, ILogService),
  __param(3, IProductService)
], AuthenticationUsageService);
registerSingleton(
  IAuthenticationUsageService,
  AuthenticationUsageService,
  1
  /* InstantiationType.Delayed */
);
export {
  AuthenticationUsageService,
  IAuthenticationUsageService
};
//# sourceMappingURL=authenticationUsageService.js.map
