var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Line } from "../../linesCodec/tokens/line.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { Position } from "../../../../../editor/common/core/position.js";
class Tab extends BaseToken {
  static {
    __name(this, "Tab");
  }
  /**
   * The underlying symbol of the token.
   */
  static symbol = "	";
  /**
   * Return text representation of the token.
   */
  get text() {
    return Tab.symbol;
  }
  /**
   * Create new token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new Tab(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `tab${this.range}`;
  }
}
export {
  Tab
};
//# sourceMappingURL=tab.js.map
