var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { SimpleToken } from "../../simpleCodec/tokens/simpleToken.js";
class CarriageReturn extends SimpleToken {
  static {
    __name(this, "CarriageReturn");
  }
  static {
    this.symbol = "\r";
  }
  static {
    this.byte = VSBuffer.fromString(CarriageReturn.symbol);
  }
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
   * Returns a string representation of the token.
   */
  toString() {
    return `CR${this.range}`;
  }
}
export {
  CarriageReturn
};
//# sourceMappingURL=carriageReturn.js.map
