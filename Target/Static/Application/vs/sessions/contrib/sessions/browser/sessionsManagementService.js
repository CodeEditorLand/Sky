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
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { observableValue } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { openSession as openSessionDefault } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsOpener.js";
import { ChatViewPaneTarget, IChatWidgetService } from "../../../../workbench/contrib/chat/browser/chat.js";
import { IChatSessionsService } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { IChatService } from "../../../../workbench/contrib/chat/common/chatService/chatService.js";
import { ChatAgentLocation, ChatModeKind } from "../../../../workbench/contrib/chat/common/constants.js";
import { isAgentSession } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsModel.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { LocalNewSession, RemoteNewSession } from "../../chat/browser/newSession.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { ILanguageModelsService } from "../../../../workbench/contrib/chat/common/languageModels.js";
const IsNewChatSessionContext = new RawContextKey("isNewChatSession", true);
const LAST_SELECTED_SESSION_KEY = "agentSessions.lastSelectedSession";
const repositoryOptionId = "repository";
const ISessionsManagementService = createDecorator("sessionsManagementService");
let SessionsManagementService = class SessionsManagementService2 extends Disposable {
  static {
    __name(this, "SessionsManagementService");
  }
  constructor(storageService, uriIdentityService, agentSessionsService, chatSessionsService, chatWidgetService, chatService, instantiationService, logService, contextKeyService, commandService, languageModelsService) {
    super();
    this.storageService = storageService;
    this.uriIdentityService = uriIdentityService;
    this.agentSessionsService = agentSessionsService;
    this.chatSessionsService = chatSessionsService;
    this.chatWidgetService = chatWidgetService;
    this.chatService = chatService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.commandService = commandService;
    this.languageModelsService = languageModelsService;
    this._activeSession = observableValue(this, void 0);
    this.activeSession = this._activeSession;
    this._newActiveSessionDisposables = this._register(new DisposableStore());
    this._newSession = this._register(new MutableDisposable());
    this.isNewChatSessionContext = IsNewChatSessionContext.bindTo(contextKeyService);
    this.lastSelectedSession = this.loadLastSelectedSession();
    this._register(this.storageService.onWillSaveState(() => this.saveLastSelectedSession()));
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => this.refreshActiveSessionFromModel()));
    this._register(this.agentSessionsService.model.onDidChangeSessionArchivedState((e) => {
      if (e.isArchived()) {
        const currentActive = this._activeSession.get();
        if (currentActive && currentActive.resource.toString() === e.resource.toString()) {
          this.openNewSessionView();
        }
      }
    }));
  }
  refreshActiveSessionFromModel() {
    const currentActive = this._activeSession.get();
    if (!currentActive) {
      return;
    }
    const agentSession = this.agentSessionsService.model.getSession(currentActive.resource);
    if (!agentSession) {
      if (currentActive.isUntitled) {
        const chatViewWidgets = this.chatWidgetService.getWidgetsByLocations(ChatAgentLocation.Chat);
        const committedResource = chatViewWidgets[0]?.viewModel?.sessionResource;
        const committedSession = committedResource ? this.agentSessionsService.model.getSession(committedResource) : void 0;
        if (committedSession) {
          this.setActiveSession(committedSession);
        }
      } else {
        this.showNextSession();
      }
      return;
    }
    this.setActiveSession(agentSession);
  }
  showNextSession() {
    const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived()).sort((a, b) => (b.timing.lastRequestEnded ?? b.timing.created) - (a.timing.lastRequestEnded ?? a.timing.created));
    if (sessions.length > 0) {
      this.setActiveSession(sessions[0]);
      this.instantiationService.invokeFunction(openSessionDefault, sessions[0]);
    } else {
      this.openNewSessionView();
    }
  }
  getRepositoryFromMetadata(metadata) {
    if (!metadata) {
      return [void 0, void 0];
    }
    const repositoryPath = metadata?.repositoryPath;
    const repositoryPathUri = typeof repositoryPath === "string" ? URI.file(repositoryPath) : void 0;
    const worktreePath = metadata?.worktreePath;
    const worktreePathUri = typeof worktreePath === "string" ? URI.file(worktreePath) : void 0;
    return [
      URI.isUri(repositoryPathUri) ? repositoryPathUri : void 0,
      URI.isUri(worktreePathUri) ? worktreePathUri : void 0
    ];
  }
  getRepositoryFromSessionOption(sessionResource) {
    const optionValue = this.chatSessionsService.getSessionOption(sessionResource, repositoryOptionId);
    if (!optionValue) {
      return void 0;
    }
    const optionId = typeof optionValue === "string" ? optionValue : optionValue.id;
    if (!optionId) {
      return void 0;
    }
    try {
      return URI.parse(optionId);
    } catch {
      return void 0;
    }
  }
  getActiveSession() {
    return this._activeSession.get();
  }
  async openSession(sessionResource, openOptions) {
    this.isNewChatSessionContext.set(false);
    const existingSession = this.agentSessionsService.model.getSession(sessionResource);
    if (existingSession) {
      await this.openExistingSession(existingSession, openOptions);
    } else if (this._newSession.value && this.uriIdentityService.extUri.isEqual(sessionResource, this._newSession.value.resource)) {
      await this.openNewSession(this._newSession.value);
    }
  }
  async createNewSessionForTarget(target, sessionResource, defaultRepoUri) {
    if (!this.isNewChatSessionContext.get()) {
      this.isNewChatSessionContext.set(true);
    }
    let newSession;
    if (target === AgentSessionProviders.Background || target === AgentSessionProviders.Local) {
      newSession = this.instantiationService.createInstance(LocalNewSession, sessionResource, defaultRepoUri);
    } else {
      newSession = this.instantiationService.createInstance(RemoteNewSession, sessionResource, target);
    }
    this._newSession.value = newSession;
    this.setActiveSession(newSession);
    return newSession;
  }
  /**
   * Open an existing agent session - set it as active and reveal it.
   */
  async openExistingSession(session, openOptions) {
    this.setActiveSession(session);
    await this.instantiationService.invokeFunction(openSessionDefault, session, openOptions);
  }
  /**
   * Open a new remote session - load the model first, then show it in the ChatViewPane.
   */
  async openNewSession(newSession) {
    this.setActiveSession(newSession);
    const sessionResource = newSession.resource;
    const chatWidget = await this.chatWidgetService.openSession(sessionResource, ChatViewPaneTarget);
    if (!chatWidget?.viewModel) {
      this.logService.warn(`[ActiveSessionService] Failed to open session: ${sessionResource.toString()}`);
      return;
    }
    const repository = this.getRepositoryFromSessionOption(sessionResource);
    this.logService.info(`[ActiveSessionService] Active session changed (new): ${sessionResource.toString()}, repository: ${repository?.toString() ?? "none"}`);
  }
  async sendRequestForNewSession(sessionResource, options) {
    const session = this._newSession.value;
    if (!session) {
      this.logService.error(`[SessionsManagementService] No new session found for resource: ${sessionResource.toString()}`);
      return;
    }
    if (!this.uriIdentityService.extUri.isEqual(sessionResource, session.resource)) {
      this.logService.error(`[SessionsManagementService] Session resource mismatch. Expected: ${session.resource.toString()}, received: ${sessionResource.toString()}`);
      return;
    }
    const query = session.query;
    if (!query) {
      this.logService.error("[SessionsManagementService] No query set on session");
      return;
    }
    const contribution = this.chatSessionsService.getChatSessionContribution(session.target);
    const sendOptions = {
      location: ChatAgentLocation.Chat,
      userSelectedModelId: session.modelId,
      modeInfo: {
        kind: ChatModeKind.Agent,
        isBuiltin: true,
        modeInstructions: void 0,
        modeId: "agent",
        applyCodeBlockSuggestionId: void 0
      },
      agentIdSilent: contribution?.type,
      attachedContext: session.attachedContext
    };
    await this.chatSessionsService.getOrCreateChatSession(session.resource, CancellationToken.None);
    await this.doSendRequestForNewSession(session, query, sendOptions, session.selectedOptions, options?.openNewSessionView);
    this._newSession.value = void 0;
  }
  async doSendRequestForNewSession(session, query, sendOptions, selectedOptions, openNewSessionView) {
    await this.openSession(session.resource);
    if (openNewSessionView) {
      this.openNewSessionView();
    }
    const modelRef = this.chatService.acquireExistingSession(session.resource);
    if (modelRef) {
      const model = modelRef.object;
      if (session.modelId) {
        const languageModel = this.languageModelsService.lookupLanguageModel(session.modelId);
        if (languageModel) {
          model.inputModel.setState({
            selectedModel: { identifier: session.modelId, metadata: languageModel }
          });
        }
      }
      if (selectedOptions && selectedOptions.size > 0) {
        const contributedSession = model.contributedChatSession;
        if (contributedSession) {
          const initialSessionOptions = [...selectedOptions.entries()].map(([optionId, value]) => ({ optionId, value }));
          model.setContributedChatSession({
            ...contributedSession,
            initialSessionOptions
          });
        }
      }
      modelRef.dispose();
    }
    const existingResources = new Set(this.agentSessionsService.model.sessions.map((s) => s.resource.toString()));
    const result = await this.chatService.sendRequest(session.resource, query, sendOptions);
    if (result.kind === "rejected") {
      this.logService.error(`[ActiveSessionService] sendRequest rejected: ${result.reason}`);
      return;
    }
    let newSession = this.agentSessionsService.model.sessions.find((s) => !existingResources.has(s.resource.toString()));
    if (!newSession) {
      let listener;
      newSession = await Promise.race([
        new Promise((resolve) => {
          listener = this.agentSessionsService.model.onDidChangeSessions(() => {
            const session2 = this.agentSessionsService.model.sessions.find((s) => !existingResources.has(s.resource.toString()));
            if (session2) {
              resolve(session2);
            }
          });
        }),
        new Promise((resolve) => setTimeout(() => resolve(void 0), 3e4))
      ]);
      listener?.dispose();
    }
    if (newSession && !openNewSessionView) {
      this.setActiveSession(newSession);
    }
  }
  openNewSessionView() {
    if (this.isNewChatSessionContext.get()) {
      return;
    }
    this.isNewChatSessionContext.set(true);
    this.setActiveSession(void 0);
  }
  setActiveSession(session) {
    let activeSessionItem;
    if (session) {
      if (isAgentSession(session)) {
        this.lastSelectedSession = session.resource;
        const [repository, worktree] = this.getRepositoryFromMetadata(session.metadata);
        activeSessionItem = {
          isUntitled: this.chatService.getSession(session.resource)?.contributedChatSession?.isUntitled ?? true,
          label: session.label,
          resource: session.resource,
          repository,
          worktree,
          providerType: session.providerType
        };
      } else {
        activeSessionItem = {
          isUntitled: true,
          label: void 0,
          resource: session.resource,
          repository: session.repoUri,
          worktree: void 0,
          providerType: session.target
        };
        this._newActiveSessionDisposables.clear();
        this._newActiveSessionDisposables.add(session.onDidChange((e) => {
          if (e === "repoUri") {
            this.doSetActiveSession({
              isUntitled: true,
              label: void 0,
              resource: session.resource,
              repository: session.repoUri,
              worktree: void 0,
              providerType: session.target
            });
          }
        }));
      }
    }
    this.doSetActiveSession(activeSessionItem);
  }
  doSetActiveSession(activeSessionItem) {
    if (this.equalsSessionItem(this._activeSession.get(), activeSessionItem)) {
      return;
    }
    if (activeSessionItem) {
      this.logService.info(`[ActiveSessionService] Active session changed: ${activeSessionItem.resource.toString()}`);
      this.logService.trace(`[ActiveSessionService] Active session details: ${JSON.stringify(activeSessionItem)}`);
    } else {
      this.logService.trace("[ActiveSessionService] Active session cleared");
    }
    this._activeSession.set(activeSessionItem, void 0);
  }
  equalsSessionItem(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.label === b.label && a.resource.toString() === b.resource.toString() && a.repository?.toString() === b.repository?.toString() && a.worktree?.toString() === b.worktree?.toString();
  }
  async commitWorktreeFiles(session, fileUris) {
    const worktreeUri = session.worktree;
    if (!worktreeUri) {
      throw new Error("Cannot commit worktree files: active session has no associated worktree");
    }
    for (const fileUri of fileUris) {
      await this.commandService.executeCommand("github.copilot.cli.sessions.commitToWorktree", { worktreeUri, fileUri });
    }
    await this.agentSessionsService.model.resolve(AgentSessionProviders.Background);
  }
  loadLastSelectedSession() {
    const cached = this.storageService.get(
      LAST_SELECTED_SESSION_KEY,
      1
      /* StorageScope.WORKSPACE */
    );
    if (!cached) {
      return void 0;
    }
    try {
      return URI.parse(cached);
    } catch {
      return void 0;
    }
  }
  saveLastSelectedSession() {
    if (this.lastSelectedSession) {
      this.storageService.store(
        LAST_SELECTED_SESSION_KEY,
        this.lastSelectedSession.toString(),
        1,
        1
        /* StorageTarget.MACHINE */
      );
    }
  }
};
SessionsManagementService = __decorate([
  __param(0, IStorageService),
  __param(1, IUriIdentityService),
  __param(2, IAgentSessionsService),
  __param(3, IChatSessionsService),
  __param(4, IChatWidgetService),
  __param(5, IChatService),
  __param(6, IInstantiationService),
  __param(7, ILogService),
  __param(8, IContextKeyService),
  __param(9, ICommandService),
  __param(10, ILanguageModelsService)
], SessionsManagementService);
export {
  ISessionsManagementService,
  IsNewChatSessionContext,
  SessionsManagementService
};
//# sourceMappingURL=sessionsManagementService.js.map
