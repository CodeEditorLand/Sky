var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../../../core/range.js";
import { BaseToken } from "../../baseToken.js";
class SimpleToken extends BaseToken {
  static {
    __name(this, "SimpleToken");
  }
  /**
   * Create new token instance with range inside
   * the given `Line` at the given `column number`.
   */
  static newOnLine(line, atColumnNumber, Constructor) {
    const { range } = line;
    return new Constructor(new Range(range.startLineNumber, atColumnNumber, range.startLineNumber, atColumnNumber + Constructor.symbol.length));
  }
}
export {
  SimpleToken
};
//# sourceMappingURL=simpleToken.js.map
