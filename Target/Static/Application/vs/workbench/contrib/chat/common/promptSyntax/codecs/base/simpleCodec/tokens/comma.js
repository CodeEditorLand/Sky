var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class Comma extends SimpleToken {
  static {
    __name(this, "Comma");
  }
  static {
    this.symbol = ",";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return Comma.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `comma${this.range}`;
  }
}
export {
  Comma
};
//# sourceMappingURL=comma.js.map
