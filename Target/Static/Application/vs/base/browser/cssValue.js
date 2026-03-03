var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FileAccess } from "../common/network.js";
function asFragment(raw) {
  return raw;
}
__name(asFragment, "asFragment");
function asCssValueWithDefault(cssPropertyValue, dflt) {
  if (cssPropertyValue !== void 0) {
    const variableMatch = cssPropertyValue.match(/^\s*var\((.+)\)$/);
    if (variableMatch) {
      const varArguments = variableMatch[1].split(",", 2);
      if (varArguments.length === 2) {
        dflt = asCssValueWithDefault(varArguments[1].trim(), dflt);
      }
      return `var(${varArguments[0]}, ${dflt})`;
    }
    return cssPropertyValue;
  }
  return dflt;
}
__name(asCssValueWithDefault, "asCssValueWithDefault");
function sizeValue(value) {
  const out = value.replaceAll(/[^\w.%+-]/gi, "");
  if (out !== value) {
    console.warn(`CSS size ${value} modified to ${out} to be safe for CSS`);
  }
  return asFragment(out);
}
__name(sizeValue, "sizeValue");
function hexColorValue(value) {
  const out = value.replaceAll(/[^[0-9a-fA-F#]]/gi, "");
  if (out !== value) {
    console.warn(`CSS hex color ${value} modified to ${out} to be safe for CSS`);
  }
  return asFragment(out);
}
__name(hexColorValue, "hexColorValue");
function identValue(value) {
  const out = value.replaceAll(/[^_\-a-z0-9]/gi, "");
  if (out !== value) {
    console.warn(`CSS ident value ${value} modified to ${out} to be safe for CSS`);
  }
  return asFragment(out);
}
__name(identValue, "identValue");
function stringValue(value) {
  return asFragment(`'${value.replaceAll(/'/g, "\\000027")}'`);
}
__name(stringValue, "stringValue");
function asCSSUrl(uri) {
  if (!uri) {
    return asFragment(`url('')`);
  }
  return inline`url('${asFragment(CSS.escape(FileAccess.uriToBrowserUri(uri).toString(true)))}')`;
}
__name(asCSSUrl, "asCSSUrl");
function className(value, escapingExpected = false) {
  const out = CSS.escape(value);
  if (!escapingExpected && out !== value) {
    console.warn(`CSS class name ${value} modified to ${out} to be safe for CSS`);
  }
  return asFragment(out);
}
__name(className, "className");
function inline(strings, ...values) {
  return asFragment(strings.reduce((result, str, i) => {
    const value = values[i] || "";
    return result + str + value;
  }, ""));
}
__name(inline, "inline");
class Builder {
  static {
    __name(this, "Builder");
  }
  constructor() {
    this._parts = [];
  }
  push(...parts) {
    this._parts.push(...parts);
  }
  join(joiner = "\n") {
    return asFragment(this._parts.join(joiner));
  }
}
export {
  Builder,
  asCSSUrl,
  asCssValueWithDefault,
  className,
  hexColorValue,
  identValue,
  inline,
  sizeValue,
  stringValue
};
//# sourceMappingURL=cssValue.js.map
