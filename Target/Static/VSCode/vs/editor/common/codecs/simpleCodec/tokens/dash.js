var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Range } from "../../../core/range.js";
import { Position } from "../../../core/position.js";
import { Line } from "../../linesCodec/tokens/line.js";
class Dash extends BaseToken {
  static {
    __name(this, "Dash");
  }
  /**
   * The underlying symbol of the token.
   */
  static symbol = "-";
  /**
   * Return text representation of the token.
   */
  get text() {
    return Dash.symbol;
  }
  /**
   * Create new token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new Dash(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `dash${this.range}`;
  }
}
export {
  Dash
};
//# sourceMappingURL=dash.js.map
