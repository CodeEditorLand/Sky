var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { autorun } from "../../../../../base/common/observable.js";
import { basename, isEqual } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { getCodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { getNotebookEditorFromEditorPane } from "../../../notebook/browser/notebookBrowser.js";
import { IChatEditingService } from "../../common/chatEditingService.js";
import { IChatService } from "../../common/chatService.js";
import { ChatAgentLocation } from "../../common/constants.js";
import { ILanguageModelIgnoredFilesService } from "../../common/ignoredFiles.js";
import { getPromptsTypeForLanguageId } from "../../common/promptSyntax/promptTypes.js";
import { IChatWidgetService } from "../chat.js";
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
let ChatImplicitContextContribution = class ChatImplicitContextContribution2 extends Disposable {
  static {
    __name(this, "ChatImplicitContextContribution");
  }
  static {
    this.ID = "chat.implicitContext";
  }
  constructor(codeEditorService, editorService, chatWidgetService, chatService, chatEditingService, configurationService, ignoredFilesService) {
    super();
    this.codeEditorService = codeEditorService;
    this.editorService = editorService;
    this.chatWidgetService = chatWidgetService;
    this.chatService = chatService;
    this.chatEditingService = chatEditingService;
    this.configurationService = configurationService;
    this.ignoredFilesService = ignoredFilesService;
    this._currentCancelTokenSource = this._register(new MutableDisposable());
    this._implicitContextEnablement = this.configurationService.getValue("chat.implicitContext.enabled");
    const activeEditorDisposables = this._register(new DisposableStore());
    this._register(Event.runAndSubscribe(editorService.onDidActiveEditorChange, () => {
      activeEditorDisposables.clear();
      const codeEditor = this.findActiveCodeEditor();
      if (codeEditor) {
        activeEditorDisposables.add(Event.debounce(Event.any(codeEditor.onDidChangeModel, codeEditor.onDidChangeModelLanguage, codeEditor.onDidChangeCursorSelection, codeEditor.onDidScrollChange), () => void 0, 500)(() => this.updateImplicitContext()));
      }
      const notebookEditor = this.findActiveNotebookEditor();
      if (notebookEditor) {
        const activeCellDisposables = activeEditorDisposables.add(new DisposableStore());
        activeEditorDisposables.add(notebookEditor.onDidChangeActiveCell(() => {
          activeCellDisposables.clear();
          const codeEditor2 = this.codeEditorService.getActiveCodeEditor();
          if (codeEditor2 && codeEditor2.getModel()?.uri.scheme === Schemas.vscodeNotebookCell) {
            activeCellDisposables.add(Event.debounce(Event.any(codeEditor2.onDidChangeModel, codeEditor2.onDidChangeCursorSelection, codeEditor2.onDidScrollChange), () => void 0, 500)(() => this.updateImplicitContext()));
          }
        }));
        activeEditorDisposables.add(Event.debounce(Event.any(notebookEditor.onDidChangeModel, notebookEditor.onDidChangeActiveCell), () => void 0, 500)(() => this.updateImplicitContext()));
      }
      this.updateImplicitContext();
    }));
    this._register(autorun((reader) => {
      this.chatEditingService.editingSessionsObs.read(reader);
      this.updateImplicitContext();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.implicitContext.enabled")) {
        this._implicitContextEnablement = this.configurationService.getValue("chat.implicitContext.enabled");
        this.updateImplicitContext();
      }
    }));
    this._register(this.chatService.onDidSubmitRequest(({ chatSessionId }) => {
      const widget = this.chatWidgetService.getWidgetBySessionId(chatSessionId);
      if (!widget?.input.implicitContext) {
        return;
      }
      if (this._implicitContextEnablement[widget.location] === "first" && widget.viewModel?.getItems().length !== 0) {
        widget.input.implicitContext.setValue(void 0, false, void 0);
      }
    }));
    this._register(this.chatWidgetService.onDidAddWidget(async (widget) => {
      await this.updateImplicitContext(widget);
    }));
  }
  findActiveCodeEditor() {
    const codeEditor = this.codeEditorService.getActiveCodeEditor();
    if (codeEditor) {
      const model = codeEditor.getModel();
      if (model?.uri.scheme === Schemas.vscodeNotebookCell) {
        return void 0;
      }
      if (model) {
        return codeEditor;
      }
    }
    for (const codeOrDiffEditor of this.editorService.getVisibleTextEditorControls(
      0
      /* EditorsOrder.MOST_RECENTLY_ACTIVE */
    )) {
      const codeEditor2 = getCodeEditor(codeOrDiffEditor);
      if (!codeEditor2) {
        continue;
      }
      const model = codeEditor2.getModel();
      if (model) {
        return codeEditor2;
      }
    }
    return void 0;
  }
  findActiveNotebookEditor() {
    return getNotebookEditorFromEditorPane(this.editorService.activeEditorPane);
  }
  async updateImplicitContext(updateWidget) {
    const cancelTokenSource = this._currentCancelTokenSource.value = new CancellationTokenSource();
    const codeEditor = this.findActiveCodeEditor();
    const model = codeEditor?.getModel();
    const selection = codeEditor?.getSelection();
    let newValue;
    let isSelection = false;
    let languageId;
    if (model) {
      languageId = model.getLanguageId();
      if (selection && !selection.isEmpty()) {
        newValue = { uri: model.uri, range: selection };
        isSelection = true;
      } else {
        const visibleRanges = codeEditor?.getVisibleRanges();
        if (visibleRanges && visibleRanges.length > 0) {
          let range = visibleRanges[0];
          visibleRanges.slice(1).forEach((r) => {
            range = range.plusRange(r);
          });
          newValue = { uri: model.uri, range };
        } else {
          newValue = model.uri;
        }
      }
    }
    const notebookEditor = this.findActiveNotebookEditor();
    if (notebookEditor) {
      const activeCell = notebookEditor.getActiveCell();
      if (activeCell) {
        const codeEditor2 = this.codeEditorService.getActiveCodeEditor();
        const selection2 = codeEditor2?.getSelection();
        const visibleRanges = codeEditor2?.getVisibleRanges() || [];
        newValue = activeCell.uri;
        if (isEqual(codeEditor2?.getModel()?.uri, activeCell.uri)) {
          if (selection2 && !selection2.isEmpty()) {
            newValue = { uri: activeCell.uri, range: selection2 };
            isSelection = true;
          } else if (visibleRanges.length > 0) {
            let range = visibleRanges[0];
            visibleRanges.slice(1).forEach((r) => {
              range = range.plusRange(r);
            });
            newValue = { uri: activeCell.uri, range };
          }
        }
      } else {
        newValue = notebookEditor.textModel?.uri;
      }
    }
    const uri = newValue instanceof URI ? newValue : newValue?.uri;
    if (uri && (await this.ignoredFilesService.fileIsIgnored(uri, cancelTokenSource.token) || uri.path.endsWith(".copilotmd"))) {
      newValue = void 0;
    }
    if (cancelTokenSource.token.isCancellationRequested) {
      return;
    }
    const isPromptFile = languageId && getPromptsTypeForLanguageId(languageId) !== void 0;
    const widgets = updateWidget ? [updateWidget] : [...this.chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Panel), ...this.chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Editor)];
    for (const widget of widgets) {
      if (!widget.input.implicitContext) {
        continue;
      }
      const setting = this._implicitContextEnablement[widget.location];
      const isFirstInteraction = widget.viewModel?.getItems().length === 0;
      if ((setting === "always" || setting === "first" && isFirstInteraction) && !isPromptFile) {
        widget.input.implicitContext.setValue(newValue, isSelection, languageId);
      } else {
        widget.input.implicitContext.setValue(void 0, false, void 0);
      }
    }
  }
};
ChatImplicitContextContribution = __decorate([
  __param(0, ICodeEditorService),
  __param(1, IEditorService),
  __param(2, IChatWidgetService),
  __param(3, IChatService),
  __param(4, IChatEditingService),
  __param(5, IConfigurationService),
  __param(6, ILanguageModelIgnoredFilesService)
], ChatImplicitContextContribution);
class ChatImplicitContext extends Disposable {
  static {
    __name(this, "ChatImplicitContext");
  }
  constructor() {
    super(...arguments);
    this.kind = "implicit";
    this.isFile = true;
    this._isSelection = false;
    this._onDidChangeValue = this._register(new Emitter());
    this.onDidChangeValue = this._onDidChangeValue.event;
    this._enabled = true;
  }
  get id() {
    if (URI.isUri(this.value)) {
      return "vscode.implicit.file";
    } else if (this.value) {
      if (this._isSelection) {
        return "vscode.implicit.selection";
      } else {
        return "vscode.implicit.viewport";
      }
    } else {
      return "vscode.implicit";
    }
  }
  get name() {
    if (URI.isUri(this.value)) {
      return `file:${basename(this.value)}`;
    } else if (this.value) {
      return `file:${basename(this.value.uri)}`;
    } else {
      return "implicit";
    }
  }
  get modelDescription() {
    if (URI.isUri(this.value)) {
      return `User's active file`;
    } else if (this._isSelection) {
      return `User's active selection`;
    } else {
      return `User's current visible code`;
    }
  }
  get isSelection() {
    return this._isSelection;
  }
  get value() {
    return this._value;
  }
  get enabled() {
    return this._enabled;
  }
  set enabled(value) {
    this._enabled = value;
    this._onDidChangeValue.fire();
  }
  setValue(value, isSelection, languageId) {
    this._value = value;
    this._isSelection = isSelection;
    this._onDidChangeValue.fire();
  }
  toBaseEntries() {
    return [{
      kind: "file",
      id: this.id,
      name: this.name,
      value: this.value,
      modelDescription: this.modelDescription
    }];
  }
}
export {
  ChatImplicitContext,
  ChatImplicitContextContribution
};
//# sourceMappingURL=chatImplicitContext.js.map
