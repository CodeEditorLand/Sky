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
import { BrowserWindow, BrowserWindowConstructorOptions, contentTracing, Display, IpcMainEvent, screen } from "electron";
import { randomPath } from "../../../base/common/extpath.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { FileAccess } from "../../../base/common/network.js";
import { IProcessEnvironment, isMacintosh } from "../../../base/common/platform.js";
import { listProcesses } from "../../../base/node/ps.js";
import { validatedIpcMain } from "../../../base/parts/ipc/electron-main/ipcMain.js";
import { getNLSLanguage, getNLSMessages, localize } from "../../../nls.js";
import { IDiagnosticsService, isRemoteDiagnosticError, PerformanceInfo, SystemInfo } from "../../diagnostics/common/diagnostics.js";
import { IDiagnosticsMainService } from "../../diagnostics/electron-main/diagnosticsMainService.js";
import { IDialogMainService } from "../../dialogs/electron-main/dialogMainService.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ICSSDevelopmentService } from "../../cssDev/node/cssDevService.js";
import { IProcessMainService, ProcessExplorerData, ProcessExplorerWindowConfiguration } from "../common/process.js";
import { ILogService } from "../../log/common/log.js";
import { INativeHostMainService } from "../../native/electron-main/nativeHostMainService.js";
import product from "../../product/common/product.js";
import { IProductService } from "../../product/common/productService.js";
import { IIPCObjectUrl, IProtocolMainService } from "../../protocol/electron-main/protocol.js";
import { IStateService } from "../../state/node/state.js";
import { UtilityProcess } from "../../utilityProcess/electron-main/utilityProcess.js";
import { zoomLevelToZoomFactor } from "../../window/common/window.js";
import { IWindowState } from "../../window/electron-main/window.js";
const processExplorerWindowState = "issue.processExplorerWindowState";
let ProcessMainService = class {
  constructor(userEnv, environmentMainService, logService, diagnosticsService, diagnosticsMainService, dialogMainService, nativeHostMainService, protocolMainService, productService, stateService, cssDevelopmentService) {
    this.userEnv = userEnv;
    this.environmentMainService = environmentMainService;
    this.logService = logService;
    this.diagnosticsService = diagnosticsService;
    this.diagnosticsMainService = diagnosticsMainService;
    this.dialogMainService = dialogMainService;
    this.nativeHostMainService = nativeHostMainService;
    this.protocolMainService = protocolMainService;
    this.productService = productService;
    this.stateService = stateService;
    this.cssDevelopmentService = cssDevelopmentService;
    this.registerListeners();
  }
  static {
    __name(this, "ProcessMainService");
  }
  static DEFAULT_BACKGROUND_COLOR = "#1E1E1E";
  processExplorerWindow = null;
  processExplorerParentWindow = null;
  //#region Register Listeners
  registerListeners() {
    validatedIpcMain.on("vscode:listProcesses", async (event) => {
      const processes = [];
      try {
        processes.push({ name: localize("local", "Local"), rootProcess: await listProcesses(process.pid) });
        const remoteDiagnostics = await this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true });
        remoteDiagnostics.forEach((data) => {
          if (isRemoteDiagnosticError(data)) {
            processes.push({
              name: data.hostName,
              rootProcess: data
            });
          } else {
            if (data.processes) {
              processes.push({
                name: data.hostName,
                rootProcess: data.processes
              });
            }
          }
        });
      } catch (e) {
        this.logService.error(`Listing processes failed: ${e}`);
      }
      this.safeSend(event, "vscode:listProcessesResponse", processes);
    });
    validatedIpcMain.on("vscode:workbenchCommand", (_, commandInfo) => {
      const { id, from, args } = commandInfo;
      let parentWindow;
      switch (from) {
        case "processExplorer":
          parentWindow = this.processExplorerParentWindow;
          break;
        default:
          throw new Error(`Unexpected command source: ${from}`);
      }
      parentWindow?.webContents.send("vscode:runAction", { id, from, args });
    });
    validatedIpcMain.on("vscode:closeProcessExplorer", (event) => {
      this.processExplorerWindow?.close();
    });
    validatedIpcMain.on("vscode:pidToNameRequest", async (event) => {
      const mainProcessInfo = await this.diagnosticsMainService.getMainDiagnostics();
      const pidToNames = [];
      for (const window of mainProcessInfo.windows) {
        pidToNames.push([window.pid, `window [${window.id}] (${window.title})`]);
      }
      for (const { pid, name } of UtilityProcess.getAll()) {
        pidToNames.push([pid, name]);
      }
      this.safeSend(event, "vscode:pidToNameResponse", pidToNames);
    });
  }
  async openProcessExplorer(data) {
    if (!this.processExplorerWindow) {
      this.processExplorerParentWindow = BrowserWindow.getFocusedWindow();
      if (this.processExplorerParentWindow) {
        const processExplorerDisposables = new DisposableStore();
        const processExplorerWindowConfigUrl = processExplorerDisposables.add(this.protocolMainService.createIPCObjectUrl());
        const savedPosition = this.stateService.getItem(processExplorerWindowState, void 0);
        const position = isStrictWindowState(savedPosition) ? savedPosition : this.getWindowPosition(this.processExplorerParentWindow, 800, 500);
        this.processExplorerWindow = this.createBrowserWindow(position, processExplorerWindowConfigUrl, {
          backgroundColor: data.styles.backgroundColor,
          title: localize("processExplorer", "Process Explorer"),
          zoomLevel: data.zoomLevel,
          alwaysOnTop: true
        }, "process-explorer");
        processExplorerWindowConfigUrl.update({
          appRoot: this.environmentMainService.appRoot,
          windowId: this.processExplorerWindow.id,
          userEnv: this.userEnv,
          data,
          product,
          nls: {
            messages: getNLSMessages(),
            language: getNLSLanguage()
          },
          cssModules: this.cssDevelopmentService.isEnabled ? await this.cssDevelopmentService.getCssModules() : void 0
        });
        this.processExplorerWindow.loadURL(
          FileAccess.asBrowserUri(`vs/code/electron-sandbox/processExplorer/processExplorer${this.environmentMainService.isBuilt ? "" : "-dev"}.html`).toString(true)
        );
        this.processExplorerWindow.on("close", () => {
          this.processExplorerWindow = null;
          processExplorerDisposables.dispose();
        });
        this.processExplorerParentWindow.on("close", () => {
          if (this.processExplorerWindow) {
            this.processExplorerWindow.close();
            this.processExplorerWindow = null;
            processExplorerDisposables.dispose();
          }
        });
        const storeState = /* @__PURE__ */ __name(() => {
          if (!this.processExplorerWindow) {
            return;
          }
          const size = this.processExplorerWindow.getSize();
          const position2 = this.processExplorerWindow.getPosition();
          if (!size || !position2) {
            return;
          }
          const state = {
            width: size[0],
            height: size[1],
            x: position2[0],
            y: position2[1]
          };
          this.stateService.setItem(processExplorerWindowState, state);
        }, "storeState");
        this.processExplorerWindow.on("moved", storeState);
        this.processExplorerWindow.on("resized", storeState);
      }
    }
    if (this.processExplorerWindow) {
      this.focusWindow(this.processExplorerWindow);
    }
  }
  focusWindow(window) {
    if (window.isMinimized()) {
      window.restore();
    }
    window.focus();
  }
  getWindowPosition(parentWindow, defaultWidth, defaultHeight) {
    let displayToUse;
    const displays = screen.getAllDisplays();
    if (displays.length === 1) {
      displayToUse = displays[0];
    } else {
      if (isMacintosh) {
        const cursorPoint = screen.getCursorScreenPoint();
        displayToUse = screen.getDisplayNearestPoint(cursorPoint);
      }
      if (!displayToUse && parentWindow) {
        displayToUse = screen.getDisplayMatching(parentWindow.getBounds());
      }
      if (!displayToUse) {
        displayToUse = screen.getPrimaryDisplay() || displays[0];
      }
    }
    const displayBounds = displayToUse.bounds;
    const state = {
      width: defaultWidth,
      height: defaultHeight,
      x: displayBounds.x + displayBounds.width / 2 - defaultWidth / 2,
      y: displayBounds.y + displayBounds.height / 2 - defaultHeight / 2
    };
    if (displayBounds.width > 0 && displayBounds.height > 0) {
      if (state.x < displayBounds.x) {
        state.x = displayBounds.x;
      }
      if (state.y < displayBounds.y) {
        state.y = displayBounds.y;
      }
      if (state.x > displayBounds.x + displayBounds.width) {
        state.x = displayBounds.x;
      }
      if (state.y > displayBounds.y + displayBounds.height) {
        state.y = displayBounds.y;
      }
      if (state.width > displayBounds.width) {
        state.width = displayBounds.width;
      }
      if (state.height > displayBounds.height) {
        state.height = displayBounds.height;
      }
    }
    return state;
  }
  async stopTracing() {
    if (!this.environmentMainService.args.trace) {
      return;
    }
    const path = await contentTracing.stopRecording(`${randomPath(this.environmentMainService.userHome.fsPath, this.productService.applicationName)}.trace.txt`);
    await this.dialogMainService.showMessageBox({
      type: "info",
      message: localize("trace.message", "Successfully created the trace file"),
      detail: localize("trace.detail", "Please create an issue and manually attach the following file:\n{0}", path),
      buttons: [localize({ key: "trace.ok", comment: ["&& denotes a mnemonic"] }, "&&OK")]
    }, BrowserWindow.getFocusedWindow() ?? void 0);
    this.nativeHostMainService.showItemInFolder(void 0, path);
  }
  async getSystemStatus() {
    const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
    return this.diagnosticsService.getDiagnostics(info, remoteData);
  }
  async $getSystemInfo() {
    const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
    const msg = await this.diagnosticsService.getSystemInfo(info, remoteData);
    return msg;
  }
  async $getPerformanceInfo() {
    try {
      const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true })]);
      return await this.diagnosticsService.getPerformanceInfo(info, remoteData);
    } catch (error) {
      this.logService.warn("issueService#getPerformanceInfo ", error.message);
      throw error;
    }
  }
  createBrowserWindow(position, ipcObjectUrl, options, windowKind) {
    const browserWindowOptions = {
      fullscreen: false,
      skipTaskbar: false,
      resizable: true,
      width: position.width,
      height: position.height,
      minWidth: 300,
      minHeight: 200,
      x: position.x,
      y: position.y,
      title: options.title,
      backgroundColor: options.backgroundColor || ProcessMainService.DEFAULT_BACKGROUND_COLOR,
      webPreferences: {
        preload: FileAccess.asFileUri("vs/base/parts/sandbox/electron-sandbox/preload.js").fsPath,
        additionalArguments: [`--vscode-window-config=${ipcObjectUrl.resource.toString()}`],
        v8CacheOptions: this.environmentMainService.useCodeCache ? "bypassHeatCheck" : "none",
        enableWebSQL: false,
        spellcheck: false,
        zoomFactor: zoomLevelToZoomFactor(options.zoomLevel),
        sandbox: true
      },
      alwaysOnTop: options.alwaysOnTop,
      experimentalDarkMode: true
    };
    const window = new BrowserWindow(browserWindowOptions);
    window.setMenuBarVisibility(false);
    return window;
  }
  safeSend(event, channel, ...args) {
    if (!event.sender.isDestroyed()) {
      event.sender.send(channel, ...args);
    }
  }
  async closeProcessExplorer() {
    this.processExplorerWindow?.close();
  }
};
ProcessMainService = __decorateClass([
  __decorateParam(1, IEnvironmentMainService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IDiagnosticsService),
  __decorateParam(4, IDiagnosticsMainService),
  __decorateParam(5, IDialogMainService),
  __decorateParam(6, INativeHostMainService),
  __decorateParam(7, IProtocolMainService),
  __decorateParam(8, IProductService),
  __decorateParam(9, IStateService),
  __decorateParam(10, ICSSDevelopmentService)
], ProcessMainService);
function isStrictWindowState(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return "x" in obj && "y" in obj && "width" in obj && "height" in obj;
}
__name(isStrictWindowState, "isStrictWindowState");
export {
  ProcessMainService
};
//# sourceMappingURL=processMainService.js.map
