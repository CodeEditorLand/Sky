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
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { IStringDictionary } from "../../../../base/common/collections.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { parse, stringify } from "../../../../base/common/marshalling.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IStorageEntry, IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfile } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { AbstractSynchroniser, IAcceptResult, IMergeResult, IResourcePreview, ISyncResourcePreview } from "../../../../platform/userDataSync/common/abstractSynchronizer.js";
import { IRemoteUserData, IResourceRefHandle, IUserDataSyncLocalStoreService, IUserDataSyncConfiguration, IUserDataSyncEnablementService, IUserDataSyncLogService, IUserDataSyncStoreService, IUserDataSynchroniser, IWorkspaceState, SyncResource, IUserDataSyncResourcePreview } from "../../../../platform/userDataSync/common/userDataSync.js";
import { EditSession, IEditSessionsStorageService } from "./editSessions.js";
import { IWorkspaceIdentityService } from "../../../services/workspaces/common/workspaceIdentityService.js";
class NullBackupStoreService {
  static {
    __name(this, "NullBackupStoreService");
  }
  _serviceBrand;
  async writeResource() {
    return;
  }
  async getAllResourceRefs() {
    return [];
  }
  async resolveResourceContent() {
    return null;
  }
}
class NullEnablementService {
  static {
    __name(this, "NullEnablementService");
  }
  _serviceBrand;
  _onDidChangeEnablement = new Emitter();
  onDidChangeEnablement = this._onDidChangeEnablement.event;
  _onDidChangeResourceEnablement = new Emitter();
  onDidChangeResourceEnablement = this._onDidChangeResourceEnablement.event;
  isEnabled() {
    return true;
  }
  canToggleEnablement() {
    return true;
  }
  setEnablement(_enabled) {
  }
  isResourceEnabled(_resource) {
    return true;
  }
  isResourceEnablementConfigured(_resource) {
    return false;
  }
  setResourceEnablement(_resource, _enabled) {
  }
  getResourceSyncStateVersion(_resource) {
    return void 0;
  }
}
let WorkspaceStateSynchroniser = class extends AbstractSynchroniser {
  constructor(profile, collection, userDataSyncStoreService, logService, fileService, environmentService, telemetryService, configurationService, storageService, uriIdentityService, workspaceIdentityService, editSessionsStorageService) {
    const userDataSyncLocalStoreService = new NullBackupStoreService();
    const userDataSyncEnablementService = new NullEnablementService();
    super({ syncResource: SyncResource.WorkspaceState, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.workspaceIdentityService = workspaceIdentityService;
    this.editSessionsStorageService = editSessionsStorageService;
  }
  static {
    __name(this, "WorkspaceStateSynchroniser");
  }
  version = 1;
  async sync() {
    const cancellationTokenSource = new CancellationTokenSource();
    const folders = await this.workspaceIdentityService.getWorkspaceStateFolders(cancellationTokenSource.token);
    if (!folders.length) {
      return null;
    }
    await this.storageService.flush();
    const keys = this.storageService.keys(StorageScope.WORKSPACE, StorageTarget.USER);
    if (!keys.length) {
      return null;
    }
    const contributedData = {};
    keys.forEach((key) => {
      const data = this.storageService.get(key, StorageScope.WORKSPACE);
      if (data) {
        contributedData[key] = data;
      }
    });
    const content = { folders, storage: contributedData, version: this.version };
    await this.editSessionsStorageService.write("workspaceState", stringify(content));
    return null;
  }
  async apply() {
    const payload = this.editSessionsStorageService.lastReadResources.get("editSessions")?.content;
    const workspaceStateId = payload ? JSON.parse(payload).workspaceStateId : void 0;
    const resource = await this.editSessionsStorageService.read("workspaceState", workspaceStateId);
    if (!resource) {
      return null;
    }
    const remoteWorkspaceState = parse(resource.content);
    if (!remoteWorkspaceState) {
      this.logService.info("Skipping initializing workspace state because remote workspace state does not exist.");
      return null;
    }
    const cancellationTokenSource = new CancellationTokenSource();
    const replaceUris = await this.workspaceIdentityService.matches(remoteWorkspaceState.folders, cancellationTokenSource.token);
    if (!replaceUris) {
      this.logService.info("Skipping initializing workspace state because remote workspace state does not match current workspace.");
      return null;
    }
    const storage = {};
    for (const key of Object.keys(remoteWorkspaceState.storage)) {
      storage[key] = remoteWorkspaceState.storage[key];
    }
    if (Object.keys(storage).length) {
      const storageEntries = [];
      for (const key of Object.keys(storage)) {
        try {
          const value = parse(storage[key]);
          replaceUris(value);
          storageEntries.push({ key, value, scope: StorageScope.WORKSPACE, target: StorageTarget.USER });
        } catch {
          storageEntries.push({ key, value: storage[key], scope: StorageScope.WORKSPACE, target: StorageTarget.USER });
        }
      }
      this.storageService.storeAll(storageEntries, true);
    }
    this.editSessionsStorageService.delete("workspaceState", resource.ref);
    return null;
  }
  // TODO@joyceerhl implement AbstractSynchronizer in full
  applyResult(remoteUserData, lastSyncUserData, result, force) {
    throw new Error("Method not implemented.");
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration, token) {
    return [];
  }
  getMergeResult(resourcePreview, token) {
    throw new Error("Method not implemented.");
  }
  getAcceptResult(resourcePreview, resource, content, token) {
    throw new Error("Method not implemented.");
  }
  async hasRemoteChanged(lastSyncUserData) {
    return true;
  }
  async hasLocalData() {
    return false;
  }
  async resolveContent(uri) {
    return null;
  }
};
WorkspaceStateSynchroniser = __decorateClass([
  __decorateParam(4, IFileService),
  __decorateParam(5, IEnvironmentService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IUriIdentityService),
  __decorateParam(10, IWorkspaceIdentityService),
  __decorateParam(11, IEditSessionsStorageService)
], WorkspaceStateSynchroniser);
export {
  WorkspaceStateSynchroniser
};
//# sourceMappingURL=workspaceStateSync.js.map
