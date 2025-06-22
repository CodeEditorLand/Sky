var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class LeftAngleBracket extends SimpleToken {
  static {
    __name(this, "LeftAngleBracket");
  }
  static {
    this.symbol = "<";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return LeftAngleBracket.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `left-angle-bracket${this.range}`;
  }
}
class RightAngleBracket extends SimpleToken {
  static {
    __name(this, "RightAngleBracket");
  }
  static {
    this.symbol = ">";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return RightAngleBracket.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `right-angle-bracket${this.range}`;
  }
}
export {
  LeftAngleBracket,
  RightAngleBracket
};
//# sourceMappingURL=angleBrackets.js.map
