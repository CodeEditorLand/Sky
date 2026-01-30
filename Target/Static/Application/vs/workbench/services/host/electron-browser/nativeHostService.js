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
import { Emitter, Event } from "../../../../base/common/event.js";
import { IHostService } from "../browser/host.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { isFolderToOpen, isWorkspaceToOpen } from "../../../../platform/window/common/window.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { NativeHostService } from "../../../../platform/native/common/nativeHostService.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-browser/environmentService.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { disposableWindowInterval, getActiveDocument, getWindowId, getWindowsCount, hasWindow, onDidRegisterWindow } from "../../../../base/browser/dom.js";
import { memoize } from "../../../../base/common/decorators.js";
import { isAuxiliaryWindow } from "../../../../base/browser/window.js";
let WorkbenchNativeHostService = class WorkbenchNativeHostService2 extends NativeHostService {
  static {
    __name(this, "WorkbenchNativeHostService");
  }
  constructor(environmentService, mainProcessService) {
    super(environmentService.window.id, mainProcessService);
  }
};
WorkbenchNativeHostService = __decorate([
  __param(0, INativeWorkbenchEnvironmentService),
  __param(1, IMainProcessService)
], WorkbenchNativeHostService);
let WorkbenchHostService = class WorkbenchHostService2 extends Disposable {
  static {
    __name(this, "WorkbenchHostService");
  }
  constructor(nativeHostService, labelService, environmentService) {
    super();
    this.nativeHostService = nativeHostService;
    this.labelService = labelService;
    this.environmentService = environmentService;
    this._nativeWindowHandleCache = /* @__PURE__ */ new Map();
    this.onDidChangeFocus = Event.latch(Event.any(Event.map(Event.filter(this.nativeHostService.onDidFocusMainOrAuxiliaryWindow, (id) => hasWindow(id), this._store), () => this.hasFocus, this._store), Event.map(Event.filter(this.nativeHostService.onDidBlurMainOrAuxiliaryWindow, (id) => hasWindow(id), this._store), () => this.hasFocus, this._store), Event.map(this.onDidChangeActiveWindow, () => this.hasFocus, this._store)), void 0, this._store);
    this.onDidChangeFullScreen = Event.filter(this.nativeHostService.onDidChangeWindowFullScreen, (e) => hasWindow(e.windowId), this._store);
  }
  get hasFocus() {
    return getActiveDocument().hasFocus();
  }
  async hadLastFocus() {
    const activeWindowId = await this.nativeHostService.getActiveWindowId();
    if (typeof activeWindowId === "undefined") {
      return false;
    }
    return activeWindowId === this.nativeHostService.windowId;
  }
  //#endregion
  //#region Window
  get onDidChangeActiveWindow() {
    const emitter = this._register(new Emitter());
    this._register(Event.filter(this.nativeHostService.onDidFocusMainOrAuxiliaryWindow, (id) => hasWindow(id), this._store)((id) => emitter.fire(id)));
    this._register(onDidRegisterWindow(({ window, disposables }) => {
      disposables.add(disposableWindowInterval(window, () => {
        const hasFocus = window.document.hasFocus();
        if (hasFocus) {
          emitter.fire(window.vscodeWindowId);
        }
        return hasFocus;
      }, 100, 20));
    }));
    return Event.latch(emitter.event, void 0, this._store);
  }
  openWindow(arg1, arg2) {
    if (Array.isArray(arg1)) {
      return this.doOpenWindow(arg1, arg2);
    }
    return this.doOpenEmptyWindow(arg1);
  }
  doOpenWindow(toOpen, options) {
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (remoteAuthority) {
      toOpen.forEach((openable) => openable.label = openable.label || this.getRecentLabel(openable));
      if (options?.remoteAuthority === void 0) {
        options = options ? { ...options, remoteAuthority } : { remoteAuthority };
      }
    }
    return this.nativeHostService.openWindow(toOpen, options);
  }
  getRecentLabel(openable) {
    if (isFolderToOpen(openable)) {
      return this.labelService.getWorkspaceLabel(openable.folderUri, {
        verbose: 2
        /* Verbosity.LONG */
      });
    }
    if (isWorkspaceToOpen(openable)) {
      return this.labelService.getWorkspaceLabel({ id: "", configPath: openable.workspaceUri }, {
        verbose: 2
        /* Verbosity.LONG */
      });
    }
    return this.labelService.getUriLabel(openable.fileUri, { appendWorkspaceSuffix: true });
  }
  doOpenEmptyWindow(options) {
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (!!remoteAuthority && options?.remoteAuthority === void 0) {
      options = options ? { ...options, remoteAuthority } : { remoteAuthority };
    }
    return this.nativeHostService.openWindow(options);
  }
  toggleFullScreen(targetWindow) {
    return this.nativeHostService.toggleFullScreen({ targetWindowId: isAuxiliaryWindow(targetWindow) ? targetWindow.vscodeWindowId : void 0 });
  }
  async moveTop(targetWindow) {
    if (getWindowsCount() <= 1) {
      return;
    }
    return this.nativeHostService.moveWindowTop(isAuxiliaryWindow(targetWindow) ? { targetWindowId: targetWindow.vscodeWindowId } : void 0);
  }
  getCursorScreenPoint() {
    return this.nativeHostService.getCursorScreenPoint();
  }
  getWindows(options) {
    if (options.includeAuxiliaryWindows === false) {
      return this.nativeHostService.getWindows({ includeAuxiliaryWindows: false });
    }
    return this.nativeHostService.getWindows({ includeAuxiliaryWindows: true });
  }
  //#endregion
  //#region Lifecycle
  focus(targetWindow, options) {
    return this.nativeHostService.focusWindow({
      mode: options?.mode,
      targetWindowId: getWindowId(targetWindow)
    });
  }
  restart() {
    return this.nativeHostService.relaunch();
  }
  reload(options) {
    return this.nativeHostService.reload(options);
  }
  close() {
    return this.nativeHostService.closeWindow();
  }
  async withExpectedShutdown(expectedShutdownTask) {
    return await expectedShutdownTask();
  }
  //#endregion
  //#region Screenshots
  getScreenshot(rect) {
    return this.nativeHostService.getScreenshot(rect);
  }
  async getNativeWindowHandle(windowId) {
    if (!this._nativeWindowHandleCache.has(windowId)) {
      this._nativeWindowHandleCache.set(windowId, this.nativeHostService.getNativeWindowHandle(windowId));
    }
    return this._nativeWindowHandleCache.get(windowId);
  }
};
__decorate([
  memoize
], WorkbenchHostService.prototype, "onDidChangeActiveWindow", null);
WorkbenchHostService = __decorate([
  __param(0, INativeHostService),
  __param(1, ILabelService),
  __param(2, IWorkbenchEnvironmentService)
], WorkbenchHostService);
registerSingleton(
  IHostService,
  WorkbenchHostService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  INativeHostService,
  WorkbenchNativeHostService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=nativeHostService.js.map
