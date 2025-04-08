var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Line } from "./line.js";
import { BaseToken } from "../../baseToken.js";
import { Range } from "../../../core/range.js";
import { Position } from "../../../core/position.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
class CarriageReturn extends BaseToken {
  static {
    __name(this, "CarriageReturn");
  }
  /**
   * The underlying symbol of the token.
   */
  static symbol = "\r";
  /**
   * The byte representation of the {@link symbol}.
   */
  static byte = VSBuffer.fromString(CarriageReturn.symbol);
  /**
   * The byte representation of the token.
   */
  get byte() {
    return CarriageReturn.byte;
  }
  /**
   * Return text representation of the token.
   */
  get text() {
    return CarriageReturn.symbol;
  }
  /**
   * Create new `CarriageReturn` token with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber) {
    const { range } = line;
    const startPosition = new Position(range.startLineNumber, atColumnNumber);
    const endPosition = new Position(range.startLineNumber, atColumnNumber + this.symbol.length);
    return new CarriageReturn(Range.fromPositions(
      startPosition,
      endPosition
    ));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `carriage-return${this.range}`;
  }
}
export {
  CarriageReturn
};
//# sourceMappingURL=carriageReturn.js.map
