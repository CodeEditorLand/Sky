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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, IDisposable, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { autorun, observableFromEvent } from "../../../../base/common/observable.js";
import { isEqual } from "../../../../base/common/resources.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IActiveCodeEditor, ICodeEditor, isCodeEditor, isCompositeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IValidEditOperation } from "../../../../editor/common/model.js";
import { createTextBufferFactoryFromSnapshot } from "../../../../editor/common/model/textModel.js";
import { IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { DEFAULT_EDITOR_ASSOCIATION } from "../../../common/editor.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { UntitledTextEditorInput } from "../../../services/untitled/common/untitledTextEditorInput.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { IChatAgentService } from "../../chat/common/chatAgents.js";
import { ModifiedFileEntryState } from "../../chat/common/chatEditingService.js";
import { IChatService } from "../../chat/common/chatService.js";
import { ChatAgentLocation } from "../../chat/common/constants.js";
import { CTX_INLINE_CHAT_HAS_AGENT, CTX_INLINE_CHAT_HAS_AGENT2, CTX_INLINE_CHAT_POSSIBLE, InlineChatConfigKeys } from "../common/inlineChat.js";
import { HunkData, Session, SessionWholeRange, StashedSession, TelemetryData, TelemetryDataClassification } from "./inlineChatSession.js";
import { IInlineChatSession2, IInlineChatSessionEndEvent, IInlineChatSessionEvent, IInlineChatSessionService, ISessionKeyComputer } from "./inlineChatSessionService.js";
class InlineChatError extends Error {
  static {
    __name(this, "InlineChatError");
  }
  static code = "InlineChatError";
  constructor(message) {
    super(message);
    this.name = InlineChatError.code;
  }
}
let InlineChatSessionServiceImpl = class {
  constructor(_telemetryService, _modelService, _textModelService, _editorWorkerService, _logService, _instaService, _editorService, _textFileService, _languageService, _chatService, _chatAgentService, _chatWidgetService) {
    this._telemetryService = _telemetryService;
    this._modelService = _modelService;
    this._textModelService = _textModelService;
    this._editorWorkerService = _editorWorkerService;
    this._logService = _logService;
    this._instaService = _instaService;
    this._editorService = _editorService;
    this._textFileService = _textFileService;
    this._languageService = _languageService;
    this._chatService = _chatService;
    this._chatAgentService = _chatAgentService;
    this._chatWidgetService = _chatWidgetService;
  }
  static {
    __name(this, "InlineChatSessionServiceImpl");
  }
  _store = new DisposableStore();
  _onWillStartSession = this._store.add(new Emitter());
  onWillStartSession = this._onWillStartSession.event;
  _onDidMoveSession = this._store.add(new Emitter());
  onDidMoveSession = this._onDidMoveSession.event;
  _onDidEndSession = this._store.add(new Emitter());
  onDidEndSession = this._onDidEndSession.event;
  _onDidStashSession = this._store.add(new Emitter());
  onDidStashSession = this._onDidStashSession.event;
  _sessions = /* @__PURE__ */ new Map();
  _keyComputers = /* @__PURE__ */ new Map();
  dispose() {
    this._store.dispose();
    this._sessions.forEach((x) => x.store.dispose());
    this._sessions.clear();
  }
  async createSession(editor, options, token) {
    const agent = this._chatAgentService.getDefaultAgent(ChatAgentLocation.Editor);
    if (!agent) {
      this._logService.trace("[IE] NO agent found");
      return void 0;
    }
    this._onWillStartSession.fire(editor);
    const textModel = editor.getModel();
    const selection = editor.getSelection();
    const store = new DisposableStore();
    this._logService.trace(`[IE] creating NEW session for ${editor.getId()}, ${agent.extensionId}`);
    const chatModel = options.session?.chatModel ?? this._chatService.startSession(ChatAgentLocation.Editor, token);
    if (!chatModel) {
      this._logService.trace("[IE] NO chatModel found");
      return void 0;
    }
    store.add(toDisposable(() => {
      const doesOtherSessionUseChatModel = [...this._sessions.values()].some((data) => data.session !== session && data.session.chatModel === chatModel);
      if (!doesOtherSessionUseChatModel) {
        this._chatService.clearSession(chatModel.sessionId);
        chatModel.dispose();
      }
    }));
    const lastResponseListener = store.add(new MutableDisposable());
    store.add(chatModel.onDidChange((e) => {
      if (e.kind !== "addRequest" || !e.request.response) {
        return;
      }
      const { response } = e.request;
      session.markModelVersion(e.request);
      lastResponseListener.value = response.onDidChange(() => {
        if (!response.isComplete) {
          return;
        }
        lastResponseListener.clear();
        for (const part of response.response.value) {
          if (part.kind !== "textEditGroup" || part.uri.scheme !== Schemas.untitled || isEqual(part.uri, session.textModelN.uri)) {
            continue;
          }
          const langSelection = this._languageService.createByFilepathOrFirstLine(part.uri, void 0);
          const untitledTextModel = this._textFileService.untitled.create({
            associatedResource: part.uri,
            languageId: langSelection.languageId
          });
          untitledTextModel.resolve();
          this._textModelService.createModelReference(part.uri).then((ref) => {
            store.add(ref);
          });
        }
      });
    }));
    store.add(this._chatAgentService.onDidChangeAgents((e) => {
      if (e === void 0 && (!this._chatAgentService.getAgent(agent.id) || !this._chatAgentService.getActivatedAgents().map((agent2) => agent2.id).includes(agent.id))) {
        this._logService.trace(`[IE] provider GONE for ${editor.getId()}, ${agent.extensionId}`);
        this._releaseSession(session, true);
      }
    }));
    const id = generateUuid();
    const targetUri = textModel.uri;
    store.add(await this._textModelService.createModelReference(textModel.uri));
    const textModelN = textModel;
    const textModel0 = store.add(this._modelService.createModel(
      createTextBufferFactoryFromSnapshot(textModel.createSnapshot()),
      { languageId: textModel.getLanguageId(), onDidChange: Event.None },
      targetUri.with({ scheme: Schemas.vscode, authority: "inline-chat", path: "", query: new URLSearchParams({ id, "textModel0": "" }).toString() }),
      true
    ));
    if (targetUri.scheme === Schemas.untitled) {
      store.add(this._editorService.onDidCloseEditor(() => {
        if (!this._editorService.isOpened({ resource: targetUri, typeId: UntitledTextEditorInput.ID, editorId: DEFAULT_EDITOR_ASSOCIATION.id })) {
          this._releaseSession(session, true);
        }
      }));
    }
    let wholeRange = options.wholeRange;
    if (!wholeRange) {
      wholeRange = new Range(selection.selectionStartLineNumber, selection.selectionStartColumn, selection.positionLineNumber, selection.positionColumn);
    }
    if (token.isCancellationRequested) {
      store.dispose();
      return void 0;
    }
    const session = new Session(
      options.headless ?? false,
      targetUri,
      textModel0,
      textModelN,
      agent,
      store.add(new SessionWholeRange(textModelN, wholeRange)),
      store.add(new HunkData(this._editorWorkerService, textModel0, textModelN)),
      chatModel,
      options.session?.versionsByRequest
    );
    const key = this._key(editor, session.targetUri);
    if (this._sessions.has(key)) {
      store.dispose();
      throw new Error(`Session already stored for ${key}`);
    }
    this._sessions.set(key, { session, editor, store });
    return session;
  }
  moveSession(session, target) {
    const newKey = this._key(target, session.targetUri);
    const existing = this._sessions.get(newKey);
    if (existing) {
      if (existing.session !== session) {
        throw new Error(`Cannot move session because the target editor already/still has one`);
      } else {
        return;
      }
    }
    let found = false;
    for (const [oldKey, data] of this._sessions) {
      if (data.session === session) {
        found = true;
        this._sessions.delete(oldKey);
        this._sessions.set(newKey, { ...data, editor: target });
        this._logService.trace(`[IE] did MOVE session for ${data.editor.getId()} to NEW EDITOR ${target.getId()}, ${session.agent.extensionId}`);
        this._onDidMoveSession.fire({ session, editor: target });
        break;
      }
    }
    if (!found) {
      throw new Error(`Cannot move session because it is not stored`);
    }
  }
  releaseSession(session) {
    this._releaseSession(session, false);
  }
  _releaseSession(session, byServer) {
    let tuple;
    for (const candidate of this._sessions) {
      if (candidate[1].session === session) {
        tuple = candidate;
        break;
      }
    }
    if (!tuple) {
      return;
    }
    this._telemetryService.publicLog2("interactiveEditor/session", session.asTelemetryData());
    const [key, value] = tuple;
    this._sessions.delete(key);
    this._logService.trace(`[IE] did RELEASED session for ${value.editor.getId()}, ${session.agent.extensionId}`);
    this._onDidEndSession.fire({ editor: value.editor, session, endedByExternalCause: byServer });
    value.store.dispose();
  }
  stashSession(session, editor, undoCancelEdits) {
    const result = this._instaService.createInstance(StashedSession, editor, session, undoCancelEdits);
    this._onDidStashSession.fire({ editor, session });
    this._logService.trace(`[IE] did STASH session for ${editor.getId()}, ${session.agent.extensionId}`);
    return result;
  }
  getCodeEditor(session) {
    for (const [, data] of this._sessions) {
      if (data.session === session) {
        return data.editor;
      }
    }
    throw new Error("session not found");
  }
  getSession(editor, uri) {
    const key = this._key(editor, uri);
    return this._sessions.get(key)?.session;
  }
  _key(editor, uri) {
    const item = this._keyComputers.get(uri.scheme);
    return item ? item.getComparisonKey(editor, uri) : `${editor.getId()}@${uri.toString()}`;
  }
  registerSessionKeyComputer(scheme, value) {
    this._keyComputers.set(scheme, value);
    return toDisposable(() => this._keyComputers.delete(scheme));
  }
  // ---- NEW
  _sessions2 = new ResourceMap();
  _onDidChangeSessions = this._store.add(new Emitter());
  onDidChangeSessions = this._onDidChangeSessions.event;
  async createSession2(editor, uri, token) {
    assertType(editor.hasModel());
    if (this._sessions2.has(uri)) {
      throw new Error("Session already exists");
    }
    this._onWillStartSession.fire(editor);
    const chatModel = this._chatService.startSession(ChatAgentLocation.EditingSession, token, false);
    const editingSession = await chatModel.editingSessionObs?.promise;
    const widget = this._chatWidgetService.getWidgetBySessionId(chatModel.sessionId);
    await widget?.attachmentModel.addFile(uri);
    const store = new DisposableStore();
    store.add(toDisposable(() => {
      this._chatService.cancelCurrentRequestForSession(chatModel.sessionId);
      editingSession.reject();
      this._sessions2.delete(uri);
      this._onDidChangeSessions.fire(this);
    }));
    store.add(chatModel);
    store.add(autorun((r) => {
      const entries = editingSession.entries.read(r);
      if (entries.length === 0) {
        return;
      }
      const allSettled = entries.every((entry) => {
        const state = entry.state.read(r);
        return (state === ModifiedFileEntryState.Accepted || state === ModifiedFileEntryState.Rejected) && !entry.isCurrentlyBeingModifiedBy.read(r);
      });
      if (allSettled && !chatModel.requestInProgress) {
        store.dispose();
      }
    }));
    const result = {
      uri,
      initialPosition: editor.getPosition().delta(-1),
      chatModel,
      editingSession,
      dispose: store.dispose.bind(store)
    };
    this._sessions2.set(uri, result);
    this._onDidChangeSessions.fire(this);
    return result;
  }
  getSession2(uri) {
    let result = this._sessions2.get(uri);
    if (!result) {
      for (const [_, candidate] of this._sessions2) {
        const entry = candidate.editingSession.getEntry(uri);
        if (entry) {
          result = candidate;
          break;
        }
      }
    }
    return result;
  }
};
InlineChatSessionServiceImpl = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IEditorWorkerService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, ITextFileService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, IChatService),
  __decorateParam(10, IChatAgentService),
  __decorateParam(11, IChatWidgetService)
], InlineChatSessionServiceImpl);
let InlineChatEnabler = class {
  static {
    __name(this, "InlineChatEnabler");
  }
  static Id = "inlineChat.enabler";
  _ctxHasProvider;
  _ctxHasProvider2;
  _ctxPossible;
  _store = new DisposableStore();
  constructor(contextKeyService, chatAgentService, editorService, configService) {
    this._ctxHasProvider = CTX_INLINE_CHAT_HAS_AGENT.bindTo(contextKeyService);
    this._ctxHasProvider2 = CTX_INLINE_CHAT_HAS_AGENT2.bindTo(contextKeyService);
    this._ctxPossible = CTX_INLINE_CHAT_POSSIBLE.bindTo(contextKeyService);
    const agentObs = observableFromEvent(this, chatAgentService.onDidChangeAgents, () => chatAgentService.getDefaultAgent(ChatAgentLocation.Editor));
    const inlineChat2Obs = observableConfigValue(InlineChatConfigKeys.EnableV2, false, configService);
    this._store.add(autorun((r) => {
      const v2 = inlineChat2Obs.read(r);
      const agent = agentObs.read(r);
      if (!agent) {
        this._ctxHasProvider.reset();
        this._ctxHasProvider2.reset();
      } else if (v2) {
        this._ctxHasProvider.reset();
        this._ctxHasProvider2.set(true);
      } else {
        this._ctxHasProvider.set(true);
        this._ctxHasProvider2.reset();
      }
    }));
    const updateEditor = /* @__PURE__ */ __name(() => {
      const ctrl = editorService.activeEditorPane?.getControl();
      const isCodeEditorLike = isCodeEditor(ctrl) || isDiffEditor(ctrl) || isCompositeEditor(ctrl);
      this._ctxPossible.set(isCodeEditorLike);
    }, "updateEditor");
    this._store.add(editorService.onDidActiveEditorChange(updateEditor));
    updateEditor();
  }
  dispose() {
    this._ctxPossible.reset();
    this._ctxHasProvider.reset();
    this._store.dispose();
  }
};
InlineChatEnabler = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IConfigurationService)
], InlineChatEnabler);
export {
  InlineChatEnabler,
  InlineChatError,
  InlineChatSessionServiceImpl
};
//# sourceMappingURL=inlineChatSessionServiceImpl.js.map
