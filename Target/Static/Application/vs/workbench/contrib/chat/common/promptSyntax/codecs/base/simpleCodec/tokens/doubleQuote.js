var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class DoubleQuote extends SimpleToken {
  static {
    __name(this, "DoubleQuote");
  }
  static {
    this.symbol = '"';
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return DoubleQuote.symbol;
  }
  /**
   * Checks if the provided token is of the same type
   * as the current one.
   */
  sameType(other) {
    return other instanceof this.constructor;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `double-quote${this.range}`;
  }
}
export {
  DoubleQuote
};
//# sourceMappingURL=doubleQuote.js.map
