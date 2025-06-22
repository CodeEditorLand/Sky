var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SpacingToken } from "./simpleToken.js";
class Space extends SpacingToken {
  static {
    __name(this, "Space");
  }
  static {
    this.symbol = " ";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return Space.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `space${this.range}`;
  }
}
export {
  Space
};
//# sourceMappingURL=space.js.map
