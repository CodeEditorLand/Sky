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
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { Barrier, DeferredPromise, Queue, raceCancellation } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { MovingAverage } from "../../../../base/common/numbers.js";
import { autorun, autorunWithStore, derived, IObservable, observableSignalFromEvent, observableValue, transaction, waitForState } from "../../../../base/common/observable.js";
import { isEqual } from "../../../../base/common/resources.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { assertType } from "../../../../base/common/types.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { ICodeEditor, isCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { observableCodeEditor } from "../../../../editor/browser/observableCodeEditor.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { EditorOption } from "../../../../editor/common/config/editorOptions.js";
import { IPosition, Position } from "../../../../editor/common/core/position.js";
import { IRange, Range } from "../../../../editor/common/core/range.js";
import { ISelection, Selection, SelectionDirection } from "../../../../editor/common/core/selection.js";
import { IEditorContribution } from "../../../../editor/common/editorCommon.js";
import { TextEdit } from "../../../../editor/common/languages.js";
import { IValidEditOperation } from "../../../../editor/common/model.js";
import { IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import { DefaultModelSHA1Computer } from "../../../../editor/common/services/modelService.js";
import { InlineCompletionsController } from "../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js";
import { MessageController } from "../../../../editor/contrib/message/browser/messageController.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { showChatView } from "../../chat/browser/chat.js";
import { IChatWidgetLocationOptions } from "../../chat/browser/chatWidget.js";
import { ChatModel, ChatRequestRemovalReason, IChatRequestModel, IChatTextEditGroup, IChatTextEditGroupState, IResponse } from "../../chat/common/chatModel.js";
import { IChatService } from "../../chat/common/chatService.js";
import { INotebookEditorService } from "../../notebook/browser/services/notebookEditorService.js";
import { CTX_INLINE_CHAT_EDITING, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS, CTX_INLINE_CHAT_RESPONSE_TYPE, CTX_INLINE_CHAT_VISIBLE, INLINE_CHAT_ID, InlineChatConfigKeys, InlineChatResponseType } from "../common/inlineChat.js";
import { HunkInformation, Session, StashedSession } from "./inlineChatSession.js";
import { IInlineChatSession2, IInlineChatSessionService } from "./inlineChatSessionService.js";
import { InlineChatError } from "./inlineChatSessionServiceImpl.js";
import { HunkAction, IEditObserver, LiveStrategy, ProgressingEditsOptions } from "./inlineChatStrategies.js";
import { EditorBasedInlineChatWidget } from "./inlineChatWidget.js";
import { InlineChatZoneWidget } from "./inlineChatZoneWidget.js";
import { ChatAgentLocation } from "../../chat/common/constants.js";
import { ChatContextKeys } from "../../chat/common/chatContextKeys.js";
import { IChatEditingService, ModifiedFileEntryState } from "../../chat/common/chatEditingService.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
var State = /* @__PURE__ */ ((State2) => {
  State2["CREATE_SESSION"] = "CREATE_SESSION";
  State2["INIT_UI"] = "INIT_UI";
  State2["WAIT_FOR_INPUT"] = "WAIT_FOR_INPUT";
  State2["SHOW_REQUEST"] = "SHOW_REQUEST";
  State2["PAUSE"] = "PAUSE";
  State2["CANCEL"] = "CANCEL";
  State2["ACCEPT"] = "DONE";
  return State2;
})(State || {});
var Message = /* @__PURE__ */ ((Message2) => {
  Message2[Message2["NONE"] = 0] = "NONE";
  Message2[Message2["ACCEPT_SESSION"] = 1] = "ACCEPT_SESSION";
  Message2[Message2["CANCEL_SESSION"] = 2] = "CANCEL_SESSION";
  Message2[Message2["PAUSE_SESSION"] = 4] = "PAUSE_SESSION";
  Message2[Message2["CANCEL_REQUEST"] = 8] = "CANCEL_REQUEST";
  Message2[Message2["CANCEL_INPUT"] = 16] = "CANCEL_INPUT";
  Message2[Message2["ACCEPT_INPUT"] = 32] = "ACCEPT_INPUT";
  return Message2;
})(Message || {});
class InlineChatRunOptions {
  static {
    __name(this, "InlineChatRunOptions");
  }
  initialSelection;
  initialRange;
  message;
  autoSend;
  existingSession;
  position;
  static isInlineChatRunOptions(options) {
    const { initialSelection, initialRange, message, autoSend, position, existingSession } = options;
    if (typeof message !== "undefined" && typeof message !== "string" || typeof autoSend !== "undefined" && typeof autoSend !== "boolean" || typeof initialRange !== "undefined" && !Range.isIRange(initialRange) || typeof initialSelection !== "undefined" && !Selection.isISelection(initialSelection) || typeof position !== "undefined" && !Position.isIPosition(position) || typeof existingSession !== "undefined" && !(existingSession instanceof Session)) {
      return false;
    }
    return true;
  }
}
let InlineChatController = class {
  static {
    __name(this, "InlineChatController");
  }
  static ID = "editor.contrib.inlineChatController";
  static get(editor) {
    return editor.getContribution(InlineChatController.ID);
  }
  _delegate;
  constructor(editor, configurationService) {
    const inlineChat2 = observableConfigValue(InlineChatConfigKeys.EnableV2, false, configurationService);
    this._delegate = derived((r) => {
      if (inlineChat2.read(r)) {
        return InlineChatController2.get(editor);
      } else {
        return InlineChatController1.get(editor);
      }
    });
  }
  dispose() {
  }
  get isActive() {
    return this._delegate.get().isActive;
  }
  async run(arg) {
    return this._delegate.get().run(arg);
  }
  focus() {
    return this._delegate.get().focus();
  }
  get widget() {
    return this._delegate.get().widget;
  }
  getWidgetPosition() {
    return this._delegate.get().getWidgetPosition();
  }
  acceptSession() {
    return this._delegate.get().acceptSession();
  }
};
InlineChatController = __decorateClass([
  __decorateParam(1, IConfigurationService)
], InlineChatController);
let InlineChatController1 = class {
  constructor(_editor, _instaService, _inlineChatSessionService, _editorWorkerService, _logService, _configurationService, _dialogService, contextKeyService, _chatService, _editorService, notebookEditorService) {
    this._editor = _editor;
    this._instaService = _instaService;
    this._inlineChatSessionService = _inlineChatSessionService;
    this._editorWorkerService = _editorWorkerService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._dialogService = _dialogService;
    this._chatService = _chatService;
    this._editorService = _editorService;
    this._ctxVisible = CTX_INLINE_CHAT_VISIBLE.bindTo(contextKeyService);
    this._ctxEditing = CTX_INLINE_CHAT_EDITING.bindTo(contextKeyService);
    this._ctxResponseType = CTX_INLINE_CHAT_RESPONSE_TYPE.bindTo(contextKeyService);
    this._ctxRequestInProgress = CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.bindTo(contextKeyService);
    this._ctxResponse = ChatContextKeys.isResponse.bindTo(contextKeyService);
    ChatContextKeys.responseHasError.bindTo(contextKeyService);
    this._ui = new Lazy(() => {
      const location = {
        location: ChatAgentLocation.Editor,
        resolveData: /* @__PURE__ */ __name(() => {
          assertType(this._editor.hasModel());
          assertType(this._session);
          return {
            type: ChatAgentLocation.Editor,
            selection: this._editor.getSelection(),
            document: this._session.textModelN.uri,
            wholeRange: this._session?.wholeRange.trackedInitialRange
          };
        }, "resolveData")
      };
      for (const notebookEditor of notebookEditorService.listNotebookEditors()) {
        for (const [, codeEditor] of notebookEditor.codeEditors) {
          if (codeEditor === this._editor) {
            location.location = ChatAgentLocation.Notebook;
            break;
          }
        }
      }
      const zone = _instaService.createInstance(InlineChatZoneWidget, location, void 0, this._editor);
      this._store.add(zone);
      this._store.add(zone.widget.chatWidget.onDidClear(async () => {
        const r = this.joinCurrentRun();
        this.cancelSession();
        await r;
        this.run();
      }));
      return zone;
    });
    this._store.add(this._editor.onDidChangeModel(async (e) => {
      if (this._session || !e.newModelUrl) {
        return;
      }
      const existingSession = this._inlineChatSessionService.getSession(this._editor, e.newModelUrl);
      if (!existingSession) {
        return;
      }
      this._log("session RESUMING after model change", e);
      await this.run({ existingSession });
    }));
    this._store.add(this._inlineChatSessionService.onDidEndSession((e) => {
      if (e.session === this._session && e.endedByExternalCause) {
        this._log("session ENDED by external cause");
        this.acceptSession();
      }
    }));
    this._store.add(this._inlineChatSessionService.onDidMoveSession(async (e) => {
      if (e.editor === this._editor) {
        this._log("session RESUMING after move", e);
        await this.run({ existingSession: e.session });
      }
    }));
    this._log(`NEW controller`);
  }
  static {
    __name(this, "InlineChatController1");
  }
  static get(editor) {
    return editor.getContribution(INLINE_CHAT_ID);
  }
  _isDisposed = false;
  _store = new DisposableStore();
  _ui;
  _ctxVisible;
  _ctxEditing;
  _ctxResponseType;
  _ctxRequestInProgress;
  _ctxResponse;
  _messages = this._store.add(new Emitter());
  _onDidEnterState = this._store.add(new Emitter());
  get chatWidget() {
    return this._ui.value.widget.chatWidget;
  }
  _sessionStore = this._store.add(new DisposableStore());
  _stashedSession = this._store.add(new MutableDisposable());
  _session;
  _strategy;
  dispose() {
    if (this._currentRun) {
      this._messages.fire(this._session?.chatModel.hasRequests ? 4 /* PAUSE_SESSION */ : 2 /* CANCEL_SESSION */);
    }
    this._store.dispose();
    this._isDisposed = true;
    this._log("DISPOSED controller");
  }
  _log(message, ...more) {
    if (message instanceof Error) {
      this._logService.error(message, ...more);
    } else {
      this._logService.trace(`[IE] (editor:${this._editor.getId()}) ${message}`, ...more);
    }
  }
  get widget() {
    return this._ui.value.widget;
  }
  getId() {
    return INLINE_CHAT_ID;
  }
  getWidgetPosition() {
    return this._ui.value.position;
  }
  _currentRun;
  async run(options = {}) {
    let lastState;
    const d = this._onDidEnterState.event((e) => lastState = e);
    try {
      this.acceptSession();
      if (this._currentRun) {
        await this._currentRun;
      }
      if (options.initialSelection) {
        this._editor.setSelection(options.initialSelection);
      }
      this._stashedSession.clear();
      this._currentRun = this._nextState("CREATE_SESSION" /* CREATE_SESSION */, options);
      await this._currentRun;
    } catch (error) {
      this._log("error during run", error);
      onUnexpectedError(error);
      if (this._session) {
        this._inlineChatSessionService.releaseSession(this._session);
      }
      this["PAUSE" /* PAUSE */]();
    } finally {
      this._currentRun = void 0;
      d.dispose();
    }
    return lastState !== "CANCEL" /* CANCEL */;
  }
  // ---- state machine
  async _nextState(state, options) {
    let nextState = state;
    while (nextState && !this._isDisposed) {
      this._log("setState to ", nextState);
      const p = this[nextState](options);
      this._onDidEnterState.fire(nextState);
      nextState = await p;
    }
  }
  async ["CREATE_SESSION" /* CREATE_SESSION */](options) {
    assertType(this._session === void 0);
    assertType(this._editor.hasModel());
    let session = options.existingSession;
    let initPosition;
    if (options.position) {
      initPosition = Position.lift(options.position).delta(-1);
      delete options.position;
    }
    const widgetPosition = this._showWidget(session?.headless, true, initPosition);
    let errorMessage = localize("create.fail", "Failed to start editor chat");
    if (!session) {
      const createSessionCts = new CancellationTokenSource();
      const msgListener = Event.once(this._messages.event)((m) => {
        this._log("state=_createSession) message received", m);
        if (m === 32 /* ACCEPT_INPUT */) {
          options.autoSend = true;
          this._ui.value.widget.updateInfo(localize("welcome.2", "Getting ready..."));
        } else {
          createSessionCts.cancel();
        }
      });
      try {
        session = await this._inlineChatSessionService.createSession(
          this._editor,
          { wholeRange: options.initialRange },
          createSessionCts.token
        );
      } catch (error) {
        if (error instanceof InlineChatError || error?.name === InlineChatError.code) {
          errorMessage = error.message;
        }
      }
      createSessionCts.dispose();
      msgListener.dispose();
      if (createSessionCts.token.isCancellationRequested) {
        if (session) {
          this._inlineChatSessionService.releaseSession(session);
        }
        return "CANCEL" /* CANCEL */;
      }
    }
    delete options.initialRange;
    delete options.existingSession;
    if (!session) {
      MessageController.get(this._editor)?.showMessage(errorMessage, widgetPosition);
      this._log("Failed to start editor chat");
      return "CANCEL" /* CANCEL */;
    }
    await session.chatModel.waitForInitialization();
    this._strategy = this._instaService.createInstance(LiveStrategy, session, this._editor, this._ui.value, session.headless);
    this._session = session;
    return "INIT_UI" /* INIT_UI */;
  }
  async ["INIT_UI" /* INIT_UI */](options) {
    assertType(this._session);
    assertType(this._strategy);
    InlineCompletionsController.get(this._editor)?.reject();
    this._sessionStore.clear();
    const wholeRangeDecoration = this._editor.createDecorationsCollection();
    const handleWholeRangeChange = /* @__PURE__ */ __name(() => {
      const newDecorations = this._strategy?.getWholeRangeDecoration() ?? [];
      wholeRangeDecoration.set(newDecorations);
      this._ctxEditing.set(!this._session?.wholeRange.trackedInitialRange.isEmpty());
    }, "handleWholeRangeChange");
    this._sessionStore.add(toDisposable(() => {
      wholeRangeDecoration.clear();
      this._ctxEditing.reset();
    }));
    this._sessionStore.add(this._session.wholeRange.onDidChange(handleWholeRangeChange));
    handleWholeRangeChange();
    this._ui.value.widget.setChatModel(this._session.chatModel);
    this._updatePlaceholder();
    const isModelEmpty = !this._session.chatModel.hasRequests;
    this._ui.value.widget.updateToolbar(true);
    this._ui.value.widget.toggleStatus(!isModelEmpty);
    this._showWidget(this._session.headless, isModelEmpty);
    this._sessionStore.add(this._editor.onDidChangeModel((e) => {
      const msg = this._session?.chatModel.hasRequests ? 4 /* PAUSE_SESSION */ : 2 /* CANCEL_SESSION */;
      this._log("model changed, pause or cancel session", msg, e);
      this._messages.fire(msg);
    }));
    this._sessionStore.add(this._editor.onDidChangeModelContent((e) => {
      if (this._session?.hunkData.ignoreTextModelNChanges || this._ui.value.widget.hasFocus()) {
        return;
      }
      const wholeRange = this._session.wholeRange;
      let shouldFinishSession = false;
      if (this._configurationService.getValue(InlineChatConfigKeys.FinishOnType)) {
        for (const { range } of e.changes) {
          shouldFinishSession = !Range.areIntersectingOrTouching(range, wholeRange.value);
        }
      }
      this._session.recordExternalEditOccurred(shouldFinishSession);
      if (shouldFinishSession) {
        this._log("text changed outside of whole range, FINISH session");
        this.acceptSession();
      }
    }));
    this._sessionStore.add(this._session.chatModel.onDidChange(async (e) => {
      if (e.kind === "removeRequest") {
        await this._session.undoChangesUntil(e.requestId);
      }
    }));
    const editState = this._createChatTextEditGroupState();
    let didEdit = false;
    for (const request of this._session.chatModel.getRequests()) {
      if (!request.response || request.response.result?.errorDetails) {
        break;
      }
      for (const part of request.response.response.value) {
        if (part.kind !== "textEditGroup" || !isEqual(part.uri, this._session.textModelN.uri)) {
          continue;
        }
        if (part.state?.applied) {
          continue;
        }
        for (const edit of part.edits) {
          this._makeChanges(edit, void 0, !didEdit);
          didEdit = true;
        }
        part.state ??= editState;
      }
    }
    if (didEdit) {
      const diff = await this._editorWorkerService.computeDiff(this._session.textModel0.uri, this._session.textModelN.uri, { computeMoves: false, maxComputationTimeMs: Number.MAX_SAFE_INTEGER, ignoreTrimWhitespace: false }, "advanced");
      this._session.wholeRange.fixup(diff?.changes ?? []);
      await this._session.hunkData.recompute(editState, diff);
      this._updateCtxResponseType();
    }
    options.position = await this._strategy.renderChanges();
    if (this._session.chatModel.requestInProgress) {
      return "SHOW_REQUEST" /* SHOW_REQUEST */;
    } else {
      return "WAIT_FOR_INPUT" /* WAIT_FOR_INPUT */;
    }
  }
  async ["WAIT_FOR_INPUT" /* WAIT_FOR_INPUT */](options) {
    assertType(this._session);
    assertType(this._strategy);
    this._updatePlaceholder();
    if (options.message) {
      this._updateInput(options.message);
      aria.alert(options.message);
      delete options.message;
      this._showWidget(this._session.headless, false);
    }
    let message = 0 /* NONE */;
    let request;
    const barrier = new Barrier();
    const store = new DisposableStore();
    store.add(this._session.chatModel.onDidChange((e) => {
      if (e.kind === "addRequest") {
        request = e.request;
        message = 32 /* ACCEPT_INPUT */;
        barrier.open();
      }
    }));
    store.add(this._strategy.onDidAccept(() => this.acceptSession()));
    store.add(this._strategy.onDidDiscard(() => this.cancelSession()));
    store.add(Event.once(this._messages.event)((m) => {
      this._log("state=_waitForInput) message received", m);
      message = m;
      barrier.open();
    }));
    if (options.autoSend) {
      delete options.autoSend;
      this._showWidget(this._session.headless, false);
      this._ui.value.widget.chatWidget.acceptInput();
    }
    await barrier.wait();
    store.dispose();
    if (message & (16 /* CANCEL_INPUT */ | 2 /* CANCEL_SESSION */)) {
      return "CANCEL" /* CANCEL */;
    }
    if (message & 4 /* PAUSE_SESSION */) {
      return "PAUSE" /* PAUSE */;
    }
    if (message & 1 /* ACCEPT_SESSION */) {
      this._ui.value.widget.selectAll();
      return "DONE" /* ACCEPT */;
    }
    if (!request?.message.text) {
      return "WAIT_FOR_INPUT" /* WAIT_FOR_INPUT */;
    }
    return "SHOW_REQUEST" /* SHOW_REQUEST */;
  }
  async ["SHOW_REQUEST" /* SHOW_REQUEST */](options) {
    assertType(this._session);
    assertType(this._strategy);
    assertType(this._session.chatModel.requestInProgress);
    this._ctxRequestInProgress.set(true);
    const { chatModel } = this._session;
    const request = chatModel.lastRequest;
    assertType(request);
    assertType(request.response);
    this._showWidget(this._session.headless, false);
    this._ui.value.widget.selectAll();
    this._ui.value.widget.updateInfo("");
    this._ui.value.widget.toggleStatus(true);
    const { response } = request;
    const responsePromise = new DeferredPromise();
    const store = new DisposableStore();
    const progressiveEditsCts = store.add(new CancellationTokenSource());
    const progressiveEditsAvgDuration = new MovingAverage();
    const progressiveEditsClock = StopWatch.create();
    const progressiveEditsQueue = new Queue();
    const origDeco = this._editor.getOption(EditorOption.renderValidationDecorations);
    this._editor.updateOptions({
      renderValidationDecorations: "off"
    });
    store.add(toDisposable(() => {
      this._editor.updateOptions({
        renderValidationDecorations: origDeco
      });
    }));
    let next = "WAIT_FOR_INPUT" /* WAIT_FOR_INPUT */;
    store.add(Event.once(this._messages.event)((message) => {
      this._log("state=_makeRequest) message received", message);
      this._chatService.cancelCurrentRequestForSession(chatModel.sessionId);
      if (message & 2 /* CANCEL_SESSION */) {
        next = "CANCEL" /* CANCEL */;
      } else if (message & 4 /* PAUSE_SESSION */) {
        next = "PAUSE" /* PAUSE */;
      } else if (message & 1 /* ACCEPT_SESSION */) {
        next = "DONE" /* ACCEPT */;
      }
    }));
    store.add(chatModel.onDidChange(async (e) => {
      if (e.kind === "removeRequest" && e.requestId === request.id) {
        progressiveEditsCts.cancel();
        responsePromise.complete();
        if (e.reason === ChatRequestRemovalReason.Resend) {
          next = "SHOW_REQUEST" /* SHOW_REQUEST */;
        } else {
          next = "CANCEL" /* CANCEL */;
        }
        return;
      }
      if (e.kind === "move") {
        assertType(this._session);
        const log = /* @__PURE__ */ __name((msg, ...args) => this._log("state=_showRequest) moving inline chat", msg, ...args), "log");
        log("move was requested", e.target, e.range);
        const initialSelection = Selection.fromRange(Range.lift(e.range), SelectionDirection.LTR);
        const editorPane = await this._editorService.openEditor({ resource: e.target, options: { selection: initialSelection } }, SIDE_GROUP);
        if (!editorPane) {
          log("opening editor failed");
          return;
        }
        const newEditor = editorPane.getControl();
        if (!isCodeEditor(newEditor) || !newEditor.hasModel()) {
          log("new editor is either missing or not a code editor or does not have a model");
          return;
        }
        if (this._inlineChatSessionService.getSession(newEditor, e.target)) {
          log("new editor ALREADY has a session");
          return;
        }
        const newSession = await this._inlineChatSessionService.createSession(
          newEditor,
          {
            session: this._session
          },
          CancellationToken.None
        );
        InlineChatController1.get(newEditor)?.run({ existingSession: newSession });
        next = "CANCEL" /* CANCEL */;
        responsePromise.complete();
        return;
      }
    }));
    store.add(this._ui.value.widget.chatWidget.inputEditor.onDidChangeModelContent(() => {
      this._chatService.cancelCurrentRequestForSession(chatModel.sessionId);
    }));
    let lastLength = 0;
    let isFirstChange = true;
    const editState = this._createChatTextEditGroupState();
    let localEditGroup;
    const handleResponse = /* @__PURE__ */ __name(() => {
      this._updateCtxResponseType();
      if (!localEditGroup) {
        localEditGroup = response.response.value.find((part) => part.kind === "textEditGroup" && isEqual(part.uri, this._session?.textModelN.uri));
      }
      if (localEditGroup) {
        localEditGroup.state ??= editState;
        const edits = localEditGroup.edits;
        const newEdits = edits.slice(lastLength);
        if (newEdits.length > 0) {
          this._log(`${this._session?.textModelN.uri.toString()} received ${newEdits.length} edits`);
          lastLength = edits.length;
          progressiveEditsAvgDuration.update(progressiveEditsClock.elapsed());
          progressiveEditsClock.reset();
          progressiveEditsQueue.queue(async () => {
            const startThen = this._session.wholeRange.value.getStartPosition();
            for (const edits2 of newEdits) {
              await this._makeChanges(edits2, {
                duration: progressiveEditsAvgDuration.value,
                token: progressiveEditsCts.token
              }, isFirstChange);
              isFirstChange = false;
            }
            const startNow = this._session.wholeRange.value.getStartPosition();
            if (!startNow.equals(startThen) || !this._ui.value.position?.equals(startNow)) {
              this._showWidget(this._session.headless, false, startNow.delta(-1));
            }
          });
        }
      }
      if (response.isCanceled) {
        progressiveEditsCts.cancel();
        responsePromise.complete();
      } else if (response.isComplete) {
        responsePromise.complete();
      }
    }, "handleResponse");
    store.add(response.onDidChange(handleResponse));
    handleResponse();
    await responsePromise.p;
    await progressiveEditsQueue.whenIdle();
    if (response.result?.errorDetails && !response.result.errorDetails.responseIsFiltered) {
      await this._session.undoChangesUntil(response.requestId);
    }
    store.dispose();
    const diff = await this._editorWorkerService.computeDiff(this._session.textModel0.uri, this._session.textModelN.uri, { computeMoves: false, maxComputationTimeMs: Number.MAX_SAFE_INTEGER, ignoreTrimWhitespace: false }, "advanced");
    this._session.wholeRange.fixup(diff?.changes ?? []);
    await this._session.hunkData.recompute(editState, diff);
    this._ctxRequestInProgress.set(false);
    let newPosition;
    if (response.result?.errorDetails) {
    } else if (response.response.value.length === 0) {
      const status = localize("empty", "No results, please refine your input and try again");
      this._ui.value.widget.updateStatus(status, { classes: ["warn"] });
    } else {
      this._ui.value.widget.updateStatus("");
    }
    const position = await this._strategy.renderChanges();
    if (position) {
      const selection = this._editor.getSelection();
      if (selection?.containsPosition(position)) {
        if (position.lineNumber - selection.startLineNumber > 8) {
          newPosition = position;
        }
      } else {
        newPosition = position;
      }
    }
    this._showWidget(this._session.headless, false, newPosition);
    return next;
  }
  async ["PAUSE" /* PAUSE */]() {
    this._resetWidget();
    this._strategy?.dispose?.();
    this._session = void 0;
  }
  async ["DONE" /* ACCEPT */]() {
    assertType(this._session);
    assertType(this._strategy);
    this._sessionStore.clear();
    try {
      await this._strategy.apply();
    } catch (err) {
      this._dialogService.error(localize("err.apply", "Failed to apply changes.", toErrorMessage(err)));
      this._log("FAILED to apply changes");
      this._log(err);
    }
    this._resetWidget();
    this._inlineChatSessionService.releaseSession(this._session);
    this._strategy?.dispose();
    this._strategy = void 0;
    this._session = void 0;
  }
  async ["CANCEL" /* CANCEL */]() {
    this._resetWidget();
    if (this._session) {
      assertType(this._strategy);
      this._sessionStore.clear();
      const shouldStash = !this._session.isUnstashed && this._session.chatModel.hasRequests && this._session.hunkData.size === this._session.hunkData.pending;
      let undoCancelEdits = [];
      try {
        undoCancelEdits = this._strategy.cancel();
      } catch (err) {
        this._dialogService.error(localize("err.discard", "Failed to discard changes.", toErrorMessage(err)));
        this._log("FAILED to discard changes");
        this._log(err);
      }
      this._stashedSession.clear();
      if (shouldStash) {
        this._stashedSession.value = this._inlineChatSessionService.stashSession(this._session, this._editor, undoCancelEdits);
      } else {
        this._inlineChatSessionService.releaseSession(this._session);
      }
    }
    this._strategy?.dispose();
    this._strategy = void 0;
    this._session = void 0;
  }
  // ----
  _showWidget(headless = false, initialRender = false, position) {
    assertType(this._editor.hasModel());
    this._ctxVisible.set(true);
    let widgetPosition;
    if (position) {
      widgetPosition = position;
    } else if (this._ui.rawValue?.position) {
      if (this._ui.rawValue?.position.lineNumber === 1) {
        widgetPosition = this._ui.rawValue?.position.delta(-1);
      } else {
        widgetPosition = this._ui.rawValue?.position;
      }
    } else {
      widgetPosition = this._editor.getSelection().getStartPosition().delta(-1);
    }
    if (this._session && !position && (this._session.hasChangedText || this._session.chatModel.hasRequests)) {
      widgetPosition = this._session.wholeRange.trackedInitialRange.getStartPosition().delta(-1);
    }
    if (initialRender && this._editor.getOption(EditorOption.stickyScroll).enabled) {
      this._editor.revealLine(widgetPosition.lineNumber);
    }
    if (!headless) {
      if (this._ui.rawValue?.position) {
        this._ui.value.updatePositionAndHeight(widgetPosition);
      } else {
        this._ui.value.show(widgetPosition);
      }
    }
    return widgetPosition;
  }
  _resetWidget() {
    this._sessionStore.clear();
    this._ctxVisible.reset();
    this._ui.rawValue?.hide();
    if (this._editor.hasWidgetFocus()) {
      this._editor.focus();
    }
  }
  _updateCtxResponseType() {
    if (!this._session) {
      this._ctxResponseType.set(InlineChatResponseType.None);
      return;
    }
    const hasLocalEdit = /* @__PURE__ */ __name((response) => {
      return response.value.some((part) => part.kind === "textEditGroup" && isEqual(part.uri, this._session?.textModelN.uri));
    }, "hasLocalEdit");
    let responseType = InlineChatResponseType.None;
    for (const request of this._session.chatModel.getRequests()) {
      if (!request.response) {
        continue;
      }
      responseType = InlineChatResponseType.Messages;
      if (hasLocalEdit(request.response.response)) {
        responseType = InlineChatResponseType.MessagesAndEdits;
        break;
      }
    }
    this._ctxResponseType.set(responseType);
    this._ctxResponse.set(responseType !== InlineChatResponseType.None);
  }
  _createChatTextEditGroupState() {
    assertType(this._session);
    const sha1 = new DefaultModelSHA1Computer();
    const textModel0Sha1 = sha1.canComputeSHA1(this._session.textModel0) ? sha1.computeSHA1(this._session.textModel0) : generateUuid();
    return {
      sha1: textModel0Sha1,
      applied: 0
    };
  }
  async _makeChanges(edits, opts, undoStopBefore) {
    assertType(this._session);
    assertType(this._strategy);
    const moreMinimalEdits = await this._editorWorkerService.computeMoreMinimalEdits(this._session.textModelN.uri, edits);
    this._log("edits from PROVIDER and after making them MORE MINIMAL", this._session.agent.extensionId, edits, moreMinimalEdits);
    if (moreMinimalEdits?.length === 0) {
      return;
    }
    const actualEdits = !opts && moreMinimalEdits ? moreMinimalEdits : edits;
    const editOperations = actualEdits.map(TextEdit.asEditOperation);
    const editsObserver = {
      start: /* @__PURE__ */ __name(() => this._session.hunkData.ignoreTextModelNChanges = true, "start"),
      stop: /* @__PURE__ */ __name(() => this._session.hunkData.ignoreTextModelNChanges = false, "stop")
    };
    if (opts) {
      await this._strategy.makeProgressiveChanges(editOperations, editsObserver, opts, undoStopBefore);
    } else {
      await this._strategy.makeChanges(editOperations, editsObserver, undoStopBefore);
    }
  }
  _updatePlaceholder() {
    this._ui.value.widget.placeholder = this._session?.agent.description ?? "";
  }
  _updateInput(text, selectAll = true) {
    this._ui.value.widget.chatWidget.setInput(text);
    if (selectAll) {
      const newSelection = new Selection(1, 1, Number.MAX_SAFE_INTEGER, 1);
      this._ui.value.widget.chatWidget.inputEditor.setSelection(newSelection);
    }
  }
  // ---- controller API
  arrowOut(up) {
    if (this._ui.value.position && this._editor.hasModel()) {
      const { column } = this._editor.getPosition();
      const { lineNumber } = this._ui.value.position;
      const newLine = up ? lineNumber : lineNumber + 1;
      this._editor.setPosition({ lineNumber: newLine, column });
      this._editor.focus();
    }
  }
  focus() {
    this._ui.value.widget.focus();
  }
  async viewInChat() {
    if (!this._strategy || !this._session) {
      return;
    }
    let someApplied = false;
    let lastEdit;
    const uri = this._editor.getModel()?.uri;
    const requests = this._session.chatModel.getRequests();
    for (const request of requests) {
      if (!request.response) {
        continue;
      }
      for (const part of request.response.response.value) {
        if (part.kind === "textEditGroup" && isEqual(part.uri, uri)) {
          someApplied = someApplied || Boolean(part.state?.applied);
          lastEdit = part;
        }
      }
    }
    const doEdits = this._strategy.cancel();
    if (someApplied) {
      assertType(lastEdit);
      lastEdit.edits = [doEdits];
      lastEdit.state.applied = 0;
    }
    await this._instaService.invokeFunction(moveToPanelChat, this._session?.chatModel);
    this.cancelSession();
  }
  acceptSession() {
    const response = this._session?.chatModel.getRequests().at(-1)?.response;
    if (response) {
      this._chatService.notifyUserAction({
        sessionId: response.session.sessionId,
        requestId: response.requestId,
        agentId: response.agent?.id,
        command: response.slashCommand?.name,
        result: response.result,
        action: {
          kind: "inlineChat",
          action: "accepted"
        }
      });
    }
    this._messages.fire(1 /* ACCEPT_SESSION */);
  }
  acceptHunk(hunkInfo) {
    return this._strategy?.performHunkAction(hunkInfo, HunkAction.Accept);
  }
  discardHunk(hunkInfo) {
    return this._strategy?.performHunkAction(hunkInfo, HunkAction.Discard);
  }
  toggleDiff(hunkInfo) {
    return this._strategy?.performHunkAction(hunkInfo, HunkAction.ToggleDiff);
  }
  moveHunk(next) {
    this.focus();
    this._strategy?.performHunkAction(void 0, next ? HunkAction.MoveNext : HunkAction.MovePrev);
  }
  async cancelSession() {
    const response = this._session?.chatModel.lastRequest?.response;
    if (response) {
      this._chatService.notifyUserAction({
        sessionId: response.session.sessionId,
        requestId: response.requestId,
        agentId: response.agent?.id,
        command: response.slashCommand?.name,
        result: response.result,
        action: {
          kind: "inlineChat",
          action: "discarded"
        }
      });
    }
    this._messages.fire(2 /* CANCEL_SESSION */);
  }
  reportIssue() {
    const response = this._session?.chatModel.lastRequest?.response;
    if (response) {
      this._chatService.notifyUserAction({
        sessionId: response.session.sessionId,
        requestId: response.requestId,
        agentId: response.agent?.id,
        command: response.slashCommand?.name,
        result: response.result,
        action: { kind: "bug" }
      });
    }
  }
  unstashLastSession() {
    const result = this._stashedSession.value?.unstash();
    return result;
  }
  joinCurrentRun() {
    return this._currentRun;
  }
  get isActive() {
    return Boolean(this._currentRun);
  }
};
InlineChatController1 = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IInlineChatSessionService),
  __decorateParam(3, IEditorWorkerService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IChatService),
  __decorateParam(9, IEditorService),
  __decorateParam(10, INotebookEditorService)
], InlineChatController1);
let InlineChatController2 = class {
  constructor(_editor, _instaService, _notebookEditorService, _inlineChatSessions, codeEditorService, contextKeyService) {
    this._editor = _editor;
    this._instaService = _instaService;
    this._notebookEditorService = _notebookEditorService;
    this._inlineChatSessions = _inlineChatSessions;
    const ctxInlineChatVisible = CTX_INLINE_CHAT_VISIBLE.bindTo(contextKeyService);
    this._zone = new Lazy(() => {
      const location = {
        location: ChatAgentLocation.Editor,
        resolveData: /* @__PURE__ */ __name(() => {
          assertType(this._editor.hasModel());
          return {
            type: ChatAgentLocation.Editor,
            selection: this._editor.getSelection(),
            document: this._editor.getModel().uri,
            wholeRange: this._editor.getSelection()
          };
        }, "resolveData")
      };
      for (const notebookEditor of this._notebookEditorService.listNotebookEditors()) {
        for (const [, codeEditor] of notebookEditor.codeEditors) {
          if (codeEditor === this._editor) {
            location.location = ChatAgentLocation.Notebook;
            break;
          }
        }
      }
      const result = this._instaService.createInstance(
        InlineChatZoneWidget,
        location,
        {
          enableWorkingSet: "implicit",
          rendererOptions: {
            renderTextEditsAsSummary: /* @__PURE__ */ __name((_uri) => true, "renderTextEditsAsSummary")
          }
        },
        this._editor
      );
      result.domNode.classList.add("inline-chat-2");
      return result;
    });
    const editorObs = observableCodeEditor(_editor);
    const sessionsSignal = observableSignalFromEvent(this, _inlineChatSessions.onDidChangeSessions);
    this._currentSession = derived((r) => {
      sessionsSignal.read(r);
      const model = editorObs.model.read(r);
      const value = model && _inlineChatSessions.getSession2(model.uri);
      return value ?? void 0;
    });
    this._store.add(autorun((r) => {
      const session = this._currentSession.read(r);
      if (!session) {
        this._isActiveController.set(false, void 0);
        return;
      }
      let foundOne = false;
      for (const editor of codeEditorService.listCodeEditors()) {
        if (Boolean(InlineChatController2.get(editor)?._isActiveController.get())) {
          foundOne = true;
          break;
        }
      }
      if (!foundOne && _editor.hasWidgetFocus()) {
        this._isActiveController.set(true, void 0);
      }
    }));
    const visibleSessionObs = observableValue(this, void 0);
    this._store.add(autorunWithStore((r, store) => {
      const model = editorObs.model.read(r);
      const session = this._currentSession.read(r);
      const isActive = this._isActiveController.read(r);
      if (!session || !isActive || !model) {
        visibleSessionObs.set(void 0, void 0);
        return;
      }
      const { chatModel } = session;
      const showShowUntil = this._showWidgetOverrideObs.read(r);
      const hasNoRequests = chatModel.getRequests().length === 0;
      const responseListener = store.add(new MutableDisposable());
      store.add(chatModel.onDidChange((e) => {
        if (e.kind === "addRequest") {
          transaction((tx) => {
            this._showWidgetOverrideObs.set(false, tx);
            visibleSessionObs.set(void 0, tx);
          });
          const { response } = e.request;
          if (!response) {
            return;
          }
          responseListener.value = response.onDidChange(async (e2) => {
            if (!response.isComplete) {
              return;
            }
            const shouldShow = response.isCanceled || response.result?.errorDetails || !response.response.value.find((part) => part.kind === "textEditGroup" && part.edits.length > 0 && isEqual(part.uri, model.uri));
            if (shouldShow) {
              visibleSessionObs.set(session, void 0);
            }
          });
        }
      }));
      if (showShowUntil || hasNoRequests) {
        visibleSessionObs.set(session, void 0);
      } else {
        visibleSessionObs.set(void 0, void 0);
      }
    }));
    this._store.add(autorun((r) => {
      const session = visibleSessionObs.read(r);
      if (!session) {
        this._zone.rawValue?.hide();
        _editor.focus();
        ctxInlineChatVisible.reset();
      } else {
        ctxInlineChatVisible.set(true);
        this._zone.value.widget.setChatModel(session.chatModel);
        if (!this._zone.value.position) {
          this._zone.value.show(session.initialPosition);
        }
        this._zone.value.reveal(this._zone.value.position);
        this._zone.value.widget.focus();
        session.editingSession.getEntry(session.uri)?.autoAcceptController.get()?.cancel();
      }
    }));
  }
  static {
    __name(this, "InlineChatController2");
  }
  static ID = "editor.contrib.inlineChatController2";
  static get(editor) {
    return editor.getContribution(InlineChatController2.ID) ?? void 0;
  }
  _store = new DisposableStore();
  _showWidgetOverrideObs = observableValue(this, false);
  _isActiveController = observableValue(this, false);
  _zone;
  _currentSession;
  get widget() {
    return this._zone.value.widget;
  }
  get isActive() {
    return Boolean(this._currentSession.get());
  }
  dispose() {
    this._store.dispose();
  }
  toggleWidgetUntilNextRequest() {
    const value = this._showWidgetOverrideObs.get();
    this._showWidgetOverrideObs.set(!value, void 0);
  }
  getWidgetPosition() {
    return this._zone.rawValue?.position;
  }
  focus() {
    this._zone.rawValue?.widget.focus();
  }
  markActiveController() {
    this._isActiveController.set(true, void 0);
  }
  async run(arg) {
    assertType(this._editor.hasModel());
    this.markActiveController();
    const uri = this._editor.getModel().uri;
    const session = this._inlineChatSessions.getSession2(uri) ?? await this._inlineChatSessions.createSession2(this._editor, uri, CancellationToken.None);
    if (arg && InlineChatRunOptions.isInlineChatRunOptions(arg)) {
      if (arg.initialRange) {
        this._editor.revealRange(arg.initialRange);
      }
      if (arg.initialSelection) {
        this._editor.setSelection(arg.initialSelection);
      }
      if (arg.message) {
        this._zone.value.widget.chatWidget.setInput(arg.message);
        if (arg.autoSend) {
          await this._zone.value.widget.chatWidget.acceptInput();
        }
      }
    }
    await Event.toPromise(session.editingSession.onDidDispose);
    const rejected = session.editingSession.getEntry(uri)?.state.get() === ModifiedFileEntryState.Rejected;
    return !rejected;
  }
  acceptSession() {
    const value = this._currentSession.get();
    value?.editingSession.accept();
  }
};
InlineChatController2 = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, INotebookEditorService),
  __decorateParam(3, IInlineChatSessionService),
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, IContextKeyService)
], InlineChatController2);
async function reviewEdits(accessor, editor, stream, token) {
  if (!editor.hasModel()) {
    return false;
  }
  const chatService = accessor.get(IChatService);
  const chatEditingService = accessor.get(IChatEditingService);
  const uri = editor.getModel().uri;
  const chatModel = chatService.startSession(ChatAgentLocation.Editor, token, false);
  const editSession = await chatEditingService.createEditingSession(chatModel);
  const store = new DisposableStore();
  store.add(chatModel);
  store.add(editSession);
  const chatRequest = chatModel?.addRequest({ text: "", parts: [] }, { variables: [] }, 0);
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
    const entry = editSession.readEntry(uri, r);
    if (!entry) {
      return false;
    }
    const state = entry.state.read(r);
    return state === ModifiedFileEntryState.Accepted || state === ModifiedFileEntryState.Rejected;
  });
  const whenDecided = waitForState(isSettled, Boolean);
  await raceCancellation(whenDecided, token);
  store.dispose();
  return true;
}
__name(reviewEdits, "reviewEdits");
async function moveToPanelChat(accessor, model) {
  const viewsService = accessor.get(IViewsService);
  const chatService = accessor.get(IChatService);
  const widget = await showChatView(viewsService);
  if (widget && widget.viewModel && model) {
    for (const request of model.getRequests().slice()) {
      await chatService.adoptRequest(widget.viewModel.model.sessionId, request);
    }
    widget.focusLastMessage();
  }
}
__name(moveToPanelChat, "moveToPanelChat");
export {
  InlineChatController,
  InlineChatController1,
  InlineChatController2,
  InlineChatRunOptions,
  State,
  reviewEdits
};
//# sourceMappingURL=inlineChatController.js.map
