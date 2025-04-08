var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ScrollEvent } from "../../base/common/scrollable.js";
import { ConfigurationChangedEvent, EditorOption } from "./config/editorOptions.js";
import { Range } from "./core/range.js";
import { Selection } from "./core/selection.js";
import { CursorChangeReason } from "./cursorEvents.js";
import { ScrollType } from "./editorCommon.js";
import { IModelDecorationsChangedEvent } from "./textModelEvents.js";
import { IColorTheme } from "../../platform/theme/common/themeService.js";
var ViewEventType = /* @__PURE__ */ ((ViewEventType2) => {
  ViewEventType2[ViewEventType2["ViewCompositionStart"] = 0] = "ViewCompositionStart";
  ViewEventType2[ViewEventType2["ViewCompositionEnd"] = 1] = "ViewCompositionEnd";
  ViewEventType2[ViewEventType2["ViewConfigurationChanged"] = 2] = "ViewConfigurationChanged";
  ViewEventType2[ViewEventType2["ViewCursorStateChanged"] = 3] = "ViewCursorStateChanged";
  ViewEventType2[ViewEventType2["ViewDecorationsChanged"] = 4] = "ViewDecorationsChanged";
  ViewEventType2[ViewEventType2["ViewFlushed"] = 5] = "ViewFlushed";
  ViewEventType2[ViewEventType2["ViewFocusChanged"] = 6] = "ViewFocusChanged";
  ViewEventType2[ViewEventType2["ViewLanguageConfigurationChanged"] = 7] = "ViewLanguageConfigurationChanged";
  ViewEventType2[ViewEventType2["ViewLineMappingChanged"] = 8] = "ViewLineMappingChanged";
  ViewEventType2[ViewEventType2["ViewLinesChanged"] = 9] = "ViewLinesChanged";
  ViewEventType2[ViewEventType2["ViewLinesDeleted"] = 10] = "ViewLinesDeleted";
  ViewEventType2[ViewEventType2["ViewLinesInserted"] = 11] = "ViewLinesInserted";
  ViewEventType2[ViewEventType2["ViewRevealRangeRequest"] = 12] = "ViewRevealRangeRequest";
  ViewEventType2[ViewEventType2["ViewScrollChanged"] = 13] = "ViewScrollChanged";
  ViewEventType2[ViewEventType2["ViewThemeChanged"] = 14] = "ViewThemeChanged";
  ViewEventType2[ViewEventType2["ViewTokensChanged"] = 15] = "ViewTokensChanged";
  ViewEventType2[ViewEventType2["ViewTokensColorsChanged"] = 16] = "ViewTokensColorsChanged";
  ViewEventType2[ViewEventType2["ViewZonesChanged"] = 17] = "ViewZonesChanged";
  return ViewEventType2;
})(ViewEventType || {});
class ViewCompositionStartEvent {
  static {
    __name(this, "ViewCompositionStartEvent");
  }
  type = 0 /* ViewCompositionStart */;
  constructor() {
  }
}
class ViewCompositionEndEvent {
  static {
    __name(this, "ViewCompositionEndEvent");
  }
  type = 1 /* ViewCompositionEnd */;
  constructor() {
  }
}
class ViewConfigurationChangedEvent {
  static {
    __name(this, "ViewConfigurationChangedEvent");
  }
  type = 2 /* ViewConfigurationChanged */;
  _source;
  constructor(source) {
    this._source = source;
  }
  hasChanged(id) {
    return this._source.hasChanged(id);
  }
}
class ViewCursorStateChangedEvent {
  constructor(selections, modelSelections, reason) {
    this.selections = selections;
    this.modelSelections = modelSelections;
    this.reason = reason;
  }
  static {
    __name(this, "ViewCursorStateChangedEvent");
  }
  type = 3 /* ViewCursorStateChanged */;
}
class ViewDecorationsChangedEvent {
  static {
    __name(this, "ViewDecorationsChangedEvent");
  }
  type = 4 /* ViewDecorationsChanged */;
  affectsMinimap;
  affectsOverviewRuler;
  affectsGlyphMargin;
  affectsLineNumber;
  constructor(source) {
    if (source) {
      this.affectsMinimap = source.affectsMinimap;
      this.affectsOverviewRuler = source.affectsOverviewRuler;
      this.affectsGlyphMargin = source.affectsGlyphMargin;
      this.affectsLineNumber = source.affectsLineNumber;
    } else {
      this.affectsMinimap = true;
      this.affectsOverviewRuler = true;
      this.affectsGlyphMargin = true;
      this.affectsLineNumber = true;
    }
  }
}
class ViewFlushedEvent {
  static {
    __name(this, "ViewFlushedEvent");
  }
  type = 5 /* ViewFlushed */;
  constructor() {
  }
}
class ViewFocusChangedEvent {
  static {
    __name(this, "ViewFocusChangedEvent");
  }
  type = 6 /* ViewFocusChanged */;
  isFocused;
  constructor(isFocused) {
    this.isFocused = isFocused;
  }
}
class ViewLanguageConfigurationEvent {
  static {
    __name(this, "ViewLanguageConfigurationEvent");
  }
  type = 7 /* ViewLanguageConfigurationChanged */;
}
class ViewLineMappingChangedEvent {
  static {
    __name(this, "ViewLineMappingChangedEvent");
  }
  type = 8 /* ViewLineMappingChanged */;
  constructor() {
  }
}
class ViewLinesChangedEvent {
  constructor(fromLineNumber, count) {
    this.fromLineNumber = fromLineNumber;
    this.count = count;
  }
  static {
    __name(this, "ViewLinesChangedEvent");
  }
  type = 9 /* ViewLinesChanged */;
}
class ViewLinesDeletedEvent {
  static {
    __name(this, "ViewLinesDeletedEvent");
  }
  type = 10 /* ViewLinesDeleted */;
  /**
   * At what line the deletion began (inclusive).
   */
  fromLineNumber;
  /**
   * At what line the deletion stopped (inclusive).
   */
  toLineNumber;
  constructor(fromLineNumber, toLineNumber) {
    this.fromLineNumber = fromLineNumber;
    this.toLineNumber = toLineNumber;
  }
}
class ViewLinesInsertedEvent {
  static {
    __name(this, "ViewLinesInsertedEvent");
  }
  type = 11 /* ViewLinesInserted */;
  /**
   * Before what line did the insertion begin
   */
  fromLineNumber;
  /**
   * `toLineNumber` - `fromLineNumber` + 1 denotes the number of lines that were inserted
   */
  toLineNumber;
  constructor(fromLineNumber, toLineNumber) {
    this.fromLineNumber = fromLineNumber;
    this.toLineNumber = toLineNumber;
  }
}
var VerticalRevealType = /* @__PURE__ */ ((VerticalRevealType2) => {
  VerticalRevealType2[VerticalRevealType2["Simple"] = 0] = "Simple";
  VerticalRevealType2[VerticalRevealType2["Center"] = 1] = "Center";
  VerticalRevealType2[VerticalRevealType2["CenterIfOutsideViewport"] = 2] = "CenterIfOutsideViewport";
  VerticalRevealType2[VerticalRevealType2["Top"] = 3] = "Top";
  VerticalRevealType2[VerticalRevealType2["Bottom"] = 4] = "Bottom";
  VerticalRevealType2[VerticalRevealType2["NearTop"] = 5] = "NearTop";
  VerticalRevealType2[VerticalRevealType2["NearTopIfOutsideViewport"] = 6] = "NearTopIfOutsideViewport";
  return VerticalRevealType2;
})(VerticalRevealType || {});
class ViewRevealRangeRequestEvent {
  constructor(source, minimalReveal, range, selections, verticalType, revealHorizontal, scrollType) {
    this.source = source;
    this.minimalReveal = minimalReveal;
    this.range = range;
    this.selections = selections;
    this.verticalType = verticalType;
    this.revealHorizontal = revealHorizontal;
    this.scrollType = scrollType;
  }
  static {
    __name(this, "ViewRevealRangeRequestEvent");
  }
  type = 12 /* ViewRevealRangeRequest */;
}
class ViewScrollChangedEvent {
  static {
    __name(this, "ViewScrollChangedEvent");
  }
  type = 13 /* ViewScrollChanged */;
  scrollWidth;
  scrollLeft;
  scrollHeight;
  scrollTop;
  scrollWidthChanged;
  scrollLeftChanged;
  scrollHeightChanged;
  scrollTopChanged;
  constructor(source) {
    this.scrollWidth = source.scrollWidth;
    this.scrollLeft = source.scrollLeft;
    this.scrollHeight = source.scrollHeight;
    this.scrollTop = source.scrollTop;
    this.scrollWidthChanged = source.scrollWidthChanged;
    this.scrollLeftChanged = source.scrollLeftChanged;
    this.scrollHeightChanged = source.scrollHeightChanged;
    this.scrollTopChanged = source.scrollTopChanged;
  }
}
class ViewThemeChangedEvent {
  constructor(theme) {
    this.theme = theme;
  }
  static {
    __name(this, "ViewThemeChangedEvent");
  }
  type = 14 /* ViewThemeChanged */;
}
class ViewTokensChangedEvent {
  static {
    __name(this, "ViewTokensChangedEvent");
  }
  type = 15 /* ViewTokensChanged */;
  ranges;
  constructor(ranges) {
    this.ranges = ranges;
  }
}
class ViewTokensColorsChangedEvent {
  static {
    __name(this, "ViewTokensColorsChangedEvent");
  }
  type = 16 /* ViewTokensColorsChanged */;
  constructor() {
  }
}
class ViewZonesChangedEvent {
  static {
    __name(this, "ViewZonesChangedEvent");
  }
  type = 17 /* ViewZonesChanged */;
  constructor() {
  }
}
export {
  VerticalRevealType,
  ViewCompositionEndEvent,
  ViewCompositionStartEvent,
  ViewConfigurationChangedEvent,
  ViewCursorStateChangedEvent,
  ViewDecorationsChangedEvent,
  ViewEventType,
  ViewFlushedEvent,
  ViewFocusChangedEvent,
  ViewLanguageConfigurationEvent,
  ViewLineMappingChangedEvent,
  ViewLinesChangedEvent,
  ViewLinesDeletedEvent,
  ViewLinesInsertedEvent,
  ViewRevealRangeRequestEvent,
  ViewScrollChangedEvent,
  ViewThemeChangedEvent,
  ViewTokensChangedEvent,
  ViewTokensColorsChangedEvent,
  ViewZonesChangedEvent
};
//# sourceMappingURL=viewEvents.js.map
