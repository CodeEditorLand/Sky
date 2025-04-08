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
import { localize } from "../../../../nls.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IWorkbenchLayoutService } from "../../layout/browser/layoutService.js";
import { AuxiliaryWindow, AuxiliaryWindowMode, BrowserAuxiliaryWindowService, IAuxiliaryWindowOpenOptions, IAuxiliaryWindowService } from "../browser/auxiliaryWindowService.js";
import { ISandboxGlobals } from "../../../../base/parts/sandbox/electron-sandbox/globals.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { CodeWindow } from "../../../../base/browser/window.js";
import { mark } from "../../../../base/common/performance.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ShutdownReason } from "../../lifecycle/common/lifecycle.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { Barrier } from "../../../../base/common/async.js";
import { IHostService } from "../../host/browser/host.js";
import { applyZoom } from "../../../../platform/window/electron-sandbox/window.js";
import { getZoomLevel, isFullscreen, setFullscreen } from "../../../../base/browser/browser.js";
import { getActiveWindow } from "../../../../base/browser/dom.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { isMacintosh } from "../../../../base/common/platform.js";
let NativeAuxiliaryWindow = class extends AuxiliaryWindow {
  constructor(window, container, stylesHaveLoaded, configurationService, nativeHostService, instantiationService, hostService, environmentService, dialogService) {
    super(window, container, stylesHaveLoaded, configurationService, hostService, environmentService);
    this.nativeHostService = nativeHostService;
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    if (!isMacintosh) {
      this.handleMaximizedState();
    }
    this.handleFullScreenState();
  }
  static {
    __name(this, "NativeAuxiliaryWindow");
  }
  skipUnloadConfirmation = false;
  maximized = false;
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
    const confirmed = await this.instantiationService.invokeFunction((accessor) => NativeAuxiliaryWindow.confirmOnShutdown(accessor, ShutdownReason.CLOSE));
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
      mode: this.maximized ? AuxiliaryWindowMode.Maximized : fullscreen ? AuxiliaryWindowMode.Fullscreen : AuxiliaryWindowMode.Normal
    };
  }
};
NativeAuxiliaryWindow = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, INativeHostService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IWorkbenchEnvironmentService),
  __decorateParam(8, IDialogService)
], NativeAuxiliaryWindow);
let NativeAuxiliaryWindowService = class extends BrowserAuxiliaryWindowService {
  constructor(layoutService, configurationService, nativeHostService, dialogService, instantiationService, telemetryService, hostService, environmentService) {
    super(layoutService, dialogService, configurationService, telemetryService, hostService, environmentService);
    this.nativeHostService = nativeHostService;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "NativeAuxiliaryWindowService");
  }
  async resolveWindowId(auxiliaryWindow) {
    mark("code/auxiliaryWindow/willResolveWindowId");
    const windowId = await auxiliaryWindow.vscode.ipcRenderer.invoke("vscode:registerAuxiliaryWindow", this.nativeHostService.windowId);
    mark("code/auxiliaryWindow/didResolveWindowId");
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
    return new NativeAuxiliaryWindow(targetWindow, container, stylesHaveLoaded, this.configurationService, this.nativeHostService, this.instantiationService, this.hostService, this.environmentService, this.dialogService);
  }
};
NativeAuxiliaryWindowService = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, INativeHostService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IWorkbenchEnvironmentService)
], NativeAuxiliaryWindowService);
registerSingleton(IAuxiliaryWindowService, NativeAuxiliaryWindowService, InstantiationType.Delayed);
export {
  NativeAuxiliaryWindow,
  NativeAuxiliaryWindowService
};
//# sourceMappingURL=auxiliaryWindowService.js.map
