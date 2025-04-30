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
var UserDataProfilesReadonlyService_1, UserDataProfilesService_1;
import { URI } from "../../../base/common/uri.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { IStateReadService, IStateService } from "../../state/node/state.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { UserDataProfilesService as BaseUserDataProfilesService } from "../common/userDataProfile.js";
import { isString } from "../../../base/common/types.js";
import { StateService } from "../../state/node/stateService.js";
let UserDataProfilesReadonlyService = UserDataProfilesReadonlyService_1 = class UserDataProfilesReadonlyService2 extends BaseUserDataProfilesService {
  static {
    __name(this, "UserDataProfilesReadonlyService");
  }
  constructor(stateReadonlyService, uriIdentityService, nativeEnvironmentService, fileService, logService) {
    super(nativeEnvironmentService, fileService, uriIdentityService, logService);
    this.stateReadonlyService = stateReadonlyService;
    this.nativeEnvironmentService = nativeEnvironmentService;
  }
  getStoredProfiles() {
    const storedProfilesState = this.stateReadonlyService.getItem(UserDataProfilesReadonlyService_1.PROFILES_KEY, []);
    return storedProfilesState.map((p) => ({ ...p, location: isString(p.location) ? this.uriIdentityService.extUri.joinPath(this.profilesHome, p.location) : URI.revive(p.location) }));
  }
  getStoredProfileAssociations() {
    return this.stateReadonlyService.getItem(UserDataProfilesReadonlyService_1.PROFILE_ASSOCIATIONS_KEY, {});
  }
  getDefaultProfileExtensionsLocation() {
    return this.uriIdentityService.extUri.joinPath(URI.file(this.nativeEnvironmentService.extensionsPath).with({ scheme: this.profilesHome.scheme }), "extensions.json");
  }
};
UserDataProfilesReadonlyService = UserDataProfilesReadonlyService_1 = __decorate([
  __param(0, IStateReadService),
  __param(1, IUriIdentityService),
  __param(2, INativeEnvironmentService),
  __param(3, IFileService),
  __param(4, ILogService)
], UserDataProfilesReadonlyService);
let UserDataProfilesService = UserDataProfilesService_1 = class UserDataProfilesService2 extends UserDataProfilesReadonlyService {
  static {
    __name(this, "UserDataProfilesService");
  }
  constructor(stateService, uriIdentityService, environmentService, fileService, logService) {
    super(stateService, uriIdentityService, environmentService, fileService, logService);
    this.stateService = stateService;
  }
  saveStoredProfiles(storedProfiles) {
    if (storedProfiles.length) {
      this.stateService.setItem(UserDataProfilesService_1.PROFILES_KEY, storedProfiles.map((profile) => ({ ...profile, location: this.uriIdentityService.extUri.basename(profile.location) })));
    } else {
      this.stateService.removeItem(UserDataProfilesService_1.PROFILES_KEY);
    }
  }
  saveStoredProfileAssociations(storedProfileAssociations) {
    if (storedProfileAssociations.emptyWindows || storedProfileAssociations.workspaces) {
      this.stateService.setItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_KEY, storedProfileAssociations);
    } else {
      this.stateService.removeItem(UserDataProfilesService_1.PROFILE_ASSOCIATIONS_KEY);
    }
  }
};
UserDataProfilesService = UserDataProfilesService_1 = __decorate([
  __param(0, IStateService),
  __param(1, IUriIdentityService),
  __param(2, INativeEnvironmentService),
  __param(3, IFileService),
  __param(4, ILogService)
], UserDataProfilesService);
let ServerUserDataProfilesService = class ServerUserDataProfilesService2 extends UserDataProfilesService {
  static {
    __name(this, "ServerUserDataProfilesService");
  }
  constructor(uriIdentityService, environmentService, fileService, logService) {
    super(new StateService(0, environmentService, logService, fileService), uriIdentityService, environmentService, fileService, logService);
  }
  async init() {
    await this.stateService.init();
    return super.init();
  }
};
ServerUserDataProfilesService = __decorate([
  __param(0, IUriIdentityService),
  __param(1, INativeEnvironmentService),
  __param(2, IFileService),
  __param(3, ILogService)
], ServerUserDataProfilesService);
export {
  ServerUserDataProfilesService,
  UserDataProfilesReadonlyService,
  UserDataProfilesService
};
//# sourceMappingURL=userDataProfile.js.map
