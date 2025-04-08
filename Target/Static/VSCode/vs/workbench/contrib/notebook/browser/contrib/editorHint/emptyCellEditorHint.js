var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Schemas } from "../../../../../../base/common/network.js";
import { ICodeEditor } from "../../../../../../editor/browser/editorBrowser.js";
import { EditorContributionInstantiation, registerEditorContribution } from "../../../../../../editor/browser/editorExtensions.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { IProductService } from "../../../../../../platform/product/common/productService.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { IChatAgentService } from "../../../../chat/common/chatAgents.js";
import { EmptyTextEditorHintContribution, IEmptyTextEditorHintOptions } from "../../../../codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint.js";
import { IInlineChatSessionService } from "../../../../inlineChat/browser/inlineChatSessionService.js";
import { getNotebookEditorFromEditorPane } from "../../notebookBrowser.js";
import { IEditorGroupsService } from "../../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
let EmptyCellEditorHintContribution = class extends EmptyTextEditorHintContribution {
  constructor(editor, _editorService, editorGroupsService, commandService, configurationService, hoverService, keybindingService, inlineChatSessionService, chatAgentService, telemetryService, productService, contextMenuService) {
    super(
      editor,
      editorGroupsService,
      commandService,
      configurationService,
      hoverService,
      keybindingService,
      inlineChatSessionService,
      chatAgentService,
      telemetryService,
      productService,
      contextMenuService
    );
    this._editorService = _editorService;
    const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    if (!activeEditor) {
      return;
    }
    this.toDispose.push(activeEditor.onDidChangeActiveCell(() => this.update()));
  }
  static {
    __name(this, "EmptyCellEditorHintContribution");
  }
  static CONTRIB_ID = "notebook.editor.contrib.emptyCellEditorHint";
  _getOptions() {
    return { clickable: false };
  }
  _shouldRenderHint() {
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
    const shouldRenderHint = super._shouldRenderHint();
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
EmptyCellEditorHintContribution = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, IEditorGroupsService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, IInlineChatSessionService),
  __decorateParam(8, IChatAgentService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IProductService),
  __decorateParam(11, IContextMenuService)
], EmptyCellEditorHintContribution);
registerEditorContribution(EmptyCellEditorHintContribution.CONTRIB_ID, EmptyCellEditorHintContribution, EditorContributionInstantiation.Eager);
export {
  EmptyCellEditorHintContribution
};
//# sourceMappingURL=emptyCellEditorHint.js.map
