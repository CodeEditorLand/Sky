var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CellContentPart } from "../../cellPart.js";
class CellChatPart extends CellContentPart {
  static {
    __name(this, "CellChatPart");
  }
  // private _controller: NotebookCellChatController | undefined;
  get activeCell() {
    return this.currentCell;
  }
  constructor(_notebookEditor, _partContainer) {
    super();
  }
  didRenderCell(element) {
    super.didRenderCell(element);
  }
  unrenderCell(element) {
    super.unrenderCell(element);
  }
  updateInternalLayoutNow(element) {
  }
  dispose() {
    super.dispose();
  }
}
export {
  CellChatPart
};
//# sourceMappingURL=cellChatPart.js.map
