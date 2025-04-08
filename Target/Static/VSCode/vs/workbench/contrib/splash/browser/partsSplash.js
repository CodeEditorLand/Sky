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
import { onDidChangeFullscreen, isFullscreen } from "../../../../base/browser/browser.js";
import * as dom from "../../../../base/browser/dom.js";
import { Color } from "../../../../base/common/color.js";
import { Event } from "../../../../base/common/event.js";
import { DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { editorBackground, foreground } from "../../../../platform/theme/common/colorRegistry.js";
import { getThemeTypeSelector, IThemeService } from "../../../../platform/theme/common/themeService.js";
import { DEFAULT_EDITOR_MIN_DIMENSIONS } from "../../../browser/parts/editor/editor.js";
import * as themes from "../../../common/theme.js";
import { IWorkbenchLayoutService, Parts, Position } from "../../../services/layout/browser/layoutService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import * as perf from "../../../../base/common/performance.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { ISplashStorageService } from "./splash.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { ILifecycleService, LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { TitleBarSetting } from "../../../../platform/window/common/window.js";
let PartsSplash = class {
  constructor(_themeService, _layoutService, _environmentService, _configService, _partSplashService, editorGroupsService, lifecycleService) {
    this._themeService = _themeService;
    this._layoutService = _layoutService;
    this._environmentService = _environmentService;
    this._configService = _configService;
    this._partSplashService = _partSplashService;
    Event.once(_layoutService.onDidLayoutMainContainer)(() => {
      this._removePartsSplash();
      perf.mark("code/didRemovePartsSplash");
    }, void 0, this._disposables);
    const lastIdleSchedule = this._disposables.add(new MutableDisposable());
    const savePartsSplashSoon = /* @__PURE__ */ __name(() => {
      lastIdleSchedule.value = dom.runWhenWindowIdle(mainWindow, () => this._savePartsSplash(), 2500);
    }, "savePartsSplashSoon");
    lifecycleService.when(LifecyclePhase.Restored).then(() => {
      Event.any(Event.filter(onDidChangeFullscreen, (windowId) => windowId === mainWindow.vscodeWindowId), editorGroupsService.mainPart.onDidLayout, _themeService.onDidColorThemeChange)(savePartsSplashSoon, void 0, this._disposables);
      savePartsSplashSoon();
    });
    _configService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TitleBarSetting.TITLE_BAR_STYLE)) {
        this._didChangeTitleBarStyle = true;
        this._savePartsSplash();
      }
    }, this, this._disposables);
  }
  static {
    __name(this, "PartsSplash");
  }
  static ID = "workbench.contrib.partsSplash";
  static _splashElementId = "monaco-parts-splash";
  _disposables = new DisposableStore();
  _didChangeTitleBarStyle;
  dispose() {
    this._disposables.dispose();
  }
  _savePartsSplash() {
    const theme = this._themeService.getColorTheme();
    this._partSplashService.saveWindowSplash({
      zoomLevel: this._configService.getValue("window.zoomLevel"),
      baseTheme: getThemeTypeSelector(theme.type),
      colorInfo: {
        foreground: theme.getColor(foreground)?.toString(),
        background: Color.Format.CSS.formatHex(theme.getColor(editorBackground) || themes.WORKBENCH_BACKGROUND(theme)),
        editorBackground: theme.getColor(editorBackground)?.toString(),
        titleBarBackground: theme.getColor(themes.TITLE_BAR_ACTIVE_BACKGROUND)?.toString(),
        titleBarBorder: theme.getColor(themes.TITLE_BAR_BORDER)?.toString(),
        activityBarBackground: theme.getColor(themes.ACTIVITY_BAR_BACKGROUND)?.toString(),
        activityBarBorder: theme.getColor(themes.ACTIVITY_BAR_BORDER)?.toString(),
        sideBarBackground: theme.getColor(themes.SIDE_BAR_BACKGROUND)?.toString(),
        sideBarBorder: theme.getColor(themes.SIDE_BAR_BORDER)?.toString(),
        statusBarBackground: theme.getColor(themes.STATUS_BAR_BACKGROUND)?.toString(),
        statusBarBorder: theme.getColor(themes.STATUS_BAR_BORDER)?.toString(),
        statusBarNoFolderBackground: theme.getColor(themes.STATUS_BAR_NO_FOLDER_BACKGROUND)?.toString(),
        windowBorder: theme.getColor(themes.WINDOW_ACTIVE_BORDER)?.toString() ?? theme.getColor(themes.WINDOW_INACTIVE_BORDER)?.toString()
      },
      layoutInfo: !this._shouldSaveLayoutInfo() ? void 0 : {
        sideBarSide: this._layoutService.getSideBarPosition() === Position.RIGHT ? "right" : "left",
        editorPartMinWidth: DEFAULT_EDITOR_MIN_DIMENSIONS.width,
        titleBarHeight: this._layoutService.isVisible(Parts.TITLEBAR_PART, mainWindow) ? dom.getTotalHeight(assertIsDefined(this._layoutService.getContainer(mainWindow, Parts.TITLEBAR_PART))) : 0,
        activityBarWidth: this._layoutService.isVisible(Parts.ACTIVITYBAR_PART) ? dom.getTotalWidth(assertIsDefined(this._layoutService.getContainer(mainWindow, Parts.ACTIVITYBAR_PART))) : 0,
        sideBarWidth: this._layoutService.isVisible(Parts.SIDEBAR_PART) ? dom.getTotalWidth(assertIsDefined(this._layoutService.getContainer(mainWindow, Parts.SIDEBAR_PART))) : 0,
        auxiliarySideBarWidth: this._layoutService.isVisible(Parts.AUXILIARYBAR_PART) ? dom.getTotalWidth(assertIsDefined(this._layoutService.getContainer(mainWindow, Parts.AUXILIARYBAR_PART))) : 0,
        statusBarHeight: this._layoutService.isVisible(Parts.STATUSBAR_PART, mainWindow) ? dom.getTotalHeight(assertIsDefined(this._layoutService.getContainer(mainWindow, Parts.STATUSBAR_PART))) : 0,
        windowBorder: this._layoutService.hasMainWindowBorder(),
        windowBorderRadius: this._layoutService.getMainWindowBorderRadius()
      }
    });
  }
  _shouldSaveLayoutInfo() {
    return !isFullscreen(mainWindow) && !this._environmentService.isExtensionDevelopment && !this._didChangeTitleBarStyle;
  }
  _removePartsSplash() {
    const element = mainWindow.document.getElementById(PartsSplash._splashElementId);
    if (element) {
      element.style.display = "none";
    }
    const defaultStyles = mainWindow.document.head.getElementsByClassName("initialShellColors");
    defaultStyles[0]?.remove();
  }
};
PartsSplash = __decorateClass([
  __decorateParam(0, IThemeService),
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ISplashStorageService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, ILifecycleService)
], PartsSplash);
export {
  PartsSplash
};
//# sourceMappingURL=partsSplash.js.map
