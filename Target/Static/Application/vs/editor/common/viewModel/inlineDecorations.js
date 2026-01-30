var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../core/range.js";
var InlineDecorationType;
(function(InlineDecorationType2) {
  InlineDecorationType2[InlineDecorationType2["Regular"] = 0] = "Regular";
  InlineDecorationType2[InlineDecorationType2["Before"] = 1] = "Before";
  InlineDecorationType2[InlineDecorationType2["After"] = 2] = "After";
  InlineDecorationType2[InlineDecorationType2["RegularAffectingLetterSpacing"] = 3] = "RegularAffectingLetterSpacing";
})(InlineDecorationType || (InlineDecorationType = {}));
class InlineDecoration {
  static {
    __name(this, "InlineDecoration");
  }
  constructor(range, inlineClassName, type) {
    this.range = range;
    this.inlineClassName = inlineClassName;
    this.type = type;
  }
}
class SingleLineInlineDecoration {
  static {
    __name(this, "SingleLineInlineDecoration");
  }
  constructor(startOffset, endOffset, inlineClassName, inlineClassNameAffectsLetterSpacing) {
    this.startOffset = startOffset;
    this.endOffset = endOffset;
    this.inlineClassName = inlineClassName;
    this.inlineClassNameAffectsLetterSpacing = inlineClassNameAffectsLetterSpacing;
  }
  toInlineDecoration(lineNumber) {
    return new InlineDecoration(
      new Range(lineNumber, this.startOffset + 1, lineNumber, this.endOffset + 1),
      this.inlineClassName,
      this.inlineClassNameAffectsLetterSpacing ? 3 : 0
      /* InlineDecorationType.Regular */
    );
  }
}
export {
  InlineDecoration,
  InlineDecorationType,
  SingleLineInlineDecoration
};
//# sourceMappingURL=inlineDecorations.js.map
