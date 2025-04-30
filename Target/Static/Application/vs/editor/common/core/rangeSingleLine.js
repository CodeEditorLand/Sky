var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ColumnRange } from "./columnRange.js";
import { Range } from "./range.js";
class RangeSingleLine {
  static {
    __name(this, "RangeSingleLine");
  }
  static fromRange(range) {
    if (range.endLineNumber !== range.startLineNumber) {
      return void 0;
    }
    return new RangeSingleLine(range.startLineNumber, new ColumnRange(range.startColumn, range.endColumn));
  }
  constructor(lineNumber, columnRange) {
    this.lineNumber = lineNumber;
    this.columnRange = columnRange;
  }
  toRange() {
    return new Range(this.lineNumber, this.columnRange.startColumn, this.lineNumber, this.columnRange.endColumnExclusive);
  }
}
export {
  RangeSingleLine
};
//# sourceMappingURL=rangeSingleLine.js.map
