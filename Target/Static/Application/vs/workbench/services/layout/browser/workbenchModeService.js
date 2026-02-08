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
var WorkbenchModeService_1;
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { parse } from "../../../../base/common/json.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
let WorkbenchModeService = class WorkbenchModeService2 extends Disposable {
  static {
    __name(this, "WorkbenchModeService");
  }
  static {
    WorkbenchModeService_1 = this;
  }
  static {
    this.WORKBENCH_MODE_STORAGE_KEY = "workbench.mode";
  }
  get workbenchMode() {
    return this._workbenchMode;
  }
  constructor(workspaceContextService, fileService, environmentService, uriIdentityService, logService, storageService) {
    super();
    this.workspaceContextService = workspaceContextService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.storageService = storageService;
    this._onDidChangeWorkbenchMode = this._register(new Emitter());
    this.onDidChangeWorkbenchMode = this._onDidChangeWorkbenchMode.event;
    this.workbenchModeFileWatcherDiposables = this._register(new DisposableStore());
    this.configurationRegistry = Registry.as(Extensions.Configuration);
    this._workbenchMode = this.workspaceContextService.getWorkspace().isAgentSessionsWorkspace ? "agent-sessions" : this.storageService.get(
      WorkbenchModeService_1.WORKBENCH_MODE_STORAGE_KEY,
      1
      /* StorageScope.WORKSPACE */
    );
    this.watchCurrentModeFile();
  }
  async initialize() {
    return this.updateWorkbenchModeConfiguration();
  }
  async updateWorkbenchModeConfiguration() {
    const workbenchModeConfiguration = this._workbenchMode ? await this.getWorkbenchModeConfiguration(this._workbenchMode) : void 0;
    this.updateConfigurationDefaults(workbenchModeConfiguration?.settings);
  }
  updateConfigurationDefaults(configurationDefaults) {
    if (this.configurationDefaults) {
      this.configurationRegistry.deregisterDefaultConfigurations([this.configurationDefaults]);
    }
    if (configurationDefaults) {
      this.configurationDefaults = { overrides: configurationDefaults, donotCache: true };
      this.configurationRegistry.registerDefaultConfigurations([this.configurationDefaults]);
    } else {
      this.configurationDefaults = void 0;
    }
  }
  watchCurrentModeFile() {
    if (!this._workbenchMode) {
      this.workbenchModeFileWatcherDiposables.clear();
      return;
    }
    const workbenchModeFileUri = this.getWorkbenchModeFileUri(this._workbenchMode);
    if (!workbenchModeFileUri) {
      this.workbenchModeFileWatcherDiposables.clear();
      return;
    }
    this.workbenchModeFileWatcherDiposables.add(this.fileService.watch(workbenchModeFileUri));
    this.workbenchModeFileWatcherDiposables.add(this.fileService.onDidFilesChange((e) => {
      if (e.affects(workbenchModeFileUri)) {
        this.updateWorkbenchModeConfiguration();
        this._onDidChangeWorkbenchMode.fire(this._workbenchMode);
      }
    }));
  }
  getWorkbenchModeFileUri(layoutId) {
    return this.uriIdentityService.extUri.joinPath(this.environmentService.builtinWorkbenchModesHome, `${layoutId}.code-workbench-mode`);
  }
  async getWorkbenchModeConfiguration(id) {
    const resource = this.getWorkbenchModeFileUri(id);
    return this.resolveWorkbenchModeConfiguration(resource);
  }
  async getWorkbenchModeConfigurations() {
    const result = [];
    const workbenchModesFolder = this.environmentService.builtinWorkbenchModesHome;
    try {
      const stat = await this.fileService.resolve(workbenchModesFolder);
      if (!stat.children?.length) {
        return result;
      }
      for (const child of stat.children) {
        if (child.isDirectory) {
          continue;
        }
        const workbenchModeConfiguration = await this.resolveWorkbenchModeConfiguration(child.resource);
        if (workbenchModeConfiguration) {
          result.push(workbenchModeConfiguration);
        }
      }
    } catch (error) {
      this.logService.error(`Error while reading workbench mode files from ${workbenchModesFolder.toString()}`, error);
    }
    return result;
  }
  async resolveWorkbenchModeConfiguration(workbenchConfigurationModeFile) {
    if (this.uriIdentityService.extUri.extname(workbenchConfigurationModeFile) !== ".code-workbench-mode") {
      return void 0;
    }
    try {
      const content = (await this.fileService.readFile(workbenchConfigurationModeFile)).value.toString();
      const name = this.uriIdentityService.extUri.basename(workbenchConfigurationModeFile);
      const workbenchModeConfiguration = {
        id: name.substring(0, name.length - ".code-workbench-mode".length),
        ...parse(content)
      };
      return workbenchModeConfiguration;
    } catch (error) {
      this.logService.error(`Error while reading workbench mode file from ${workbenchConfigurationModeFile.toString()}`, error);
      return void 0;
    }
  }
  async setWorkbenchMode(modeId) {
    if (this.workspaceContextService.getWorkspace().isAgentSessionsWorkspace) {
      throw new Error("Cannot set workbench mode in an agent sessions workspace");
    }
    if (this._workbenchMode === modeId) {
      return;
    }
    this.updateWorkbenchMode(modeId);
    await this.updateWorkbenchModeConfiguration();
    this.watchCurrentModeFile();
    this._onDidChangeWorkbenchMode.fire(modeId);
  }
  updateWorkbenchMode(modeId) {
    this._workbenchMode = modeId;
    if (modeId === void 0) {
      this.storageService.remove(
        WorkbenchModeService_1.WORKBENCH_MODE_STORAGE_KEY,
        1
        /* StorageScope.WORKSPACE */
      );
    } else {
      this.storageService.store(
        WorkbenchModeService_1.WORKBENCH_MODE_STORAGE_KEY,
        modeId,
        1,
        1
        /* StorageTarget.MACHINE */
      );
    }
  }
};
WorkbenchModeService = WorkbenchModeService_1 = __decorate([
  __param(0, IWorkspaceContextService),
  __param(1, IFileService),
  __param(2, IEnvironmentService),
  __param(3, IUriIdentityService),
  __param(4, ILogService),
  __param(5, IStorageService)
], WorkbenchModeService);
export {
  WorkbenchModeService
};
//# sourceMappingURL=workbenchModeService.js.map
