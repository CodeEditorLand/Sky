var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class Quote extends SimpleToken {
  static {
    __name(this, "Quote");
  }
  static {
    this.symbol = "'";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return Quote.symbol;
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
    return `quote${this.range}`;
  }
}
export {
  Quote
};
//# sourceMappingURL=quote.js.map
