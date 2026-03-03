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
import { DEFAULT_FONT_FAMILY } from "../../../../base/browser/fonts.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { EditorFontLigatures } from "../../../../editor/common/config/editorOptions.js";
import { EDITOR_FONT_DEFAULTS } from "../../../../editor/common/config/fontInfo.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import * as colorRegistry from "../../../../platform/theme/common/colorRegistry.js";
import { getSizeRegistry, sizeValueToCss } from "../../../../platform/theme/common/sizeRegistry.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import { IWorkbenchThemeService } from "../../../services/themes/common/workbenchThemeService.js";
let WebviewThemeDataProvider = class WebviewThemeDataProvider2 extends Disposable {
  static {
    __name(this, "WebviewThemeDataProvider");
  }
  constructor(_themeService, _configurationService) {
    super();
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._cachedWebViewThemeData = void 0;
    this._onThemeDataChanged = this._register(new Emitter());
    this.onThemeDataChanged = this._onThemeDataChanged.event;
    this._register(this._themeService.onDidColorThemeChange(() => {
      this._reset();
    }));
    const webviewConfigurationKeys = ["editor.fontFamily", "editor.fontWeight", "editor.fontSize", "editor.fontLigatures", "accessibility.underlineLinks"];
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (webviewConfigurationKeys.some((key) => e.affectsConfiguration(key))) {
        this._reset();
      }
    }));
  }
  getTheme() {
    return this._themeService.getColorTheme();
  }
  getWebviewThemeData() {
    if (!this._cachedWebViewThemeData) {
      const configuration = this._configurationService.getValue("editor");
      const editorFontFamily = configuration.fontFamily || EDITOR_FONT_DEFAULTS.fontFamily;
      const editorFontWeight = configuration.fontWeight || EDITOR_FONT_DEFAULTS.fontWeight;
      const editorFontSize = configuration.fontSize || EDITOR_FONT_DEFAULTS.fontSize;
      const editorFontLigatures = new EditorFontLigatures().validate(configuration.fontLigatures);
      const linkUnderlines = this._configurationService.getValue("accessibility.underlineLinks");
      const theme = this._themeService.getColorTheme();
      const exportedColors = colorRegistry.getColorRegistry().getColors().reduce((colors, entry) => {
        const color = theme.getColor(entry.id);
        if (color) {
          colors["vscode-" + entry.id.replace(".", "-")] = color.toString();
        }
        return colors;
      }, {});
      const sizeRegistry = getSizeRegistry();
      const exportedSizes = sizeRegistry.getSizes().reduce((sizes, entry) => {
        const sizeValue = sizeRegistry.resolveDefaultSize(entry.id, theme);
        if (sizeValue) {
          sizes["vscode-" + entry.id.replace(/\./g, "-")] = sizeValueToCss(sizeValue);
        }
        return sizes;
      }, {});
      const styles = {
        "vscode-font-family": DEFAULT_FONT_FAMILY,
        "vscode-font-weight": "normal",
        "vscode-font-size": "13px",
        "vscode-editor-font-family": editorFontFamily,
        "vscode-editor-font-weight": editorFontWeight,
        "vscode-editor-font-size": editorFontSize + "px",
        "text-link-decoration": linkUnderlines ? "underline" : "none",
        ...exportedColors,
        ...exportedSizes,
        "vscode-editor-font-feature-settings": editorFontLigatures
      };
      const activeTheme = ApiThemeClassName.fromTheme(theme);
      this._cachedWebViewThemeData = { styles, activeTheme, themeLabel: theme.label, themeId: theme.settingsId };
    }
    return this._cachedWebViewThemeData;
  }
  _reset() {
    this._cachedWebViewThemeData = void 0;
    this._onThemeDataChanged.fire();
  }
};
WebviewThemeDataProvider = __decorate([
  __param(0, IWorkbenchThemeService),
  __param(1, IConfigurationService)
], WebviewThemeDataProvider);
var ApiThemeClassName;
(function(ApiThemeClassName2) {
  ApiThemeClassName2["light"] = "vscode-light";
  ApiThemeClassName2["dark"] = "vscode-dark";
  ApiThemeClassName2["highContrast"] = "vscode-high-contrast";
  ApiThemeClassName2["highContrastLight"] = "vscode-high-contrast-light";
})(ApiThemeClassName || (ApiThemeClassName = {}));
(function(ApiThemeClassName2) {
  function fromTheme(theme) {
    switch (theme.type) {
      case ColorScheme.LIGHT:
        return ApiThemeClassName2.light;
      case ColorScheme.DARK:
        return ApiThemeClassName2.dark;
      case ColorScheme.HIGH_CONTRAST_DARK:
        return ApiThemeClassName2.highContrast;
      case ColorScheme.HIGH_CONTRAST_LIGHT:
        return ApiThemeClassName2.highContrastLight;
    }
  }
  __name(fromTheme, "fromTheme");
  ApiThemeClassName2.fromTheme = fromTheme;
})(ApiThemeClassName || (ApiThemeClassName = {}));
export {
  WebviewThemeDataProvider
};
//# sourceMappingURL=themeing.js.map
