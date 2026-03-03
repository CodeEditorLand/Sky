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
import { Emitter, Event } from "../../../../base/common/event.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { AbstractUserDataProfileStorageService, IUserDataProfileStorageService } from "../../../../platform/userDataProfile/common/userDataProfileStorageService.js";
import { isProfileUsingDefaultStorage, IStorageService } from "../../../../platform/storage/common/storage.js";
import { IndexedDBStorageDatabase } from "../../storage/browser/storageService.js";
import { IUserDataProfileService } from "../common/userDataProfile.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
let UserDataProfileStorageService = class UserDataProfileStorageService2 extends AbstractUserDataProfileStorageService {
  static {
    __name(this, "UserDataProfileStorageService");
  }
  constructor(storageService, userDataProfileService, logService) {
    super(true, storageService);
    this.userDataProfileService = userDataProfileService;
    this.logService = logService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    const disposables = this._register(new DisposableStore());
    this._register(Event.filter(storageService.onDidChangeTarget, (e) => e.scope === 0, disposables)(() => this.onDidChangeStorageTargetInCurrentProfile()));
    this._register(storageService.onDidChangeValue(0, void 0, disposables)((e) => this.onDidChangeStorageValueInCurrentProfile(e)));
  }
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
UserDataProfileStorageService = __decorate([
  __param(0, IStorageService),
  __param(1, IUserDataProfileService),
  __param(2, ILogService)
], UserDataProfileStorageService);
registerSingleton(
  IUserDataProfileStorageService,
  UserDataProfileStorageService,
  1
  /* InstantiationType.Delayed */
);
export {
  UserDataProfileStorageService
};
//# sourceMappingURL=userDataProfileStorageService.js.map
