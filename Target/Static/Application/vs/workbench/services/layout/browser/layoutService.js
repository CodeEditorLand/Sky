var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { refineServiceDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { isMacintosh, isNative, isWeb } from "../../../../base/common/platform.js";
import { isAuxiliaryWindow } from "../../../../base/browser/window.js";
import { getMenuBarVisibility, hasCustomTitlebar, hasNativeMenu, hasNativeTitlebar } from "../../../../platform/window/common/window.js";
import { isFullscreen, isWCOEnabled } from "../../../../base/browser/browser.js";
const IWorkbenchLayoutService = refineServiceDecorator(ILayoutService);
var Parts;
(function(Parts2) {
  Parts2["TITLEBAR_PART"] = "workbench.parts.titlebar";
  Parts2["BANNER_PART"] = "workbench.parts.banner";
  Parts2["ACTIVITYBAR_PART"] = "workbench.parts.activitybar";
  Parts2["SIDEBAR_PART"] = "workbench.parts.sidebar";
  Parts2["PANEL_PART"] = "workbench.parts.panel";
  Parts2["AUXILIARYBAR_PART"] = "workbench.parts.auxiliarybar";
  Parts2["CHATBAR_PART"] = "workbench.parts.chatbar";
  Parts2["EDITOR_PART"] = "workbench.parts.editor";
  Parts2["STATUSBAR_PART"] = "workbench.parts.statusbar";
})(Parts || (Parts = {}));
var ZenModeSettings;
(function(ZenModeSettings2) {
  ZenModeSettings2["SHOW_TABS"] = "zenMode.showTabs";
  ZenModeSettings2["HIDE_LINENUMBERS"] = "zenMode.hideLineNumbers";
  ZenModeSettings2["HIDE_STATUSBAR"] = "zenMode.hideStatusBar";
  ZenModeSettings2["HIDE_ACTIVITYBAR"] = "zenMode.hideActivityBar";
  ZenModeSettings2["CENTER_LAYOUT"] = "zenMode.centerLayout";
  ZenModeSettings2["FULLSCREEN"] = "zenMode.fullScreen";
  ZenModeSettings2["RESTORE"] = "zenMode.restore";
  ZenModeSettings2["SILENT_NOTIFICATIONS"] = "zenMode.silentNotifications";
})(ZenModeSettings || (ZenModeSettings = {}));
var LayoutSettings;
(function(LayoutSettings2) {
  LayoutSettings2["ACTIVITY_BAR_LOCATION"] = "workbench.activityBar.location";
  LayoutSettings2["ACTIVITY_BAR_AUTO_HIDE"] = "workbench.activityBar.autoHide";
  LayoutSettings2["ACTIVITY_BAR_COMPACT"] = "workbench.activityBar.compact";
  LayoutSettings2["EDITOR_TABS_MODE"] = "workbench.editor.showTabs";
  LayoutSettings2["EDITOR_ACTIONS_LOCATION"] = "workbench.editor.editorActionsLocation";
  LayoutSettings2["COMMAND_CENTER"] = "window.commandCenter";
  LayoutSettings2["LAYOUT_ACTIONS"] = "workbench.layoutControl.enabled";
})(LayoutSettings || (LayoutSettings = {}));
var ActivityBarPosition;
(function(ActivityBarPosition2) {
  ActivityBarPosition2["DEFAULT"] = "default";
  ActivityBarPosition2["TOP"] = "top";
  ActivityBarPosition2["BOTTOM"] = "bottom";
  ActivityBarPosition2["HIDDEN"] = "hidden";
})(ActivityBarPosition || (ActivityBarPosition = {}));
var EditorTabsMode;
(function(EditorTabsMode2) {
  EditorTabsMode2["MULTIPLE"] = "multiple";
  EditorTabsMode2["SINGLE"] = "single";
  EditorTabsMode2["NONE"] = "none";
})(EditorTabsMode || (EditorTabsMode = {}));
var EditorActionsLocation;
(function(EditorActionsLocation2) {
  EditorActionsLocation2["DEFAULT"] = "default";
  EditorActionsLocation2["TITLEBAR"] = "titleBar";
  EditorActionsLocation2["HIDDEN"] = "hidden";
})(EditorActionsLocation || (EditorActionsLocation = {}));
var Position;
(function(Position2) {
  Position2[Position2["LEFT"] = 0] = "LEFT";
  Position2[Position2["RIGHT"] = 1] = "RIGHT";
  Position2[Position2["BOTTOM"] = 2] = "BOTTOM";
  Position2[Position2["TOP"] = 3] = "TOP";
})(Position || (Position = {}));
function isHorizontal(position) {
  return position === 2 || position === 3;
}
__name(isHorizontal, "isHorizontal");
var PartOpensMaximizedOptions;
(function(PartOpensMaximizedOptions2) {
  PartOpensMaximizedOptions2[PartOpensMaximizedOptions2["ALWAYS"] = 0] = "ALWAYS";
  PartOpensMaximizedOptions2[PartOpensMaximizedOptions2["NEVER"] = 1] = "NEVER";
  PartOpensMaximizedOptions2[PartOpensMaximizedOptions2["REMEMBER_LAST"] = 2] = "REMEMBER_LAST";
})(PartOpensMaximizedOptions || (PartOpensMaximizedOptions = {}));
function positionToString(position) {
  switch (position) {
    case 0:
      return "left";
    case 1:
      return "right";
    case 2:
      return "bottom";
    case 3:
      return "top";
    default:
      return "bottom";
  }
}
__name(positionToString, "positionToString");
const positionsByString = {
  [positionToString(
    0
    /* Position.LEFT */
  )]: 0,
  [positionToString(
    1
    /* Position.RIGHT */
  )]: 1,
  [positionToString(
    2
    /* Position.BOTTOM */
  )]: 2,
  [positionToString(
    3
    /* Position.TOP */
  )]: 3
  /* Position.TOP */
};
function positionFromString(str) {
  return positionsByString[str];
}
__name(positionFromString, "positionFromString");
function partOpensMaximizedSettingToString(setting) {
  switch (setting) {
    case 0:
      return "always";
    case 1:
      return "never";
    case 2:
      return "preserve";
    default:
      return "preserve";
  }
}
__name(partOpensMaximizedSettingToString, "partOpensMaximizedSettingToString");
const partOpensMaximizedByString = {
  [partOpensMaximizedSettingToString(
    0
    /* PartOpensMaximizedOptions.ALWAYS */
  )]: 0,
  [partOpensMaximizedSettingToString(
    1
    /* PartOpensMaximizedOptions.NEVER */
  )]: 1,
  [partOpensMaximizedSettingToString(
    2
    /* PartOpensMaximizedOptions.REMEMBER_LAST */
  )]: 2
  /* PartOpensMaximizedOptions.REMEMBER_LAST */
};
function partOpensMaximizedFromString(str) {
  return partOpensMaximizedByString[str];
}
__name(partOpensMaximizedFromString, "partOpensMaximizedFromString");
function isMultiWindowPart(part) {
  return part === "workbench.parts.editor" || part === "workbench.parts.statusbar" || part === "workbench.parts.titlebar";
}
__name(isMultiWindowPart, "isMultiWindowPart");
function shouldShowCustomTitleBar(configurationService, window, menuBarToggled) {
  if (!hasCustomTitlebar(configurationService)) {
    return false;
  }
  const inFullscreen = isFullscreen(window);
  const nativeTitleBarEnabled = hasNativeTitlebar(configurationService);
  if (!isWeb) {
    const showCustomTitleBar = configurationService.getValue(
      "window.customTitleBarVisibility"
      /* TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY */
    );
    if (showCustomTitleBar === "never" && nativeTitleBarEnabled || showCustomTitleBar === "windowed" && inFullscreen) {
      return false;
    }
  }
  if (!isTitleBarEmpty(configurationService)) {
    return true;
  }
  if (nativeTitleBarEnabled && hasNativeMenu(configurationService)) {
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
  if (configurationService.getValue(
    "window.commandCenter"
    /* LayoutSettings.COMMAND_CENTER */
  )) {
    return false;
  }
  const activityBarPosition = configurationService.getValue(
    "workbench.activityBar.location"
    /* LayoutSettings.ACTIVITY_BAR_LOCATION */
  );
  if (activityBarPosition === "top" || activityBarPosition === "bottom") {
    return false;
  }
  const editorActionsLocation = configurationService.getValue(
    "workbench.editor.editorActionsLocation"
    /* LayoutSettings.EDITOR_ACTIONS_LOCATION */
  );
  const editorTabsMode = configurationService.getValue(
    "workbench.editor.showTabs"
    /* LayoutSettings.EDITOR_TABS_MODE */
  );
  if (editorActionsLocation === "titleBar" || editorActionsLocation === "default" && editorTabsMode === "none") {
    return false;
  }
  if (configurationService.getValue(
    "workbench.layoutControl.enabled"
    /* LayoutSettings.LAYOUT_ACTIONS */
  )) {
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
  PartOpensMaximizedOptions,
  Parts,
  Position,
  ZenModeSettings,
  isHorizontal,
  isMultiWindowPart,
  partOpensMaximizedFromString,
  positionFromString,
  positionToString,
  shouldShowCustomTitleBar
};
//# sourceMappingURL=layoutService.js.map
