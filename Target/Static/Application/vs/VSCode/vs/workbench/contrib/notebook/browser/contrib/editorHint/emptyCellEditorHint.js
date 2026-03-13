var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { Schemas } from "../../../../../../base/common/network.js";
import { registerEditorContribution } from "../../../../../../editor/browser/editorExtensions.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IChatAgentService } from "../../../../chat/common/participants/chatAgents.js";
import { EmptyTextEditorHintContribution } from "../../../../codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint.js";
import { IInlineChatSessionService } from "../../../../inlineChat/browser/inlineChatSessionService.js";
import { getNotebookEditorFromEditorPane } from "../../notebookBrowser.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
let EmptyCellEditorHintContribution = class EmptyCellEditorHintContribution2 extends EmptyTextEditorHintContribution {
  static {
    __name(this, "EmptyCellEditorHintContribution");
  }
  static {
    this.CONTRIB_ID = "notebook.editor.contrib.emptyCellEditorHint";
  }
  constructor(editor, _editorService, configurationService, inlineChatSessionService, chatAgentService, instantiationService) {
    super(editor, configurationService, inlineChatSessionService, chatAgentService, instantiationService);
    this._editorService = _editorService;
    const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    if (!activeEditor) {
      return;
    }
    this._register(activeEditor.onDidChangeActiveCell(() => this.update()));
  }
  shouldRenderHint() {
    const model = this.editor.getModel();
    if (!model) {
      return false;
    }
    const isNotebookCell = model?.uri.scheme === Schemas.vscodeNotebookCell;
    if (!isNotebookCell) {
      return false;
    }
    const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    if (!activeEditor || !activeEditor.isDisposed) {
      return false;
    }
    const shouldRenderHint = super.shouldRenderHint();
    if (!shouldRenderHint) {
      return false;
    }
    const activeCell = activeEditor.getActiveCell();
    if (activeCell?.uri.fragment !== model.uri.fragment) {
      return false;
    }
    return true;
  }
};
EmptyCellEditorHintContribution = __decorate([
  __param(1, IEditorService),
  __param(2, IConfigurationService),
  __param(3, IInlineChatSessionService),
  __param(4, IChatAgentService),
  __param(5, IInstantiationService)
], EmptyCellEditorHintContribution);
registerEditorContribution(
  EmptyCellEditorHintContribution.CONTRIB_ID,
  EmptyCellEditorHintContribution,
  0
  /* EditorContributionInstantiation.Eager */
);
export {
  EmptyCellEditorHintContribution
};
//# sourceMappingURL=emptyCellEditorHint.js.map
