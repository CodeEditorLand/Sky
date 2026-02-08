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
import { raceCancellationError } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { MarkdownString } from "../../../base/common/htmlContent.js";
import { Disposable, DisposableMap, DisposableStore } from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { revive } from "../../../base/common/marshalling.js";
import { autorun, observableValue } from "../../../base/common/observable.js";
import { isEqual } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { hasValidDiff } from "../../contrib/chat/browser/agentSessions/agentSessionsModel.js";
import { IAgentSessionsService } from "../../contrib/chat/browser/agentSessions/agentSessionsService.js";
import { IChatWidgetService, isIChatViewViewContext } from "../../contrib/chat/browser/chat.js";
import { ChatEditorInput } from "../../contrib/chat/browser/widgetHosts/editor/chatEditorInput.js";
import { awaitStatsForSession } from "../../contrib/chat/common/chat.js";
import { IChatService } from "../../contrib/chat/common/chatService/chatService.js";
import { IChatSessionsService } from "../../contrib/chat/common/chatSessionsService.js";
import { ChatAgentLocation } from "../../contrib/chat/common/constants.js";
import { IChatTodoListService } from "../../contrib/chat/common/tools/chatTodoListService.js";
import { IEditorGroupsService } from "../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../services/editor/common/editorService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
class ObservableChatSession extends Disposable {
  static {
    __name(this, "ObservableChatSession");
  }
  get options() {
    return this._options;
  }
  get progressObs() {
    return this._progressObservable;
  }
  get isCompleteObs() {
    return this._isCompleteObservable;
  }
  constructor(resource, providerHandle, proxy, logService, dialogService) {
    super();
    this._progressObservable = observableValue(this, []);
    this._isCompleteObservable = observableValue(this, false);
    this._onWillDispose = new Emitter();
    this.onWillDispose = this._onWillDispose.event;
    this._pendingProgressChunks = /* @__PURE__ */ new Map();
    this._isInitialized = false;
    this._interruptionWasCanceled = false;
    this._disposalPending = false;
    this.sessionResource = resource;
    this.providerHandle = providerHandle;
    this.history = [];
    this._proxy = proxy;
    this._providerHandle = providerHandle;
    this._logService = logService;
    this._dialogService = dialogService;
  }
  initialize(token) {
    if (!this._initializationPromise) {
      this._initializationPromise = this._doInitializeContent(token);
    }
    return this._initializationPromise;
  }
  async _doInitializeContent(token) {
    try {
      const sessionContent = await raceCancellationError(this._proxy.$provideChatSessionContent(this._providerHandle, this.sessionResource, token), token);
      this._options = sessionContent.options;
      this.history.length = 0;
      this.history.push(...sessionContent.history.map((turn) => {
        if (turn.type === "request") {
          const variables = turn.variableData?.variables.map((v) => {
            const entry = {
              ...v,
              value: revive(v.value)
            };
            return entry;
          });
          return {
            type: "request",
            prompt: turn.prompt,
            participant: turn.participant,
            command: turn.command,
            variableData: variables ? { variables } : void 0,
            id: turn.id
          };
        }
        return {
          type: "response",
          parts: turn.parts.map((part) => revive(part)),
          participant: turn.participant
        };
      }));
      if (sessionContent.hasActiveResponseCallback && !this.interruptActiveResponseCallback) {
        this.interruptActiveResponseCallback = async () => {
          const confirmInterrupt = /* @__PURE__ */ __name(() => {
            if (this._disposalPending) {
              this._proxy.$disposeChatSessionContent(this._providerHandle, this.sessionResource);
              this._disposalPending = false;
            }
            this._proxy.$interruptChatSessionActiveResponse(this._providerHandle, this.sessionResource, "ongoing");
            return true;
          }, "confirmInterrupt");
          if (sessionContent.supportsInterruption) {
            return confirmInterrupt();
          }
          return this._dialogService.confirm({
            message: localize("interruptActiveResponse", "Are you sure you want to interrupt the active session?")
          }).then((confirmed) => {
            if (confirmed.confirmed) {
              return confirmInterrupt();
            } else {
              this._addProgress([{
                kind: "progressMessage",
                content: { value: "", isTrusted: false }
              }]);
              this._interruptionWasCanceled = true;
              if (this._disposalPending) {
                this._logService.info(`Canceling deferred disposal for session ${this.sessionResource} (user canceled interruption)`);
                this._disposalPending = false;
              }
              return false;
            }
          });
        };
      }
      if (sessionContent.hasRequestHandler && !this.requestHandler) {
        this.requestHandler = async (request, progress, history, token2) => {
          this._progressObservable.set([], void 0);
          this._isCompleteObservable.set(false, void 0);
          let lastProgressLength = 0;
          const progressDisposable = autorun((reader) => {
            const progressArray = this._progressObservable.read(reader);
            const isComplete = this._isCompleteObservable.read(reader);
            if (progressArray.length > lastProgressLength) {
              const newProgress = progressArray.slice(lastProgressLength);
              progress(newProgress);
              lastProgressLength = progressArray.length;
            }
            if (isComplete) {
              progressDisposable.dispose();
            }
          });
          try {
            await this._proxy.$invokeChatSessionRequestHandler(this._providerHandle, this.sessionResource, request, history, token2);
            if (!this._isCompleteObservable.get() && !this.interruptActiveResponseCallback) {
              this._markComplete();
            }
          } catch (error) {
            const errorProgress = {
              kind: "progressMessage",
              content: { value: `Error: ${error instanceof Error ? error.message : String(error)}`, isTrusted: false }
            };
            this._addProgress([errorProgress]);
            this._markComplete();
            throw error;
          } finally {
            progressDisposable.dispose();
          }
        };
      }
      this._isInitialized = true;
      const hasActiveResponse = sessionContent.hasActiveResponseCallback;
      const hasRequestHandler = sessionContent.hasRequestHandler;
      const hasAnyCapability = hasActiveResponse || hasRequestHandler;
      for (const [requestId, chunks] of this._pendingProgressChunks) {
        this._logService.debug(`Processing ${chunks.length} pending progress chunks for session ${this.sessionResource}, requestId ${requestId}`);
        this._addProgress(chunks);
      }
      this._pendingProgressChunks.clear();
      if (!hasAnyCapability) {
        this._isCompleteObservable.set(true, void 0);
      }
    } catch (error) {
      this._logService.error(`Failed to initialize chat session ${this.sessionResource}:`, error);
      throw error;
    }
  }
  /**
   * Handle progress chunks coming from the extension host.
   * If the session is not initialized yet, the chunks will be queued.
   */
  handleProgressChunk(requestId, progress) {
    if (!this._isInitialized) {
      const existing = this._pendingProgressChunks.get(requestId) || [];
      this._pendingProgressChunks.set(requestId, [...existing, ...progress]);
      this._logService.debug(`Queuing ${progress.length} progress chunks for session ${this.sessionResource}, requestId ${requestId} (session not initialized)`);
      return;
    }
    this._addProgress(progress);
  }
  /**
   * Handle progress completion from the extension host.
   */
  handleProgressComplete(requestId) {
    this._pendingProgressChunks.delete(requestId);
    if (this._isInitialized) {
      if (!this._interruptionWasCanceled) {
        this._markComplete();
      } else {
        this._interruptionWasCanceled = false;
      }
    }
  }
  _addProgress(progress) {
    const currentProgress = this._progressObservable.get();
    this._progressObservable.set([...currentProgress, ...progress], void 0);
  }
  _markComplete() {
    if (!this._isCompleteObservable.get()) {
      this._isCompleteObservable.set(true, void 0);
    }
  }
  dispose() {
    this._onWillDispose.fire();
    this._onWillDispose.dispose();
    this._pendingProgressChunks.clear();
    if (this.interruptActiveResponseCallback && !this._interruptionWasCanceled) {
      this._disposalPending = true;
    } else {
      this._proxy.$disposeChatSessionContent(this._providerHandle, this.sessionResource);
    }
    super.dispose();
  }
}
let MainThreadChatSessions = class MainThreadChatSessions2 extends Disposable {
  static {
    __name(this, "MainThreadChatSessions");
  }
  constructor(_extHostContext, _agentSessionsService, _chatSessionsService, _chatService, _chatWidgetService, _chatTodoListService, _dialogService, _editorService, editorGroupService, _logService) {
    super();
    this._extHostContext = _extHostContext;
    this._agentSessionsService = _agentSessionsService;
    this._chatSessionsService = _chatSessionsService;
    this._chatService = _chatService;
    this._chatWidgetService = _chatWidgetService;
    this._chatTodoListService = _chatTodoListService;
    this._dialogService = _dialogService;
    this._editorService = _editorService;
    this.editorGroupService = editorGroupService;
    this._logService = _logService;
    this._itemProvidersRegistrations = this._register(new DisposableMap());
    this._contentProvidersRegistrations = this._register(new DisposableMap());
    this._sessionTypeToHandle = /* @__PURE__ */ new Map();
    this._activeSessions = new ResourceMap();
    this._sessionDisposables = new ResourceMap();
    this._proxy = this._extHostContext.getProxy(ExtHostContext.ExtHostChatSessions);
    this._register(this._chatSessionsService.onRequestNotifyExtension(({ sessionResource, updates, waitUntil }) => {
      const handle = this._getHandleForSessionType(sessionResource.scheme);
      this._logService.trace(`[MainThreadChatSessions] onRequestNotifyExtension received: scheme '${sessionResource.scheme}', handle ${handle}, ${updates.length} update(s)`);
      if (handle !== void 0) {
        waitUntil(this.notifyOptionsChange(handle, sessionResource, updates));
      } else {
        this._logService.warn(`[MainThreadChatSessions] Cannot notify option change for scheme '${sessionResource.scheme}': no provider registered. Registered schemes: [${Array.from(this._sessionTypeToHandle.keys()).join(", ")}]`);
      }
    }));
    this._register(this._agentSessionsService.model.onDidChangeSessionArchivedState((session) => {
      for (const [handle, { provider }] of this._itemProvidersRegistrations) {
        if (provider.chatSessionType === session.providerType) {
          this._proxy.$onDidChangeChatSessionItemState(handle, session.resource, session.isArchived());
        }
      }
    }));
  }
  _getHandleForSessionType(chatSessionType) {
    return this._sessionTypeToHandle.get(chatSessionType);
  }
  $registerChatSessionItemProvider(handle, chatSessionType) {
    const disposables = new DisposableStore();
    const changeEmitter = disposables.add(new Emitter());
    const provider = {
      chatSessionType,
      onDidChangeChatSessionItems: Event.debounce(changeEmitter.event, (_, e) => e, 200),
      provideChatSessionItems: /* @__PURE__ */ __name((token) => this._provideChatSessionItems(handle, token), "provideChatSessionItems")
    };
    disposables.add(this._chatSessionsService.registerChatSessionItemProvider(provider));
    this._itemProvidersRegistrations.set(handle, {
      dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose"),
      provider,
      onDidChangeItems: changeEmitter
    });
    disposables.add(this._chatSessionsService.registerChatModelChangeListeners(this._chatService, chatSessionType, () => changeEmitter.fire()));
  }
  $onDidChangeChatSessionItems(handle) {
    this._itemProvidersRegistrations.get(handle)?.onDidChangeItems.fire();
  }
  $onDidChangeChatSessionOptions(handle, sessionResourceComponents, updates) {
    const sessionResource = URI.revive(sessionResourceComponents);
    this._chatSessionsService.notifySessionOptionsChange(sessionResource, updates);
  }
  async $onDidCommitChatSessionItem(handle, originalComponents, modifiedCompoennts) {
    const originalResource = URI.revive(originalComponents);
    const modifiedResource = URI.revive(modifiedCompoennts);
    this._logService.trace(`$onDidCommitChatSessionItem: handle(${handle}), original(${originalResource}), modified(${modifiedResource})`);
    const chatSessionType = this._itemProvidersRegistrations.get(handle)?.provider.chatSessionType;
    if (!chatSessionType) {
      this._logService.error(`No chat session type found for provider handle ${handle}`);
      return;
    }
    const originalEditor = this._editorService.editors.find((editor) => editor.resource?.toString() === originalResource.toString());
    const originalModel = this._chatService.getActiveSessionReference(originalResource);
    const contribution = this._chatSessionsService.getAllChatSessionContributions().find((c) => c.type === chatSessionType);
    try {
      this._chatTodoListService.migrateTodos(originalResource, modifiedResource);
      const originalGroup = this.editorGroupService.groups.find((group) => group.editors.some((editor) => isEqual(editor.resource, originalResource))) ?? this.editorGroupService.activeGroup;
      const options = {
        title: {
          preferred: originalEditor?.getName() || void 0,
          fallback: localize("chatEditorContributionName", "{0}", contribution?.displayName)
        }
      };
      const newSession = await this._chatSessionsService.getOrCreateChatSession(URI.revive(modifiedResource), CancellationToken.None);
      if (originalEditor) {
        newSession.transferredState = originalEditor instanceof ChatEditorInput ? { editingSession: originalEditor.transferOutEditingSession(), inputState: originalModel?.object?.inputModel.toJSON() } : void 0;
        await this._editorService.replaceEditors([{
          editor: originalEditor,
          replacement: {
            resource: modifiedResource,
            options
          }
        }], originalGroup);
        return;
      }
      if (originalModel) {
        newSession.transferredState = {
          editingSession: originalModel.object.editingSession,
          inputState: originalModel.object.inputModel.toJSON()
        };
      }
      const chatViewWidget = this._chatWidgetService.getWidgetBySessionResource(originalResource);
      if (chatViewWidget && isIChatViewViewContext(chatViewWidget.viewContext)) {
        await this._chatWidgetService.openSession(modifiedResource, void 0, { preserveFocus: true });
      } else {
        const ref = await this._chatService.loadSessionForResource(modifiedResource, ChatAgentLocation.Chat, CancellationToken.None);
        ref?.dispose();
      }
    } finally {
      originalModel?.dispose();
    }
  }
  async _provideChatSessionItems(handle, token) {
    try {
      const sessions = await this._proxy.$provideChatSessionItems(handle, token);
      return Promise.all(sessions.map(async (session) => {
        const uri = URI.revive(session.resource);
        const model = this._chatService.getSession(uri);
        if (model) {
          session = await this.handleSessionModelOverrides(model, session);
        }
        if (!session.changes || !model) {
          const stats = (await this._chatService.getMetadataForSession(uri))?.stats;
          const diffs = {
            files: stats?.fileCount || 0,
            insertions: stats?.added || 0,
            deletions: stats?.removed || 0
          };
          if (hasValidDiff(diffs)) {
            session.changes = diffs;
          }
        }
        return {
          ...session,
          changes: revive(session.changes),
          resource: uri,
          iconPath: session.iconPath,
          tooltip: session.tooltip ? this._reviveTooltip(session.tooltip) : void 0,
          archived: session.archived
        };
      }));
    } catch (error) {
      this._logService.error("Error providing chat sessions:", error);
    }
    return [];
  }
  async handleSessionModelOverrides(model, session) {
    const inProgress = model.getRequests().filter((r) => r.response && !r.response.isComplete);
    if (inProgress.length) {
      session.description = this._chatSessionsService.getInProgressSessionDescription(model);
    }
    if (!(session.changes instanceof Array)) {
      const modelStats = await awaitStatsForSession(model);
      if (modelStats) {
        session.changes = {
          files: modelStats.fileCount,
          insertions: modelStats.added,
          deletions: modelStats.removed
        };
      }
    }
    if (model.lastRequest?.response?.state === 4) {
      session.status = 3;
    }
    return session;
  }
  async _provideChatSessionContent(providerHandle, sessionResource, token) {
    let session = this._activeSessions.get(sessionResource);
    if (!session) {
      session = new ObservableChatSession(sessionResource, providerHandle, this._proxy, this._logService, this._dialogService);
      this._activeSessions.set(sessionResource, session);
      const disposable = session.onWillDispose(() => {
        this._activeSessions.delete(sessionResource);
        this._sessionDisposables.get(sessionResource)?.dispose();
        this._sessionDisposables.delete(sessionResource);
      });
      this._sessionDisposables.set(sessionResource, disposable);
    }
    try {
      await session.initialize(token);
      if (session.options) {
        for (const [_, handle] of this._sessionTypeToHandle) {
          if (handle === providerHandle) {
            for (const [optionId, value] of Object.entries(session.options)) {
              this._chatSessionsService.setSessionOption(sessionResource, optionId, value);
            }
            break;
          }
        }
      }
      return session;
    } catch (error) {
      session.dispose();
      this._logService.error(`Error providing chat session content for handle ${providerHandle} and resource ${sessionResource.toString()}:`, error);
      throw error;
    }
  }
  $unregisterChatSessionItemProvider(handle) {
    this._itemProvidersRegistrations.deleteAndDispose(handle);
  }
  $registerChatSessionContentProvider(handle, chatSessionScheme) {
    const provider = {
      provideChatSessionContent: /* @__PURE__ */ __name((resource, token) => this._provideChatSessionContent(handle, resource, token), "provideChatSessionContent")
    };
    this._sessionTypeToHandle.set(chatSessionScheme, handle);
    this._contentProvidersRegistrations.set(handle, this._chatSessionsService.registerChatSessionContentProvider(chatSessionScheme, provider));
    this._refreshProviderOptions(handle, chatSessionScheme);
  }
  $unregisterChatSessionContentProvider(handle) {
    this._contentProvidersRegistrations.deleteAndDispose(handle);
    for (const [sessionType, h] of this._sessionTypeToHandle) {
      if (h === handle) {
        this._sessionTypeToHandle.delete(sessionType);
        break;
      }
    }
    for (const [key, session] of this._activeSessions) {
      if (session.providerHandle === handle) {
        session.dispose();
        this._activeSessions.delete(key);
      }
    }
  }
  async $handleProgressChunk(handle, sessionResource, requestId, chunks) {
    const resource = URI.revive(sessionResource);
    const observableSession = this._activeSessions.get(resource);
    if (!observableSession) {
      this._logService.warn(`No session found for progress chunks: handle ${handle}, sessionResource ${resource}, requestId ${requestId}`);
      return;
    }
    const chatProgressParts = chunks.map((chunk) => {
      const [progress] = Array.isArray(chunk) ? chunk : [chunk];
      return revive(progress);
    });
    observableSession.handleProgressChunk(requestId, chatProgressParts);
  }
  $handleProgressComplete(handle, sessionResource, requestId) {
    const resource = URI.revive(sessionResource);
    const observableSession = this._activeSessions.get(resource);
    if (!observableSession) {
      this._logService.warn(`No session found for progress completion: handle ${handle}, sessionResource ${resource}, requestId ${requestId}`);
      return;
    }
    observableSession.handleProgressComplete(requestId);
  }
  $handleAnchorResolve(handle, sesssionResource, requestId, requestHandle, anchor) {
  }
  $onDidChangeChatSessionProviderOptions(handle) {
    let sessionType;
    for (const [type, h] of this._sessionTypeToHandle) {
      if (h === handle) {
        sessionType = type;
        break;
      }
    }
    if (!sessionType) {
      this._logService.warn(`No session type found for chat session content provider handle ${handle} when refreshing provider options`);
      return;
    }
    this._refreshProviderOptions(handle, sessionType);
  }
  _refreshProviderOptions(handle, chatSessionScheme) {
    this._proxy.$provideChatSessionProviderOptions(handle, CancellationToken.None).then((options) => {
      if (options?.optionGroups && options.optionGroups.length) {
        const groupsWithCallbacks = options.optionGroups.map((group) => ({
          ...group,
          onSearch: group.searchable ? async (query, token) => {
            return await this._proxy.$invokeOptionGroupSearch(handle, group.id, query, token);
          } : void 0
        }));
        this._chatSessionsService.setOptionGroupsForSessionType(chatSessionScheme, handle, groupsWithCallbacks);
      }
    }).catch((err) => this._logService.error("Error fetching chat session options", err));
  }
  dispose() {
    for (const session of this._activeSessions.values()) {
      session.dispose();
    }
    this._activeSessions.clear();
    for (const disposable of this._sessionDisposables.values()) {
      disposable.dispose();
    }
    this._sessionDisposables.clear();
    super.dispose();
  }
  _reviveTooltip(tooltip) {
    if (!tooltip) {
      return void 0;
    }
    if (typeof tooltip === "string") {
      return tooltip;
    }
    if (typeof tooltip === "object" && "value" in tooltip) {
      return MarkdownString.lift(tooltip);
    }
    return void 0;
  }
  /**
   * Notify the extension about option changes for a session
   */
  async notifyOptionsChange(handle, sessionResource, updates) {
    this._logService.trace(`[MainThreadChatSessions] notifyOptionsChange: starting proxy call for handle ${handle}, sessionResource ${sessionResource}`);
    try {
      await this._proxy.$provideHandleOptionsChange(handle, sessionResource, updates, CancellationToken.None);
      this._logService.trace(`[MainThreadChatSessions] notifyOptionsChange: proxy call completed for handle ${handle}, sessionResource ${sessionResource}`);
    } catch (error) {
      this._logService.error(`[MainThreadChatSessions] notifyOptionsChange: error for handle ${handle}, sessionResource ${sessionResource}:`, error);
    }
  }
};
MainThreadChatSessions = __decorate([
  extHostNamedCustomer(MainContext.MainThreadChatSessions),
  __param(1, IAgentSessionsService),
  __param(2, IChatSessionsService),
  __param(3, IChatService),
  __param(4, IChatWidgetService),
  __param(5, IChatTodoListService),
  __param(6, IDialogService),
  __param(7, IEditorService),
  __param(8, IEditorGroupsService),
  __param(9, ILogService)
], MainThreadChatSessions);
export {
  MainThreadChatSessions,
  ObservableChatSession
};
//# sourceMappingURL=mainThreadChatSessions.js.map
