var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class VerticalTab extends SimpleToken {
  static {
    __name(this, "VerticalTab");
  }
  static {
    this.symbol = "\v";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return VerticalTab.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `vtab${this.range}`;
  }
}
export {
  VerticalTab
};
//# sourceMappingURL=verticalTab.js.map
