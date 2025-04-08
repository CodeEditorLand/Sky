var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "./codicons.js";
var ThemeColor;
((ThemeColor2) => {
  function isThemeColor(obj) {
    return obj && typeof obj === "object" && typeof obj.id === "string";
  }
  ThemeColor2.isThemeColor = isThemeColor;
  __name(isThemeColor, "isThemeColor");
})(ThemeColor || (ThemeColor = {}));
function themeColorFromId(id) {
  return { id };
}
__name(themeColorFromId, "themeColorFromId");
var ThemeIcon;
((ThemeIcon2) => {
  ThemeIcon2.iconNameSegment = "[A-Za-z0-9]+";
  ThemeIcon2.iconNameExpression = "[A-Za-z0-9-]+";
  ThemeIcon2.iconModifierExpression = "~[A-Za-z]+";
  ThemeIcon2.iconNameCharacter = "[A-Za-z0-9~-]";
  const ThemeIconIdRegex = new RegExp(`^(${ThemeIcon2.iconNameExpression})(${ThemeIcon2.iconModifierExpression})?$`);
  function asClassNameArray(icon) {
    const match = ThemeIconIdRegex.exec(icon.id);
    if (!match) {
      return asClassNameArray(Codicon.error);
    }
    const [, id, modifier] = match;
    const classNames = ["codicon", "codicon-" + id];
    if (modifier) {
      classNames.push("codicon-modifier-" + modifier.substring(1));
    }
    return classNames;
  }
  ThemeIcon2.asClassNameArray = asClassNameArray;
  __name(asClassNameArray, "asClassNameArray");
  function asClassName(icon) {
    return asClassNameArray(icon).join(" ");
  }
  ThemeIcon2.asClassName = asClassName;
  __name(asClassName, "asClassName");
  function asCSSSelector(icon) {
    return "." + asClassNameArray(icon).join(".");
  }
  ThemeIcon2.asCSSSelector = asCSSSelector;
  __name(asCSSSelector, "asCSSSelector");
  function isThemeIcon(obj) {
    return obj && typeof obj === "object" && typeof obj.id === "string" && (typeof obj.color === "undefined" || ThemeColor.isThemeColor(obj.color));
  }
  ThemeIcon2.isThemeIcon = isThemeIcon;
  __name(isThemeIcon, "isThemeIcon");
  const _regexFromString = new RegExp(`^\\$\\((${ThemeIcon2.iconNameExpression}(?:${ThemeIcon2.iconModifierExpression})?)\\)$`);
  function fromString(str) {
    const match = _regexFromString.exec(str);
    if (!match) {
      return void 0;
    }
    const [, name] = match;
    return { id: name };
  }
  ThemeIcon2.fromString = fromString;
  __name(fromString, "fromString");
  function fromId(id) {
    return { id };
  }
  ThemeIcon2.fromId = fromId;
  __name(fromId, "fromId");
  function modify(icon, modifier) {
    let id = icon.id;
    const tildeIndex = id.lastIndexOf("~");
    if (tildeIndex !== -1) {
      id = id.substring(0, tildeIndex);
    }
    if (modifier) {
      id = `${id}~${modifier}`;
    }
    return { id };
  }
  ThemeIcon2.modify = modify;
  __name(modify, "modify");
  function getModifier(icon) {
    const tildeIndex = icon.id.lastIndexOf("~");
    if (tildeIndex !== -1) {
      return icon.id.substring(tildeIndex + 1);
    }
    return void 0;
  }
  ThemeIcon2.getModifier = getModifier;
  __name(getModifier, "getModifier");
  function isEqual(ti1, ti2) {
    return ti1.id === ti2.id && ti1.color?.id === ti2.color?.id;
  }
  ThemeIcon2.isEqual = isEqual;
  __name(isEqual, "isEqual");
})(ThemeIcon || (ThemeIcon = {}));
export {
  ThemeColor,
  ThemeIcon,
  themeColorFromId
};
//# sourceMappingURL=themables.js.map
