var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IResourceUndoRedoElement, UndoRedoElementType } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { URI } from "../../../../../base/common/uri.js";
import { NotebookCellTextModel } from "./notebookCellTextModel.js";
import { ISelectionState, NotebookCellMetadata } from "../notebookCommon.js";
class MoveCellEdit {
  constructor(resource, fromIndex, length, toIndex, editingDelegate, beforedSelections, endSelections) {
    this.resource = resource;
    this.fromIndex = fromIndex;
    this.length = length;
    this.toIndex = toIndex;
    this.editingDelegate = editingDelegate;
    this.beforedSelections = beforedSelections;
    this.endSelections = endSelections;
  }
  static {
    __name(this, "MoveCellEdit");
  }
  type = UndoRedoElementType.Resource;
  get label() {
    return this.length === 1 ? "Move Cell" : "Move Cells";
  }
  code = "undoredo.textBufferEdit";
  undo() {
    if (!this.editingDelegate.moveCell) {
      throw new Error("Notebook Move Cell not implemented for Undo/Redo");
    }
    this.editingDelegate.moveCell(this.toIndex, this.length, this.fromIndex, this.endSelections, this.beforedSelections);
  }
  redo() {
    if (!this.editingDelegate.moveCell) {
      throw new Error("Notebook Move Cell not implemented for Undo/Redo");
    }
    this.editingDelegate.moveCell(this.fromIndex, this.length, this.toIndex, this.beforedSelections, this.endSelections);
  }
}
class SpliceCellsEdit {
  constructor(resource, diffs, editingDelegate, beforeHandles, endHandles) {
    this.resource = resource;
    this.diffs = diffs;
    this.editingDelegate = editingDelegate;
    this.beforeHandles = beforeHandles;
    this.endHandles = endHandles;
  }
  static {
    __name(this, "SpliceCellsEdit");
  }
  type = UndoRedoElementType.Resource;
  get label() {
    if (this.diffs.length === 1 && this.diffs[0][1].length === 0) {
      return this.diffs[0][2].length > 1 ? "Insert Cells" : "Insert Cell";
    }
    if (this.diffs.length === 1 && this.diffs[0][2].length === 0) {
      return this.diffs[0][1].length > 1 ? "Delete Cells" : "Delete Cell";
    }
    return "Insert Cell";
  }
  code = "undoredo.textBufferEdit";
  undo() {
    if (!this.editingDelegate.replaceCell) {
      throw new Error("Notebook Replace Cell not implemented for Undo/Redo");
    }
    this.diffs.forEach((diff) => {
      this.editingDelegate.replaceCell(diff[0], diff[2].length, diff[1], this.beforeHandles);
    });
  }
  redo() {
    if (!this.editingDelegate.replaceCell) {
      throw new Error("Notebook Replace Cell not implemented for Undo/Redo");
    }
    this.diffs.reverse().forEach((diff) => {
      this.editingDelegate.replaceCell(diff[0], diff[1].length, diff[2], this.endHandles);
    });
  }
}
class CellMetadataEdit {
  constructor(resource, index, oldMetadata, newMetadata, editingDelegate) {
    this.resource = resource;
    this.index = index;
    this.oldMetadata = oldMetadata;
    this.newMetadata = newMetadata;
    this.editingDelegate = editingDelegate;
  }
  static {
    __name(this, "CellMetadataEdit");
  }
  type = UndoRedoElementType.Resource;
  label = "Update Cell Metadata";
  code = "undoredo.textBufferEdit";
  undo() {
    if (!this.editingDelegate.updateCellMetadata) {
      return;
    }
    this.editingDelegate.updateCellMetadata(this.index, this.oldMetadata);
  }
  redo() {
    if (!this.editingDelegate.updateCellMetadata) {
      return;
    }
    this.editingDelegate.updateCellMetadata(this.index, this.newMetadata);
  }
}
export {
  CellMetadataEdit,
  MoveCellEdit,
  SpliceCellsEdit
};
//# sourceMappingURL=cellEdit.js.map
