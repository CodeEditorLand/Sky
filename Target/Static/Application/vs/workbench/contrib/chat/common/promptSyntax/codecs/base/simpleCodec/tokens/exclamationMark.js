var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class ExclamationMark extends SimpleToken {
  static {
    __name(this, "ExclamationMark");
  }
  static {
    this.symbol = "!";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return ExclamationMark.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `exclamation-mark${this.range}`;
  }
}
export {
  ExclamationMark
};
//# sourceMappingURL=exclamationMark.js.map
