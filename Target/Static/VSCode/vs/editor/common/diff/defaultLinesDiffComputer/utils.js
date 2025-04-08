var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "../../../../base/common/charCode.js";
import { LineRange } from "../../core/lineRange.js";
import { DetailedLineRangeMapping } from "../rangeMapping.js";
class Array2D {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.array = new Array(width * height);
  }
  static {
    __name(this, "Array2D");
  }
  array = [];
  get(x, y) {
    return this.array[x + y * this.width];
  }
  set(x, y, value) {
    this.array[x + y * this.width] = value;
  }
}
function isSpace(charCode) {
  return charCode === CharCode.Space || charCode === CharCode.Tab;
}
__name(isSpace, "isSpace");
class LineRangeFragment {
  constructor(range, lines, source) {
    this.range = range;
    this.lines = lines;
    this.source = source;
    let counter = 0;
    for (let i = range.startLineNumber - 1; i < range.endLineNumberExclusive - 1; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        counter++;
        const chr = line[j];
        const key2 = LineRangeFragment.getKey(chr);
        this.histogram[key2] = (this.histogram[key2] || 0) + 1;
      }
      counter++;
      const key = LineRangeFragment.getKey("\n");
      this.histogram[key] = (this.histogram[key] || 0) + 1;
    }
    this.totalCount = counter;
  }
  static {
    __name(this, "LineRangeFragment");
  }
  static chrKeys = /* @__PURE__ */ new Map();
  static getKey(chr) {
    let key = this.chrKeys.get(chr);
    if (key === void 0) {
      key = this.chrKeys.size;
      this.chrKeys.set(chr, key);
    }
    return key;
  }
  totalCount;
  histogram = [];
  computeSimilarity(other) {
    let sumDifferences = 0;
    const maxLength = Math.max(this.histogram.length, other.histogram.length);
    for (let i = 0; i < maxLength; i++) {
      sumDifferences += Math.abs((this.histogram[i] ?? 0) - (other.histogram[i] ?? 0));
    }
    return 1 - sumDifferences / (this.totalCount + other.totalCount);
  }
}
export {
  Array2D,
  LineRangeFragment,
  isSpace
};
//# sourceMappingURL=utils.js.map
