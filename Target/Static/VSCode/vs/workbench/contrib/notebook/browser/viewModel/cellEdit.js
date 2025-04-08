var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../../../../../editor/common/core/range.js";
import { Selection } from "../../../../../editor/common/core/selection.js";
import { CellKind, IOutputDto, NotebookCellMetadata, SelectionStateType } from "../../common/notebookCommon.js";
import { IResourceUndoRedoElement, UndoRedoElementType } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { URI } from "../../../../../base/common/uri.js";
import { BaseCellViewModel } from "./baseCellViewModel.js";
import { CellFocusMode } from "../notebookBrowser.js";
import { NotebookCellTextModel } from "../../common/model/notebookCellTextModel.js";
import { ITextCellEditingDelegate } from "../../common/model/cellEdit.js";
class JoinCellEdit {
  constructor(resource, index, direction, cell, selections, inverseRange, insertContent, removedCell, editingDelegate) {
    this.resource = resource;
    this.index = index;
    this.direction = direction;
    this.cell = cell;
    this.selections = selections;
    this.inverseRange = inverseRange;
    this.insertContent = insertContent;
    this.removedCell = removedCell;
    this.editingDelegate = editingDelegate;
    this._deletedRawCell = this.removedCell.model;
  }
  static {
    __name(this, "JoinCellEdit");
  }
  type = UndoRedoElementType.Resource;
  label = "Join Cell";
  code = "undoredo.textBufferEdit";
  _deletedRawCell;
  async undo() {
    if (!this.editingDelegate.insertCell || !this.editingDelegate.createCellViewModel) {
      throw new Error("Notebook Insert Cell not implemented for Undo/Redo");
    }
    await this.cell.resolveTextModel();
    this.cell.textModel?.applyEdits([
      { range: this.inverseRange, text: "" }
    ]);
    this.cell.setSelections(this.selections);
    const cell = this.editingDelegate.createCellViewModel(this._deletedRawCell);
    if (this.direction === "above") {
      this.editingDelegate.insertCell(this.index, this._deletedRawCell, { kind: SelectionStateType.Handle, primary: cell.handle, selections: [cell.handle] });
      cell.focusMode = CellFocusMode.Editor;
    } else {
      this.editingDelegate.insertCell(this.index, cell.model, { kind: SelectionStateType.Handle, primary: this.cell.handle, selections: [this.cell.handle] });
      this.cell.focusMode = CellFocusMode.Editor;
    }
  }
  async redo() {
    if (!this.editingDelegate.deleteCell) {
      throw new Error("Notebook Delete Cell not implemented for Undo/Redo");
    }
    await this.cell.resolveTextModel();
    this.cell.textModel?.applyEdits([
      { range: this.inverseRange, text: this.insertContent }
    ]);
    this.editingDelegate.deleteCell(this.index, { kind: SelectionStateType.Handle, primary: this.cell.handle, selections: [this.cell.handle] });
    this.cell.focusMode = CellFocusMode.Editor;
  }
}
export {
  JoinCellEdit
};
//# sourceMappingURL=cellEdit.js.map
