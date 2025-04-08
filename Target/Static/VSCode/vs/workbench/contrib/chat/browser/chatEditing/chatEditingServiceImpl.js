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
import { coalesce, compareBy, delta } from "../../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { ErrorNoTelemetry } from "../../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Disposable, DisposableStore, dispose, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { LinkedList } from "../../../../../base/common/linkedList.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { derived, IObservable, observableValueOpts, runOnChange, ValueWithChangeEventFromObservable } from "../../../../../base/common/observable.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { compare } from "../../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { assertType } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { TextEdit } from "../../../../../editor/common/languages.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IDecorationData, IDecorationsProvider, IDecorationsService } from "../../../../services/decorations/common/decorations.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { IMultiDiffSourceResolver, IMultiDiffSourceResolverService, IResolvedMultiDiffSource, MultiDiffEditorItem } from "../../../multiDiffEditor/browser/multiDiffSourceResolverService.js";
import { CellUri } from "../../../notebook/common/notebookCommon.js";
import { INotebookService } from "../../../notebook/common/notebookService.js";
import { IChatAgentService } from "../../common/chatAgents.js";
import { CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, chatEditingAgentSupportsReadonlyReferencesContextKey, chatEditingResourceContextKey, ChatEditingSessionState, chatEditingSnapshotScheme, IChatEditingService, IChatEditingSession, IChatRelatedFile, IChatRelatedFilesProvider, IModifiedFileEntry, inChatEditingSessionContextKey, IStreamingEdits, ModifiedFileEntryState, parseChatMultiDiffUri } from "../../common/chatEditingService.js";
import { ChatModel, IChatResponseModel, isCellTextEditOperation } from "../../common/chatModel.js";
import { IChatService } from "../../common/chatService.js";
import { ChatAgentLocation } from "../../common/constants.js";
import { ChatEditorInput } from "../chatEditorInput.js";
import { AbstractChatEditingModifiedFileEntry } from "./chatEditingModifiedFileEntry.js";
import { ChatEditingSession } from "./chatEditingSession.js";
import { ChatEditingSnapshotTextModelContentProvider, ChatEditingTextModelContentProvider } from "./chatEditingTextModelContentProviders.js";
let ChatEditingService = class extends Disposable {
  constructor(_instantiationService, multiDiffSourceResolverService, textModelService, contextKeyService, _chatService, _editorService, decorationsService, _fileService, lifecycleService, storageService, logService, extensionService, productService, notebookService) {
    super();
    this._instantiationService = _instantiationService;
    this._chatService = _chatService;
    this._editorService = _editorService;
    this._fileService = _fileService;
    this.lifecycleService = lifecycleService;
    this.notebookService = notebookService;
    this._register(decorationsService.registerDecorationsProvider(_instantiationService.createInstance(ChatDecorationsProvider, this.editingSessionsObs)));
    this._register(multiDiffSourceResolverService.registerResolver(_instantiationService.createInstance(ChatEditingMultiDiffSourceResolver, this.editingSessionsObs)));
    this._register(textModelService.registerTextModelContentProvider(ChatEditingTextModelContentProvider.scheme, _instantiationService.createInstance(ChatEditingTextModelContentProvider, this)));
    this._register(textModelService.registerTextModelContentProvider(chatEditingSnapshotScheme, _instantiationService.createInstance(ChatEditingSnapshotTextModelContentProvider, this)));
    this._register(this._chatService.onDidDisposeSession((e) => {
      if (e.reason === "cleared") {
        this.getEditingSession(e.sessionId)?.stop();
      }
    }));
    const readonlyEnabledContextKey = chatEditingAgentSupportsReadonlyReferencesContextKey.bindTo(contextKeyService);
    const setReadonlyFilesEnabled = /* @__PURE__ */ __name(() => {
      const enabled = productService.quality !== "stable" && extensionService.extensions.some((e) => e.enabledApiProposals?.includes("chatReadonlyPromptReference"));
      readonlyEnabledContextKey.set(enabled);
    }, "setReadonlyFilesEnabled");
    setReadonlyFilesEnabled();
    this._register(extensionService.onDidRegisterExtensions(setReadonlyFilesEnabled));
    this._register(extensionService.onDidChangeExtensions(setReadonlyFilesEnabled));
    let storageTask;
    this._register(storageService.onWillSaveState(() => {
      const tasks = [];
      for (const session of this.editingSessionsObs.get()) {
        if (!session.isGlobalEditingSession) {
          continue;
        }
        tasks.push(session.storeState());
      }
      storageTask = Promise.resolve(storageTask).then(() => Promise.all(tasks)).finally(() => storageTask = void 0);
    }));
    this._register(this.lifecycleService.onWillShutdown((e) => {
      if (!storageTask) {
        return;
      }
      e.join(storageTask, {
        id: "join.chatEditingSession",
        label: localize("join.chatEditingSession", "Saving chat edits history")
      });
    }));
  }
  static {
    __name(this, "ChatEditingService");
  }
  _serviceBrand;
  _sessionsObs = observableValueOpts({ equalsFn: /* @__PURE__ */ __name((a, b) => false, "equalsFn") }, new LinkedList());
  editingSessionsObs = derived((r) => {
    const result = Array.from(this._sessionsObs.read(r));
    return result;
  });
  _restoringEditingSession;
  _chatRelatedFilesProviders = /* @__PURE__ */ new Map();
  dispose() {
    dispose(this._sessionsObs.get());
    super.dispose();
  }
  async startOrContinueGlobalEditingSession(chatModel, waitForRestore = true) {
    if (waitForRestore) {
      await this._restoringEditingSession;
    }
    const session = this.getEditingSession(chatModel.sessionId);
    if (session) {
      return session;
    }
    const result = await this.createEditingSession(chatModel, true);
    return result;
  }
  _lookupEntry(uri) {
    for (const item of Iterable.concat(this.editingSessionsObs.get())) {
      const candidate = item.getEntry(uri);
      if (candidate instanceof AbstractChatEditingModifiedFileEntry) {
        return candidate.acquire();
      }
    }
    return void 0;
  }
  getEditingSession(chatSessionId) {
    return this.editingSessionsObs.get().find((candidate) => candidate.chatSessionId === chatSessionId);
  }
  async createEditingSession(chatModel, global = false) {
    assertType(this.getEditingSession(chatModel.sessionId) === void 0, "CANNOT have more than one editing session per chat session");
    const session = this._instantiationService.createInstance(ChatEditingSession, chatModel.sessionId, global, this._lookupEntry.bind(this));
    await session.init();
    const list = this._sessionsObs.get();
    const removeSession = list.unshift(session);
    const store = new DisposableStore();
    this._store.add(store);
    store.add(this.installAutoApplyObserver(session, chatModel));
    store.add(session.onDidDispose((e) => {
      removeSession();
      this._sessionsObs.set(list, void 0);
      this._store.delete(store);
    }));
    this._sessionsObs.set(list, void 0);
    return session;
  }
  installAutoApplyObserver(session, chatModel) {
    if (!chatModel) {
      throw new ErrorNoTelemetry(`Edit session was created for a non-existing chat session: ${session.chatSessionId}`);
    }
    const observerDisposables = new DisposableStore();
    observerDisposables.add(chatModel.onDidChange(async (e) => {
      if (e.kind !== "addRequest") {
        return;
      }
      session.createSnapshot(e.request.id, void 0);
      const responseModel = e.request.response;
      if (responseModel) {
        this.observerEditsInResponse(e.request.id, responseModel, session, observerDisposables);
      }
    }));
    observerDisposables.add(chatModel.onDidDispose(() => observerDisposables.dispose()));
    return observerDisposables;
  }
  observerEditsInResponse(requestId, responseModel, session, observerDisposables) {
    const editsSeen = [];
    const editedFilesExist = new ResourceMap();
    const ensureEditorOpen = /* @__PURE__ */ __name((partUri) => {
      const uri = CellUri.parse(partUri)?.notebook ?? partUri;
      if (editedFilesExist.has(uri)) {
        return;
      }
      const fileExists = this.notebookService.getNotebookTextModel(uri) ? Promise.resolve(true) : this._fileService.exists(uri);
      editedFilesExist.set(uri, fileExists.then((e) => {
        if (!e) {
          return;
        }
        const activeUri = this._editorService.activeEditorPane?.input.resource;
        const inactive = this._editorService.activeEditorPane?.input instanceof ChatEditorInput && this._editorService.activeEditorPane.input.sessionId === session.chatSessionId || Boolean(activeUri && session.entries.get().find((entry) => isEqual(activeUri, entry.modifiedURI)));
        this._editorService.openEditor({ resource: uri, options: { inactive, preserveFocus: true, pinned: true } });
      }));
    }, "ensureEditorOpen");
    const onResponseComplete = /* @__PURE__ */ __name(() => {
      for (const remaining of editsSeen) {
        remaining?.streaming.complete();
      }
      if (responseModel.result?.errorDetails && !responseModel.result.errorDetails.responseIsIncomplete) {
        session.restoreSnapshot(responseModel.requestId, void 0);
      }
      editsSeen.length = 0;
      editedFilesExist.clear();
    }, "onResponseComplete");
    const handleResponseParts = /* @__PURE__ */ __name(async () => {
      if (responseModel.isCanceled) {
        return;
      }
      let undoStop;
      for (let i = 0; i < responseModel.response.value.length; i++) {
        const part = responseModel.response.value[i];
        if (part.kind === "undoStop") {
          undoStop = part.id;
          continue;
        }
        if (part.kind !== "textEditGroup" && part.kind !== "notebookEditGroup") {
          continue;
        }
        ensureEditorOpen(part.uri);
        let entry = editsSeen[i];
        if (!entry) {
          entry = { seen: 0, streaming: session.startStreamingEdits(CellUri.parse(part.uri)?.notebook ?? part.uri, responseModel, undoStop) };
          editsSeen[i] = entry;
        }
        const isFirst = entry.seen === 0;
        const newEdits = part.edits.slice(entry.seen).flat();
        entry.seen = part.edits.length;
        if (newEdits.length > 0 || isFirst) {
          if (part.kind === "notebookEditGroup") {
            newEdits.forEach((edit) => {
              if (TextEdit.isTextEdit(edit)) {
                return;
              } else if (isCellTextEditOperation(edit)) {
                entry.streaming.pushNotebookCellText(edit.uri, [edit.edit]);
              } else {
                entry.streaming.pushNotebook([edit]);
              }
            });
          } else if (part.kind === "textEditGroup") {
            entry.streaming.pushText(newEdits);
          }
        }
        if (part.done) {
          entry.streaming.complete();
        }
      }
    }, "handleResponseParts");
    if (responseModel.isComplete) {
      handleResponseParts().then(() => {
        onResponseComplete();
      });
    } else {
      const disposable = observerDisposables.add(responseModel.onDidChange((e2) => {
        if (e2.reason === "undoStop") {
          session.createSnapshot(requestId, e2.id);
        } else {
          handleResponseParts().then(() => {
            if (responseModel.isComplete) {
              onResponseComplete();
              observerDisposables.delete(disposable);
            }
          });
        }
      }));
    }
  }
  hasRelatedFilesProviders() {
    return this._chatRelatedFilesProviders.size > 0;
  }
  registerRelatedFilesProvider(handle, provider) {
    this._chatRelatedFilesProviders.set(handle, provider);
    return toDisposable(() => {
      this._chatRelatedFilesProviders.delete(handle);
    });
  }
  async getRelatedFiles(chatSessionId, prompt, files, token) {
    const providers = Array.from(this._chatRelatedFilesProviders.values());
    const result = await Promise.all(providers.map(async (provider) => {
      try {
        const relatedFiles = await provider.provideRelatedFiles({ prompt, files }, token);
        if (relatedFiles?.length) {
          return { group: provider.description, files: relatedFiles };
        }
        return void 0;
      } catch (e) {
        return void 0;
      }
    }));
    return coalesce(result);
  }
};
ChatEditingService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IMultiDiffSourceResolverService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IDecorationsService),
  __decorateParam(7, IFileService),
  __decorateParam(8, ILifecycleService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, ILogService),
  __decorateParam(11, IExtensionService),
  __decorateParam(12, IProductService),
  __decorateParam(13, INotebookService)
], ChatEditingService);
function observeArrayChanges(obs, compare2, store) {
  const emitter = store.add(new Emitter());
  store.add(runOnChange(obs, (newArr, oldArr) => {
    const change = delta(oldArr || [], newArr, compare2);
    const changedElements = [].concat(change.added).concat(change.removed);
    emitter.fire(changedElements);
  }));
  return emitter.event;
}
__name(observeArrayChanges, "observeArrayChanges");
let ChatDecorationsProvider = class extends Disposable {
  constructor(_sessions, _chatAgentService) {
    super();
    this._sessions = _sessions;
    this._chatAgentService = _chatAgentService;
  }
  static {
    __name(this, "ChatDecorationsProvider");
  }
  label = localize("chat", "Chat Editing");
  _currentEntries = derived(this, (r) => {
    const sessions = this._sessions.read(r);
    if (!sessions) {
      return [];
    }
    const result = [];
    for (const session of sessions) {
      if (session.state.read(r) !== ChatEditingSessionState.Disposed) {
        const entries = session.entries.read(r);
        result.push(...entries);
      }
    }
    return result;
  });
  _currentlyEditingUris = derived(this, (r) => {
    const uri = this._currentEntries.read(r);
    return uri.filter((entry) => entry.isCurrentlyBeingModifiedBy.read(r)).map((entry) => entry.modifiedURI);
  });
  _modifiedUris = derived(this, (r) => {
    const uri = this._currentEntries.read(r);
    return uri.filter((entry) => !entry.isCurrentlyBeingModifiedBy.read(r) && entry.state.read(r) === ModifiedFileEntryState.Modified).map((entry) => entry.modifiedURI);
  });
  onDidChange = Event.any(
    observeArrayChanges(this._currentlyEditingUris, compareBy((uri) => uri.toString(), compare), this._store),
    observeArrayChanges(this._modifiedUris, compareBy((uri) => uri.toString(), compare), this._store)
  );
  provideDecorations(uri, _token) {
    const isCurrentlyBeingModified = this._currentlyEditingUris.get().some((e) => e.toString() === uri.toString());
    if (isCurrentlyBeingModified) {
      return {
        weight: 1e3,
        letter: ThemeIcon.modify(Codicon.loading, "spin"),
        bubble: false
      };
    }
    const isModified = this._modifiedUris.get().some((e) => e.toString() === uri.toString());
    if (isModified) {
      const defaultAgentName = this._chatAgentService.getDefaultAgent(ChatAgentLocation.Panel)?.fullName;
      return {
        weight: 1e3,
        letter: Codicon.diffModified,
        tooltip: defaultAgentName ? localize("chatEditing.modified", "Pending changes from {0}", defaultAgentName) : localize("chatEditing.modified2", "Pending changes from chat"),
        bubble: true
      };
    }
    return void 0;
  }
};
ChatDecorationsProvider = __decorateClass([
  __decorateParam(1, IChatAgentService)
], ChatDecorationsProvider);
let ChatEditingMultiDiffSourceResolver = class {
  constructor(_editingSessionsObs, _instantiationService) {
    this._editingSessionsObs = _editingSessionsObs;
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "ChatEditingMultiDiffSourceResolver");
  }
  canHandleUri(uri) {
    return uri.scheme === CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME;
  }
  async resolveDiffSource(uri) {
    const parsed = parseChatMultiDiffUri(uri);
    const thisSession = derived(this, (r) => {
      return this._editingSessionsObs.read(r).find((candidate) => candidate.chatSessionId === parsed.chatSessionId);
    });
    return this._instantiationService.createInstance(ChatEditingMultiDiffSource, thisSession, parsed.showPreviousChanges);
  }
};
ChatEditingMultiDiffSourceResolver = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ChatEditingMultiDiffSourceResolver);
class ChatEditingMultiDiffSource {
  constructor(_currentSession, _showPreviousChanges) {
    this._currentSession = _currentSession;
    this._showPreviousChanges = _showPreviousChanges;
  }
  static {
    __name(this, "ChatEditingMultiDiffSource");
  }
  _resources = derived(this, (reader) => {
    const currentSession = this._currentSession.read(reader);
    if (!currentSession) {
      return [];
    }
    const entries = currentSession.entries.read(reader);
    return entries.map((entry) => {
      if (this._showPreviousChanges) {
        const entryDiffObs = currentSession.getEntryDiffBetweenStops(entry.modifiedURI, void 0, void 0);
        const entryDiff = entryDiffObs?.read(reader);
        if (entryDiff) {
          return new MultiDiffEditorItem(
            entryDiff.originalURI,
            entryDiff.modifiedURI,
            void 0,
            {
              [chatEditingResourceContextKey.key]: entry.entryId
            }
          );
        }
      }
      return new MultiDiffEditorItem(
        entry.originalURI,
        entry.modifiedURI,
        void 0,
        {
          [chatEditingResourceContextKey.key]: entry.entryId
          // [inChatEditingSessionContextKey.key]: true
        }
      );
    });
  });
  resources = new ValueWithChangeEventFromObservable(this._resources);
  contextKeys = {
    [inChatEditingSessionContextKey.key]: true
  };
}
export {
  ChatEditingMultiDiffSourceResolver,
  ChatEditingService
};
//# sourceMappingURL=chatEditingServiceImpl.js.map
