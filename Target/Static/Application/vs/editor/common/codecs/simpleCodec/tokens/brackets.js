var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class LeftBracket extends SimpleToken {
  static {
    __name(this, "LeftBracket");
  }
  static {
    this.symbol = "[";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return LeftBracket.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `left-bracket${this.range}`;
  }
}
class RightBracket extends SimpleToken {
  static {
    __name(this, "RightBracket");
  }
  static {
    this.symbol = "]";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return RightBracket.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `right-bracket${this.range}`;
  }
}
export {
  LeftBracket,
  RightBracket
};
//# sourceMappingURL=brackets.js.map
