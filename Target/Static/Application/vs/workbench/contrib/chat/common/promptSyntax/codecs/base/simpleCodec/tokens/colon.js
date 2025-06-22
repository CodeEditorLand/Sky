var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class Colon extends SimpleToken {
  static {
    __name(this, "Colon");
  }
  static {
    this.symbol = ":";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return Colon.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `colon${this.range}`;
  }
}
export {
  Colon
};
//# sourceMappingURL=colon.js.map
