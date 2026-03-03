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
var ThemeMainService_1;
import electron from "electron";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { isLinux, isMacintosh, isWindows } from "../../../base/common/platform.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IStateService } from "../../state/node/state.js";
import { ThemeTypeSelector } from "../common/theme.js";
import { coalesce } from "../../../base/common/arrays.js";
import { getAllWindowsExcludingOffscreen } from "../../windows/electron-main/windows.js";
import { ILogService, LogLevel } from "../../log/common/log.js";
const DEFAULT_BG_LIGHT = "#FFFFFF";
const DEFAULT_BG_DARK = "#1F1F1F";
const DEFAULT_BG_HC_BLACK = "#000000";
const DEFAULT_BG_HC_LIGHT = "#FFFFFF";
const THEME_STORAGE_KEY = "theme";
const THEME_BG_STORAGE_KEY = "themeBackground";
const THEME_WINDOW_SPLASH_KEY = "windowSplash";
const THEME_WINDOW_SPLASH_OVERRIDE_KEY = "windowSplashWorkspaceOverride";
class Setting {
  static {
    __name(this, "Setting");
  }
  constructor(key, defaultValue) {
    this.key = key;
    this.defaultValue = defaultValue;
  }
  getValue(configurationService) {
    return configurationService.getValue(this.key) ?? this.defaultValue;
  }
}
(function(Setting2) {
  Setting2.DETECT_COLOR_SCHEME = new Setting2("window.autoDetectColorScheme", false);
  Setting2.DETECT_HC = new Setting2("window.autoDetectHighContrast", true);
  Setting2.SYSTEM_COLOR_THEME = new Setting2("window.systemColorTheme", "default");
  Setting2.AUXILIARYBAR_DEFAULT_VISIBILITY = new Setting2("workbench.secondarySideBar.defaultVisibility", "visibleInWorkspace");
  Setting2.STARTUP_EDITOR = new Setting2("workbench.startupEditor", "welcomePage");
})(Setting || (Setting = {}));
let ThemeMainService = class ThemeMainService2 extends Disposable {
  static {
    __name(this, "ThemeMainService");
  }
  static {
    ThemeMainService_1 = this;
  }
  static {
    this.DEFAULT_BAR_WIDTH = 300;
  }
  static {
    this.WORKSPACE_OVERRIDE_LIMIT = 50;
  }
  constructor(stateService, configurationService, logService) {
    super();
    this.stateService = stateService;
    this.configurationService = configurationService;
    this.logService = logService;
    this._onDidChangeColorScheme = this._register(new Emitter());
    this.onDidChangeColorScheme = this._onDidChangeColorScheme.event;
    if (!isLinux) {
      this._register(this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(Setting.SYSTEM_COLOR_THEME.key) || e.affectsConfiguration(Setting.DETECT_COLOR_SCHEME.key)) {
          this.updateSystemColorTheme();
          this.logThemeSettings();
        }
      }));
    }
    this.updateSystemColorTheme();
    this.logThemeSettings();
    this._register(Event.fromNodeEventEmitter(electron.nativeTheme, "updated")(() => {
      this.logThemeSettings();
      this._onDidChangeColorScheme.fire(this.getColorScheme());
    }));
  }
  logThemeSettings() {
    if (this.logService.getLevel() >= LogLevel.Debug) {
      const logSetting = /* @__PURE__ */ __name((setting) => `${setting.key}=${setting.getValue(this.configurationService)}`, "logSetting");
      this.logService.debug(`[theme main service] ${logSetting(Setting.DETECT_COLOR_SCHEME)}, ${logSetting(Setting.DETECT_HC)}, ${logSetting(Setting.SYSTEM_COLOR_THEME)}`);
      const logProperty = /* @__PURE__ */ __name((property) => `${String(property)}=${electron.nativeTheme[property]}`, "logProperty");
      this.logService.debug(`[theme main service] electron.nativeTheme: ${logProperty("themeSource")}, ${logProperty("shouldUseDarkColors")}, ${logProperty("shouldUseHighContrastColors")}, ${logProperty("shouldUseInvertedColorScheme")}, ${logProperty("shouldUseDarkColorsForSystemIntegratedUI")}	`);
      this.logService.debug(`[theme main service] New color scheme: ${JSON.stringify(this.getColorScheme())}`);
    }
  }
  updateSystemColorTheme() {
    if (isLinux || Setting.DETECT_COLOR_SCHEME.getValue(this.configurationService)) {
      electron.nativeTheme.themeSource = "system";
    } else {
      switch (Setting.SYSTEM_COLOR_THEME.getValue(this.configurationService)) {
        case "dark":
          electron.nativeTheme.themeSource = "dark";
          break;
        case "light":
          electron.nativeTheme.themeSource = "light";
          break;
        case "auto":
          switch (this.getPreferredBaseTheme() ?? this.getStoredBaseTheme()) {
            case ThemeTypeSelector.VS:
              electron.nativeTheme.themeSource = "light";
              break;
            case ThemeTypeSelector.VS_DARK:
              electron.nativeTheme.themeSource = "dark";
              break;
            default:
              electron.nativeTheme.themeSource = "system";
          }
          break;
        default:
          electron.nativeTheme.themeSource = "system";
          break;
      }
    }
  }
  getColorScheme() {
    if (isWindows) {
      if (electron.nativeTheme.shouldUseHighContrastColors) {
        return { dark: electron.nativeTheme.shouldUseInvertedColorScheme, highContrast: true };
      }
    } else if (isMacintosh) {
      if (electron.nativeTheme.shouldUseInvertedColorScheme || electron.nativeTheme.shouldUseHighContrastColors) {
        return { dark: electron.nativeTheme.shouldUseDarkColors, highContrast: true };
      }
    } else if (isLinux) {
      if (electron.nativeTheme.shouldUseHighContrastColors) {
        return { dark: true, highContrast: true };
      }
    }
    return {
      dark: electron.nativeTheme.shouldUseDarkColors,
      highContrast: false
    };
  }
  getPreferredBaseTheme() {
    const colorScheme = this.getColorScheme();
    if (Setting.DETECT_HC.getValue(this.configurationService) && colorScheme.highContrast) {
      return colorScheme.dark ? ThemeTypeSelector.HC_BLACK : ThemeTypeSelector.HC_LIGHT;
    }
    if (Setting.DETECT_COLOR_SCHEME.getValue(this.configurationService)) {
      return colorScheme.dark ? ThemeTypeSelector.VS_DARK : ThemeTypeSelector.VS;
    }
    return void 0;
  }
  getBackgroundColor() {
    const preferred = this.getPreferredBaseTheme();
    const stored = this.getStoredBaseTheme();
    if (preferred === void 0 || preferred === stored) {
      const storedBackground = this.stateService.getItem(THEME_BG_STORAGE_KEY, null);
      if (storedBackground) {
        return storedBackground;
      }
    }
    switch (preferred ?? stored) {
      case ThemeTypeSelector.VS:
        return DEFAULT_BG_LIGHT;
      case ThemeTypeSelector.HC_BLACK:
        return DEFAULT_BG_HC_BLACK;
      case ThemeTypeSelector.HC_LIGHT:
        return DEFAULT_BG_HC_LIGHT;
      default:
        return DEFAULT_BG_DARK;
    }
  }
  getStoredBaseTheme() {
    const baseTheme = this.stateService.getItem(THEME_STORAGE_KEY, ThemeTypeSelector.VS_DARK).split(" ")[0];
    switch (baseTheme) {
      case ThemeTypeSelector.VS:
        return ThemeTypeSelector.VS;
      case ThemeTypeSelector.HC_BLACK:
        return ThemeTypeSelector.HC_BLACK;
      case ThemeTypeSelector.HC_LIGHT:
        return ThemeTypeSelector.HC_LIGHT;
      default:
        return ThemeTypeSelector.VS_DARK;
    }
  }
  saveWindowSplash(windowId, workspace, splash) {
    const splashOverride = this.updateWindowSplashOverride(workspace, splash);
    this.stateService.setItems(coalesce([
      { key: THEME_STORAGE_KEY, data: splash.baseTheme },
      { key: THEME_BG_STORAGE_KEY, data: splash.colorInfo.background },
      { key: THEME_WINDOW_SPLASH_KEY, data: splash },
      splashOverride ? { key: THEME_WINDOW_SPLASH_OVERRIDE_KEY, data: splashOverride } : void 0
    ]));
    if (typeof windowId === "number") {
      this.updateBackgroundColor(windowId, splash);
    }
    this.updateSystemColorTheme();
  }
  updateWindowSplashOverride(workspace, splash) {
    let splashOverride = void 0;
    let changed = false;
    if (workspace) {
      splashOverride = { ...this.getWindowSplashOverride() };
      changed = this.doUpdateWindowSplashOverride(workspace, splash, splashOverride, "sideBar");
      changed = this.doUpdateWindowSplashOverride(workspace, splash, splashOverride, "auxiliaryBar") || changed;
    }
    return changed ? splashOverride : void 0;
  }
  doUpdateWindowSplashOverride(workspace, splash, splashOverride, part) {
    const currentWidth = part === "sideBar" ? splash.layoutInfo?.sideBarWidth : splash.layoutInfo?.auxiliaryBarWidth;
    const overrideWidth = part === "sideBar" ? splashOverride.layoutInfo.sideBarWidth : splashOverride.layoutInfo.auxiliaryBarWidth;
    let changed = false;
    if (typeof currentWidth !== "number") {
      if (splashOverride.layoutInfo.workspaces[workspace.id]) {
        delete splashOverride.layoutInfo.workspaces[workspace.id];
        changed = true;
      }
      return changed;
    }
    let workspaceOverride = splashOverride.layoutInfo.workspaces[workspace.id];
    if (!workspaceOverride) {
      const workspaceEntries = Object.keys(splashOverride.layoutInfo.workspaces);
      if (workspaceEntries.length >= ThemeMainService_1.WORKSPACE_OVERRIDE_LIMIT) {
        delete splashOverride.layoutInfo.workspaces[workspaceEntries[0]];
        changed = true;
      }
      workspaceOverride = { sideBarVisible: false, auxiliaryBarVisible: false };
      splashOverride.layoutInfo.workspaces[workspace.id] = workspaceOverride;
      changed = true;
    }
    if (currentWidth > 0) {
      if (overrideWidth !== currentWidth) {
        splashOverride.layoutInfo[part === "sideBar" ? "sideBarWidth" : "auxiliaryBarWidth"] = currentWidth;
        changed = true;
      }
      switch (part) {
        case "sideBar":
          if (!workspaceOverride.sideBarVisible) {
            workspaceOverride.sideBarVisible = true;
            changed = true;
          }
          break;
        case "auxiliaryBar":
          if (!workspaceOverride.auxiliaryBarVisible) {
            workspaceOverride.auxiliaryBarVisible = true;
            changed = true;
          }
          break;
      }
    } else {
      switch (part) {
        case "sideBar":
          if (workspaceOverride.sideBarVisible) {
            workspaceOverride.sideBarVisible = false;
            changed = true;
          }
          break;
        case "auxiliaryBar":
          if (workspaceOverride.auxiliaryBarVisible) {
            workspaceOverride.auxiliaryBarVisible = false;
            changed = true;
          }
          break;
      }
    }
    return changed;
  }
  updateBackgroundColor(windowId, splash) {
    for (const window of getAllWindowsExcludingOffscreen()) {
      if (window.id === windowId) {
        window.setBackgroundColor(splash.colorInfo.background);
        break;
      }
    }
  }
  getWindowSplash(workspace) {
    try {
      return this.doGetWindowSplash(workspace);
    } catch (error) {
      this.logService.error("[theme main service] Failed to get window splash", error);
      return void 0;
    }
  }
  doGetWindowSplash(workspace) {
    const partSplash = this.stateService.getItem(THEME_WINDOW_SPLASH_KEY);
    if (!partSplash?.layoutInfo) {
      return partSplash;
    }
    const override = this.getWindowSplashOverride();
    let sideBarWidth;
    if (workspace) {
      if (override.layoutInfo.workspaces[workspace.id]?.sideBarVisible === false) {
        sideBarWidth = 0;
      } else {
        sideBarWidth = override.layoutInfo.sideBarWidth || partSplash.layoutInfo.sideBarWidth || ThemeMainService_1.DEFAULT_BAR_WIDTH;
      }
    } else {
      sideBarWidth = 0;
    }
    const auxiliaryBarDefaultVisibility = Setting.AUXILIARYBAR_DEFAULT_VISIBILITY.getValue(this.configurationService);
    const startupEditor = Setting.STARTUP_EDITOR.getValue(this.configurationService);
    let auxiliaryBarWidth;
    if (workspace) {
      const auxiliaryBarVisible = override.layoutInfo.workspaces[workspace.id]?.auxiliaryBarVisible;
      if (auxiliaryBarVisible === true) {
        auxiliaryBarWidth = override.layoutInfo.auxiliaryBarWidth || partSplash.layoutInfo.auxiliaryBarWidth || ThemeMainService_1.DEFAULT_BAR_WIDTH;
      } else if (auxiliaryBarVisible === false) {
        auxiliaryBarWidth = 0;
      } else {
        if (startupEditor !== "agentSessionsWelcomePage" && (auxiliaryBarDefaultVisibility === "visible" || auxiliaryBarDefaultVisibility === "visibleInWorkspace")) {
          auxiliaryBarWidth = override.layoutInfo.auxiliaryBarWidth || partSplash.layoutInfo.auxiliaryBarWidth || ThemeMainService_1.DEFAULT_BAR_WIDTH;
        } else if (startupEditor !== "agentSessionsWelcomePage" && (auxiliaryBarDefaultVisibility === "maximized" || auxiliaryBarDefaultVisibility === "maximizedInWorkspace")) {
          auxiliaryBarWidth = Number.MAX_SAFE_INTEGER;
        } else {
          auxiliaryBarWidth = 0;
        }
      }
    } else {
      auxiliaryBarWidth = 0;
    }
    return {
      ...partSplash,
      layoutInfo: {
        ...partSplash.layoutInfo,
        sideBarWidth,
        auxiliaryBarWidth
      }
    };
  }
  getWindowSplashOverride() {
    let override = this.stateService.getItem(THEME_WINDOW_SPLASH_OVERRIDE_KEY);
    if (!override?.layoutInfo) {
      override = {
        layoutInfo: {
          sideBarWidth: ThemeMainService_1.DEFAULT_BAR_WIDTH,
          auxiliaryBarWidth: ThemeMainService_1.DEFAULT_BAR_WIDTH,
          workspaces: {}
        }
      };
    }
    if (!override.layoutInfo.sideBarWidth) {
      override.layoutInfo.sideBarWidth = ThemeMainService_1.DEFAULT_BAR_WIDTH;
    }
    if (!override.layoutInfo.auxiliaryBarWidth) {
      override.layoutInfo.auxiliaryBarWidth = ThemeMainService_1.DEFAULT_BAR_WIDTH;
    }
    if (!override.layoutInfo.workspaces) {
      override.layoutInfo.workspaces = {};
    }
    return override;
  }
};
ThemeMainService = ThemeMainService_1 = __decorate([
  __param(0, IStateService),
  __param(1, IConfigurationService),
  __param(2, ILogService)
], ThemeMainService);
export {
  ThemeMainService
};
//# sourceMappingURL=themeMainServiceImpl.js.map
