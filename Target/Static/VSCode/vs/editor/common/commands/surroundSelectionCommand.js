var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../core/range.js";
import { Position } from "../core/position.js";
import { Selection } from "../core/selection.js";
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from "../editorCommon.js";
import { ITextModel } from "../model.js";
class SurroundSelectionCommand {
  static {
    __name(this, "SurroundSelectionCommand");
  }
  _range;
  _charBeforeSelection;
  _charAfterSelection;
  constructor(range, charBeforeSelection, charAfterSelection) {
    this._range = range;
    this._charBeforeSelection = charBeforeSelection;
    this._charAfterSelection = charAfterSelection;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(new Range(
      this._range.startLineNumber,
      this._range.startColumn,
      this._range.startLineNumber,
      this._range.startColumn
    ), this._charBeforeSelection);
    builder.addTrackedEditOperation(new Range(
      this._range.endLineNumber,
      this._range.endColumn,
      this._range.endLineNumber,
      this._range.endColumn
    ), this._charAfterSelection);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const firstOperationRange = inverseEditOperations[0].range;
    const secondOperationRange = inverseEditOperations[1].range;
    return new Selection(
      firstOperationRange.endLineNumber,
      firstOperationRange.endColumn,
      secondOperationRange.endLineNumber,
      secondOperationRange.endColumn - this._charAfterSelection.length
    );
  }
}
class CompositionSurroundSelectionCommand {
  constructor(_position, _text, _charAfter) {
    this._position = _position;
    this._text = _text;
    this._charAfter = _charAfter;
  }
  static {
    __name(this, "CompositionSurroundSelectionCommand");
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(new Range(
      this._position.lineNumber,
      this._position.column,
      this._position.lineNumber,
      this._position.column
    ), this._text + this._charAfter);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const opRange = inverseEditOperations[0].range;
    return new Selection(
      opRange.endLineNumber,
      opRange.startColumn,
      opRange.endLineNumber,
      opRange.endColumn - this._charAfter.length
    );
  }
}
export {
  CompositionSurroundSelectionCommand,
  SurroundSelectionCommand
};
//# sourceMappingURL=surroundSelectionCommand.js.map
