var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SnippetString } from "./snippetString.js";
import { Range } from "./range.js";
class SnippetTextEdit {
  static {
    __name(this, "SnippetTextEdit");
  }
  static isSnippetTextEdit(thing) {
    if (thing instanceof SnippetTextEdit) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Range.isRange(thing.range) && SnippetString.isSnippetString(thing.snippet);
  }
  static replace(range, snippet) {
    return new SnippetTextEdit(range, snippet);
  }
  static insert(position, snippet) {
    return SnippetTextEdit.replace(new Range(position, position), snippet);
  }
  constructor(range, snippet) {
    this.range = range;
    this.snippet = snippet;
  }
}
export {
  SnippetTextEdit
};
//# sourceMappingURL=snippetTextEdit.js.map
