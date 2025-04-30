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
import { Event } from "../../../../base/common/event.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { deepClone } from "../../../../base/common/objects.js";
import { IStorageService } from "../../../storage/common/storage.js";
import { ITelemetryService } from "../../../telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../../uriIdentity/common/uriIdentity.js";
import { IEnvironmentService } from "../../../environment/common/environment.js";
import { isPromptOrInstructionsFile } from "../../../prompts/common/constants.js";
import { IConfigurationService } from "../../../configuration/common/configuration.js";
import { areSame, merge } from "./promptsMerge.js";
import { AbstractSynchroniser } from "../abstractSynchronizer.js";
import { FileOperationError, IFileService } from "../../../files/common/files.js";
import { IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, USER_DATA_SYNC_SCHEME } from "../userDataSync.js";
function parsePrompts(syncData) {
  return JSON.parse(syncData.content);
}
__name(parsePrompts, "parsePrompts");
let PromptsSynchronizer = class PromptsSynchronizer2 extends AbstractSynchroniser {
  static {
    __name(this, "PromptsSynchronizer");
  }
  constructor(profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, telemetryService, uriIdentityService) {
    const syncResource = { syncResource: "prompts", profile };
    super(syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.version = 1;
    this.promptsFolder = profile.promptsHome;
    this._register(this.fileService.watch(environmentService.userRoamingDataHome));
    this._register(this.fileService.watch(this.promptsFolder));
    this._register(Event.filter(this.fileService.onDidFilesChange, (e) => e.affects(this.promptsFolder))(() => this.triggerLocalChange()));
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
    const local = await this.getPromptsFileContents();
    const localPrompts = this.toPromptContents(local);
    const remotePrompts = remoteUserData.syncData ? this.parsePrompts(remoteUserData.syncData) : null;
    lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
    const lastSyncPrompts = lastSyncUserData && lastSyncUserData.syncData ? this.parsePrompts(lastSyncUserData.syncData) : null;
    if (remotePrompts) {
      this.logService.trace(`${this.syncResourceLogLabel}: Merging remote prompts with local prompts...`);
    } else {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote prompts does not exist. Synchronizing prompts for the first time.`);
    }
    const mergeResult = merge(localPrompts, remotePrompts, lastSyncPrompts);
    return this.getResourcePreviews(mergeResult, local, remotePrompts || {}, lastSyncPrompts || {});
  }
  async hasRemoteChanged(lastSyncUserData) {
    const lastSync = lastSyncUserData.syncData ? this.parsePrompts(lastSyncUserData.syncData) : null;
    if (lastSync === null) {
      return true;
    }
    const local = await this.getPromptsFileContents();
    const localPrompts = this.toPromptContents(local);
    const mergeResult = merge(localPrompts, lastSync, lastSync);
    return Object.keys(mergeResult.remote.added).length > 0 || Object.keys(mergeResult.remote.updated).length > 0 || mergeResult.remote.removed.length > 0 || mergeResult.conflicts.length > 0;
  }
  async getMergeResult(resourcePreview, token) {
    return resourcePreview.previewResult;
  }
  async getAcceptResult(resourcePreview, resource, content, token) {
    if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }))) {
      return {
        content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
        localChange: 0,
        remoteChange: resourcePreview.fileContent ? resourcePreview.remoteContent !== null ? 2 : 1 : 3
        /* Change.Deleted */
      };
    }
    if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }))) {
      return {
        content: resourcePreview.remoteContent,
        localChange: resourcePreview.remoteContent !== null ? resourcePreview.fileContent ? 2 : 1 : 3,
        remoteChange: 0
      };
    }
    if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder)) {
      if (content === void 0) {
        return {
          content: resourcePreview.previewResult.content,
          localChange: resourcePreview.previewResult.localChange,
          remoteChange: resourcePreview.previewResult.remoteChange
        };
      } else {
        return {
          content,
          localChange: content === null ? resourcePreview.fileContent !== null ? 3 : 0 : 2,
          remoteChange: content === null ? resourcePreview.remoteContent !== null ? 3 : 0 : 2
          /* Change.Modified */
        };
      }
    }
    throw new Error(`Invalid Resource: ${resource.toString()}`);
  }
  async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
    const accptedResourcePreviews = resourcePreviews.map(([resourcePreview, acceptResult]) => ({ ...resourcePreview, acceptResult }));
    if (accptedResourcePreviews.every(
      ({ localChange, remoteChange }) => localChange === 0 && remoteChange === 0
      /* Change.None */
    )) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing prompts.`);
    }
    if (accptedResourcePreviews.some(
      ({ localChange }) => localChange !== 0
      /* Change.None */
    )) {
      await this.updateLocalBackup(accptedResourcePreviews);
      await this.updateLocalPrompts(accptedResourcePreviews, force);
    }
    if (accptedResourcePreviews.some(
      ({ remoteChange }) => remoteChange !== 0
      /* Change.None */
    )) {
      remoteUserData = await this.updateRemotePrompts(accptedResourcePreviews, remoteUserData, force);
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized prompts...`);
      await this.updateLastSyncUserData(remoteUserData);
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized prompts`);
    }
    for (const { previewResource } of accptedResourcePreviews) {
      try {
        await this.fileService.del(previewResource);
      } catch (e) {
      }
    }
  }
  getResourcePreviews(mergeResult, localFileContent, remote, base) {
    const resourcePreviews = /* @__PURE__ */ new Map();
    for (const key of Object.keys(mergeResult.local.added)) {
      const previewResult = {
        content: mergeResult.local.added[key],
        hasConflicts: false,
        localChange: 1,
        remoteChange: 0
      };
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: null,
        fileContent: null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        localContent: null,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remote[key],
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of Object.keys(mergeResult.local.updated)) {
      const previewResult = {
        content: mergeResult.local.updated[key],
        hasConflicts: false,
        localChange: 2,
        remoteChange: 0
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: base[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key],
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remote[key],
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of mergeResult.local.removed) {
      const previewResult = {
        content: null,
        hasConflicts: false,
        localChange: 3,
        remoteChange: 0
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: base[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key],
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: null,
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of Object.keys(mergeResult.remote.added)) {
      const previewResult = {
        content: mergeResult.remote.added[key],
        hasConflicts: false,
        localChange: 0,
        remoteChange: 1
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: base[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key],
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: null,
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of Object.keys(mergeResult.remote.updated)) {
      const previewResult = {
        content: mergeResult.remote.updated[key],
        hasConflicts: false,
        localChange: 0,
        remoteChange: 2
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: base[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key],
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remote[key],
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of mergeResult.remote.removed) {
      const previewResult = {
        content: null,
        hasConflicts: false,
        localChange: 0,
        remoteChange: 3
      };
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: base[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: null,
        localContent: null,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remote[key],
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of mergeResult.conflicts) {
      const previewResult = {
        content: base[key] ?? null,
        hasConflicts: true,
        localChange: localFileContent[key] ? 2 : 1,
        remoteChange: remote[key] ? 2 : 1
        /* Change.Added */
      };
      const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
      resourcePreviews.set(key, {
        baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
        baseContent: base[key] ?? null,
        localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
        fileContent: localFileContent[key] || null,
        localContent,
        remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
        remoteContent: remote[key] || null,
        previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
        previewResult,
        localChange: previewResult.localChange,
        remoteChange: previewResult.remoteChange,
        acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
      });
    }
    for (const key of Object.keys(localFileContent)) {
      if (!resourcePreviews.has(key)) {
        const previewResult = {
          content: localFileContent[key] ? localFileContent[key].value.toString() : null,
          hasConflicts: false,
          localChange: 0,
          remoteChange: 0
          /* Change.None */
        };
        const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
        resourcePreviews.set(key, {
          baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" }),
          baseContent: base[key] ?? null,
          localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" }),
          fileContent: localFileContent[key] || null,
          localContent,
          remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" }),
          remoteContent: remote[key] || null,
          previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
          previewResult,
          localChange: previewResult.localChange,
          remoteChange: previewResult.remoteChange,
          acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" })
        });
      }
    }
    return [...resourcePreviews.values()];
  }
  async resolveContent(uri) {
    if (this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" })) || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" })) || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" })) || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" }))) {
      return this.resolvePreviewContent(uri);
    }
    return null;
  }
  async hasLocalData() {
    try {
      const local = await this.getPromptsFileContents();
      if (Object.keys(local).length) {
        return true;
      }
    } catch (error) {
    }
    return false;
  }
  async updateLocalBackup(resourcePreviews) {
    const local = {};
    for (const resourcePreview of resourcePreviews) {
      if (resourcePreview.fileContent) {
        local[this.extUri.basename(resourcePreview.localResource)] = resourcePreview.fileContent;
      }
    }
    await this.backupLocal(JSON.stringify(this.toPromptContents(local)));
  }
  async updateLocalPrompts(resourcePreviews, force) {
    for (const { fileContent, acceptResult, localResource, remoteResource, localChange } of resourcePreviews) {
      if (localChange !== 0) {
        const key = remoteResource ? this.extUri.basename(remoteResource) : this.extUri.basename(localResource);
        const resource = this.extUri.joinPath(this.promptsFolder, key);
        if (localChange === 3) {
          this.logService.trace(`${this.syncResourceLogLabel}: Deleting prompt...`, this.extUri.basename(resource));
          await this.fileService.del(resource);
          this.logService.info(`${this.syncResourceLogLabel}: Deleted prompt`, this.extUri.basename(resource));
        } else if (localChange === 1) {
          this.logService.trace(`${this.syncResourceLogLabel}: Creating prompt...`, this.extUri.basename(resource));
          await this.fileService.createFile(resource, VSBuffer.fromString(acceptResult.content), { overwrite: force });
          this.logService.info(`${this.syncResourceLogLabel}: Created prompt`, this.extUri.basename(resource));
        } else {
          this.logService.trace(`${this.syncResourceLogLabel}: Updating prompt...`, this.extUri.basename(resource));
          await this.fileService.writeFile(resource, VSBuffer.fromString(acceptResult.content), force ? void 0 : fileContent);
          this.logService.info(`${this.syncResourceLogLabel}: Updated prompt`, this.extUri.basename(resource));
        }
      }
    }
  }
  async updateRemotePrompts(resourcePreviews, remoteUserData, forcePush) {
    const currentPrompts = remoteUserData.syncData ? this.parsePrompts(remoteUserData.syncData) : {};
    const newPrompts = deepClone(currentPrompts);
    for (const { acceptResult, localResource, remoteResource, remoteChange } of resourcePreviews) {
      if (remoteChange !== 0) {
        const key = localResource ? this.extUri.basename(localResource) : this.extUri.basename(remoteResource);
        if (remoteChange === 3) {
          delete newPrompts[key];
        } else {
          newPrompts[key] = acceptResult.content;
        }
      }
    }
    if (!areSame(currentPrompts, newPrompts)) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote prompts...`);
      remoteUserData = await this.updateRemoteUserData(JSON.stringify(newPrompts), forcePush ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote prompts`);
    }
    return remoteUserData;
  }
  parsePrompts(syncData) {
    return parsePrompts(syncData);
  }
  toPromptContents(fileContents) {
    const prompts = {};
    for (const key of Object.keys(fileContents)) {
      prompts[key] = fileContents[key].value.toString();
    }
    return prompts;
  }
  async getPromptsFileContents() {
    const prompts = {};
    let stat;
    try {
      stat = await this.fileService.resolve(this.promptsFolder);
    } catch (e) {
      if (e instanceof FileOperationError && e.fileOperationResult === 1) {
        return prompts;
      } else {
        throw e;
      }
    }
    for (const entry of stat.children || []) {
      const resource = entry.resource;
      if (isPromptOrInstructionsFile(resource) === false) {
        continue;
      }
      const key = this.extUri.relativePath(this.promptsFolder, resource);
      const content = await this.fileService.readFile(resource);
      prompts[key] = content;
    }
    return prompts;
  }
};
PromptsSynchronizer = __decorate([
  __param(2, IEnvironmentService),
  __param(3, IFileService),
  __param(4, IStorageService),
  __param(5, IUserDataSyncStoreService),
  __param(6, IUserDataSyncLocalStoreService),
  __param(7, IUserDataSyncLogService),
  __param(8, IConfigurationService),
  __param(9, IUserDataSyncEnablementService),
  __param(10, ITelemetryService),
  __param(11, IUriIdentityService)
], PromptsSynchronizer);
export {
  PromptsSynchronizer,
  parsePrompts
};
//# sourceMappingURL=promptsSync.js.map
