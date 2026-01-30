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
var WindowsStateHandler_1;
import electron from "electron";
import { Disposable } from "../../../base/common/lifecycle.js";
import { isMacintosh } from "../../../base/common/platform.js";
import { extUriBiasedIgnorePathCase } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IStateService } from "../../state/node/state.js";
import { IWindowsMainService } from "./windows.js";
import { defaultWindowState } from "../../window/electron-main/window.js";
import { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "../../workspace/common/workspace.js";
let WindowsStateHandler = class WindowsStateHandler2 extends Disposable {
  static {
    __name(this, "WindowsStateHandler");
  }
  static {
    WindowsStateHandler_1 = this;
  }
  static {
    this.windowsStateStorageKey = "windowsState";
  }
  get state() {
    return this._state;
  }
  constructor(windowsMainService, stateService, lifecycleMainService, logService, configurationService) {
    super();
    this.windowsMainService = windowsMainService;
    this.stateService = stateService;
    this.lifecycleMainService = lifecycleMainService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.lastClosedState = void 0;
    this.shuttingDown = false;
    this._state = restoreWindowsState(this.stateService.getItem(WindowsStateHandler_1.windowsStateStorageKey));
    this.registerListeners();
  }
  registerListeners() {
    electron.app.on("browser-window-blur", () => {
      if (!this.shuttingDown) {
        this.saveWindowsState();
      }
    });
    this._register(this.lifecycleMainService.onBeforeCloseWindow((window) => this.onBeforeCloseWindow(window)));
    this._register(this.lifecycleMainService.onBeforeShutdown(() => this.onBeforeShutdown()));
    this._register(this.windowsMainService.onDidChangeWindowsCount((e) => {
      if (e.newCount - e.oldCount > 0) {
        this.lastClosedState = void 0;
      }
    }));
    this._register(this.windowsMainService.onDidDestroyWindow((window) => this.onBeforeCloseWindow(window)));
  }
  // Note that onBeforeShutdown() and onBeforeCloseWindow() are fired in different order depending on the OS:
  // - macOS: since the app will not quit when closing the last window, you will always first get
  //          the onBeforeShutdown() event followed by N onBeforeCloseWindow() events for each window
  // - other: on other OS, closing the last window will quit the app so the order depends on the
  //          user interaction: closing the last window will first trigger onBeforeCloseWindow()
  //          and then onBeforeShutdown(). Using the quit action however will first issue onBeforeShutdown()
  //          and then onBeforeCloseWindow().
  //
  // Here is the behavior on different OS depending on action taken (Electron 1.7.x):
  //
  // Legend
  // -  quit(N): quit application with N windows opened
  // - close(1): close one window via the window close button
  // - closeAll: close all windows via the taskbar command
  // - onBeforeShutdown(N): number of windows reported in this event handler
  // - onBeforeCloseWindow(N, M): number of windows reported and quitRequested boolean in this event handler
  //
  // macOS
  // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
  // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
  // 	-     quit(0): onBeforeShutdown(0)
  // 	-    close(1): onBeforeCloseWindow(1, false)
  //
  // Windows
  // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
  // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
  // 	-    close(1): onBeforeCloseWindow(2, false)[not last window]
  // 	-    close(1): onBeforeCloseWindow(1, false), onBeforeShutdown(0)[last window]
  // 	- closeAll(2): onBeforeCloseWindow(2, false), onBeforeCloseWindow(2, false), onBeforeShutdown(0)
  //
  // Linux
  // 	-     quit(1): onBeforeShutdown(1), onBeforeCloseWindow(1, true)
  // 	-     quit(2): onBeforeShutdown(2), onBeforeCloseWindow(2, true), onBeforeCloseWindow(2, true)
  // 	-    close(1): onBeforeCloseWindow(2, false)[not last window]
  // 	-    close(1): onBeforeCloseWindow(1, false), onBeforeShutdown(0)[last window]
  // 	- closeAll(2): onBeforeCloseWindow(2, false), onBeforeCloseWindow(2, false), onBeforeShutdown(0)
  //
  onBeforeShutdown() {
    this.shuttingDown = true;
    this.saveWindowsState();
  }
  saveWindowsState() {
    const displaysWithFullScreenWindow = /* @__PURE__ */ new Set();
    const currentWindowsState = {
      openedWindows: [],
      lastPluginDevelopmentHostWindow: this._state.lastPluginDevelopmentHostWindow,
      lastActiveWindow: this.lastClosedState
    };
    if (!currentWindowsState.lastActiveWindow) {
      let activeWindow = this.windowsMainService.getLastActiveWindow();
      if (!activeWindow || activeWindow.isExtensionDevelopmentHost) {
        activeWindow = this.windowsMainService.getWindows().find((window) => !window.isExtensionDevelopmentHost);
      }
      if (activeWindow) {
        currentWindowsState.lastActiveWindow = this.toWindowState(activeWindow);
        if (currentWindowsState.lastActiveWindow.uiState.mode === 3) {
          displaysWithFullScreenWindow.add(currentWindowsState.lastActiveWindow.uiState.display);
        }
      }
    }
    const extensionHostWindow = this.windowsMainService.getWindows().find((window) => window.isExtensionDevelopmentHost && !window.isExtensionTestHost);
    if (extensionHostWindow) {
      currentWindowsState.lastPluginDevelopmentHostWindow = this.toWindowState(extensionHostWindow);
      if (currentWindowsState.lastPluginDevelopmentHostWindow.uiState.mode === 3) {
        if (displaysWithFullScreenWindow.has(currentWindowsState.lastPluginDevelopmentHostWindow.uiState.display)) {
          if (isMacintosh && !extensionHostWindow.win?.isSimpleFullScreen()) {
            currentWindowsState.lastPluginDevelopmentHostWindow.uiState.mode = 1;
          }
        } else {
          displaysWithFullScreenWindow.add(currentWindowsState.lastPluginDevelopmentHostWindow.uiState.display);
        }
      }
    }
    if (this.windowsMainService.getWindowCount() > 1) {
      currentWindowsState.openedWindows = this.windowsMainService.getWindows().filter((window) => !window.isExtensionDevelopmentHost).map((window) => {
        const windowState = this.toWindowState(window);
        if (windowState.uiState.mode === 3) {
          if (displaysWithFullScreenWindow.has(windowState.uiState.display)) {
            if (isMacintosh && windowState.windowId !== currentWindowsState.lastActiveWindow?.windowId && !window.win?.isSimpleFullScreen()) {
              windowState.uiState.mode = 1;
            }
          } else {
            displaysWithFullScreenWindow.add(windowState.uiState.display);
          }
        }
        return windowState;
      });
    }
    const state = getWindowsStateStoreData(currentWindowsState);
    this.stateService.setItem(WindowsStateHandler_1.windowsStateStorageKey, state);
    if (this.shuttingDown) {
      this.logService.trace("[WindowsStateHandler] onBeforeShutdown", state);
    }
  }
  // See note on #onBeforeShutdown() for details how these events are flowing
  onBeforeCloseWindow(window) {
    if (this.lifecycleMainService.quitRequested) {
      return;
    }
    const state = this.toWindowState(window);
    if (window.isExtensionDevelopmentHost && !window.isExtensionTestHost) {
      this._state.lastPluginDevelopmentHostWindow = state;
    } else if (!window.isExtensionDevelopmentHost && window.openedWorkspace) {
      this._state.openedWindows.forEach((openedWindow) => {
        const sameWorkspace = isWorkspaceIdentifier(window.openedWorkspace) && openedWindow.workspace?.id === window.openedWorkspace.id;
        const sameFolder = isSingleFolderWorkspaceIdentifier(window.openedWorkspace) && openedWindow.folderUri && extUriBiasedIgnorePathCase.isEqual(openedWindow.folderUri, window.openedWorkspace.uri);
        if (sameWorkspace || sameFolder) {
          openedWindow.uiState = state.uiState;
        }
      });
    }
    if (this.windowsMainService.getWindowCount() === 1) {
      this.lastClosedState = state;
    }
  }
  toWindowState(window) {
    return {
      windowId: window.id,
      workspace: isWorkspaceIdentifier(window.openedWorkspace) ? window.openedWorkspace : void 0,
      folderUri: isSingleFolderWorkspaceIdentifier(window.openedWorkspace) ? window.openedWorkspace.uri : void 0,
      backupPath: window.backupPath,
      remoteAuthority: window.remoteAuthority,
      uiState: window.serializeWindowState()
    };
  }
  getNewWindowState(configuration) {
    const state = this.doGetNewWindowState(configuration);
    const windowConfig = this.configurationService.getValue("window");
    if (state.mode === 3) {
      let allowFullscreen;
      if (state.hasDefaultState) {
        allowFullscreen = !!(windowConfig?.newWindowDimensions && ["fullscreen", "inherit", "offset"].indexOf(windowConfig.newWindowDimensions) >= 0);
      } else {
        allowFullscreen = !!(this.lifecycleMainService.wasRestarted || windowConfig?.restoreFullscreen);
      }
      if (!allowFullscreen) {
        state.mode = 1;
      }
    }
    return state;
  }
  doGetNewWindowState(configuration) {
    const lastActive = this.windowsMainService.getLastActiveWindow();
    if (!configuration.extensionTestsPath) {
      if (!!configuration.extensionDevelopmentPath && this.state.lastPluginDevelopmentHostWindow) {
        return this.state.lastPluginDevelopmentHostWindow.uiState;
      }
      const workspace = configuration.workspace;
      if (isWorkspaceIdentifier(workspace)) {
        const stateForWorkspace = this.state.openedWindows.filter((openedWindow) => openedWindow.workspace && openedWindow.workspace.id === workspace.id).map((openedWindow) => openedWindow.uiState);
        if (stateForWorkspace.length) {
          return stateForWorkspace[0];
        }
      }
      if (isSingleFolderWorkspaceIdentifier(workspace)) {
        const stateForFolder = this.state.openedWindows.filter((openedWindow) => openedWindow.folderUri && extUriBiasedIgnorePathCase.isEqual(openedWindow.folderUri, workspace.uri)).map((openedWindow) => openedWindow.uiState);
        if (stateForFolder.length) {
          return stateForFolder[0];
        }
      } else if (configuration.backupPath) {
        const stateForEmptyWindow = this.state.openedWindows.filter((openedWindow) => openedWindow.backupPath === configuration.backupPath).map((openedWindow) => openedWindow.uiState);
        if (stateForEmptyWindow.length) {
          return stateForEmptyWindow[0];
        }
      }
      const lastActiveState = this.lastClosedState || this.state.lastActiveWindow;
      if (!lastActive && lastActiveState) {
        return lastActiveState.uiState;
      }
    }
    let displayToUse;
    const displays = electron.screen.getAllDisplays();
    if (displays.length === 1) {
      displayToUse = displays[0];
    } else {
      if (isMacintosh) {
        const cursorPoint = electron.screen.getCursorScreenPoint();
        displayToUse = electron.screen.getDisplayNearestPoint(cursorPoint);
      }
      if (!displayToUse && lastActive) {
        displayToUse = electron.screen.getDisplayMatching(lastActive.getBounds());
      }
      if (!displayToUse) {
        displayToUse = electron.screen.getPrimaryDisplay() || displays[0];
      }
    }
    let state = defaultWindowState(void 0, isWorkspaceIdentifier(configuration.workspace) || isSingleFolderWorkspaceIdentifier(configuration.workspace));
    state.x = Math.round(displayToUse.bounds.x + displayToUse.bounds.width / 2 - state.width / 2);
    state.y = Math.round(displayToUse.bounds.y + displayToUse.bounds.height / 2 - state.height / 2);
    const windowConfig = this.configurationService.getValue("window");
    let ensureNoOverlap = true;
    if (windowConfig?.newWindowDimensions) {
      if (windowConfig.newWindowDimensions === "maximized") {
        state.mode = 0;
        ensureNoOverlap = false;
      } else if (windowConfig.newWindowDimensions === "fullscreen") {
        state.mode = 3;
        ensureNoOverlap = false;
      } else if ((windowConfig.newWindowDimensions === "inherit" || windowConfig.newWindowDimensions === "offset") && lastActive) {
        const lastActiveState = lastActive.serializeWindowState();
        if (lastActiveState.mode === 3) {
          state.mode = 3;
        } else {
          state = {
            ...lastActiveState,
            zoomLevel: void 0
            // do not inherit zoom level
          };
        }
        ensureNoOverlap = state.mode !== 3 && windowConfig.newWindowDimensions === "offset";
      }
    }
    if (ensureNoOverlap) {
      state = this.ensureNoOverlap(state);
    }
    state.hasDefaultState = true;
    return state;
  }
  ensureNoOverlap(state) {
    if (this.windowsMainService.getWindows().length === 0) {
      return state;
    }
    state.x = typeof state.x === "number" ? state.x : 0;
    state.y = typeof state.y === "number" ? state.y : 0;
    const existingWindowBounds = this.windowsMainService.getWindows().map((window) => window.getBounds());
    while (existingWindowBounds.some((bounds) => bounds.x === state.x || bounds.y === state.y)) {
      state.x += 30;
      state.y += 30;
    }
    return state;
  }
};
WindowsStateHandler = WindowsStateHandler_1 = __decorate([
  __param(0, IWindowsMainService),
  __param(1, IStateService),
  __param(2, ILifecycleMainService),
  __param(3, ILogService),
  __param(4, IConfigurationService)
], WindowsStateHandler);
function restoreWindowsState(data) {
  const result = { openedWindows: [] };
  const windowsState = data || { openedWindows: [] };
  if (windowsState.lastActiveWindow) {
    result.lastActiveWindow = restoreWindowState(windowsState.lastActiveWindow);
  }
  if (windowsState.lastPluginDevelopmentHostWindow) {
    result.lastPluginDevelopmentHostWindow = restoreWindowState(windowsState.lastPluginDevelopmentHostWindow);
  }
  if (Array.isArray(windowsState.openedWindows)) {
    result.openedWindows = windowsState.openedWindows.map((windowState) => restoreWindowState(windowState));
  }
  return result;
}
__name(restoreWindowsState, "restoreWindowsState");
function restoreWindowState(windowState) {
  const result = { uiState: windowState.uiState };
  if (windowState.backupPath) {
    result.backupPath = windowState.backupPath;
  }
  if (windowState.remoteAuthority) {
    result.remoteAuthority = windowState.remoteAuthority;
  }
  if (windowState.folder) {
    result.folderUri = URI.parse(windowState.folder);
  }
  if (windowState.workspaceIdentifier) {
    result.workspace = { id: windowState.workspaceIdentifier.id, configPath: URI.parse(windowState.workspaceIdentifier.configURIPath) };
  }
  return result;
}
__name(restoreWindowState, "restoreWindowState");
function getWindowsStateStoreData(windowsState) {
  return {
    lastActiveWindow: windowsState.lastActiveWindow && serializeWindowState(windowsState.lastActiveWindow),
    lastPluginDevelopmentHostWindow: windowsState.lastPluginDevelopmentHostWindow && serializeWindowState(windowsState.lastPluginDevelopmentHostWindow),
    openedWindows: windowsState.openedWindows.map((ws) => serializeWindowState(ws))
  };
}
__name(getWindowsStateStoreData, "getWindowsStateStoreData");
function serializeWindowState(windowState) {
  return {
    workspaceIdentifier: windowState.workspace && { id: windowState.workspace.id, configURIPath: windowState.workspace.configPath.toString() },
    folder: windowState.folderUri?.toString(),
    backupPath: windowState.backupPath,
    remoteAuthority: windowState.remoteAuthority,
    uiState: windowState.uiState
  };
}
__name(serializeWindowState, "serializeWindowState");
export {
  WindowsStateHandler,
  getWindowsStateStoreData,
  restoreWindowsState
};
//# sourceMappingURL=windowsStateHandler.js.map
