var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../base/common/buffer.js";
import { IStringDictionary } from "../../../base/common/collections.js";
import { PerformanceMark } from "../../../base/common/performance.js";
import { isMacintosh, isNative, isWeb } from "../../../base/common/platform.js";
import { URI, UriComponents, UriDto } from "../../../base/common/uri.js";
import { ISandboxConfiguration } from "../../../base/parts/sandbox/common/sandboxTypes.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEditorOptions } from "../../editor/common/editor.js";
import { NativeParsedArgs } from "../../environment/common/argv.js";
import { FileType } from "../../files/common/files.js";
import { ILoggerResource, LogLevel } from "../../log/common/log.js";
import { PolicyDefinition, PolicyValue } from "../../policy/common/policy.js";
import { IPartsSplash } from "../../theme/common/themeService.js";
import { IUserDataProfile } from "../../userDataProfile/common/userDataProfile.js";
import { IAnyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from "../../workspace/common/workspace.js";
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
function getMenuBarVisibility(configurationService) {
  const nativeTitleBarEnabled = hasNativeTitlebar(configurationService);
  const menuBarVisibility = configurationService.getValue("window.menuBarVisibility");
  if (menuBarVisibility === "default" || nativeTitleBarEnabled && menuBarVisibility === "compact" || isMacintosh && isNative) {
    return "classic";
  } else {
    return menuBarVisibility;
  }
}
__name(getMenuBarVisibility, "getMenuBarVisibility");
var TitleBarSetting = /* @__PURE__ */ ((TitleBarSetting2) => {
  TitleBarSetting2["TITLE_BAR_STYLE"] = "window.titleBarStyle";
  TitleBarSetting2["CUSTOM_TITLE_BAR_VISIBILITY"] = "window.customTitleBarVisibility";
  return TitleBarSetting2;
})(TitleBarSetting || {});
var TitlebarStyle = /* @__PURE__ */ ((TitlebarStyle2) => {
  TitlebarStyle2["NATIVE"] = "native";
  TitlebarStyle2["CUSTOM"] = "custom";
  return TitlebarStyle2;
})(TitlebarStyle || {});
var WindowControlsStyle = /* @__PURE__ */ ((WindowControlsStyle2) => {
  WindowControlsStyle2["NATIVE"] = "native";
  WindowControlsStyle2["CUSTOM"] = "custom";
  WindowControlsStyle2["HIDDEN"] = "hidden";
  return WindowControlsStyle2;
})(WindowControlsStyle || {});
var CustomTitleBarVisibility = /* @__PURE__ */ ((CustomTitleBarVisibility2) => {
  CustomTitleBarVisibility2["AUTO"] = "auto";
  CustomTitleBarVisibility2["WINDOWED"] = "windowed";
  CustomTitleBarVisibility2["NEVER"] = "never";
  return CustomTitleBarVisibility2;
})(CustomTitleBarVisibility || {});
function hasCustomTitlebar(configurationService, titleBarStyle) {
  return true;
}
__name(hasCustomTitlebar, "hasCustomTitlebar");
function hasNativeTitlebar(configurationService, titleBarStyle) {
  if (!titleBarStyle) {
    titleBarStyle = getTitleBarStyle(configurationService);
  }
  return titleBarStyle === "native" /* NATIVE */;
}
__name(hasNativeTitlebar, "hasNativeTitlebar");
function getTitleBarStyle(configurationService) {
  if (isWeb) {
    return "custom" /* CUSTOM */;
  }
  const configuration = configurationService.getValue("window");
  if (configuration) {
    const useNativeTabs = isMacintosh && configuration.nativeTabs === true;
    if (useNativeTabs) {
      return "native" /* NATIVE */;
    }
    const useSimpleFullScreen = isMacintosh && configuration.nativeFullScreen === false;
    if (useSimpleFullScreen) {
      return "native" /* NATIVE */;
    }
    const style = configuration.titleBarStyle;
    if (style === "native" /* NATIVE */ || style === "custom" /* CUSTOM */) {
      return style;
    }
  }
  return "custom" /* CUSTOM */;
}
__name(getTitleBarStyle, "getTitleBarStyle");
function getWindowControlsStyle(configurationService) {
  if (isWeb || isMacintosh || getTitleBarStyle(configurationService) === "native" /* NATIVE */) {
    return "native" /* NATIVE */;
  }
  const configuration = configurationService.getValue("window");
  const style = configuration?.controlsStyle;
  if (style === "custom" /* CUSTOM */ || style === "hidden" /* HIDDEN */) {
    return style;
  }
  return "native" /* NATIVE */;
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
    if (setting === "custom" /* CUSTOM */ || setting === "hidden" /* HIDDEN */) {
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
  TitleBarSetting,
  TitlebarStyle,
  WindowControlsStyle,
  WindowMinimumSize,
  getMenuBarVisibility,
  getTitleBarStyle,
  getWindowControlsStyle,
  hasCustomTitlebar,
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
