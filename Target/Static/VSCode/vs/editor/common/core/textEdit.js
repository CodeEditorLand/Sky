/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { equals } from '../../../base/common/arrays.js';
import { assert, assertFn, checkAdjacentItems } from '../../../base/common/assert.js';
import { BugIndicatingError } from '../../../base/common/errors.js';
import { commonPrefixLength, commonSuffixLength, splitLines } from '../../../base/common/strings.js';
import { Position } from './position.js';
import { PositionOffsetTransformer } from './positionToOffset.js';
import { Range } from './range.js';
import { TextLength } from './textLength.js';
export class TextEdit {
    static fromOffsetEdit(edit, initialState) {
        const edits = edit.edits.map(e => new SingleTextEdit(initialState.getTransformer().getRange(e.replaceRange), e.newText));
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
            }
            else if (!edit.isEmpty) {
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
                }
                else {
                    columnDeltaInCurLine += len.columnCount - (end.column - start.column);
                }
            }
            else {
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
        function getEnd(p) {
            return p instanceof Position ? p : p.getEndPosition();
        }
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
        let result = '';
        let lastEditEnd = new Position(1, 1);
        for (const edit of this.edits) {
            const editRange = edit.range;
            const editStart = editRange.getStartPosition();
            const editEnd = editRange.getEndPosition();
            const r = rangeFromPositions(lastEditEnd, editStart);
            if (!r.isEmpty()) {
                result += text.getValueOfRange(r);
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
        let newText = '';
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
        if (text === undefined) {
            return this.edits.map(edit => edit.toString()).join('\n');
        }
        if (typeof text === 'string') {
            return this.toString(new StringText(text));
        }
        if (this.edits.length === 0) {
            return '';
        }
        return this.edits.map(edit => {
            const maxLength = 10;
            const originalText = text.getValueOfRange(edit.range);
            // Get text before the edit
            const beforeRange = Range.fromPositions(new Position(Math.max(1, edit.range.startLineNumber - 1), 1), edit.range.getStartPosition());
            let beforeText = text.getValueOfRange(beforeRange);
            if (beforeText.length > maxLength) {
                beforeText = '...' + beforeText.substring(beforeText.length - maxLength);
            }
            // Get text after the edit
            const afterRange = Range.fromPositions(edit.range.getEndPosition(), new Position(edit.range.endLineNumber + 1, 1));
            let afterText = text.getValueOfRange(afterRange);
            if (afterText.length > maxLength) {
                afterText = afterText.substring(0, maxLength) + '...';
            }
            // Format the replaced text
            let replacedText = originalText;
            if (replacedText.length > maxLength) {
                const halfMax = Math.floor(maxLength / 2);
                replacedText = replacedText.substring(0, halfMax) + '...' +
                    replacedText.substring(replacedText.length - halfMax);
            }
            // Format the new text
            let newText = edit.text;
            if (newText.length > maxLength) {
                const halfMax = Math.floor(maxLength / 2);
                newText = newText.substring(0, halfMax) + '...' +
                    newText.substring(newText.length - halfMax);
            }
            if (replacedText.length === 0) {
                // allow-any-unicode-next-line
                return `${beforeText}❰${newText}❱${afterText}`;
            }
            // allow-any-unicode-next-line
            return `${beforeText}❰${replacedText}↦${newText}❱${afterText}`;
        }).join('\n');
    }
}
export class SingleTextEdit {
    static joinEdits(edits, initialValue) {
        if (edits.length === 0) {
            throw new BugIndicatingError();
        }
        if (edits.length === 1) {
            return edits[0];
        }
        const startPos = edits[0].range.getStartPosition();
        const endPos = edits[edits.length - 1].range.getEndPosition();
        let newText = '';
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
            text: this.text,
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
        const normalizedOriginalText = text.getValueOfRange(this.range).replaceAll('\r\n', '\n');
        const normalizedModifiedText = this.text.replaceAll('\r\n', '\n');
        const commonPrefixLen = commonPrefixLength(normalizedOriginalText, normalizedModifiedText);
        const start = TextLength.ofText(normalizedOriginalText.substring(0, commonPrefixLen))
            .addToPosition(this.range.getStartPosition());
        const newText = normalizedModifiedText.substring(commonPrefixLen);
        const range = Range.fromPositions(start, this.range.getEndPosition());
        return new SingleTextEdit(range, newText);
    }
    isEffectiveDeletion(text) {
        let newText = this.text.replaceAll('\r\n', '\n');
        let existingText = text.getValueOfRange(this.range).replaceAll('\r\n', '\n');
        const l = commonPrefixLength(newText, existingText);
        newText = newText.substring(l);
        existingText = existingText.substring(l);
        const r = commonSuffixLength(newText, existingText);
        newText = newText.substring(0, newText.length - r);
        existingText = existingText.substring(0, existingText.length - r);
        return newText === '';
    }
}
function rangeFromPositions(start, end) {
    if (start.lineNumber === end.lineNumber && start.column === Number.MAX_SAFE_INTEGER) {
        return Range.fromPositions(end, end);
    }
    else if (!start.isBeforeOrEqual(end)) {
        throw new BugIndicatingError('start must be before end');
    }
    return new Range(start.lineNumber, start.column, end.lineNumber, end.column);
}
export class AbstractText {
    constructor() {
        this._transformer = undefined;
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
export class LineBasedText extends AbstractText {
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
            result += '\n' + this._getLineContent(i);
        }
        result += '\n' + this._getLineContent(range.endLineNumber).substring(0, range.endColumn - 1);
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
export class ArrayText extends LineBasedText {
    constructor(lines) {
        super(lineNumber => lines[lineNumber - 1], lines.length);
    }
}
export class StringText extends AbstractText {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEVkaXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9EOi9EZXZlbG9wZXIvQXBwbGljYXRpb24vQ29kZUVkaXRvckxhbmQvTGFuZC9EZXBlbmRlbmN5L01pY3Jvc29mdC9EZXBlbmRlbmN5L0VkaXRvci9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL2NvcmUvdGV4dEVkaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3hELE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBSXJHLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDbEUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFN0MsTUFBTSxPQUFPLFFBQVE7SUFDYixNQUFNLENBQUMsY0FBYyxDQUFDLElBQWdCLEVBQUUsWUFBMEI7UUFDeEUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN6SCxPQUFPLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFD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