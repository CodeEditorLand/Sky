var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Iterable } from "../../../../base/common/iterator.js";
import { isLinux, isMacintosh, isWindows } from "../../../../base/common/platform.js";
import { ConfiguredInput } from "./configurationResolver.js";
class ConfigurationResolverExpression {
  static {
    __name(this, "ConfigurationResolverExpression");
  }
  static VARIABLE_LHS = "${";
  locations = /* @__PURE__ */ new Map();
  root;
  stringRoot;
  constructor(object) {
    if (typeof object === "string") {
      this.stringRoot = true;
      this.root = { value: object };
    } else {
      this.stringRoot = false;
      this.root = structuredClone(object);
    }
  }
  /**
   * Creates a new {@link ConfigurationResolverExpression} from an object.
   * Note that platform-specific keys (i.e. `windows`, `osx`, `linux`) are
   * applied during parsing.
   */
  static parse(object) {
    if (object instanceof ConfigurationResolverExpression) {
      return object;
    }
    const expr = new ConfigurationResolverExpression(object);
    expr.applyPlatformSpecificKeys();
    expr.parseObject(expr.root);
    return expr;
  }
  applyPlatformSpecificKeys() {
    const config = this.root;
    const key = isWindows ? "windows" : isMacintosh ? "osx" : isLinux ? "linux" : void 0;
    if (key === void 0 || !config || typeof config !== "object" || !config.hasOwnProperty(key)) {
      return;
    }
    Object.keys(config[key]).forEach((k) => config[k] = config[key][k]);
    delete config.windows;
    delete config.osx;
    delete config.linux;
  }
  parseVariable(str, start) {
    if (str[start] !== "$" || str[start + 1] !== "{") {
      return void 0;
    }
    let end = start + 2;
    let braceCount = 1;
    while (end < str.length) {
      if (str[end] === "{") {
        braceCount++;
      } else if (str[end] === "}") {
        braceCount--;
        if (braceCount === 0) {
          break;
        }
      }
      end++;
    }
    if (braceCount !== 0) {
      return void 0;
    }
    const id = str.slice(start, end + 1);
    const inner = str.substring(start + 2, end);
    const colonIdx = inner.indexOf(":");
    if (colonIdx === -1) {
      return { replacement: { id, name: inner, inner }, end };
    }
    return {
      replacement: {
        id,
        inner,
        name: inner.slice(0, colonIdx),
        arg: inner.slice(colonIdx + 1)
      },
      end
    };
  }
  parseObject(obj) {
    if (typeof obj !== "object" || obj === null) {
      return;
    }
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];
        if (typeof value === "string") {
          this.parseString(obj, i, value);
        } else {
          this.parseObject(value);
        }
      }
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        this.parseString(obj, key, value);
      } else {
        this.parseObject(value);
      }
    }
  }
  parseString(object, propertyName, value) {
    let pos = 0;
    while (pos < value.length) {
      const match = value.indexOf("${", pos);
      if (match === -1) {
        break;
      }
      const parsed = this.parseVariable(value, match);
      if (parsed) {
        const locations = this.locations.get(parsed.replacement.id) || { locations: [], replacement: parsed.replacement };
        locations.locations.push({ object, propertyName });
        this.locations.set(parsed.replacement.id, locations);
        pos = parsed.end + 1;
      } else {
        pos = match + 2;
      }
    }
  }
  unresolved() {
    return Iterable.map(Iterable.filter(this.locations.values(), (l) => l.resolved === void 0), (l) => l.replacement);
  }
  resolved() {
    return Iterable.map(Iterable.filter(this.locations.values(), (l) => !!l.resolved), (l) => [l.replacement, l.resolved]);
  }
  resolve(replacement, data) {
    if (typeof data !== "object") {
      data = { value: String(data) };
    }
    const location = this.locations.get(replacement.id);
    if (!location) {
      return;
    }
    if (data.value !== void 0) {
      for (const { object, propertyName } of location.locations || []) {
        const newValue = object[propertyName].replaceAll(replacement.id, data.value);
        object[propertyName] = newValue;
      }
    }
    location.resolved = data;
  }
  toObject() {
    if (this.stringRoot) {
      return this.root.value;
    }
    return this.root;
  }
}
export {
  ConfigurationResolverExpression
};
//# sourceMappingURL=configurationResolverExpression.js.map
