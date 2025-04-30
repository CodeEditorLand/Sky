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
import { DeferredPromise } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { memoize } from "../../../../base/common/decorators.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { ErrorNoTelemetry } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable, DisposableMap } from "../../../../base/common/lifecycle.js";
import { revive } from "../../../../base/common/marshalling.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { URI } from "../../../../base/common/uri.js";
import { isLocation } from "../../../../editor/common/languages.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Progress } from "../../../../platform/progress/common/progress.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkbenchAssignmentService } from "../../../services/assignment/common/assignmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IChatAgentService } from "./chatAgents.js";
import { ChatModel, ChatRequestModel, isImageVariableEntry, normalizeSerializableChatData, toChatHistoryContent, updateRanges } from "./chatModel.js";
import { ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestSlashCommandPart, chatAgentLeader, chatSubcommandLeader, getPromptText } from "./chatParserTypes.js";
import { ChatRequestParser } from "./chatRequestParser.js";
import { ChatServiceTelemetry } from "./chatServiceTelemetry.js";
import { ChatSessionStore } from "./chatSessionStore.js";
import { IChatSlashCommandService } from "./chatSlashCommands.js";
import { IChatTransferService } from "./chatTransferService.js";
import { ChatAgentLocation, ChatConfiguration, ChatMode } from "./constants.js";
import { ILanguageModelToolsService } from "./languageModelToolsService.js";
const serializedChatKey = "interactive.sessions";
const globalChatKey = "chat.workspaceTransfer";
const SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS = 1e3 * 60;
const maxPersistedSessions = 25;
let CancellableRequest = class CancellableRequest2 {
  static {
    __name(this, "CancellableRequest");
  }
  constructor(cancellationTokenSource, requestId, toolsService) {
    this.cancellationTokenSource = cancellationTokenSource;
    this.requestId = requestId;
    this.toolsService = toolsService;
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
};
CancellableRequest = __decorate([
  __param(2, ILanguageModelToolsService)
], CancellableRequest);
let ChatService = class ChatService2 extends Disposable {
  static {
    __name(this, "ChatService");
  }
  get transferredSessionData() {
    return this._transferredSessionData;
  }
  get useFileStorage() {
    return this.configurationService.getValue(ChatConfiguration.UseFileStorage);
  }
  get edits2Enabled() {
    return this.configurationService.getValue(ChatConfiguration.Edits2Enabled);
  }
  get isEmptyWindow() {
    const workspace = this.workspaceContextService.getWorkspace();
    return !workspace.configuration && workspace.folders.length === 0;
  }
  constructor(storageService, logService, extensionService, instantiationService, telemetryService, workspaceContextService, chatSlashCommandService, chatAgentService, configurationService, experimentService, chatTransferService) {
    super();
    this.storageService = storageService;
    this.logService = logService;
    this.extensionService = extensionService;
    this.instantiationService = instantiationService;
    this.telemetryService = telemetryService;
    this.workspaceContextService = workspaceContextService;
    this.chatSlashCommandService = chatSlashCommandService;
    this.chatAgentService = chatAgentService;
    this.configurationService = configurationService;
    this.experimentService = experimentService;
    this.chatTransferService = chatTransferService;
    this._sessionModels = this._register(new DisposableMap());
    this._pendingRequests = this._register(new DisposableMap());
    this._deletedChatIds = /* @__PURE__ */ new Set();
    this._onDidSubmitRequest = this._register(new Emitter());
    this.onDidSubmitRequest = this._onDidSubmitRequest.event;
    this._onDidPerformUserAction = this._register(new Emitter());
    this.onDidPerformUserAction = this._onDidPerformUserAction.event;
    this._onDidDisposeSession = this._register(new Emitter());
    this.onDidDisposeSession = this._onDidDisposeSession.event;
    this._sessionFollowupCancelTokens = this._register(new DisposableMap());
    this._chatServiceTelemetry = this.instantiationService.createInstance(ChatServiceTelemetry);
    const sessionData = storageService.get(serializedChatKey, this.isEmptyWindow ? -1 : 1, "");
    if (sessionData) {
      this._persistedSessions = this.deserializeChats(sessionData);
      const countsForLog = Object.keys(this._persistedSessions).length;
      if (countsForLog > 0) {
        this.trace("constructor", `Restored ${countsForLog} persisted sessions`);
      }
    } else {
      this._persistedSessions = {};
    }
    const transferredData = this.getTransferredSessionData();
    const transferredChat = transferredData?.chat;
    if (transferredChat) {
      this.trace("constructor", `Transferred session ${transferredChat.sessionId}`);
      this._persistedSessions[transferredChat.sessionId] = transferredChat;
      this._transferredSessionData = {
        sessionId: transferredChat.sessionId,
        inputValue: transferredData.inputValue,
        location: transferredData.location,
        mode: transferredData.mode
      };
    }
    this._chatSessionStore = this._register(this.instantiationService.createInstance(ChatSessionStore));
    if (this.useFileStorage) {
      this._chatSessionStore.migrateDataIfNeeded(() => this._persistedSessions);
    }
    this._register(storageService.onWillSaveState(() => this.saveState()));
  }
  isEnabled(location) {
    return this.chatAgentService.getContributedDefaultAgent(location) !== void 0;
  }
  saveState() {
    const liveChats = Array.from(this._sessionModels.values()).filter((session) => session.initialLocation === ChatAgentLocation.Panel);
    if (this.useFileStorage) {
      this._chatSessionStore.storeSessions(liveChats);
    } else {
      if (this.isEmptyWindow) {
        this.syncEmptyWindowChats(liveChats);
      } else {
        let allSessions = liveChats;
        allSessions = allSessions.concat(Object.values(this._persistedSessions).filter((session) => !this._sessionModels.has(session.sessionId)).filter((session) => session.requests.length));
        allSessions.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
        allSessions = allSessions.slice(0, maxPersistedSessions);
        if (allSessions.length) {
          this.trace("onWillSaveState", `Persisting ${allSessions.length} sessions`);
        }
        const serialized = JSON.stringify(allSessions);
        if (allSessions.length) {
          this.trace("onWillSaveState", `Persisting ${serialized.length} chars`);
        }
        this.storageService.store(
          serializedChatKey,
          serialized,
          1,
          1
          /* StorageTarget.MACHINE */
        );
      }
    }
    this._deletedChatIds.clear();
  }
  syncEmptyWindowChats(thisWindowChats) {
    const sessionData = this.storageService.get(serializedChatKey, -1, "");
    const originalPersistedSessions = this._persistedSessions;
    let persistedSessions;
    if (sessionData) {
      persistedSessions = this.deserializeChats(sessionData);
      const countsForLog = Object.keys(persistedSessions).length;
      if (countsForLog > 0) {
        this.trace("constructor", `Restored ${countsForLog} persisted sessions`);
      }
    } else {
      persistedSessions = {};
    }
    this._deletedChatIds.forEach((id) => delete persistedSessions[id]);
    Object.values(originalPersistedSessions).forEach((session) => {
      const persistedSession = persistedSessions[session.sessionId];
      if (persistedSession && session.requests.length > persistedSession.requests.length) {
        persistedSessions[session.sessionId] = session;
      } else if (!persistedSession && session.isNew) {
        session.isNew = false;
        persistedSessions[session.sessionId] = session;
      }
    });
    this._persistedSessions = persistedSessions;
    const allSessions = { ...this._persistedSessions };
    for (const chat of thisWindowChats) {
      allSessions[chat.sessionId] = chat;
    }
    let sessionsList = Object.values(allSessions);
    sessionsList.sort((a, b) => (b.creationDate ?? 0) - (a.creationDate ?? 0));
    sessionsList = sessionsList.slice(0, maxPersistedSessions);
    const data = JSON.stringify(sessionsList);
    this.storageService.store(
      serializedChatKey,
      data,
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  notifyUserAction(action) {
    this._chatServiceTelemetry.notifyUserAction(action);
    this._onDidPerformUserAction.fire(action);
    if (action.action.kind === "chatEditingSessionAction") {
      const model = this._sessionModels.get(action.sessionId);
      if (model) {
        model.notifyEditingAction(action.action);
      }
    }
  }
  async setChatSessionTitle(sessionId, title) {
    const model = this._sessionModels.get(sessionId);
    if (model) {
      model.setCustomTitle(title);
      return;
    }
    if (this.useFileStorage) {
      await this._chatSessionStore.setSessionTitle(sessionId, title);
      return;
    }
    const session = this._persistedSessions[sessionId];
    if (session) {
      session.customTitle = title;
    }
  }
  trace(method, message) {
    if (message) {
      this.logService.trace(`ChatService#${method}: ${message}`);
    } else {
      this.logService.trace(`ChatService#${method}`);
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
  getTransferredSessionData() {
    const data = this.storageService.getObject(globalChatKey, 0, []);
    const workspaceUri = this.workspaceContextService.getWorkspace().folders[0]?.uri;
    if (!workspaceUri) {
      return;
    }
    const thisWorkspace = workspaceUri.toString();
    const currentTime = Date.now();
    const transferred = data.find((item) => URI.revive(item.toWorkspace).toString() === thisWorkspace && currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS);
    const filtered = data.filter((item) => URI.revive(item.toWorkspace).toString() !== thisWorkspace && currentTime - item.timestampInMilliseconds < SESSION_TRANSFER_EXPIRATION_IN_MILLISECONDS);
    this.storageService.store(
      globalChatKey,
      JSON.stringify(filtered),
      0,
      1
      /* StorageTarget.MACHINE */
    );
    return transferred;
  }
  /**
   * Returns an array of chat details for all persisted chat sessions that have at least one request.
   * Chat sessions that have already been loaded into the chat view are excluded from the result.
   * Imported chat sessions are also excluded from the result.
   */
  async getHistory() {
    if (this.useFileStorage) {
      const liveSessionItems2 = Array.from(this._sessionModels.values()).filter((session) => !session.isImported).map((session) => {
        const title = session.title || localize("newChat", "New Chat");
        return {
          sessionId: session.sessionId,
          title,
          lastMessageDate: session.lastMessageDate,
          isActive: true
        };
      });
      const index = await this._chatSessionStore.getIndex();
      const entries = Object.values(index).filter((entry) => !this._sessionModels.has(entry.sessionId) && !entry.isImported && !entry.isEmpty).map((entry) => ({
        ...entry,
        isActive: this._sessionModels.has(entry.sessionId)
      }));
      return [...liveSessionItems2, ...entries];
    }
    const persistedSessions = Object.values(this._persistedSessions).filter((session) => session.requests.length > 0).filter((session) => !this._sessionModels.has(session.sessionId));
    const persistedSessionItems = persistedSessions.filter((session) => !session.isImported).map((session) => {
      const title = session.customTitle ?? ChatModel.getDefaultTitle(session.requests);
      return {
        sessionId: session.sessionId,
        title,
        lastMessageDate: session.lastMessageDate,
        isActive: false
      };
    });
    const liveSessionItems = Array.from(this._sessionModels.values()).filter((session) => !session.isImported).map((session) => {
      const title = session.title || localize("newChat", "New Chat");
      return {
        sessionId: session.sessionId,
        title,
        lastMessageDate: session.lastMessageDate,
        isActive: true
      };
    });
    return [...liveSessionItems, ...persistedSessionItems];
  }
  async removeHistoryEntry(sessionId) {
    if (this.useFileStorage) {
      await this._chatSessionStore.deleteSession(sessionId);
      return;
    }
    if (this._persistedSessions[sessionId]) {
      this._deletedChatIds.add(sessionId);
      delete this._persistedSessions[sessionId];
      this.saveState();
    }
  }
  async clearAllHistoryEntries() {
    if (this.useFileStorage) {
      await this._chatSessionStore.clearAllSessions();
      return;
    }
    Object.values(this._persistedSessions).forEach((session) => this._deletedChatIds.add(session.sessionId));
    this._persistedSessions = {};
    this.saveState();
  }
  startSession(location, token, isGlobalEditingSession = true) {
    this.trace("startSession");
    return this._startSession(void 0, location, isGlobalEditingSession, token);
  }
  _startSession(someSessionHistory, location, isGlobalEditingSession, token) {
    const model = this.instantiationService.createInstance(ChatModel, someSessionHistory, location);
    if (location === ChatAgentLocation.Panel) {
      model.startEditingSession(isGlobalEditingSession);
    }
    this._sessionModels.set(model.sessionId, model);
    this.initializeSession(model, token);
    return model;
  }
  async initializeSession(model, token) {
    try {
      this.trace("initializeSession", `Initialize session ${model.sessionId}`);
      model.startInitialize();
      this.activateDefaultAgent(model.initialLocation).catch((e) => this.logService.error(e));
      model.initialize();
    } catch (err) {
      this.trace("startSession", `initializeSession failed: ${err}`);
      model.setInitializationError(err);
      this._sessionModels.deleteAndDispose(model.sessionId);
      this._onDidDisposeSession.fire({ sessionId: model.sessionId, reason: "initializationFailed" });
    }
  }
  async activateDefaultAgent(location) {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const defaultAgentData = this.chatAgentService.getContributedDefaultAgent(location) ?? this.chatAgentService.getContributedDefaultAgent(ChatAgentLocation.Panel);
    if (!defaultAgentData) {
      throw new ErrorNoTelemetry("No default agent contributed");
    }
    await this.extensionService.activateByEvent(`onChatParticipant:${defaultAgentData.id}`);
    const defaultAgent = this.chatAgentService.getActivatedAgents().find((agent) => agent.id === defaultAgentData.id);
    if (!defaultAgent) {
      throw new ErrorNoTelemetry("No default agent registered");
    }
  }
  getSession(sessionId) {
    return this._sessionModels.get(sessionId);
  }
  async getOrRestoreSession(sessionId) {
    this.trace("getOrRestoreSession", `sessionId: ${sessionId}`);
    const model = this._sessionModels.get(sessionId);
    if (model) {
      return model;
    }
    let sessionData;
    if (!this.useFileStorage || this.transferredSessionData?.sessionId === sessionId) {
      sessionData = revive(this._persistedSessions[sessionId]);
    } else {
      sessionData = revive(await this._chatSessionStore.readSession(sessionId));
    }
    if (!sessionData) {
      return void 0;
    }
    const session = this._startSession(sessionData, sessionData.initialLocation ?? ChatAgentLocation.Panel, true, CancellationToken.None);
    const isTransferred = this.transferredSessionData?.sessionId === sessionId;
    if (isTransferred) {
      this._transferredSessionData = void 0;
    }
    return session;
  }
  /**
   * This is really just for migrating data from the edit session location to the panel.
   */
  isPersistedSessionEmpty(sessionId) {
    const session = this._persistedSessions[sessionId];
    if (session) {
      return session.requests.length === 0;
    }
    return this._chatSessionStore.isSessionEmpty(sessionId);
  }
  loadSessionFromContent(data) {
    return this._startSession(data, data.initialLocation ?? ChatAgentLocation.Panel, true, CancellationToken.None);
  }
  async resendRequest(request, options) {
    const model = this._sessionModels.get(request.session.sessionId);
    if (!model && model !== request.session) {
      throw new Error(`Unknown session: ${request.session.sessionId}`);
    }
    await model.waitForInitialization();
    const cts = this._pendingRequests.get(request.session.sessionId);
    if (cts) {
      this.trace("resendRequest", `Session ${request.session.sessionId} already has a pending request, cancelling...`);
      cts.cancel();
    }
    const location = options?.location ?? model.initialLocation;
    const attempt = options?.attempt ?? 0;
    const enableCommandDetection = !options?.noCommandDetection;
    const defaultAgent = this.chatAgentService.getDefaultAgent(location, options?.mode);
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
    await this._sendRequestAsync(model, model.sessionId, request.message, attempt, enableCommandDetection, defaultAgent, location, resendOptions).responseCompletePromise;
  }
  async sendRequest(sessionId, request, options) {
    this.trace("sendRequest", `sessionId: ${sessionId}, message: ${request.substring(0, 20)}${request.length > 20 ? "[...]" : ""}}`);
    if (!request.trim() && !options?.slashCommand && !options?.agentId) {
      this.trace("sendRequest", "Rejected empty message");
      return;
    }
    const model = this._sessionModels.get(sessionId);
    if (!model) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    await model.waitForInitialization();
    if (this._pendingRequests.has(sessionId)) {
      this.trace("sendRequest", `Session ${sessionId} already has a pending request`);
      return;
    }
    const requests = model.getRequests();
    for (let i = requests.length - 1; i >= 0; i -= 1) {
      const request2 = requests[i];
      if (request2.shouldBeRemovedOnSend) {
        if (request2.shouldBeRemovedOnSend.afterUndoStop) {
          request2.response?.finalizeUndoState();
        } else {
          this.removeRequest(sessionId, request2.id);
        }
      }
    }
    const location = options?.location ?? model.initialLocation;
    const attempt = options?.attempt ?? 0;
    const defaultAgent = this.chatAgentService.getDefaultAgent(location, options?.mode);
    const parsedRequest = this.parseChatRequest(sessionId, request, location, options);
    const agent = parsedRequest.parts.find((r) => r instanceof ChatRequestAgentPart)?.agent ?? defaultAgent;
    const agentSlashCommandPart = parsedRequest.parts.find((r) => r instanceof ChatRequestAgentSubcommandPart);
    return {
      ...this._sendRequestAsync(model, sessionId, parsedRequest, attempt, !options?.noCommandDetection, defaultAgent, location, options),
      agent,
      slashCommand: agentSlashCommandPart?.command
    };
  }
  parseChatRequest(sessionId, request, location, options) {
    let parserContext = options?.parserContext;
    if (options?.agentId) {
      const agent = this.chatAgentService.getAgent(options.agentId);
      if (!agent) {
        throw new Error(`Unknown agent: ${options.agentId}`);
      }
      parserContext = { selectedAgent: agent, mode: options.mode };
      const commandPart = options.slashCommand ? ` ${chatSubcommandLeader}${options.slashCommand}` : "";
      request = `${chatAgentLeader}${agent.name}${commandPart} ${request}`;
    }
    const parsedRequest = this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(sessionId, request, location, parserContext);
    return parsedRequest;
  }
  refreshFollowupsCancellationToken(sessionId) {
    this._sessionFollowupCancelTokens.get(sessionId)?.cancel();
    const newTokenSource = new CancellationTokenSource();
    this._sessionFollowupCancelTokens.set(sessionId, newTokenSource);
    return newTokenSource.token;
  }
  _sendRequestAsync(model, sessionId, parsedRequest, attempt, enableCommandDetection, defaultAgent, location, options) {
    const followupsCancelToken = this.refreshFollowupsCancellationToken(sessionId);
    let request;
    const agentPart = "kind" in parsedRequest ? void 0 : parsedRequest.parts.find((r) => r instanceof ChatRequestAgentPart);
    const agentSlashCommandPart = "kind" in parsedRequest ? void 0 : parsedRequest.parts.find((r) => r instanceof ChatRequestAgentSubcommandPart);
    const commandPart = "kind" in parsedRequest ? void 0 : parsedRequest.parts.find((r) => r instanceof ChatRequestSlashCommandPart);
    const requests = [...model.getRequests()];
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
    const source = new CancellationTokenSource();
    const token = source.token;
    const sendRequestInternal = /* @__PURE__ */ __name(async () => {
      const progressCallback = /* @__PURE__ */ __name((progress) => {
        if (token.isCancellationRequested) {
          return;
        }
        gotProgress = true;
        if (progress.kind === "markdownContent") {
          this.trace("sendRequest", `Provider returned progress for session ${model.sessionId}, ${progress.content.value.length} chars`);
        } else {
          this.trace("sendRequest", `Provider returned progress: ${JSON.stringify(progress)}`);
        }
        model.acceptResponseProgress(request, progress);
        completeResponseCreated();
      }, "progressCallback");
      let detectedAgent;
      let detectedCommand;
      const stopWatch = new StopWatch(false);
      const listener = token.onCancellationRequested(() => {
        this.trace("sendRequest", `Request for session ${model.sessionId} was cancelled`);
        this.telemetryService.publicLog2("interactiveSessionProviderInvoked", {
          timeToFirstProgress: void 0,
          // Normally timings happen inside the EH around the actual provider. For cancellation we can measure how long the user waited before cancelling
          totalTime: stopWatch.elapsed(),
          result: "cancelled",
          requestType,
          agent: detectedAgent?.id ?? agentPart?.agent.id ?? "",
          agentExtensionId: detectedAgent?.extensionId.value ?? agentPart?.agent.extensionId.value ?? "",
          slashCommand: agentSlashCommandPart ? agentSlashCommandPart.command.name : commandPart?.slashCommand.command,
          chatSessionId: model.sessionId,
          location,
          citations: request?.response?.codeCitations.length ?? 0,
          numCodeBlocks: getCodeBlocks(request.response?.response.toString() ?? "").length,
          isParticipantDetected: !!detectedAgent,
          enableCommandDetection,
          attachmentKinds: this.attachmentKindsForTelemetry(request.variableData)
        });
        model.cancelRequest(request);
      });
      try {
        let rawResult;
        let agentOrCommandFollowups = void 0;
        let chatTitlePromise;
        if (agentPart || defaultAgent && !commandPart) {
          const prepareChatAgentRequest = /* @__PURE__ */ __name((agent2, command2, enableCommandDetection2, chatRequest, isParticipantDetected) => {
            const initVariableData = { variables: [] };
            request = chatRequest ?? model.addRequest(parsedRequest, initVariableData, attempt, agent2, command2, options?.confirmation, options?.locationData, options?.attachedContext, void 0, options?.userSelectedModelId);
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
            return {
              sessionId,
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
              userSelectedTools: options?.userSelectedTools,
              userSelectedTools2: options?.userSelectedTools2,
              toolSelectionIsExclusive: options?.toolSelectionIsExclusive,
              editedFileEvents: request.editedFileEvents
            };
          }, "prepareChatAgentRequest");
          if (this.configurationService.getValue("chat.detectParticipant.enabled") !== false && this.chatAgentService.hasChatParticipantDetectionProviders() && !agentPart && !commandPart && !agentSlashCommandPart && enableCommandDetection && options?.mode !== ChatMode.Agent && options?.mode !== ChatMode.Edit) {
            const defaultAgentHistory = this.getHistoryEntriesFromModel(requests, model.sessionId, location, defaultAgent.id);
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
          await this.checkAgentAllowed(agent);
          const history = this.getHistoryEntriesFromModel(requests, model.sessionId, location, agent.id);
          const requestProps = prepareChatAgentRequest(agent, command, enableCommandDetection, request, !!detectedAgent);
          const pendingRequest = this._pendingRequests.get(sessionId);
          if (pendingRequest && !pendingRequest.requestId) {
            pendingRequest.requestId = requestProps.requestId;
          }
          completeResponseCreated();
          const agentResult = await this.chatAgentService.invokeAgent(agent.id, requestProps, progressCallback, history, token);
          rawResult = agentResult;
          agentOrCommandFollowups = this.chatAgentService.getFollowups(agent.id, requestProps, agentResult, history, followupsCancelToken);
          chatTitlePromise = model.getRequests().length === 1 && !model.customTitle ? this.chatAgentService.getChatTitle(defaultAgent.id, this.getHistoryEntriesFromModel(model.getRequests(), model.sessionId, location, agent.id), CancellationToken.None) : void 0;
        } else if (commandPart && this.chatSlashCommandService.hasCommand(commandPart.slashCommand.command)) {
          if (commandPart.slashCommand.silent !== true) {
            request = model.addRequest(parsedRequest, { variables: [] }, attempt);
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
            progressCallback(p);
          }), history, location, token);
          agentOrCommandFollowups = Promise.resolve(commandResult?.followUp);
          rawResult = {};
        } else {
          throw new Error(`Cannot handle request`);
        }
        if (token.isCancellationRequested) {
          return;
        } else {
          if (!rawResult) {
            this.trace("sendRequest", `Provider returned no response for session ${model.sessionId}`);
            rawResult = { errorDetails: { message: localize("emptyResponse", "Provider returned null response") } };
          }
          const result = rawResult.errorDetails?.responseIsFiltered ? "filtered" : rawResult.errorDetails && gotProgress ? "errorWithOutput" : rawResult.errorDetails ? "error" : "success";
          const commandForTelemetry = agentSlashCommandPart ? agentSlashCommandPart.command.name : commandPart?.slashCommand.command;
          this.telemetryService.publicLog2("interactiveSessionProviderInvoked", {
            timeToFirstProgress: rawResult.timings?.firstProgress,
            totalTime: rawResult.timings?.totalElapsed,
            result,
            requestType,
            agent: detectedAgent?.id ?? agentPart?.agent.id ?? "",
            agentExtensionId: detectedAgent?.extensionId.value ?? agentPart?.agent.extensionId.value ?? "",
            slashCommand: commandForTelemetry,
            chatSessionId: model.sessionId,
            enableCommandDetection,
            isParticipantDetected: !!detectedAgent,
            location,
            citations: request.response?.codeCitations.length ?? 0,
            numCodeBlocks: getCodeBlocks(request.response?.response.toString() ?? "").length,
            attachmentKinds: this.attachmentKindsForTelemetry(request.variableData)
          });
          model.setResponse(request, rawResult);
          completeResponseCreated();
          this.trace("sendRequest", `Provider returned response for session ${model.sessionId}`);
          model.completeResponse(request);
          if (agentOrCommandFollowups) {
            agentOrCommandFollowups.then((followups) => {
              model.setFollowups(request, followups);
              this._chatServiceTelemetry.retrievedFollowups(agentPart?.agent.id ?? "", commandForTelemetry, followups?.length ?? 0);
            });
          }
          chatTitlePromise?.then((title) => {
            if (title) {
              model.setCustomTitle(title);
            }
          });
        }
      } catch (err) {
        const result = "error";
        this.telemetryService.publicLog2("interactiveSessionProviderInvoked", {
          timeToFirstProgress: void 0,
          totalTime: void 0,
          result,
          requestType,
          agent: detectedAgent?.id ?? agentPart?.agent.id ?? "",
          agentExtensionId: detectedAgent?.extensionId.value ?? agentPart?.agent.extensionId.value ?? "",
          slashCommand: agentSlashCommandPart ? agentSlashCommandPart.command.name : commandPart?.slashCommand.command,
          chatSessionId: model.sessionId,
          location,
          citations: 0,
          numCodeBlocks: 0,
          enableCommandDetection,
          isParticipantDetected: !!detectedAgent,
          attachmentKinds: this.attachmentKindsForTelemetry(request.variableData)
        });
        this.logService.error(`Error while handling chat request: ${toErrorMessage(err, true)}`);
        if (request) {
          const rawResult = { errorDetails: { message: err.message } };
          model.setResponse(request, rawResult);
          completeResponseCreated();
          model.completeResponse(request);
        }
      } finally {
        listener.dispose();
      }
    }, "sendRequestInternal");
    const rawResponsePromise = sendRequestInternal();
    this._pendingRequests.set(model.sessionId, this.instantiationService.createInstance(CancellableRequest, source, void 0));
    rawResponsePromise.finally(() => {
      this._pendingRequests.deleteAndDispose(model.sessionId);
    });
    this._onDidSubmitRequest.fire({ chatSessionId: model.sessionId });
    return {
      responseCreatedPromise: responseCreated.p,
      responseCompletePromise: rawResponsePromise
    };
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
  async checkAgentAllowed(agent) {
    if (agent.modes.includes(ChatMode.Agent)) {
      const enabled = await this.experimentService.getTreatment("chatAgentEnabled");
      if (enabled === false) {
        throw new Error("Agent is currently disabled");
      }
    }
  }
  attachmentKindsForTelemetry(variableData) {
    return variableData.variables.map((v) => {
      if (v.kind === "implicit") {
        return "implicit";
      } else if (v.range) {
        if (v.kind === "tool") {
          return "toolInPrompt";
        } else {
          return "fileInPrompt";
        }
      } else if (v.kind === "command") {
        return "command";
      } else if (v.kind === "symbol") {
        return "symbol";
      } else if (isImageVariableEntry(v)) {
        return "image";
      } else if (v.kind === "directory") {
        return "directory";
      } else if (v.kind === "tool") {
        return "tool";
      } else {
        if (URI.isUri(v.value)) {
          return "file";
        } else if (isLocation(v.value)) {
          return "location";
        } else {
          return "otherAttachment";
        }
      }
    });
  }
  getHistoryEntriesFromModel(requests, sessionId, location, forAgentId) {
    const history = [];
    const agent = this.chatAgentService.getAgent(forAgentId);
    for (const request of requests) {
      if (!request.response) {
        continue;
      }
      if (forAgentId !== request.response.agent?.id && !agent?.isDefault) {
        continue;
      }
      const promptTextResult = getPromptText(request.message);
      const historyRequest = {
        sessionId,
        requestId: request.id,
        agentId: request.response.agent?.id ?? "",
        message: promptTextResult.message,
        command: request.response.slashCommand?.name,
        variables: updateRanges(request.variableData, promptTextResult.diff),
        // TODO bit of a hack
        location: ChatAgentLocation.Panel,
        editedFileEvents: request.editedFileEvents
      };
      history.push({ request: historyRequest, response: toChatHistoryContent(request.response.response.value), result: request.response.result ?? {} });
    }
    return history;
  }
  async removeRequest(sessionId, requestId) {
    const model = this._sessionModels.get(sessionId);
    if (!model) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    await model.waitForInitialization();
    const pendingRequest = this._pendingRequests.get(sessionId);
    if (pendingRequest?.requestId === requestId) {
      pendingRequest.cancel();
      this._pendingRequests.deleteAndDispose(sessionId);
    }
    model.removeRequest(requestId);
  }
  async adoptRequest(sessionId, request) {
    if (!(request instanceof ChatRequestModel)) {
      throw new TypeError("Can only adopt requests of type ChatRequestModel");
    }
    const target = this._sessionModels.get(sessionId);
    if (!target) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    await target.waitForInitialization();
    const oldOwner = request.session;
    target.adoptRequest(request);
    if (request.response && !request.response.isComplete) {
      const cts = this._pendingRequests.deleteAndLeak(oldOwner.sessionId);
      if (cts) {
        cts.requestId = request.id;
        this._pendingRequests.set(target.sessionId, cts);
      }
    }
  }
  async addCompleteRequest(sessionId, message, variableData, attempt, response) {
    this.trace("addCompleteRequest", `message: ${message}`);
    const model = this._sessionModels.get(sessionId);
    if (!model) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    await model.waitForInitialization();
    const parsedRequest = typeof message === "string" ? this.instantiationService.createInstance(ChatRequestParser).parseChatRequest(sessionId, message) : message;
    const request = model.addRequest(parsedRequest, variableData || { variables: [] }, attempt ?? 0, void 0, void 0, void 0, void 0, void 0, true);
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
    model.completeResponse(request);
  }
  cancelCurrentRequestForSession(sessionId) {
    this.trace("cancelCurrentRequestForSession", `sessionId: ${sessionId}`);
    this._pendingRequests.get(sessionId)?.cancel();
    this._pendingRequests.deleteAndDispose(sessionId);
  }
  async clearSession(sessionId) {
    this.trace("clearSession", `sessionId: ${sessionId}`);
    const model = this._sessionModels.get(sessionId);
    if (!model) {
      throw new Error(`Unknown session: ${sessionId}`);
    }
    if (model.initialLocation === ChatAgentLocation.Panel) {
      if (this.useFileStorage) {
        if (model.getRequests().length === 0) {
          await this._chatSessionStore.deleteSession(sessionId);
        } else {
          await this._chatSessionStore.storeSessions([model]);
        }
      } else {
        if (model.getRequests().length === 0) {
          delete this._persistedSessions[sessionId];
        } else {
          const sessionData = JSON.parse(JSON.stringify(model));
          sessionData.isNew = true;
          this._persistedSessions[sessionId] = sessionData;
        }
      }
    }
    this._sessionModels.deleteAndDispose(sessionId);
    this._pendingRequests.get(sessionId)?.cancel();
    this._pendingRequests.deleteAndDispose(sessionId);
    this._onDidDisposeSession.fire({ sessionId, reason: "cleared" });
  }
  hasSessions() {
    if (this.useFileStorage) {
      return this._chatSessionStore.hasSessions();
    } else {
      return Object.values(this._persistedSessions).length > 0;
    }
  }
  transferChatSession(transferredSessionData, toWorkspace) {
    const model = Iterable.find(this._sessionModels.values(), (model2) => model2.sessionId === transferredSessionData.sessionId);
    if (!model) {
      throw new Error(`Failed to transfer session. Unknown session ID: ${transferredSessionData.sessionId}`);
    }
    const existingRaw = this.storageService.getObject(globalChatKey, 0, []);
    existingRaw.push({
      chat: model.toJSON(),
      timestampInMilliseconds: Date.now(),
      toWorkspace,
      inputValue: transferredSessionData.inputValue,
      location: transferredSessionData.location,
      mode: transferredSessionData.mode
    });
    this.storageService.store(
      globalChatKey,
      JSON.stringify(existingRaw),
      0,
      1
      /* StorageTarget.MACHINE */
    );
    this.chatTransferService.addWorkspaceToTransferred(toWorkspace);
    this.trace("transferChatSession", `Transferred session ${model.sessionId} to workspace ${toWorkspace.toString()}`);
  }
  getChatStorageFolder() {
    return this._chatSessionStore.getChatStorageFolder();
  }
  logChatIndex() {
    this._chatSessionStore.logIndex();
  }
};
__decorate([
  memoize
], ChatService.prototype, "useFileStorage", null);
ChatService = __decorate([
  __param(0, IStorageService),
  __param(1, ILogService),
  __param(2, IExtensionService),
  __param(3, IInstantiationService),
  __param(4, ITelemetryService),
  __param(5, IWorkspaceContextService),
  __param(6, IChatSlashCommandService),
  __param(7, IChatAgentService),
  __param(8, IConfigurationService),
  __param(9, IWorkbenchAssignmentService),
  __param(10, IChatTransferService)
], ChatService);
function getCodeBlocks(text) {
  const lines = text.split("\n");
  const codeBlockLanguages = [];
  let codeBlockState;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (codeBlockState) {
      if (new RegExp(`^\\s*${codeBlockState.delimiter}\\s*$`).test(line)) {
        codeBlockLanguages.push(codeBlockState.languageId);
        codeBlockState = void 0;
      }
    } else {
      const match = line.match(/^(\s*)(`{3,}|~{3,})(\w*)/);
      if (match) {
        codeBlockState = { delimiter: match[2], languageId: match[3] };
      }
    }
  }
  return codeBlockLanguages;
}
__name(getCodeBlocks, "getCodeBlocks");
export {
  ChatService
};
//# sourceMappingURL=chatServiceImpl.js.map
