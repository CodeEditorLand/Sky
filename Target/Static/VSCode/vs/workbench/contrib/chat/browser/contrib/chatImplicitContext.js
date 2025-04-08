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
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { autorun } from "../../../../../base/common/observable.js";
import { basename } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { ICodeEditor, isCodeEditor, isDiffEditor } from "../../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { Location } from "../../../../../editor/common/languages.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { EditorsOrder } from "../../../../common/editor.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { getNotebookEditorFromEditorPane, INotebookEditor } from "../../../notebook/browser/notebookBrowser.js";
import { IChatEditingService } from "../../common/chatEditingService.js";
import { IBaseChatRequestVariableEntry, IChatRequestImplicitVariableEntry } from "../../common/chatModel.js";
import { IChatService } from "../../common/chatService.js";
import { ChatAgentLocation } from "../../common/constants.js";
import { ILanguageModelIgnoredFilesService } from "../../common/ignoredFiles.js";
import { IChatWidget, IChatWidgetService } from "../chat.js";
let ChatImplicitContextContribution = class extends Disposable {
  constructor(codeEditorService, editorService, chatWidgetService, chatService, chatEditingService, configurationService, ignoredFilesService) {
    super();
    this.codeEditorService = codeEditorService;
    this.editorService = editorService;
    this.chatWidgetService = chatWidgetService;
    this.chatService = chatService;
    this.chatEditingService = chatEditingService;
    this.configurationService = configurationService;
    this.ignoredFilesService = ignoredFilesService;
    const activeEditorDisposables = this._register(new DisposableStore());
    this._register(Event.runAndSubscribe(
      editorService.onDidActiveEditorChange,
      () => {
        activeEditorDisposables.clear();
        const codeEditor = this.findActiveCodeEditor();
        if (codeEditor) {
          activeEditorDisposables.add(Event.debounce(
            Event.any(
              codeEditor.onDidChangeModel,
              codeEditor.onDidChangeCursorSelection,
              codeEditor.onDidScrollChange
            ),
            () => void 0,
            500
          )(() => this.updateImplicitContext()));
        }
        const notebookEditor = this.findActiveNotebookEditor();
        if (notebookEditor) {
          activeEditorDisposables.add(Event.debounce(
            Event.any(
              notebookEditor.onDidChangeModel,
              notebookEditor.onDidChangeActiveCell
            ),
            () => void 0,
            500
          )(() => this.updateImplicitContext()));
        }
        this.updateImplicitContext();
      }
    ));
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
        widget.input.implicitContext.setValue(void 0, false);
      }
    }));
    this._register(this.chatWidgetService.onDidAddWidget(async (widget) => {
      await this.updateImplicitContext(widget);
    }));
  }
  static {
    __name(this, "ChatImplicitContextContribution");
  }
  static ID = "chat.implicitContext";
  _currentCancelTokenSource = this._register(new MutableDisposable());
  _implicitContextEnablement = this.configurationService.getValue("chat.implicitContext.enabled");
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
    for (const codeOrDiffEditor of this.editorService.getVisibleTextEditorControls(EditorsOrder.MOST_RECENTLY_ACTIVE)) {
      let codeEditor2;
      if (isDiffEditor(codeOrDiffEditor)) {
        codeEditor2 = codeOrDiffEditor.getModifiedEditor();
      } else if (isCodeEditor(codeOrDiffEditor)) {
        codeEditor2 = codeOrDiffEditor;
      } else {
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
    if (model) {
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
        newValue = activeCell.uri;
      } else {
        newValue = notebookEditor.textModel?.uri;
      }
    }
    const uri = newValue instanceof URI ? newValue : newValue?.uri;
    if (uri && await this.ignoredFilesService.fileIsIgnored(uri, cancelTokenSource.token)) {
      newValue = void 0;
    }
    if (cancelTokenSource.token.isCancellationRequested) {
      return;
    }
    const widgets = updateWidget ? [updateWidget] : [...this.chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Panel), ...this.chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Editor)];
    for (const widget of widgets) {
      if (!widget.input.implicitContext) {
        continue;
      }
      const setting = this._implicitContextEnablement[widget.location];
      const isFirstInteraction = widget.viewModel?.getItems().length === 0;
      if (setting === "first" && !isFirstInteraction) {
        widget.input.implicitContext.setValue(void 0, false);
      } else if (setting === "always" || setting === "first" && isFirstInteraction) {
        widget.input.implicitContext.setValue(newValue, isSelection);
      } else if (setting === "never") {
        widget.input.implicitContext.setValue(void 0, false);
      }
    }
  }
};
ChatImplicitContextContribution = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IChatWidgetService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IChatEditingService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ILanguageModelIgnoredFilesService)
], ChatImplicitContextContribution);
class ChatImplicitContext extends Disposable {
  static {
    __name(this, "ChatImplicitContext");
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
  kind = "implicit";
  get modelDescription() {
    if (URI.isUri(this.value)) {
      return `User's active file`;
    } else if (this._isSelection) {
      return `User's active selection`;
    } else {
      return `User's current visible code`;
    }
  }
  isFile = true;
  _isSelection = false;
  get isSelection() {
    return this._isSelection;
  }
  _onDidChangeValue = new Emitter();
  onDidChangeValue = this._onDidChangeValue.event;
  _value;
  get value() {
    return this._value;
  }
  _enabled = true;
  get enabled() {
    return this._enabled;
  }
  set enabled(value) {
    this._enabled = value;
    this._onDidChangeValue.fire();
  }
  constructor(value) {
    super();
    this._value = value;
  }
  setValue(value, isSelection) {
    this._value = value;
    this._isSelection = isSelection;
    this._onDidChangeValue.fire();
  }
  toBaseEntry() {
    return {
      id: this.id,
      name: this.name,
      value: this.value,
      isFile: true,
      modelDescription: this.modelDescription
    };
  }
}
export {
  ChatImplicitContext,
  ChatImplicitContextContribution
};
//# sourceMappingURL=chatImplicitContext.js.map
