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
import { Disposable, DisposableMap, MutableDisposable, isDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { IStorage, IStorageDatabase, Storage } from "../../../base/parts/storage/common/storage.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { AbstractStorageService, IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget, isProfileUsingDefaultStorage } from "../../storage/common/storage.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { IRemoteService } from "../../ipc/common/services.js";
import { ILogService } from "../../log/common/log.js";
import { ApplicationStorageDatabaseClient, ProfileStorageDatabaseClient } from "../../storage/common/storageIpc.js";
import { IUserDataProfile, IUserDataProfilesService, reviveProfile } from "./userDataProfile.js";
const IUserDataProfileStorageService = createDecorator("IUserDataProfileStorageService");
let AbstractUserDataProfileStorageService = class extends Disposable {
  constructor(persistStorages, storageService) {
    super();
    this.storageService = storageService;
    if (persistStorages) {
      this.storageServicesMap = this._register(new DisposableMap());
    }
  }
  static {
    __name(this, "AbstractUserDataProfileStorageService");
  }
  _serviceBrand;
  storageServicesMap;
  async readStorageData(profile) {
    return this.withProfileScopedStorageService(profile, async (storageService) => this.getItems(storageService));
  }
  async updateStorageData(profile, data, target) {
    return this.withProfileScopedStorageService(profile, async (storageService) => this.writeItems(storageService, data, target));
  }
  async withProfileScopedStorageService(profile, fn) {
    if (this.storageService.hasScope(profile)) {
      return fn(this.storageService);
    }
    let storageService = this.storageServicesMap?.get(profile.id);
    if (!storageService) {
      storageService = new StorageService(this.createStorageDatabase(profile));
      this.storageServicesMap?.set(profile.id, storageService);
      try {
        await storageService.initialize();
      } catch (error) {
        if (this.storageServicesMap?.has(profile.id)) {
          this.storageServicesMap.deleteAndDispose(profile.id);
        } else {
          storageService.dispose();
        }
        throw error;
      }
    }
    try {
      const result = await fn(storageService);
      await storageService.flush();
      return result;
    } finally {
      if (!this.storageServicesMap?.has(profile.id)) {
        storageService.dispose();
      }
    }
  }
  getItems(storageService) {
    const result = /* @__PURE__ */ new Map();
    const populate = /* @__PURE__ */ __name((target) => {
      for (const key of storageService.keys(StorageScope.PROFILE, target)) {
        result.set(key, { value: storageService.get(key, StorageScope.PROFILE), target });
      }
    }, "populate");
    populate(StorageTarget.USER);
    populate(StorageTarget.MACHINE);
    return result;
  }
  writeItems(storageService, items, target) {
    storageService.storeAll(Array.from(items.entries()).map(([key, value]) => ({ key, value, scope: StorageScope.PROFILE, target })), true);
  }
};
AbstractUserDataProfileStorageService = __decorateClass([
  __decorateParam(1, IStorageService)
], AbstractUserDataProfileStorageService);
class RemoteUserDataProfileStorageService extends AbstractUserDataProfileStorageService {
  constructor(persistStorages, remoteService, userDataProfilesService, storageService, logService) {
    super(persistStorages, storageService);
    this.remoteService = remoteService;
    const channel = remoteService.getChannel("profileStorageListener");
    const disposable = this._register(new MutableDisposable());
    this._onDidChange = this._register(new Emitter({
      // Start listening to profile storage changes only when someone is listening
      onWillAddFirstListener: /* @__PURE__ */ __name(() => {
        disposable.value = channel.listen("onDidChange")((e) => {
          logService.trace("profile storage changes", e);
          this._onDidChange.fire({
            targetChanges: e.targetChanges.map((profile) => reviveProfile(profile, userDataProfilesService.profilesHome.scheme)),
            valueChanges: e.valueChanges.map((e2) => ({ ...e2, profile: reviveProfile(e2.profile, userDataProfilesService.profilesHome.scheme) }))
          });
        });
      }, "onWillAddFirstListener"),
      // Stop listening to profile storage changes when no one is listening
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => disposable.value = void 0, "onDidRemoveLastListener")
    }));
    this.onDidChange = this._onDidChange.event;
  }
  static {
    __name(this, "RemoteUserDataProfileStorageService");
  }
  _onDidChange;
  onDidChange;
  async createStorageDatabase(profile) {
    const storageChannel = this.remoteService.getChannel("storage");
    return isProfileUsingDefaultStorage(profile) ? new ApplicationStorageDatabaseClient(storageChannel) : new ProfileStorageDatabaseClient(storageChannel, profile);
  }
}
class StorageService extends AbstractStorageService {
  constructor(profileStorageDatabase) {
    super({ flushInterval: 100 });
    this.profileStorageDatabase = profileStorageDatabase;
  }
  static {
    __name(this, "StorageService");
  }
  profileStorage;
  async doInitialize() {
    const profileStorageDatabase = await this.profileStorageDatabase;
    const profileStorage = new Storage(profileStorageDatabase);
    this._register(profileStorage.onDidChangeStorage((e) => {
      this.emitDidChangeValue(StorageScope.PROFILE, e);
    }));
    this._register(toDisposable(() => {
      profileStorage.close();
      profileStorage.dispose();
      if (isDisposable(profileStorageDatabase)) {
        profileStorageDatabase.dispose();
      }
    }));
    this.profileStorage = profileStorage;
    return this.profileStorage.init();
  }
  getStorage(scope) {
    return scope === StorageScope.PROFILE ? this.profileStorage : void 0;
  }
  getLogDetails() {
    return void 0;
  }
  async switchToProfile() {
  }
  async switchToWorkspace() {
  }
  hasScope() {
    return false;
  }
}
export {
  AbstractUserDataProfileStorageService,
  IUserDataProfileStorageService,
  RemoteUserDataProfileStorageService
};
//# sourceMappingURL=userDataProfileStorageService.js.map
