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
var AgentSessionsWelcomePage_1;
import "./media/agentSessionsWelcome.css";
import { $, addDisposableListener, append, clearNode, getWindow, scheduleAtNextAnimationFrame } from "../../../../base/browser/dom.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Toggle } from "../../../../base/browser/ui/toggle/toggle.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../base/common/event.js";
import { basename } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { editorBackground } from "../../../../platform/theme/common/colorRegistry.js";
import { getListStyles, getToggleStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { SIDE_BAR_FOREGROUND } from "../../../common/theme.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind } from "../../chat/common/constants.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { ChatWidget } from "../../chat/browser/widget/chatWidget.js";
import { IAgentSessionsService } from "../../chat/browser/agentSessions/agentSessionsService.js";
import { AgentSessionProviders } from "../../chat/browser/agentSessions/agentSessions.js";
import { AgentSessionsWelcomeInput } from "./agentSessionsWelcomeInput.js";
import { IChatService } from "../../chat/common/chatService/chatService.js";
import { ChatViewId, IChatWidgetService } from "../../chat/browser/chat.js";
import { ChatSessionPosition, getResourceForNewChatSession } from "../../chat/browser/chatSessions/chatSessions.contribution.js";
import { IChatEntitlementService } from "../../../services/chat/common/chatEntitlementService.js";
import { AgentSessionsControl } from "../../chat/browser/agentSessions/agentSessionsControl.js";
import { AgentSessionsFilter } from "../../chat/browser/agentSessions/agentSessionsFilter.js";
import { AgentSessionsListDelegate } from "../../chat/browser/agentSessions/agentSessionsViewer.js";
import { IWalkthroughsService } from "../../welcomeGettingStarted/browser/gettingStartedService.js";
import { GettingStartedInput } from "../../welcomeGettingStarted/browser/gettingStartedInput.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkspacesService, isRecentFolder, isRecentWorkspace } from "../../../../platform/workspaces/common/workspaces.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { ILogService } from "../../../../platform/log/common/log.js";
const configurationKey = "workbench.startupEditor";
const MAX_SESSIONS = 6;
const MAX_REPO_PICKS = 10;
const MAX_WALKTHROUGHS = 10;
let AgentSessionsWelcomePage = class AgentSessionsWelcomePage2 extends EditorPane {
  static {
    __name(this, "AgentSessionsWelcomePage");
  }
  static {
    AgentSessionsWelcomePage_1 = this;
  }
  static {
    this.ID = "agentSessionsWelcomePage";
  }
  static {
    this.COMMAND_ID = "workbench.action.openAgentSessionsWelcome";
  }
  constructor(group, telemetryService, themeService, storageService, instantiationService, contextKeyService, layoutService, commandService, editorService, agentSessionsService, configurationService, productService, walkthroughsService, chatService, chatEntitlementService, markdownRendererService, workspaceContextService, workspacesService, hostService, workspaceTrustManagementService, viewDescriptorService, chatWidgetService, logService) {
    super(AgentSessionsWelcomePage_1.ID, group, telemetryService, themeService, storageService);
    this.storageService = storageService;
    this.instantiationService = instantiationService;
    this.layoutService = layoutService;
    this.commandService = commandService;
    this.editorService = editorService;
    this.agentSessionsService = agentSessionsService;
    this.configurationService = configurationService;
    this.productService = productService;
    this.walkthroughsService = walkthroughsService;
    this.chatService = chatService;
    this.chatEntitlementService = chatEntitlementService;
    this.markdownRendererService = markdownRendererService;
    this.workspaceContextService = workspaceContextService;
    this.workspacesService = workspacesService;
    this.hostService = hostService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.viewDescriptorService = viewDescriptorService;
    this.chatWidgetService = chatWidgetService;
    this.logService = logService;
    this.sessionsControlDisposables = this._register(new DisposableStore());
    this.contentDisposables = this._register(new DisposableStore());
    this.walkthroughs = [];
    this._selectedSessionProvider = AgentSessionProviders.Local;
    this._recentTrustedWorkspaces = [];
    this._isEmptyWorkspace = false;
    this._workspaceKind = "empty";
    this._openedAt = 0;
    this.container = $(".agentSessionsWelcome", {
      role: "document",
      tabindex: 0,
      "aria-label": localize("agentSessionsWelcomeAriaLabel", "Overview of agent sessions and how to get started.")
    });
    this.contextService = this._register(contextKeyService.createScoped(this.container));
    ChatContextKeys.inAgentSessionsWelcome.bindTo(this.contextService).set(true);
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => {
      const input = this.input || this._storedInput;
      if (this.chatEntitlementService.sentiment.hidden && input) {
        this._closedBy = "chatHidden";
        this.group.closeEditor(input);
      }
    }));
  }
  createEditor(parent) {
    parent.appendChild(this.container);
    this.contentContainer = $(".agentSessionsWelcome-content");
    this.scrollableElement = this._register(new DomScrollableElement(this.contentContainer, {
      className: "agentSessionsWelcome-scrollable",
      vertical: 1
      /* ScrollbarVisibility.Auto */
    }));
    this.container.appendChild(this.scrollableElement.getDomNode());
  }
  async setInput(input, options, context, token) {
    this._storedInput = input;
    this._openedAt = Date.now();
    await super.setInput(input, options, context, token);
    this._workspaceKind = input.workspaceKind ?? "empty";
    await this.buildContent();
  }
  clearInput() {
    if (this._openedAt > 0) {
      const visibleDurationMs = Date.now() - this._openedAt;
      this.telemetryService.publicLog2("agentSessionsWelcome.closed", {
        visibleDurationMs,
        closedBy: this._closedBy ?? "disposed"
      });
      this._openedAt = 0;
      this._closedBy = void 0;
    }
    super.clearInput();
  }
  async buildContent() {
    this.contentDisposables.clear();
    this.sessionsControlDisposables.clear();
    this.sessionsControl = void 0;
    clearNode(this.contentContainer);
    this._isEmptyWorkspace = this.workspaceContextService.getWorkbenchState() === 1;
    if (this._isEmptyWorkspace) {
      const recentlyOpened = await this.getRecentlyOpenedWorkspaces(true);
      this._recentTrustedWorkspaces = recentlyOpened.slice(0, MAX_REPO_PICKS);
    }
    this.walkthroughs = this.walkthroughsService.getWalkthroughs();
    const header = append(this.contentContainer, $(".agentSessionsWelcome-header"));
    append(header, $("h1.product-name", {}, this.productService.nameLong));
    const startEntries = append(header, $(".agentSessionsWelcome-startEntries"));
    await this.buildStartEntries(startEntries);
    const chatSection = append(this.contentContainer, $(".agentSessionsWelcome-chatSection"));
    this.buildChatWidget(chatSection);
    const sessionsSection = append(this.contentContainer, $(".agentSessionsWelcome-sessionsSection"));
    this.buildSessionsOrPrompts(sessionsSection);
    const footer = append(this.contentContainer, $(".agentSessionsWelcome-footer"));
    this.buildFooter(footer);
    let originalSessions = this.agentSessionsService.model.sessions.length > 0;
    this.contentDisposables.add(this.agentSessionsService.model.onDidChangeSessions(() => {
      const hasSessions = this.agentSessionsService.model.sessions.length > 0;
      if (hasSessions !== originalSessions) {
        originalSessions = hasSessions;
        clearNode(sessionsSection);
        this.buildSessionsOrPrompts(sessionsSection);
      }
      this.layoutSessionsControl();
    }));
    this.scrollableElement?.scanDomNode();
  }
  async buildStartEntries(container) {
    const workspaces = await this.getRecentlyOpenedWorkspaces(false);
    const openEntry = workspaces.length > 0 ? { icon: Codicon.folderOpened, label: localize("openRecent", "Open Recent..."), command: "workbench.action.openRecent" } : { icon: Codicon.folderOpened, label: localize("openFolder", "Open Folder..."), command: "workbench.action.files.openFolder" };
    const entries = [
      openEntry,
      { icon: Codicon.newFile, label: localize("newFile", "New file..."), command: "welcome.showNewFileEntries" },
      { icon: Codicon.repoClone, label: localize("cloneRepo", "Clone Git Repository..."), command: "git.clone" }
    ];
    for (const entry of entries) {
      const button = append(container, $("button.agentSessionsWelcome-startEntry"));
      button.appendChild(renderIcon(entry.icon));
      button.appendChild(document.createTextNode(entry.label));
      button.onclick = () => {
        this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { welcomeKind: "agentSessionsWelcomePage", action: "executeCommand", actionId: entry.command });
        this.commandService.executeCommand(entry.command);
      };
    }
  }
  buildChatWidget(container) {
    const chatWidgetContainer = append(container, $(".agentSessionsWelcome-chatWidget"));
    const editorOverflowWidgetsDomNode = this.layoutService.getContainer(getWindow(chatWidgetContainer)).appendChild($(".chat-editor-overflow.monaco-editor"));
    this.contentDisposables.add(toDisposable(() => editorOverflowWidgetsDomNode.remove()));
    const scopedContextKeyService = this.contentDisposables.add(this.contextService.createScoped(chatWidgetContainer));
    const scopedInstantiationService = this.contentDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
    const onDidChangeActiveSessionProvider = this.contentDisposables.add(new Emitter());
    const recreateSessionForProvider = /* @__PURE__ */ __name(async (provider) => {
      if (this.chatWidget && this.chatModelRef) {
        this.chatWidget.setModel(void 0);
        this.chatModelRef.dispose();
        const newResource = getResourceForNewChatSession({
          type: provider,
          position: ChatSessionPosition.Sidebar,
          displayName: ""
        });
        const ref = await this.chatService.acquireOrLoadSession(newResource, ChatAgentLocation.Chat, CancellationToken.None);
        this.chatModelRef = ref ?? this.chatService.startNewLocalSession(ChatAgentLocation.Chat);
        this.contentDisposables.add(this.chatModelRef);
        if (this.chatModelRef.object) {
          this.chatWidget.setModel(this.chatModelRef.object);
        }
      }
    }, "recreateSessionForProvider");
    const sessionTypePickerDelegate = {
      getActiveSessionProvider: /* @__PURE__ */ __name(() => this._selectedSessionProvider, "getActiveSessionProvider"),
      setActiveSessionProvider: /* @__PURE__ */ __name((provider) => {
        this._selectedSessionProvider = provider;
        onDidChangeActiveSessionProvider.fire(provider);
        try {
          recreateSessionForProvider(provider);
        } catch {
        }
      }, "setActiveSessionProvider"),
      onDidChangeActiveSessionProvider: onDidChangeActiveSessionProvider.event
    };
    const onDidChangeSelectedWorkspace = this.contentDisposables.add(new Emitter());
    const onDidChangeWorkspaces = this.contentDisposables.add(new Emitter());
    const workspacePickerDelegate = this._isEmptyWorkspace ? {
      getWorkspaces: /* @__PURE__ */ __name(() => this._recentTrustedWorkspaces.map((w) => ({
        uri: this.getWorkspaceUri(w),
        label: this.getWorkspaceLabel(w),
        isFolder: isRecentFolder(w)
      })), "getWorkspaces"),
      getSelectedWorkspace: /* @__PURE__ */ __name(() => this._selectedWorkspace, "getSelectedWorkspace"),
      setSelectedWorkspace: /* @__PURE__ */ __name((workspace) => {
        this._selectedWorkspace = workspace;
        onDidChangeSelectedWorkspace.fire(workspace);
      }, "setSelectedWorkspace"),
      onDidChangeSelectedWorkspace: onDidChangeSelectedWorkspace.event,
      onDidChangeWorkspaces: onDidChangeWorkspaces.event,
      openFolderCommand: "workbench.action.files.openFolder"
    } : void 0;
    this.chatWidget = this.contentDisposables.add(scopedInstantiationService.createInstance(
      ChatWidget,
      ChatAgentLocation.Chat,
      // TODO: @osortega should we have a completely different ID and check that context instead in chatInputPart?
      {},
      // Empty resource view context
      {
        autoScroll: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "autoScroll"),
        renderFollowups: false,
        supportsFileReferences: true,
        renderInputOnTop: true,
        rendererOptions: {
          renderTextEditsAsSummary: /* @__PURE__ */ __name(() => true, "renderTextEditsAsSummary"),
          referencesExpandedWhenEmptyResponse: false,
          progressMessageAtBottomOfResponse: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "progressMessageAtBottomOfResponse")
        },
        editorOverflowWidgetsDomNode,
        enableImplicitContext: true,
        enableWorkingSet: "explicit",
        supportsChangingModes: true,
        sessionTypePickerDelegate,
        workspacePickerDelegate,
        submitHandler: this._isEmptyWorkspace ? (query, mode) => this.handleWorkspaceSubmission(query, mode) : void 0
      },
      {
        listForeground: SIDE_BAR_FOREGROUND,
        listBackground: editorBackground,
        overlayBackground: editorBackground,
        inputEditorBackground: editorBackground,
        resultEditorBackground: editorBackground
      }
    ));
    this.chatWidget.render(chatWidgetContainer);
    this.chatWidget.setVisible(true);
    this.contentDisposables.add(scheduleAtNextAnimationFrame(getWindow(chatWidgetContainer), () => {
      this.layoutChatWidget();
    }));
    this.chatModelRef = this.chatService.startNewLocalSession(ChatAgentLocation.Chat);
    this.contentDisposables.add(this.chatModelRef);
    if (this.chatModelRef.object) {
      this.chatWidget.setModel(this.chatModelRef.object);
    }
    this.contentDisposables.add(addDisposableListener(chatWidgetContainer, "mousedown", () => {
      this.chatWidget?.focusInput();
    }));
    this.contentDisposables.add(this.chatService.onDidSubmitRequest(({ chatSessionResource }) => {
      if (this.chatModelRef?.object?.sessionResource.toString() === chatSessionResource.toString()) {
        const mode = this.chatWidget?.input.currentModeObs.get().name.get() || "unknown";
        this.telemetryService.publicLog2("agentSessionsWelcome.chatSubmitted", {
          mode,
          provider: this._selectedSessionProvider,
          workspaceKind: this._workspaceKind,
          selectedRecentWorkspace: this._selectedWorkspace !== void 0
        });
        this._closedBy = "chatSubmission";
        this.openSessionInChat(chatSessionResource);
      }
    }));
    this.applyPrefillData();
  }
  getWorkspaceLabel(workspace) {
    if (isRecentFolder(workspace)) {
      return workspace.label || basename(workspace.folderUri);
    } else if (isRecentWorkspace(workspace)) {
      return workspace.label || basename(workspace.workspace.configPath);
    }
    return "";
  }
  getWorkspaceUri(workspace) {
    if (isRecentFolder(workspace)) {
      return workspace.folderUri;
    } else if (isRecentWorkspace(workspace)) {
      return workspace.workspace.configPath;
    }
    throw new Error("Invalid workspace type");
  }
  async handleWorkspaceSubmission(query, mode) {
    if (!this._selectedWorkspace) {
      return false;
    }
    if (!query.trim()) {
      return false;
    }
    const prefillData = {
      query,
      mode,
      timestamp: Date.now()
    };
    this.storageService.store(
      "chat.welcomeViewPrefill",
      JSON.stringify(prefillData),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
    const workspace = this._recentTrustedWorkspaces.find((w) => this.getWorkspaceUri(w).toString() === this._selectedWorkspace?.uri.toString());
    if (workspace) {
      try {
        if (isRecentFolder(workspace)) {
          await this.hostService.openWindow([{ folderUri: workspace.folderUri }]);
        } else if (isRecentWorkspace(workspace)) {
          await this.hostService.openWindow([{ workspaceUri: workspace.workspace.configPath }]);
        }
        return true;
      } catch (e) {
      }
    }
    this.storageService.remove(
      "chat.welcomeViewPrefill",
      -1
      /* StorageScope.APPLICATION */
    );
    return false;
  }
  /**
   * Reads and applies prefill data from storage (used when transferring chat input from another workspace).
   * This is called after the chat widget is created to populate it with any pending prefill data.
   */
  applyPrefillData() {
    const prefillData = this.storageService.get(
      "chat.welcomeViewPrefill",
      -1
      /* StorageScope.APPLICATION */
    );
    if (prefillData) {
      this.storageService.remove(
        "chat.welcomeViewPrefill",
        -1
        /* StorageScope.APPLICATION */
      );
      try {
        const { query, mode, timestamp } = JSON.parse(prefillData);
        if (timestamp && Date.now() - timestamp > 60 * 1e3) {
          return;
        }
        if (query && this.chatWidget) {
          this.chatWidget.setInput(query);
        }
        if (mode !== void 0 && this.chatWidget) {
          this.chatWidget.input.setChatMode(mode, false);
        }
        this.chatWidget?.focusInput();
      } catch {
      }
    }
  }
  buildSessionsOrPrompts(container) {
    this.sessionsControlDisposables.clear();
    this.sessionsControl = void 0;
    const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
    if (sessions.length > 0) {
      this.buildSessionsGrid(container, sessions);
    } else {
      this.buildWalkthroughs(container);
    }
  }
  buildSessionsGrid(container, _sessions) {
    this.sessionsControlContainer = append(container, $(".agentSessionsWelcome-sessionsGrid"));
    const options = {
      overrideStyles: getListStyles({
        listBackground: editorBackground
      }),
      filter: this.sessionsControlDisposables.add(this.instantiationService.createInstance(AgentSessionsFilter, {
        limitResults: /* @__PURE__ */ __name(() => MAX_SESSIONS, "limitResults"),
        overrideExclude: /* @__PURE__ */ __name((session) => session.isArchived() ? true : void 0, "overrideExclude")
      })),
      getHoverPosition: /* @__PURE__ */ __name(() => 2, "getHoverPosition"),
      trackActiveEditorSession: /* @__PURE__ */ __name(() => false, "trackActiveEditorSession"),
      source: "welcomeView",
      notifySessionOpened: /* @__PURE__ */ __name(() => {
        const isProjectionEnabled = this.configurationService.getValue(ChatConfiguration.AgentSessionProjectionEnabled);
        if (!isProjectionEnabled) {
          this._closedBy = "sessionClicked";
          this.revealMaximizedChat();
        }
      }, "notifySessionOpened")
    };
    this.sessionsControl = this.sessionsControlDisposables.add(this.instantiationService.createInstance(AgentSessionsControl, this.sessionsControlContainer, options));
    this.sessionsControlDisposables.add(this.agentSessionsService.model.onDidResolve(() => {
      this.layoutSessionsControl();
    }));
    if (this.agentSessionsService.model.resolved) {
      this.layoutSessionsControl();
    }
    this.sessionsControlDisposables.add(scheduleAtNextAnimationFrame(getWindow(this.sessionsControlContainer), () => {
      this.layoutSessionsControl();
    }));
    const openButton = append(container, $("button.agentSessionsWelcome-openSessionsButton"));
    openButton.textContent = localize("viewAllSessions", "View All Sessions");
    openButton.onclick = () => {
      this._closedBy = "viewAllSessions";
      this.revealMaximizedChat();
    };
  }
  buildWalkthroughs(container) {
    const activeWalkthroughs = this.walkthroughs.filter((w) => !w.when || this.contextService.contextMatchesRules(w.when)).slice(0, MAX_WALKTHROUGHS);
    if (activeWalkthroughs.length === 0) {
      return;
    }
    let currentIndex = 0;
    const card = append(container, $(".agentSessionsWelcome-walkthroughCard"));
    const iconContainer = append(card, $(".agentSessionsWelcome-walkthroughCard-icon"));
    const content = append(card, $(".agentSessionsWelcome-walkthroughCard-content"));
    const title = append(content, $(".agentSessionsWelcome-walkthroughCard-title"));
    const desc = append(content, $(".agentSessionsWelcome-walkthroughCard-description"));
    const navContainer = append(card, $(".agentSessionsWelcome-walkthroughCard-nav"));
    const prevButton = append(navContainer, $("button.nav-button"));
    prevButton.appendChild(renderIcon(Codicon.chevronLeft));
    prevButton.title = localize("previousWalkthrough", "Previous");
    const nextButton = append(navContainer, $("button.nav-button"));
    nextButton.appendChild(renderIcon(Codicon.chevronRight));
    nextButton.title = localize("nextWalkthrough", "Next");
    const updateContent = /* @__PURE__ */ __name(() => {
      const walkthrough = activeWalkthroughs[currentIndex];
      clearNode(iconContainer);
      if (walkthrough.icon.type === "icon") {
        iconContainer.appendChild(renderIcon(walkthrough.icon.icon));
      }
      title.textContent = walkthrough.title;
      desc.textContent = walkthrough.description || "";
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === activeWalkthroughs.length - 1;
    }, "updateContent");
    updateContent();
    card.onclick = () => {
      const walkthrough = activeWalkthroughs[currentIndex];
      this.telemetryService.publicLog2("gettingStarted.ActionExecuted", { welcomeKind: "agentSessionsWelcomePage", action: "openWalkthrough", actionId: walkthrough.id });
      const options = {
        selectedCategory: walkthrough.id,
        returnToCommand: AgentSessionsWelcomePage_1.COMMAND_ID
      };
      this.editorService.openEditor({
        resource: GettingStartedInput.RESOURCE,
        options
      });
    };
    prevButton.onclick = (e) => {
      e.stopPropagation();
      if (currentIndex > 0) {
        currentIndex--;
        updateContent();
      }
    };
    nextButton.onclick = (e) => {
      e.stopPropagation();
      if (currentIndex < activeWalkthroughs.length - 1) {
        currentIndex++;
        updateContent();
      }
    };
  }
  static {
    this.PRIVACY_NOTICE_DISMISSED_KEY = "agentSessionsWelcome.privacyNoticeDismissed";
  }
  buildPrivacyNotice(container) {
    if (!this.chatEntitlementService.anonymous) {
      return;
    }
    if (this.storageService.getBoolean(AgentSessionsWelcomePage_1.PRIVACY_NOTICE_DISMISSED_KEY, -1, false)) {
      return;
    }
    const providers = this.productService.defaultChatAgent?.provider;
    if (!providers || !providers.default || !this.productService.defaultChatAgent?.termsStatementUrl || !this.productService.defaultChatAgent?.privacyStatementUrl) {
      return;
    }
    const tosCard = append(container, $(".agentSessionsWelcome-walkthroughCard.agentSessionsWelcome-tosCard"));
    const dismissNotice = /* @__PURE__ */ __name(() => {
      this.storageService.store(
        AgentSessionsWelcomePage_1.PRIVACY_NOTICE_DISMISSED_KEY,
        true,
        -1,
        0
        /* StorageTarget.USER */
      );
      tosCard.remove();
    }, "dismissNotice");
    this.contentDisposables.add(this.chatService.onDidSubmitRequest(() => dismissNotice()));
    const iconContainer = append(tosCard, $(".agentSessionsWelcome-walkthroughCard-icon"));
    iconContainer.appendChild(renderIcon(Codicon.chatSparkle));
    const content = append(tosCard, $(".agentSessionsWelcome-walkthroughCard-content"));
    const title = append(content, $(".agentSessionsWelcome-walkthroughCard-title"));
    title.textContent = localize("tosTitle", "Try GitHub Copilot for free, no sign-in required!");
    const desc = append(content, $(".agentSessionsWelcome-walkthroughCard-description"));
    const descriptionMarkdown = new MarkdownString(localize({ key: "tosDescription", comment: ['{Locked="]({1})"}', '{Locked="]({2})"}'] }, "By continuing, you agree to {0}'s [Terms]({1}) and [Privacy Statement]({2}).", providers.default.name, this.productService.defaultChatAgent.termsStatementUrl, this.productService.defaultChatAgent.privacyStatementUrl), { isTrusted: true });
    const renderedMarkdown = this.markdownRendererService.render(descriptionMarkdown);
    desc.appendChild(renderedMarkdown.element);
    const dismissButton = append(tosCard, $("button.agentSessionsWelcome-tosCard-dismiss"));
    dismissButton.appendChild(renderIcon(Codicon.close));
    dismissButton.title = localize("dismissPrivacyNotice", "Dismiss");
    dismissButton.onclick = (e) => {
      e.stopPropagation();
      dismissNotice();
    };
  }
  buildFooter(container) {
    this.buildPrivacyNotice(container);
    const showOnStartupContainer = append(container, $(".agentSessionsWelcome-showOnStartup"));
    const showOnStartupCheckbox = this.contentDisposables.add(new Toggle({
      icon: Codicon.check,
      actionClassName: "agentSessionsWelcome-checkbox",
      isChecked: this.configurationService.getValue(configurationKey) === "agentSessionsWelcomePage",
      title: localize("checkboxTitle", "When checked, this page will be shown on startup."),
      ...getToggleStyles({
        inputActiveOptionBackground: "var(--vscode-descriptionForeground)",
        inputActiveOptionForeground: "var(--vscode-editor-background)",
        inputActiveOptionBorder: "var(--vscode-descriptionForeground)"
      })
    }));
    showOnStartupCheckbox.domNode.id = "showOnStartup";
    const showOnStartupLabel = $("label.caption", { for: "showOnStartup" }, localize("showOnStartup", "Show welcome page on startup"));
    const onShowOnStartupChanged = /* @__PURE__ */ __name(() => {
      if (showOnStartupCheckbox.checked) {
        this.configurationService.updateValue(configurationKey, "agentSessionsWelcomePage");
      } else {
        this.configurationService.updateValue(configurationKey, "none");
      }
    }, "onShowOnStartupChanged");
    this.contentDisposables.add(showOnStartupCheckbox.onChange(() => onShowOnStartupChanged()));
    this.contentDisposables.add(addDisposableListener(showOnStartupLabel, "click", () => {
      showOnStartupCheckbox.checked = !showOnStartupCheckbox.checked;
      onShowOnStartupChanged();
    }));
    showOnStartupContainer.appendChild(showOnStartupCheckbox.domNode);
    showOnStartupContainer.appendChild(showOnStartupLabel);
  }
  layout(dimension) {
    this.lastDimension = dimension;
    this.container.style.height = `${dimension.height}px`;
    this.container.style.width = `${dimension.width}px`;
    this.layoutChatWidget();
    this.layoutSessionsControl();
    this.scrollableElement?.scanDomNode();
  }
  layoutChatWidget() {
    if (!this.chatWidget || !this.lastDimension) {
      return;
    }
    const chatWidth = Math.min(800, this.lastDimension.width - 80);
    const inputHeight = 150;
    this.chatWidget.layout(inputHeight, chatWidth);
  }
  layoutSessionsControl() {
    if (!this.sessionsControl || !this.sessionsControlContainer || !this.lastDimension) {
      return;
    }
    const sessionsWidth = Math.min(800, this.lastDimension.width - 80);
    const visibleSessions = Math.min(this.agentSessionsService.model.sessions.filter((s) => !s.isArchived()).length, MAX_SESSIONS);
    const sessionsHeight = visibleSessions * AgentSessionsListDelegate.ITEM_HEIGHT;
    this.sessionsControl.layout(sessionsHeight, sessionsWidth);
    const marginOffset = Math.floor(visibleSessions / 2) * AgentSessionsListDelegate.ITEM_HEIGHT;
    this.sessionsControl.element.style.marginBottom = `-${marginOffset}px`;
  }
  focus() {
    super.focus();
    this.chatWidget?.focusInput();
  }
  async revealMaximizedChat() {
    try {
      await this.closeEditorAndMaximizeAuxiliaryBar();
    } catch (error) {
      this.logService.error("Failed to open maximized chat: {0}", toErrorMessage(error));
    }
  }
  async openSessionInChat(sessionResource) {
    try {
      await this.closeEditorAndMaximizeAuxiliaryBar(sessionResource);
    } catch (error) {
      this.logService.error("Failed to open agent session: {0}", toErrorMessage(error));
    }
  }
  async closeEditorAndMaximizeAuxiliaryBar(sessionResource) {
    const editorToClose = this.input || this._storedInput;
    if (editorToClose && this.group.contains(editorToClose)) {
      await new Promise((resolve) => {
        const disposable = this.group.onDidActiveEditorChange((e) => {
          disposable.dispose();
          resolve();
        });
        this.group.closeEditor(editorToClose);
      });
    }
    if (sessionResource) {
      await this.chatWidgetService.openSession(sessionResource);
    } else {
      await this.commandService.executeCommand("workbench.action.chat.open");
    }
    const chatViewLocation = this.viewDescriptorService.getViewLocationById(ChatViewId);
    if (chatViewLocation === 2) {
      this.layoutService.setAuxiliaryBarMaximized(true);
    }
  }
  async getRecentlyOpenedWorkspaces(onlyTrusted = false) {
    const workspaces = await this.workspacesService.getRecentlyOpened();
    const trustInfoPromises = workspaces.workspaces.map(async (ws) => {
      const uri = isRecentWorkspace(ws) ? ws.workspace.configPath : ws.folderUri;
      const trustInfo = await this.workspaceTrustManagementService.getUriTrustInfo(uri);
      return { workspace: ws, trusted: trustInfo.trusted };
    });
    const trustInfoResults = await Promise.all(trustInfoPromises);
    const filteredWorkspaces = trustInfoResults.filter((result) => onlyTrusted ? result.trusted : true).map((result) => result.workspace);
    return filteredWorkspaces;
  }
};
AgentSessionsWelcomePage = AgentSessionsWelcomePage_1 = __decorate([
  __param(1, ITelemetryService),
  __param(2, IThemeService),
  __param(3, IStorageService),
  __param(4, IInstantiationService),
  __param(5, IContextKeyService),
  __param(6, IWorkbenchLayoutService),
  __param(7, ICommandService),
  __param(8, IEditorService),
  __param(9, IAgentSessionsService),
  __param(10, IConfigurationService),
  __param(11, IProductService),
  __param(12, IWalkthroughsService),
  __param(13, IChatService),
  __param(14, IChatEntitlementService),
  __param(15, IMarkdownRendererService),
  __param(16, IWorkspaceContextService),
  __param(17, IWorkspacesService),
  __param(18, IHostService),
  __param(19, IWorkspaceTrustManagementService),
  __param(20, IViewDescriptorService),
  __param(21, IChatWidgetService),
  __param(22, ILogService)
], AgentSessionsWelcomePage);
class AgentSessionsWelcomeInputSerializer {
  static {
    __name(this, "AgentSessionsWelcomeInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return JSON.stringify({});
  }
  deserialize(instantiationService, serializedEditorInput) {
    return new AgentSessionsWelcomeInput({});
  }
}
export {
  AgentSessionsWelcomeInputSerializer,
  AgentSessionsWelcomePage
};
//# sourceMappingURL=agentSessionsWelcome.js.map
