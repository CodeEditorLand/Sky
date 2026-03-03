var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Color } from "../../../../base/common/color.js";
class ParsedTokenThemeRule {
  static {
    __name(this, "ParsedTokenThemeRule");
  }
  constructor(token, index, fontStyle, foreground, background) {
    this._parsedThemeRuleBrand = void 0;
    this.token = token;
    this.index = index;
    this.fontStyle = fontStyle;
    this.foreground = foreground;
    this.background = background;
  }
}
function parseTokenTheme(source) {
  if (!source || !Array.isArray(source)) {
    return [];
  }
  const result = [];
  let resultLen = 0;
  for (let i = 0, len = source.length; i < len; i++) {
    const entry = source[i];
    let fontStyle = -1;
    if (typeof entry.fontStyle === "string") {
      fontStyle = 0;
      const segments = entry.fontStyle.split(" ");
      for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
        const segment = segments[j];
        switch (segment) {
          case "italic":
            fontStyle = fontStyle | 1;
            break;
          case "bold":
            fontStyle = fontStyle | 2;
            break;
          case "underline":
            fontStyle = fontStyle | 4;
            break;
          case "strikethrough":
            fontStyle = fontStyle | 8;
            break;
        }
      }
    }
    let foreground = null;
    if (typeof entry.foreground === "string") {
      foreground = entry.foreground;
    }
    let background = null;
    if (typeof entry.background === "string") {
      background = entry.background;
    }
    result[resultLen++] = new ParsedTokenThemeRule(entry.token || "", i, fontStyle, foreground, background);
  }
  return result;
}
__name(parseTokenTheme, "parseTokenTheme");
function resolveParsedTokenThemeRules(parsedThemeRules, customTokenColors) {
  parsedThemeRules.sort((a, b) => {
    const r = strcmp(a.token, b.token);
    if (r !== 0) {
      return r;
    }
    return a.index - b.index;
  });
  let defaultFontStyle = 0;
  let defaultForeground = "000000";
  let defaultBackground = "ffffff";
  while (parsedThemeRules.length >= 1 && parsedThemeRules[0].token === "") {
    const incomingDefaults = parsedThemeRules.shift();
    if (incomingDefaults.fontStyle !== -1) {
      defaultFontStyle = incomingDefaults.fontStyle;
    }
    if (incomingDefaults.foreground !== null) {
      defaultForeground = incomingDefaults.foreground;
    }
    if (incomingDefaults.background !== null) {
      defaultBackground = incomingDefaults.background;
    }
  }
  const colorMap = new ColorMap();
  for (const color of customTokenColors) {
    colorMap.getId(color);
  }
  const foregroundColorId = colorMap.getId(defaultForeground);
  const backgroundColorId = colorMap.getId(defaultBackground);
  const defaults = new ThemeTrieElementRule(defaultFontStyle, foregroundColorId, backgroundColorId);
  const root = new ThemeTrieElement(defaults);
  for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
    const rule = parsedThemeRules[i];
    root.insert(rule.token, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
  }
  return new TokenTheme(colorMap, root);
}
__name(resolveParsedTokenThemeRules, "resolveParsedTokenThemeRules");
const colorRegExp = /^#?([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;
class ColorMap {
  static {
    __name(this, "ColorMap");
  }
  constructor() {
    this._lastColorId = 0;
    this._id2color = [];
    this._color2id = /* @__PURE__ */ new Map();
  }
  getId(color) {
    if (color === null) {
      return 0;
    }
    const match = color.match(colorRegExp);
    if (!match) {
      throw new Error("Illegal value for token color: " + color);
    }
    color = match[1].toUpperCase();
    let value = this._color2id.get(color);
    if (value) {
      return value;
    }
    value = ++this._lastColorId;
    this._color2id.set(color, value);
    this._id2color[value] = Color.fromHex("#" + color);
    return value;
  }
  getColorMap() {
    return this._id2color.slice(0);
  }
}
class TokenTheme {
  static {
    __name(this, "TokenTheme");
  }
  static createFromRawTokenTheme(source, customTokenColors) {
    return this.createFromParsedTokenTheme(parseTokenTheme(source), customTokenColors);
  }
  static createFromParsedTokenTheme(source, customTokenColors) {
    return resolveParsedTokenThemeRules(source, customTokenColors);
  }
  constructor(colorMap, root) {
    this._colorMap = colorMap;
    this._root = root;
    this._cache = /* @__PURE__ */ new Map();
  }
  getColorMap() {
    return this._colorMap.getColorMap();
  }
  /**
   * used for testing purposes
   */
  getThemeTrieElement() {
    return this._root.toExternalThemeTrieElement();
  }
  _match(token) {
    return this._root.match(token);
  }
  match(languageId, token) {
    let result = this._cache.get(token);
    if (typeof result === "undefined") {
      const rule = this._match(token);
      const standardToken = toStandardTokenType(token);
      result = (rule.metadata | standardToken << 8) >>> 0;
      this._cache.set(token, result);
    }
    return (result | languageId << 0) >>> 0;
  }
}
const STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|regexp)\b/;
function toStandardTokenType(tokenType) {
  const m = tokenType.match(STANDARD_TOKEN_TYPE_REGEXP);
  if (!m) {
    return 0;
  }
  switch (m[1]) {
    case "comment":
      return 1;
    case "string":
      return 2;
    case "regex":
      return 3;
    case "regexp":
      return 3;
  }
  throw new Error("Unexpected match for standard token type!");
}
__name(toStandardTokenType, "toStandardTokenType");
function strcmp(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}
__name(strcmp, "strcmp");
class ThemeTrieElementRule {
  static {
    __name(this, "ThemeTrieElementRule");
  }
  constructor(fontStyle, foreground, background) {
    this._themeTrieElementRuleBrand = void 0;
    this._fontStyle = fontStyle;
    this._foreground = foreground;
    this._background = background;
    this.metadata = (this._fontStyle << 11 | this._foreground << 15 | this._background << 24) >>> 0;
  }
  clone() {
    return new ThemeTrieElementRule(this._fontStyle, this._foreground, this._background);
  }
  acceptOverwrite(fontStyle, foreground, background) {
    if (fontStyle !== -1) {
      this._fontStyle = fontStyle;
    }
    if (foreground !== 0) {
      this._foreground = foreground;
    }
    if (background !== 0) {
      this._background = background;
    }
    this.metadata = (this._fontStyle << 11 | this._foreground << 15 | this._background << 24) >>> 0;
  }
}
class ExternalThemeTrieElement {
  static {
    __name(this, "ExternalThemeTrieElement");
  }
  constructor(mainRule, children = /* @__PURE__ */ new Map()) {
    this.mainRule = mainRule;
    if (children instanceof Map) {
      this.children = children;
    } else {
      this.children = /* @__PURE__ */ new Map();
      for (const key in children) {
        this.children.set(key, children[key]);
      }
    }
  }
}
class ThemeTrieElement {
  static {
    __name(this, "ThemeTrieElement");
  }
  constructor(mainRule) {
    this._themeTrieElementBrand = void 0;
    this._mainRule = mainRule;
    this._children = /* @__PURE__ */ new Map();
  }
  /**
   * used for testing purposes
   */
  toExternalThemeTrieElement() {
    const children = /* @__PURE__ */ new Map();
    this._children.forEach((element, index) => {
      children.set(index, element.toExternalThemeTrieElement());
    });
    return new ExternalThemeTrieElement(this._mainRule, children);
  }
  match(token) {
    if (token === "") {
      return this._mainRule;
    }
    const dotIndex = token.indexOf(".");
    let head;
    let tail;
    if (dotIndex === -1) {
      head = token;
      tail = "";
    } else {
      head = token.substring(0, dotIndex);
      tail = token.substring(dotIndex + 1);
    }
    const child = this._children.get(head);
    if (typeof child !== "undefined") {
      return child.match(tail);
    }
    return this._mainRule;
  }
  insert(token, fontStyle, foreground, background) {
    if (token === "") {
      this._mainRule.acceptOverwrite(fontStyle, foreground, background);
      return;
    }
    const dotIndex = token.indexOf(".");
    let head;
    let tail;
    if (dotIndex === -1) {
      head = token;
      tail = "";
    } else {
      head = token.substring(0, dotIndex);
      tail = token.substring(dotIndex + 1);
    }
    let child = this._children.get(head);
    if (typeof child === "undefined") {
      child = new ThemeTrieElement(this._mainRule.clone());
      this._children.set(head, child);
    }
    child.insert(tail, fontStyle, foreground, background);
  }
}
function generateTokensCSSForColorMap(colorMap) {
  const rules = [];
  for (let i = 1, len = colorMap.length; i < len; i++) {
    const color = colorMap[i];
    rules[i] = `.mtk${i} { color: ${color}; }`;
  }
  rules.push(".mtki { font-style: italic; }");
  rules.push(".mtkb { font-weight: bold; }");
  rules.push(".mtku { text-decoration: underline; text-underline-position: under; }");
  rules.push(".mtks { text-decoration: line-through; }");
  rules.push(".mtks.mtku { text-decoration: underline line-through; text-underline-position: under; }");
  return rules.join("\n");
}
__name(generateTokensCSSForColorMap, "generateTokensCSSForColorMap");
function generateTokensCSSForFontMap(fontMap) {
  const rules = [];
  const fonts = /* @__PURE__ */ new Set();
  for (let i = 1, len = fontMap.length; i < len; i++) {
    const font = fontMap[i];
    if (!font.fontFamily && !font.fontSizeMultiplier) {
      continue;
    }
    const className = classNameForFontTokenDecorations(font.fontFamily ?? "", font.fontSizeMultiplier ?? 0);
    if (fonts.has(className)) {
      continue;
    }
    fonts.add(className);
    let rule = `.${className} {`;
    if (font.fontFamily) {
      rule += `font-family: ${font.fontFamily};`;
    }
    if (font.fontSizeMultiplier) {
      rule += `font-size: calc(var(--editor-font-size)*${font.fontSizeMultiplier});`;
    }
    rule += `}`;
    rules.push(rule);
  }
  return rules.join("\n");
}
__name(generateTokensCSSForFontMap, "generateTokensCSSForFontMap");
function classNameForFontTokenDecorations(fontFamily, fontSize) {
  const safeFontFamily = sanitizeFontFamilyForClassName(fontFamily);
  return cleanClassName(`font-decoration-${safeFontFamily}-${fontSize}`);
}
__name(classNameForFontTokenDecorations, "classNameForFontTokenDecorations");
function sanitizeFontFamilyForClassName(fontFamily) {
  const normalized = fontFamily.toLowerCase().trim();
  if (!normalized) {
    return "default";
  }
  return cleanClassName(normalized);
}
__name(sanitizeFontFamilyForClassName, "sanitizeFontFamilyForClassName");
function cleanClassName(className) {
  return className.replace(/[^a-z0-9_-]/gi, "-");
}
__name(cleanClassName, "cleanClassName");
export {
  ColorMap,
  ExternalThemeTrieElement,
  ParsedTokenThemeRule,
  ThemeTrieElement,
  ThemeTrieElementRule,
  TokenTheme,
  classNameForFontTokenDecorations,
  generateTokensCSSForColorMap,
  generateTokensCSSForFontMap,
  parseTokenTheme,
  strcmp,
  toStandardTokenType
};
//# sourceMappingURL=tokenization.js.map
