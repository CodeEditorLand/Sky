var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "../../../../../../base/browser/dom.js";
import { INotebookEditor } from "../../notebookBrowser.js";
import { CellContentPart } from "../cellPart.js";
class CollapsedCellInput extends CellContentPart {
  constructor(notebookEditor, cellInputCollapsedContainer) {
    super();
    this.notebookEditor = notebookEditor;
    this._register(DOM.addDisposableListener(cellInputCollapsedContainer, DOM.EventType.DBLCLICK, (e) => {
      if (!this.currentCell || !this.notebookEditor.hasModel()) {
        return;
      }
      if (this.currentCell.isInputCollapsed) {
        this.currentCell.isInputCollapsed = false;
      } else {
        this.currentCell.isOutputCollapsed = false;
      }
    }));
    this._register(DOM.addDisposableListener(cellInputCollapsedContainer, DOM.EventType.CLICK, (e) => {
      if (!this.currentCell || !this.notebookEditor.hasModel()) {
        return;
      }
      const element = e.target;
      if (element && element.classList && element.classList.contains("expandInputIcon")) {
        this.currentCell.isInputCollapsed = false;
      }
    }));
  }
  static {
    __name(this, "CollapsedCellInput");
  }
}
export {
  CollapsedCellInput
};
//# sourceMappingURL=collapsedCellInput.js.map
