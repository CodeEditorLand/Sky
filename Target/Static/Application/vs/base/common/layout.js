var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "./range.js";
var AnchorAlignment;
(function(AnchorAlignment2) {
  AnchorAlignment2[AnchorAlignment2["LEFT"] = 0] = "LEFT";
  AnchorAlignment2[AnchorAlignment2["RIGHT"] = 1] = "RIGHT";
})(AnchorAlignment || (AnchorAlignment = {}));
var AnchorPosition;
(function(AnchorPosition2) {
  AnchorPosition2[AnchorPosition2["BELOW"] = 0] = "BELOW";
  AnchorPosition2[AnchorPosition2["ABOVE"] = 1] = "ABOVE";
})(AnchorPosition || (AnchorPosition = {}));
var AnchorAxisAlignment;
(function(AnchorAxisAlignment2) {
  AnchorAxisAlignment2[AnchorAxisAlignment2["VERTICAL"] = 0] = "VERTICAL";
  AnchorAxisAlignment2[AnchorAxisAlignment2["HORIZONTAL"] = 1] = "HORIZONTAL";
})(AnchorAxisAlignment || (AnchorAxisAlignment = {}));
var LayoutAnchorPosition;
(function(LayoutAnchorPosition2) {
  LayoutAnchorPosition2[LayoutAnchorPosition2["Before"] = 0] = "Before";
  LayoutAnchorPosition2[LayoutAnchorPosition2["After"] = 1] = "After";
})(LayoutAnchorPosition || (LayoutAnchorPosition = {}));
var LayoutAnchorMode;
(function(LayoutAnchorMode2) {
  LayoutAnchorMode2[LayoutAnchorMode2["AVOID"] = 0] = "AVOID";
  LayoutAnchorMode2[LayoutAnchorMode2["ALIGN"] = 1] = "ALIGN";
})(LayoutAnchorMode || (LayoutAnchorMode = {}));
function layout(viewportSize, viewSize, anchor) {
  const layoutAfterAnchorBoundary = anchor.mode === LayoutAnchorMode.ALIGN ? anchor.offset : anchor.offset + anchor.size;
  const layoutBeforeAnchorBoundary = anchor.mode === LayoutAnchorMode.ALIGN ? anchor.offset + anchor.size : anchor.offset;
  if (anchor.position === 0) {
    if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
      return { position: layoutAfterAnchorBoundary, result: "ok" };
    }
    if (viewSize <= layoutBeforeAnchorBoundary) {
      return { position: layoutBeforeAnchorBoundary - viewSize, result: "flipped" };
    }
    return { position: Math.max(viewportSize - viewSize, 0), result: "overlap" };
  } else {
    if (viewSize <= layoutBeforeAnchorBoundary) {
      return { position: layoutBeforeAnchorBoundary - viewSize, result: "ok" };
    }
    if (viewSize <= viewportSize - layoutAfterAnchorBoundary && layoutBeforeAnchorBoundary < viewSize / 2) {
      return { position: layoutAfterAnchorBoundary, result: "flipped" };
    }
    return { position: 0, result: "overlap" };
  }
}
__name(layout, "layout");
function layout2d(viewport, view, anchor, options) {
  let anchorAlignment = options?.anchorAlignment ?? 0;
  let anchorPosition = options?.anchorPosition ?? 0;
  const anchorAxisAlignment = options?.anchorAxisAlignment ?? 0;
  let top;
  let left;
  if (anchorAxisAlignment === 0) {
    const verticalAnchor = {
      offset: anchor.top - viewport.top,
      size: anchor.height,
      position: anchorPosition === 0 ? 0 : 1
      /* LayoutAnchorPosition.After */
    };
    const horizontalAnchor = { offset: anchor.left, size: anchor.width, position: anchorAlignment === 0 ? 0 : 1, mode: LayoutAnchorMode.ALIGN };
    const verticalLayoutResult = layout(viewport.height, view.height, verticalAnchor);
    top = verticalLayoutResult.position + viewport.top;
    if (verticalLayoutResult.result === "flipped") {
      anchorPosition = anchorPosition === 0 ? 1 : 0;
    }
    if (Range.intersects({ start: top, end: top + view.height }, { start: verticalAnchor.offset, end: verticalAnchor.offset + verticalAnchor.size })) {
      horizontalAnchor.mode = LayoutAnchorMode.AVOID;
    }
    const horizontalLayoutResult = layout(viewport.width, view.width, horizontalAnchor);
    left = horizontalLayoutResult.position;
    if (horizontalLayoutResult.result === "flipped") {
      anchorAlignment = anchorAlignment === 0 ? 1 : 0;
    }
  } else {
    const horizontalAnchor = {
      offset: anchor.left,
      size: anchor.width,
      position: anchorAlignment === 0 ? 0 : 1
      /* LayoutAnchorPosition.After */
    };
    const verticalAnchor = { offset: anchor.top, size: anchor.height, position: anchorPosition === 0 ? 0 : 1, mode: LayoutAnchorMode.ALIGN };
    const horizontalLayoutResult = layout(viewport.width, view.width, horizontalAnchor);
    left = horizontalLayoutResult.position;
    if (horizontalLayoutResult.result === "flipped") {
      anchorAlignment = anchorAlignment === 0 ? 1 : 0;
    }
    if (Range.intersects({ start: left, end: left + view.width }, { start: horizontalAnchor.offset, end: horizontalAnchor.offset + horizontalAnchor.size })) {
      verticalAnchor.mode = LayoutAnchorMode.AVOID;
    }
    const verticalLayoutResult = layout(viewport.height, view.height, verticalAnchor);
    top = verticalLayoutResult.position + viewport.top;
    if (verticalLayoutResult.result === "flipped") {
      anchorPosition = anchorPosition === 0 ? 1 : 0;
    }
  }
  const right = viewport.width - (left + view.width);
  const bottom = viewport.height - (top + view.height);
  return { top, left, bottom, right, anchorAlignment, anchorPosition };
}
__name(layout2d, "layout2d");
export {
  AnchorAlignment,
  AnchorAxisAlignment,
  AnchorPosition,
  LayoutAnchorMode,
  LayoutAnchorPosition,
  layout,
  layout2d
};
//# sourceMappingURL=layout.js.map
