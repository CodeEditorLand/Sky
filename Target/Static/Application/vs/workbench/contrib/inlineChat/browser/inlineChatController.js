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
var InlineChatController_1;
import { renderAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { raceCancellation } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { autorun, derived, observableFromEvent, observableSignalFromEvent, observableValue, waitForState } from "../../../../base/common/observable.js";
import { isEqual } from "../../../../base/common/resources.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { observableCodeEditor } from "../../../../editor/browser/observableCodeEditor.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { IMarkerDecorationsService } from "../../../../editor/common/services/markerDecorations.js";
import { localize } from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { ISharedWebContentExtractorService } from "../../../../platform/webContentExtractor/common/webContentExtractor.js";
import { IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { IChatAttachmentResolveService } from "../../chat/browser/attachments/chatAttachmentResolveService.js";
import { ChatMode } from "../../chat/common/chatModes.js";
import { IChatService } from "../../chat/common/chatService/chatService.js";
import { IDiagnosticVariableEntryFilterData } from "../../chat/common/attachments/chatVariableEntries.js";
import { isResponseVM } from "../../chat/common/model/chatViewModel.js";
import { ChatAgentLocation } from "../../chat/common/constants.js";
import { ILanguageModelsService, isILanguageModelChatSelector } from "../../chat/common/languageModels.js";
import { isNotebookContainingCellEditor as isNotebookWithCellEditor } from "../../notebook/browser/notebookEditor.js";
import { INotebookEditorService } from "../../notebook/browser/services/notebookEditorService.js";
import { CellUri } from "../../notebook/common/notebookCommon.js";
import { INotebookService } from "../../notebook/common/notebookService.js";
import { CTX_INLINE_CHAT_VISIBLE } from "../common/inlineChat.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
import { InlineChatZoneWidget } from "./inlineChatZoneWidget.js";
class InlineChatRunOptions {
  static {
    __name(this, "InlineChatRunOptions");
  }
  static isInlineChatRunOptions(options) {
    if (typeof options !== "object" || options === null) {
      return false;
    }
    const { initialSelection, initialRange, message, autoSend, position, attachments, modelSelector, resolveOnResponse } = options;
    if (typeof message !== "undefined" && typeof message !== "string" || typeof autoSend !== "undefined" && typeof autoSend !== "boolean" || typeof initialRange !== "undefined" && !Range.isIRange(initialRange) || typeof initialSelection !== "undefined" && !Selection.isISelection(initialSelection) || typeof position !== "undefined" && !Position.isIPosition(position) || typeof attachments !== "undefined" && (!Array.isArray(attachments) || !attachments.every((item) => item instanceof URI)) || typeof modelSelector !== "undefined" && !isILanguageModelChatSelector(modelSelector) || typeof resolveOnResponse !== "undefined" && typeof resolveOnResponse !== "boolean") {
      return false;
    }
    return true;
  }
}
function getEditorId(editor, model) {
  return `${editor.getId()},${model.id}`;
}
__name(getEditorId, "getEditorId");
let InlineChatController = class InlineChatController2 {
  static {
    __name(this, "InlineChatController");
  }
  static {
    InlineChatController_1 = this;
  }
  static {
    this.ID = "editor.contrib.inlineChatController";
  }
  static get(editor) {
    return editor.getContribution(InlineChatController_1.ID) ?? void 0;
  }
  static {
    this._selectVendorDefaultLanguageModel = true;
  }
  get widget() {
    return this._zone.value.widget;
  }
  get isActive() {
    return Boolean(this._currentSession.get());
  }
  constructor(_editor, _instaService, _notebookEditorService, _inlineChatSessionService, codeEditorService, contextKeyService, _configurationService, _webContentExtractorService, _fileService, _chatAttachmentResolveService, _editorService, _markerDecorationsService, _languageModelService) {
    this._editor = _editor;
    this._instaService = _instaService;
    this._notebookEditorService = _notebookEditorService;
    this._inlineChatSessionService = _inlineChatSessionService;
    this._configurationService = _configurationService;
    this._webContentExtractorService = _webContentExtractorService;
    this._fileService = _fileService;
    this._chatAttachmentResolveService = _chatAttachmentResolveService;
    this._editorService = _editorService;
    this._markerDecorationsService = _markerDecorationsService;
    this._languageModelService = _languageModelService;
    this._store = new DisposableStore();
    this._isActiveController = observableValue(this, false);
    const ctxInlineChatVisible = CTX_INLINE_CHAT_VISIBLE.bindTo(contextKeyService);
    const notebookAgentConfig = observableConfigValue("inlineChat.notebookAgent", false, this._configurationService);
    this._zone = new Lazy(() => {
      assertType(this._editor.hasModel(), "[Illegal State] widget should only be created when the editor has a model");
      const location = {
        location: ChatAgentLocation.EditorInline,
        resolveData: /* @__PURE__ */ __name(() => {
          assertType(this._editor.hasModel());
          const wholeRange = this._editor.getSelection();
          const document = this._editor.getModel().uri;
          return {
            type: ChatAgentLocation.EditorInline,
            id: getEditorId(this._editor, this._editor.getModel()),
            selection: this._editor.getSelection(),
            document,
            wholeRange
          };
        }, "resolveData")
      };
      const notebookEditor = this._notebookEditorService.getNotebookForPossibleCell(this._editor);
      if (!!notebookEditor) {
        location.location = ChatAgentLocation.Notebook;
        if (notebookAgentConfig.get()) {
          location.resolveData = () => {
            assertType(this._editor.hasModel());
            return {
              type: ChatAgentLocation.Notebook,
              sessionInputUri: this._editor.getModel().uri
            };
          };
        }
      }
      const result = this._instaService.createInstance(InlineChatZoneWidget, location, {
        enableWorkingSet: "implicit",
        enableImplicitContext: false,
        renderInputOnTop: false,
        renderInputToolbarBelowInput: true,
        filter: /* @__PURE__ */ __name((item) => {
          if (!isResponseVM(item)) {
            return false;
          }
          return !!item.model.isPendingConfirmation.get();
        }, "filter"),
        menus: {
          telemetrySource: "inlineChatWidget",
          executeToolbar: MenuId.ChatEditorInlineExecute,
          inputSideToolbar: MenuId.ChatEditorInlineInputSide
        },
        defaultMode: ChatMode.Ask
      }, { editor: this._editor, notebookEditor }, () => Promise.resolve());
      this._store.add(result);
      result.domNode.classList.add("inline-chat-2");
      return result;
    });
    const editorObs = observableCodeEditor(_editor);
    const sessionsSignal = observableSignalFromEvent(this, _inlineChatSessionService.onDidChangeSessions);
    this._currentSession = derived((r) => {
      sessionsSignal.read(r);
      const model = editorObs.model.read(r);
      const session = model && _inlineChatSessionService.getSessionByTextModel(model.uri);
      return session ?? void 0;
    });
    let lastSession = void 0;
    this._store.add(autorun((r) => {
      const session = this._currentSession.read(r);
      if (!session) {
        this._isActiveController.set(false, void 0);
        if (lastSession && !lastSession.chatModel.hasRequests) {
          const state = lastSession.chatModel.inputModel.state.read(void 0);
          if (!state || !state.inputText && state.attachments.length === 0) {
            lastSession.dispose();
            lastSession = void 0;
          }
        }
        return;
      }
      lastSession = session;
      let foundOne = false;
      for (const editor of codeEditorService.listCodeEditors()) {
        if (Boolean(InlineChatController_1.get(editor)?._isActiveController.read(void 0))) {
          foundOne = true;
          break;
        }
      }
      if (!foundOne && editorObs.isFocused.read(r)) {
        this._isActiveController.set(true, void 0);
      }
    }));
    const visibleSessionObs = observableValue(this, void 0);
    this._store.add(autorun((r) => {
      const model = editorObs.model.read(r);
      const session = this._currentSession.read(r);
      const isActive = this._isActiveController.read(r);
      if (!session || !isActive || !model) {
        visibleSessionObs.set(void 0, void 0);
      } else {
        visibleSessionObs.set(session, void 0);
      }
    }));
    const defaultPlaceholderObs = visibleSessionObs.map((session, r) => {
      return session?.initialSelection.isEmpty() ? localize("placeholder", "Generate code") : localize("placeholderWithSelection", "Modify selected code");
    });
    this._store.add(autorun((r) => {
      const session = visibleSessionObs.read(r);
      if (!session) {
        this._zone.rawValue?.hide();
        this._zone.rawValue?.widget.chatWidget.setModel(void 0);
        _editor.focus();
        ctxInlineChatVisible.reset();
      } else {
        ctxInlineChatVisible.set(true);
        this._zone.value.widget.chatWidget.setModel(session.chatModel);
        if (!this._zone.value.position) {
          this._zone.value.widget.chatWidget.setInputPlaceholder(defaultPlaceholderObs.read(r));
          this._zone.value.widget.chatWidget.input.renderAttachedContext();
          this._zone.value.show(session.initialPosition);
        }
        this._zone.value.reveal(this._zone.value.position);
        this._zone.value.widget.focus();
      }
    }));
    this._store.add(autorun((r) => {
      const session = visibleSessionObs.read(r);
      if (session) {
        const entries = session.editingSession.entries.read(r);
        const sessionCellUri = CellUri.parse(session.uri);
        const otherEntries = entries.filter((entry) => {
          if (isEqual(entry.modifiedURI, session.uri)) {
            return false;
          }
          if (!!sessionCellUri && isEqual(sessionCellUri.notebook, entry.modifiedURI)) {
            return false;
          }
          return true;
        });
        for (const entry of otherEntries) {
          this._editorService.openEditor({ resource: entry.modifiedURI }, SIDE_GROUP).catch(onUnexpectedError);
        }
      }
    }));
    const lastResponseObs = visibleSessionObs.map((session, r) => {
      if (!session) {
        return;
      }
      const lastRequest = observableFromEvent(this, session.chatModel.onDidChange, () => session.chatModel.getRequests().at(-1)).read(r);
      return lastRequest?.response;
    });
    const lastResponseProgressObs = lastResponseObs.map((response, r) => {
      if (!response) {
        return;
      }
      return observableFromEvent(this, response.onDidChange, () => response.response.value.findLast((part) => part.kind === "progressMessage")).read(r);
    });
    this._store.add(autorun((r) => {
      const response = lastResponseObs.read(r);
      this._zone.rawValue?.widget.updateInfo("");
      if (!response?.isInProgress.read(r)) {
        if (response?.result?.errorDetails) {
          this._zone.rawValue?.widget.updateInfo(`$(error) ${response.result.errorDetails.message}`);
          alert(response.result.errorDetails.message);
        }
        this._zone.rawValue?.widget.domNode.classList.toggle("request-in-progress", false);
        this._zone.rawValue?.widget.chatWidget.setInputPlaceholder(defaultPlaceholderObs.read(r));
      } else {
        this._zone.rawValue?.widget.domNode.classList.toggle("request-in-progress", true);
        let placeholder = response.request?.message.text;
        const lastProgress = lastResponseProgressObs.read(r);
        if (lastProgress) {
          placeholder = renderAsPlaintext(lastProgress.content);
        }
        this._zone.rawValue?.widget.chatWidget.setInputPlaceholder(placeholder || localize("loading", "Working..."));
      }
    }));
    this._store.add(autorun((r) => {
      const session = visibleSessionObs.read(r);
      if (!session) {
        return;
      }
      const entry = session.editingSession.readEntry(session.uri, r);
      if (entry?.state.read(r) === 0) {
        entry?.enableReviewModeUntilSettled();
      }
    }));
    this._store.add(autorun((r) => {
      const session = visibleSessionObs.read(r);
      const entry = session?.editingSession.readEntry(session.uri, r);
      const pane = this._editorService.visibleEditorPanes.find((candidate) => candidate.getControl() === this._editor || isNotebookWithCellEditor(candidate, this._editor));
      if (pane && entry) {
        entry?.getEditorIntegration(pane);
      }
      if (entry?.diffInfo && this._zone.value.position) {
        const { position } = this._zone.value;
        const diff = entry.diffInfo.read(r);
        for (const change of diff.changes) {
          if (change.modified.contains(position.lineNumber)) {
            this._zone.value.updatePositionAndHeight(new Position(change.modified.startLineNumber - 1, 1));
            break;
          }
        }
      }
    }));
  }
  dispose() {
    this._store.dispose();
  }
  getWidgetPosition() {
    return this._zone.rawValue?.position;
  }
  focus() {
    this._zone.rawValue?.widget.focus();
  }
  async run(arg) {
    assertType(this._editor.hasModel());
    const uri = this._editor.getModel().uri;
    const existingSession = this._inlineChatSessionService.getSessionByTextModel(uri);
    if (existingSession) {
      await existingSession.editingSession.accept();
      existingSession.dispose();
    }
    this._isActiveController.set(true, void 0);
    const session = this._inlineChatSessionService.createSession(this._editor);
    const store = new DisposableStore();
    const persistModelChoice = this._configurationService.getValue(
      "inlineChat.persistModelChoice"
      /* InlineChatConfigKeys.PersistModelChoice */
    );
    const model = this._zone.value.widget.chatWidget.input.selectedLanguageModel;
    if (!persistModelChoice && InlineChatController_1._selectVendorDefaultLanguageModel && model && !model.metadata.isDefaultForLocation[session.chatModel.initialLocation]) {
      const ids = await this._languageModelService.selectLanguageModels({ vendor: model.metadata.vendor });
      for (const identifier of ids) {
        const candidate = this._languageModelService.lookupLanguageModel(identifier);
        if (candidate?.isDefaultForLocation[session.chatModel.initialLocation]) {
          this._zone.value.widget.chatWidget.input.setCurrentLanguageModel({ metadata: candidate, identifier });
          break;
        }
      }
    }
    store.add(this._zone.value.widget.chatWidget.input.onDidChangeCurrentLanguageModel((newModel) => {
      InlineChatController_1._selectVendorDefaultLanguageModel = Boolean(newModel.metadata.isDefaultForLocation[session.chatModel.initialLocation]);
    }));
    const entries = [];
    for (const [range, marker] of this._markerDecorationsService.getLiveMarkers(uri)) {
      if (range.intersectRanges(this._editor.getSelection())) {
        const filter = IDiagnosticVariableEntryFilterData.fromMarker(marker);
        entries.push(IDiagnosticVariableEntryFilterData.toEntry(filter));
      }
    }
    if (entries.length > 0) {
      this._zone.value.widget.chatWidget.attachmentModel.addContext(...entries);
      this._zone.value.widget.chatWidget.input.setValue(entries.length > 1 ? localize("fixN", "Fix the attached problems") : localize("fix1", "Fix the attached problem"), true);
      this._zone.value.widget.chatWidget.inputEditor.setSelection(new Selection(1, 1, Number.MAX_SAFE_INTEGER, 1));
    }
    if (arg && InlineChatRunOptions.isInlineChatRunOptions(arg)) {
      if (arg.initialRange) {
        this._editor.revealRange(arg.initialRange);
      }
      if (arg.initialSelection) {
        this._editor.setSelection(arg.initialSelection);
      }
      if (arg.attachments) {
        await Promise.all(arg.attachments.map(async (attachment) => {
          await this._zone.value.widget.chatWidget.attachmentModel.addFile(attachment);
        }));
        delete arg.attachments;
      }
      if (arg.modelSelector) {
        const id = (await this._languageModelService.selectLanguageModels(arg.modelSelector)).sort().at(0);
        if (!id) {
          throw new Error(`No language models found matching selector: ${JSON.stringify(arg.modelSelector)}.`);
        }
        const model2 = this._languageModelService.lookupLanguageModel(id);
        if (!model2) {
          throw new Error(`Language model not loaded: ${id}.`);
        }
        this._zone.value.widget.chatWidget.input.setCurrentLanguageModel({ metadata: model2, identifier: id });
      }
      if (arg.message) {
        this._zone.value.widget.chatWidget.setInput(arg.message);
        if (arg.autoSend) {
          await this._zone.value.widget.chatWidget.acceptInput();
        }
      }
    }
    try {
      if (!arg?.resolveOnResponse) {
        await Event.toPromise(session.editingSession.onDidDispose);
        const rejected = session.editingSession.getEntry(uri)?.state.get() === 2;
        return !rejected;
      } else {
        const modifiedObs = derived((r) => {
          const entry = session.editingSession.readEntry(uri, r);
          return entry?.state.read(r) === 0 && !entry?.isCurrentlyBeingModifiedBy.read(r);
        });
        await waitForState(modifiedObs, (state) => state === true);
        return true;
      }
    } finally {
      store.dispose();
    }
  }
  async acceptSession() {
    const session = this._currentSession.get();
    if (!session) {
      return;
    }
    await session.editingSession.accept();
    session.dispose();
  }
  async rejectSession() {
    const session = this._currentSession.get();
    if (!session) {
      return;
    }
    await session.editingSession.reject();
    session.dispose();
  }
  async createImageAttachment(attachment) {
    const value = this._currentSession.get();
    if (!value) {
      return void 0;
    }
    if (attachment.scheme === Schemas.file) {
      if (await this._fileService.canHandleResource(attachment)) {
        return await this._chatAttachmentResolveService.resolveImageEditorAttachContext(attachment);
      }
    } else if (attachment.scheme === Schemas.http || attachment.scheme === Schemas.https) {
      const extractedImages = await this._webContentExtractorService.readImage(attachment, CancellationToken.None);
      if (extractedImages) {
        return await this._chatAttachmentResolveService.resolveImageEditorAttachContext(attachment, extractedImages);
      }
    }
    return void 0;
  }
};
InlineChatController = InlineChatController_1 = __decorate([
  __param(1, IInstantiationService),
  __param(2, INotebookEditorService),
  __param(3, IInlineChatSessionService),
  __param(4, ICodeEditorService),
  __param(5, IContextKeyService),
  __param(6, IConfigurationService),
  __param(7, ISharedWebContentExtractorService),
  __param(8, IFileService),
  __param(9, IChatAttachmentResolveService),
  __param(10, IEditorService),
  __param(11, IMarkerDecorationsService),
  __param(12, ILanguageModelsService)
], InlineChatController);
async function reviewEdits(accessor, editor, stream, token, applyCodeBlockSuggestionId) {
  if (!editor.hasModel()) {
    return false;
  }
  const chatService = accessor.get(IChatService);
  const uri = editor.getModel().uri;
  const chatModelRef = chatService.startSession(ChatAgentLocation.EditorInline);
  const chatModel = chatModelRef.object;
  chatModel.startEditingSession(true);
  const store = new DisposableStore();
  store.add(chatModelRef);
  const chatRequest = chatModel?.addRequest({ text: "", parts: [] }, { variables: [] }, 0, {
    kind: void 0,
    modeId: "applyCodeBlock",
    modeInstructions: void 0,
    isBuiltin: true,
    applyCodeBlockSuggestionId
  });
  assertType(chatRequest.response);
  chatRequest.response.updateContent({ kind: "textEdit", uri, edits: [], done: false });
  for await (const chunk of stream) {
    if (token.isCancellationRequested) {
      chatRequest.response.cancel();
      break;
    }
    chatRequest.response.updateContent({ kind: "textEdit", uri, edits: chunk, done: false });
  }
  chatRequest.response.updateContent({ kind: "textEdit", uri, edits: [], done: true });
  if (!token.isCancellationRequested) {
    chatRequest.response.complete();
  }
  const isSettled = derived((r) => {
    const entry = chatModel.editingSession?.readEntry(uri, r);
    if (!entry) {
      return false;
    }
    const state = entry.state.read(r);
    return state === 1 || state === 2;
  });
  const whenDecided = waitForState(isSettled, Boolean);
  await raceCancellation(whenDecided, token);
  store.dispose();
  return true;
}
__name(reviewEdits, "reviewEdits");
async function reviewNotebookEdits(accessor, uri, stream, token) {
  const chatService = accessor.get(IChatService);
  const notebookService = accessor.get(INotebookService);
  const isNotebook = notebookService.hasSupportedNotebooks(uri);
  const chatModelRef = chatService.startSession(ChatAgentLocation.EditorInline);
  const chatModel = chatModelRef.object;
  chatModel.startEditingSession(true);
  const store = new DisposableStore();
  store.add(chatModelRef);
  const chatRequest = chatModel?.addRequest({ text: "", parts: [] }, { variables: [] }, 0);
  assertType(chatRequest.response);
  if (isNotebook) {
    chatRequest.response.updateContent({ kind: "notebookEdit", uri, edits: [], done: false });
  } else {
    chatRequest.response.updateContent({ kind: "textEdit", uri, edits: [], done: false });
  }
  for await (const chunk of stream) {
    if (token.isCancellationRequested) {
      chatRequest.response.cancel();
      break;
    }
    if (chunk.every(isCellEditOperation)) {
      chatRequest.response.updateContent({ kind: "notebookEdit", uri, edits: chunk, done: false });
    } else {
      chatRequest.response.updateContent({ kind: "textEdit", uri: chunk[0], edits: chunk[1], done: false });
    }
  }
  if (isNotebook) {
    chatRequest.response.updateContent({ kind: "notebookEdit", uri, edits: [], done: true });
  } else {
    chatRequest.response.updateContent({ kind: "textEdit", uri, edits: [], done: true });
  }
  if (!token.isCancellationRequested) {
    chatRequest.response.complete();
  }
  const isSettled = derived((r) => {
    const entry = chatModel.editingSession?.readEntry(uri, r);
    if (!entry) {
      return false;
    }
    const state = entry.state.read(r);
    return state === 1 || state === 2;
  });
  const whenDecided = waitForState(isSettled, Boolean);
  await raceCancellation(whenDecided, token);
  store.dispose();
  return true;
}
__name(reviewNotebookEdits, "reviewNotebookEdits");
function isCellEditOperation(edit) {
  if (URI.isUri(edit)) {
    return false;
  }
  if (Array.isArray(edit)) {
    return false;
  }
  return true;
}
__name(isCellEditOperation, "isCellEditOperation");
export {
  InlineChatController,
  InlineChatRunOptions,
  reviewEdits,
  reviewNotebookEdits
};
//# sourceMappingURL=inlineChatController.js.map
