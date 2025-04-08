var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IRange, Range } from "../../../editor/common/core/range.js";
class BaseToken {
  constructor(_range) {
    this._range = _range;
  }
  static {
    __name(this, "BaseToken");
  }
  get range() {
    return this._range;
  }
  /**
   * Check if this token has the same range as another one.
   */
  sameRange(other) {
    return this.range.equalsRange(other);
  }
  /**
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (!(other instanceof this.constructor)) {
      return false;
    }
    return this.sameRange(other.range);
  }
  /**
   * Change `range` of the token with provided range components.
   */
  withRange(components) {
    this._range = new Range(
      components.startLineNumber ?? this.range.startLineNumber,
      components.startColumn ?? this.range.startColumn,
      components.endLineNumber ?? this.range.endLineNumber,
      components.endColumn ?? this.range.endColumn
    );
    return this;
  }
}
export {
  BaseToken
};
//# sourceMappingURL=baseToken.js.map
