var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleToken } from "./simpleToken.js";
class FormFeed extends SimpleToken {
  static {
    __name(this, "FormFeed");
  }
  static {
    this.symbol = "\f";
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return FormFeed.symbol;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `formfeed${this.range}`;
  }
}
export {
  FormFeed
};
//# sourceMappingURL=formFeed.js.map
