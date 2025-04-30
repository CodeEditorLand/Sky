var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename } from "../../../../base/common/path.js";
import * as Json from "../../../../base/common/json.js";
import { Color } from "../../../../base/common/color.js";
import { ExtensionData, THEME_SCOPE_CLOSE_PAREN, THEME_SCOPE_OPEN_PAREN, themeScopeRegex, THEME_SCOPE_WILDCARD } from "./workbenchThemeService.js";
import { convertSettings } from "./themeCompatibility.js";
import * as nls from "../../../../nls.js";
import * as types from "../../../../base/common/types.js";
import * as resources from "../../../../base/common/resources.js";
import { Extensions as ColorRegistryExtensions, editorBackground, editorForeground, DEFAULT_COLOR_CONFIG_VALUE } from "../../../../platform/theme/common/colorRegistry.js";
import { getThemeTypeSelector } from "../../../../platform/theme/common/themeService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { getParseErrorMessage } from "../../../../base/common/jsonErrorMessages.js";
import { parse as parsePList } from "./plistParser.js";
import { TokenStyle, SemanticTokenRule, getTokenClassificationRegistry, parseClassifierString } from "../../../../platform/theme/common/tokenClassificationRegistry.js";
import { createMatchers } from "./textMateScopeMatcher.js";
import { ColorScheme, ThemeTypeSelector } from "../../../../platform/theme/common/theme.js";
import { toStandardTokenType } from "../../../../editor/common/languages/supports/tokenization.js";
const colorRegistry = Registry.as(ColorRegistryExtensions.ColorContribution);
const tokenClassificationRegistry = getTokenClassificationRegistry();
const tokenGroupToScopesMap = {
  comments: ["comment", "punctuation.definition.comment"],
  strings: ["string", "meta.embedded.assembly"],
  keywords: ["keyword - keyword.operator", "keyword.control", "storage", "storage.type"],
  numbers: ["constant.numeric"],
  types: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
  functions: ["entity.name.function", "support.function"],
  variables: ["variable", "entity.name.variable"]
};
class ColorThemeData {
  static {
    __name(this, "ColorThemeData");
  }
  static {
    this.STORAGE_KEY = "colorThemeData";
  }
  constructor(id, label, settingsId) {
    this.themeTokenColors = [];
    this.customTokenColors = [];
    this.colorMap = {};
    this.customColorMap = {};
    this.semanticTokenRules = [];
    this.customSemanticTokenRules = [];
    this.textMateThemingRules = void 0;
    this.tokenColorIndex = void 0;
    this.id = id;
    this.label = label;
    this.settingsId = settingsId;
    this.isLoaded = false;
  }
  get semanticHighlighting() {
    if (this.customSemanticHighlighting !== void 0) {
      return this.customSemanticHighlighting;
    }
    if (this.customSemanticHighlightingDeprecated !== void 0) {
      return this.customSemanticHighlightingDeprecated;
    }
    return !!this.themeSemanticHighlighting;
  }
  get tokenColors() {
    if (!this.textMateThemingRules) {
      let addRule2 = function(rule) {
        if (rule.scope && rule.settings) {
          if (rule.scope === "token.info-token") {
            hasDefaultTokens = true;
          }
          result.push({ scope: rule.scope, settings: { foreground: normalizeColor(rule.settings.foreground), background: normalizeColor(rule.settings.background), fontStyle: rule.settings.fontStyle } });
        }
      };
      var addRule = addRule2;
      __name(addRule2, "addRule");
      const result = [];
      const foreground = this.getColor(editorForeground) || this.getDefault(editorForeground);
      const background = this.getColor(editorBackground) || this.getDefault(editorBackground);
      result.push({
        settings: {
          foreground: normalizeColor(foreground),
          background: normalizeColor(background)
        }
      });
      let hasDefaultTokens = false;
      this.themeTokenColors.forEach(addRule2);
      this.customTokenColors.forEach(addRule2);
      if (!hasDefaultTokens) {
        defaultThemeColors[this.type].forEach(addRule2);
      }
      this.textMateThemingRules = result;
    }
    return this.textMateThemingRules;
  }
  getColor(colorId, useDefault) {
    const customColor = this.customColorMap[colorId];
    if (customColor instanceof Color) {
      return customColor;
    }
    if (customColor === void 0) {
      const color = this.colorMap[colorId];
      if (color !== void 0) {
        return color;
      }
    }
    if (useDefault !== false) {
      return this.getDefault(colorId);
    }
    return void 0;
  }
  getTokenStyle(type, modifiers, language, useDefault = true, definitions = {}) {
    const result = {
      foreground: void 0,
      bold: void 0,
      underline: void 0,
      strikethrough: void 0,
      italic: void 0
    };
    const score = {
      foreground: -1,
      bold: -1,
      underline: -1,
      strikethrough: -1,
      italic: -1
    };
    function _processStyle(matchScore, style, definition) {
      if (style.foreground && score.foreground <= matchScore) {
        score.foreground = matchScore;
        result.foreground = style.foreground;
        definitions.foreground = definition;
      }
      for (const p of ["bold", "underline", "strikethrough", "italic"]) {
        const property = p;
        const info = style[property];
        if (info !== void 0) {
          if (score[property] <= matchScore) {
            score[property] = matchScore;
            result[property] = info;
            definitions[property] = definition;
          }
        }
      }
    }
    __name(_processStyle, "_processStyle");
    function _processSemanticTokenRule(rule) {
      const matchScore = rule.selector.match(type, modifiers, language);
      if (matchScore >= 0) {
        _processStyle(matchScore, rule.style, rule);
      }
    }
    __name(_processSemanticTokenRule, "_processSemanticTokenRule");
    this.semanticTokenRules.forEach(_processSemanticTokenRule);
    this.customSemanticTokenRules.forEach(_processSemanticTokenRule);
    let hasUndefinedStyleProperty = false;
    for (const k in score) {
      const key = k;
      if (score[key] === -1) {
        hasUndefinedStyleProperty = true;
      } else {
        score[key] = Number.MAX_VALUE;
      }
    }
    if (hasUndefinedStyleProperty) {
      for (const rule of tokenClassificationRegistry.getTokenStylingDefaultRules()) {
        const matchScore = rule.selector.match(type, modifiers, language);
        if (matchScore >= 0) {
          let style;
          if (rule.defaults.scopesToProbe) {
            style = this.resolveScopes(rule.defaults.scopesToProbe);
            if (style) {
              _processStyle(matchScore, style, rule.defaults.scopesToProbe);
            }
          }
          if (!style && useDefault !== false) {
            const tokenStyleValue = rule.defaults[this.type];
            style = this.resolveTokenStyleValue(tokenStyleValue);
            if (style) {
              _processStyle(matchScore, style, tokenStyleValue);
            }
          }
        }
      }
    }
    return TokenStyle.fromData(result);
  }
  /**
   * @param tokenStyleValue Resolve a tokenStyleValue in the context of a theme
   */
  resolveTokenStyleValue(tokenStyleValue) {
    if (tokenStyleValue === void 0) {
      return void 0;
    } else if (typeof tokenStyleValue === "string") {
      const { type, modifiers, language } = parseClassifierString(tokenStyleValue, "");
      return this.getTokenStyle(type, modifiers, language);
    } else if (typeof tokenStyleValue === "object") {
      return tokenStyleValue;
    }
    return void 0;
  }
  getTokenColorIndex() {
    if (!this.tokenColorIndex) {
      const index = new TokenColorIndex();
      this.tokenColors.forEach((rule) => {
        index.add(rule.settings.foreground);
        index.add(rule.settings.background);
      });
      this.semanticTokenRules.forEach((r) => index.add(r.style.foreground));
      tokenClassificationRegistry.getTokenStylingDefaultRules().forEach((r) => {
        const defaultColor = r.defaults[this.type];
        if (defaultColor && typeof defaultColor === "object") {
          index.add(defaultColor.foreground);
        }
      });
      this.customSemanticTokenRules.forEach((r) => index.add(r.style.foreground));
      this.tokenColorIndex = index;
    }
    return this.tokenColorIndex;
  }
  get tokenColorMap() {
    return this.getTokenColorIndex().asArray();
  }
  getTokenStyleMetadata(typeWithLanguage, modifiers, defaultLanguage, useDefault = true, definitions = {}) {
    const { type, language } = parseClassifierString(typeWithLanguage, defaultLanguage);
    const style = this.getTokenStyle(type, modifiers, language, useDefault, definitions);
    if (!style) {
      return void 0;
    }
    return {
      foreground: this.getTokenColorIndex().get(style.foreground),
      bold: style.bold,
      underline: style.underline,
      strikethrough: style.strikethrough,
      italic: style.italic
    };
  }
  getTokenStylingRuleScope(rule) {
    if (this.customSemanticTokenRules.indexOf(rule) !== -1) {
      return "setting";
    }
    if (this.semanticTokenRules.indexOf(rule) !== -1) {
      return "theme";
    }
    return void 0;
  }
  getDefault(colorId) {
    return colorRegistry.resolveDefaultColor(colorId, this);
  }
  resolveScopes(scopes, definitions) {
    if (!this.themeTokenScopeMatchers) {
      this.themeTokenScopeMatchers = this.themeTokenColors.map(getScopeMatcher);
    }
    if (!this.customTokenScopeMatchers) {
      this.customTokenScopeMatchers = this.customTokenColors.map(getScopeMatcher);
    }
    for (const scope of scopes) {
      let findTokenStyleForScopeInScopes2 = function(scopeMatchers, themingRules) {
        for (let i = 0; i < scopeMatchers.length; i++) {
          const score = scopeMatchers[i](scope);
          if (score >= 0) {
            const themingRule = themingRules[i];
            const settings = themingRules[i].settings;
            if (score >= foregroundScore && settings.foreground) {
              foreground = settings.foreground;
              foregroundScore = score;
              foregroundThemingRule = themingRule;
            }
            if (score >= fontStyleScore && types.isString(settings.fontStyle)) {
              fontStyle = settings.fontStyle;
              fontStyleScore = score;
              fontStyleThemingRule = themingRule;
            }
          }
        }
      };
      var findTokenStyleForScopeInScopes = findTokenStyleForScopeInScopes2;
      __name(findTokenStyleForScopeInScopes2, "findTokenStyleForScopeInScopes");
      let foreground = void 0;
      let fontStyle = void 0;
      let foregroundScore = -1;
      let fontStyleScore = -1;
      let fontStyleThemingRule = void 0;
      let foregroundThemingRule = void 0;
      findTokenStyleForScopeInScopes2(this.themeTokenScopeMatchers, this.themeTokenColors);
      findTokenStyleForScopeInScopes2(this.customTokenScopeMatchers, this.customTokenColors);
      if (foreground !== void 0 || fontStyle !== void 0) {
        if (definitions) {
          definitions.foreground = foregroundThemingRule;
          definitions.bold = definitions.italic = definitions.underline = definitions.strikethrough = fontStyleThemingRule;
          definitions.scope = scope;
        }
        return TokenStyle.fromSettings(foreground, fontStyle);
      }
    }
    return void 0;
  }
  defines(colorId) {
    const customColor = this.customColorMap[colorId];
    if (customColor instanceof Color) {
      return true;
    }
    return customColor === void 0 && this.colorMap.hasOwnProperty(colorId);
  }
  setCustomizations(settings) {
    this.setCustomColors(settings.colorCustomizations);
    this.setCustomTokenColors(settings.tokenColorCustomizations);
    this.setCustomSemanticTokenColors(settings.semanticTokenColorCustomizations);
  }
  setCustomColors(colors) {
    this.customColorMap = {};
    this.overwriteCustomColors(colors);
    const themeSpecificColors = this.getThemeSpecificColors(colors);
    if (types.isObject(themeSpecificColors)) {
      this.overwriteCustomColors(themeSpecificColors);
    }
    this.tokenColorIndex = void 0;
    this.textMateThemingRules = void 0;
    this.customTokenScopeMatchers = void 0;
  }
  overwriteCustomColors(colors) {
    for (const id in colors) {
      const colorVal = colors[id];
      if (colorVal === DEFAULT_COLOR_CONFIG_VALUE) {
        this.customColorMap[id] = DEFAULT_COLOR_CONFIG_VALUE;
      } else if (typeof colorVal === "string") {
        this.customColorMap[id] = Color.fromHex(colorVal);
      }
    }
  }
  setCustomTokenColors(customTokenColors) {
    this.customTokenColors = [];
    this.customSemanticHighlightingDeprecated = void 0;
    this.addCustomTokenColors(customTokenColors);
    const themeSpecificTokenColors = this.getThemeSpecificColors(customTokenColors);
    if (types.isObject(themeSpecificTokenColors)) {
      this.addCustomTokenColors(themeSpecificTokenColors);
    }
    this.tokenColorIndex = void 0;
    this.textMateThemingRules = void 0;
    this.customTokenScopeMatchers = void 0;
  }
  setCustomSemanticTokenColors(semanticTokenColors) {
    this.customSemanticTokenRules = [];
    this.customSemanticHighlighting = void 0;
    if (semanticTokenColors) {
      this.customSemanticHighlighting = semanticTokenColors.enabled;
      if (semanticTokenColors.rules) {
        this.readSemanticTokenRules(semanticTokenColors.rules);
      }
      const themeSpecificColors = this.getThemeSpecificColors(semanticTokenColors);
      if (types.isObject(themeSpecificColors)) {
        if (themeSpecificColors.enabled !== void 0) {
          this.customSemanticHighlighting = themeSpecificColors.enabled;
        }
        if (themeSpecificColors.rules) {
          this.readSemanticTokenRules(themeSpecificColors.rules);
        }
      }
    }
    this.tokenColorIndex = void 0;
    this.textMateThemingRules = void 0;
  }
  isThemeScope(key) {
    return key.charAt(0) === THEME_SCOPE_OPEN_PAREN && key.charAt(key.length - 1) === THEME_SCOPE_CLOSE_PAREN;
  }
  isThemeScopeMatch(themeId) {
    const themeIdFirstChar = themeId.charAt(0);
    const themeIdLastChar = themeId.charAt(themeId.length - 1);
    const themeIdPrefix = themeId.slice(0, -1);
    const themeIdInfix = themeId.slice(1, -1);
    const themeIdSuffix = themeId.slice(1);
    return themeId === this.settingsId || this.settingsId.includes(themeIdInfix) && themeIdFirstChar === THEME_SCOPE_WILDCARD && themeIdLastChar === THEME_SCOPE_WILDCARD || this.settingsId.startsWith(themeIdPrefix) && themeIdLastChar === THEME_SCOPE_WILDCARD || this.settingsId.endsWith(themeIdSuffix) && themeIdFirstChar === THEME_SCOPE_WILDCARD;
  }
  getThemeSpecificColors(colors) {
    let themeSpecificColors;
    for (const key in colors) {
      const scopedColors = colors[key];
      if (this.isThemeScope(key) && scopedColors instanceof Object && !Array.isArray(scopedColors)) {
        const themeScopeList = key.match(themeScopeRegex) || [];
        for (const themeScope of themeScopeList) {
          const themeId = themeScope.substring(1, themeScope.length - 1);
          if (this.isThemeScopeMatch(themeId)) {
            if (!themeSpecificColors) {
              themeSpecificColors = {};
            }
            const scopedThemeSpecificColors = scopedColors;
            for (const subkey in scopedThemeSpecificColors) {
              const originalColors = themeSpecificColors[subkey];
              const overrideColors = scopedThemeSpecificColors[subkey];
              if (Array.isArray(originalColors) && Array.isArray(overrideColors)) {
                themeSpecificColors[subkey] = originalColors.concat(overrideColors);
              } else if (overrideColors) {
                themeSpecificColors[subkey] = overrideColors;
              }
            }
          }
        }
      }
    }
    return themeSpecificColors;
  }
  readSemanticTokenRules(tokenStylingRuleSection) {
    for (const key in tokenStylingRuleSection) {
      if (!this.isThemeScope(key)) {
        try {
          const rule = readSemanticTokenRule(key, tokenStylingRuleSection[key]);
          if (rule) {
            this.customSemanticTokenRules.push(rule);
          }
        } catch (e) {
        }
      }
    }
  }
  addCustomTokenColors(customTokenColors) {
    for (const tokenGroup in tokenGroupToScopesMap) {
      const group = tokenGroup;
      const value = customTokenColors[group];
      if (value) {
        const settings = typeof value === "string" ? { foreground: value } : value;
        const scopes = tokenGroupToScopesMap[group];
        for (const scope of scopes) {
          this.customTokenColors.push({ scope, settings });
        }
      }
    }
    if (Array.isArray(customTokenColors.textMateRules)) {
      for (const rule of customTokenColors.textMateRules) {
        if (rule.scope && rule.settings) {
          this.customTokenColors.push(rule);
        }
      }
    }
    if (customTokenColors.semanticHighlighting !== void 0) {
      this.customSemanticHighlightingDeprecated = customTokenColors.semanticHighlighting;
    }
  }
  ensureLoaded(extensionResourceLoaderService) {
    return !this.isLoaded ? this.load(extensionResourceLoaderService) : Promise.resolve(void 0);
  }
  reload(extensionResourceLoaderService) {
    return this.load(extensionResourceLoaderService);
  }
  load(extensionResourceLoaderService) {
    if (!this.location) {
      return Promise.resolve(void 0);
    }
    this.themeTokenColors = [];
    this.clearCaches();
    const result = {
      colors: {},
      textMateRules: [],
      semanticTokenRules: [],
      semanticHighlighting: false
    };
    return _loadColorTheme(extensionResourceLoaderService, this.location, result).then((_) => {
      this.isLoaded = true;
      this.semanticTokenRules = result.semanticTokenRules;
      this.colorMap = result.colors;
      this.themeTokenColors = result.textMateRules;
      this.themeSemanticHighlighting = result.semanticHighlighting;
    });
  }
  clearCaches() {
    this.tokenColorIndex = void 0;
    this.textMateThemingRules = void 0;
    this.themeTokenScopeMatchers = void 0;
    this.customTokenScopeMatchers = void 0;
  }
  toStorage(storageService) {
    const colorMapData = {};
    for (const key in this.colorMap) {
      colorMapData[key] = Color.Format.CSS.formatHexA(this.colorMap[key], true);
    }
    const value = JSON.stringify({
      id: this.id,
      label: this.label,
      settingsId: this.settingsId,
      themeTokenColors: this.themeTokenColors.map((tc) => ({ settings: tc.settings, scope: tc.scope })),
      // don't persist names
      semanticTokenRules: this.semanticTokenRules.map(SemanticTokenRule.toJSONObject),
      extensionData: ExtensionData.toJSONObject(this.extensionData),
      themeSemanticHighlighting: this.themeSemanticHighlighting,
      colorMap: colorMapData,
      watch: this.watch
    });
    storageService.store(
      ColorThemeData.STORAGE_KEY,
      value,
      0,
      0
      /* StorageTarget.USER */
    );
  }
  get themeTypeSelector() {
    return this.classNames[0];
  }
  get classNames() {
    return this.id.split(" ");
  }
  get type() {
    switch (this.themeTypeSelector) {
      case ThemeTypeSelector.VS:
        return ColorScheme.LIGHT;
      case ThemeTypeSelector.HC_BLACK:
        return ColorScheme.HIGH_CONTRAST_DARK;
      case ThemeTypeSelector.HC_LIGHT:
        return ColorScheme.HIGH_CONTRAST_LIGHT;
      default:
        return ColorScheme.DARK;
    }
  }
  // constructors
  static createUnloadedThemeForThemeType(themeType, colorMap) {
    return ColorThemeData.createUnloadedTheme(getThemeTypeSelector(themeType), colorMap);
  }
  static createUnloadedTheme(id, colorMap) {
    const themeData = new ColorThemeData(id, "", "__" + id);
    themeData.isLoaded = false;
    themeData.themeTokenColors = [];
    themeData.watch = false;
    if (colorMap) {
      for (const id2 in colorMap) {
        themeData.colorMap[id2] = Color.fromHex(colorMap[id2]);
      }
    }
    return themeData;
  }
  static createLoadedEmptyTheme(id, settingsId) {
    const themeData = new ColorThemeData(id, "", settingsId);
    themeData.isLoaded = true;
    themeData.themeTokenColors = [];
    themeData.watch = false;
    return themeData;
  }
  static fromStorageData(storageService) {
    const input = storageService.get(
      ColorThemeData.STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (!input) {
      return void 0;
    }
    try {
      const data = JSON.parse(input);
      const theme = new ColorThemeData("", "", "");
      for (const key in data) {
        switch (key) {
          case "colorMap": {
            const colorMapData = data[key];
            for (const id in colorMapData) {
              theme.colorMap[id] = Color.fromHex(colorMapData[id]);
            }
            break;
          }
          case "themeTokenColors":
          case "id":
          case "label":
          case "settingsId":
          case "watch":
          case "themeSemanticHighlighting":
            theme[key] = data[key];
            break;
          case "semanticTokenRules": {
            const rulesData = data[key];
            if (Array.isArray(rulesData)) {
              for (const d of rulesData) {
                const rule = SemanticTokenRule.fromJSONObject(tokenClassificationRegistry, d);
                if (rule) {
                  theme.semanticTokenRules.push(rule);
                }
              }
            }
            break;
          }
          case "location":
            break;
          case "extensionData":
            theme.extensionData = ExtensionData.fromJSONObject(data.extensionData);
            break;
        }
      }
      if (!theme.id || !theme.settingsId) {
        return void 0;
      }
      return theme;
    } catch (e) {
      return void 0;
    }
  }
  static fromExtensionTheme(theme, colorThemeLocation, extensionData) {
    const baseTheme = theme["uiTheme"] || "vs-dark";
    const themeSelector = toCSSSelector(extensionData.extensionId, theme.path);
    const id = `${baseTheme} ${themeSelector}`;
    const label = theme.label || basename(theme.path);
    const settingsId = theme.id || label;
    const themeData = new ColorThemeData(id, label, settingsId);
    themeData.description = theme.description;
    themeData.watch = theme._watch === true;
    themeData.location = colorThemeLocation;
    themeData.extensionData = extensionData;
    themeData.isLoaded = false;
    return themeData;
  }
}
function toCSSSelector(extensionId, path) {
  if (path.startsWith("./")) {
    path = path.substr(2);
  }
  let str = `${extensionId}-${path}`;
  str = str.replace(/[^_a-zA-Z0-9-]/g, "-");
  if (str.charAt(0).match(/[0-9-]/)) {
    str = "_" + str;
  }
  return str;
}
__name(toCSSSelector, "toCSSSelector");
async function _loadColorTheme(extensionResourceLoaderService, themeLocation, result) {
  if (resources.extname(themeLocation) === ".json") {
    const content = await extensionResourceLoaderService.readExtensionResource(themeLocation);
    const errors = [];
    const contentValue = Json.parse(content, errors);
    if (errors.length > 0) {
      return Promise.reject(new Error(nls.localize("error.cannotparsejson", "Problems parsing JSON theme file: {0}", errors.map((e) => getParseErrorMessage(e.error)).join(", "))));
    } else if (Json.getNodeType(contentValue) !== "object") {
      return Promise.reject(new Error(nls.localize("error.invalidformat", "Invalid format for JSON theme file: Object expected.")));
    }
    if (contentValue.include) {
      await _loadColorTheme(extensionResourceLoaderService, resources.joinPath(resources.dirname(themeLocation), contentValue.include), result);
    }
    if (Array.isArray(contentValue.settings)) {
      convertSettings(contentValue.settings, result);
      return null;
    }
    result.semanticHighlighting = result.semanticHighlighting || contentValue.semanticHighlighting;
    const colors = contentValue.colors;
    if (colors) {
      if (typeof colors !== "object") {
        return Promise.reject(new Error(nls.localize({ key: "error.invalidformat.colors", comment: ["{0} will be replaced by a path. Values in quotes should not be translated."] }, "Problem parsing color theme file: {0}. Property 'colors' is not of type 'object'.", themeLocation.toString())));
      }
      for (const colorId in colors) {
        const colorVal = colors[colorId];
        if (colorVal === DEFAULT_COLOR_CONFIG_VALUE) {
          delete result.colors[colorId];
        } else if (typeof colorVal === "string") {
          result.colors[colorId] = Color.fromHex(colors[colorId]);
        }
      }
    }
    const tokenColors = contentValue.tokenColors;
    if (tokenColors) {
      if (Array.isArray(tokenColors)) {
        result.textMateRules.push(...tokenColors);
      } else if (typeof tokenColors === "string") {
        await _loadSyntaxTokens(extensionResourceLoaderService, resources.joinPath(resources.dirname(themeLocation), tokenColors), result);
      } else {
        return Promise.reject(new Error(nls.localize({ key: "error.invalidformat.tokenColors", comment: ["{0} will be replaced by a path. Values in quotes should not be translated."] }, "Problem parsing color theme file: {0}. Property 'tokenColors' should be either an array specifying colors or a path to a TextMate theme file", themeLocation.toString())));
      }
    }
    const semanticTokenColors = contentValue.semanticTokenColors;
    if (semanticTokenColors && typeof semanticTokenColors === "object") {
      for (const key in semanticTokenColors) {
        try {
          const rule = readSemanticTokenRule(key, semanticTokenColors[key]);
          if (rule) {
            result.semanticTokenRules.push(rule);
          }
        } catch (e) {
          return Promise.reject(new Error(nls.localize({ key: "error.invalidformat.semanticTokenColors", comment: ["{0} will be replaced by a path. Values in quotes should not be translated."] }, "Problem parsing color theme file: {0}. Property 'semanticTokenColors' contains a invalid selector", themeLocation.toString())));
        }
      }
    }
  } else {
    return _loadSyntaxTokens(extensionResourceLoaderService, themeLocation, result);
  }
}
__name(_loadColorTheme, "_loadColorTheme");
function _loadSyntaxTokens(extensionResourceLoaderService, themeLocation, result) {
  return extensionResourceLoaderService.readExtensionResource(themeLocation).then((content) => {
    try {
      const contentValue = parsePList(content);
      const settings = contentValue.settings;
      if (!Array.isArray(settings)) {
        return Promise.reject(new Error(nls.localize("error.plist.invalidformat", "Problem parsing tmTheme file: {0}. 'settings' is not array.")));
      }
      convertSettings(settings, result);
      return Promise.resolve(null);
    } catch (e) {
      return Promise.reject(new Error(nls.localize("error.cannotparse", "Problems parsing tmTheme file: {0}", e.message)));
    }
  }, (error) => {
    return Promise.reject(new Error(nls.localize("error.cannotload", "Problems loading tmTheme file {0}: {1}", themeLocation.toString(), error.message)));
  });
}
__name(_loadSyntaxTokens, "_loadSyntaxTokens");
const defaultThemeColors = {
  "light": [
    { scope: "token.info-token", settings: { foreground: "#316bcd" } },
    { scope: "token.warn-token", settings: { foreground: "#cd9731" } },
    { scope: "token.error-token", settings: { foreground: "#cd3131" } },
    { scope: "token.debug-token", settings: { foreground: "#800080" } }
  ],
  "dark": [
    { scope: "token.info-token", settings: { foreground: "#6796e6" } },
    { scope: "token.warn-token", settings: { foreground: "#cd9731" } },
    { scope: "token.error-token", settings: { foreground: "#f44747" } },
    { scope: "token.debug-token", settings: { foreground: "#b267e6" } }
  ],
  "hcLight": [
    { scope: "token.info-token", settings: { foreground: "#316bcd" } },
    { scope: "token.warn-token", settings: { foreground: "#cd9731" } },
    { scope: "token.error-token", settings: { foreground: "#cd3131" } },
    { scope: "token.debug-token", settings: { foreground: "#800080" } }
  ],
  "hcDark": [
    { scope: "token.info-token", settings: { foreground: "#6796e6" } },
    { scope: "token.warn-token", settings: { foreground: "#008000" } },
    { scope: "token.error-token", settings: { foreground: "#FF0000" } },
    { scope: "token.debug-token", settings: { foreground: "#b267e6" } }
  ]
};
const noMatch = /* @__PURE__ */ __name((_scope) => -1, "noMatch");
function nameMatcher(identifiers, scopes) {
  if (scopes.length < identifiers.length) {
    return -1;
  }
  let score = void 0;
  const every = identifiers.every((identifier) => {
    for (let i = scopes.length - 1; i >= 0; i--) {
      if (scopesAreMatching(scopes[i], identifier)) {
        score = (i + 1) * 65536 + identifier.length;
        return true;
      }
    }
    return false;
  });
  return every && score !== void 0 ? score : -1;
}
__name(nameMatcher, "nameMatcher");
function scopesAreMatching(thisScopeName, scopeName) {
  if (!thisScopeName) {
    return false;
  }
  if (thisScopeName === scopeName) {
    return true;
  }
  const len = scopeName.length;
  return thisScopeName.length > len && thisScopeName.substr(0, len) === scopeName && thisScopeName[len] === ".";
}
__name(scopesAreMatching, "scopesAreMatching");
function getScopeMatcher(rule) {
  const ruleScope = rule.scope;
  if (!ruleScope || !rule.settings) {
    return noMatch;
  }
  const matchers = [];
  if (Array.isArray(ruleScope)) {
    for (const rs of ruleScope) {
      createMatchers(rs, nameMatcher, matchers);
    }
  } else {
    createMatchers(ruleScope, nameMatcher, matchers);
  }
  if (matchers.length === 0) {
    return noMatch;
  }
  return (scope) => {
    let max = matchers[0].matcher(scope);
    for (let i = 1; i < matchers.length; i++) {
      max = Math.max(max, matchers[i].matcher(scope));
    }
    return max;
  };
}
__name(getScopeMatcher, "getScopeMatcher");
function readSemanticTokenRule(selectorString, settings) {
  const selector = tokenClassificationRegistry.parseTokenSelector(selectorString);
  let style;
  if (typeof settings === "string") {
    style = TokenStyle.fromSettings(settings, void 0);
  } else if (isSemanticTokenColorizationSetting(settings)) {
    style = TokenStyle.fromSettings(settings.foreground, settings.fontStyle, settings.bold, settings.underline, settings.strikethrough, settings.italic);
  }
  if (style) {
    return { selector, style };
  }
  return void 0;
}
__name(readSemanticTokenRule, "readSemanticTokenRule");
function isSemanticTokenColorizationSetting(style) {
  return style && (types.isString(style.foreground) || types.isString(style.fontStyle) || types.isBoolean(style.italic) || types.isBoolean(style.underline) || types.isBoolean(style.strikethrough) || types.isBoolean(style.bold));
}
__name(isSemanticTokenColorizationSetting, "isSemanticTokenColorizationSetting");
function findMetadata(colorThemeData, captureNames, languageId, bracket) {
  let metadata = 0;
  metadata |= languageId << 0;
  const definitions = {};
  const tokenStyle = colorThemeData.resolveScopes([captureNames], definitions);
  if (captureNames.length > 0) {
    const standardToken = toStandardTokenType(captureNames[captureNames.length - 1]);
    metadata |= standardToken << 8;
  }
  const fontStyle = definitions.foreground?.settings.fontStyle || definitions.bold?.settings.fontStyle;
  if (fontStyle?.includes("italic")) {
    metadata |= 1 | 2048;
  }
  if (fontStyle?.includes("bold")) {
    metadata |= 2 | 4096;
  }
  if (fontStyle?.includes("underline")) {
    metadata |= 4 | 8192;
  }
  if (fontStyle?.includes("strikethrough")) {
    metadata |= 8 | 16384;
  }
  const foreground = tokenStyle?.foreground;
  const tokenStyleForeground = foreground !== void 0 ? colorThemeData.getTokenColorIndex().get(foreground) : 1;
  metadata |= tokenStyleForeground << 15;
  if (bracket) {
    metadata |= 1024;
  }
  return metadata;
}
__name(findMetadata, "findMetadata");
class TokenColorIndex {
  static {
    __name(this, "TokenColorIndex");
  }
  constructor() {
    this._lastColorId = 0;
    this._id2color = [];
    this._color2id = /* @__PURE__ */ Object.create(null);
  }
  add(color) {
    color = normalizeColor(color);
    if (color === void 0) {
      return 0;
    }
    let value = this._color2id[color];
    if (value) {
      return value;
    }
    value = ++this._lastColorId;
    this._color2id[color] = value;
    this._id2color[value] = color;
    return value;
  }
  get(color) {
    color = normalizeColor(color);
    if (color === void 0) {
      return 0;
    }
    const value = this._color2id[color];
    if (value) {
      return value;
    }
    console.log(`Color ${color} not in index.`);
    return 0;
  }
  asArray() {
    return this._id2color.slice(0);
  }
}
function normalizeColor(color) {
  if (!color) {
    return void 0;
  }
  if (typeof color !== "string") {
    color = Color.Format.CSS.formatHexA(color, true);
  }
  const len = color.length;
  if (color.charCodeAt(0) !== 35 || len !== 4 && len !== 5 && len !== 7 && len !== 9) {
    return void 0;
  }
  const result = [
    35
    /* CharCode.Hash */
  ];
  for (let i = 1; i < len; i++) {
    const upper = hexUpper(color.charCodeAt(i));
    if (!upper) {
      return void 0;
    }
    result.push(upper);
    if (len === 4 || len === 5) {
      result.push(upper);
    }
  }
  if (result.length === 9 && result[7] === 70 && result[8] === 70) {
    result.length = 7;
  }
  return String.fromCharCode(...result);
}
__name(normalizeColor, "normalizeColor");
function hexUpper(charCode) {
  if (charCode >= 48 && charCode <= 57 || charCode >= 65 && charCode <= 70) {
    return charCode;
  } else if (charCode >= 97 && charCode <= 102) {
    return charCode - 97 + 65;
  }
  return 0;
}
__name(hexUpper, "hexUpper");
export {
  ColorThemeData,
  findMetadata
};
//# sourceMappingURL=colorThemeData.js.map
