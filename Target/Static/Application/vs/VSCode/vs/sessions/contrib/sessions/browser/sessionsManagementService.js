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
import { localize } from "../../../../nls.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { openSession as openSessionDefault } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsOpener.js";
import { ChatViewPaneTarget, IChatWidgetService } from "../../../../workbench/contrib/chat/browser/chat.js";
import { IChatSessionsService } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { IChatService } from "../../../../workbench/contrib/chat/common/chatService/chatService.js";
import { ChatAgentLocation, ChatModeKind, ChatPermissionLevel } from "../../../../workbench/contrib/chat/common/constants.js";
import { isAgentSession } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsModel.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { LocalNewSession, RemoteNewSession } from "../../chat/browser/newSession.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { isBuiltinChatMode } from "../../../../workbench/contrib/chat/common/chatModes.js";
import { ILanguageModelsService } from "../../../../workbench/contrib/chat/common/languageModels.js";
import { ILanguageModelToolsService } from "../../../../workbench/contrib/chat/common/tools/languageModelToolsService.js";
import { GITHUB_REMOTE_FILE_SCHEME } from "../../fileTreeView/browser/githubFileSystemProvider.js";
import { ResourceSet } from "../../../../base/common/map.js";
const IsNewChatSessionContext = new RawContextKey("isNewChatSession", true);
const IsActiveSessionBackgroundProviderContext = new RawContextKey("isActiveSessionBackgroundProvider", false, localize("isActiveSessionBackgroundProvider", "Whether the active session uses the background agent provider"));
const LAST_SELECTED_SESSION_KEY = "agentSessions.lastSelectedSession";
const ISessionsManagementService = createDecorator("sessionsManagementService");
let SessionsManagementService = class SessionsManagementService2 extends Disposable {
  static {
    __name(this, "SessionsManagementService");
  }
  constructor(storageService, uriIdentityService, agentSessionsService, chatSessionsService, chatWidgetService, chatService, instantiationService, logService, contextKeyService, commandService, languageModelsService, toolsService) {
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
    this.toolsService = toolsService;
    this._activeSession = observableValue(this, void 0);
    this.activeSession = this._activeSession;
    this._newActiveSessionDisposables = this._register(new DisposableStore());
    this._newSession = this._register(new MutableDisposable());
    this.isNewChatSessionContext = IsNewChatSessionContext.bindTo(contextKeyService);
    this._isBackgroundProvider = IsActiveSessionBackgroundProviderContext.bindTo(contextKeyService);
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
    if (currentActive.isUntitled) {
      return;
    }
    const agentSession = this.agentSessionsService.model.getSession(currentActive.resource);
    if (agentSession) {
      this.setActiveSession(agentSession);
    } else {
      this.showNextSession();
    }
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
  getRepositoryFromMetadata(session) {
    const metadata = session.metadata;
    if (!metadata) {
      return [void 0, void 0, void 0];
    }
    if (session.providerType === AgentSessionProviders.Cloud) {
      const branch = typeof metadata.branch === "string" ? metadata.branch : "HEAD";
      const repositoryUri = URI.from({
        scheme: GITHUB_REMOTE_FILE_SCHEME,
        authority: "github",
        path: `/${metadata.owner}/${metadata.name}/${encodeURIComponent(branch)}`
      });
      return [repositoryUri, void 0, void 0];
    }
    const workingDirectoryPath = metadata?.workingDirectoryPath;
    if (workingDirectoryPath) {
      return [URI.file(workingDirectoryPath), void 0, void 0];
    }
    const repositoryPath = metadata?.repositoryPath;
    const repositoryPathUri = typeof repositoryPath === "string" ? URI.file(repositoryPath) : void 0;
    const worktreePath = metadata?.worktreePath;
    const worktreePathUri = typeof worktreePath === "string" ? URI.file(worktreePath) : void 0;
    const worktreeBranchName = metadata?.branchName;
    return [
      URI.isUri(repositoryPathUri) ? repositoryPathUri : void 0,
      URI.isUri(worktreePathUri) ? worktreePathUri : void 0,
      worktreeBranchName
    ];
  }
  getActiveSession() {
    return this._activeSession.get();
  }
  async openSession(sessionResource, openOptions) {
    const existingSession = this.agentSessionsService.model.getSession(sessionResource);
    if (!existingSession) {
      throw new Error(`Session with resource ${sessionResource.toString()} not found`);
    }
    this.isNewChatSessionContext.set(false);
    this.setActiveSession(existingSession);
    await this.instantiationService.invokeFunction(openSessionDefault, existingSession, openOptions);
  }
  async createNewSessionForTarget(target, sessionResource, defaultRepoUri) {
    if (!this.isNewChatSessionContext.get()) {
      this.isNewChatSessionContext.set(true);
    }
    let newSession;
    if (target === AgentSessionProviders.Background) {
      newSession = this.instantiationService.createInstance(LocalNewSession, sessionResource, defaultRepoUri);
    } else {
      newSession = this.instantiationService.createInstance(RemoteNewSession, sessionResource, target);
    }
    this._newSession.value = newSession;
    this.setActiveSession(newSession);
    return newSession;
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
    const modeKind = session.mode?.kind ?? ChatModeKind.Agent;
    const modeIsBuiltin = session.mode ? isBuiltinChatMode(session.mode) : true;
    const modeId = modeIsBuiltin ? modeKind : "custom";
    const rawModeInstructions = session.mode?.modeInstructions?.get();
    const modeInstructions = rawModeInstructions ? {
      name: session.mode.name.get(),
      content: rawModeInstructions.content,
      toolReferences: this.toolsService.toToolReferences(rawModeInstructions.toolReferences),
      metadata: rawModeInstructions.metadata
    } : void 0;
    const sendOptions = {
      location: ChatAgentLocation.Chat,
      userSelectedModelId: session.modelId,
      modeInfo: {
        kind: modeKind,
        isBuiltin: modeIsBuiltin,
        modeInstructions,
        modeId,
        applyCodeBlockSuggestionId: void 0,
        permissionLevel: options?.permissionLevel ?? ChatPermissionLevel.Default
      },
      agentIdSilent: contribution?.type,
      attachedContext: session.attachedContext
    };
    await this.chatSessionsService.getOrCreateChatSession(session.resource, CancellationToken.None);
    await this.doSendRequestForNewSession(session, query, sendOptions, session.selectedOptions);
    this._newSession.value = void 0;
  }
  async doSendRequestForNewSession(session, query, sendOptions, selectedOptions) {
    const chatWidget = await this.openNewSession(session);
    const permissionLevel = sendOptions.modeInfo?.permissionLevel;
    if (permissionLevel) {
      chatWidget.input.setPermissionLevel(permissionLevel);
    }
    await this.loadNewSession(session, selectedOptions);
    const existingResources = new ResourceSet(this.agentSessionsService.model.sessions.map((s) => s.resource));
    const result = await this.chatService.sendRequest(session.resource, query, sendOptions);
    if (result.kind === "rejected") {
      this.logService.error(`[ActiveSessionService] sendRequest rejected: ${result.reason}`);
      return;
    }
    const probableNewSession = await this.loadProbableNewAgentSession(session, existingResources);
    this.setActiveSession(probableNewSession);
    const newSession = await this.loadNewAgentSession(chatWidget, session);
    this.setActiveSession(newSession);
  }
  async openNewSession(session) {
    this.isNewChatSessionContext.set(false);
    const sessionResource = session.resource;
    const chatWidget = await this.chatWidgetService.openSession(sessionResource, ChatViewPaneTarget);
    if (!chatWidget) {
      throw new Error(`Failed to open chat session for resource ${sessionResource.toString()}`);
    }
    return chatWidget;
  }
  async loadNewSession(session, selectedOptions) {
    const modelRef = await this.chatService.acquireOrLoadSession(session.resource, ChatAgentLocation.Chat, CancellationToken.None);
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
      if (session.mode) {
        model.inputModel.setState({
          mode: { id: session.mode.id, kind: session.mode.kind }
        });
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
  }
  async loadProbableNewAgentSession(session, existingSessions) {
    const probableNewSession = this.agentSessionsService.model.sessions.find((s) => s.providerType === session.target && !existingSessions.has(s.resource));
    if (probableNewSession) {
      return probableNewSession;
    }
    let listener;
    try {
      return await new Promise((resolve) => {
        listener = this.agentSessionsService.model.onDidChangeSessions(() => {
          const s = this.agentSessionsService.model.sessions.find((s2) => s2.providerType === session.target && !existingSessions.has(s2.resource));
          if (s) {
            listener?.dispose();
            resolve(s);
          }
        });
      });
    } finally {
      listener?.dispose();
    }
  }
  async loadNewAgentSession(chatWidget, session) {
    const newSession = this.agentSessionsService.model.sessions.find((s) => s.providerType === session.target && this.uriIdentityService.extUri.isEqual(s.resource, chatWidget.viewModel?.sessionResource));
    if (newSession) {
      return newSession;
    }
    let listener;
    try {
      return await new Promise((resolve) => {
        listener = chatWidget.onDidChangeViewModel(() => {
          const s = this.agentSessionsService.model.sessions.find((s2) => s2.providerType === session.target && this.uriIdentityService.extUri.isEqual(s2.resource, chatWidget.viewModel?.sessionResource));
          if (s) {
            listener?.dispose();
            resolve(s);
          }
        });
      });
    } finally {
      listener?.dispose();
    }
  }
  openNewSessionView() {
    if (this.isNewChatSessionContext.get()) {
      return;
    }
    this.setActiveSession(void 0);
    this.isNewChatSessionContext.set(true);
  }
  setActiveSession(session) {
    let activeSessionItem;
    if (session) {
      if (isAgentSession(session)) {
        this.lastSelectedSession = session.resource;
        const [repository, worktree, worktreeBranchName] = this.getRepositoryFromMetadata(session);
        activeSessionItem = {
          isUntitled: false,
          label: session.label,
          resource: session.resource,
          repository,
          worktree,
          worktreeBranchName,
          providerType: session.providerType
        };
      } else {
        activeSessionItem = {
          isUntitled: true,
          label: void 0,
          resource: session.resource,
          repository: session.repoUri,
          worktree: void 0,
          worktreeBranchName: void 0,
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
              worktreeBranchName: void 0,
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
    this._isBackgroundProvider.set(activeSessionItem?.providerType === AgentSessionProviders.Background);
    this._activeSession.set(activeSessionItem, void 0);
  }
  equalsSessionItem(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.label === b.label && a.resource.toString() === b.resource.toString() && a.repository?.toString() === b.repository?.toString() && a.worktree?.toString() === b.worktree?.toString() && a.worktreeBranchName === b.worktreeBranchName && a.providerType === b.providerType;
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
  getGitHubContext(session) {
    const repoUri = session.repository;
    if (repoUri && repoUri.scheme === GITHUB_REMOTE_FILE_SCHEME) {
      const parts = repoUri.path.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const owner = decodeURIComponent(parts[0]);
        const repo = decodeURIComponent(parts[1]);
        const prNumber = this._parsePRNumberFromSession(session);
        return { owner, repo, prNumber };
      }
    }
    const agentSession = this.agentSessionsService.model.getSession(session.resource);
    if (agentSession?.metadata) {
      const metadata = agentSession.metadata;
      if (typeof metadata.owner === "string" && typeof metadata.name === "string") {
        const prNumber = this._parsePRNumberFromSession(session);
        return { owner: metadata.owner, repo: metadata.name, prNumber };
      }
      if (typeof metadata.repositoryNwo === "string") {
        const parts = metadata.repositoryNwo.split("/");
        if (parts.length === 2) {
          const prNumber = this._parsePRNumberFromSession(session);
          return { owner: parts[0], repo: parts[1], prNumber };
        }
      }
      if (typeof metadata.pullRequestUrl === "string") {
        const match = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/.exec(metadata.pullRequestUrl);
        if (match) {
          return { owner: match[1], repo: match[2], prNumber: parseInt(match[3], 10) };
        }
      }
    }
    return void 0;
  }
  getGitHubContextForSession(sessionResource) {
    const agentSession = this.agentSessionsService.model.getSession(sessionResource);
    if (!agentSession) {
      return void 0;
    }
    const [repository, worktree] = this.getRepositoryFromMetadata(agentSession);
    return this.getGitHubContext({
      resource: sessionResource,
      isUntitled: false,
      label: agentSession.label,
      repository,
      worktree,
      worktreeBranchName: void 0,
      providerType: agentSession.providerType
    });
  }
  resolveSessionFileUri(sessionResource, relativePath) {
    const agentSession = this.agentSessionsService.model.getSession(sessionResource);
    if (!agentSession) {
      return void 0;
    }
    const [repository, worktree] = this.getRepositoryFromMetadata(agentSession);
    const baseUri = worktree ?? repository;
    if (!baseUri) {
      return void 0;
    }
    return URI.joinPath(baseUri, relativePath);
  }
  _parsePRNumberFromSession(session) {
    const agentSession = this.agentSessionsService.model.getSession(session.resource);
    const metadata = agentSession?.metadata;
    if (!metadata) {
      return void 0;
    }
    if (typeof metadata.pullRequestNumber === "number") {
      return metadata.pullRequestNumber;
    }
    if (typeof metadata.pullRequestUrl === "string") {
      const match = /\/pull\/(\d+)/.exec(metadata.pullRequestUrl);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return void 0;
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
  __param(10, ILanguageModelsService),
  __param(11, ILanguageModelToolsService)
], SessionsManagementService);
export {
  ISessionsManagementService,
  IsActiveSessionBackgroundProviderContext,
  IsNewChatSessionContext,
  SessionsManagementService
};
//# sourceMappingURL=sessionsManagementService.js.map
