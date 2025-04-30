var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class LeftParenthesis extends SimpleToken {
  static {
    __name(this, "LeftParenthesis");
  }
  static {
    this.symbol = "(";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return LeftParenthesis.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `left-parenthesis${this.range}`;
  }
}
class RightParenthesis extends SimpleToken {
  static {
    __name(this, "RightParenthesis");
  }
  static {
    this.symbol = ")";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return RightParenthesis.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `right-parenthesis${this.range}`;
  }
}
export {
  LeftParenthesis,
  RightParenthesis
};
//# sourceMappingURL=parentheses.js.map
