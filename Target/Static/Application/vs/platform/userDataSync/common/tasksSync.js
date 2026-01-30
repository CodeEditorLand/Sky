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
import { VSBuffer } from "../../../base/common/buffer.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { IStorageService } from "../../storage/common/storage.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { AbstractJsonSynchronizer } from "./abstractJsonSynchronizer.js";
import { AbstractInitializer } from "./abstractSynchronizer.js";
import { IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService } from "./userDataSync.js";
function getTasksContentFromSyncContent(syncContent, logService) {
  try {
    const parsed = JSON.parse(syncContent);
    return parsed.tasks ?? null;
  } catch (e) {
    logService.error(e);
    return null;
  }
}
__name(getTasksContentFromSyncContent, "getTasksContentFromSyncContent");
let TasksSynchroniser = class TasksSynchroniser2 extends AbstractJsonSynchronizer {
  static {
    __name(this, "TasksSynchroniser");
  }
  constructor(profile, collection, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, telemetryService, uriIdentityService) {
    super(profile.tasksResource, { syncResource: "tasks", profile }, collection, "tasks.json", fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
  }
  getContentFromSyncContent(syncContent) {
    return getTasksContentFromSyncContent(syncContent, this.logService);
  }
  toSyncContent(tasks) {
    return tasks ? { tasks } : {};
  }
};
TasksSynchroniser = __decorate([
  __param(2, IUserDataSyncStoreService),
  __param(3, IUserDataSyncLocalStoreService),
  __param(4, IUserDataSyncLogService),
  __param(5, IConfigurationService),
  __param(6, IUserDataSyncEnablementService),
  __param(7, IFileService),
  __param(8, IEnvironmentService),
  __param(9, IStorageService),
  __param(10, ITelemetryService),
  __param(11, IUriIdentityService)
], TasksSynchroniser);
let TasksInitializer = class TasksInitializer2 extends AbstractInitializer {
  static {
    __name(this, "TasksInitializer");
  }
  constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
    super("tasks", userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
    this.tasksResource = this.userDataProfilesService.defaultProfile.tasksResource;
  }
  async doInitialize(remoteUserData) {
    const tasksContent = remoteUserData.syncData ? getTasksContentFromSyncContent(remoteUserData.syncData.content, this.logService) : null;
    if (!tasksContent) {
      this.logService.info("Skipping initializing tasks because remote tasks does not exist.");
      return;
    }
    const isEmpty = await this.isEmpty();
    if (!isEmpty) {
      this.logService.info("Skipping initializing tasks because local tasks exist.");
      return;
    }
    await this.fileService.writeFile(this.tasksResource, VSBuffer.fromString(tasksContent));
    await this.updateLastSyncUserData(remoteUserData);
  }
  async isEmpty() {
    return this.fileService.exists(this.tasksResource);
  }
};
TasksInitializer = __decorate([
  __param(0, IFileService),
  __param(1, IUserDataProfilesService),
  __param(2, IEnvironmentService),
  __param(3, IUserDataSyncLogService),
  __param(4, IStorageService),
  __param(5, IUriIdentityService)
], TasksInitializer);
export {
  TasksInitializer,
  TasksSynchroniser,
  getTasksContentFromSyncContent
};
//# sourceMappingURL=tasksSync.js.map
