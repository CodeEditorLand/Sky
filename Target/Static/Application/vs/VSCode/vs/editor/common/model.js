var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../base/common/objects.js";
var OverviewRulerLane;
(function(OverviewRulerLane2) {
  OverviewRulerLane2[OverviewRulerLane2["Left"] = 1] = "Left";
  OverviewRulerLane2[OverviewRulerLane2["Center"] = 2] = "Center";
  OverviewRulerLane2[OverviewRulerLane2["Right"] = 4] = "Right";
  OverviewRulerLane2[OverviewRulerLane2["Full"] = 7] = "Full";
})(OverviewRulerLane || (OverviewRulerLane = {}));
var GlyphMarginLane;
(function(GlyphMarginLane2) {
  GlyphMarginLane2[GlyphMarginLane2["Left"] = 1] = "Left";
  GlyphMarginLane2[GlyphMarginLane2["Center"] = 2] = "Center";
  GlyphMarginLane2[GlyphMarginLane2["Right"] = 3] = "Right";
})(GlyphMarginLane || (GlyphMarginLane = {}));
var MinimapPosition;
(function(MinimapPosition2) {
  MinimapPosition2[MinimapPosition2["Inline"] = 1] = "Inline";
  MinimapPosition2[MinimapPosition2["Gutter"] = 2] = "Gutter";
})(MinimapPosition || (MinimapPosition = {}));
var MinimapSectionHeaderStyle;
(function(MinimapSectionHeaderStyle2) {
  MinimapSectionHeaderStyle2[MinimapSectionHeaderStyle2["Normal"] = 1] = "Normal";
  MinimapSectionHeaderStyle2[MinimapSectionHeaderStyle2["Underlined"] = 2] = "Underlined";
})(MinimapSectionHeaderStyle || (MinimapSectionHeaderStyle = {}));
var TextDirection;
(function(TextDirection2) {
  TextDirection2[TextDirection2["LTR"] = 0] = "LTR";
  TextDirection2[TextDirection2["RTL"] = 1] = "RTL";
})(TextDirection || (TextDirection = {}));
var InjectedTextCursorStops;
(function(InjectedTextCursorStops2) {
  InjectedTextCursorStops2[InjectedTextCursorStops2["Both"] = 0] = "Both";
  InjectedTextCursorStops2[InjectedTextCursorStops2["Right"] = 1] = "Right";
  InjectedTextCursorStops2[InjectedTextCursorStops2["Left"] = 2] = "Left";
  InjectedTextCursorStops2[InjectedTextCursorStops2["None"] = 3] = "None";
})(InjectedTextCursorStops || (InjectedTextCursorStops = {}));
var EndOfLinePreference;
(function(EndOfLinePreference2) {
  EndOfLinePreference2[EndOfLinePreference2["TextDefined"] = 0] = "TextDefined";
  EndOfLinePreference2[EndOfLinePreference2["LF"] = 1] = "LF";
  EndOfLinePreference2[EndOfLinePreference2["CRLF"] = 2] = "CRLF";
})(EndOfLinePreference || (EndOfLinePreference = {}));
var DefaultEndOfLine;
(function(DefaultEndOfLine2) {
  DefaultEndOfLine2[DefaultEndOfLine2["LF"] = 1] = "LF";
  DefaultEndOfLine2[DefaultEndOfLine2["CRLF"] = 2] = "CRLF";
})(DefaultEndOfLine || (DefaultEndOfLine = {}));
var EndOfLineSequence;
(function(EndOfLineSequence2) {
  EndOfLineSequence2[EndOfLineSequence2["LF"] = 0] = "LF";
  EndOfLineSequence2[EndOfLineSequence2["CRLF"] = 1] = "CRLF";
})(EndOfLineSequence || (EndOfLineSequence = {}));
class TextModelResolvedOptions {
  static {
    __name(this, "TextModelResolvedOptions");
  }
  get originalIndentSize() {
    return this._indentSizeIsTabSize ? "tabSize" : this.indentSize;
  }
  /**
   * @internal
   */
  constructor(src) {
    this._textModelResolvedOptionsBrand = void 0;
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
  /**
   * @internal
   */
  constructor(range, matches) {
    this._findMatchBrand = void 0;
    this.range = range;
    this.matches = matches;
  }
}
var TrackedRangeStickiness;
(function(TrackedRangeStickiness2) {
  TrackedRangeStickiness2[TrackedRangeStickiness2["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
  TrackedRangeStickiness2[TrackedRangeStickiness2["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
  TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
  TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
})(TrackedRangeStickiness || (TrackedRangeStickiness = {}));
function isITextSnapshot(obj) {
  return !!obj && typeof obj.read === "function";
}
__name(isITextSnapshot, "isITextSnapshot");
function isITextModel(obj) {
  return Boolean(obj && obj.uri);
}
__name(isITextModel, "isITextModel");
var PositionAffinity;
(function(PositionAffinity2) {
  PositionAffinity2[PositionAffinity2["Left"] = 0] = "Left";
  PositionAffinity2[PositionAffinity2["Right"] = 1] = "Right";
  PositionAffinity2[PositionAffinity2["None"] = 2] = "None";
  PositionAffinity2[PositionAffinity2["LeftOfInjectedText"] = 3] = "LeftOfInjectedText";
  PositionAffinity2[PositionAffinity2["RightOfInjectedText"] = 4] = "RightOfInjectedText";
})(PositionAffinity || (PositionAffinity = {}));
var ModelConstants;
(function(ModelConstants2) {
  ModelConstants2[ModelConstants2["FIRST_LINE_DETECTION_LENGTH_LIMIT"] = 1e3] = "FIRST_LINE_DETECTION_LENGTH_LIMIT";
})(ModelConstants || (ModelConstants = {}));
class ValidAnnotatedEditOperation {
  static {
    __name(this, "ValidAnnotatedEditOperation");
  }
  constructor(identifier, range, text, forceMoveMarkers, isAutoWhitespaceEdit, _isTracked) {
    this.identifier = identifier;
    this.range = range;
    this.text = text;
    this.forceMoveMarkers = forceMoveMarkers;
    this.isAutoWhitespaceEdit = isAutoWhitespaceEdit;
    this._isTracked = _isTracked;
  }
}
class SearchData {
  static {
    __name(this, "SearchData");
  }
  constructor(regex, wordSeparators, simpleSearch) {
    this.regex = regex;
    this.wordSeparators = wordSeparators;
    this.simpleSearch = simpleSearch;
  }
}
class ApplyEditsResult {
  static {
    __name(this, "ApplyEditsResult");
  }
  constructor(reverseEdits, changes, trimAutoWhitespaceLineNumbers) {
    this.reverseEdits = reverseEdits;
    this.changes = changes;
    this.trimAutoWhitespaceLineNumbers = trimAutoWhitespaceLineNumbers;
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
  TextDirection,
  TextModelResolvedOptions,
  TrackedRangeStickiness,
  ValidAnnotatedEditOperation,
  isITextModel,
  isITextSnapshot,
  shouldSynchronizeModel
};
//# sourceMappingURL=model.js.map
