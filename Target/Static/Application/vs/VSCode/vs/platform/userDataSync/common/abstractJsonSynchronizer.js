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
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { IStorageService } from "../../storage/common/storage.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { AbstractFileSynchroniser } from "./abstractSynchronizer.js";
import { IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, USER_DATA_SYNC_SCHEME } from "./userDataSync.js";
let AbstractJsonSynchronizer = class AbstractJsonSynchronizer2 extends AbstractFileSynchroniser {
  static {
    __name(this, "AbstractJsonSynchronizer");
  }
  constructor(fileResource, syncResourceMetadata, collection, previewFileName, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService) {
    super(fileResource, syncResourceMetadata, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.version = 1;
    this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, previewFileName);
    this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" });
    this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" });
    this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" });
    this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration) {
    const remoteContent = remoteUserData.syncData ? this.getContentFromSyncContent(remoteUserData.syncData.content) : null;
    lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
    const lastSyncContent = lastSyncUserData?.syncData ? this.getContentFromSyncContent(lastSyncUserData.syncData.content) : null;
    const fileContent = await this.getLocalFileContent();
    let content = null;
    let hasLocalChanged = false;
    let hasRemoteChanged = false;
    let hasConflicts = false;
    if (remoteUserData.syncData) {
      const localContent2 = fileContent ? fileContent.value.toString() : null;
      if (!lastSyncContent || lastSyncContent !== localContent2 || lastSyncContent !== remoteContent) {
        this.logService.trace(`${this.syncResourceLogLabel}: Merging remote ${this.syncResource.syncResource} with local ${this.syncResource.syncResource}...`);
        const result = this.merge(localContent2, remoteContent, lastSyncContent);
        content = result.content;
        hasConflicts = result.hasConflicts;
        hasLocalChanged = result.hasLocalChanged;
        hasRemoteChanged = result.hasRemoteChanged;
      }
    } else if (fileContent) {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote ${this.syncResource.syncResource} does not exist. Synchronizing ${this.syncResource.syncResource} for the first time.`);
      content = fileContent.value.toString();
      hasRemoteChanged = true;
    }
    const previewResult = {
      content: hasConflicts ? lastSyncContent : content,
      localChange: hasLocalChanged ? fileContent ? 2 : 1 : 0,
      remoteChange: hasRemoteChanged ? 2 : 0,
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
    const lastSyncContent = lastSyncUserData?.syncData ? this.getContentFromSyncContent(lastSyncUserData.syncData.content) : null;
    if (lastSyncContent === null) {
      return true;
    }
    const fileContent = await this.getLocalFileContent();
    const localContent = fileContent ? fileContent.value.toString() : null;
    const result = this.merge(localContent, lastSyncContent, lastSyncContent);
    return result.hasLocalChanged || result.hasRemoteChanged;
  }
  async getMergeResult(resourcePreview, token) {
    return resourcePreview.previewResult;
  }
  async getAcceptResult(resourcePreview, resource, content, token) {
    if (this.extUri.isEqual(resource, this.localResource)) {
      return {
        content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
        localChange: 0,
        remoteChange: 2
      };
    }
    if (this.extUri.isEqual(resource, this.remoteResource)) {
      return {
        content: resourcePreview.remoteContent,
        localChange: 2,
        remoteChange: 0
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
          localChange: 2,
          remoteChange: 2
        };
      }
    }
    throw new Error(`Invalid Resource: ${resource.toString()}`);
  }
  async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
    const { fileContent } = resourcePreviews[0][0];
    const { content, localChange, remoteChange } = resourcePreviews[0][1];
    if (localChange === 0 && remoteChange === 0) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing ${this.syncResource.syncResource}.`);
    }
    if (localChange !== 0) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating local ${this.syncResource.syncResource}...`);
      if (fileContent) {
        await this.backupLocal(JSON.stringify(this.toSyncContent(fileContent.value.toString())));
      }
      if (content) {
        await this.updateLocalFileContent(content, fileContent, force);
      } else {
        await this.deleteLocalFile();
      }
      this.logService.info(`${this.syncResourceLogLabel}: Updated local ${this.syncResource.syncResource}`);
    }
    if (remoteChange !== 0) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote ${this.syncResource.syncResource}...`);
      const remoteContents = JSON.stringify(this.toSyncContent(content));
      remoteUserData = await this.updateRemoteUserData(remoteContents, force ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote ${this.syncResource.syncResource}`);
    }
    try {
      await this.fileService.del(this.previewResource);
    } catch (e) {
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized ${this.syncResource.syncResource}...`);
      await this.updateLastSyncUserData(remoteUserData);
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized ${this.syncResource.syncResource}`);
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
  merge(originalLocalContent, originalRemoteContent, baseContent) {
    if (originalLocalContent === null && originalRemoteContent === null && baseContent === null) {
      return { content: null, hasLocalChanged: false, hasRemoteChanged: false, hasConflicts: false };
    }
    originalRemoteContent = originalRemoteContent ?? "";
    originalLocalContent = originalLocalContent ?? "";
    baseContent = baseContent ?? "";
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
};
AbstractJsonSynchronizer = __decorate([
  __param(4, IFileService),
  __param(5, IEnvironmentService),
  __param(6, IStorageService),
  __param(7, IUserDataSyncStoreService),
  __param(8, IUserDataSyncLocalStoreService),
  __param(9, IUserDataSyncEnablementService),
  __param(10, ITelemetryService),
  __param(11, IUserDataSyncLogService),
  __param(12, IConfigurationService),
  __param(13, IUriIdentityService)
], AbstractJsonSynchronizer);
export {
  AbstractJsonSynchronizer
};
//# sourceMappingURL=abstractJsonSynchronizer.js.map
