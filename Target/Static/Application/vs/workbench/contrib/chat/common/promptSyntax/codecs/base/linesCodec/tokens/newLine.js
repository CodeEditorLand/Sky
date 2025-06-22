var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../../../../../../base/common/buffer.js";
import { SimpleToken } from "../../simpleCodec/tokens/simpleToken.js";
class NewLine extends SimpleToken {
  static {
    __name(this, "NewLine");
  }
  static {
    this.symbol = "\n";
  }
  static {
    this.byte = VSBuffer.fromString(NewLine.symbol);
  }
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
