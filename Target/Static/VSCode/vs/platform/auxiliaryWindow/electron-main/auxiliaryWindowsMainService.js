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
import { BrowserWindow, BrowserWindowConstructorOptions, HandlerDetails, WebContents, app } from "electron";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { FileAccess } from "../../../base/common/network.js";
import { validatedIpcMain } from "../../../base/parts/ipc/electron-main/ipcMain.js";
import { AuxiliaryWindow, IAuxiliaryWindow } from "./auxiliaryWindow.js";
import { IAuxiliaryWindowsMainService } from "./auxiliaryWindows.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { IWindowState, WindowMode, defaultAuxWindowState } from "../../window/electron-main/window.js";
import { IDefaultBrowserWindowOptionsOverrides, WindowStateValidator, defaultBrowserWindowOptions, getLastFocused } from "../../windows/electron-main/windows.js";
let AuxiliaryWindowsMainService = class extends Disposable {
  constructor(instantiationService, logService) {
    super();
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.registerListeners();
  }
  static {
    __name(this, "AuxiliaryWindowsMainService");
  }
  _onDidMaximizeWindow = this._register(new Emitter());
  onDidMaximizeWindow = this._onDidMaximizeWindow.event;
  _onDidUnmaximizeWindow = this._register(new Emitter());
  onDidUnmaximizeWindow = this._onDidUnmaximizeWindow.event;
  _onDidChangeFullScreen = this._register(new Emitter());
  onDidChangeFullScreen = this._onDidChangeFullScreen.event;
  _onDidTriggerSystemContextMenu = this._register(new Emitter());
  onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
  windows = /* @__PURE__ */ new Map();
  registerListeners() {
    app.on("browser-window-created", (_event, browserWindow) => {
      const auxiliaryWindow = this.getWindowByWebContents(browserWindow.webContents);
      if (auxiliaryWindow) {
        this.logService.trace('[aux window] app.on("browser-window-created"): Trying to claim auxiliary window');
        auxiliaryWindow.tryClaimWindow();
      } else {
        const disposables = new DisposableStore();
        disposables.add(Event.fromNodeEventEmitter(browserWindow.webContents, "did-create-window", (browserWindow2, details) => ({ browserWindow: browserWindow2, details }))(({ browserWindow: browserWindow2, details }) => {
          const auxiliaryWindow2 = this.getWindowByWebContents(browserWindow2.webContents);
          if (auxiliaryWindow2) {
            this.logService.trace('[aux window] window.on("did-create-window"): Trying to claim auxiliary window');
            auxiliaryWindow2.tryClaimWindow(details.options);
          }
        }));
        disposables.add(Event.fromNodeEventEmitter(browserWindow, "closed")(() => disposables.dispose()));
      }
    });
    validatedIpcMain.handle("vscode:registerAuxiliaryWindow", async (event, mainWindowId) => {
      const auxiliaryWindow = this.getWindowByWebContents(event.sender);
      if (auxiliaryWindow) {
        this.logService.trace("[aux window] vscode:registerAuxiliaryWindow: Registering auxiliary window to main window");
        auxiliaryWindow.parentId = mainWindowId;
      }
      return event.sender.id;
    });
  }
  createWindow(details) {
    const { state, overrides } = this.computeWindowStateAndOverrides(details);
    return this.instantiationService.invokeFunction(defaultBrowserWindowOptions, state, overrides, {
      preload: FileAccess.asFileUri("vs/base/parts/sandbox/electron-sandbox/preload-aux.js").fsPath
    });
  }
  computeWindowStateAndOverrides(details) {
    const windowState = {};
    const overrides = {};
    const features = details.features.split(",");
    for (const feature of features) {
      const [key, value] = feature.split("=");
      switch (key) {
        case "width":
          windowState.width = parseInt(value, 10);
          break;
        case "height":
          windowState.height = parseInt(value, 10);
          break;
        case "left":
          windowState.x = parseInt(value, 10);
          break;
        case "top":
          windowState.y = parseInt(value, 10);
          break;
        case "window-maximized":
          windowState.mode = WindowMode.Maximized;
          break;
        case "window-fullscreen":
          windowState.mode = WindowMode.Fullscreen;
          break;
        case "window-disable-fullscreen":
          overrides.disableFullscreen = true;
          break;
        case "window-native-titlebar":
          overrides.forceNativeTitlebar = true;
          break;
      }
    }
    const state = WindowStateValidator.validateWindowState(this.logService, windowState) ?? defaultAuxWindowState();
    this.logService.trace("[aux window] using window state", state);
    return { state, overrides };
  }
  registerWindow(webContents) {
    const disposables = new DisposableStore();
    const auxiliaryWindow = this.instantiationService.createInstance(AuxiliaryWindow, webContents);
    this.windows.set(auxiliaryWindow.id, auxiliaryWindow);
    disposables.add(toDisposable(() => this.windows.delete(auxiliaryWindow.id)));
    disposables.add(auxiliaryWindow.onDidMaximize(() => this._onDidMaximizeWindow.fire(auxiliaryWindow)));
    disposables.add(auxiliaryWindow.onDidUnmaximize(() => this._onDidUnmaximizeWindow.fire(auxiliaryWindow)));
    disposables.add(auxiliaryWindow.onDidEnterFullScreen(() => this._onDidChangeFullScreen.fire({ window: auxiliaryWindow, fullscreen: true })));
    disposables.add(auxiliaryWindow.onDidLeaveFullScreen(() => this._onDidChangeFullScreen.fire({ window: auxiliaryWindow, fullscreen: false })));
    disposables.add(auxiliaryWindow.onDidTriggerSystemContextMenu(({ x, y }) => this._onDidTriggerSystemContextMenu.fire({ window: auxiliaryWindow, x, y })));
    Event.once(auxiliaryWindow.onDidClose)(() => disposables.dispose());
  }
  getWindowByWebContents(webContents) {
    const window = this.windows.get(webContents.id);
    return window?.matches(webContents) ? window : void 0;
  }
  getFocusedWindow() {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      return this.getWindowByWebContents(window.webContents);
    }
    return void 0;
  }
  getLastActiveWindow() {
    return getLastFocused(Array.from(this.windows.values()));
  }
  getWindows() {
    return Array.from(this.windows.values());
  }
};
AuxiliaryWindowsMainService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILogService)
], AuxiliaryWindowsMainService);
export {
  AuxiliaryWindowsMainService
};
//# sourceMappingURL=auxiliaryWindowsMainService.js.map
