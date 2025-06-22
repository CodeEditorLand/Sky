var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../../base/common/arrays.js";
import { assertFn, checkAdjacentItems } from "../../../../base/common/assert.js";
import { BugIndicatingError } from "../../../../base/common/errors.js";
import { commonPrefixLength, commonSuffixLength } from "../../../../base/common/strings.js";
import { Position } from "../position.js";
import { Range } from "../range.js";
import { TextLength } from "../text/textLength.js";
import { StringText } from "../text/abstractText.js";
class TextEdit {
  static {
    __name(this, "TextEdit");
  }
  static fromStringEdit(edit, initialState) {
    const edits = edit.replacements.map((e) => TextReplacement.fromStringReplacement(e, initialState));
    return new TextEdit(edits);
  }
  static replace(originalRange, newText) {
    return new TextEdit([new TextReplacement(originalRange, newText)]);
  }
  static insert(position, newText) {
    return new TextEdit([new TextReplacement(Range.fromPositions(position, position), newText)]);
  }
  constructor(replacements) {
    this.replacements = replacements;
    assertFn(() => checkAdjacentItems(replacements, (a, b) => a.range.getEndPosition().isBeforeOrEqual(b.range.getStartPosition())));
  }
  /**
   * Joins touching edits and removes empty edits.
   */
  normalize() {
    const replacements = [];
    for (const r of this.replacements) {
      if (replacements.length > 0 && replacements[replacements.length - 1].range.getEndPosition().equals(r.range.getStartPosition())) {
        const last = replacements[replacements.length - 1];
        replacements[replacements.length - 1] = new TextReplacement(last.range.plusRange(r.range), last.text + r.text);
      } else if (!r.isEmpty) {
        replacements.push(r);
      }
    }
    return new TextEdit(replacements);
  }
  mapPosition(position) {
    let lineDelta = 0;
    let curLine = 0;
    let columnDeltaInCurLine = 0;
    for (const replacement of this.replacements) {
      const start = replacement.range.getStartPosition();
      if (position.isBeforeOrEqual(start)) {
        break;
      }
      const end = replacement.range.getEndPosition();
      const len = TextLength.ofText(replacement.text);
      if (position.isBefore(end)) {
        const startPos = new Position(start.lineNumber + lineDelta, start.column + (start.lineNumber + lineDelta === curLine ? columnDeltaInCurLine : 0));
        const endPos = len.addToPosition(startPos);
        return rangeFromPositions(startPos, endPos);
      }
      if (start.lineNumber + lineDelta !== curLine) {
        columnDeltaInCurLine = 0;
      }
      lineDelta += len.lineCount - (replacement.range.endLineNumber - replacement.range.startLineNumber);
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
    for (const replacement of this.replacements) {
      const editRange = replacement.range;
      const editStart = editRange.getStartPosition();
      const editEnd = editRange.getEndPosition();
      const r2 = rangeFromPositions(lastEditEnd, editStart);
      if (!r2.isEmpty()) {
        result += text.getValueOfRange(r2);
      }
      result += replacement.text;
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
    return new TextEdit(this.replacements.map((e, idx) => new TextReplacement(ranges[idx], doc.getValueOfRange(e.range))));
  }
  getNewRanges() {
    const newRanges = [];
    let previousEditEndLineNumber = 0;
    let lineOffset = 0;
    let columnOffset = 0;
    for (const replacement of this.replacements) {
      const textLength = TextLength.ofText(replacement.text);
      const newRangeStart = Position.lift({
        lineNumber: replacement.range.startLineNumber + lineOffset,
        column: replacement.range.startColumn + (replacement.range.startLineNumber === previousEditEndLineNumber ? columnOffset : 0)
      });
      const newRange = textLength.createRange(newRangeStart);
      newRanges.push(newRange);
      lineOffset = newRange.endLineNumber - replacement.range.endLineNumber;
      columnOffset = newRange.endColumn - replacement.range.endColumn;
      previousEditEndLineNumber = replacement.range.endLineNumber;
    }
    return newRanges;
  }
  toReplacement(text) {
    if (this.replacements.length === 0) {
      throw new BugIndicatingError();
    }
    if (this.replacements.length === 1) {
      return this.replacements[0];
    }
    const startPos = this.replacements[0].range.getStartPosition();
    const endPos = this.replacements[this.replacements.length - 1].range.getEndPosition();
    let newText = "";
    for (let i = 0; i < this.replacements.length; i++) {
      const curEdit = this.replacements[i];
      newText += curEdit.text;
      if (i < this.replacements.length - 1) {
        const nextEdit = this.replacements[i + 1];
        const gapRange = Range.fromPositions(curEdit.range.getEndPosition(), nextEdit.range.getStartPosition());
        const gapText = text.getValueOfRange(gapRange);
        newText += gapText;
      }
    }
    return new TextReplacement(Range.fromPositions(startPos, endPos), newText);
  }
  equals(other) {
    return equals(this.replacements, other.replacements, (a, b) => a.equals(b));
  }
  toString(text) {
    if (text === void 0) {
      return this.replacements.map((edit) => edit.toString()).join("\n");
    }
    if (typeof text === "string") {
      return this.toString(new StringText(text));
    }
    if (this.replacements.length === 0) {
      return "";
    }
    return this.replacements.map((r) => {
      const maxLength = 10;
      const originalText = text.getValueOfRange(r.range);
      const beforeRange = Range.fromPositions(new Position(Math.max(1, r.range.startLineNumber - 1), 1), r.range.getStartPosition());
      let beforeText = text.getValueOfRange(beforeRange);
      if (beforeText.length > maxLength) {
        beforeText = "..." + beforeText.substring(beforeText.length - maxLength);
      }
      const afterRange = Range.fromPositions(r.range.getEndPosition(), new Position(r.range.endLineNumber + 1, 1));
      let afterText = text.getValueOfRange(afterRange);
      if (afterText.length > maxLength) {
        afterText = afterText.substring(0, maxLength) + "...";
      }
      let replacedText = originalText;
      if (replacedText.length > maxLength) {
        const halfMax = Math.floor(maxLength / 2);
        replacedText = replacedText.substring(0, halfMax) + "..." + replacedText.substring(replacedText.length - halfMax);
      }
      let newText = r.text;
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
class TextReplacement {
  static {
    __name(this, "TextReplacement");
  }
  static joinReplacements(replacements, initialValue) {
    if (replacements.length === 0) {
      throw new BugIndicatingError();
    }
    if (replacements.length === 1) {
      return replacements[0];
    }
    const startPos = replacements[0].range.getStartPosition();
    const endPos = replacements[replacements.length - 1].range.getEndPosition();
    let newText = "";
    for (let i = 0; i < replacements.length; i++) {
      const curEdit = replacements[i];
      newText += curEdit.text;
      if (i < replacements.length - 1) {
        const nextEdit = replacements[i + 1];
        const gapRange = Range.fromPositions(curEdit.range.getEndPosition(), nextEdit.range.getStartPosition());
        const gapText = initialValue.getValueOfRange(gapRange);
        newText += gapText;
      }
    }
    return new TextReplacement(Range.fromPositions(startPos, endPos), newText);
  }
  static fromStringReplacement(replacement, initialState) {
    return new TextReplacement(initialState.getTransformer().getRange(replacement.replaceRange), replacement.newText);
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
    return TextReplacement.equals(this, other);
  }
  extendToCoverRange(range, initialValue) {
    if (this.range.containsRange(range)) {
      return this;
    }
    const newRange = this.range.plusRange(range);
    const textBefore = initialValue.getValueOfRange(Range.fromPositions(newRange.getStartPosition(), this.range.getStartPosition()));
    const textAfter = initialValue.getValueOfRange(Range.fromPositions(this.range.getEndPosition(), newRange.getEndPosition()));
    const newText = textBefore + this.text + textAfter;
    return new TextReplacement(newRange, newText);
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
    return new TextReplacement(range, newText);
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
export {
  TextEdit,
  TextReplacement
};
//# sourceMappingURL=textEdit.js.map
