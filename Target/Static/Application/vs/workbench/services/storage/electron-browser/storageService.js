var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { RemoteStorageService } from "../../../../platform/storage/common/storageService.js";
class NativeWorkbenchStorageService extends RemoteStorageService {
  static {
    __name(this, "NativeWorkbenchStorageService");
  }
  constructor(workspace, userDataProfileService, userDataProfilesService, mainProcessService, environmentService) {
    super(workspace, { currentProfile: userDataProfileService.currentProfile, defaultProfile: userDataProfilesService.defaultProfile }, mainProcessService, environmentService);
    this.userDataProfileService = userDataProfileService;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.userDataProfileService.onDidChangeCurrentProfile((e) => e.join(this.switchToProfile(e.profile))));
  }
}
export {
  NativeWorkbenchStorageService
};
//# sourceMappingURL=storageService.js.map
