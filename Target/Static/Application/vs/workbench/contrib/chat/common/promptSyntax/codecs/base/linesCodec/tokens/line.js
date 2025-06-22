var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { assert } from "../../../../../../../../../base/common/assert.js";
import { Range } from "../../../../../../../../../editor/common/core/range.js";
class Line extends BaseToken {
  static {
    __name(this, "Line");
  }
  constructor(lineNumber, text) {
    assert(!isNaN(lineNumber), `The line number must not be a NaN.`);
    assert(lineNumber > 0, `The line number must be >= 1, got "${lineNumber}".`);
    super(new Range(lineNumber, 1, lineNumber, text.length + 1));
    this.text = text;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `line("${this.shortText()}")${this.range}`;
  }
}
export {
  Line
};
//# sourceMappingURL=line.js.map
