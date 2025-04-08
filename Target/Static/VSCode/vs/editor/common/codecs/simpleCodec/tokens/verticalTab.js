var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Line } from "../../linesCodec/tokens/line.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { Position } from "../../../../../editor/common/core/position.js";
class VerticalTab extends BaseToken {
  static {
    __name(this, "VerticalTab");
  }
  /**
   * The underlying symbol of the `VerticalTab` token.
   */
  static symbol = "\v";
  /**
   * Return text representation of the token.
   */
  get text() {
    return VerticalTab.symbol;
  }
  /**
   * Create new `VerticalTab` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new VerticalTab(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `vtab${this.range}`;
  }
}
export {
  VerticalTab
};
//# sourceMappingURL=verticalTab.js.map
