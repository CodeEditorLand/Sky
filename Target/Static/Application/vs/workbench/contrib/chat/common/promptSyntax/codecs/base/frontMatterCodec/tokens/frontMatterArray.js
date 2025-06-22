var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { FrontMatterValueToken } from "./frontMatterToken.js";
class FrontMatterArray extends FrontMatterValueToken {
  static {
    __name(this, "FrontMatterArray");
  }
  constructor() {
    super(...arguments);
    this.valueTypeName = "array";
  }
  /**
   * List of the array items.
   */
  get items() {
    const result = [];
    for (const token of this.children) {
      if (token instanceof FrontMatterValueToken) {
        result.push(token);
      }
    }
    return result;
  }
  toString() {
    const itemsString = BaseToken.render(this.items, ", ");
    return `front-matter-array(${itemsString})${this.range}`;
  }
}
export {
  FrontMatterArray
};
//# sourceMappingURL=frontMatterArray.js.map
