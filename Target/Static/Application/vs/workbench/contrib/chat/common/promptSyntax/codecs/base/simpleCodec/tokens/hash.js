var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class Hash extends SimpleToken {
  static {
    __name(this, "Hash");
  }
  static {
    this.symbol = "#";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return Hash.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `hash${this.range}`;
  }
}
export {
  Hash
};
//# sourceMappingURL=hash.js.map
