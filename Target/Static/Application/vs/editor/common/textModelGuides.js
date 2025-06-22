var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var HorizontalGuidesState;
(function(HorizontalGuidesState2) {
  HorizontalGuidesState2[HorizontalGuidesState2["Disabled"] = 0] = "Disabled";
  HorizontalGuidesState2[HorizontalGuidesState2["EnabledForActive"] = 1] = "EnabledForActive";
  HorizontalGuidesState2[HorizontalGuidesState2["Enabled"] = 2] = "Enabled";
})(HorizontalGuidesState || (HorizontalGuidesState = {}));
class IndentGuide {
  static {
    __name(this, "IndentGuide");
  }
  constructor(visibleColumn, column, className, horizontalLine, forWrappedLinesAfterColumn, forWrappedLinesBeforeOrAtColumn) {
    this.visibleColumn = visibleColumn;
    this.column = column;
    this.className = className;
    this.horizontalLine = horizontalLine;
    this.forWrappedLinesAfterColumn = forWrappedLinesAfterColumn;
    this.forWrappedLinesBeforeOrAtColumn = forWrappedLinesBeforeOrAtColumn;
    if (visibleColumn !== -1 === (column !== -1)) {
      throw new Error();
    }
  }
}
class IndentGuideHorizontalLine {
  static {
    __name(this, "IndentGuideHorizontalLine");
  }
  constructor(top, endColumn) {
    this.top = top;
    this.endColumn = endColumn;
  }
}
export {
  HorizontalGuidesState,
  IndentGuide,
  IndentGuideHorizontalLine
};
//# sourceMappingURL=textModelGuides.js.map
