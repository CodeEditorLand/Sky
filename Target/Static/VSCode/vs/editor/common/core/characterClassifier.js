var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { toUint8 } from "../../../base/common/uint.js";
class CharacterClassifier {
  static {
    __name(this, "CharacterClassifier");
  }
  /**
   * Maintain a compact (fully initialized ASCII map for quickly classifying ASCII characters - used more often in code).
   */
  _asciiMap;
  /**
   * The entire map (sparse array).
   */
  _map;
  _defaultValue;
  constructor(_defaultValue) {
    const defaultValue = toUint8(_defaultValue);
    this._defaultValue = defaultValue;
    this._asciiMap = CharacterClassifier._createAsciiMap(defaultValue);
    this._map = /* @__PURE__ */ new Map();
  }
  static _createAsciiMap(defaultValue) {
    const asciiMap = new Uint8Array(256);
    asciiMap.fill(defaultValue);
    return asciiMap;
  }
  set(charCode, _value) {
    const value = toUint8(_value);
    if (charCode >= 0 && charCode < 256) {
      this._asciiMap[charCode] = value;
    } else {
      this._map.set(charCode, value);
    }
  }
  get(charCode) {
    if (charCode >= 0 && charCode < 256) {
      return this._asciiMap[charCode];
    } else {
      return this._map.get(charCode) || this._defaultValue;
    }
  }
  clear() {
    this._asciiMap.fill(this._defaultValue);
    this._map.clear();
  }
}
var Boolean = /* @__PURE__ */ ((Boolean2) => {
  Boolean2[Boolean2["False"] = 0] = "False";
  Boolean2[Boolean2["True"] = 1] = "True";
  return Boolean2;
})(Boolean || {});
class CharacterSet {
  static {
    __name(this, "CharacterSet");
  }
  _actual;
  constructor() {
    this._actual = new CharacterClassifier(0 /* False */);
  }
  add(charCode) {
    this._actual.set(charCode, 1 /* True */);
  }
  has(charCode) {
    return this._actual.get(charCode) === 1 /* True */;
  }
  clear() {
    return this._actual.clear();
  }
}
export {
  CharacterClassifier,
  CharacterSet
};
//# sourceMappingURL=characterClassifier.js.map
