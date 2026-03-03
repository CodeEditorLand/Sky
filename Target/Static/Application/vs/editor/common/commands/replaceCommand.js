var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Position } from "../core/position.js";
import { Range } from "../core/range.js";
import { Selection } from "../core/selection.js";
class ReplaceCommand {
  static {
    __name(this, "ReplaceCommand");
  }
  constructor(range, text, insertsAutoWhitespace = false) {
    this._range = range;
    this._text = text;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition());
  }
}
class ReplaceOvertypeCommand {
  static {
    __name(this, "ReplaceOvertypeCommand");
  }
  constructor(range, text, insertsAutoWhitespace = false) {
    this._range = range;
    this._text = text;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    const initialStartPosition = this._range.getStartPosition();
    const initialEndPosition = this._range.getEndPosition();
    const initialEndLineNumber = initialEndPosition.lineNumber;
    const offsetDelta = this._text.length + (this._range.isEmpty() ? 0 : -1);
    let endPosition = addPositiveOffsetToModelPosition(model, initialEndPosition, offsetDelta);
    if (endPosition.lineNumber > initialEndLineNumber) {
      endPosition = new Position(initialEndLineNumber, model.getLineMaxColumn(initialEndLineNumber));
    }
    const replaceRange = Range.fromPositions(initialStartPosition, endPosition);
    builder.addTrackedEditOperation(replaceRange, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition());
  }
}
class ReplaceCommandThatSelectsText {
  static {
    __name(this, "ReplaceCommandThatSelectsText");
  }
  constructor(range, text) {
    this._range = range;
    this._text = text;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromRange(
      srcRange,
      0
      /* SelectionDirection.LTR */
    );
  }
}
class ReplaceCommandWithoutChangingPosition {
  static {
    __name(this, "ReplaceCommandWithoutChangingPosition");
  }
  constructor(range, text, insertsAutoWhitespace = false) {
    this._range = range;
    this._text = text;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getStartPosition());
  }
}
class ReplaceCommandWithOffsetCursorState {
  static {
    __name(this, "ReplaceCommandWithOffsetCursorState");
  }
  constructor(range, text, lineNumberDeltaOffset, columnDeltaOffset, insertsAutoWhitespace = false) {
    this._range = range;
    this._text = text;
    this._columnDeltaOffset = columnDeltaOffset;
    this._lineNumberDeltaOffset = lineNumberDeltaOffset;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition().delta(this._lineNumberDeltaOffset, this._columnDeltaOffset));
  }
}
class ReplaceOvertypeCommandOnCompositionEnd {
  static {
    __name(this, "ReplaceOvertypeCommandOnCompositionEnd");
  }
  constructor(range) {
    this._range = range;
  }
  getEditOperations(model, builder) {
    const text = model.getValueInRange(this._range);
    const initialEndPosition = this._range.getEndPosition();
    const initialEndLineNumber = initialEndPosition.lineNumber;
    let endPosition = addPositiveOffsetToModelPosition(model, initialEndPosition, text.length);
    if (endPosition.lineNumber > initialEndLineNumber) {
      endPosition = new Position(initialEndLineNumber, model.getLineMaxColumn(initialEndLineNumber));
    }
    const replaceRange = Range.fromPositions(initialEndPosition, endPosition);
    builder.addTrackedEditOperation(replaceRange, "");
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition());
  }
}
class ReplaceCommandThatPreservesSelection {
  static {
    __name(this, "ReplaceCommandThatPreservesSelection");
  }
  constructor(editRange, text, initialSelection, forceMoveMarkers = false) {
    this._range = editRange;
    this._text = text;
    this._initialSelection = initialSelection;
    this._forceMoveMarkers = forceMoveMarkers;
    this._selectionId = null;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text, this._forceMoveMarkers);
    this._selectionId = builder.trackSelection(this._initialSelection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._selectionId);
  }
}
function addPositiveOffsetToModelPosition(model, position, offset) {
  if (offset < 0) {
    throw new Error("Unexpected negative delta");
  }
  const lineCount = model.getLineCount();
  let endPosition = new Position(lineCount, model.getLineMaxColumn(lineCount));
  for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
    if (lineNumber === position.lineNumber) {
      const futureOffset = offset - model.getLineMaxColumn(position.lineNumber) + position.column;
      if (futureOffset <= 0) {
        endPosition = new Position(position.lineNumber, position.column + offset);
        break;
      }
      offset = futureOffset;
    } else {
      const futureOffset = offset - model.getLineMaxColumn(lineNumber);
      if (futureOffset <= 0) {
        endPosition = new Position(lineNumber, offset);
        break;
      }
      offset = futureOffset;
    }
  }
  return endPosition;
}
__name(addPositiveOffsetToModelPosition, "addPositiveOffsetToModelPosition");
export {
  ReplaceCommand,
  ReplaceCommandThatPreservesSelection,
  ReplaceCommandThatSelectsText,
  ReplaceCommandWithOffsetCursorState,
  ReplaceCommandWithoutChangingPosition,
  ReplaceOvertypeCommand,
  ReplaceOvertypeCommandOnCompositionEnd
};
//# sourceMappingURL=replaceCommand.js.map
