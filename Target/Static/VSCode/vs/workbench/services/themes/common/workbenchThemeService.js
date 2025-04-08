var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { refineServiceDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Event } from "../../../../base/common/event.js";
import { Color } from "../../../../base/common/color.js";
import { IColorTheme, IThemeService, IFileIconTheme, IProductIconTheme } from "../../../../platform/theme/common/themeService.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { isBoolean, isString } from "../../../../base/common/types.js";
import { IconContribution, IconDefinition } from "../../../../platform/theme/common/iconRegistry.js";
import { ColorScheme, ThemeTypeSelector } from "../../../../platform/theme/common/theme.js";
const IWorkbenchThemeService = refineServiceDecorator(IThemeService);
const THEME_SCOPE_OPEN_PAREN = "[";
const THEME_SCOPE_CLOSE_PAREN = "]";
const THEME_SCOPE_WILDCARD = "*";
const themeScopeRegex = /\[(.+?)\]/g;
var ThemeSettings = /* @__PURE__ */ ((ThemeSettings2) => {
  ThemeSettings2["COLOR_THEME"] = "workbench.colorTheme";
  ThemeSettings2["FILE_ICON_THEME"] = "workbench.iconTheme";
  ThemeSettings2["PRODUCT_ICON_THEME"] = "workbench.productIconTheme";
  ThemeSettings2["COLOR_CUSTOMIZATIONS"] = "workbench.colorCustomizations";
  ThemeSettings2["TOKEN_COLOR_CUSTOMIZATIONS"] = "editor.tokenColorCustomizations";
  ThemeSettings2["SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS"] = "editor.semanticTokenColorCustomizations";
  ThemeSettings2["PREFERRED_DARK_THEME"] = "workbench.preferredDarkColorTheme";
  ThemeSettings2["PREFERRED_LIGHT_THEME"] = "workbench.preferredLightColorTheme";
  ThemeSettings2["PREFERRED_HC_DARK_THEME"] = "workbench.preferredHighContrastColorTheme";
  ThemeSettings2["PREFERRED_HC_LIGHT_THEME"] = "workbench.preferredHighContrastLightColorTheme";
  ThemeSettings2["DETECT_COLOR_SCHEME"] = "window.autoDetectColorScheme";
  ThemeSettings2["DETECT_HC"] = "window.autoDetectHighContrast";
  ThemeSettings2["SYSTEM_COLOR_THEME"] = "window.systemColorTheme";
  return ThemeSettings2;
})(ThemeSettings || {});
var ThemeSettingDefaults = /* @__PURE__ */ ((ThemeSettingDefaults2) => {
  ThemeSettingDefaults2["COLOR_THEME_DARK"] = "Default Dark Modern";
  ThemeSettingDefaults2["COLOR_THEME_LIGHT"] = "Default Light Modern";
  ThemeSettingDefaults2["COLOR_THEME_HC_DARK"] = "Default High Contrast";
  ThemeSettingDefaults2["COLOR_THEME_HC_LIGHT"] = "Default High Contrast Light";
  ThemeSettingDefaults2["COLOR_THEME_DARK_OLD"] = "Default Dark+";
  ThemeSettingDefaults2["COLOR_THEME_LIGHT_OLD"] = "Default Light+";
  ThemeSettingDefaults2["FILE_ICON_THEME"] = "vs-seti";
  ThemeSettingDefaults2["PRODUCT_ICON_THEME"] = "Default";
  return ThemeSettingDefaults2;
})(ThemeSettingDefaults || {});
const COLOR_THEME_DARK_INITIAL_COLORS = {
  "activityBar.activeBorder": "#0078d4",
  "activityBar.background": "#181818",
  "activityBar.border": "#2b2b2b",
  "activityBar.foreground": "#d7d7d7",
  "activityBar.inactiveForeground": "#868686",
  "editorGroup.border": "#ffffff17",
  "editorGroupHeader.tabsBackground": "#181818",
  "editorGroupHeader.tabsBorder": "#2b2b2b",
  "statusBar.background": "#181818",
  "statusBar.border": "#2b2b2b",
  "statusBar.foreground": "#cccccc",
  "statusBar.noFolderBackground": "#1f1f1f",
  "tab.activeBackground": "#1f1f1f",
  "tab.activeBorder": "#1f1f1f",
  "tab.activeBorderTop": "#0078d4",
  "tab.activeForeground": "#ffffff",
  "tab.border": "#2b2b2b",
  "textLink.foreground": "#4daafc",
  "titleBar.activeBackground": "#181818",
  "titleBar.activeForeground": "#cccccc",
  "titleBar.border": "#2b2b2b",
  "titleBar.inactiveBackground": "#1f1f1f",
  "titleBar.inactiveForeground": "#9d9d9d",
  "welcomePage.tileBackground": "#2b2b2b"
};
const COLOR_THEME_LIGHT_INITIAL_COLORS = {
  "activityBar.activeBorder": "#005FB8",
  "activityBar.background": "#f8f8f8",
  "activityBar.border": "#e5e5e5",
  "activityBar.foreground": "#1f1f1f",
  "activityBar.inactiveForeground": "#616161",
  "editorGroup.border": "#e5e5e5",
  "editorGroupHeader.tabsBackground": "#f8f8f8",
  "editorGroupHeader.tabsBorder": "#e5e5e5",
  "statusBar.background": "#f8f8f8",
  "statusBar.border": "#e5e5e5",
  "statusBar.foreground": "#3b3b3b",
  "statusBar.noFolderBackground": "#f8f8f8",
  "tab.activeBackground": "#ffffff",
  "tab.activeBorder": "#f8f8f8",
  "tab.activeBorderTop": "#005fb8",
  "tab.activeForeground": "#3b3b3b",
  "tab.border": "#e5e5e5",
  "textLink.foreground": "#005fb8",
  "titleBar.activeBackground": "#f8f8f8",
  "titleBar.activeForeground": "#1e1e1e",
  "titleBar.border": "#E5E5E5",
  "titleBar.inactiveBackground": "#f8f8f8",
  "titleBar.inactiveForeground": "#8b949e",
  "welcomePage.tileBackground": "#f3f3f3"
};
var ExtensionData;
((ExtensionData2) => {
  function toJSONObject(d) {
    return d && { _extensionId: d.extensionId, _extensionIsBuiltin: d.extensionIsBuiltin, _extensionName: d.extensionName, _extensionPublisher: d.extensionPublisher };
  }
  ExtensionData2.toJSONObject = toJSONObject;
  __name(toJSONObject, "toJSONObject");
  function fromJSONObject(o) {
    if (o && isString(o._extensionId) && isBoolean(o._extensionIsBuiltin) && isString(o._extensionName) && isString(o._extensionPublisher)) {
      return { extensionId: o._extensionId, extensionIsBuiltin: o._extensionIsBuiltin, extensionName: o._extensionName, extensionPublisher: o._extensionPublisher };
    }
    return void 0;
  }
  ExtensionData2.fromJSONObject = fromJSONObject;
  __name(fromJSONObject, "fromJSONObject");
  function fromName(publisher, name, isBuiltin = false) {
    return { extensionPublisher: publisher, extensionId: `${publisher}.${name}`, extensionName: name, extensionIsBuiltin: isBuiltin };
  }
  ExtensionData2.fromName = fromName;
  __name(fromName, "fromName");
})(ExtensionData || (ExtensionData = {}));
export {
  COLOR_THEME_DARK_INITIAL_COLORS,
  COLOR_THEME_LIGHT_INITIAL_COLORS,
  ExtensionData,
  IWorkbenchThemeService,
  THEME_SCOPE_CLOSE_PAREN,
  THEME_SCOPE_OPEN_PAREN,
  THEME_SCOPE_WILDCARD,
  ThemeSettingDefaults,
  ThemeSettings,
  themeScopeRegex
};
//# sourceMappingURL=workbenchThemeService.js.map
