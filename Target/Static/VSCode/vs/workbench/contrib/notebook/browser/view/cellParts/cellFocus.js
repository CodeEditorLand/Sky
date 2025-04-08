var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "../../../../../../base/browser/dom.js";
import { INotebookEditor } from "../../notebookBrowser.js";
import { CellContentPart } from "../cellPart.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
class CellFocusPart extends CellContentPart {
  static {
    __name(this, "CellFocusPart");
  }
  constructor(containerElement, focusSinkElement, notebookEditor) {
    super();
    this._register(DOM.addDisposableListener(containerElement, DOM.EventType.FOCUS, () => {
      if (this.currentCell) {
        notebookEditor.focusElement(this.currentCell);
      }
    }, true));
    if (focusSinkElement) {
      this._register(DOM.addDisposableListener(focusSinkElement, DOM.EventType.FOCUS, () => {
        if (this.currentCell && this.currentCell.outputsViewModels.length) {
          notebookEditor.focusNotebookCell(this.currentCell, "output");
        }
      }));
    }
  }
}
export {
  CellFocusPart
};
//# sourceMappingURL=cellFocus.js.map
