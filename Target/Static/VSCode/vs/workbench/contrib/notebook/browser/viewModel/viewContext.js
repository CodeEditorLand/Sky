var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IBaseCellEditorOptions } from "../notebookBrowser.js";
import { NotebookEventDispatcher } from "./eventDispatcher.js";
import { NotebookOptions } from "../notebookOptions.js";
class ViewContext {
  constructor(notebookOptions, eventDispatcher, getBaseCellEditorOptions) {
    this.notebookOptions = notebookOptions;
    this.eventDispatcher = eventDispatcher;
    this.getBaseCellEditorOptions = getBaseCellEditorOptions;
  }
  static {
    __name(this, "ViewContext");
  }
}
export {
  ViewContext
};
//# sourceMappingURL=viewContext.js.map
