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
import { Action } from "../../../../base/common/actions.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { revive } from "../../../../base/common/marshalling.js";
import { dirname, isEqualOrParent, joinPath } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
const MARKETPLACE_INDEX_STORAGE_KEY = "chat.plugins.marketplaces.index.v1";
let AgentPluginRepositoryService = class AgentPluginRepositoryService2 {
  static {
    __name(this, "AgentPluginRepositoryService");
  }
  constructor(_commandService, environmentService, _fileService, _logService, _notificationService, _progressService, _storageService) {
    this._commandService = _commandService;
    this._fileService = _fileService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._progressService = _progressService;
    this._storageService = _storageService;
    this._marketplaceIndex = new Lazy(() => this._loadMarketplaceIndex());
    this._cacheRoot = joinPath(environmentService.cacheHome, "agentPlugins");
  }
  getRepositoryUri(marketplace, marketplaceType) {
    if (marketplace.kind === "localFileUri" && marketplace.localRepositoryUri) {
      return marketplace.localRepositoryUri;
    }
    const indexed = this._marketplaceIndex.value.get(marketplace.canonicalId);
    if (indexed?.repositoryUri) {
      return indexed.repositoryUri;
    }
    return this._getRepoCacheDirForReference(marketplace);
  }
  getPluginInstallUri(plugin) {
    const repoDir = this.getRepositoryUri(plugin.marketplaceReference, plugin.marketplaceType);
    return this._getPluginDir(repoDir, plugin.source);
  }
  async ensureRepository(marketplace, options) {
    const repoDir = this.getRepositoryUri(marketplace, options?.marketplaceType);
    const repoExists = await this._fileService.exists(repoDir);
    if (repoExists) {
      this._updateMarketplaceIndex(marketplace, repoDir, options?.marketplaceType);
      return repoDir;
    }
    if (marketplace.kind === "localFileUri") {
      throw new Error(`Local marketplace repository does not exist: ${repoDir.fsPath}`);
    }
    const progressTitle = options?.progressTitle ?? localize("preparingMarketplace", "Preparing plugin marketplace '{0}'...", marketplace.displayLabel);
    const failureLabel = options?.failureLabel ?? marketplace.displayLabel;
    await this._cloneRepository(repoDir, marketplace.cloneUrl, progressTitle, failureLabel);
    this._updateMarketplaceIndex(marketplace, repoDir, options?.marketplaceType);
    return repoDir;
  }
  async pullRepository(marketplace, options) {
    const repoDir = this.getRepositoryUri(marketplace, options?.marketplaceType);
    const repoExists = await this._fileService.exists(repoDir);
    if (!repoExists) {
      this._logService.warn(`[AgentPluginRepositoryService] Cannot update plugin '${options?.pluginName ?? marketplace.displayLabel}': repository not cloned`);
      return;
    }
    const updateLabel = options?.pluginName ?? marketplace.displayLabel;
    try {
      await this._progressService.withProgress({
        location: 15,
        title: localize("updatingPlugin", "Updating plugin '{0}'...", updateLabel),
        cancellable: false
      }, async () => {
        await this._commandService.executeCommand("_git.pull", repoDir.fsPath);
      });
    } catch (err) {
      this._logService.error(`[AgentPluginRepositoryService] Failed to update ${marketplace.displayLabel}:`, err);
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("pullFailed", "Failed to update plugin '{0}': {1}", options?.failureLabel ?? updateLabel, err?.message ?? String(err)),
        actions: {
          primary: [new Action("showGitOutput", localize("showGitOutput", "Show Git Output"), void 0, true, () => {
            this._commandService.executeCommand("git.showOutput");
          })]
        }
      });
    }
  }
  _getRepoCacheDirForReference(reference) {
    return joinPath(this._cacheRoot, ...reference.cacheSegments);
  }
  _loadMarketplaceIndex() {
    const result = /* @__PURE__ */ new Map();
    const stored = this._storageService.getObject(
      MARKETPLACE_INDEX_STORAGE_KEY,
      -1
      /* StorageScope.APPLICATION */
    );
    if (!stored) {
      return result;
    }
    const revived = revive(stored);
    for (const [canonicalId, entry] of Object.entries(revived)) {
      if (!entry || !entry.repositoryUri) {
        continue;
      }
      result.set(canonicalId, {
        repositoryUri: entry.repositoryUri,
        marketplaceType: entry.marketplaceType
      });
    }
    return result;
  }
  _updateMarketplaceIndex(marketplace, repositoryUri, marketplaceType) {
    if (marketplace.kind === "localFileUri") {
      return;
    }
    const previous = this._marketplaceIndex.value.get(marketplace.canonicalId);
    if (previous && previous.repositoryUri.toString() === repositoryUri.toString() && previous.marketplaceType === marketplaceType) {
      return;
    }
    this._marketplaceIndex.value.set(marketplace.canonicalId, { repositoryUri, marketplaceType });
    this._saveMarketplaceIndex();
  }
  _saveMarketplaceIndex() {
    const serialized = {};
    for (const [canonicalId, entry] of this._marketplaceIndex.value) {
      serialized[canonicalId] = JSON.parse(JSON.stringify({
        repositoryUri: entry.repositoryUri,
        marketplaceType: entry.marketplaceType
      }));
    }
    if (Object.keys(serialized).length === 0) {
      this._storageService.remove(
        MARKETPLACE_INDEX_STORAGE_KEY,
        -1
        /* StorageScope.APPLICATION */
      );
      return;
    }
    this._storageService.store(
      MARKETPLACE_INDEX_STORAGE_KEY,
      JSON.stringify(serialized),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  async _cloneRepository(repoDir, cloneUrl, progressTitle, failureLabel) {
    try {
      await this._progressService.withProgress({
        location: 15,
        title: progressTitle,
        cancellable: false
      }, async () => {
        await this._fileService.createFolder(dirname(repoDir));
        await this._commandService.executeCommand("_git.cloneRepository", cloneUrl, dirname(repoDir).fsPath);
      });
    } catch (err) {
      this._logService.error(`[AgentPluginRepositoryService] Failed to clone ${cloneUrl}:`, err);
      this._notificationService.notify({
        severity: Severity.Error,
        message: localize("cloneFailed", "Failed to install plugin '{0}': {1}", failureLabel, err?.message ?? String(err)),
        actions: {
          primary: [new Action("showGitOutput", localize("showGitOutput", "Show Git Output"), void 0, true, () => {
            this._commandService.executeCommand("git.showOutput");
          })]
        }
      });
      throw err;
    }
  }
  _getPluginDir(repoDir, source) {
    const normalizedSource = source.trim().replace(/^\.?\/+|\/+$/g, "");
    const pluginDir = normalizedSource ? joinPath(repoDir, normalizedSource) : repoDir;
    if (!isEqualOrParent(pluginDir, repoDir)) {
      throw new Error(`Invalid plugin source path '${source}'`);
    }
    return pluginDir;
  }
};
AgentPluginRepositoryService = __decorate([
  __param(0, ICommandService),
  __param(1, IEnvironmentService),
  __param(2, IFileService),
  __param(3, ILogService),
  __param(4, INotificationService),
  __param(5, IProgressService),
  __param(6, IStorageService)
], AgentPluginRepositoryService);
export {
  AgentPluginRepositoryService
};
//# sourceMappingURL=agentPluginRepositoryService.js.map
