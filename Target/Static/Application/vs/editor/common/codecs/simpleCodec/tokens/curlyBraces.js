var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class LeftCurlyBrace extends SimpleToken {
  static {
    __name(this, "LeftCurlyBrace");
  }
  static {
    this.symbol = "{";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return LeftCurlyBrace.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `left-curly-brace${this.range}`;
  }
}
class RightCurlyBrace extends SimpleToken {
  static {
    __name(this, "RightCurlyBrace");
  }
  static {
    this.symbol = "}";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return RightCurlyBrace.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `right-curly-brace${this.range}`;
  }
}
export {
  LeftCurlyBrace,
  RightCurlyBrace
};
//# sourceMappingURL=curlyBraces.js.map
