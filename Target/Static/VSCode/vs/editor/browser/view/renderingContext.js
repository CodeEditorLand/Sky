var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Position } from "../../common/core/position.js";
import { Range } from "../../common/core/range.js";
import { ViewportData } from "../../common/viewLayout/viewLinesViewportData.js";
import { IViewLayout, ViewModelDecoration } from "../../common/viewModel.js";
class RestrictedRenderingContext {
  static {
    __name(this, "RestrictedRenderingContext");
  }
  _restrictedRenderingContextBrand = void 0;
  viewportData;
  scrollWidth;
  scrollHeight;
  visibleRange;
  bigNumbersDelta;
  scrollTop;
  scrollLeft;
  viewportWidth;
  viewportHeight;
  _viewLayout;
  constructor(viewLayout, viewportData) {
    this._viewLayout = viewLayout;
    this.viewportData = viewportData;
    this.scrollWidth = this._viewLayout.getScrollWidth();
    this.scrollHeight = this._viewLayout.getScrollHeight();
    this.visibleRange = this.viewportData.visibleRange;
    this.bigNumbersDelta = this.viewportData.bigNumbersDelta;
    const vInfo = this._viewLayout.getCurrentViewport();
    this.scrollTop = vInfo.top;
    this.scrollLeft = vInfo.left;
    this.viewportWidth = vInfo.width;
    this.viewportHeight = vInfo.height;
  }
  getScrolledTopFromAbsoluteTop(absoluteTop) {
    return absoluteTop - this.scrollTop;
  }
  getVerticalOffsetForLineNumber(lineNumber, includeViewZones) {
    return this._viewLayout.getVerticalOffsetForLineNumber(lineNumber, includeViewZones);
  }
  getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones) {
    return this._viewLayout.getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones);
  }
  getDecorationsInViewport() {
    return this.viewportData.getDecorationsInViewport();
  }
}
class RenderingContext extends RestrictedRenderingContext {
  static {
    __name(this, "RenderingContext");
  }
  _renderingContextBrand = void 0;
  _viewLines;
  _viewLinesGpu;
  constructor(viewLayout, viewportData, viewLines, viewLinesGpu) {
    super(viewLayout, viewportData);
    this._viewLines = viewLines;
    this._viewLinesGpu = viewLinesGpu;
  }
  linesVisibleRangesForRange(range, includeNewLines) {
    const domRanges = this._viewLines.linesVisibleRangesForRange(range, includeNewLines);
    if (!this._viewLinesGpu) {
      return domRanges ?? null;
    }
    const gpuRanges = this._viewLinesGpu.linesVisibleRangesForRange(range, includeNewLines);
    if (!domRanges) {
      return gpuRanges;
    }
    if (!gpuRanges) {
      return domRanges;
    }
    return domRanges.concat(gpuRanges).sort((a, b) => a.lineNumber - b.lineNumber);
  }
  visibleRangeForPosition(position) {
    return this._viewLines.visibleRangeForPosition(position) ?? this._viewLinesGpu?.visibleRangeForPosition(position) ?? null;
  }
}
class LineVisibleRanges {
  constructor(outsideRenderedLine, lineNumber, ranges, continuesOnNextLine) {
    this.outsideRenderedLine = outsideRenderedLine;
    this.lineNumber = lineNumber;
    this.ranges = ranges;
    this.continuesOnNextLine = continuesOnNextLine;
  }
  static {
    __name(this, "LineVisibleRanges");
  }
  /**
   * Returns the element with the smallest `lineNumber`.
   */
  static firstLine(ranges) {
    if (!ranges) {
      return null;
    }
    let result = null;
    for (const range of ranges) {
      if (!result || range.lineNumber < result.lineNumber) {
        result = range;
      }
    }
    return result;
  }
  /**
   * Returns the element with the largest `lineNumber`.
   */
  static lastLine(ranges) {
    if (!ranges) {
      return null;
    }
    let result = null;
    for (const range of ranges) {
      if (!result || range.lineNumber > result.lineNumber) {
        result = range;
      }
    }
    return result;
  }
}
class HorizontalRange {
  static {
    __name(this, "HorizontalRange");
  }
  _horizontalRangeBrand = void 0;
  left;
  width;
  static from(ranges) {
    const result = new Array(ranges.length);
    for (let i = 0, len = ranges.length; i < len; i++) {
      const range = ranges[i];
      result[i] = new HorizontalRange(range.left, range.width);
    }
    return result;
  }
  constructor(left, width) {
    this.left = Math.round(left);
    this.width = Math.round(width);
  }
  toString() {
    return `[${this.left},${this.width}]`;
  }
}
class FloatHorizontalRange {
  static {
    __name(this, "FloatHorizontalRange");
  }
  _floatHorizontalRangeBrand = void 0;
  left;
  width;
  constructor(left, width) {
    this.left = left;
    this.width = width;
  }
  toString() {
    return `[${this.left},${this.width}]`;
  }
  static compare(a, b) {
    return a.left - b.left;
  }
}
class HorizontalPosition {
  static {
    __name(this, "HorizontalPosition");
  }
  outsideRenderedLine;
  /**
   * Math.round(this.originalLeft)
   */
  left;
  originalLeft;
  constructor(outsideRenderedLine, left) {
    this.outsideRenderedLine = outsideRenderedLine;
    this.originalLeft = left;
    this.left = Math.round(this.originalLeft);
  }
}
class VisibleRanges {
  constructor(outsideRenderedLine, ranges) {
    this.outsideRenderedLine = outsideRenderedLine;
    this.ranges = ranges;
  }
  static {
    __name(this, "VisibleRanges");
  }
}
export {
  FloatHorizontalRange,
  HorizontalPosition,
  HorizontalRange,
  LineVisibleRanges,
  RenderingContext,
  RestrictedRenderingContext,
  VisibleRanges
};
//# sourceMappingURL=renderingContext.js.map
