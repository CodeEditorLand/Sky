var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getDomNodePagePosition, h } from "../../../../../../../base/browser/dom.js";
import { KeybindingLabel, unthemedKeybindingLabelOptions } from "../../../../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { numberComparator } from "../../../../../../../base/common/arrays.js";
import { findFirstMin } from "../../../../../../../base/common/arraysFind.js";
import { toDisposable } from "../../../../../../../base/common/lifecycle.js";
import { derived, derivedObservableWithCache, derivedOpts, observableValue, transaction } from "../../../../../../../base/common/observable.js";
import { OS } from "../../../../../../../base/common/platform.js";
import { getIndentationLength, splitLines } from "../../../../../../../base/common/strings.js";
import { URI } from "../../../../../../../base/common/uri.js";
import { MenuEntryActionViewItem } from "../../../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { OffsetRange } from "../../../../../../common/core/offsetRange.js";
import { Position } from "../../../../../../common/core/position.js";
import { Range } from "../../../../../../common/core/range.js";
import { SingleTextEdit, TextEdit } from "../../../../../../common/core/textEdit.js";
import { RangeMapping } from "../../../../../../common/diff/rangeMapping.js";
import { indentOfLine } from "../../../../../../common/model/textModel.js";
function maxContentWidthInRange(editor, range, reader) {
  editor.layoutInfo.read(reader);
  editor.value.read(reader);
  const model = editor.model.read(reader);
  if (!model) {
    return 0;
  }
  let maxContentWidth = 0;
  editor.scrollTop.read(reader);
  for (let i = range.startLineNumber; i < range.endLineNumberExclusive; i++) {
    const column = model.getLineMaxColumn(i);
    let lineContentWidth = editor.editor.getOffsetForColumn(i, column);
    if (lineContentWidth === -1) {
      const typicalHalfwidthCharacterWidth = editor.editor.getOption(
        52
        /* EditorOption.fontInfo */
      ).typicalHalfwidthCharacterWidth;
      const approximation = column * typicalHalfwidthCharacterWidth;
      lineContentWidth = approximation;
    }
    maxContentWidth = Math.max(maxContentWidth, lineContentWidth);
  }
  const lines = range.mapToLineArray((l) => model.getLineContent(l));
  if (maxContentWidth < 5 && lines.some((l) => l.length > 0) && model.uri.scheme !== "file") {
    console.error("unexpected width");
  }
  return maxContentWidth;
}
__name(maxContentWidthInRange, "maxContentWidthInRange");
function getOffsetForPos(editor, pos, reader) {
  editor.layoutInfo.read(reader);
  editor.value.read(reader);
  const model = editor.model.read(reader);
  if (!model) {
    return 0;
  }
  editor.scrollTop.read(reader);
  const lineContentWidth = editor.editor.getOffsetForColumn(pos.lineNumber, pos.column);
  return lineContentWidth;
}
__name(getOffsetForPos, "getOffsetForPos");
function getPrefixTrim(diffRanges, originalLinesRange, modifiedLines, editor) {
  const textModel = editor.getModel();
  if (!textModel) {
    return { prefixTrim: 0, prefixLeftOffset: 0 };
  }
  const replacementStart = diffRanges.map((r) => r.isSingleLine() ? r.startColumn - 1 : 0);
  const originalIndents = originalLinesRange.mapToLineArray((line) => indentOfLine(textModel.getLineContent(line)));
  const modifiedIndents = modifiedLines.filter((line) => line !== "").map((line) => indentOfLine(line));
  const prefixTrim = Math.min(...replacementStart, ...originalIndents, ...modifiedIndents);
  let prefixLeftOffset;
  const startLineIndent = textModel.getLineIndentColumn(originalLinesRange.startLineNumber);
  if (startLineIndent >= prefixTrim + 1) {
    prefixLeftOffset = editor.getOffsetForColumn(originalLinesRange.startLineNumber, prefixTrim + 1);
  } else if (modifiedLines.length > 0) {
    prefixLeftOffset = getContentRenderWidth(modifiedLines[0].slice(0, prefixTrim), editor, textModel);
  } else {
    return { prefixTrim: 0, prefixLeftOffset: 0 };
  }
  return { prefixTrim, prefixLeftOffset };
}
__name(getPrefixTrim, "getPrefixTrim");
function getContentRenderWidth(content, editor, textModel) {
  const w = editor.getOption(
    52
    /* EditorOption.fontInfo */
  ).typicalHalfwidthCharacterWidth;
  const tabSize = textModel.getOptions().tabSize * w;
  const numTabs = content.split("	").length - 1;
  const numNoneTabs = content.length - numTabs;
  return numNoneTabs * w + numTabs * tabSize;
}
__name(getContentRenderWidth, "getContentRenderWidth");
class StatusBarViewItem extends MenuEntryActionViewItem {
  static {
    __name(this, "StatusBarViewItem");
  }
  constructor() {
    super(...arguments);
    this._updateLabelListener = this._register(this._contextKeyService.onDidChangeContext(() => {
      this.updateLabel();
    }));
  }
  updateLabel() {
    const kb = this._keybindingService.lookupKeybinding(this._action.id, this._contextKeyService, true);
    if (!kb) {
      return super.updateLabel();
    }
    if (this.label) {
      const div = h("div.keybinding").root;
      const keybindingLabel = this._register(new KeybindingLabel(div, OS, { disableTitle: true, ...unthemedKeybindingLabelOptions }));
      keybindingLabel.set(kb);
      this.label.textContent = this._action.label;
      this.label.appendChild(div);
      this.label.classList.add("inlineSuggestionStatusBarItemLabel");
    }
  }
  updateTooltip() {
  }
}
class UniqueUriGenerator {
  static {
    __name(this, "UniqueUriGenerator");
  }
  static {
    this._modelId = 0;
  }
  constructor(scheme) {
    this.scheme = scheme;
  }
  getUniqueUri() {
    return URI.from({ scheme: this.scheme, path: (/* @__PURE__ */ new Date()).toString() + String(UniqueUriGenerator._modelId++) });
  }
}
function applyEditToModifiedRangeMappings(rangeMapping, edit) {
  const updatedMappings = [];
  for (const m of rangeMapping) {
    const updatedRange = edit.mapRange(m.modifiedRange);
    updatedMappings.push(new RangeMapping(m.originalRange, updatedRange));
  }
  return updatedMappings;
}
__name(applyEditToModifiedRangeMappings, "applyEditToModifiedRangeMappings");
function classNames(...classes) {
  return classes.filter((c) => typeof c === "string").join(" ");
}
__name(classNames, "classNames");
function offsetRangeToRange(columnOffsetRange, startPos) {
  return new Range(startPos.lineNumber, startPos.column + columnOffsetRange.start, startPos.lineNumber, startPos.column + columnOffsetRange.endExclusive);
}
__name(offsetRangeToRange, "offsetRangeToRange");
function createReindentEdit(text, range) {
  const newLines = splitLines(text);
  const edits = [];
  const minIndent = findFirstMin(range.mapToLineArray((l) => getIndentationLength(newLines[l - 1])), numberComparator);
  range.forEach((lineNumber) => {
    edits.push(new SingleTextEdit(offsetRangeToRange(new OffsetRange(0, minIndent), new Position(lineNumber, 1)), ""));
  });
  return new TextEdit(edits);
}
__name(createReindentEdit, "createReindentEdit");
class PathBuilder {
  static {
    __name(this, "PathBuilder");
  }
  constructor() {
    this._data = "";
  }
  moveTo(point) {
    this._data += `M ${point.x} ${point.y} `;
    return this;
  }
  lineTo(point) {
    this._data += `L ${point.x} ${point.y} `;
    return this;
  }
  curveTo(cp, to) {
    this._data += `Q ${cp.x} ${cp.y} ${to.x} ${to.y} `;
    return this;
  }
  curveTo2(cp1, cp2, to) {
    this._data += `C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${to.x} ${to.y} `;
    return this;
  }
  build() {
    return this._data;
  }
}
function createRectangle(layout, padding, borderRadius, options = {}) {
  const topLeftInner = layout.topLeft;
  const topRightInner = topLeftInner.deltaX(layout.width);
  const bottomLeftInner = topLeftInner.deltaY(layout.height);
  const bottomRightInner = bottomLeftInner.deltaX(layout.width);
  const { top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight } = typeof padding === "number" ? { top: padding, bottom: padding, left: padding, right: padding } : padding;
  const { topLeft: radiusTL, topRight: radiusTR, bottomLeft: radiusBL, bottomRight: radiusBR } = typeof borderRadius === "number" ? { topLeft: borderRadius, topRight: borderRadius, bottomLeft: borderRadius, bottomRight: borderRadius } : borderRadius;
  const totalHeight = layout.height + paddingTop + paddingBottom;
  const totalWidth = layout.width + paddingLeft + paddingRight;
  const topLeft = topLeftInner.deltaX(-paddingLeft).deltaY(-paddingTop);
  const topRight = topRightInner.deltaX(paddingRight).deltaY(-paddingTop);
  const topLeftBefore = topLeft.deltaY(Math.min(radiusTL, totalHeight / 2));
  const topLeftAfter = topLeft.deltaX(Math.min(radiusTL, totalWidth / 2));
  const topRightBefore = topRight.deltaX(-Math.min(radiusTR, totalWidth / 2));
  const topRightAfter = topRight.deltaY(Math.min(radiusTR, totalHeight / 2));
  const bottomLeft = bottomLeftInner.deltaX(-paddingLeft).deltaY(paddingBottom);
  const bottomRight = bottomRightInner.deltaX(paddingRight).deltaY(paddingBottom);
  const bottomLeftBefore = bottomLeft.deltaX(Math.min(radiusBL, totalWidth / 2));
  const bottomLeftAfter = bottomLeft.deltaY(-Math.min(radiusBL, totalHeight / 2));
  const bottomRightBefore = bottomRight.deltaY(-Math.min(radiusBR, totalHeight / 2));
  const bottomRightAfter = bottomRight.deltaX(-Math.min(radiusBR, totalWidth / 2));
  const path = new PathBuilder();
  if (!options.hideLeft) {
    path.moveTo(bottomLeftAfter).lineTo(topLeftBefore);
  }
  if (!options.hideLeft && !options.hideTop) {
    path.curveTo(topLeft, topLeftAfter);
  } else {
    path.moveTo(topLeftAfter);
  }
  if (!options.hideTop) {
    path.lineTo(topRightBefore);
  }
  if (!options.hideTop && !options.hideRight) {
    path.curveTo(topRight, topRightAfter);
  } else {
    path.moveTo(topRightAfter);
  }
  if (!options.hideRight) {
    path.lineTo(bottomRightBefore);
  }
  if (!options.hideRight && !options.hideBottom) {
    path.curveTo(bottomRight, bottomRightAfter);
  } else {
    path.moveTo(bottomRightAfter);
  }
  if (!options.hideBottom) {
    path.lineTo(bottomLeftBefore);
  }
  if (!options.hideBottom && !options.hideLeft) {
    path.curveTo(bottomLeft, bottomLeftAfter);
  } else {
    path.moveTo(bottomLeftAfter);
  }
  return path.build();
}
__name(createRectangle, "createRectangle");
function mapOutFalsy(obs) {
  const nonUndefinedObs = derivedObservableWithCache(void 0, (reader, lastValue) => obs.read(reader) || lastValue);
  return derivedOpts({
    debugName: /* @__PURE__ */ __name(() => `${obs.debugName}.mapOutFalsy`, "debugName")
  }, (reader) => {
    nonUndefinedObs.read(reader);
    const val = obs.read(reader);
    if (!val) {
      return void 0;
    }
    return nonUndefinedObs;
  });
}
__name(mapOutFalsy, "mapOutFalsy");
function observeElementPosition(element, store) {
  const topLeft = getDomNodePagePosition(element);
  const top = observableValue("top", topLeft.top);
  const left = observableValue("left", topLeft.left);
  const resizeObserver = new ResizeObserver(() => {
    transaction((tx) => {
      const topLeft2 = getDomNodePagePosition(element);
      top.set(topLeft2.top, tx);
      left.set(topLeft2.left, tx);
    });
  });
  resizeObserver.observe(element);
  store.add(toDisposable(() => resizeObserver.disconnect()));
  return {
    top,
    left
  };
}
__name(observeElementPosition, "observeElementPosition");
function rectToProps(fn) {
  return {
    left: derived((reader) => (
      /** @description left */
      fn(reader).left
    )),
    top: derived((reader) => (
      /** @description top */
      fn(reader).top
    )),
    width: derived((reader) => (
      /** @description width */
      fn(reader).right - fn(reader).left
    )),
    height: derived((reader) => (
      /** @description height */
      fn(reader).bottom - fn(reader).top
    ))
  };
}
__name(rectToProps, "rectToProps");
export {
  PathBuilder,
  StatusBarViewItem,
  UniqueUriGenerator,
  applyEditToModifiedRangeMappings,
  classNames,
  createRectangle,
  createReindentEdit,
  getContentRenderWidth,
  getOffsetForPos,
  getPrefixTrim,
  mapOutFalsy,
  maxContentWidthInRange,
  observeElementPosition,
  rectToProps
};
//# sourceMappingURL=utils.js.map
