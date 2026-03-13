var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var ViewEventType;
(function(ViewEventType2) {
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
})(ViewEventType || (ViewEventType = {}));
class ViewCompositionStartEvent {
  static {
    __name(this, "ViewCompositionStartEvent");
  }
  constructor() {
    this.type = 0;
  }
}
class ViewCompositionEndEvent {
  static {
    __name(this, "ViewCompositionEndEvent");
  }
  constructor() {
    this.type = 1;
  }
}
class ViewConfigurationChangedEvent {
  static {
    __name(this, "ViewConfigurationChangedEvent");
  }
  constructor(source) {
    this.type = 2;
    this._source = source;
  }
  hasChanged(id) {
    return this._source.hasChanged(id);
  }
}
class ViewCursorStateChangedEvent {
  static {
    __name(this, "ViewCursorStateChangedEvent");
  }
  constructor(selections, modelSelections, reason) {
    this.selections = selections;
    this.modelSelections = modelSelections;
    this.reason = reason;
    this.type = 3;
  }
}
class ViewDecorationsChangedEvent {
  static {
    __name(this, "ViewDecorationsChangedEvent");
  }
  constructor(source) {
    this.type = 4;
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
  constructor() {
    this.type = 5;
  }
}
class ViewFocusChangedEvent {
  static {
    __name(this, "ViewFocusChangedEvent");
  }
  constructor(isFocused) {
    this.type = 6;
    this.isFocused = isFocused;
  }
}
class ViewLanguageConfigurationEvent {
  static {
    __name(this, "ViewLanguageConfigurationEvent");
  }
  constructor() {
    this.type = 7;
  }
}
class ViewLineMappingChangedEvent {
  static {
    __name(this, "ViewLineMappingChangedEvent");
  }
  constructor() {
    this.type = 8;
  }
}
class ViewLinesChangedEvent {
  static {
    __name(this, "ViewLinesChangedEvent");
  }
  constructor(fromLineNumber, count) {
    this.fromLineNumber = fromLineNumber;
    this.count = count;
    this.type = 9;
  }
}
class ViewLinesDeletedEvent {
  static {
    __name(this, "ViewLinesDeletedEvent");
  }
  constructor(fromLineNumber, toLineNumber) {
    this.type = 10;
    this.fromLineNumber = fromLineNumber;
    this.toLineNumber = toLineNumber;
  }
}
class ViewLinesInsertedEvent {
  static {
    __name(this, "ViewLinesInsertedEvent");
  }
  constructor(fromLineNumber, toLineNumber) {
    this.type = 11;
    this.fromLineNumber = fromLineNumber;
    this.toLineNumber = toLineNumber;
  }
}
var VerticalRevealType;
(function(VerticalRevealType2) {
  VerticalRevealType2[VerticalRevealType2["Simple"] = 0] = "Simple";
  VerticalRevealType2[VerticalRevealType2["Center"] = 1] = "Center";
  VerticalRevealType2[VerticalRevealType2["CenterIfOutsideViewport"] = 2] = "CenterIfOutsideViewport";
  VerticalRevealType2[VerticalRevealType2["Top"] = 3] = "Top";
  VerticalRevealType2[VerticalRevealType2["Bottom"] = 4] = "Bottom";
  VerticalRevealType2[VerticalRevealType2["NearTop"] = 5] = "NearTop";
  VerticalRevealType2[VerticalRevealType2["NearTopIfOutsideViewport"] = 6] = "NearTopIfOutsideViewport";
})(VerticalRevealType || (VerticalRevealType = {}));
class ViewRevealRangeRequestEvent {
  static {
    __name(this, "ViewRevealRangeRequestEvent");
  }
  constructor(source, minimalReveal, range, selections, verticalType, revealHorizontal, scrollType) {
    this.source = source;
    this.minimalReveal = minimalReveal;
    this.range = range;
    this.selections = selections;
    this.verticalType = verticalType;
    this.revealHorizontal = revealHorizontal;
    this.scrollType = scrollType;
    this.type = 12;
  }
}
class ViewScrollChangedEvent {
  static {
    __name(this, "ViewScrollChangedEvent");
  }
  constructor(source) {
    this.type = 13;
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
  static {
    __name(this, "ViewThemeChangedEvent");
  }
  constructor(theme) {
    this.theme = theme;
    this.type = 14;
  }
}
class ViewTokensChangedEvent {
  static {
    __name(this, "ViewTokensChangedEvent");
  }
  constructor(ranges) {
    this.type = 15;
    this.ranges = ranges;
  }
}
class ViewTokensColorsChangedEvent {
  static {
    __name(this, "ViewTokensColorsChangedEvent");
  }
  constructor() {
    this.type = 16;
  }
}
class ViewZonesChangedEvent {
  static {
    __name(this, "ViewZonesChangedEvent");
  }
  constructor() {
    this.type = 17;
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
