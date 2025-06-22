var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isMacintosh, isNative, isWeb } from "../../../base/common/platform.js";
const WindowMinimumSize = {
  WIDTH: 400,
  WIDTH_WITH_VERTICAL_PANEL: 600,
  HEIGHT: 270
};
function isOpenedAuxiliaryWindow(candidate) {
  return typeof candidate.parentId === "number";
}
__name(isOpenedAuxiliaryWindow, "isOpenedAuxiliaryWindow");
function isWorkspaceToOpen(uriToOpen) {
  return !!uriToOpen.workspaceUri;
}
__name(isWorkspaceToOpen, "isWorkspaceToOpen");
function isFolderToOpen(uriToOpen) {
  return !!uriToOpen.folderUri;
}
__name(isFolderToOpen, "isFolderToOpen");
function isFileToOpen(uriToOpen) {
  return !!uriToOpen.fileUri;
}
__name(isFileToOpen, "isFileToOpen");
var MenuSettings;
(function(MenuSettings2) {
  MenuSettings2["MenuStyle"] = "window.menuStyle";
  MenuSettings2["MenuBarVisibility"] = "window.menuBarVisibility";
})(MenuSettings || (MenuSettings = {}));
var MenuStyleConfiguration;
(function(MenuStyleConfiguration2) {
  MenuStyleConfiguration2["CUSTOM"] = "custom";
  MenuStyleConfiguration2["NATIVE"] = "native";
  MenuStyleConfiguration2["INHERIT"] = "inherit";
})(MenuStyleConfiguration || (MenuStyleConfiguration = {}));
function hasNativeContextMenu(configurationService, titleBarStyle) {
  if (isWeb) {
    return false;
  }
  const nativeTitle = hasNativeTitlebar(configurationService, titleBarStyle);
  const windowConfigurations = configurationService.getValue("window");
  if (windowConfigurations?.menuStyle === "native") {
    if (!isMacintosh && !nativeTitle) {
      return false;
    }
    return true;
  }
  if (windowConfigurations?.menuStyle === "custom") {
    return false;
  }
  return nativeTitle;
}
__name(hasNativeContextMenu, "hasNativeContextMenu");
function hasNativeMenu(configurationService, titleBarStyle) {
  if (isWeb) {
    return false;
  }
  if (isMacintosh) {
    return true;
  }
  return hasNativeContextMenu(configurationService, titleBarStyle);
}
__name(hasNativeMenu, "hasNativeMenu");
function getMenuBarVisibility(configurationService) {
  const menuBarVisibility = configurationService.getValue(
    "window.menuBarVisibility"
    /* MenuSettings.MenuBarVisibility */
  );
  if (menuBarVisibility === "default" || menuBarVisibility === "compact" && hasNativeMenu(configurationService) || isMacintosh && isNative) {
    return "classic";
  } else {
    return menuBarVisibility;
  }
}
__name(getMenuBarVisibility, "getMenuBarVisibility");
var TitleBarSetting;
(function(TitleBarSetting2) {
  TitleBarSetting2["TITLE_BAR_STYLE"] = "window.titleBarStyle";
  TitleBarSetting2["CUSTOM_TITLE_BAR_VISIBILITY"] = "window.customTitleBarVisibility";
})(TitleBarSetting || (TitleBarSetting = {}));
var TitlebarStyle;
(function(TitlebarStyle2) {
  TitlebarStyle2["NATIVE"] = "native";
  TitlebarStyle2["CUSTOM"] = "custom";
})(TitlebarStyle || (TitlebarStyle = {}));
var WindowControlsStyle;
(function(WindowControlsStyle2) {
  WindowControlsStyle2["NATIVE"] = "native";
  WindowControlsStyle2["CUSTOM"] = "custom";
  WindowControlsStyle2["HIDDEN"] = "hidden";
})(WindowControlsStyle || (WindowControlsStyle = {}));
var CustomTitleBarVisibility;
(function(CustomTitleBarVisibility2) {
  CustomTitleBarVisibility2["AUTO"] = "auto";
  CustomTitleBarVisibility2["WINDOWED"] = "windowed";
  CustomTitleBarVisibility2["NEVER"] = "never";
})(CustomTitleBarVisibility || (CustomTitleBarVisibility = {}));
function hasCustomTitlebar(configurationService, titleBarStyle) {
  return true;
}
__name(hasCustomTitlebar, "hasCustomTitlebar");
function hasNativeTitlebar(configurationService, titleBarStyle) {
  if (!titleBarStyle) {
    titleBarStyle = getTitleBarStyle(configurationService);
  }
  return titleBarStyle === "native";
}
__name(hasNativeTitlebar, "hasNativeTitlebar");
function getTitleBarStyle(configurationService) {
  if (isWeb) {
    return "custom";
  }
  const configuration = configurationService.getValue("window");
  if (configuration) {
    const useNativeTabs = isMacintosh && configuration.nativeTabs === true;
    if (useNativeTabs) {
      return "native";
    }
    const useSimpleFullScreen = isMacintosh && configuration.nativeFullScreen === false;
    if (useSimpleFullScreen) {
      return "native";
    }
    const style = configuration.titleBarStyle;
    if (style === "native" || style === "custom") {
      return style;
    }
  }
  return "custom";
}
__name(getTitleBarStyle, "getTitleBarStyle");
function getWindowControlsStyle(configurationService) {
  if (isWeb || isMacintosh || getTitleBarStyle(configurationService) === "native") {
    return "native";
  }
  const configuration = configurationService.getValue("window");
  const style = configuration?.controlsStyle;
  if (style === "custom" || style === "hidden") {
    return style;
  }
  return "native";
}
__name(getWindowControlsStyle, "getWindowControlsStyle");
const DEFAULT_CUSTOM_TITLEBAR_HEIGHT = 35;
function useWindowControlsOverlay(configurationService) {
  if (isWeb) {
    return false;
  }
  if (hasNativeTitlebar(configurationService)) {
    return false;
  }
  if (!isMacintosh) {
    const setting = getWindowControlsStyle(configurationService);
    if (setting === "custom" || setting === "hidden") {
      return false;
    }
  }
  return true;
}
__name(useWindowControlsOverlay, "useWindowControlsOverlay");
function useNativeFullScreen(configurationService) {
  const windowConfig = configurationService.getValue("window");
  if (!windowConfig || typeof windowConfig.nativeFullScreen !== "boolean") {
    return true;
  }
  if (windowConfig.nativeTabs) {
    return true;
  }
  return windowConfig.nativeFullScreen !== false;
}
__name(useNativeFullScreen, "useNativeFullScreen");
function zoomLevelToZoomFactor(zoomLevel = 0) {
  return Math.pow(1.2, zoomLevel);
}
__name(zoomLevelToZoomFactor, "zoomLevelToZoomFactor");
const DEFAULT_WINDOW_SIZE = { width: 1200, height: 800 };
const DEFAULT_AUX_WINDOW_SIZE = { width: 1024, height: 768 };
export {
  CustomTitleBarVisibility,
  DEFAULT_AUX_WINDOW_SIZE,
  DEFAULT_CUSTOM_TITLEBAR_HEIGHT,
  DEFAULT_WINDOW_SIZE,
  MenuSettings,
  MenuStyleConfiguration,
  TitleBarSetting,
  TitlebarStyle,
  WindowControlsStyle,
  WindowMinimumSize,
  getMenuBarVisibility,
  getTitleBarStyle,
  getWindowControlsStyle,
  hasCustomTitlebar,
  hasNativeContextMenu,
  hasNativeMenu,
  hasNativeTitlebar,
  isFileToOpen,
  isFolderToOpen,
  isOpenedAuxiliaryWindow,
  isWorkspaceToOpen,
  useNativeFullScreen,
  useWindowControlsOverlay,
  zoomLevelToZoomFactor
};
//# sourceMappingURL=window.js.map
