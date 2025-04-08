var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableStore, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { CellDiffInfo } from "../notebookDiffViewModel.js";
import { INotebookEditor, NotebookOverviewRulerLane } from "../../notebookBrowser.js";
import { NotebookCellTextModel } from "../../../common/model/notebookCellTextModel.js";
import { overviewRulerModifiedForeground } from "../../../../scm/common/quickDiff.js";
class NotebookModifiedCellDecorator extends Disposable {
  constructor(notebookEditor) {
    super();
    this.notebookEditor = notebookEditor;
  }
  static {
    __name(this, "NotebookModifiedCellDecorator");
  }
  decorators = this._register(new DisposableStore());
  apply(diffInfo) {
    const model = this.notebookEditor.textModel;
    if (!model) {
      return;
    }
    const modifiedCells = [];
    for (const diff of diffInfo) {
      if (diff.type === "modified") {
        const cell = model.cells[diff.modifiedCellIndex];
        modifiedCells.push(cell);
      }
    }
    const ids = this.notebookEditor.deltaCellDecorations([], modifiedCells.map((cell) => ({
      handle: cell.handle,
      options: {
        overviewRuler: {
          color: overviewRulerModifiedForeground,
          modelRanges: [],
          includeOutput: true,
          position: NotebookOverviewRulerLane.Full
        }
      }
    })));
    this.clear();
    this.decorators.add(toDisposable(() => {
      if (!this.notebookEditor.isDisposed) {
        this.notebookEditor.deltaCellDecorations(ids, []);
      }
    }));
  }
  clear() {
    this.decorators.clear();
  }
}
export {
  NotebookModifiedCellDecorator
};
//# sourceMappingURL=notebookModifiedCellDecorator.js.map
