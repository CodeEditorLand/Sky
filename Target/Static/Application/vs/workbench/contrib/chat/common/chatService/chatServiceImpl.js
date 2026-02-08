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
import { DeferredPromise } from "../../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { BugIndicatingError, ErrorNoTelemetry } from "../../../../../base/common/errors.js";
import { Emitter } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Disposable, DisposableResourceMap, DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { revive } from "../../../../../base/common/marshalling.js";
import { Schemas } from "../../../../../base/common/network.js";
import { autorun, derived } from "../../../../../base/common/observable.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { StopWatch } from "../../../../../base/common/stopwatch.js";
import { isDefined } from "../../../../../base/common/types.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { OffsetRange } from "../../../../../editor/common/core/ranges/offsetRange.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { Progress } from "../../../../../platform/progress/common/progress.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { IMcpService } from "../../../mcp/common/mcpTypes.js";
import { awaitStatsForSession } from "../chat.js";
import { IChatAgentService } from "../participants/chatAgents.js";
import { chatEditingSessionIsReady } from "../editing/chatEditingService.js";
import { ChatModel, ChatRequestModel, normalizeSerializableChatData, toChatHistoryContent, updateRanges } from "../model/chatModel.js";
import { ChatModelStore } from "../model/chatModelStore.js";
import { chatAgentLeader, ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestSlashCommandPart, ChatRequestTextPart, chatSubcommandLeader, getPromptText } from "../requestParser/chatParserTypes.js";
import { ChatRequestParser } from "../requestParser/chatRequestParser.js";
import { ChatMcpServersStarting } from "./chatService.js";
import { ChatRequestTelemetry, ChatServiceTelemetry } from "./chatServiceTelemetry.js";
import { IChatSessionsService } from "../chatSessionsService.js";
import { ChatSessionStore } from "../model/chatSessionStore.js";
import { IChatSlashCommandService } from "../participants/chatSlashCommands.js";
import { IChatTransferService } from "../model/chatTransferService.js";
import { LocalChatSessionUri } from "../model/chatUri.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind } from "../constants.js";
import { ILanguageModelToolsService } from "../tools/languageModelToolsService.js";
import { ChatSessionOperationLog } from "../model/chatSessionOperationLog.js";
import { IPromptsService } from "../promptSyntax/service/promptsService.js";
import { IHooksExecutionService } from "../hooksExecutionService.js";
const serializedChatKey = "interactive.sessions";
let CancellableRequest = class CancellableRequest2 {
  static {
    __name(this, "CancellableRequest");
  }
  get yieldRequested() {
    return this._yieldRequested;
  }
  constructor(cancellationTokenSource, requestId, toolsService) {
    this.cancellationTokenSource = cancellationTokenSource;
    this.requestId = requestId;
    this.toolsService = toolsService;
    this._yieldRequested = false;
  }
  dispose() {
    this.cancellationTokenSource.dispose();
  }
  cancel() {
    if (this.requestId) {
      this.toolsService.cancelToolCallsForRequest(this.requestId);
    }
    this.cancellationTokenSource.cancel();
  }
  setYieldRequested() {
    this._yieldRequested = true;
  }
};
CancellableRequest = __decorate([
  __param(2, ILanguageModelToolsService)
], CancellableRequest);
let ChatService = class ChatService2 extends Disposable {
  static {
    __name(this, "ChatService");
  }
  get transferredSessionResource() {
    return this._transferredSessionResource;
  }
  get onDidCreateModel() {
    return this._sessionModels.onDidCreateModel;
  }
  /**
   * For test use only
   */
  setSaveModelsEnabled(enabled) {
    this._saveModelsEnabled = enabled;
  }
  /**
   * For test use only
   */
  waitForModelDisposals() {
    return this._sessionModels.waitForModelDisposals();
  }
  get edits2Enabled() {
    return this.configurationService.getValue(ChatConfiguration.Edits2Enabled);
  }
  get isEmptyWindow() {
    const workspace = this.workspaceContextService.getWorkspace();
    return !workspace.configuration && workspace.folders.length === 0;
  }
  constructor(storageService, logService, extensionService, instantiationService, workspaceContextService, chatSlashCommandService, chatAgentService, configurationService, chatTransferService, chatSessionService, mcpService, promptsService, hooksExecutionService) {
    super();
    this.storageService = storageService;
    this.logService = logService;
    this.extensionService = extensionService;
    this.instantiationService = instantiationService;
    this.workspaceContextService = workspaceContextService;
    this.chatSlashCommandService = chatSlashCommandService;
    this.chatAgentService = chatAgentService;
    this.configurationService = configurationService;
    this.chatTransferService = chatTransferService;
    this.chatSessionService = chatSessionService;
    this.mcpService = mcpService;
    this.promptsService = promptsService;
    this.hooksExecutionService = hooksExecutionService;
    this._pendingRequests = this._register(new DisposableResourceMap());
    this._queuedRequestDeferreds = /* @__PURE__ */ new Map();
    this._saveModelsEnabled = true;
    this._onDidSubmitRequest = this._register(new Emitter());
    this.onDidSubmitRequest = this._onDidSubmitRequest.event;
    this._onDidPerformUserAction = this._register(new Emitter());
    this.onDidPerformUserAction = this._onDidPerformUserAction.event;
    this._onDidReceiveQuestionCarouselAnswer = this._register(new Emitter());
    this.onDidReceiveQuestionCarouselAnswer = this._onDidReceiveQuestionCarouselAnswer.event;
    this._onDidDisposeSession = this._register(new Emitter());
    this.onDidDisposeSession = this._onDidDisposeSession.event;
    this._sessionFollowupCancelTokens = this._register(new DisposableResourceMap());
    this._sessionModels = this._register(instantiationService.createInstance(ChatModelStore, {
      createModel: /* @__PURE__ */ __name((props) => this._startSession(props), "createModel"),
      willDisposeModel: /* @__PURE__ */ __name(async (model) => {
        const localSessionId = LocalChatSessionUri.parseLocalSessionId(model.sessionResource);
        if (localSessionId && this.shouldStoreSession(model)) {
          if (model.getRequests().length === 0 && !model.customTitle) {
            await this._chatSessionStore.deleteSession(localSessionId);
          } else if (this._saveModelsEnabled) {
            await this._chatSessionStore.storeSessions([model]);
          }
        } else if (!localSessionId && model.getRequests().length > 0) {
          await this._chatSessionStore.storeSessionsMetadataOnly([model]);
        }
      }, "willDisposeModel")
    }));
    this._register(this._sessionModels.onDidDisposeModel((model) => {
      this._onDidDisposeSession.fire({ sessionResource: [model.sessionResource], reason: "cleared" });
    }));
    this._chatServiceTelemetry = this.instantiationService.createInstance(ChatServiceTelemetry);
    this._chatSessionStore = this._register(this.instantiationService.createInstance(ChatSessionStore));
    this._chatSessionStore.migrateDataIfNeeded(() => this.migrateData());
    const transferredData = this._chatSessionStore.getTransferredSessionData();
    if (transferredData) {
      this.trace("constructor", `Transferred session ${transferredData}`);
      this._transferredSessionResource = transferredData;
    }
    this.reviveSessionsWithEdits();
    this._register(storageService.onWillSaveState(() => this.saveState()));
    this.chatModels = derived(this, (reader) => [...this._sessionModels.observable.read(reader).values()]);
    this.requestInProgressObs = derived((reader) => {
      const models = this._sessionModels.observable.read(reader).values();
      return Iterable.some(models, (model) => model.requestInProgress.read(reader));
    });
  }
  get editingSessions() {
    return [...this._sessionModels.values()].map((v) => v.editingSession).filter(isDefined);
  }
  isEnabled(location) {
    return this.chatAgentService.getContributedDefaultAgent(location) !== void 0;
  }
  migrateData() {
    const sessionData = this.storageService.get(serializedChatKey, this.isEmptyWindow ? -1 : 1, "");
    if (sessionData) {
      const persistedSessions = this.deserializeChats(sessionData);
      const countsForLog = Object.keys(persistedSessions).length;
      if (countsForLog > 0) {
        this.info("migrateData", `Restored ${countsForLog} persisted sessions`);
      }
      return persistedSessions;
    }
    return;
  }
  saveState() {
    if (!this._saveModelsEnabled) {
      return;
    }
    const liveLocalChats = Array.from(this._sessionModels.values()).filter((session) => this.shouldStoreSession(session));
    this._chatSessionStore.storeSessions(liveLocalChats);
    const liveNonLocalChats = Array.from(this._sessionModels.values()).filter((session) => !LocalChatSessionUri.parseLocalSessionId(session.sessionResource));
    this._chatSessionStore.storeSessionsMetadataOnly(liveNonLocalChats);
  }
  /**
   * Only persist local sessions from chat that are not imported.
   */
  shouldStoreSession(session) {
    if (!LocalChatSessionUri.parseLocalSessionId(session.sessionResource)) {
      return false;
    }
    return session.initialLocation === ChatAgentLocation.Chat && !session.isImported;
  }
  notifyUserAction(action) {
    this._chatServiceTelemetry.notifyUserAction(action);
    this._onDidPerformUserAction.fire(action);
    if (action.action.kind === "chatEditingSessionAction") {
      const model = this._sessionModels.get(action.sessionResource);
      if (model) {
        model.notifyEditingAction(action.action);
      }
    }
  }
  notifyQuestionCarouselAnswer(requestId, resolveId, answers) {
    this._onDidReceiveQuestionCarouselAnswer.fire({ requestId, resolveId, answers });
  }
  async setChatSessionTitle(sessionResource, title) {
    const model = this._sessionModels.get(sessionResource);
    if (model) {
      model.setCustomTitle(title);
    }
    const localSessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    if (localSessionId) {
      await this._chatSessionStore.setSessionTitle(localSessionId, title);
      this.saveState();
    }
  }
  trace(method, message) {
    if (message) {
      this.logService.trace(`ChatService#${method}: ${message}`);
    } else {
      this.logService.trace(`ChatService#${method}`);
    }
  }
  info(method, message) {
    if (message) {
      this.logService.info(`ChatService#${method}: ${message}`);
    } else {
      this.logService.info(`ChatService#${method}`);
    }
  }
  error(method, message) {
    this.logService.error(`ChatService#${method} ${message}`);
  }
  deserializeChats(sessionData) {
    try {
      const arrayOfSessions = revive(JSON.parse(sessionData));
      if (!Array.isArray(arrayOfSessions)) {
        throw new Error("Expected array");
      }
      const sessions = arrayOfSessions.reduce((acc, session) => {
        for (const request of session.requests) {
          if (Array.isArray(request.response)) {
            request.response = request.response.map((response) => {
              if (typeof response === "string") {
                return new MarkdownString(response);
              }
              return response;
            });
          } else if (typeof request.response === "string") {
            request.response = [new MarkdownString(request.response)];
          }
        }
        acc[session.sessionId] = normalizeSerializableChatData(session);
        return acc;
      }, {});
      return sessions;
    } catch (err) {
      this.error("deserializeChats", `Malformed session data: ${err}. [${sessionData.substring(0, 20)}${sessionData.length > 20 ? "..." : ""}]`);
      return {};
    }
  }
  /**
   * todo@connor4312 This will be cleaned up with the globalization of edits.
   */
  async reviveSessionsWithEdits() {
    const idx = await this._chatSessionStore.getIndex();
    await Promise.all(Object.values(idx).map(async (session) => {
      if (!session.hasPendingEdits) {
        return;
      }
      const sessionResource = LocalChatSessionUri.forSession(session.sessionId);
      const sessionRef = await this.getOrRestoreSession(sessionResource);
      if (sessionRef?.object.editingSession) {
        await chatEditingSessionIsReady(sessionRef.object.editingSession);
        sessionRef.dispose();
      }
    }));
  }
  /**
   * Returns an array of chat details for all persisted chat sessions that have at least one request.
   * Chat sessions that have already been loaded into the chat view are excluded from the result.
   * Imported chat sessions are also excluded from the result.
   * TODO this is only used by the old "show chats" command which can be removed when the pre-agents view
   * options are removed.
   */
  async getLocalSessionHistory() {
    const liveSessionItems = await this.getLiveSessionItems();
    const historySessionItems = await this.getHistorySessionItems();
    return [...liveSessionItems, ...historySessionItems];
  }
  /**
   * Returns an array of chat details for all local live chat sessions.
   */
  async getLiveSessionItems() {
    return await Promise.all(Array.from(this._sessionModels.values()).filter((session) => this.shouldBeInHistory(session)).map(async (session) => {
      const title = session.title || localize("newChat", "New Chat");
      return {
        sessionResource: session.sessionResource,
        title,
        lastMessageDate: session.lastMessageDate,
        timing: session.timing,
        isActive: true,
        stats: await awaitStatsForSession(session),
        lastResponseState: session.lastRequest?.response?.state ?? 0
      };
    }));
  }
  /**
   * Returns an array of chat details for all local chat sessions in history (not currently loaded).
   */
  async getHistorySessionItems() {
    const index = await this._chatSessionStore.getIndex();
    return Object.values(index).filter((entry) => !entry.isExternal).filter((entry) => !this._sessionModels.has(LocalChatSessionUri.forSession(entry.sessionId)) && entry.initialLocation === ChatAgentLocation.Chat && !entry.isEmpty).map((entry) => {
      const sessionResource = LocalChatSessionUri.forSession(entry.sessionId);
      return {
        ...entry,
        sessionResource,
        isActive: this._sessionModels.has(sessionResource)
      };
    });
  }
  async getMetadataForSession(sessionResource) {
    const index = await this._chatSessionStore.getIndex();
    const metadata = index[sessionResource.toString()];
    if (metadata) {
      return {
        ...metadata,
        sessionResource,
        isActive: this._sessionModels.has(sessionResource)
      };
    }
    return void 0;
  }
  shouldBeInHistory(entry) {
    return !entry.isImported && !!LocalChatSessionUri.parseLocalSessionId(entry.sessionResource) && entry.initialLocation === ChatAgentLocation.Chat;
  }
  async removeHistoryEntry(sessionResource) {
    await this._chatSessionStore.deleteSession(this.toLocalSessionId(sessionResource));
    this._onDidDisposeSession.fire({ sessionResource: [sessionResource], reason: "cleared" });
  }
  async clearAllHistoryEntries() {
    await this._chatSessionStore.clearAllSessions();
  }
  startSession(location, options) {
    this.trace("startSession");
    const sessionId = generateUuid();
    const sessionResource = LocalChatSessionUri.forSession(sessionId);
    return this._sessionModels.acquireOrCreate({
      initialData: void 0,
      location,
      sessionResource,
      sessionId,
      canUseTools: options?.canUseTools ?? true,
      disableBackgroundKeepAlive: options?.disableBackgroundKeepAlive
    });
  }
  _startSession(props) {
    const { initialData, location, sessionResource, sessionId, canUseTools, transferEditingSession, disableBackgroundKeepAlive, inputState } = props;
    const model = this.instantiationService.createInstance(ChatModel, initialData, { initialLocation: location, canUseTools, resource: sessionResource, sessionId, disableBackgroundKeepAlive, inputState });
    if (location === ChatAgentLocation.Chat) {
      model.startEditingSession(true, transferEditingSession);
    }
    this.initializeSession(model);
    return model;
  }
  initializeSession(model) {
    this.trace("initializeSession", `Initialize session ${model.sessionResource}`);
    this.activateDefaultAgent(model.initialLocation).catch((e) => this.logService.error(e));
  }
  async activateDefaultAgent(location) {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const defaultAgentData = this.chatAgentService.getContributedDefaultAgent(location) ?? this.chatAgentService.getContributedDefaultAgent(ChatAgentLocation.Chat);
    if (!defaultAgentData) {
      throw new ErrorNoTelemetry("No default agent contributed");
    }
    if (!defaultAgentData.isCore) {
      await this.extensionService.activateById(defaultAgentData.extensionId, {
        activationEvent: `onChatParticipant:${defaultAgentData.id}`,
        extensionId: defaultAgentData.extensionId,
        startup: false
      });
    }
    const defaultAgent = this.chatAgentService.getActivatedAgents().find((agent) => agent.id === defaultAgentData.id);
    if (!defaultAgent) {
      throw new ErrorNoTelemetry("No default agent registered");
    }
  }
  getSession(sessionResource) {
    return this._sessionModels.get(sessionResource);
  }
  getActiveSessionReference(sessionResource) {
    return this._sessionModels.acquireExisting(sessionResource);
  }
  async getOrRestoreSession(sessionResource) {
    this.trace("getOrRestoreSession", `${sessionResource}`);
    const existingRef = this._sessionModels.acquireExisting(sessionResource);
    if (existingRef) {
      return existingRef;
    }
    const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    if (!sessionId) {
      throw new Error(`Cannot restore non-local session ${sessionResource}`);
    }
    let sessionData;
    if (isEqual(this.transferredSessionResource, sessionResource)) {
      this._transferredSessionResource = void 0;
      sessionData = await this._chatSessionStore.readTransferredSession(sessionResource);
    } else {
      sessionData = await this._chatSessionStore.readSession(sessionId);
    }
    if (!sessionData) {
      return void 0;
    }
    const sessionRef = this._sessionModels.acquireOrCreate({
      initialData: sessionData,
      location: sessionData.value.initialLocation ?? ChatAgentLocation.Chat,
      sessionResource,
      sessionId,
      canUseTools: true
    });
    return sessionRef;
  }
  // There are some cases where this returns a real string. What happens if it doesn't?
  // This had titles restored from the index, so just return titles from index instead, sync.
  getSessionTitle(sessionResource) {
    const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    if (!sessionId) {
      return void 0;
    }
    return this._sessionModels.get(sessionResource)?.title ?? this._chatSessionStore.getMetadataForSessionSync(sessionResource)?.title;
  }
  loadSessionFromContent(data) {
    const sessionId = data.sessionId ?? generateUuid();
    const sessionResource = LocalChatSessionUri.forSession(sessionId);
    return this._sessionModels.acquireOrCreate({
      initialData: { value: data, serializer: new ChatSessionOperationLog() },
      location: data.initialLocation ?? ChatAgentLocation.Chat,
      sessionResource,
      sessionId,
      canUseTools: true
    });
  }
  async loadSessionForResource(chatSessionResource, location, token) {
    if (chatSessionResource.scheme === Schemas.vscodeLocalChatSession) {
      return this.getOrRestoreSession(chatSessionResource);
    }
    const existingRef = this._sessionModels.acquireExisting(chatSessionResource);
    if (existingRef) {
      return existingRef;
    }
    const providedSession = await this.chatSessionService.getOrCreateChatSession(chatSessionResource, CancellationToken.None);
    const chatSessionType = chatSessionResource.scheme;
    const modelRef = this._sessionModels.acquireOrCreate({
      initialData: void 0,
      location,
      sessionResource: chatSessionResource,
      canUseTools: false,
      transferEditingSession: providedSession.transferredState?.editingSession,
      inputState: providedSession.transferredState?.inputState
    });
    modelRef.object.setContributedChatSession({
      chatSessionResource,
      chatSessionType,
      isUntitled: chatSessionResource.path.startsWith("/untitled-")
      //TODO(jospicer)
    });
    const model = modelRef.object;
    const disposables = new DisposableStore();
    disposables.add(modelRef.object.onDidDispose(() => {
      disposables.dispose();
      providedSession.dispose();
    }));
    let lastRequest;
    for (const message of providedSession.history) {
      if (message.type === "request") {
        if (lastRequest) {
          lastRequest.response?.complete();
        }
        const requestText = message.prompt;
        const parsedRequest = {
          text: requestText,
          parts: [new ChatRequestTextPart(new OffsetRange(0, requestText.length), { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: requestText.length + 1 }, requestText)]
        };
        const agent = message.participant ? this.chatAgentService.getAgent(message.participant) : this.chatAgentService.getAgent(chatSessionType);
        lastRequest = model.addRequest(
          parsedRequest,
          message.variableData ?? { variables: [] },
          0,
          // attempt
          void 0,
          agent,
          void 0,
          // slashCommand
          void 0,
          // confirmation
          void 0,
          // locationData
          void 0,
          // attachments
          false,
          // Do not treat as requests completed, else edit pills won't show.
          void 0,
          void 0,
          message.id
        );
      } else {
        if (lastRequest) {
          for (const part of message.parts) {
            model.acceptResponseProgress(lastRequest, part);
          }
        }
      }
    }
    if (providedSession.isCompleteObs?.get()) {
      lastRequest?.response?.complete();
    }
    if (providedSession.progressObs && lastRequest && providedSession.interruptActiveResponseCallback) {
      const initialCancellationRequest = this.instantiationService.createInstance(CancellableRequest, new CancellationTokenSource(), void 0);
      this._pendingRequests.set(model.sessionResource, initialCancellationRequest);
      const cancellationListener = disposables.add(new MutableDisposable());
      const createCancellationListener = /* @__PURE__ */ __name((token2) => {
        return token2.onCancellationRequested(() => {
          providedSession.interruptActiveResponseCallback?.().then((userConfirmedInterruption) => {
            if (!userConfirmedInterruption) {
              const newCancellationRequest = this.instantiationService.createInstance(CancellableRequest, new CancellationTokenSource(), void 0);
              this._pendingRequests.set(model.sessionResource, newCancellationRequest);
              cancellationListener.value = createCancellationListener(newCancellationRequest.cancellationTokenSource.token);
            }
          });
        });
      }, "createCancellationListener");
      cancellationListener.value = createCancellationListener(initialCancellationRequest.cancellationTokenSource.token);
      let lastProgressLength = 0;
      disposables.add(autorun((reader) => {
        const progressArray = providedSession.progressObs?.read(reader) ?? [];
        const isComplete = providedSession.isCompleteObs?.read(reader) ?? false;
        if (progressArray.length > lastProgressLength) {
          const newProgress = progressArray.slice(lastProgressLength);
          for (const progress of newProgress) {
            model?.acceptResponseProgress(lastRequest, progress);
          }
          lastProgressLength = progressArray.length;
        }
        if (isComplete) {
          lastRequest.response?.complete();
          cancellationListener.clear();
        }
      }));
    } else {
      if (lastRequest && model.editingSession) {
        await chatEditingSessionIsReady(model.editingSession);
        lastRequest.response?.complete();
      }
    }
    return modelRef;
  }
  getChatSessionFromInternalUri(sessionResource) {
    const model = this._sessionModels.get(sessionResource);
    if (!model) {
      return;
    }
    const { contributedChatSession } = model;
    return contributedChatSession;
  }
  async resendRequest(request, options) {
    const model = this._sessionModels.get(request.session.sessionResource);
    if (!model && model !== request.session) {
      throw new Error(`Unknown session: ${request.session.sessionResource}`);
    }
    const cts = this._pendingRequests.get(request.session.sessionResource);
    if (cts) {
      this.trace("resendRequest", `Session ${request.session.sessionResource} already has a pending request, cancelling...`);
      cts.cancel();
    }
    const location = options?.location ?? model.initialLocation;
    const attempt = options?.attempt ?? 0;
    const enableCommandDetection = !options?.noCommandDetection;
    const defaultAgent = this.chatAgentService.getDefaultAgent(location, options?.modeInfo?.kind);
    model.removeRequest(
      request.id,
      1
      /* ChatRequestRemovalReason.Resend */
    );
    const resendOptions = {
      ...options,
      locationData: request.locationData,
      attachedContext: request.attachedContext
    };
    await this._sendRequestAsync(model, model.sessionResource, request.message, attempt, enableCommandDetection, defaultAgent, location, resendOptions).responseCompletePromise;
  }
  queuePendingRequest(model, sessionResource, request, options) {
    const location = options.location ?? model.initialLocation;
    const parsedRequest = this.parseChatRequest(sessionResource, request, location, options);
    const requestModel = new ChatRequestModel({
      session: model,
      message: parsedRequest,
      variableData: { variables: [] },
      timestamp: Date.now(),
      modeInfo: options.modeInfo,
      locationData: options.locationData,
      attachedContext: options.attachedContext,
      modelId: options.userSelectedModelId,
      userSelectedTools: options.userSelectedTools?.get()
    });
    const deferred = new DeferredPromise();
    this._queuedRequestDeferreds.set(requestModel.id, deferred);
    model.addPendingRequest(requestModel, options.queue ?? "queued", { ...options, queue: void 0 });
    if (options.queue === "steering") {
      this.setYieldRequested(sessionResource);
    }
    this.trace("sendRequest", `Queued message for session ${sessionResource}`);
    return { kind: "queued", deferred: deferred.p };
  }
  async sendRequest(sessionResource, request, options) {
    this.trace("sendRequest", `sessionResource: ${sessionResource.toString()}, message: ${request.substring(0, 20)}${request.length > 20 ? "[...]" : ""}}`);
    if (!request.trim() && !options?.slashCommand && !options?.agentId && !options?.agentIdSilent) {
      this.trace("sendRequest", "Rejected empty message");
      return { kind: "rejected", reason: "Empty message" };
    }
    const model = this._sessionModels.get(sessionResource);
    if (!model) {
      throw new Error(`Unknown session: ${sessionResource}`);
    }
    const hasPendingRequest = this._pendingRequests.has(sessionResource);
    const hasPendingQueue = model.getPendingRequests().length > 0;
    if (hasPendingRequest) {
      if (options?.queue) {
        return this.queuePendingRequest(model, sessionResource, request, options);
      }
      this.trace("sendRequest", `Session ${sessionResource} already has a pending request`);
      return { kind: "rejected", reason: "Request already in progress" };
    }
    if (options?.queue && hasPendingQueue) {
      const queued = this.queuePendingRequest(model, sessionResource, request, options);
      this.processNextPendingRequest(model);
      return queued;
    }
    const requests = model.getRequests();
    for (let i = requests.length - 1; i >= 0; i -= 1) {
      const request2 = requests[i];
      if (request2.shouldBeRemovedOnSend) {
        if (request2.shouldBeRemovedOnSend.afterUndoStop) {
          request2.response?.finalizeUndoState();
        } else {
          await this.removeRequest(sessionResource, request2.id);
        }
      }
    }
    const location = options?.location ?? model.initialLocation;
    const attempt = options?.attempt ?? 0;
    const defaultAgent = this.chatAgentService.getDefaultAgent(location, options?.modeInfo?.kind);
    const parsedRequest = this.parseChatRequest(sessionResource, request, location, options);
    const silentAgent = options?.agentIdSilent ? this.chatAgentService.getAgent(options.agentIdSilent) : void 0;
    const agent = silentAgent ?? parsedRequest.parts.find((r) => r instanceof ChatRequestAgentPart)?.agent ?? defaultAgent;
    const agentSlashCommandPart = parsedRequest.parts.find((r) => r instanceof ChatRequestAgentSubcommandPart);
    return {
      kind: "sent",
      data: {
        ...this._sendRequestAsync(model, sessionResource, parsedRequest, attempt, !options?.noCommandDetection, silentAgent ?? defaultAgent, location, options),
        agent,
        slashCommand: agentSlashCommandPart?.command
      }
    };
  }
  parseChatRequest(sessionResource, request, location, options) {
    let parserContext = options?.parserContext;
    if (options?.agentId) {
      const agent = this.chatAgentService.getAgent(options.agentId);
      if (!agent) {
        throw new Error(`Unknown agent: ${options.agentId}`);
      }
      parserContext = { selectedAgent: agent, mode: options.modeInfo?.kind };
      const commandPart = options.slashCommand ? ` ${chatSubcommandLeader}${options.slashCommand}` : "";
      request = `${chatAgentLeader}${agent.name}${commandPart} ${request}`;
    }
    const parsedRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(sessionResource, request, location, parserContext);
    return parsedRequest;
  }
  refreshFollowupsCancellationToken(sessionResource) {
    this._sessionFollowupCancelTokens.get(sessionResource)?.cancel();
    const newTokenSource = new CancellationTokenSource();
    this._sessionFollowupCancelTokens.set(sessionResource, newTokenSource);
    return newTokenSource.token;
  }
  _sendRequestAsync(model, sessionResource, parsedRequest, attempt, enableCommandDetection, defaultAgent, location, options) {
    const followupsCancelToken = this.refreshFollowupsCancellationToken(sessionResource);
    let request;
    const agentPart = parsedRequest.parts.find((r) => r instanceof ChatRequestAgentPart);
    const agentSlashCommandPart = parsedRequest.parts.find((r) => r instanceof ChatRequestAgentSubcommandPart);
    const commandPart = parsedRequest.parts.find((r) => r instanceof ChatRequestSlashCommandPart);
    const requests = [...model.getRequests()];
    const requestTelemetry = this.instantiationService.createInstance(ChatRequestTelemetry, {
      agent: agentPart?.agent ?? defaultAgent,
      agentSlashCommandPart,
      commandPart,
      sessionId: model.sessionId,
      location: model.initialLocation,
      options,
      enableCommandDetection
    });
    let gotProgress = false;
    const requestType = commandPart ? "slashCommand" : "string";
    const responseCreated = new DeferredPromise();
    let responseCreatedComplete = false;
    function completeResponseCreated() {
      if (!responseCreatedComplete && request?.response) {
        responseCreated.complete(request.response);
        responseCreatedComplete = true;
      }
    }
    __name(completeResponseCreated, "completeResponseCreated");
    const store = new DisposableStore();
    const source = store.add(new CancellationTokenSource());
    const token = source.token;
    const sendRequestInternal = /* @__PURE__ */ __name(async () => {
      const progressCallback = /* @__PURE__ */ __name((progress) => {
        if (token.isCancellationRequested) {
          return;
        }
        gotProgress = true;
        for (let i = 0; i < progress.length; i++) {
          const isLast = i === progress.length - 1;
          const progressItem = progress[i];
          if (progressItem.kind === "markdownContent") {
            this.trace("sendRequest", `Provider returned progress for session ${model.sessionResource}, ${progressItem.content.value.length} chars`);
          } else {
            this.trace("sendRequest", `Provider returned progress: ${JSON.stringify(progressItem)}`);
          }
          model.acceptResponseProgress(request, progressItem, !isLast);
        }
        completeResponseCreated();
      }, "progressCallback");
      let detectedAgent;
      let detectedCommand;
      let collectedHooks;
      try {
        collectedHooks = await this.promptsService.getHooks(token);
      } catch (error) {
        this.logService.warn("[ChatService] Failed to collect hooks:", error);
      }
      if (collectedHooks) {
        store.add(this.hooksExecutionService.registerHooks(model.sessionResource, collectedHooks));
      }
      const stopWatch = new StopWatch(false);
      store.add(token.onCancellationRequested(() => {
        this.trace("sendRequest", `Request for session ${model.sessionResource} was cancelled`);
        if (!request) {
          return;
        }
        requestTelemetry.complete({
          timeToFirstProgress: void 0,
          result: "cancelled",
          // Normally timings happen inside the EH around the actual provider. For cancellation we can measure how long the user waited before cancelling
          totalTime: stopWatch.elapsed(),
          requestType,
          detectedAgent,
          request
        });
        model.cancelRequest(request);
      }));
      try {
        let rawResult;
        let agentOrCommandFollowups = void 0;
        if (agentPart || defaultAgent && !commandPart) {
          const prepareChatAgentRequest = /* @__PURE__ */ __name((agent2, command2, enableCommandDetection2, chatRequest, isParticipantDetected) => {
            const initVariableData = { variables: [] };
            request = chatRequest ?? model.addRequest(parsedRequest, initVariableData, attempt, options?.modeInfo, agent2, command2, options?.confirmation, options?.locationData, options?.attachedContext, void 0, options?.userSelectedModelId, options?.userSelectedTools?.get());
            let variableData;
            let message;
            if (chatRequest) {
              variableData = chatRequest.variableData;
              message = getPromptText(request.message).message;
            } else {
              variableData = { variables: this.prepareContext(request.attachedContext) };
              model.updateRequest(request, variableData);
              const promptTextResult = getPromptText(request.message);
              variableData = updateRanges(variableData, promptTextResult.diff);
              message = promptTextResult.message;
            }
            const agentRequest = {
              sessionResource: model.sessionResource,
              requestId: request.id,
              agentId: agent2.id,
              message,
              command: command2?.name,
              variables: variableData,
              enableCommandDetection: enableCommandDetection2,
              isParticipantDetected,
              attempt,
              location,
              locationData: request.locationData,
              acceptedConfirmationData: options?.acceptedConfirmationData,
              rejectedConfirmationData: options?.rejectedConfirmationData,
              userSelectedModelId: options?.userSelectedModelId,
              userSelectedTools: options?.userSelectedTools?.get(),
              modeInstructions: options?.modeInfo?.modeInstructions,
              editedFileEvents: request.editedFileEvents,
              hooks: collectedHooks
            };
            let isInitialTools = true;
            store.add(autorun((reader) => {
              const tools = options?.userSelectedTools?.read(reader);
              if (isInitialTools) {
                isInitialTools = false;
                return;
              }
              if (tools) {
                this.chatAgentService.setRequestTools(agent2.id, request.id, tools);
                agentRequest.userSelectedTools = tools;
              }
            }));
            return agentRequest;
          }, "prepareChatAgentRequest");
          if (this.configurationService.getValue("chat.detectParticipant.enabled") !== false && this.chatAgentService.hasChatParticipantDetectionProviders() && !agentPart && !commandPart && !agentSlashCommandPart && enableCommandDetection && (location !== ChatAgentLocation.EditorInline || !this.configurationService.getValue(
            "inlineChat.enableV2"
            /* InlineChatConfigKeys.EnableV2 */
          )) && options?.modeInfo?.kind !== ChatModeKind.Agent && options?.modeInfo?.kind !== ChatModeKind.Edit && !options?.agentIdSilent) {
            const defaultAgentHistory = this.getHistoryEntriesFromModel(requests, location, defaultAgent.id);
            const chatAgentRequest = prepareChatAgentRequest(defaultAgent, void 0, enableCommandDetection, void 0, false);
            const result = await this.chatAgentService.detectAgentOrCommand(chatAgentRequest, defaultAgentHistory, { location }, token);
            if (result && this.chatAgentService.getAgent(result.agent.id)?.locations?.includes(location)) {
              request.response?.setAgent(result.agent, result.command);
              detectedAgent = result.agent;
              detectedCommand = result.command;
            }
          }
          const agent = detectedAgent ?? agentPart?.agent ?? defaultAgent;
          const command = detectedCommand ?? agentSlashCommandPart?.command;
          await this.extensionService.activateByEvent(`onChatParticipant:${agent.id}`);
          const history = this.getHistoryEntriesFromModel(requests, location, agent.id);
          const requestProps = prepareChatAgentRequest(agent, command, enableCommandDetection, request, !!detectedAgent);
          this.generateInitialChatTitleIfNeeded(model, requestProps, defaultAgent, token);
          const pendingRequest = this._pendingRequests.get(sessionResource);
          if (pendingRequest && !pendingRequest.requestId) {
            pendingRequest.requestId = requestProps.requestId;
          }
          completeResponseCreated();
          if (model.canUseTools) {
            const autostartResult = new ChatMcpServersStarting(this.mcpService.autostart(token));
            if (!autostartResult.isEmpty) {
              progressCallback([autostartResult]);
              await autostartResult.wait();
            }
          }
          const agentResult = await this.chatAgentService.invokeAgent(agent.id, requestProps, progressCallback, history, token);
          rawResult = agentResult;
          agentOrCommandFollowups = this.chatAgentService.getFollowups(agent.id, requestProps, agentResult, history, followupsCancelToken);
        } else if (commandPart && this.chatSlashCommandService.hasCommand(commandPart.slashCommand.command)) {
          if (commandPart.slashCommand.silent !== true) {
            request = model.addRequest(parsedRequest, { variables: [] }, attempt, options?.modeInfo);
            completeResponseCreated();
          }
          const history = [];
          for (const modelRequest of model.getRequests()) {
            if (!modelRequest.response) {
              continue;
            }
            history.push({ role: 1, content: [{ type: "text", value: modelRequest.message.text }] });
            history.push({ role: 2, content: [{ type: "text", value: modelRequest.response.response.toString() }] });
          }
          const message = parsedRequest.text;
          const commandResult = await this.chatSlashCommandService.executeCommand(commandPart.slashCommand.command, message.substring(commandPart.slashCommand.command.length + 1).trimStart(), new Progress((p) => {
            progressCallback([p]);
          }), history, location, model.sessionResource, token);
          agentOrCommandFollowups = Promise.resolve(commandResult?.followUp);
          rawResult = {};
        } else {
          throw new Error(`Cannot handle request`);
        }
        if (token.isCancellationRequested && !rawResult) {
          return;
        } else {
          if (!rawResult) {
            this.trace("sendRequest", `Provider returned no response for session ${model.sessionResource}`);
            rawResult = { errorDetails: { message: localize("emptyResponse", "Provider returned null response") } };
          }
          const result = rawResult.errorDetails?.responseIsFiltered ? "filtered" : rawResult.errorDetails && gotProgress ? "errorWithOutput" : rawResult.errorDetails ? "error" : "success";
          requestTelemetry.complete({
            timeToFirstProgress: rawResult.timings?.firstProgress,
            totalTime: rawResult.timings?.totalElapsed,
            result,
            requestType,
            detectedAgent,
            request
          });
          model.setResponse(request, rawResult);
          completeResponseCreated();
          this.trace("sendRequest", `Provider returned response for session ${model.sessionResource}`);
          shouldProcessPending = !rawResult.errorDetails && !token.isCancellationRequested;
          request.response?.complete();
          if (agentOrCommandFollowups) {
            agentOrCommandFollowups.then((followups) => {
              model.setFollowups(request, followups);
              const commandForTelemetry = agentSlashCommandPart ? agentSlashCommandPart.command.name : commandPart?.slashCommand.command;
              this._chatServiceTelemetry.retrievedFollowups(agentPart?.agent.id ?? "", commandForTelemetry, followups?.length ?? 0);
            });
          }
        }
      } catch (err) {
        this.logService.error(`Error while handling chat request: ${toErrorMessage(err, true)}`);
        requestTelemetry.complete({
          timeToFirstProgress: void 0,
          totalTime: void 0,
          result: "error",
          requestType,
          detectedAgent,
          request
        });
        if (request) {
          const rawResult = { errorDetails: { message: err.message } };
          model.setResponse(request, rawResult);
          completeResponseCreated();
          request.response?.complete();
        }
      } finally {
        store.dispose();
      }
    }, "sendRequestInternal");
    let shouldProcessPending = false;
    const rawResponsePromise = sendRequestInternal();
    this._pendingRequests.set(model.sessionResource, this.instantiationService.createInstance(CancellableRequest, source, void 0));
    rawResponsePromise.finally(() => {
      this._pendingRequests.deleteAndDispose(model.sessionResource);
      if (shouldProcessPending) {
        this.processNextPendingRequest(model);
      }
    });
    this._onDidSubmitRequest.fire({ chatSessionResource: model.sessionResource });
    return {
      responseCreatedPromise: responseCreated.p,
      responseCompletePromise: rawResponsePromise
    };
  }
  processPendingRequests(sessionResource) {
    const model = this._sessionModels.get(sessionResource);
    if (model && !this._pendingRequests.has(sessionResource)) {
      this.processNextPendingRequest(model);
    }
  }
  /**
   * Process the next pending request from the model's queue, if any.
   * Called after a request completes to continue processing queued requests.
   */
  processNextPendingRequest(model) {
    const pendingRequest = model.dequeuePendingRequest();
    if (!pendingRequest) {
      return;
    }
    this.trace("processNextPendingRequest", `Processing queued request for session ${model.sessionResource}`);
    const deferred = this._queuedRequestDeferreds.get(pendingRequest.request.id);
    this._queuedRequestDeferreds.delete(pendingRequest.request.id);
    const sendOptions = pendingRequest.sendOptions;
    const location = sendOptions.location ?? sendOptions.locationData?.type ?? model.initialLocation;
    const defaultAgent = this.chatAgentService.getDefaultAgent(location, sendOptions.modeInfo?.kind);
    if (!defaultAgent) {
      this.logService.warn("processNextPendingRequest", `No default agent for location ${location}`);
      deferred?.complete({ kind: "rejected", reason: "No default agent available" });
      return;
    }
    const parsedRequest = pendingRequest.request.message;
    const silentAgent = sendOptions.agentIdSilent ? this.chatAgentService.getAgent(sendOptions.agentIdSilent) : void 0;
    const agent = silentAgent ?? parsedRequest.parts.find((r) => r instanceof ChatRequestAgentPart)?.agent ?? defaultAgent;
    const agentSlashCommandPart = parsedRequest.parts.find((r) => r instanceof ChatRequestAgentSubcommandPart);
    const responseState = this._sendRequestAsync(model, model.sessionResource, parsedRequest, pendingRequest.request.attempt, !sendOptions.noCommandDetection, silentAgent ?? defaultAgent, location, sendOptions);
    deferred?.complete({
      kind: "sent",
      data: {
        ...responseState,
        agent,
        slashCommand: agentSlashCommandPart?.command
      }
    });
  }
  generateInitialChatTitleIfNeeded(model, request, defaultAgent, token) {
    if (model.getRequests().length !== 1 || model.customTitle) {
      return;
    }
    const singleEntryHistory = [{
      request,
      response: [],
      result: {}
    }];
    const generate = /* @__PURE__ */ __name(async () => {
      const title = await this.chatAgentService.getChatTitle(defaultAgent.id, singleEntryHistory, token);
      if (title && !model.customTitle) {
        model.setCustomTitle(title);
      }
    }, "generate");
    void generate();
  }
  prepareContext(attachedContextVariables) {
    attachedContextVariables ??= [];
    attachedContextVariables.sort((a, b) => {
      if (!a.range && !b.range) {
        return 0;
      }
      if (!a.range) {
        return 1;
      }
      if (!b.range) {
        return -1;
      }
      return b.range.start - a.range.start;
    });
    return attachedContextVariables;
  }
  getHistoryEntriesFromModel(requests, location, forAgentId) {
    const history = [];
    const agent = this.chatAgentService.getAgent(forAgentId);
    for (const request of requests) {
      if (!request.response) {
        continue;
      }
      if (forAgentId !== request.response.agent?.id && !agent?.isDefault && !agent?.canAccessPreviousChatHistory) {
        continue;
      }
      if (location === ChatAgentLocation.EditorInline) {
        continue;
      }
      const promptTextResult = getPromptText(request.message);
      const historyRequest = {
        sessionResource: request.session.sessionResource,
        requestId: request.id,
        agentId: request.response.agent?.id ?? "",
        message: promptTextResult.message,
        command: request.response.slashCommand?.name,
        variables: updateRanges(request.variableData, promptTextResult.diff),
        // TODO bit of a hack
        location: ChatAgentLocation.Chat,
        editedFileEvents: request.editedFileEvents
      };
      history.push({ request: historyRequest, response: toChatHistoryContent(request.response.response.value), result: request.response.result ?? {} });
    }
    return history;
  }
  async removeRequest(sessionResource, requestId) {
    const model = this._sessionModels.get(sessionResource);
    if (!model) {
      throw new Error(`Unknown session: ${sessionResource}`);
    }
    const pendingRequest = this._pendingRequests.get(sessionResource);
    if (pendingRequest?.requestId === requestId) {
      pendingRequest.cancel();
      this._pendingRequests.deleteAndDispose(sessionResource);
    }
    model.removeRequest(requestId);
  }
  async adoptRequest(sessionResource, request) {
    if (!(request instanceof ChatRequestModel)) {
      throw new TypeError("Can only adopt requests of type ChatRequestModel");
    }
    const target = this._sessionModels.get(sessionResource);
    if (!target) {
      throw new Error(`Unknown session: ${sessionResource}`);
    }
    const oldOwner = request.session;
    target.adoptRequest(request);
    if (request.response && !request.response.isComplete) {
      const cts = this._pendingRequests.deleteAndLeak(oldOwner.sessionResource);
      if (cts) {
        cts.requestId = request.id;
        this._pendingRequests.set(target.sessionResource, cts);
      }
    }
  }
  async addCompleteRequest(sessionResource, message, variableData, attempt, response) {
    this.trace("addCompleteRequest", `message: ${message}`);
    const model = this._sessionModels.get(sessionResource);
    if (!model) {
      throw new Error(`Unknown session: ${sessionResource}`);
    }
    const parsedRequest = typeof message === "string" ? this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(sessionResource, message) : message;
    const request = model.addRequest(parsedRequest, variableData || { variables: [] }, attempt ?? 0, void 0, void 0, void 0, void 0, void 0, void 0, true);
    if (typeof response.message === "string") {
      model.acceptResponseProgress(request, { content: new MarkdownString(response.message), kind: "markdownContent" });
    } else {
      for (const part of response.message) {
        model.acceptResponseProgress(request, part, true);
      }
    }
    model.setResponse(request, response.result || {});
    if (response.followups !== void 0) {
      model.setFollowups(request, response.followups);
    }
    request.response?.complete();
  }
  cancelCurrentRequestForSession(sessionResource) {
    this.trace("cancelCurrentRequestForSession", `session: ${sessionResource}`);
    this._pendingRequests.get(sessionResource)?.cancel();
    this._pendingRequests.deleteAndDispose(sessionResource);
  }
  setYieldRequested(sessionResource) {
    const pendingRequest = this._pendingRequests.get(sessionResource);
    if (pendingRequest) {
      pendingRequest.setYieldRequested();
    }
  }
  removePendingRequest(sessionResource, requestId) {
    const model = this._sessionModels.get(sessionResource);
    if (model) {
      model.removePendingRequest(requestId);
    }
    const deferred = this._queuedRequestDeferreds.get(requestId);
    if (deferred) {
      deferred.complete({ kind: "rejected", reason: "Request was removed from queue" });
      this._queuedRequestDeferreds.delete(requestId);
    }
  }
  setPendingRequests(sessionResource, requests) {
    const model = this._sessionModels.get(sessionResource);
    if (model) {
      model.setPendingRequests(requests);
    }
  }
  hasSessions() {
    return this._chatSessionStore.hasSessions();
  }
  async transferChatSession(transferredSessionResource, toWorkspace) {
    if (!LocalChatSessionUri.isLocalSession(transferredSessionResource)) {
      throw new Error(`Can only transfer local chat sessions. Invalid session: ${transferredSessionResource}`);
    }
    const model = this._sessionModels.get(transferredSessionResource);
    if (!model) {
      throw new Error(`Failed to transfer session. Unknown session: ${transferredSessionResource}`);
    }
    if (model.initialLocation !== ChatAgentLocation.Chat) {
      throw new Error(`Can only transfer chat sessions located in the Chat view. Session ${transferredSessionResource} has location=${model.initialLocation}`);
    }
    await this._chatSessionStore.storeTransferSession({
      sessionResource: model.sessionResource,
      timestampInMilliseconds: Date.now(),
      toWorkspace
    }, model);
    this.chatTransferService.addWorkspaceToTransferred(toWorkspace);
    this.trace("transferChatSession", `Transferred session ${model.sessionResource} to workspace ${toWorkspace.toString()}`);
  }
  getChatStorageFolder() {
    return this._chatSessionStore.getChatStorageFolder();
  }
  logChatIndex() {
    this._chatSessionStore.logIndex();
  }
  setTitle(sessionResource, title) {
    this._sessionModels.get(sessionResource)?.setCustomTitle(title);
  }
  appendProgress(request, progress) {
    const model = this._sessionModels.get(request.session.sessionResource);
    if (!(request instanceof ChatRequestModel)) {
      throw new BugIndicatingError("Can only append progress to requests of type ChatRequestModel");
    }
    model?.acceptResponseProgress(request, progress);
  }
  toLocalSessionId(sessionResource) {
    const localSessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    if (!localSessionId) {
      throw new Error(`Invalid local chat session resource: ${sessionResource}`);
    }
    return localSessionId;
  }
};
ChatService = __decorate([
  __param(0, IStorageService),
  __param(1, ILogService),
  __param(2, IExtensionService),
  __param(3, IInstantiationService),
  __param(4, IWorkspaceContextService),
  __param(5, IChatSlashCommandService),
  __param(6, IChatAgentService),
  __param(7, IConfigurationService),
  __param(8, IChatTransferService),
  __param(9, IChatSessionsService),
  __param(10, IMcpService),
  __param(11, IPromptsService),
  __param(12, IHooksExecutionService)
], ChatService);
export {
  ChatService
};
//# sourceMappingURL=chatServiceImpl.js.map
