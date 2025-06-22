var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./promptToken.js";
import { DollarSign } from "../base/simpleCodec/tokens/dollarSign.js";
import { LeftCurlyBrace, RightCurlyBrace } from "../base/simpleCodec/tokens/curlyBraces.js";
class PromptTemplateVariable extends PromptToken {
  static {
    __name(this, "PromptTemplateVariable");
  }
  constructor(range, contents) {
    super(range);
    this.contents = contents;
  }
  /**
   * Get full text of the token.
   */
  get text() {
    return [
      DollarSign.symbol,
      LeftCurlyBrace.symbol,
      this.contents,
      RightCurlyBrace.symbol
    ].join("");
  }
  /**
   * Return a string representation of the token.
   */
  toString() {
    return `${this.text}${this.range}`;
  }
}
export {
  PromptTemplateVariable
};
//# sourceMappingURL=promptTemplateVariable.js.map
