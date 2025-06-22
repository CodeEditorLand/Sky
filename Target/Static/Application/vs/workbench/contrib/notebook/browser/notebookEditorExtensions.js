var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class EditorContributionRegistry {
  static {
    __name(this, "EditorContributionRegistry");
  }
  static {
    this.INSTANCE = new EditorContributionRegistry();
  }
  constructor() {
    this.editorContributions = [];
  }
  registerEditorContribution(id, ctor) {
    this.editorContributions.push({ id, ctor });
  }
  getEditorContributions() {
    return this.editorContributions.slice(0);
  }
}
function registerNotebookContribution(id, ctor) {
  EditorContributionRegistry.INSTANCE.registerEditorContribution(id, ctor);
}
__name(registerNotebookContribution, "registerNotebookContribution");
var NotebookEditorExtensionsRegistry;
(function(NotebookEditorExtensionsRegistry2) {
  function getEditorContributions() {
    return EditorContributionRegistry.INSTANCE.getEditorContributions();
  }
  __name(getEditorContributions, "getEditorContributions");
  NotebookEditorExtensionsRegistry2.getEditorContributions = getEditorContributions;
  function getSomeEditorContributions(ids) {
    return EditorContributionRegistry.INSTANCE.getEditorContributions().filter((c) => ids.indexOf(c.id) >= 0);
  }
  __name(getSomeEditorContributions, "getSomeEditorContributions");
  NotebookEditorExtensionsRegistry2.getSomeEditorContributions = getSomeEditorContributions;
})(NotebookEditorExtensionsRegistry || (NotebookEditorExtensionsRegistry = {}));
export {
  NotebookEditorExtensionsRegistry,
  registerNotebookContribution
};
//# sourceMappingURL=notebookEditorExtensions.js.map
