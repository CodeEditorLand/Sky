var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class DollarSign extends SimpleToken {
  static {
    __name(this, "DollarSign");
  }
  static {
    this.symbol = "$";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return DollarSign.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `dollarSign${this.range}`;
  }
}
export {
  DollarSign
};
//# sourceMappingURL=dollarSign.js.map
