var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class At extends SimpleToken {
  static {
    __name(this, "At");
  }
  static {
    this.symbol = "@";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return At.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `at${this.range}`;
  }
}
export {
  At
};
//# sourceMappingURL=at.js.map
