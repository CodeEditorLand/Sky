var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IUserDataSyncEnablementService, SyncResource } from "../../../../platform/userDataSync/common/userDataSync.js";
import { UserDataSyncEnablementService as BaseUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSyncEnablementService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
class UserDataSyncEnablementService extends BaseUserDataSyncEnablementService {
  static {
    __name(this, "UserDataSyncEnablementService");
  }
  get workbenchEnvironmentService() {
    return this.environmentService;
  }
  getResourceSyncStateVersion(resource) {
    return resource === SyncResource.Extensions ? this.workbenchEnvironmentService.options?.settingsSyncOptions?.extensionsSyncStateVersion : void 0;
  }
}
registerSingleton(IUserDataSyncEnablementService, UserDataSyncEnablementService, InstantiationType.Delayed);
export {
  UserDataSyncEnablementService
};
//# sourceMappingURL=userDataSyncEnablementService.js.map
