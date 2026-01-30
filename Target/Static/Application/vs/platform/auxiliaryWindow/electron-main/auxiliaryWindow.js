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
import { BrowserWindow } from "electron";
import { isLinux, isWindows } from "../../../base/common/platform.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IStateService } from "../../state/node/state.js";
import { hasNativeTitlebar } from "../../window/common/window.js";
import { BaseWindow } from "../../windows/electron-main/windowImpl.js";
let AuxiliaryWindow = class AuxiliaryWindow2 extends BaseWindow {
  static {
    __name(this, "AuxiliaryWindow");
  }
  get win() {
    if (!super.win) {
      this.tryClaimWindow();
    }
    return super.win;
  }
  constructor(webContents, environmentMainService, logService, configurationService, stateService, lifecycleMainService) {
    super(configurationService, stateService, environmentMainService, logService);
    this.webContents = webContents;
    this.lifecycleMainService = lifecycleMainService;
    this.parentId = -1;
    this.stateApplied = false;
    this.id = this.webContents.id;
    this.tryClaimWindow();
  }
  tryClaimWindow(options) {
    if (this._store.isDisposed || this.webContents.isDestroyed()) {
      return;
    }
    this.doTryClaimWindow(options);
    if (options && !this.stateApplied) {
      this.stateApplied = true;
      this.applyState({
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
        // We currently do not support restoring fullscreen state for auxiliary
        // windows because we do not get hold of the original `features` string
        // that contains that info in `window-fullscreen`. However, we can
        // probe the `options.show` value for whether the window should be maximized
        // or not because we never show maximized windows initially to reduce flicker.
        mode: options.show === false ? 0 : 1
        /* WindowMode.Normal */
      });
    }
  }
  doTryClaimWindow(options) {
    if (this._win) {
      return;
    }
    const window = BrowserWindow.fromWebContents(this.webContents);
    if (window) {
      this.logService.trace("[aux window] Claimed browser window instance");
      this.setWin(window, options);
      window.setMenu(null);
      if ((isWindows || isLinux) && hasNativeTitlebar(
        this.configurationService,
        options?.titleBarStyle === "hidden" ? "custom" : void 0
        /* unknown */
      )) {
        window.setAutoHideMenuBar(true);
      }
      this.lifecycleMainService.registerAuxWindow(this);
    }
  }
  matches(webContents) {
    return this.webContents.id === webContents.id;
  }
};
AuxiliaryWindow = __decorate([
  __param(1, IEnvironmentMainService),
  __param(2, ILogService),
  __param(3, IConfigurationService),
  __param(4, IStateService),
  __param(5, ILifecycleMainService)
], AuxiliaryWindow);
export {
  AuxiliaryWindow
};
//# sourceMappingURL=auxiliaryWindow.js.map
