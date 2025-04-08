var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Line } from "../../linesCodec/tokens/line.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { Position } from "../../../../../editor/common/core/position.js";
class FormFeed extends BaseToken {
  static {
    __name(this, "FormFeed");
  }
  /**
   * The underlying symbol of the token.
   */
  static symbol = "\f";
  /**
   * Return text representation of the token.
   */
  get text() {
    return FormFeed.symbol;
  }
  /**
   * Create new `FormFeed` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new FormFeed(Range.fromPositions(
      startPosition,
      endPosition
    ));
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
