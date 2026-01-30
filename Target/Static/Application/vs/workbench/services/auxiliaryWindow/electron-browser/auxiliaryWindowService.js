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
var NativeAuxiliaryWindow_1;
import { localize } from "../../../../nls.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IWorkbenchLayoutService } from "../../layout/browser/layoutService.js";
import { AuxiliaryWindow, AuxiliaryWindowMode, BrowserAuxiliaryWindowService, IAuxiliaryWindowService } from "../browser/auxiliaryWindowService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { mark } from "../../../../base/common/performance.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IHostService } from "../../host/browser/host.js";
import { applyZoom } from "../../../../platform/window/electron-browser/window.js";
import { getZoomLevel, isFullscreen, setFullscreen } from "../../../../base/browser/browser.js";
import { getActiveWindow } from "../../../../base/browser/dom.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { assert } from "../../../../base/common/assert.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
let NativeAuxiliaryWindow = NativeAuxiliaryWindow_1 = class NativeAuxiliaryWindow2 extends AuxiliaryWindow {
  static {
    __name(this, "NativeAuxiliaryWindow");
  }
  constructor(window, container, stylesHaveLoaded, configurationService, nativeHostService, instantiationService, hostService, environmentService, dialogService, contextMenuService, layoutService) {
    super(window, container, stylesHaveLoaded, configurationService, hostService, environmentService, contextMenuService, layoutService);
    this.nativeHostService = nativeHostService;
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    this.skipUnloadConfirmation = false;
    this.maximized = false;
    this.alwaysOnTop = false;
    if (!isMacintosh) {
      this.handleMaximizedState();
    }
    this.handleFullScreenState();
    this.handleAlwaysOnTopState();
  }
  handleMaximizedState() {
    (async () => {
      this.maximized = await this.nativeHostService.isMaximized({ targetWindowId: this.window.vscodeWindowId });
    })();
    this._register(this.nativeHostService.onDidMaximizeWindow((windowId) => {
      if (windowId === this.window.vscodeWindowId) {
        this.maximized = true;
      }
    }));
    this._register(this.nativeHostService.onDidUnmaximizeWindow((windowId) => {
      if (windowId === this.window.vscodeWindowId) {
        this.maximized = false;
      }
    }));
  }
  handleAlwaysOnTopState() {
    (async () => {
      this.alwaysOnTop = await this.nativeHostService.isWindowAlwaysOnTop({ targetWindowId: this.window.vscodeWindowId });
    })();
    this._register(this.nativeHostService.onDidChangeWindowAlwaysOnTop(({ windowId, alwaysOnTop }) => {
      if (windowId === this.window.vscodeWindowId) {
        this.alwaysOnTop = alwaysOnTop;
      }
    }));
  }
  async handleFullScreenState() {
    const fullscreen = await this.nativeHostService.isFullScreen({ targetWindowId: this.window.vscodeWindowId });
    if (fullscreen) {
      setFullscreen(true, this.window);
    }
  }
  async handleVetoBeforeClose(e, veto) {
    this.preventUnload(e);
    await this.dialogService.error(veto, localize("backupErrorDetails", "Try saving or reverting the editors with unsaved changes first and then try again."));
  }
  async confirmBeforeClose(e) {
    if (this.skipUnloadConfirmation) {
      return;
    }
    this.preventUnload(e);
    const confirmed = await this.instantiationService.invokeFunction((accessor) => NativeAuxiliaryWindow_1.confirmOnShutdown(
      accessor,
      1
      /* ShutdownReason.CLOSE */
    ));
    if (confirmed) {
      this.skipUnloadConfirmation = true;
      this.nativeHostService.closeWindow({ targetWindowId: this.window.vscodeWindowId });
    }
  }
  preventUnload(e) {
    e.preventDefault();
    e.returnValue = true;
  }
  createState() {
    const state = super.createState();
    const fullscreen = isFullscreen(this.window);
    return {
      ...state,
      bounds: state.bounds,
      mode: this.maximized ? AuxiliaryWindowMode.Maximized : fullscreen ? AuxiliaryWindowMode.Fullscreen : AuxiliaryWindowMode.Normal,
      alwaysOnTop: this.alwaysOnTop
    };
  }
};
NativeAuxiliaryWindow = NativeAuxiliaryWindow_1 = __decorate([
  __param(3, IConfigurationService),
  __param(4, INativeHostService),
  __param(5, IInstantiationService),
  __param(6, IHostService),
  __param(7, IWorkbenchEnvironmentService),
  __param(8, IDialogService),
  __param(9, IContextMenuService),
  __param(10, IWorkbenchLayoutService)
], NativeAuxiliaryWindow);
let NativeAuxiliaryWindowService = class NativeAuxiliaryWindowService2 extends BrowserAuxiliaryWindowService {
  static {
    __name(this, "NativeAuxiliaryWindowService");
  }
  constructor(layoutService, configurationService, nativeHostService, dialogService, instantiationService, telemetryService, hostService, environmentService, contextMenuService) {
    super(layoutService, dialogService, configurationService, telemetryService, hostService, environmentService, contextMenuService);
    this.nativeHostService = nativeHostService;
    this.instantiationService = instantiationService;
  }
  async resolveWindowId(auxiliaryWindow) {
    mark("code/auxiliaryWindow/willResolveWindowId");
    const windowId = await auxiliaryWindow.vscode.ipcRenderer.invoke("vscode:registerAuxiliaryWindow", this.nativeHostService.windowId);
    mark("code/auxiliaryWindow/didResolveWindowId");
    assert(typeof windowId === "number");
    return windowId;
  }
  createContainer(auxiliaryWindow, disposables, options) {
    let windowZoomLevel;
    if (typeof options?.zoomLevel === "number") {
      windowZoomLevel = options.zoomLevel;
    } else {
      windowZoomLevel = getZoomLevel(getActiveWindow());
    }
    applyZoom(windowZoomLevel, auxiliaryWindow);
    return super.createContainer(auxiliaryWindow, disposables);
  }
  createAuxiliaryWindow(targetWindow, container, stylesHaveLoaded) {
    return new NativeAuxiliaryWindow(targetWindow, container, stylesHaveLoaded, this.configurationService, this.nativeHostService, this.instantiationService, this.hostService, this.environmentService, this.dialogService, this.contextMenuService, this.layoutService);
  }
};
NativeAuxiliaryWindowService = __decorate([
  __param(0, IWorkbenchLayoutService),
  __param(1, IConfigurationService),
  __param(2, INativeHostService),
  __param(3, IDialogService),
  __param(4, IInstantiationService),
  __param(5, ITelemetryService),
  __param(6, IHostService),
  __param(7, IWorkbenchEnvironmentService),
  __param(8, IContextMenuService)
], NativeAuxiliaryWindowService);
registerSingleton(
  IAuxiliaryWindowService,
  NativeAuxiliaryWindowService,
  1
  /* InstantiationType.Delayed */
);
export {
  NativeAuxiliaryWindow,
  NativeAuxiliaryWindowService
};
//# sourceMappingURL=auxiliaryWindowService.js.map
