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
import { app } from "electron";
import { validatedIpcMain } from "../../../base/parts/ipc/electron-main/ipcMain.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { getAllWindowsExcludingOffscreen, IWindowsMainService } from "../../windows/electron-main/windows.js";
import { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "../../workspace/common/workspace.js";
import { IWorkspacesManagementMainService } from "../../workspaces/electron-main/workspacesManagementMainService.js";
import { assertReturnsDefined } from "../../../base/common/types.js";
import { ILogService } from "../../log/common/log.js";
import { UtilityProcess } from "../../utilityProcess/electron-main/utilityProcess.js";
const ID = "diagnosticsMainService";
const IDiagnosticsMainService = createDecorator(ID);
let DiagnosticsMainService = class DiagnosticsMainService2 {
  static {
    __name(this, "DiagnosticsMainService");
  }
  constructor(windowsMainService, workspacesManagementMainService, logService) {
    this.windowsMainService = windowsMainService;
    this.workspacesManagementMainService = workspacesManagementMainService;
    this.logService = logService;
  }
  async getRemoteDiagnostics(options) {
    const windows = this.windowsMainService.getWindows();
    const diagnostics = await Promise.all(windows.map(async (window) => {
      const remoteAuthority = window.remoteAuthority;
      if (!remoteAuthority) {
        return void 0;
      }
      const replyChannel = `vscode:getDiagnosticInfoResponse${window.id}`;
      const args = {
        includeProcesses: options.includeProcesses,
        folders: options.includeWorkspaceMetadata ? await this.getFolderURIs(window) : void 0
      };
      return new Promise((resolve) => {
        window.sendWhenReady("vscode:getDiagnosticInfo", CancellationToken.None, { replyChannel, args });
        validatedIpcMain.once(replyChannel, (_, data) => {
          if (!data) {
            resolve({ hostName: remoteAuthority, errorMessage: `Unable to resolve connection to '${remoteAuthority}'.` });
          }
          resolve(data);
        });
        setTimeout(() => {
          resolve({ hostName: remoteAuthority, errorMessage: `Connection to '${remoteAuthority}' could not be established` });
        }, 5e3);
      });
    }));
    return diagnostics.filter((x) => !!x);
  }
  async getMainDiagnostics() {
    this.logService.trace("Received request for main process info from other instance.");
    const windows = [];
    for (const window of getAllWindowsExcludingOffscreen()) {
      const codeWindow = this.windowsMainService.getWindowById(window.id);
      if (codeWindow) {
        windows.push(await this.codeWindowToInfo(codeWindow));
      } else {
        windows.push(this.browserWindowToInfo(window));
      }
    }
    const pidToNames = [];
    for (const { pid, name } of UtilityProcess.getAll()) {
      pidToNames.push({ pid, name });
    }
    let gpuLogMessages = [];
    const customApp = app;
    if (typeof customApp.getGPULogMessages === "function") {
      gpuLogMessages = customApp.getGPULogMessages();
    }
    return {
      mainPID: process.pid,
      mainArguments: process.argv.slice(1),
      windows,
      pidToNames,
      screenReader: !!app.accessibilitySupportEnabled,
      gpuFeatureStatus: app.getGPUFeatureStatus(),
      gpuLogMessages
    };
  }
  async codeWindowToInfo(window) {
    const folderURIs = await this.getFolderURIs(window);
    const win = assertReturnsDefined(window.win);
    return this.browserWindowToInfo(win, folderURIs, window.remoteAuthority);
  }
  browserWindowToInfo(window, folderURIs = [], remoteAuthority) {
    return {
      id: window.id,
      pid: window.webContents.getOSProcessId(),
      title: window.getTitle(),
      folderURIs,
      remoteAuthority
    };
  }
  async getFolderURIs(window) {
    const folderURIs = [];
    const workspace = window.openedWorkspace;
    if (isSingleFolderWorkspaceIdentifier(workspace)) {
      folderURIs.push(workspace.uri);
    } else if (isWorkspaceIdentifier(workspace)) {
      const resolvedWorkspace = await this.workspacesManagementMainService.resolveLocalWorkspace(workspace.configPath);
      if (resolvedWorkspace) {
        const rootFolders = resolvedWorkspace.folders;
        rootFolders.forEach((root) => {
          folderURIs.push(root.uri);
        });
      }
    }
    return folderURIs;
  }
};
DiagnosticsMainService = __decorate([
  __param(0, IWindowsMainService),
  __param(1, IWorkspacesManagementMainService),
  __param(2, ILogService)
], DiagnosticsMainService);
export {
  DiagnosticsMainService,
  ID,
  IDiagnosticsMainService
};
//# sourceMappingURL=diagnosticsMainService.js.map
