var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../core/range.js";
import { Selection } from "../core/selection.js";
import { IPartialViewLinesViewportData, IViewModel, IViewWhitespaceViewportData, ViewLineRenderingData, ViewModelDecoration } from "../viewModel.js";
class ViewportData {
  static {
    __name(this, "ViewportData");
  }
  selections;
  /**
   * The line number at which to start rendering (inclusive).
   */
  startLineNumber;
  /**
   * The line number at which to end rendering (inclusive).
   */
  endLineNumber;
  /**
   * relativeVerticalOffset[i] is the `top` position for line at `i` + `startLineNumber`.
   */
  relativeVerticalOffset;
  /**
   * The viewport as a range (startLineNumber,1) -> (endLineNumber,maxColumn(endLineNumber)).
   */
  visibleRange;
  /**
   * Value to be substracted from `scrollTop` (in order to vertical offset numbers < 1MM)
   */
  bigNumbersDelta;
  /**
   * Positioning information about gaps whitespace.
   */
  whitespaceViewportData;
  _model;
  lineHeight;
  constructor(selections, partialData, whitespaceViewportData, model) {
    this.selections = selections;
    this.startLineNumber = partialData.startLineNumber | 0;
    this.endLineNumber = partialData.endLineNumber | 0;
    this.relativeVerticalOffset = partialData.relativeVerticalOffset;
    this.bigNumbersDelta = partialData.bigNumbersDelta | 0;
    this.lineHeight = partialData.lineHeight | 0;
    this.whitespaceViewportData = whitespaceViewportData;
    this._model = model;
    this.visibleRange = new Range(
      partialData.startLineNumber,
      this._model.getLineMinColumn(partialData.startLineNumber),
      partialData.endLineNumber,
      this._model.getLineMaxColumn(partialData.endLineNumber)
    );
  }
  getViewLineRenderingData(lineNumber) {
    return this._model.getViewportViewLineRenderingData(this.visibleRange, lineNumber);
  }
  getDecorationsInViewport() {
    return this._model.getDecorationsInViewport(this.visibleRange);
  }
}
export {
  ViewportData
};
//# sourceMappingURL=viewLinesViewportData.js.map
