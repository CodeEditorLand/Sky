var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { FrontMatterValueToken } from "./frontMatterToken.js";
class FrontMatterString extends FrontMatterValueToken {
  static {
    __name(this, "FrontMatterString");
  }
  constructor(tokens) {
    super(BaseToken.fullRange(tokens));
    this.tokens = tokens;
    this.valueTypeName = "string";
  }
  /**
   * Text of the string value without the wrapping quotes.
   */
  get cleanText() {
    return BaseToken.render(this.tokens.slice(1, this.tokens.length - 1));
  }
  get text() {
    return BaseToken.render(this.tokens);
  }
  toString() {
    return `front-matter-string(${this.shortText()})${this.range}`;
  }
}
export {
  FrontMatterString
};
//# sourceMappingURL=frontMatterString.js.map
