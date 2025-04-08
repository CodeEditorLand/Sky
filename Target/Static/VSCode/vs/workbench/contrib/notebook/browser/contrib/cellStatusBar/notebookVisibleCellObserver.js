var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { diffSets } from "../../../../../../base/common/collections.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { isDefined } from "../../../../../../base/common/types.js";
import { ICellViewModel, INotebookEditor } from "../../notebookBrowser.js";
import { cellRangesToIndexes } from "../../../common/notebookRange.js";
class NotebookVisibleCellObserver extends Disposable {
  constructor(_notebookEditor) {
    super();
    this._notebookEditor = _notebookEditor;
    this._register(this._notebookEditor.onDidChangeVisibleRanges(this._updateVisibleCells, this));
    this._register(this._notebookEditor.onDidChangeModel(this._onModelChange, this));
    this._updateVisibleCells();
  }
  static {
    __name(this, "NotebookVisibleCellObserver");
  }
  _onDidChangeVisibleCells = this._register(new Emitter());
  onDidChangeVisibleCells = this._onDidChangeVisibleCells.event;
  _viewModelDisposables = this._register(new DisposableStore());
  _visibleCells = [];
  get visibleCells() {
    return this._visibleCells;
  }
  _onModelChange() {
    this._viewModelDisposables.clear();
    if (this._notebookEditor.hasModel()) {
      this._viewModelDisposables.add(this._notebookEditor.onDidChangeViewCells(() => this.updateEverything()));
    }
    this.updateEverything();
  }
  updateEverything() {
    this._onDidChangeVisibleCells.fire({ added: [], removed: Array.from(this._visibleCells) });
    this._visibleCells = [];
    this._updateVisibleCells();
  }
  _updateVisibleCells() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const newVisibleCells = cellRangesToIndexes(this._notebookEditor.visibleRanges).map((index) => this._notebookEditor.cellAt(index)).filter(isDefined);
    const newVisibleHandles = new Set(newVisibleCells.map((cell) => cell.handle));
    const oldVisibleHandles = new Set(this._visibleCells.map((cell) => cell.handle));
    const diff = diffSets(oldVisibleHandles, newVisibleHandles);
    const added = diff.added.map((handle) => this._notebookEditor.getCellByHandle(handle)).filter(isDefined);
    const removed = diff.removed.map((handle) => this._notebookEditor.getCellByHandle(handle)).filter(isDefined);
    this._visibleCells = newVisibleCells;
    this._onDidChangeVisibleCells.fire({
      added,
      removed
    });
  }
}
export {
  NotebookVisibleCellObserver
};
//# sourceMappingURL=notebookVisibleCellObserver.js.map
