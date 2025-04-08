var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { RemoteStorageService } from "../../../../platform/storage/common/storageService.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IAnyWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
class NativeWorkbenchStorageService extends RemoteStorageService {
  constructor(workspace, userDataProfileService, userDataProfilesService, mainProcessService, environmentService) {
    super(workspace, { currentProfile: userDataProfileService.currentProfile, defaultProfile: userDataProfilesService.defaultProfile }, mainProcessService, environmentService);
    this.userDataProfileService = userDataProfileService;
    this.registerListeners();
  }
  static {
    __name(this, "NativeWorkbenchStorageService");
  }
  registerListeners() {
    this._register(this.userDataProfileService.onDidChangeCurrentProfile((e) => e.join(this.switchToProfile(e.profile))));
  }
}
export {
  NativeWorkbenchStorageService
};
//# sourceMappingURL=storageService.js.map
