var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Range } from "../../../core/range.js";
import { Position } from "../../../core/position.js";
import { Line } from "../../linesCodec/tokens/line.js";
class LeftBracket extends BaseToken {
  static {
    __name(this, "LeftBracket");
  }
  /**
   * The underlying symbol of the `LeftBracket` token.
   */
  static symbol = "[";
  /**
   * Return text representation of the token.
   */
  get text() {
    return LeftBracket.symbol;
  }
  /**
   * Create new `LeftBracket` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new LeftBracket(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `left-bracket${this.range}`;
  }
}
class RightBracket extends BaseToken {
  static {
    __name(this, "RightBracket");
  }
  /**
   * The underlying symbol of the `RightBracket` token.
   */
  static symbol = "]";
  /**
   * Return text representation of the token.
   */
  get text() {
    return RightBracket.symbol;
  }
  /**
   * Create new `RightBracket` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new RightBracket(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `right-bracket${this.range}`;
  }
}
export {
  LeftBracket,
  RightBracket
};
//# sourceMappingURL=brackets.js.map
