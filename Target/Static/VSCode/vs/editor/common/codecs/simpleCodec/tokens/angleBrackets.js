var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Range } from "../../../core/range.js";
import { Position } from "../../../core/position.js";
import { Line } from "../../linesCodec/tokens/line.js";
class LeftAngleBracket extends BaseToken {
  static {
    __name(this, "LeftAngleBracket");
  }
  /**
   * The underlying symbol of the token.
   */
  static symbol = "<";
  /**
   * Return text representation of the token.
   */
  get text() {
    return LeftAngleBracket.symbol;
  }
  /**
   * Create new `LeftBracket` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new LeftAngleBracket(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `left-angle-bracket${this.range}`;
  }
}
class RightAngleBracket extends BaseToken {
  static {
    __name(this, "RightAngleBracket");
  }
  /**
   * The underlying symbol of the token.
   */
  static symbol = ">";
  /**
   * Return text representation of the token.
   */
  get text() {
    return RightAngleBracket.symbol;
  }
  /**
   * Create new `RightAngleBracket` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new RightAngleBracket(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `right-angle-bracket${this.range}`;
  }
}
export {
  LeftAngleBracket,
  RightAngleBracket
};
//# sourceMappingURL=angleBrackets.js.map
