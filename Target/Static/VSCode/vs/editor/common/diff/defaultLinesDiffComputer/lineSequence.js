var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "../../../../base/common/charCode.js";
import { OffsetRange } from "../../core/offsetRange.js";
import { ISequence } from "./algorithms/diffAlgorithm.js";
class LineSequence {
  constructor(trimmedHash, lines) {
    this.trimmedHash = trimmedHash;
    this.lines = lines;
  }
  static {
    __name(this, "LineSequence");
  }
  getElement(offset) {
    return this.trimmedHash[offset];
  }
  get length() {
    return this.trimmedHash.length;
  }
  getBoundaryScore(length) {
    const indentationBefore = length === 0 ? 0 : getIndentation(this.lines[length - 1]);
    const indentationAfter = length === this.lines.length ? 0 : getIndentation(this.lines[length]);
    return 1e3 - (indentationBefore + indentationAfter);
  }
  getText(range) {
    return this.lines.slice(range.start, range.endExclusive).join("\n");
  }
  isStronglyEqual(offset1, offset2) {
    return this.lines[offset1] === this.lines[offset2];
  }
}
function getIndentation(str) {
  let i = 0;
  while (i < str.length && (str.charCodeAt(i) === CharCode.Space || str.charCodeAt(i) === CharCode.Tab)) {
    i++;
  }
  return i;
}
__name(getIndentation, "getIndentation");
export {
  LineSequence
};
//# sourceMappingURL=lineSequence.js.map
