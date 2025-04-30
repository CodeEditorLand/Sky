var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./promptToken.js";
import { DollarSign } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/dollarSign.js";
import { LeftCurlyBrace, RightCurlyBrace } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/curlyBraces.js";
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
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (!super.sameRange(other.range)) {
      return false;
    }
    if (other instanceof PromptTemplateVariable === false) {
      return false;
    }
    if (this.text.length !== other.text.length) {
      return false;
    }
    return this.text === other.text;
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
