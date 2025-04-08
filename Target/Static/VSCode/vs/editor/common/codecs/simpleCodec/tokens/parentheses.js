var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Range } from "../../../core/range.js";
import { Position } from "../../../core/position.js";
import { Line } from "../../linesCodec/tokens/line.js";
class LeftParenthesis extends BaseToken {
  static {
    __name(this, "LeftParenthesis");
  }
  /**
   * The underlying symbol of the token.
   */
  static symbol = "(";
  /**
   * Return text representation of the token.
   */
  get text() {
    return LeftParenthesis.symbol;
  }
  /**
   * Create new `LeftParenthesis` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new LeftParenthesis(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `left-parenthesis${this.range}`;
  }
}
class RightParenthesis extends BaseToken {
  static {
    __name(this, "RightParenthesis");
  }
  /**
   * The underlying symbol of the token.
   */
  static symbol = ")";
  /**
   * Return text representation of the token.
   */
  get text() {
    return RightParenthesis.symbol;
  }
  /**
   * Create new `RightParenthesis` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new RightParenthesis(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `right-parenthesis${this.range}`;
  }
}
export {
  LeftParenthesis,
  RightParenthesis
};
//# sourceMappingURL=parentheses.js.map
