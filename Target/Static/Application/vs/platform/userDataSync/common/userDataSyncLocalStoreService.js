var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Promises } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { toLocalISOString } from "../../../base/common/date.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { joinPath } from "../../../base/common/resources.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService, toFileOperationResult } from "../../files/common/files.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { ALL_SYNC_RESOURCES, IUserDataSyncLogService } from "./userDataSync.js";
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
let UserDataSyncLocalStoreService = class UserDataSyncLocalStoreService2 extends Disposable {
  static {
    __name(this, "UserDataSyncLocalStoreService");
  }
  constructor(environmentService, fileService, configurationService, logService, userDataProfilesService) {
    super();
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.logService = logService;
    this.userDataProfilesService = userDataProfilesService;
    this.cleanUp();
  }
  async cleanUp() {
    for (const profile of this.userDataProfilesService.profiles) {
      for (const resource of ALL_SYNC_RESOURCES) {
        try {
          await this.cleanUpBackup(this.getResourceBackupHome(resource, profile.isDefault ? void 0 : profile.id));
        } catch (error) {
          this.logService.error(error);
        }
      }
    }
    let stat;
    try {
      stat = await this.fileService.resolve(this.environmentService.userDataSyncHome);
    } catch (error) {
      if (toFileOperationResult(error) !== 1) {
        this.logService.error(error);
      }
      return;
    }
    if (stat.children) {
      for (const child of stat.children) {
        if (child.isDirectory && !ALL_SYNC_RESOURCES.includes(child.name) && !this.userDataProfilesService.profiles.some((profile) => profile.id === child.name)) {
          try {
            this.logService.info("Deleting non existing profile from backup", child.resource.path);
            await this.fileService.del(child.resource, { recursive: true });
          } catch (error) {
            this.logService.error(error);
          }
        }
      }
    }
  }
  async getAllResourceRefs(resource, collection, root) {
    const folder = this.getResourceBackupHome(resource, collection, root);
    try {
      const stat = await this.fileService.resolve(folder);
      if (stat.children) {
        const all = stat.children.filter((stat2) => stat2.isFile && !stat2.name.startsWith("lastSync")).sort().reverse();
        return all.map((stat2) => ({
          ref: stat2.name,
          created: this.getCreationTime(stat2)
        }));
      }
    } catch (error) {
      if (toFileOperationResult(error) !== 1) {
        throw error;
      }
    }
    return [];
  }
  async resolveResourceContent(resourceKey, ref, collection, root) {
    const folder = this.getResourceBackupHome(resourceKey, collection, root);
    const file = joinPath(folder, ref);
    try {
      const content = await this.fileService.readFile(file);
      return content.value.toString();
    } catch (error) {
      this.logService.error(error);
      return null;
    }
  }
  async writeResource(resourceKey, content, cTime, collection, root) {
    const folder = this.getResourceBackupHome(resourceKey, collection, root);
    const resource = joinPath(folder, `${toLocalISOString(cTime).replace(/-|:|\.\d+Z$/g, "")}.json`);
    try {
      await this.fileService.writeFile(resource, VSBuffer.fromString(content));
    } catch (e) {
      this.logService.error(e);
    }
  }
  getResourceBackupHome(resource, collection, root = this.environmentService.userDataSyncHome) {
    return joinPath(root, ...collection ? [collection, resource] : [resource]);
  }
  async cleanUpBackup(folder) {
    try {
      try {
        if (!await this.fileService.exists(folder)) {
          return;
        }
      } catch (e) {
        return;
      }
      const stat = await this.fileService.resolve(folder);
      if (stat.children) {
        const all = stat.children.filter((stat2) => stat2.isFile && /^\d{8}T\d{6}(\.json)?$/.test(stat2.name)).sort();
        const backUpMaxAge = 1e3 * 60 * 60 * 24 * (this.configurationService.getValue("sync.localBackupDuration") || 30);
        let toDelete = all.filter((stat2) => Date.now() - this.getCreationTime(stat2) > backUpMaxAge);
        const remaining = all.length - toDelete.length;
        if (remaining < 10) {
          toDelete = toDelete.slice(10 - remaining);
        }
        await Promises.settled(toDelete.map(async (stat2) => {
          this.logService.info("Deleting from backup", stat2.resource.path);
          await this.fileService.del(stat2.resource);
        }));
      }
    } catch (e) {
      this.logService.error(e);
    }
  }
  getCreationTime(stat) {
    return new Date(parseInt(stat.name.substring(0, 4)), parseInt(stat.name.substring(4, 6)) - 1, parseInt(stat.name.substring(6, 8)), parseInt(stat.name.substring(9, 11)), parseInt(stat.name.substring(11, 13)), parseInt(stat.name.substring(13, 15))).getTime();
  }
};
UserDataSyncLocalStoreService = __decorate([
  __param(0, IEnvironmentService),
  __param(1, IFileService),
  __param(2, IConfigurationService),
  __param(3, IUserDataSyncLogService),
  __param(4, IUserDataProfilesService)
], UserDataSyncLocalStoreService);
export {
  UserDataSyncLocalStoreService
};
//# sourceMappingURL=userDataSyncLocalStoreService.js.map
