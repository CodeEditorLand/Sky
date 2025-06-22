var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SpacingToken } from "./simpleToken.js";
class VerticalTab extends SpacingToken {
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
