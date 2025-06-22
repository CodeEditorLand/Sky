var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { FrontMatterValueToken } from "./frontMatterToken.js";
import { Word, SpacingToken } from "../../simpleCodec/tokens/tokens.js";
class FrontMatterSequence extends FrontMatterValueToken {
  static {
    __name(this, "FrontMatterSequence");
  }
  /**
   * @override Because this token represent a generic sequence of tokens,
   *           the type name is represented by the sequence of tokens itself
   */
  get valueTypeName() {
    return this;
  }
  /**
   * Text of the sequence value. The method exists to provide a
   * consistent interface with {@link FrontMatterString} token.
   *
   * Note! that this method does not automatically trim spacing tokens
   *       in the sequence. If you need to get a trimmed value, call
   *       {@link trimEnd} method first.
   */
  get cleanText() {
    return this.text;
  }
  /**
   * Trim spacing tokens at the end of the sequence.
   */
  trimEnd() {
    const trimmedTokens = [];
    let lastNonSpace = this.childTokens.length - 1;
    while (lastNonSpace >= 0) {
      const token = this.childTokens[lastNonSpace];
      if (token instanceof SpacingToken) {
        trimmedTokens.push(token);
        lastNonSpace--;
        continue;
      }
      break;
    }
    this.childTokens.length = lastNonSpace + 1;
    if (this.childTokens.length === 0) {
      this.collapseRangeToStart();
      this.childTokens.push(new Word(this.range, ""));
    }
    this.withRange(BaseToken.fullRange(this.childTokens));
    return trimmedTokens.reverse();
  }
  toString() {
    return `front-matter-sequence(${this.shortText()})${this.range}`;
  }
}
export {
  FrontMatterSequence
};
//# sourceMappingURL=frontMatterSequence.js.map
