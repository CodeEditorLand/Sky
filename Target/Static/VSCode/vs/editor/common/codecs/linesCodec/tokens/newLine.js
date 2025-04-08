var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Line } from "./line.js";
import { BaseToken } from "../../baseToken.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { Position } from "../../../../../editor/common/core/position.js";
class NewLine extends BaseToken {
  static {
    __name(this, "NewLine");
  }
  /**
   * The underlying symbol of the `NewLine` token.
   */
  static symbol = "\n";
  /**
   * The byte representation of the {@link symbol}.
   */
  static byte = VSBuffer.fromString(NewLine.symbol);
  /**
   * Return text representation of the token.
   */
  get text() {
    return NewLine.symbol;
  }
  /**
   * The byte representation of the token.
   */
  get byte() {
    return NewLine.byte;
  }
  /**
   * Create new `NewLine` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new NewLine(
      Range.fromPositions(startPosition, endPosition)
    );
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `newline${this.range}`;
  }
}
export {
  NewLine
};
//# sourceMappingURL=newLine.js.map
