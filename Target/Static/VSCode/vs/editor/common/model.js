var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../base/common/event.js";
import { IMarkdownString } from "../../base/common/htmlContent.js";
import { IDisposable } from "../../base/common/lifecycle.js";
import { equals } from "../../base/common/objects.js";
import { ThemeColor } from "../../base/common/themables.js";
import { URI } from "../../base/common/uri.js";
import { ISingleEditOperation } from "./core/editOperation.js";
import { IPosition, Position } from "./core/position.js";
import { IRange, Range } from "./core/range.js";
import { Selection } from "./core/selection.js";
import { TextChange } from "./core/textChange.js";
import { WordCharacterClassifier } from "./core/wordCharacterClassifier.js";
import { IWordAtPosition } from "./core/wordHelper.js";
import { FormattingOptions } from "./languages.js";
import { ILanguageSelection } from "./languages/language.js";
import { IBracketPairsTextModelPart } from "./textModelBracketPairs.js";
import { IModelContentChange, IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent, InternalModelContentChangeEvent, ModelInjectedTextChangedEvent } from "./textModelEvents.js";
import { IGuidesTextModelPart } from "./textModelGuides.js";
import { ITokenizationTextModelPart } from "./tokenizationTextModelPart.js";
import { UndoRedoGroup } from "../../platform/undoRedo/common/undoRedo.js";
import { TokenArray } from "./tokens/tokenArray.js";
import { IEditorModel } from "./editorCommon.js";
var OverviewRulerLane = /* @__PURE__ */ ((OverviewRulerLane2) => {
  OverviewRulerLane2[OverviewRulerLane2["Left"] = 1] = "Left";
  OverviewRulerLane2[OverviewRulerLane2["Center"] = 2] = "Center";
  OverviewRulerLane2[OverviewRulerLane2["Right"] = 4] = "Right";
  OverviewRulerLane2[OverviewRulerLane2["Full"] = 7] = "Full";
  return OverviewRulerLane2;
})(OverviewRulerLane || {});
var GlyphMarginLane = /* @__PURE__ */ ((GlyphMarginLane2) => {
  GlyphMarginLane2[GlyphMarginLane2["Left"] = 1] = "Left";
  GlyphMarginLane2[GlyphMarginLane2["Center"] = 2] = "Center";
  GlyphMarginLane2[GlyphMarginLane2["Right"] = 3] = "Right";
  return GlyphMarginLane2;
})(GlyphMarginLane || {});
var MinimapPosition = /* @__PURE__ */ ((MinimapPosition2) => {
  MinimapPosition2[MinimapPosition2["Inline"] = 1] = "Inline";
  MinimapPosition2[MinimapPosition2["Gutter"] = 2] = "Gutter";
  return MinimapPosition2;
})(MinimapPosition || {});
var MinimapSectionHeaderStyle = /* @__PURE__ */ ((MinimapSectionHeaderStyle2) => {
  MinimapSectionHeaderStyle2[MinimapSectionHeaderStyle2["Normal"] = 1] = "Normal";
  MinimapSectionHeaderStyle2[MinimapSectionHeaderStyle2["Underlined"] = 2] = "Underlined";
  return MinimapSectionHeaderStyle2;
})(MinimapSectionHeaderStyle || {});
var InjectedTextCursorStops = /* @__PURE__ */ ((InjectedTextCursorStops2) => {
  InjectedTextCursorStops2[InjectedTextCursorStops2["Both"] = 0] = "Both";
  InjectedTextCursorStops2[InjectedTextCursorStops2["Right"] = 1] = "Right";
  InjectedTextCursorStops2[InjectedTextCursorStops2["Left"] = 2] = "Left";
  InjectedTextCursorStops2[InjectedTextCursorStops2["None"] = 3] = "None";
  return InjectedTextCursorStops2;
})(InjectedTextCursorStops || {});
var EndOfLinePreference = /* @__PURE__ */ ((EndOfLinePreference2) => {
  EndOfLinePreference2[EndOfLinePreference2["TextDefined"] = 0] = "TextDefined";
  EndOfLinePreference2[EndOfLinePreference2["LF"] = 1] = "LF";
  EndOfLinePreference2[EndOfLinePreference2["CRLF"] = 2] = "CRLF";
  return EndOfLinePreference2;
})(EndOfLinePreference || {});
var DefaultEndOfLine = /* @__PURE__ */ ((DefaultEndOfLine2) => {
  DefaultEndOfLine2[DefaultEndOfLine2["LF"] = 1] = "LF";
  DefaultEndOfLine2[DefaultEndOfLine2["CRLF"] = 2] = "CRLF";
  return DefaultEndOfLine2;
})(DefaultEndOfLine || {});
var EndOfLineSequence = /* @__PURE__ */ ((EndOfLineSequence2) => {
  EndOfLineSequence2[EndOfLineSequence2["LF"] = 0] = "LF";
  EndOfLineSequence2[EndOfLineSequence2["CRLF"] = 1] = "CRLF";
  return EndOfLineSequence2;
})(EndOfLineSequence || {});
class TextModelResolvedOptions {
  static {
    __name(this, "TextModelResolvedOptions");
  }
  _textModelResolvedOptionsBrand = void 0;
  tabSize;
  indentSize;
  _indentSizeIsTabSize;
  insertSpaces;
  defaultEOL;
  trimAutoWhitespace;
  bracketPairColorizationOptions;
  get originalIndentSize() {
    return this._indentSizeIsTabSize ? "tabSize" : this.indentSize;
  }
  /**
   * @internal
   */
  constructor(src) {
    this.tabSize = Math.max(1, src.tabSize | 0);
    if (src.indentSize === "tabSize") {
      this.indentSize = this.tabSize;
      this._indentSizeIsTabSize = true;
    } else {
      this.indentSize = Math.max(1, src.indentSize | 0);
      this._indentSizeIsTabSize = false;
    }
    this.insertSpaces = Boolean(src.insertSpaces);
    this.defaultEOL = src.defaultEOL | 0;
    this.trimAutoWhitespace = Boolean(src.trimAutoWhitespace);
    this.bracketPairColorizationOptions = src.bracketPairColorizationOptions;
  }
  /**
   * @internal
   */
  equals(other) {
    return this.tabSize === other.tabSize && this._indentSizeIsTabSize === other._indentSizeIsTabSize && this.indentSize === other.indentSize && this.insertSpaces === other.insertSpaces && this.defaultEOL === other.defaultEOL && this.trimAutoWhitespace === other.trimAutoWhitespace && equals(this.bracketPairColorizationOptions, other.bracketPairColorizationOptions);
  }
  /**
   * @internal
   */
  createChangeEvent(newOpts) {
    return {
      tabSize: this.tabSize !== newOpts.tabSize,
      indentSize: this.indentSize !== newOpts.indentSize,
      insertSpaces: this.insertSpaces !== newOpts.insertSpaces,
      trimAutoWhitespace: this.trimAutoWhitespace !== newOpts.trimAutoWhitespace
    };
  }
}
class FindMatch {
  static {
    __name(this, "FindMatch");
  }
  _findMatchBrand = void 0;
  range;
  matches;
  /**
   * @internal
   */
  constructor(range, matches) {
    this.range = range;
    this.matches = matches;
  }
}
var TrackedRangeStickiness = /* @__PURE__ */ ((TrackedRangeStickiness2) => {
  TrackedRangeStickiness2[TrackedRangeStickiness2["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
  TrackedRangeStickiness2[TrackedRangeStickiness2["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
  TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
  TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
  return TrackedRangeStickiness2;
})(TrackedRangeStickiness || {});
function isITextSnapshot(obj) {
  return obj && typeof obj.read === "function";
}
__name(isITextSnapshot, "isITextSnapshot");
function isITextModel(obj) {
  return Boolean(obj && obj.uri);
}
__name(isITextModel, "isITextModel");
var PositionAffinity = /* @__PURE__ */ ((PositionAffinity2) => {
  PositionAffinity2[PositionAffinity2["Left"] = 0] = "Left";
  PositionAffinity2[PositionAffinity2["Right"] = 1] = "Right";
  PositionAffinity2[PositionAffinity2["None"] = 2] = "None";
  PositionAffinity2[PositionAffinity2["LeftOfInjectedText"] = 3] = "LeftOfInjectedText";
  PositionAffinity2[PositionAffinity2["RightOfInjectedText"] = 4] = "RightOfInjectedText";
  return PositionAffinity2;
})(PositionAffinity || {});
var ModelConstants = /* @__PURE__ */ ((ModelConstants2) => {
  ModelConstants2[ModelConstants2["FIRST_LINE_DETECTION_LENGTH_LIMIT"] = 1e3] = "FIRST_LINE_DETECTION_LENGTH_LIMIT";
  return ModelConstants2;
})(ModelConstants || {});
class ValidAnnotatedEditOperation {
  constructor(identifier, range, text, forceMoveMarkers, isAutoWhitespaceEdit, _isTracked) {
    this.identifier = identifier;
    this.range = range;
    this.text = text;
    this.forceMoveMarkers = forceMoveMarkers;
    this.isAutoWhitespaceEdit = isAutoWhitespaceEdit;
    this._isTracked = _isTracked;
  }
  static {
    __name(this, "ValidAnnotatedEditOperation");
  }
}
class SearchData {
  static {
    __name(this, "SearchData");
  }
  /**
   * The regex to search for. Always defined.
   */
  regex;
  /**
   * The word separator classifier.
   */
  wordSeparators;
  /**
   * The simple string to search for (if possible).
   */
  simpleSearch;
  constructor(regex, wordSeparators, simpleSearch) {
    this.regex = regex;
    this.wordSeparators = wordSeparators;
    this.simpleSearch = simpleSearch;
  }
}
class ApplyEditsResult {
  constructor(reverseEdits, changes, trimAutoWhitespaceLineNumbers) {
    this.reverseEdits = reverseEdits;
    this.changes = changes;
    this.trimAutoWhitespaceLineNumbers = trimAutoWhitespaceLineNumbers;
  }
  static {
    __name(this, "ApplyEditsResult");
  }
}
function shouldSynchronizeModel(model) {
  return !model.isTooLargeForSyncing() && !model.isForSimpleWidget;
}
__name(shouldSynchronizeModel, "shouldSynchronizeModel");
export {
  ApplyEditsResult,
  DefaultEndOfLine,
  EndOfLinePreference,
  EndOfLineSequence,
  FindMatch,
  GlyphMarginLane,
  InjectedTextCursorStops,
  MinimapPosition,
  MinimapSectionHeaderStyle,
  ModelConstants,
  OverviewRulerLane,
  PositionAffinity,
  SearchData,
  TextModelResolvedOptions,
  TrackedRangeStickiness,
  ValidAnnotatedEditOperation,
  isITextModel,
  isITextSnapshot,
  shouldSynchronizeModel
};
//# sourceMappingURL=model.js.map
