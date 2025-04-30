var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { Position } from "../../../../../editor/common/core/position.js";
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
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + text.length);
    return new Word(Range.fromPositions(startPosition, endPosition), text);
  }
  /**
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (!super.equals(other)) {
      return false;
    }
    if (!(other instanceof Word)) {
      return false;
    }
    return this.text === other.text;
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
