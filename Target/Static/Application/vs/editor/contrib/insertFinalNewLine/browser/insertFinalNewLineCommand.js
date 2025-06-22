var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as strings from "../../../../base/common/strings.js";
import { EditOperation } from "../../../common/core/editOperation.js";
import { Position } from "../../../common/core/position.js";
class InsertFinalNewLineCommand {
  static {
    __name(this, "InsertFinalNewLineCommand");
  }
  constructor(selection) {
    this._selection = selection;
    this._selectionId = null;
  }
  getEditOperations(model, builder) {
    const op = insertFinalNewLine(model);
    if (op) {
      builder.addEditOperation(op.range, op.text);
    }
    this._selectionId = builder.trackSelection(this._selection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._selectionId);
  }
}
function insertFinalNewLine(model) {
  const lineCount = model.getLineCount();
  const lastLine = model.getLineContent(lineCount);
  const lastLineIsEmptyOrWhitespace = strings.lastNonWhitespaceIndex(lastLine) === -1;
  if (!lineCount || lastLineIsEmptyOrWhitespace) {
    return;
  }
  return EditOperation.insert(new Position(lineCount, model.getLineMaxColumn(lineCount)), model.getEOL());
}
__name(insertFinalNewLine, "insertFinalNewLine");
export {
  InsertFinalNewLineCommand,
  insertFinalNewLine
};
//# sourceMappingURL=insertFinalNewLineCommand.js.map
