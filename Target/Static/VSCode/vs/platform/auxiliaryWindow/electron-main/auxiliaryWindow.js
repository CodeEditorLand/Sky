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
import { BrowserWindow, BrowserWindowConstructorOptions, WebContents } from "electron";
import { isLinux, isWindows } from "../../../base/common/platform.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IStateService } from "../../state/node/state.js";
import { hasNativeTitlebar, TitlebarStyle } from "../../window/common/window.js";
import { IBaseWindow, WindowMode } from "../../window/electron-main/window.js";
import { BaseWindow } from "../../windows/electron-main/windowImpl.js";
let AuxiliaryWindow = class extends BaseWindow {
  constructor(webContents, environmentMainService, logService, configurationService, stateService, lifecycleMainService) {
    super(configurationService, stateService, environmentMainService, logService);
    this.webContents = webContents;
    this.lifecycleMainService = lifecycleMainService;
    this.id = this.webContents.id;
    this.tryClaimWindow();
  }
  static {
    __name(this, "AuxiliaryWindow");
  }
  id;
  parentId = -1;
  get win() {
    if (!super.win) {
      this.tryClaimWindow();
    }
    return super.win;
  }
  stateApplied = false;
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
        mode: options.show === false ? WindowMode.Maximized : WindowMode.Normal
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
        options?.titleBarStyle === "hidden" ? TitlebarStyle.CUSTOM : void 0
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
AuxiliaryWindow = __decorateClass([
  __decorateParam(1, IEnvironmentMainService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IStateService),
  __decorateParam(5, ILifecycleMainService)
], AuxiliaryWindow);
export {
  AuxiliaryWindow
};
//# sourceMappingURL=auxiliaryWindow.js.map
