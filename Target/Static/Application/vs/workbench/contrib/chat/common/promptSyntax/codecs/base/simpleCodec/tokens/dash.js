var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class Dash extends SimpleToken {
  static {
    __name(this, "Dash");
  }
  static {
    this.symbol = "-";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return Dash.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `dash${this.range}`;
  }
}
export {
  Dash
};
//# sourceMappingURL=dash.js.map
