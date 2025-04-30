var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../base/common/arrays.js";
import { assert, assertFn, checkAdjacentItems } from "../../../base/common/assert.js";
import { BugIndicatingError } from "../../../base/common/errors.js";
import { commonPrefixLength, commonSuffixLength, splitLines } from "../../../base/common/strings.js";
import { Position } from "./position.js";
import { PositionOffsetTransformer } from "./positionToOffset.js";
import { Range } from "./range.js";
import { TextLength } from "./textLength.js";
class TextEdit {
  static {
    __name(this, "TextEdit");
  }
  static fromOffsetEdit(edit, initialState) {
    const edits = edit.edits.map((e) => new SingleTextEdit(initialState.getTransformer().getRange(e.replaceRange), e.newText));
    return new TextEdit(edits);
  }
  static single(originalRange, newText) {
    return new TextEdit([new SingleTextEdit(originalRange, newText)]);
  }
  static insert(position, newText) {
    return new TextEdit([new SingleTextEdit(Range.fromPositions(position, position), newText)]);
  }
  constructor(edits) {
    this.edits = edits;
    assertFn(() => checkAdjacentItems(edits, (a, b) => a.range.getEndPosition().isBeforeOrEqual(b.range.getStartPosition())));
  }
  /**
   * Joins touching edits and removes empty edits.
   */
  normalize() {
    const edits = [];
    for (const edit of this.edits) {
      if (edits.length > 0 && edits[edits.length - 1].range.getEndPosition().equals(edit.range.getStartPosition())) {
        const last = edits[edits.length - 1];
        edits[edits.length - 1] = new SingleTextEdit(last.range.plusRange(edit.range), last.text + edit.text);
      } else if (!edit.isEmpty) {
        edits.push(edit);
      }
    }
    return new TextEdit(edits);
  }
  mapPosition(position) {
    let lineDelta = 0;
    let curLine = 0;
    let columnDeltaInCurLine = 0;
    for (const edit of this.edits) {
      const start = edit.range.getStartPosition();
      if (position.isBeforeOrEqual(start)) {
        break;
      }
      const end = edit.range.getEndPosition();
      const len = TextLength.ofText(edit.text);
      if (position.isBefore(end)) {
        const startPos = new Position(start.lineNumber + lineDelta, start.column + (start.lineNumber + lineDelta === curLine ? columnDeltaInCurLine : 0));
        const endPos = len.addToPosition(startPos);
        return rangeFromPositions(startPos, endPos);
      }
      if (start.lineNumber + lineDelta !== curLine) {
        columnDeltaInCurLine = 0;
      }
      lineDelta += len.lineCount - (edit.range.endLineNumber - edit.range.startLineNumber);
      if (len.lineCount === 0) {
        if (end.lineNumber !== start.lineNumber) {
          columnDeltaInCurLine += len.columnCount - (end.column - 1);
        } else {
          columnDeltaInCurLine += len.columnCount - (end.column - start.column);
        }
      } else {
        columnDeltaInCurLine = len.columnCount;
      }
      curLine = end.lineNumber + lineDelta;
    }
    return new Position(position.lineNumber + lineDelta, position.column + (position.lineNumber + lineDelta === curLine ? columnDeltaInCurLine : 0));
  }
  mapRange(range) {
    function getStart(p) {
      return p instanceof Position ? p : p.getStartPosition();
    }
    __name(getStart, "getStart");
    function getEnd(p) {
      return p instanceof Position ? p : p.getEndPosition();
    }
    __name(getEnd, "getEnd");
    const start = getStart(this.mapPosition(range.getStartPosition()));
    const end = getEnd(this.mapPosition(range.getEndPosition()));
    return rangeFromPositions(start, end);
  }
  // TODO: `doc` is not needed for this!
  inverseMapPosition(positionAfterEdit, doc) {
    const reversed = this.inverse(doc);
    return reversed.mapPosition(positionAfterEdit);
  }
  inverseMapRange(range, doc) {
    const reversed = this.inverse(doc);
    return reversed.mapRange(range);
  }
  apply(text) {
    let result = "";
    let lastEditEnd = new Position(1, 1);
    for (const edit of this.edits) {
      const editRange = edit.range;
      const editStart = editRange.getStartPosition();
      const editEnd = editRange.getEndPosition();
      const r2 = rangeFromPositions(lastEditEnd, editStart);
      if (!r2.isEmpty()) {
        result += text.getValueOfRange(r2);
      }
      result += edit.text;
      lastEditEnd = editEnd;
    }
    const r = rangeFromPositions(lastEditEnd, text.endPositionExclusive);
    if (!r.isEmpty()) {
      result += text.getValueOfRange(r);
    }
    return result;
  }
  applyToString(str) {
    const strText = new StringText(str);
    return this.apply(strText);
  }
  inverse(doc) {
    const ranges = this.getNewRanges();
    return new TextEdit(this.edits.map((e, idx) => new SingleTextEdit(ranges[idx], doc.getValueOfRange(e.range))));
  }
  getNewRanges() {
    const newRanges = [];
    let previousEditEndLineNumber = 0;
    let lineOffset = 0;
    let columnOffset = 0;
    for (const edit of this.edits) {
      const textLength = TextLength.ofText(edit.text);
      const newRangeStart = Position.lift({
        lineNumber: edit.range.startLineNumber + lineOffset,
        column: edit.range.startColumn + (edit.range.startLineNumber === previousEditEndLineNumber ? columnOffset : 0)
      });
      const newRange = textLength.createRange(newRangeStart);
      newRanges.push(newRange);
      lineOffset = newRange.endLineNumber - edit.range.endLineNumber;
      columnOffset = newRange.endColumn - edit.range.endColumn;
      previousEditEndLineNumber = edit.range.endLineNumber;
    }
    return newRanges;
  }
  toSingle(text) {
    if (this.edits.length === 0) {
      throw new BugIndicatingError();
    }
    if (this.edits.length === 1) {
      return this.edits[0];
    }
    const startPos = this.edits[0].range.getStartPosition();
    const endPos = this.edits[this.edits.length - 1].range.getEndPosition();
    let newText = "";
    for (let i = 0; i < this.edits.length; i++) {
      const curEdit = this.edits[i];
      newText += curEdit.text;
      if (i < this.edits.length - 1) {
        const nextEdit = this.edits[i + 1];
        const gapRange = Range.fromPositions(curEdit.range.getEndPosition(), nextEdit.range.getStartPosition());
        const gapText = text.getValueOfRange(gapRange);
        newText += gapText;
      }
    }
    return new SingleTextEdit(Range.fromPositions(startPos, endPos), newText);
  }
  equals(other) {
    return equals(this.edits, other.edits, (a, b) => a.equals(b));
  }
  toString(text) {
    if (text === void 0) {
      return this.edits.map((edit) => edit.toString()).join("\n");
    }
    if (typeof text === "string") {
      return this.toString(new StringText(text));
    }
    if (this.edits.length === 0) {
      return "";
    }
    return this.edits.map((edit) => {
      const maxLength = 10;
      const originalText = text.getValueOfRange(edit.range);
      const beforeRange = Range.fromPositions(new Position(Math.max(1, edit.range.startLineNumber - 1), 1), edit.range.getStartPosition());
      let beforeText = text.getValueOfRange(beforeRange);
      if (beforeText.length > maxLength) {
        beforeText = "..." + beforeText.substring(beforeText.length - maxLength);
      }
      const afterRange = Range.fromPositions(edit.range.getEndPosition(), new Position(edit.range.endLineNumber + 1, 1));
      let afterText = text.getValueOfRange(afterRange);
      if (afterText.length > maxLength) {
        afterText = afterText.substring(0, maxLength) + "...";
      }
      let replacedText = originalText;
      if (replacedText.length > maxLength) {
        const halfMax = Math.floor(maxLength / 2);
        replacedText = replacedText.substring(0, halfMax) + "..." + replacedText.substring(replacedText.length - halfMax);
      }
      let newText = edit.text;
      if (newText.length > maxLength) {
        const halfMax = Math.floor(maxLength / 2);
        newText = newText.substring(0, halfMax) + "..." + newText.substring(newText.length - halfMax);
      }
      if (replacedText.length === 0) {
        return `${beforeText}\u2770${newText}\u2771${afterText}`;
      }
      return `${beforeText}\u2770${replacedText}\u21A6${newText}\u2771${afterText}`;
    }).join("\n");
  }
}
class SingleTextEdit {
  static {
    __name(this, "SingleTextEdit");
  }
  static joinEdits(edits, initialValue) {
    if (edits.length === 0) {
      throw new BugIndicatingError();
    }
    if (edits.length === 1) {
      return edits[0];
    }
    const startPos = edits[0].range.getStartPosition();
    const endPos = edits[edits.length - 1].range.getEndPosition();
    let newText = "";
    for (let i = 0; i < edits.length; i++) {
      const curEdit = edits[i];
      newText += curEdit.text;
      if (i < edits.length - 1) {
        const nextEdit = edits[i + 1];
        const gapRange = Range.fromPositions(curEdit.range.getEndPosition(), nextEdit.range.getStartPosition());
        const gapText = initialValue.getValueOfRange(gapRange);
        newText += gapText;
      }
    }
    return new SingleTextEdit(Range.fromPositions(startPos, endPos), newText);
  }
  constructor(range, text) {
    this.range = range;
    this.text = text;
  }
  get isEmpty() {
    return this.range.isEmpty() && this.text.length === 0;
  }
  static equals(first, second) {
    return first.range.equalsRange(second.range) && first.text === second.text;
  }
  toSingleEditOperation() {
    return {
      range: this.range,
      text: this.text
    };
  }
  toEdit() {
    return new TextEdit([this]);
  }
  equals(other) {
    return SingleTextEdit.equals(this, other);
  }
  extendToCoverRange(range, initialValue) {
    if (this.range.containsRange(range)) {
      return this;
    }
    const newRange = this.range.plusRange(range);
    const textBefore = initialValue.getValueOfRange(Range.fromPositions(newRange.getStartPosition(), this.range.getStartPosition()));
    const textAfter = initialValue.getValueOfRange(Range.fromPositions(this.range.getEndPosition(), newRange.getEndPosition()));
    const newText = textBefore + this.text + textAfter;
    return new SingleTextEdit(newRange, newText);
  }
  extendToFullLine(initialValue) {
    const newRange = new Range(this.range.startLineNumber, 1, this.range.endLineNumber, initialValue.getTransformer().getLineLength(this.range.endLineNumber) + 1);
    return this.extendToCoverRange(newRange, initialValue);
  }
  removeCommonPrefix(text) {
    const normalizedOriginalText = text.getValueOfRange(this.range).replaceAll("\r\n", "\n");
    const normalizedModifiedText = this.text.replaceAll("\r\n", "\n");
    const commonPrefixLen = commonPrefixLength(normalizedOriginalText, normalizedModifiedText);
    const start = TextLength.ofText(normalizedOriginalText.substring(0, commonPrefixLen)).addToPosition(this.range.getStartPosition());
    const newText = normalizedModifiedText.substring(commonPrefixLen);
    const range = Range.fromPositions(start, this.range.getEndPosition());
    return new SingleTextEdit(range, newText);
  }
  isEffectiveDeletion(text) {
    let newText = this.text.replaceAll("\r\n", "\n");
    let existingText = text.getValueOfRange(this.range).replaceAll("\r\n", "\n");
    const l = commonPrefixLength(newText, existingText);
    newText = newText.substring(l);
    existingText = existingText.substring(l);
    const r = commonSuffixLength(newText, existingText);
    newText = newText.substring(0, newText.length - r);
    existingText = existingText.substring(0, existingText.length - r);
    return newText === "";
  }
}
function rangeFromPositions(start, end) {
  if (start.lineNumber === end.lineNumber && start.column === Number.MAX_SAFE_INTEGER) {
    return Range.fromPositions(end, end);
  } else if (!start.isBeforeOrEqual(end)) {
    throw new BugIndicatingError("start must be before end");
  }
  return new Range(start.lineNumber, start.column, end.lineNumber, end.column);
}
__name(rangeFromPositions, "rangeFromPositions");
class AbstractText {
  static {
    __name(this, "AbstractText");
  }
  constructor() {
    this._transformer = void 0;
  }
  get endPositionExclusive() {
    return this.length.addToPosition(new Position(1, 1));
  }
  get lineRange() {
    return this.length.toLineRange();
  }
  getValue() {
    return this.getValueOfRange(this.length.toRange());
  }
  getLineLength(lineNumber) {
    return this.getValueOfRange(new Range(lineNumber, 1, lineNumber, Number.MAX_SAFE_INTEGER)).length;
  }
  getTransformer() {
    if (!this._transformer) {
      this._transformer = new PositionOffsetTransformer(this.getValue());
    }
    return this._transformer;
  }
  getLineAt(lineNumber) {
    return this.getValueOfRange(new Range(lineNumber, 1, lineNumber, Number.MAX_SAFE_INTEGER));
  }
  getLines() {
    const value = this.getValue();
    return splitLines(value);
  }
}
class LineBasedText extends AbstractText {
  static {
    __name(this, "LineBasedText");
  }
  constructor(_getLineContent, _lineCount) {
    assert(_lineCount >= 1);
    super();
    this._getLineContent = _getLineContent;
    this._lineCount = _lineCount;
  }
  getValueOfRange(range) {
    if (range.startLineNumber === range.endLineNumber) {
      return this._getLineContent(range.startLineNumber).substring(range.startColumn - 1, range.endColumn - 1);
    }
    let result = this._getLineContent(range.startLineNumber).substring(range.startColumn - 1);
    for (let i = range.startLineNumber + 1; i < range.endLineNumber; i++) {
      result += "\n" + this._getLineContent(i);
    }
    result += "\n" + this._getLineContent(range.endLineNumber).substring(0, range.endColumn - 1);
    return result;
  }
  getLineLength(lineNumber) {
    return this._getLineContent(lineNumber).length;
  }
  get length() {
    const lastLine = this._getLineContent(this._lineCount);
    return new TextLength(this._lineCount - 1, lastLine.length);
  }
}
class ArrayText extends LineBasedText {
  static {
    __name(this, "ArrayText");
  }
  constructor(lines) {
    super((lineNumber) => lines[lineNumber - 1], lines.length);
  }
}
class StringText extends AbstractText {
  static {
    __name(this, "StringText");
  }
  constructor(value) {
    super();
    this.value = value;
    this._t = new PositionOffsetTransformer(this.value);
  }
  getValueOfRange(range) {
    return this._t.getOffsetRange(range).substring(this.value);
  }
  get length() {
    return this._t.textLength;
  }
}
export {
  AbstractText,
  ArrayText,
  LineBasedText,
  SingleTextEdit,
  StringText,
  TextEdit
};
//# sourceMappingURL=textEdit.js.map
