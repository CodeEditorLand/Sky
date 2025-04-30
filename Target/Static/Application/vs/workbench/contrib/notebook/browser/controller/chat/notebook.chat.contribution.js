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
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { codiconsLibrary } from "../../../../../../base/common/codiconsLibrary.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { ILanguageFeaturesService } from "../../../../../../editor/common/services/languageFeatures.js";
import { localize } from "../../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IQuickInputService } from "../../../../../../platform/quickinput/common/quickInput.js";
import { registerWorkbenchContribution2 } from "../../../../../common/contributions.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { IChatWidgetService, showChatView } from "../../../../chat/browser/chat.js";
import { ChatInputPart } from "../../../../chat/browser/chatInputPart.js";
import { ChatDynamicVariableModel } from "../../../../chat/browser/contrib/chatDynamicVariables.js";
import { computeCompletionRanges } from "../../../../chat/browser/contrib/chatInputCompletions.js";
import { IChatAgentService } from "../../../../chat/common/chatAgents.js";
import { ChatAgentLocation } from "../../../../chat/common/constants.js";
import { ChatContextKeys } from "../../../../chat/common/chatContextKeys.js";
import { chatVariableLeader } from "../../../../chat/common/chatParserTypes.js";
import { NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT, NOTEBOOK_CELL_OUTPUT_MIMETYPE } from "../../../common/notebookContextKeys.js";
import { INotebookKernelService } from "../../../common/notebookKernelService.js";
import { getNotebookEditorFromEditorPane } from "../../notebookBrowser.js";
import * as icons from "../../notebookIcons.js";
import { getOutputViewModelFromId } from "../cellOutputActions.js";
import { NOTEBOOK_ACTIONS_CATEGORY } from "../coreActions.js";
import "./cellChatActions.js";
import { CTX_NOTEBOOK_CHAT_HAS_AGENT } from "./notebookChatContext.js";
import { IViewsService } from "../../../../../services/views/common/viewsService.js";
import { createNotebookOutputVariableEntry, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST } from "../../contrib/chat/notebookChatUtils.js";
const NotebookKernelVariableKey = "kernelVariable";
let NotebookChatContribution = class NotebookChatContribution2 extends Disposable {
  static {
    __name(this, "NotebookChatContribution");
  }
  static {
    this.ID = "workbench.contrib.notebookChatContribution";
  }
  constructor(contextKeyService, chatAgentService, editorService, chatWidgetService, notebookKernelService, languageFeaturesService) {
    super();
    this.editorService = editorService;
    this.chatWidgetService = chatWidgetService;
    this.notebookKernelService = notebookKernelService;
    this.languageFeaturesService = languageFeaturesService;
    this._ctxHasProvider = CTX_NOTEBOOK_CHAT_HAS_AGENT.bindTo(contextKeyService);
    const updateNotebookAgentStatus = /* @__PURE__ */ __name(() => {
      const hasNotebookAgent = Boolean(chatAgentService.getDefaultAgent(ChatAgentLocation.Notebook));
      this._ctxHasProvider.set(hasNotebookAgent);
    }, "updateNotebookAgentStatus");
    updateNotebookAgentStatus();
    this._register(chatAgentService.onDidChangeAgents(updateNotebookAgentStatus));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatKernelDynamicCompletions",
      triggerCharacters: [chatVariableLeader],
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.supportsFileReferences) {
          return null;
        }
        if (widget.location !== ChatAgentLocation.Notebook) {
          return null;
        }
        const variableNameDef = new RegExp(`${chatVariableLeader}\\w*`, "g");
        const range = computeCompletionRanges(model, position, variableNameDef, true);
        if (!range) {
          return null;
        }
        const result = { suggestions: [] };
        const afterRange = new Range(position.lineNumber, range.replace.startColumn, position.lineNumber, range.replace.startColumn + `${chatVariableLeader}${NotebookKernelVariableKey}:`.length);
        result.suggestions.push({
          label: `${chatVariableLeader}${NotebookKernelVariableKey}`,
          insertText: `${chatVariableLeader}${NotebookKernelVariableKey}:`,
          detail: localize("pickKernelVariableLabel", "Pick a variable from the kernel"),
          range,
          kind: 18,
          command: { id: SelectAndInsertKernelVariableAction.ID, title: SelectAndInsertKernelVariableAction.ID, arguments: [{ widget, range: afterRange }] },
          sortText: "z"
        });
        await this.addKernelVariableCompletion(widget, result, range, token);
        return result;
      }, "provideCompletionItems")
    }));
    NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT.bindTo(contextKeyService).set(NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST);
  }
  async addKernelVariableCompletion(widget, result, info, token) {
    let pattern;
    if (info.varWord?.word && info.varWord.word.startsWith(chatVariableLeader)) {
      pattern = info.varWord.word.toLowerCase().slice(1);
    }
    const notebook = getNotebookEditorFromEditorPane(this.editorService.activeEditorPane)?.getViewModel()?.notebookDocument;
    if (!notebook) {
      return;
    }
    const selectedKernel = this.notebookKernelService.getMatchingKernel(notebook).selected;
    const hasVariableProvider = selectedKernel?.hasVariableProvider;
    if (!hasVariableProvider) {
      return;
    }
    const variables = await selectedKernel.provideVariables(notebook.uri, void 0, "named", 0, CancellationToken.None);
    for await (const variable of variables) {
      if (pattern && !variable.name.toLowerCase().includes(pattern)) {
        continue;
      }
      result.suggestions.push({
        label: { label: variable.name, description: variable.type },
        insertText: `${chatVariableLeader}${NotebookKernelVariableKey}:${variable.name} `,
        filterText: `${chatVariableLeader}${variable.name}`,
        range: info,
        kind: 4,
        sortText: "z",
        command: { id: SelectAndInsertKernelVariableAction.ID, title: SelectAndInsertKernelVariableAction.ID, arguments: [{ widget, range: info.insert, variable: variable.name }] },
        detail: variable.type,
        documentation: variable.value
      });
    }
  }
};
NotebookChatContribution = __decorate([
  __param(0, IContextKeyService),
  __param(1, IChatAgentService),
  __param(2, IEditorService),
  __param(3, IChatWidgetService),
  __param(4, INotebookKernelService),
  __param(5, ILanguageFeaturesService)
], NotebookChatContribution);
class SelectAndInsertKernelVariableAction extends Action2 {
  static {
    __name(this, "SelectAndInsertKernelVariableAction");
  }
  constructor() {
    super({
      id: SelectAndInsertKernelVariableAction.ID,
      title: ""
      // not displayed
    });
  }
  static {
    this.ID = "notebook.chat.selectAndInsertKernelVariable";
  }
  async run(accessor, ...args) {
    const editorService = accessor.get(IEditorService);
    const notebookKernelService = accessor.get(INotebookKernelService);
    const quickInputService = accessor.get(IQuickInputService);
    const notebook = getNotebookEditorFromEditorPane(editorService.activeEditorPane)?.getViewModel()?.notebookDocument;
    if (!notebook) {
      return;
    }
    const context = args[0];
    if (!context || !("widget" in context) || !("range" in context)) {
      return;
    }
    const widget = context.widget;
    const range = context.range;
    const variable = context.variable;
    if (variable !== void 0) {
      this.addVariableReference(widget, variable, range, false);
      return;
    }
    const selectedKernel = notebookKernelService.getMatchingKernel(notebook).selected;
    const hasVariableProvider = selectedKernel?.hasVariableProvider;
    if (!hasVariableProvider) {
      return;
    }
    const variables = await selectedKernel.provideVariables(notebook.uri, void 0, "named", 0, CancellationToken.None);
    const quickPickItems = [];
    for await (const variable2 of variables) {
      quickPickItems.push({
        label: variable2.name,
        description: variable2.value,
        detail: variable2.type
      });
    }
    const pickedVariable = await quickInputService.pick(quickPickItems, { placeHolder: "Select a kernel variable" });
    if (!pickedVariable) {
      return;
    }
    this.addVariableReference(widget, pickedVariable.label, range, true);
  }
  addVariableReference(widget, variableName, range, updateText) {
    if (range) {
      const text = `#kernelVariable:${variableName}`;
      if (updateText) {
        const editor = widget.inputEditor;
        const success = editor.executeEdits("chatInsertFile", [{ range, text: text + " " }]);
        if (!success) {
          return;
        }
      }
      widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
        id: "vscode.notebook.variable",
        range: { startLineNumber: range.startLineNumber, startColumn: range.startColumn, endLineNumber: range.endLineNumber, endColumn: range.startColumn + text.length },
        data: variableName,
        fullName: variableName,
        icon: codiconsLibrary.variable
      });
    } else {
      widget.attachmentModel.addContext({
        id: "vscode.notebook.variable",
        name: variableName,
        value: variableName,
        icon: codiconsLibrary.variable,
        kind: "generic"
      });
    }
  }
}
registerAction2(class CopyCellOutputAction extends Action2 {
  static {
    __name(this, "CopyCellOutputAction");
  }
  constructor() {
    super({
      id: "notebook.cellOutput.addToChat",
      title: localize("notebookActions.addOutputToChat", "Add Cell Output to Chat"),
      menu: {
        id: MenuId.NotebookOutputToolbar,
        when: ContextKeyExpr.and(NOTEBOOK_CELL_HAS_OUTPUTS, ContextKeyExpr.in(NOTEBOOK_CELL_OUTPUT_MIMETYPE.key, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT.key)),
        order: 10,
        group: "notebook_chat_actions"
      },
      category: NOTEBOOK_ACTIONS_CATEGORY,
      icon: icons.copyIcon,
      precondition: ChatContextKeys.enabled
    });
  }
  getNoteboookEditor(editorService, outputContext) {
    if (outputContext && "notebookEditor" in outputContext) {
      return outputContext.notebookEditor;
    }
    return getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  }
  async run(accessor, outputContext) {
    const notebookEditor = this.getNoteboookEditor(accessor.get(IEditorService), outputContext);
    const viewService = accessor.get(IViewsService);
    if (!notebookEditor) {
      return;
    }
    let outputViewModel;
    if (outputContext && "outputId" in outputContext && typeof outputContext.outputId === "string") {
      outputViewModel = getOutputViewModelFromId(outputContext.outputId, notebookEditor);
    } else if (outputContext && "outputViewModel" in outputContext) {
      outputViewModel = outputContext.outputViewModel;
    }
    if (!outputViewModel) {
      const activeCell = notebookEditor.getActiveCell();
      if (!activeCell) {
        return;
      }
      if (activeCell.focusedOutputId !== void 0) {
        outputViewModel = activeCell.outputsViewModels.find((output) => {
          return output.model.outputId === activeCell.focusedOutputId;
        });
      } else {
        outputViewModel = activeCell.outputsViewModels.find((output) => output.pickedMimeType?.isTrusted);
      }
    }
    if (!outputViewModel) {
      return;
    }
    const mimeType = outputViewModel.pickedMimeType?.mimeType;
    const chatWidgetService = accessor.get(IChatWidgetService);
    let widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      const widgets = chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Panel);
      if (widgets.length === 0) {
        return;
      }
      widget = widgets[0];
    }
    if (mimeType && NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST.includes(mimeType)) {
      const entry = createNotebookOutputVariableEntry(outputViewModel, mimeType, notebookEditor);
      if (!entry) {
        return;
      }
      widget.attachmentModel.addContext(entry);
      (await showChatView(viewService))?.focusInput();
    }
  }
});
registerAction2(SelectAndInsertKernelVariableAction);
registerWorkbenchContribution2(
  NotebookChatContribution.ID,
  NotebookChatContribution,
  2
  /* WorkbenchPhase.BlockRestore */
);
export {
  SelectAndInsertKernelVariableAction
};
//# sourceMappingURL=notebook.chat.contribution.js.map
