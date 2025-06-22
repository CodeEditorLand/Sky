var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Range } from "../../../../../../../../../editor/common/core/range.js";
class Word extends BaseToken {
  static {
    __name(this, "Word");
  }
  constructor(range, text) {
    super(range);
    this.text = text;
  }
  /**
   * Create new `Word` token with the given `text` and the range
   * inside the given `Line` at the specified `column number`.
   */
  static newOnLine(text, line, atColumnNumber) {
    const startLineNumber = typeof line === "number" ? line : line.range.startLineNumber;
    const range = new Range(startLineNumber, atColumnNumber, startLineNumber, atColumnNumber + text.length);
    return new Word(range, text);
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `word("${this.shortText()}")${this.range}`;
  }
}
export {
  Word
};
//# sourceMappingURL=word.js.map
