var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditOperation, ISingleEditOperation } from "../../../common/core/editOperation.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from "../../../common/editorCommon.js";
import { ITextModel } from "../../../common/model.js";
class SortLinesCommand {
  static {
    __name(this, "SortLinesCommand");
  }
  static _COLLATOR = null;
  static getCollator() {
    if (!SortLinesCommand._COLLATOR) {
      SortLinesCommand._COLLATOR = new Intl.Collator();
    }
    return SortLinesCommand._COLLATOR;
  }
  selection;
  descending;
  selectionId;
  constructor(selection, descending) {
    this.selection = selection;
    this.descending = descending;
    this.selectionId = null;
  }
  getEditOperations(model, builder) {
    const op = sortLines(model, this.selection, this.descending);
    if (op) {
      builder.addEditOperation(op.range, op.text);
    }
    this.selectionId = builder.trackSelection(this.selection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this.selectionId);
  }
  static canRun(model, selection, descending) {
    if (model === null) {
      return false;
    }
    const data = getSortData(model, selection, descending);
    if (!data) {
      return false;
    }
    for (let i = 0, len = data.before.length; i < len; i++) {
      if (data.before[i] !== data.after[i]) {
        return true;
      }
    }
    return false;
  }
}
function getSortData(model, selection, descending) {
  const startLineNumber = selection.startLineNumber;
  let endLineNumber = selection.endLineNumber;
  if (selection.endColumn === 1) {
    endLineNumber--;
  }
  if (startLineNumber >= endLineNumber) {
    return null;
  }
  const linesToSort = [];
  for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
    linesToSort.push(model.getLineContent(lineNumber));
  }
  let sorted = linesToSort.slice(0);
  sorted.sort(SortLinesCommand.getCollator().compare);
  if (descending === true) {
    sorted = sorted.reverse();
  }
  return {
    startLineNumber,
    endLineNumber,
    before: linesToSort,
    after: sorted
  };
}
__name(getSortData, "getSortData");
function sortLines(model, selection, descending) {
  const data = getSortData(model, selection, descending);
  if (!data) {
    return null;
  }
  return EditOperation.replace(
    new Range(data.startLineNumber, 1, data.endLineNumber, model.getLineMaxColumn(data.endLineNumber)),
    data.after.join("\n")
  );
}
__name(sortLines, "sortLines");
export {
  SortLinesCommand
};
//# sourceMappingURL=sortLinesCommand.js.map
