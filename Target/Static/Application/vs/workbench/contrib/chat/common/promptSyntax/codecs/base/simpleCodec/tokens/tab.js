var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SpacingToken } from "./simpleToken.js";
class Tab extends SpacingToken {
  static {
    __name(this, "Tab");
  }
  static {
    this.symbol = "	";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return Tab.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `tab${this.range}`;
  }
}
export {
  Tab
};
//# sourceMappingURL=tab.js.map
