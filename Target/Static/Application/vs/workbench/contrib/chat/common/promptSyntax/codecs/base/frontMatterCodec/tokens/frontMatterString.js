var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { FrontMatterValueToken } from "./frontMatterToken.js";
class FrontMatterString extends FrontMatterValueToken {
  static {
    __name(this, "FrontMatterString");
  }
  constructor() {
    super(...arguments);
    this.valueTypeName = "quoted-string";
  }
  /**
   * Text of the string value without the wrapping quotes.
   */
  get cleanText() {
    return BaseToken.render(this.children.slice(1, this.children.length - 1));
  }
  toString() {
    return `front-matter-string(${this.shortText()})${this.range}`;
  }
}
export {
  FrontMatterString
};
//# sourceMappingURL=frontMatterString.js.map
