var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { UserDataSyncEnablementService as BaseUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSyncEnablementService.js";
class UserDataSyncEnablementService extends BaseUserDataSyncEnablementService {
  static {
    __name(this, "UserDataSyncEnablementService");
  }
  get workbenchEnvironmentService() {
    return this.environmentService;
  }
  getResourceSyncStateVersion(resource) {
    return resource === "extensions" ? this.workbenchEnvironmentService.options?.settingsSyncOptions?.extensionsSyncStateVersion : void 0;
  }
}
registerSingleton(
  IUserDataSyncEnablementService,
  UserDataSyncEnablementService,
  1
  /* InstantiationType.Delayed */
);
export {
  UserDataSyncEnablementService
};
//# sourceMappingURL=userDataSyncEnablementService.js.map
