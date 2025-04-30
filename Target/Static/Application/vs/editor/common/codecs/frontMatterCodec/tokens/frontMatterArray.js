var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { FrontMatterValueToken } from "./frontMatterToken.js";
class FrontMatterArray extends FrontMatterValueToken {
  static {
    __name(this, "FrontMatterArray");
  }
  constructor(tokens) {
    super(BaseToken.fullRange(tokens));
    this.tokens = tokens;
    this.valueTypeName = "array";
  }
  /**
   * List of the array items.
   */
  get items() {
    const result = [];
    for (const token of this.tokens) {
      if (token instanceof FrontMatterValueToken) {
        result.push(token);
      }
    }
    return result;
  }
  get text() {
    return BaseToken.render(this.tokens);
  }
  toString() {
    return `front-matter-array(${this.shortText()})${this.range}`;
  }
}
export {
  FrontMatterArray
};
//# sourceMappingURL=frontMatterArray.js.map
