var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as arrays from "../../base/common/arrays.js";
import { IScrollPosition, Scrollable } from "../../base/common/scrollable.js";
import * as strings from "../../base/common/strings.js";
import { IPosition, Position } from "./core/position.js";
import { Range } from "./core/range.js";
import { CursorConfiguration, CursorState, EditOperationType, IColumnSelectData, ICursorSimpleModel, PartialCursorState } from "./cursorCommon.js";
import { CursorChangeReason } from "./cursorEvents.js";
import { INewScrollPosition, ScrollType } from "./editorCommon.js";
import { EditorTheme } from "./editorTheme.js";
import { EndOfLinePreference, IGlyphMarginLanesModel, IModelDecorationOptions, ITextModel, PositionAffinity } from "./model.js";
import { ILineBreaksComputer, InjectedText } from "./modelLineProjectionData.js";
import { BracketGuideOptions, IActiveIndentGuideInfo, IndentGuide } from "./textModelGuides.js";
import { IViewLineTokens } from "./tokens/lineTokens.js";
import { ViewEventHandler } from "./viewEventHandler.js";
import { VerticalRevealType } from "./viewEvents.js";
class Viewport {
  static {
    __name(this, "Viewport");
  }
  _viewportBrand = void 0;
  top;
  left;
  width;
  height;
  constructor(top, left, width, height) {
    this.top = top | 0;
    this.left = left | 0;
    this.width = width | 0;
    this.height = height | 0;
  }
}
class MinimapLinesRenderingData {
  static {
    __name(this, "MinimapLinesRenderingData");
  }
  tabSize;
  data;
  constructor(tabSize, data) {
    this.tabSize = tabSize;
    this.data = data;
  }
}
class ViewLineData {
  static {
    __name(this, "ViewLineData");
  }
  _viewLineDataBrand = void 0;
  /**
   * The content at this view line.
   */
  content;
  /**
   * Does this line continue with a wrapped line?
   */
  continuesWithWrappedLine;
  /**
   * The minimum allowed column at this view line.
   */
  minColumn;
  /**
   * The maximum allowed column at this view line.
   */
  maxColumn;
  /**
   * The visible column at the start of the line (after the fauxIndent).
   */
  startVisibleColumn;
  /**
   * The tokens at this view line.
   */
  tokens;
  /**
   * Additional inline decorations for this line.
  */
  inlineDecorations;
  constructor(content, continuesWithWrappedLine, minColumn, maxColumn, startVisibleColumn, tokens, inlineDecorations) {
    this.content = content;
    this.continuesWithWrappedLine = continuesWithWrappedLine;
    this.minColumn = minColumn;
    this.maxColumn = maxColumn;
    this.startVisibleColumn = startVisibleColumn;
    this.tokens = tokens;
    this.inlineDecorations = inlineDecorations;
  }
}
class ViewLineRenderingData {
  static {
    __name(this, "ViewLineRenderingData");
  }
  /**
   * The minimum allowed column at this view line.
   */
  minColumn;
  /**
   * The maximum allowed column at this view line.
   */
  maxColumn;
  /**
   * The content at this view line.
   */
  content;
  /**
   * Does this line continue with a wrapped line?
   */
  continuesWithWrappedLine;
  /**
   * Describes if `content` contains RTL characters.
   */
  containsRTL;
  /**
   * Describes if `content` contains non basic ASCII chars.
   */
  isBasicASCII;
  /**
   * The tokens at this view line.
   */
  tokens;
  /**
   * Inline decorations at this view line.
   */
  inlineDecorations;
  /**
   * The tab size for this view model.
   */
  tabSize;
  /**
   * The visible column at the start of the line (after the fauxIndent)
   */
  startVisibleColumn;
  constructor(minColumn, maxColumn, content, continuesWithWrappedLine, mightContainRTL, mightContainNonBasicASCII, tokens, inlineDecorations, tabSize, startVisibleColumn) {
    this.minColumn = minColumn;
    this.maxColumn = maxColumn;
    this.content = content;
    this.continuesWithWrappedLine = continuesWithWrappedLine;
    this.isBasicASCII = ViewLineRenderingData.isBasicASCII(content, mightContainNonBasicASCII);
    this.containsRTL = ViewLineRenderingData.containsRTL(content, this.isBasicASCII, mightContainRTL);
    this.tokens = tokens;
    this.inlineDecorations = inlineDecorations;
    this.tabSize = tabSize;
    this.startVisibleColumn = startVisibleColumn;
  }
  static isBasicASCII(lineContent, mightContainNonBasicASCII) {
    if (mightContainNonBasicASCII) {
      return strings.isBasicASCII(lineContent);
    }
    return true;
  }
  static containsRTL(lineContent, isBasicASCII, mightContainRTL) {
    if (!isBasicASCII && mightContainRTL) {
      return strings.containsRTL(lineContent);
    }
    return false;
  }
}
var InlineDecorationType = /* @__PURE__ */ ((InlineDecorationType2) => {
  InlineDecorationType2[InlineDecorationType2["Regular"] = 0] = "Regular";
  InlineDecorationType2[InlineDecorationType2["Before"] = 1] = "Before";
  InlineDecorationType2[InlineDecorationType2["After"] = 2] = "After";
  InlineDecorationType2[InlineDecorationType2["RegularAffectingLetterSpacing"] = 3] = "RegularAffectingLetterSpacing";
  return InlineDecorationType2;
})(InlineDecorationType || {});
class InlineDecoration {
  constructor(range, inlineClassName, type) {
    this.range = range;
    this.inlineClassName = inlineClassName;
    this.type = type;
  }
  static {
    __name(this, "InlineDecoration");
  }
}
class SingleLineInlineDecoration {
  constructor(startOffset, endOffset, inlineClassName, inlineClassNameAffectsLetterSpacing) {
    this.startOffset = startOffset;
    this.endOffset = endOffset;
    this.inlineClassName = inlineClassName;
    this.inlineClassNameAffectsLetterSpacing = inlineClassNameAffectsLetterSpacing;
  }
  static {
    __name(this, "SingleLineInlineDecoration");
  }
  toInlineDecoration(lineNumber) {
    return new InlineDecoration(
      new Range(lineNumber, this.startOffset + 1, lineNumber, this.endOffset + 1),
      this.inlineClassName,
      this.inlineClassNameAffectsLetterSpacing ? 3 /* RegularAffectingLetterSpacing */ : 0 /* Regular */
    );
  }
}
class ViewModelDecoration {
  static {
    __name(this, "ViewModelDecoration");
  }
  _viewModelDecorationBrand = void 0;
  range;
  options;
  constructor(range, options) {
    this.range = range;
    this.options = options;
  }
}
class OverviewRulerDecorationsGroup {
  constructor(color, zIndex, data) {
    this.color = color;
    this.zIndex = zIndex;
    this.data = data;
  }
  static {
    __name(this, "OverviewRulerDecorationsGroup");
  }
  static compareByRenderingProps(a, b) {
    if (a.zIndex === b.zIndex) {
      if (a.color < b.color) {
        return -1;
      }
      if (a.color > b.color) {
        return 1;
      }
      return 0;
    }
    return a.zIndex - b.zIndex;
  }
  static equals(a, b) {
    return a.color === b.color && a.zIndex === b.zIndex && arrays.equals(a.data, b.data);
  }
  static equalsArr(a, b) {
    return arrays.equals(a, b, OverviewRulerDecorationsGroup.equals);
  }
}
export {
  InlineDecoration,
  InlineDecorationType,
  MinimapLinesRenderingData,
  OverviewRulerDecorationsGroup,
  SingleLineInlineDecoration,
  ViewLineData,
  ViewLineRenderingData,
  ViewModelDecoration,
  Viewport
};
//# sourceMappingURL=viewModel.js.map
