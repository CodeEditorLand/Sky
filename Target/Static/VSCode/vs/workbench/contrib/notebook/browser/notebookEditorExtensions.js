var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BrandedService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotebookEditor, INotebookEditorContribution, INotebookEditorContributionCtor, INotebookEditorContributionDescription } from "./notebookBrowser.js";
class EditorContributionRegistry {
  static {
    __name(this, "EditorContributionRegistry");
  }
  static INSTANCE = new EditorContributionRegistry();
  editorContributions;
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
((NotebookEditorExtensionsRegistry2) => {
  function getEditorContributions() {
    return EditorContributionRegistry.INSTANCE.getEditorContributions();
  }
  NotebookEditorExtensionsRegistry2.getEditorContributions = getEditorContributions;
  __name(getEditorContributions, "getEditorContributions");
  function getSomeEditorContributions(ids) {
    return EditorContributionRegistry.INSTANCE.getEditorContributions().filter((c) => ids.indexOf(c.id) >= 0);
  }
  NotebookEditorExtensionsRegistry2.getSomeEditorContributions = getSomeEditorContributions;
  __name(getSomeEditorContributions, "getSomeEditorContributions");
})(NotebookEditorExtensionsRegistry || (NotebookEditorExtensionsRegistry = {}));
export {
  NotebookEditorExtensionsRegistry,
  registerNotebookContribution
};
//# sourceMappingURL=notebookEditorExtensions.js.map
