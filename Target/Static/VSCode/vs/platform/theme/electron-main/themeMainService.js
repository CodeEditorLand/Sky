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
import electron from "electron";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { isLinux, isMacintosh, isWindows } from "../../../base/common/platform.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IStateService } from "../../state/node/state.js";
import { IPartsSplash, IPartsSplashWorkspaceOverride } from "../common/themeService.js";
import { IColorScheme } from "../../window/common/window.js";
import { ThemeTypeSelector } from "../common/theme.js";
import { IBaseWorkspaceIdentifier } from "../../workspace/common/workspace.js";
import { coalesce } from "../../../base/common/arrays.js";
import { getAllWindowsExcludingOffscreen } from "../../windows/electron-main/windows.js";
const DEFAULT_BG_LIGHT = "#FFFFFF";
const DEFAULT_BG_DARK = "#1F1F1F";
const DEFAULT_BG_HC_BLACK = "#000000";
const DEFAULT_BG_HC_LIGHT = "#FFFFFF";
const THEME_STORAGE_KEY = "theme";
const THEME_BG_STORAGE_KEY = "themeBackground";
const THEME_WINDOW_SPLASH_KEY = "windowSplash";
const THEME_WINDOW_SPLASH_WORKSPACE_OVERRIDE_KEY = "windowSplashWorkspaceOverride";
var ThemeSettings;
((ThemeSettings2) => {
  ThemeSettings2.DETECT_COLOR_SCHEME = "window.autoDetectColorScheme";
  ThemeSettings2.DETECT_HC = "window.autoDetectHighContrast";
  ThemeSettings2.SYSTEM_COLOR_THEME = "window.systemColorTheme";
})(ThemeSettings || (ThemeSettings = {}));
const IThemeMainService = createDecorator("themeMainService");
let ThemeMainService = class extends Disposable {
  constructor(stateService, configurationService) {
    super();
    this.stateService = stateService;
    this.configurationService = configurationService;
    if (!isLinux) {
      this._register(this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(ThemeSettings.SYSTEM_COLOR_THEME) || e.affectsConfiguration(ThemeSettings.DETECT_COLOR_SCHEME)) {
          this.updateSystemColorTheme();
        }
      }));
    }
    this.updateSystemColorTheme();
    this._register(Event.fromNodeEventEmitter(electron.nativeTheme, "updated")(() => this._onDidChangeColorScheme.fire(this.getColorScheme())));
  }
  static {
    __name(this, "ThemeMainService");
  }
  _onDidChangeColorScheme = this._register(new Emitter());
  onDidChangeColorScheme = this._onDidChangeColorScheme.event;
  updateSystemColorTheme() {
    if (isLinux || this.configurationService.getValue(ThemeSettings.DETECT_COLOR_SCHEME)) {
      electron.nativeTheme.themeSource = "system";
    } else {
      switch (this.configurationService.getValue(ThemeSettings.SYSTEM_COLOR_THEME)) {
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
    if (this.configurationService.getValue(ThemeSettings.DETECT_HC) && colorScheme.highContrast) {
      return colorScheme.dark ? ThemeTypeSelector.HC_BLACK : ThemeTypeSelector.HC_LIGHT;
    }
    if (this.configurationService.getValue(ThemeSettings.DETECT_COLOR_SCHEME)) {
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
      splashOverride ? { key: THEME_WINDOW_SPLASH_WORKSPACE_OVERRIDE_KEY, data: splashOverride } : void 0
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
      const [auxiliarySideBarWidth, workspaceIds] = splashOverride.layoutInfo.auxiliarySideBarWidth;
      if (splash.layoutInfo?.auxiliarySideBarWidth) {
        if (auxiliarySideBarWidth !== splash.layoutInfo.auxiliarySideBarWidth) {
          splashOverride.layoutInfo.auxiliarySideBarWidth[0] = splash.layoutInfo.auxiliarySideBarWidth;
          changed = true;
        }
        if (!workspaceIds.includes(workspace.id)) {
          workspaceIds.push(workspace.id);
          changed = true;
        }
      } else {
        const index = workspaceIds.indexOf(workspace.id);
        if (index > -1) {
          workspaceIds.splice(index, 1);
          changed = true;
        }
      }
    }
    return changed ? splashOverride : void 0;
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
    const partSplash = this.stateService.getItem(THEME_WINDOW_SPLASH_KEY);
    if (!partSplash?.layoutInfo) {
      return partSplash;
    }
    let auxiliarySideBarWidthOverride;
    if (workspace) {
      const [auxiliarySideBarWidth, workspaceIds] = this.getWindowSplashOverride().layoutInfo.auxiliarySideBarWidth;
      if (workspaceIds.includes(workspace.id)) {
        auxiliarySideBarWidthOverride = auxiliarySideBarWidth;
      }
    }
    return {
      ...partSplash,
      layoutInfo: {
        ...partSplash.layoutInfo,
        // Only apply an auxiliary bar width when we have a workspace specific
        // override. Auxiliary bar is not visible by default unless explicitly
        // opened in a workspace.
        auxiliarySideBarWidth: typeof auxiliarySideBarWidthOverride === "number" ? auxiliarySideBarWidthOverride : 0
      }
    };
  }
  getWindowSplashOverride() {
    return this.stateService.getItem(THEME_WINDOW_SPLASH_WORKSPACE_OVERRIDE_KEY, { layoutInfo: { auxiliarySideBarWidth: [0, []] } });
  }
};
ThemeMainService = __decorateClass([
  __decorateParam(0, IStateService),
  __decorateParam(1, IConfigurationService)
], ThemeMainService);
export {
  IThemeMainService,
  ThemeMainService
};
//# sourceMappingURL=themeMainService.js.map
