var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { refineServiceDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Event } from "../../../../base/common/event.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { Part } from "../../../browser/part.js";
import { IDimension } from "../../../../base/browser/dom.js";
import { Direction, IViewSize } from "../../../../base/browser/ui/grid/grid.js";
import { isMacintosh, isNative, isWeb } from "../../../../base/common/platform.js";
import { isAuxiliaryWindow } from "../../../../base/browser/window.js";
import { CustomTitleBarVisibility, TitleBarSetting, getMenuBarVisibility, hasCustomTitlebar, hasNativeTitlebar } from "../../../../platform/window/common/window.js";
import { isFullscreen, isWCOEnabled } from "../../../../base/browser/browser.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
const IWorkbenchLayoutService = refineServiceDecorator(ILayoutService);
var Parts = /* @__PURE__ */ ((Parts2) => {
  Parts2["TITLEBAR_PART"] = "workbench.parts.titlebar";
  Parts2["BANNER_PART"] = "workbench.parts.banner";
  Parts2["ACTIVITYBAR_PART"] = "workbench.parts.activitybar";
  Parts2["SIDEBAR_PART"] = "workbench.parts.sidebar";
  Parts2["PANEL_PART"] = "workbench.parts.panel";
  Parts2["AUXILIARYBAR_PART"] = "workbench.parts.auxiliarybar";
  Parts2["EDITOR_PART"] = "workbench.parts.editor";
  Parts2["STATUSBAR_PART"] = "workbench.parts.statusbar";
  return Parts2;
})(Parts || {});
var ZenModeSettings = /* @__PURE__ */ ((ZenModeSettings2) => {
  ZenModeSettings2["SHOW_TABS"] = "zenMode.showTabs";
  ZenModeSettings2["HIDE_LINENUMBERS"] = "zenMode.hideLineNumbers";
  ZenModeSettings2["HIDE_STATUSBAR"] = "zenMode.hideStatusBar";
  ZenModeSettings2["HIDE_ACTIVITYBAR"] = "zenMode.hideActivityBar";
  ZenModeSettings2["CENTER_LAYOUT"] = "zenMode.centerLayout";
  ZenModeSettings2["FULLSCREEN"] = "zenMode.fullScreen";
  ZenModeSettings2["RESTORE"] = "zenMode.restore";
  ZenModeSettings2["SILENT_NOTIFICATIONS"] = "zenMode.silentNotifications";
  return ZenModeSettings2;
})(ZenModeSettings || {});
var LayoutSettings = /* @__PURE__ */ ((LayoutSettings2) => {
  LayoutSettings2["ACTIVITY_BAR_LOCATION"] = "workbench.activityBar.location";
  LayoutSettings2["EDITOR_TABS_MODE"] = "workbench.editor.showTabs";
  LayoutSettings2["EDITOR_ACTIONS_LOCATION"] = "workbench.editor.editorActionsLocation";
  LayoutSettings2["COMMAND_CENTER"] = "window.commandCenter";
  LayoutSettings2["LAYOUT_ACTIONS"] = "workbench.layoutControl.enabled";
  return LayoutSettings2;
})(LayoutSettings || {});
var ActivityBarPosition = /* @__PURE__ */ ((ActivityBarPosition2) => {
  ActivityBarPosition2["DEFAULT"] = "default";
  ActivityBarPosition2["TOP"] = "top";
  ActivityBarPosition2["BOTTOM"] = "bottom";
  ActivityBarPosition2["HIDDEN"] = "hidden";
  return ActivityBarPosition2;
})(ActivityBarPosition || {});
var EditorTabsMode = /* @__PURE__ */ ((EditorTabsMode2) => {
  EditorTabsMode2["MULTIPLE"] = "multiple";
  EditorTabsMode2["SINGLE"] = "single";
  EditorTabsMode2["NONE"] = "none";
  return EditorTabsMode2;
})(EditorTabsMode || {});
var EditorActionsLocation = /* @__PURE__ */ ((EditorActionsLocation2) => {
  EditorActionsLocation2["DEFAULT"] = "default";
  EditorActionsLocation2["TITLEBAR"] = "titleBar";
  EditorActionsLocation2["HIDDEN"] = "hidden";
  return EditorActionsLocation2;
})(EditorActionsLocation || {});
var Position = /* @__PURE__ */ ((Position2) => {
  Position2[Position2["LEFT"] = 0] = "LEFT";
  Position2[Position2["RIGHT"] = 1] = "RIGHT";
  Position2[Position2["BOTTOM"] = 2] = "BOTTOM";
  Position2[Position2["TOP"] = 3] = "TOP";
  return Position2;
})(Position || {});
function isHorizontal(position) {
  return position === 2 /* BOTTOM */ || position === 3 /* TOP */;
}
__name(isHorizontal, "isHorizontal");
var PanelOpensMaximizedOptions = /* @__PURE__ */ ((PanelOpensMaximizedOptions2) => {
  PanelOpensMaximizedOptions2[PanelOpensMaximizedOptions2["ALWAYS"] = 0] = "ALWAYS";
  PanelOpensMaximizedOptions2[PanelOpensMaximizedOptions2["NEVER"] = 1] = "NEVER";
  PanelOpensMaximizedOptions2[PanelOpensMaximizedOptions2["REMEMBER_LAST"] = 2] = "REMEMBER_LAST";
  return PanelOpensMaximizedOptions2;
})(PanelOpensMaximizedOptions || {});
function positionToString(position) {
  switch (position) {
    case 0 /* LEFT */:
      return "left";
    case 1 /* RIGHT */:
      return "right";
    case 2 /* BOTTOM */:
      return "bottom";
    case 3 /* TOP */:
      return "top";
    default:
      return "bottom";
  }
}
__name(positionToString, "positionToString");
const positionsByString = {
  [positionToString(0 /* LEFT */)]: 0 /* LEFT */,
  [positionToString(1 /* RIGHT */)]: 1 /* RIGHT */,
  [positionToString(2 /* BOTTOM */)]: 2 /* BOTTOM */,
  [positionToString(3 /* TOP */)]: 3 /* TOP */
};
function positionFromString(str) {
  return positionsByString[str];
}
__name(positionFromString, "positionFromString");
function panelOpensMaximizedSettingToString(setting) {
  switch (setting) {
    case 0 /* ALWAYS */:
      return "always";
    case 1 /* NEVER */:
      return "never";
    case 2 /* REMEMBER_LAST */:
      return "preserve";
    default:
      return "preserve";
  }
}
__name(panelOpensMaximizedSettingToString, "panelOpensMaximizedSettingToString");
const panelOpensMaximizedByString = {
  [panelOpensMaximizedSettingToString(0 /* ALWAYS */)]: 0 /* ALWAYS */,
  [panelOpensMaximizedSettingToString(1 /* NEVER */)]: 1 /* NEVER */,
  [panelOpensMaximizedSettingToString(2 /* REMEMBER_LAST */)]: 2 /* REMEMBER_LAST */
};
function panelOpensMaximizedFromString(str) {
  return panelOpensMaximizedByString[str];
}
__name(panelOpensMaximizedFromString, "panelOpensMaximizedFromString");
function isMultiWindowPart(part) {
  return part === "workbench.parts.editor" /* EDITOR_PART */ || part === "workbench.parts.statusbar" /* STATUSBAR_PART */ || part === "workbench.parts.titlebar" /* TITLEBAR_PART */;
}
__name(isMultiWindowPart, "isMultiWindowPart");
function shouldShowCustomTitleBar(configurationService, window, menuBarToggled) {
  if (!hasCustomTitlebar(configurationService)) {
    return false;
  }
  const inFullscreen = isFullscreen(window);
  const nativeTitleBarEnabled = hasNativeTitlebar(configurationService);
  if (!isWeb) {
    const showCustomTitleBar = configurationService.getValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY);
    if (showCustomTitleBar === CustomTitleBarVisibility.NEVER && nativeTitleBarEnabled || showCustomTitleBar === CustomTitleBarVisibility.WINDOWED && inFullscreen) {
      return false;
    }
  }
  if (!isTitleBarEmpty(configurationService)) {
    return true;
  }
  if (nativeTitleBarEnabled) {
    return false;
  }
  if (isMacintosh && isNative) {
    return !inFullscreen;
  }
  if (isNative && !inFullscreen) {
    return true;
  }
  if (isWCOEnabled() && !inFullscreen) {
    return true;
  }
  const menuBarVisibility = !isAuxiliaryWindow(window) ? getMenuBarVisibility(configurationService) : "hidden";
  switch (menuBarVisibility) {
    case "classic":
      return !inFullscreen || !!menuBarToggled;
    case "compact":
    case "hidden":
      return false;
    case "toggle":
      return !!menuBarToggled;
    case "visible":
      return true;
    default:
      return isWeb ? false : !inFullscreen || !!menuBarToggled;
  }
}
__name(shouldShowCustomTitleBar, "shouldShowCustomTitleBar");
function isTitleBarEmpty(configurationService) {
  if (configurationService.getValue("window.commandCenter" /* COMMAND_CENTER */)) {
    return false;
  }
  const activityBarPosition = configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
  if (activityBarPosition === "top" /* TOP */ || activityBarPosition === "bottom" /* BOTTOM */) {
    return false;
  }
  const editorActionsLocation = configurationService.getValue("workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */);
  const editorTabsMode = configurationService.getValue("workbench.editor.showTabs" /* EDITOR_TABS_MODE */);
  if (editorActionsLocation === "titleBar" /* TITLEBAR */ || editorActionsLocation === "default" /* DEFAULT */ && editorTabsMode === "none" /* NONE */) {
    return false;
  }
  if (configurationService.getValue("workbench.layoutControl.enabled" /* LAYOUT_ACTIONS */)) {
    return false;
  }
  return true;
}
__name(isTitleBarEmpty, "isTitleBarEmpty");
export {
  ActivityBarPosition,
  EditorActionsLocation,
  EditorTabsMode,
  IWorkbenchLayoutService,
  LayoutSettings,
  PanelOpensMaximizedOptions,
  Parts,
  Position,
  ZenModeSettings,
  isHorizontal,
  isMultiWindowPart,
  panelOpensMaximizedFromString,
  positionFromString,
  positionToString,
  shouldShowCustomTitleBar
};
//# sourceMappingURL=layoutService.js.map
