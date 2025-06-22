var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class Slash extends SimpleToken {
  static {
    __name(this, "Slash");
  }
  static {
    this.symbol = "/";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return Slash.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `slash${this.range}`;
  }
}
export {
  Slash
};
//# sourceMappingURL=slash.js.map
