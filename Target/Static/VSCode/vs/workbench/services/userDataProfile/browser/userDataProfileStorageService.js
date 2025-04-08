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
import { IStorageDatabase } from "../../../../base/parts/storage/common/storage.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { AbstractUserDataProfileStorageService, IProfileStorageChanges, IUserDataProfileStorageService } from "../../../../platform/userDataProfile/common/userDataProfileStorageService.js";
import { IProfileStorageValueChangeEvent, isProfileUsingDefaultStorage, IStorageService, StorageScope } from "../../../../platform/storage/common/storage.js";
import { IUserDataProfile } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IndexedDBStorageDatabase } from "../../storage/browser/storageService.js";
import { IUserDataProfileService } from "../common/userDataProfile.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
let UserDataProfileStorageService = class extends AbstractUserDataProfileStorageService {
  constructor(storageService, userDataProfileService, logService) {
    super(true, storageService);
    this.userDataProfileService = userDataProfileService;
    this.logService = logService;
    const disposables = this._register(new DisposableStore());
    this._register(Event.filter(storageService.onDidChangeTarget, (e) => e.scope === StorageScope.PROFILE, disposables)(() => this.onDidChangeStorageTargetInCurrentProfile()));
    this._register(storageService.onDidChangeValue(StorageScope.PROFILE, void 0, disposables)((e) => this.onDidChangeStorageValueInCurrentProfile(e)));
  }
  static {
    __name(this, "UserDataProfileStorageService");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  onDidChangeStorageTargetInCurrentProfile() {
    this._onDidChange.fire({ targetChanges: [this.userDataProfileService.currentProfile], valueChanges: [] });
  }
  onDidChangeStorageValueInCurrentProfile(e) {
    this._onDidChange.fire({ targetChanges: [], valueChanges: [{ profile: this.userDataProfileService.currentProfile, changes: [e] }] });
  }
  createStorageDatabase(profile) {
    return isProfileUsingDefaultStorage(profile) ? IndexedDBStorageDatabase.createApplicationStorage(this.logService) : IndexedDBStorageDatabase.createProfileStorage(profile, this.logService);
  }
};
UserDataProfileStorageService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, ILogService)
], UserDataProfileStorageService);
registerSingleton(IUserDataProfileStorageService, UserDataProfileStorageService, InstantiationType.Delayed);
export {
  UserDataProfileStorageService
};
//# sourceMappingURL=userDataProfileStorageService.js.map
