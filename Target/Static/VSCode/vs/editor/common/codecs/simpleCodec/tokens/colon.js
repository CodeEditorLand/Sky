var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Range } from "../../../core/range.js";
import { Position } from "../../../core/position.js";
import { Line } from "../../linesCodec/tokens/line.js";
class Colon extends BaseToken {
  static {
    __name(this, "Colon");
  }
  /**
   * The underlying symbol of the token.
   */
  static symbol = ":";
  /**
   * Return text representation of the token.
   */
  get text() {
    return Colon.symbol;
  }
  /**
   * Create new token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new Colon(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `colon${this.range}`;
  }
}
export {
  Colon
};
//# sourceMappingURL=colon.js.map
