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
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { URI } from "../../../base/common/uri.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { IStorageService } from "../../storage/common/storage.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { IUserDataProfile, IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { AbstractFileSynchroniser, AbstractInitializer, IAcceptResult, IFileResourcePreview, IMergeResult } from "./abstractSynchronizer.js";
import { Change, IRemoteUserData, IUserDataSyncLocalStoreService, IUserDataSyncConfiguration, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, SyncResource, USER_DATA_SYNC_SCHEME } from "./userDataSync.js";
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
let TasksSynchroniser = class extends AbstractFileSynchroniser {
  static {
    __name(this, "TasksSynchroniser");
  }
  version = 1;
  previewResource = this.extUri.joinPath(this.syncPreviewFolder, "tasks.json");
  baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" });
  localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" });
  remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" });
  acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
  constructor(profile, collection, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, telemetryService, uriIdentityService) {
    super(profile.tasksResource, { syncResource: SyncResource.Tasks, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration) {
    const remoteContent = remoteUserData.syncData ? getTasksContentFromSyncContent(remoteUserData.syncData.content, this.logService) : null;
    lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
    const lastSyncContent = lastSyncUserData?.syncData ? getTasksContentFromSyncContent(lastSyncUserData.syncData.content, this.logService) : null;
    const fileContent = await this.getLocalFileContent();
    let content = null;
    let hasLocalChanged = false;
    let hasRemoteChanged = false;
    let hasConflicts = false;
    if (remoteUserData.syncData) {
      const localContent2 = fileContent ? fileContent.value.toString() : null;
      if (!lastSyncContent || lastSyncContent !== localContent2 || lastSyncContent !== remoteContent) {
        this.logService.trace(`${this.syncResourceLogLabel}: Merging remote tasks with local tasks...`);
        const result = merge(localContent2, remoteContent, lastSyncContent);
        content = result.content;
        hasConflicts = result.hasConflicts;
        hasLocalChanged = result.hasLocalChanged;
        hasRemoteChanged = result.hasRemoteChanged;
      }
    } else if (fileContent) {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote tasks does not exist. Synchronizing tasks for the first time.`);
      content = fileContent.value.toString();
      hasRemoteChanged = true;
    }
    const previewResult = {
      content: hasConflicts ? lastSyncContent : content,
      localChange: hasLocalChanged ? fileContent ? Change.Modified : Change.Added : Change.None,
      remoteChange: hasRemoteChanged ? Change.Modified : Change.None,
      hasConflicts
    };
    const localContent = fileContent ? fileContent.value.toString() : null;
    return [{
      fileContent,
      baseResource: this.baseResource,
      baseContent: lastSyncContent,
      localResource: this.localResource,
      localContent,
      localChange: previewResult.localChange,
      remoteResource: this.remoteResource,
      remoteContent,
      remoteChange: previewResult.remoteChange,
      previewResource: this.previewResource,
      previewResult,
      acceptedResource: this.acceptedResource
    }];
  }
  async hasRemoteChanged(lastSyncUserData) {
    const lastSyncContent = lastSyncUserData?.syncData ? getTasksContentFromSyncContent(lastSyncUserData.syncData.content, this.logService) : null;
    if (lastSyncContent === null) {
      return true;
    }
    const fileContent = await this.getLocalFileContent();
    const localContent = fileContent ? fileContent.value.toString() : null;
    const result = merge(localContent, lastSyncContent, lastSyncContent);
    return result.hasLocalChanged || result.hasRemoteChanged;
  }
  async getMergeResult(resourcePreview, token) {
    return resourcePreview.previewResult;
  }
  async getAcceptResult(resourcePreview, resource, content, token) {
    if (this.extUri.isEqual(resource, this.localResource)) {
      return {
        content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
        localChange: Change.None,
        remoteChange: Change.Modified
      };
    }
    if (this.extUri.isEqual(resource, this.remoteResource)) {
      return {
        content: resourcePreview.remoteContent,
        localChange: Change.Modified,
        remoteChange: Change.None
      };
    }
    if (this.extUri.isEqual(resource, this.previewResource)) {
      if (content === void 0) {
        return {
          content: resourcePreview.previewResult.content,
          localChange: resourcePreview.previewResult.localChange,
          remoteChange: resourcePreview.previewResult.remoteChange
        };
      } else {
        return {
          content,
          localChange: Change.Modified,
          remoteChange: Change.Modified
        };
      }
    }
    throw new Error(`Invalid Resource: ${resource.toString()}`);
  }
  async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
    const { fileContent } = resourcePreviews[0][0];
    const { content, localChange, remoteChange } = resourcePreviews[0][1];
    if (localChange === Change.None && remoteChange === Change.None) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing tasks.`);
    }
    if (localChange !== Change.None) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating local tasks...`);
      if (fileContent) {
        await this.backupLocal(JSON.stringify(this.toTasksSyncContent(fileContent.value.toString())));
      }
      if (content) {
        await this.updateLocalFileContent(content, fileContent, force);
      } else {
        await this.deleteLocalFile();
      }
      this.logService.info(`${this.syncResourceLogLabel}: Updated local tasks`);
    }
    if (remoteChange !== Change.None) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote tasks...`);
      const remoteContents = JSON.stringify(this.toTasksSyncContent(content));
      remoteUserData = await this.updateRemoteUserData(remoteContents, force ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote tasks`);
    }
    try {
      await this.fileService.del(this.previewResource);
    } catch (e) {
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized tasks...`);
      await this.updateLastSyncUserData(remoteUserData);
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized tasks`);
    }
  }
  async hasLocalData() {
    return this.fileService.exists(this.file);
  }
  async resolveContent(uri) {
    if (this.extUri.isEqual(this.remoteResource, uri) || this.extUri.isEqual(this.baseResource, uri) || this.extUri.isEqual(this.localResource, uri) || this.extUri.isEqual(this.acceptedResource, uri)) {
      return this.resolvePreviewContent(uri);
    }
    return null;
  }
  toTasksSyncContent(tasks) {
    return tasks ? { tasks } : {};
  }
};
TasksSynchroniser = __decorateClass([
  __decorateParam(2, IUserDataSyncStoreService),
  __decorateParam(3, IUserDataSyncLocalStoreService),
  __decorateParam(4, IUserDataSyncLogService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IUserDataSyncEnablementService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IEnvironmentService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IUriIdentityService)
], TasksSynchroniser);
let TasksInitializer = class extends AbstractInitializer {
  static {
    __name(this, "TasksInitializer");
  }
  tasksResource = this.userDataProfilesService.defaultProfile.tasksResource;
  constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
    super(SyncResource.Tasks, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
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
TasksInitializer = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUriIdentityService)
], TasksInitializer);
function merge(originalLocalContent, originalRemoteContent, baseContent) {
  if (originalLocalContent === null && originalRemoteContent === null && baseContent === null) {
    return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
  }
  if (originalLocalContent === originalRemoteContent) {
    return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
  }
  const localForwarded = baseContent !== originalLocalContent;
  const remoteForwarded = baseContent !== originalRemoteContent;
  if (!localForwarded && !remoteForwarded) {
    return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
  }
  if (localForwarded && !remoteForwarded) {
    return { content: originalLocalContent, hasRemoteChanged: true, hasLocalChanged: false, hasConflicts: false };
  }
  if (remoteForwarded && !localForwarded) {
    return { content: originalRemoteContent, hasLocalChanged: true, hasRemoteChanged: false, hasConflicts: false };
  }
  return { content: originalLocalContent, hasLocalChanged: true, hasRemoteChanged: true, hasConflicts: true };
}
__name(merge, "merge");
export {
  TasksInitializer,
  TasksSynchroniser,
  getTasksContentFromSyncContent
};
//# sourceMappingURL=tasksSync.js.map
