var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ViewContext {
  static {
    __name(this, "ViewContext");
  }
  constructor(notebookOptions, eventDispatcher, getBaseCellEditorOptions) {
    this.notebookOptions = notebookOptions;
    this.eventDispatcher = eventDispatcher;
    this.getBaseCellEditorOptions = getBaseCellEditorOptions;
  }
}
export {
  ViewContext
};
//# sourceMappingURL=viewContext.js.map
