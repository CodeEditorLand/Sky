var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../../../base/common/arrays.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IIdentifiedSingleEditOperation } from "../../../../../editor/common/model.js";
import { LineRange } from "./lineRange.js";
class LineRangeEdit {
  constructor(range, newLines) {
    this.range = range;
    this.newLines = newLines;
  }
  static {
    __name(this, "LineRangeEdit");
  }
  equals(other) {
    return this.range.equals(other.range) && equals(this.newLines, other.newLines);
  }
  toEdits(modelLineCount) {
    return new LineEdits([this]).toEdits(modelLineCount);
  }
}
class RangeEdit {
  constructor(range, newText) {
    this.range = range;
    this.newText = newText;
  }
  static {
    __name(this, "RangeEdit");
  }
  equals(other) {
    return Range.equalsRange(this.range, other.range) && this.newText === other.newText;
  }
}
class LineEdits {
  constructor(edits) {
    this.edits = edits;
  }
  static {
    __name(this, "LineEdits");
  }
  toEdits(modelLineCount) {
    return this.edits.map((e) => {
      if (e.range.endLineNumberExclusive <= modelLineCount) {
        return {
          range: new Range(e.range.startLineNumber, 1, e.range.endLineNumberExclusive, 1),
          text: e.newLines.map((s) => s + "\n").join("")
        };
      }
      if (e.range.startLineNumber === 1) {
        return {
          range: new Range(1, 1, modelLineCount, Number.MAX_SAFE_INTEGER),
          text: e.newLines.join("\n")
        };
      }
      return {
        range: new Range(e.range.startLineNumber - 1, Number.MAX_SAFE_INTEGER, modelLineCount, Number.MAX_SAFE_INTEGER),
        text: e.newLines.map((s) => "\n" + s).join("")
      };
    });
  }
}
export {
  LineEdits,
  LineRangeEdit,
  RangeEdit
};
//# sourceMappingURL=editing.js.map
