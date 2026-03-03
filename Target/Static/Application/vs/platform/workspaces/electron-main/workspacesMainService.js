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
import { IBackupMainService } from "../../backup/electron-main/backup.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
import { IWorkspacesHistoryMainService } from "./workspacesHistoryMainService.js";
import { IWorkspacesManagementMainService } from "./workspacesManagementMainService.js";
let WorkspacesMainService = class WorkspacesMainService2 {
  static {
    __name(this, "WorkspacesMainService");
  }
  constructor(workspacesManagementMainService, windowsMainService, workspacesHistoryMainService, backupMainService) {
    this.workspacesManagementMainService = workspacesManagementMainService;
    this.windowsMainService = windowsMainService;
    this.workspacesHistoryMainService = workspacesHistoryMainService;
    this.backupMainService = backupMainService;
    this.onDidChangeRecentlyOpened = this.workspacesHistoryMainService.onDidChangeRecentlyOpened;
  }
  //#region Workspace Management
  async enterWorkspace(windowId, path) {
    const window = this.windowsMainService.getWindowById(windowId);
    if (window) {
      return this.workspacesManagementMainService.enterWorkspace(window, this.windowsMainService.getWindows(), path);
    }
    return void 0;
  }
  createUntitledWorkspace(windowId, folders, remoteAuthority) {
    return this.workspacesManagementMainService.createUntitledWorkspace(folders, remoteAuthority);
  }
  deleteUntitledWorkspace(windowId, workspace) {
    return this.workspacesManagementMainService.deleteUntitledWorkspace(workspace);
  }
  getWorkspaceIdentifier(windowId, workspacePath) {
    return this.workspacesManagementMainService.getWorkspaceIdentifier(workspacePath);
  }
  getRecentlyOpened(windowId) {
    return this.workspacesHistoryMainService.getRecentlyOpened();
  }
  addRecentlyOpened(windowId, recents) {
    return this.workspacesHistoryMainService.addRecentlyOpened(recents);
  }
  removeRecentlyOpened(windowId, paths) {
    return this.workspacesHistoryMainService.removeRecentlyOpened(paths);
  }
  clearRecentlyOpened(windowId) {
    return this.workspacesHistoryMainService.clearRecentlyOpened();
  }
  //#endregion
  //#region Dirty Workspaces
  async getDirtyWorkspaces() {
    return this.backupMainService.getDirtyWorkspaces();
  }
};
WorkspacesMainService = __decorate([
  __param(0, IWorkspacesManagementMainService),
  __param(1, IWindowsMainService),
  __param(2, IWorkspacesHistoryMainService),
  __param(3, IBackupMainService)
], WorkspacesMainService);
export {
  WorkspacesMainService
};
//# sourceMappingURL=workspacesMainService.js.map
