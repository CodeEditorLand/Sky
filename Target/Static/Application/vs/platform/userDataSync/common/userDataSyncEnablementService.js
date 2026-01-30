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
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { isWeb } from "../../../base/common/platform.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IStorageService } from "../../storage/common/storage.js";
import { ALL_SYNC_RESOURCES, getEnablementKey, IUserDataSyncStoreManagementService } from "./userDataSync.js";
const enablementKey = "sync.enable";
let UserDataSyncEnablementService = class UserDataSyncEnablementService2 extends Disposable {
  static {
    __name(this, "UserDataSyncEnablementService");
  }
  constructor(storageService, environmentService, userDataSyncStoreManagementService) {
    super();
    this.storageService = storageService;
    this.environmentService = environmentService;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this._onDidChangeEnablement = new Emitter();
    this.onDidChangeEnablement = this._onDidChangeEnablement.event;
    this._onDidChangeResourceEnablement = new Emitter();
    this.onDidChangeResourceEnablement = this._onDidChangeResourceEnablement.event;
    this._register(storageService.onDidChangeValue(-1, void 0, this._store)((e) => this.onDidStorageChange(e)));
  }
  isEnabled() {
    switch (this.environmentService.sync) {
      case "on":
        return true;
      case "off":
        return false;
    }
    return this.storageService.getBoolean(enablementKey, -1, false);
  }
  canToggleEnablement() {
    return this.userDataSyncStoreManagementService.userDataSyncStore !== void 0 && this.environmentService.sync === void 0;
  }
  setEnablement(enabled) {
    if (enabled && !this.canToggleEnablement()) {
      return;
    }
    this.storageService.store(
      enablementKey,
      enabled,
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  isResourceEnabled(resource, defaultValue) {
    const storedValue = this.storageService.getBoolean(
      getEnablementKey(resource),
      -1
      /* StorageScope.APPLICATION */
    );
    defaultValue = defaultValue ?? resource !== "prompts";
    return storedValue ?? defaultValue;
  }
  isResourceEnablementConfigured(resource) {
    const storedValue = this.storageService.getBoolean(
      getEnablementKey(resource),
      -1
      /* StorageScope.APPLICATION */
    );
    return storedValue !== void 0;
  }
  setResourceEnablement(resource, enabled) {
    if (this.isResourceEnabled(resource) !== enabled) {
      const resourceEnablementKey = getEnablementKey(resource);
      this.storeResourceEnablement(resourceEnablementKey, enabled);
    }
  }
  getResourceSyncStateVersion(resource) {
    return void 0;
  }
  storeResourceEnablement(resourceEnablementKey, enabled) {
    this.storageService.store(
      resourceEnablementKey,
      enabled,
      -1,
      isWeb ? 0 : 1
      /* StorageTarget.MACHINE */
    );
  }
  onDidStorageChange(storageChangeEvent) {
    if (enablementKey === storageChangeEvent.key) {
      this._onDidChangeEnablement.fire(this.isEnabled());
      return;
    }
    const resourceKey = ALL_SYNC_RESOURCES.filter((resourceKey2) => getEnablementKey(resourceKey2) === storageChangeEvent.key)[0];
    if (resourceKey) {
      this._onDidChangeResourceEnablement.fire([resourceKey, this.isResourceEnabled(resourceKey)]);
      return;
    }
  }
};
UserDataSyncEnablementService = __decorate([
  __param(0, IStorageService),
  __param(1, IEnvironmentService),
  __param(2, IUserDataSyncStoreManagementService)
], UserDataSyncEnablementService);
export {
  UserDataSyncEnablementService
};
//# sourceMappingURL=userDataSyncEnablementService.js.map
