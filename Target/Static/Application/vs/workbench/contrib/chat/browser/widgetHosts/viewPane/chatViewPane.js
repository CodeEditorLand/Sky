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
var ChatViewPane_1;
import "./media/chatViewPane.css";
import { $, addDisposableListener, append, EventHelper, EventType, getWindow, setVisibility } from "../../../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../../../base/browser/mouseEvent.js";
import { Button } from "../../../../../../base/browser/ui/button/button.js";
import { Sash } from "../../../../../../base/browser/ui/sash/sash.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Event } from "../../../../../../base/common/event.js";
import { MutableDisposable, toDisposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { MenuWorkbenchToolBar } from "../../../../../../platform/actions/browser/toolbar.js";
import { MenuId } from "../../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
import { defaultButtonStyles } from "../../../../../../platform/theme/browser/defaultStyles.js";
import { editorBackground } from "../../../../../../platform/theme/common/colorRegistry.js";
import { ChatViewTitleControl } from "./chatViewTitleControl.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { ViewPane } from "../../../../../browser/parts/views/viewPane.js";
import { Memento } from "../../../../../common/memento.js";
import { SIDE_BAR_FOREGROUND } from "../../../../../common/theme.js";
import { IViewDescriptorService } from "../../../../../common/views.js";
import { ILifecycleService } from "../../../../../services/lifecycle/common/lifecycle.js";
import { IChatAgentService } from "../../../common/participants/chatAgents.js";
import { ChatContextKeys } from "../../../common/actions/chatContextKeys.js";
import { CHAT_PROVIDER_ID } from "../../../common/participants/chatParticipantContribTypes.js";
import { IChatService } from "../../../common/chatService/chatService.js";
import { IChatSessionsService, localChatSessionType } from "../../../common/chatSessionsService.js";
import { LocalChatSessionUri, getChatSessionType } from "../../../common/model/chatUri.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind } from "../../../common/constants.js";
import { AgentSessionsControl } from "../../agentSessions/agentSessionsControl.js";
import { AgentSessionsListDelegate } from "../../agentSessions/agentSessionsViewer.js";
import { ACTION_ID_NEW_CHAT } from "../../actions/chatActions.js";
import { ChatWidget } from "../../widget/chatWidget.js";
import { ChatViewWelcomeController } from "../../viewsWelcome/chatViewWelcomeController.js";
import { IWorkbenchLayoutService } from "../../../../../services/layout/browser/layoutService.js";
import { AgentSessionsViewerOrientation, AgentSessionsViewerPosition } from "../../agentSessions/agentSessions.js";
import { IProgressService } from "../../../../../../platform/progress/common/progress.js";
import { ChatViewId } from "../../chat.js";
import { disposableTimeout } from "../../../../../../base/common/async.js";
import { AgentSessionsFilter } from "../../agentSessions/agentSessionsFilter.js";
import { IAgentSessionsService } from "../../agentSessions/agentSessionsService.js";
import { IChatEntitlementService } from "../../../../../services/chat/common/chatEntitlementService.js";
let ChatViewPane = class ChatViewPane2 extends ViewPane {
  static {
    __name(this, "ChatViewPane");
  }
  static {
    ChatViewPane_1 = this;
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, storageService, chatService, chatAgentService, logService, layoutService, chatSessionsService, telemetryService, lifecycleService, progressService, agentSessionsService, chatEntitlementService, commandService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.storageService = storageService;
    this.chatService = chatService;
    this.chatAgentService = chatAgentService;
    this.logService = logService;
    this.layoutService = layoutService;
    this.chatSessionsService = chatSessionsService;
    this.telemetryService = telemetryService;
    this.progressService = progressService;
    this.agentSessionsService = agentSessionsService;
    this.chatEntitlementService = chatEntitlementService;
    this.commandService = commandService;
    this.lastDimensionsPerOrientation = /* @__PURE__ */ new Map();
    this.modelRef = this._register(new MutableDisposable());
    this.sessionsCount = 0;
    this.sessionsViewerOrientation = AgentSessionsViewerOrientation.Stacked;
    this.sessionsViewerOrientationConfiguration = "sideBySide";
    this.sessionsViewerSashDisposables = this._register(new MutableDisposable());
    this.layoutingBody = false;
    this.memento = new Memento(`interactive-session-view-${CHAT_PROVIDER_ID}`, this.storageService);
    this.viewState = this.memento.getMemento(
      1,
      1
      /* StorageTarget.MACHINE */
    );
    if (lifecycleService.startupKind !== 3 && this.configurationService.getValue(ChatConfiguration.RestoreLastPanelSession) === false) {
      this.viewState.sessionId = void 0;
    }
    this.sessionsViewerLimited = this.configurationService.getValue(ChatConfiguration.ChatViewSessionsShowRecentOnly) ?? false;
    this.sessionsViewerVisible = false;
    this.sessionsViewerSidebarWidth = Math.max(ChatViewPane_1.SESSIONS_SIDEBAR_MIN_WIDTH, this.viewState.sessionsSidebarWidth ?? ChatViewPane_1.SESSIONS_SIDEBAR_DEFAULT_WIDTH);
    this.chatViewLocationContext = ChatContextKeys.panelLocation.bindTo(contextKeyService);
    this.sessionsViewerLimitedContext = ChatContextKeys.agentSessionsViewerLimited.bindTo(contextKeyService);
    this.sessionsViewerOrientationContext = ChatContextKeys.agentSessionsViewerOrientation.bindTo(contextKeyService);
    this.sessionsViewerPositionContext = ChatContextKeys.agentSessionsViewerPosition.bindTo(contextKeyService);
    this.sessionsViewerVisibilityContext = ChatContextKeys.agentSessionsViewerVisible.bindTo(contextKeyService);
    this.updateContextKeys();
    this.registerListeners();
  }
  updateContextKeys() {
    const { position, location } = this.getViewPositionAndLocation();
    this.sessionsViewerLimitedContext.set(this.sessionsViewerLimited);
    this.chatViewLocationContext.set(
      location ?? 2
      /* ViewContainerLocation.AuxiliaryBar */
    );
    this.sessionsViewerOrientationContext.set(this.sessionsViewerOrientation);
    this.sessionsViewerPositionContext.set(position === 1 ? AgentSessionsViewerPosition.Right : AgentSessionsViewerPosition.Left);
  }
  getViewPositionAndLocation() {
    const viewLocation = this.viewDescriptorService.getViewLocationById(this.id);
    const sideBarPosition = this.layoutService.getSideBarPosition();
    const panelPosition = this.layoutService.getPanelPosition();
    let sideSessionsOnRightPosition;
    switch (viewLocation) {
      case 0:
        sideSessionsOnRightPosition = sideBarPosition === 1;
        break;
      case 1:
        sideSessionsOnRightPosition = panelPosition !== 0;
        break;
      default:
        sideSessionsOnRightPosition = sideBarPosition === 0;
        break;
    }
    return {
      position: sideSessionsOnRightPosition ? 1 : 0,
      location: viewLocation ?? 2
      /* ViewContainerLocation.AuxiliaryBar */
    };
  }
  updateViewPaneClasses(fromEvent) {
    const welcomeEnabled = !this.chatEntitlementService.sentiment.installed;
    this.viewPaneContainer?.classList.toggle("chat-view-welcome-enabled", welcomeEnabled);
    const activityBarLocationDefault = this.configurationService.getValue(
      "workbench.activityBar.location"
      /* LayoutSettings.ACTIVITY_BAR_LOCATION */
    ) === "default";
    this.viewPaneContainer?.classList.toggle("activity-bar-location-default", activityBarLocationDefault);
    this.viewPaneContainer?.classList.toggle("activity-bar-location-other", !activityBarLocationDefault);
    const { position, location } = this.getViewPositionAndLocation();
    this.viewPaneContainer?.classList.toggle(
      "chat-view-location-auxiliarybar",
      location === 2
      /* ViewContainerLocation.AuxiliaryBar */
    );
    this.viewPaneContainer?.classList.toggle(
      "chat-view-location-sidebar",
      location === 0
      /* ViewContainerLocation.Sidebar */
    );
    this.viewPaneContainer?.classList.toggle(
      "chat-view-location-panel",
      location === 1
      /* ViewContainerLocation.Panel */
    );
    this.viewPaneContainer?.classList.toggle(
      "chat-view-position-left",
      position === 0
      /* Position.LEFT */
    );
    this.viewPaneContainer?.classList.toggle(
      "chat-view-position-right",
      position === 1
      /* Position.RIGHT */
    );
    if (fromEvent) {
      this.relayout();
    }
  }
  registerListeners() {
    this._register(this.chatAgentService.onDidChangeAgents(() => this.onDidChangeAgents()));
    this._register(Event.any(Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("workbench.sideBar.location")), this.layoutService.onDidChangePanelPosition, Event.filter(this.viewDescriptorService.onDidChangeContainerLocation, (e) => e.viewContainer === this.viewDescriptorService.getViewContainerByViewId(this.id)))(() => {
      this.updateContextKeys();
      this.updateViewPaneClasses(
        true
        /* layout here */
      );
    }));
    this._register(Event.filter(this.configurationService.onDidChangeConfiguration, (e) => {
      return e.affectsConfiguration(
        "workbench.activityBar.location"
        /* LayoutSettings.ACTIVITY_BAR_LOCATION */
      );
    })(() => this.updateViewPaneClasses(true)));
    this._register(Event.filter(this.configurationService.onDidChangeConfiguration, (e) => {
      return e.affectsConfiguration(ChatConfiguration.ChatViewSessionsShowRecentOnly);
    })(() => {
      const oldSessionsViewerLimited = this.sessionsViewerLimited;
      if (this.sessionsViewerOrientation === AgentSessionsViewerOrientation.SideBySide) {
        this.sessionsViewerLimited = false;
      } else {
        this.sessionsViewerLimited = this.configurationService.getValue(ChatConfiguration.ChatViewSessionsShowRecentOnly) ?? false;
      }
      if (oldSessionsViewerLimited !== this.sessionsViewerLimited) {
        this.notifySessionsControlLimitedChanged(
          true,
          true
          /* update */
        );
      }
    }));
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => {
      this.updateViewPaneClasses(true);
    }));
  }
  onDidChangeAgents() {
    if (this.chatAgentService.getDefaultAgent(ChatAgentLocation.Chat)) {
      if (!this._widget?.viewModel && !this.restoringSession) {
        const sessionResource = this.getTransferredOrPersistedSessionInfo();
        this.restoringSession = (sessionResource ? this.chatService.getOrRestoreSession(sessionResource) : Promise.resolve(void 0)).then(async (modelRef) => {
          if (!this._widget) {
            return;
          }
          const wasVisible = this._widget.visible;
          try {
            this._widget.setVisible(false);
            await this.showModel(modelRef);
          } finally {
            this._widget.setVisible(wasVisible);
          }
        });
        this.restoringSession.finally(() => this.restoringSession = void 0);
      }
    }
    this._onDidChangeViewWelcomeState.fire();
  }
  getTransferredOrPersistedSessionInfo() {
    if (this.chatService.transferredSessionResource) {
      return this.chatService.transferredSessionResource;
    }
    return this.viewState.sessionId ? LocalChatSessionUri.forSession(this.viewState.sessionId) : void 0;
  }
  renderBody(parent) {
    super.renderBody(parent);
    this.telemetryService.publicLog2("chatViewPaneOpened");
    this.viewPaneContainer = parent;
    this.viewPaneContainer.classList.add("chat-viewpane");
    this.updateViewPaneClasses(false);
    this.createControls(parent);
    this.setupContextMenu(parent);
    this.applyModel();
  }
  createControls(parent) {
    const sessionsControl = this.createSessionsControl(parent);
    const welcomeController = this.welcomeController = this._register(this.instantiationService.createInstance(ChatViewWelcomeController, parent, this, ChatAgentLocation.Chat));
    const chatWidget = this.createChatControl(parent);
    this.registerControlsListeners(sessionsControl, chatWidget, welcomeController);
    this.updateSessionsControlVisibility();
  }
  static {
    this.SESSIONS_LIMIT = 5;
  }
  static {
    this.SESSIONS_SIDEBAR_MIN_WIDTH = 200;
  }
  static {
    this.SESSIONS_SIDEBAR_DEFAULT_WIDTH = 300;
  }
  static {
    this.CHAT_WIDGET_DEFAULT_WIDTH = 300;
  }
  static {
    this.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH = this.CHAT_WIDGET_DEFAULT_WIDTH + this.SESSIONS_SIDEBAR_DEFAULT_WIDTH;
  }
  createSessionsControl(parent) {
    const that = this;
    const sessionsContainer = this.sessionsContainer = parent.appendChild($(".agent-sessions-container"));
    const sessionsTitleContainer = this.sessionsTitleContainer = append(sessionsContainer, $(".agent-sessions-title-container"));
    const sessionsTitle = this.sessionsTitle = append(sessionsTitleContainer, $("span.agent-sessions-title"));
    this.updateSessionsControlTitle();
    this._register(addDisposableListener(sessionsTitle, EventType.CLICK, () => {
      this.sessionsControl?.scrollToTop();
      this.sessionsControl?.focus();
    }));
    const sessionsToolbarContainer = append(sessionsTitleContainer, $(".agent-sessions-toolbar"));
    const sessionsToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, sessionsToolbarContainer, MenuId.AgentSessionsToolbar, {
      menuOptions: { shouldForwardArgs: true }
    }));
    const sessionsFilter = this._register(this.instantiationService.createInstance(AgentSessionsFilter, {
      filterMenuId: MenuId.AgentSessionsViewerFilterSubMenu,
      limitResults: /* @__PURE__ */ __name(() => {
        return that.sessionsViewerLimited ? ChatViewPane_1.SESSIONS_LIMIT : void 0;
      }, "limitResults"),
      groupResults: /* @__PURE__ */ __name(() => {
        return !that.sessionsViewerLimited;
      }, "groupResults"),
      overrideExclude(session) {
        if (that.sessionsViewerLimited) {
          if (session.isArchived()) {
            return true;
          }
          return false;
        }
        return void 0;
      },
      notifyResults(count) {
        that.notifySessionsControlCountChanged(count);
      }
    }));
    this._register(Event.runAndSubscribe(sessionsFilter.onDidChange, () => {
      sessionsToolbarContainer.classList.toggle("filtered", !sessionsFilter.isDefault());
    }));
    const newSessionButtonContainer = this.sessionsNewButtonContainer = append(sessionsContainer, $(".agent-sessions-new-button-container"));
    const newSessionButton = this._register(new Button(newSessionButtonContainer, { ...defaultButtonStyles, secondary: true }));
    newSessionButton.label = localize("newSession", "New Session");
    this._register(newSessionButton.onDidClick(() => this.commandService.executeCommand(ACTION_ID_NEW_CHAT)));
    this.sessionsControlContainer = append(sessionsContainer, $(".agent-sessions-control-container"));
    const sessionsControl = this.sessionsControl = this._register(this.instantiationService.createInstance(AgentSessionsControl, this.sessionsControlContainer, {
      source: "chatViewPane",
      filter: sessionsFilter,
      overrideStyles: this.getLocationBasedColors().listOverrideStyles,
      getHoverPosition: /* @__PURE__ */ __name(() => {
        const { position } = this.getViewPositionAndLocation();
        return position === 1 ? 0 : 1;
      }, "getHoverPosition"),
      trackActiveEditorSession: /* @__PURE__ */ __name(() => {
        return !this._widget || this._widget.isEmpty();
      }, "trackActiveEditorSession"),
      overrideCompare(sessionA, sessionB) {
        if (that.sessionsViewerLimited) {
          const aIsUnread = !sessionA.isRead();
          const bIsUnread = !sessionB.isRead();
          if (aIsUnread && !bIsUnread) {
            return -1;
          }
          if (!aIsUnread && bIsUnread) {
            return 1;
          }
        }
        return void 0;
      }
    }));
    this._register(this.onDidChangeBodyVisibility((visible) => sessionsControl.setVisible(visible)));
    sessionsToolbar.context = sessionsControl;
    this._register(Event.runAndSubscribe(Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(ChatConfiguration.ChatViewSessionsOrientation)), (e) => {
      const newSessionsViewerOrientationConfiguration = this.configurationService.getValue(ChatConfiguration.ChatViewSessionsOrientation);
      this.doUpdateConfiguredSessionsViewerOrientation(newSessionsViewerOrientationConfiguration, { updateConfiguration: false, layout: !!e });
    }));
    return sessionsControl;
  }
  getSessionsViewerOrientation() {
    return this.sessionsViewerOrientation;
  }
  updateConfiguredSessionsViewerOrientation(orientation) {
    return this.doUpdateConfiguredSessionsViewerOrientation(orientation, { updateConfiguration: true, layout: true });
  }
  doUpdateConfiguredSessionsViewerOrientation(orientation, options) {
    const oldSessionsViewerOrientationConfiguration = this.sessionsViewerOrientationConfiguration;
    let validatedOrientation;
    if (orientation === "stacked" || orientation === "sideBySide") {
      validatedOrientation = orientation;
    } else {
      validatedOrientation = "sideBySide";
    }
    this.sessionsViewerOrientationConfiguration = validatedOrientation;
    if (oldSessionsViewerOrientationConfiguration === this.sessionsViewerOrientationConfiguration) {
      return;
    }
    if (options.updateConfiguration) {
      this.configurationService.updateValue(ChatConfiguration.ChatViewSessionsOrientation, validatedOrientation);
    }
    if (options.layout) {
      this.relayout();
    }
  }
  notifySessionsControlLimitedChanged(triggerLayout, triggerUpdate) {
    this.sessionsViewerLimitedContext.set(this.sessionsViewerLimited);
    this.updateSessionsControlTitle();
    const updatePromise = triggerUpdate ? this.sessionsControl?.update() : void 0;
    if (triggerLayout) {
      this.relayout();
    }
    return updatePromise ?? Promise.resolve();
  }
  notifySessionsControlCountChanged(newSessionsCount) {
    const countChanged = typeof newSessionsCount === "number" && newSessionsCount !== this.sessionsCount;
    this.sessionsCount = newSessionsCount ?? this.sessionsCount;
    const { changed: visibilityChanged, visible } = this.updateSessionsControlVisibility();
    if (visibilityChanged || countChanged && visible) {
      this.relayout();
    }
  }
  updateSessionsControlTitle() {
    if (!this.sessionsTitle) {
      return;
    }
    this.sessionsTitle.textContent = this.sessionsViewerLimited ? localize("recentSessions", "Recent Sessions") : localize("allSessions", "Sessions");
  }
  updateSessionsControlVisibility() {
    if (!this.sessionsContainer || !this.viewPaneContainer) {
      return { changed: false, visible: false };
    }
    let newSessionsContainerVisible;
    if (!this.configurationService.getValue(ChatConfiguration.ChatViewSessionsEnabled)) {
      newSessionsContainerVisible = false;
    } else {
      if (this.sessionsViewerOrientation === AgentSessionsViewerOrientation.Stacked) {
        newSessionsContainerVisible = !!this.chatEntitlementService.sentiment.installed && // chat is installed (otherwise make room for terms and welcome)
        (!this._widget || this._widget?.isEmpty()) && // chat widget empty
        !this.welcomeController?.isShowingWelcome.get() && // welcome not showing
        (this.sessionsCount > 0 || !this.sessionsViewerLimited);
      } else {
        newSessionsContainerVisible = !this.welcomeController?.isShowingWelcome.get() && // welcome not showing
        !!this.lastDimensions && this.lastDimensions.width >= ChatViewPane_1.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH;
      }
    }
    this.viewPaneContainer.classList.toggle("has-sessions-control", newSessionsContainerVisible);
    const sessionsContainerVisible = this.sessionsContainer.style.display !== "none";
    setVisibility(newSessionsContainerVisible, this.sessionsContainer);
    this.sessionsViewerVisible = newSessionsContainerVisible;
    this.sessionsViewerVisibilityContext.set(newSessionsContainerVisible);
    return {
      changed: sessionsContainerVisible !== newSessionsContainerVisible,
      visible: newSessionsContainerVisible
    };
  }
  getFocusedSessions() {
    return this.sessionsControl?.getFocus() ?? [];
  }
  static {
    this.MIN_CHAT_WIDGET_HEIGHT = 116;
  }
  get widget() {
    return this._widget;
  }
  createChatControl(parent) {
    const chatControlsContainer = append(parent, $(".chat-controls-container"));
    const locationBasedColors = this.getLocationBasedColors();
    const editorOverflowWidgetsDomNode = this.layoutService.getContainer(getWindow(chatControlsContainer)).appendChild($(".chat-editor-overflow.monaco-editor"));
    this._register(toDisposable(() => editorOverflowWidgetsDomNode.remove()));
    this.createChatTitleControl(chatControlsContainer);
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this._widget = this._register(scopedInstantiationService.createInstance(ChatWidget, ChatAgentLocation.Chat, { viewId: this.id }, {
      autoScroll: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "autoScroll"),
      renderFollowups: true,
      supportsFileReferences: true,
      clear: /* @__PURE__ */ __name(() => this.clear(), "clear"),
      rendererOptions: {
        renderTextEditsAsSummary: /* @__PURE__ */ __name((uri) => {
          return true;
        }, "renderTextEditsAsSummary"),
        referencesExpandedWhenEmptyResponse: false,
        progressMessageAtBottomOfResponse: /* @__PURE__ */ __name((mode) => mode !== ChatModeKind.Ask, "progressMessageAtBottomOfResponse")
      },
      editorOverflowWidgetsDomNode,
      enableImplicitContext: true,
      enableWorkingSet: "explicit",
      supportsChangingModes: true
    }, {
      listForeground: SIDE_BAR_FOREGROUND,
      listBackground: locationBasedColors.background,
      overlayBackground: locationBasedColors.overlayBackground,
      inputEditorBackground: locationBasedColors.background,
      resultEditorBackground: editorBackground
    }));
    this._widget.render(chatControlsContainer);
    const updateWidgetVisibility = /* @__PURE__ */ __name((reader) => this._widget.setVisible(this.isBodyVisible() && !this.welcomeController?.isShowingWelcome.read(reader)), "updateWidgetVisibility");
    this._register(this.onDidChangeBodyVisibility(() => updateWidgetVisibility()));
    this._register(autorun((reader) => updateWidgetVisibility(reader)));
    return this._widget;
  }
  createChatTitleControl(parent) {
    this.titleControl = this._register(this.instantiationService.createInstance(ChatViewTitleControl, parent, {
      focusChat: /* @__PURE__ */ __name(() => this._widget.focusInput(), "focusChat")
    }));
    this._register(this.titleControl.onDidChangeHeight(() => {
      this.relayout();
    }));
  }
  //#endregion
  registerControlsListeners(sessionsControl, chatWidget, welcomeController) {
    this._register(Event.any(chatWidget.onDidChangeEmptyState, Event.fromObservable(welcomeController.isShowingWelcome), Event.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration(ChatConfiguration.ChatViewSessionsEnabled)))(() => {
      if (this.sessionsViewerOrientation === AgentSessionsViewerOrientation.Stacked) {
        sessionsControl.clearFocus();
      }
      this.notifySessionsControlCountChanged();
    }));
    this._register(chatWidget.onDidChangeViewModel(() => {
      if (this.sessionsViewerOrientation === AgentSessionsViewerOrientation.Stacked) {
        return;
      }
      const sessionResource = chatWidget.viewModel?.sessionResource;
      if (sessionResource) {
        sessionsControl.reveal(sessionResource);
      }
    }));
    this._register(autorun((reader) => {
      chatWidget.input.inputPartHeight.read(reader);
      if (this.sessionsViewerVisible && this.sessionsViewerOrientation === AgentSessionsViewerOrientation.Stacked) {
        this.relayout();
      }
    }));
  }
  setupContextMenu(parent) {
    this._register(addDisposableListener(parent, EventType.CONTEXT_MENU, (e) => {
      EventHelper.stop(e, true);
      this.contextMenuService.showContextMenu({
        menuId: MenuId.ChatWelcomeContext,
        contextKeyService: this.contextKeyService,
        getAnchor: /* @__PURE__ */ __name(() => new StandardMouseEvent(getWindow(parent), e), "getAnchor")
      });
    }));
  }
  //#region Model Management
  async applyModel() {
    const sessionResource = this.getTransferredOrPersistedSessionInfo();
    const modelRef = sessionResource ? await this.chatService.getOrRestoreSession(sessionResource) : void 0;
    await this.showModel(modelRef);
  }
  async showModel(modelRef, startNewSession = true) {
    const oldModelResource = this.modelRef.value?.object.sessionResource;
    this.modelRef.value = void 0;
    let ref;
    if (startNewSession) {
      ref = modelRef ?? (this.chatService.transferredSessionResource ? await this.chatService.getOrRestoreSession(this.chatService.transferredSessionResource) : this.chatService.startSession(ChatAgentLocation.Chat));
      if (!ref) {
        throw new Error("Could not start chat session");
      }
    }
    this.modelRef.value = ref;
    const model = ref?.object;
    if (model) {
      await this.updateWidgetLockState(model.sessionResource);
      this.viewState.sessionId = model.sessionId;
    }
    this._widget.setModel(model);
    this.titleControl?.update(model);
    this.updateActions();
    if (oldModelResource) {
      this.agentSessionsService.model.getSession(oldModelResource)?.setRead(true);
    }
    return model;
  }
  async updateWidgetLockState(sessionResource) {
    const sessionType = getChatSessionType(sessionResource);
    if (sessionType === localChatSessionType) {
      this._widget.unlockFromCodingAgent();
      return;
    }
    let canResolve = false;
    try {
      canResolve = await this.chatSessionsService.canResolveChatSession(sessionResource);
    } catch (error) {
      this.logService.warn(`Failed to resolve chat session '${sessionResource.toString()}' for locking`, error);
    }
    if (!canResolve) {
      this._widget.unlockFromCodingAgent();
      return;
    }
    const contribution = this.chatSessionsService.getChatSessionContribution(sessionType);
    if (contribution) {
      this._widget.lockToCodingAgent(contribution.name, contribution.displayName, contribution.type);
    } else {
      this._widget.unlockFromCodingAgent();
    }
  }
  async clear() {
    this.updateViewState();
    await this.showModel(void 0);
    this.updateActions();
  }
  async loadSession(sessionResource) {
    return this.progressService.withProgress({ location: ChatViewId, delay: 200 }, async () => {
      let queue = Promise.resolve();
      const clearWidget = disposableTimeout(() => {
        queue = this.showModel(void 0, false).then(() => {
        });
      }, 100);
      const sessionType = getChatSessionType(sessionResource);
      if (sessionType !== localChatSessionType) {
        await this.chatSessionsService.canResolveChatSession(sessionResource);
      }
      const newModelRef = await this.chatService.loadSessionForResource(sessionResource, ChatAgentLocation.Chat, CancellationToken.None);
      clearWidget.dispose();
      await queue;
      return this.showModel(newModelRef);
    });
  }
  //#endregion
  focus() {
    super.focus();
    this.focusInput();
  }
  focusInput() {
    this._widget.focusInput();
  }
  focusSessions() {
    if (this.sessionsContainer?.style.display === "none") {
      return false;
    }
    this.sessionsControl?.focus();
    return true;
  }
  relayout() {
    if (this.lastDimensions) {
      this.layoutBody(this.lastDimensions.height, this.lastDimensions.width);
    }
  }
  layoutBody(height, width) {
    if (this.layoutingBody) {
      return;
    }
    this.layoutingBody = true;
    try {
      this.doLayoutBody(height, width);
    } finally {
      this.layoutingBody = false;
    }
  }
  doLayoutBody(height, width) {
    super.layoutBody(height, width);
    this.lastDimensions = { height, width };
    let remainingHeight = height;
    let remainingWidth = width;
    const { heightReduction, widthReduction } = this.layoutSessionsControl(remainingHeight, remainingWidth);
    remainingHeight -= heightReduction;
    remainingWidth -= widthReduction;
    remainingHeight -= this.titleControl?.getHeight() ?? 0;
    this._widget.layout(remainingHeight, remainingWidth);
    this.lastDimensionsPerOrientation.set(this.sessionsViewerOrientation, { height, width });
  }
  layoutSessionsControl(height, width) {
    let heightReduction = 0;
    let widthReduction = 0;
    if (!this.sessionsContainer || !this.sessionsControlContainer || !this.sessionsControl || !this.viewPaneContainer || !this.sessionsTitleContainer || !this.sessionsTitle) {
      return { heightReduction, widthReduction };
    }
    const oldSessionsViewerOrientation = this.sessionsViewerOrientation;
    let newSessionsViewerOrientation;
    switch (this.sessionsViewerOrientationConfiguration) {
      // Stacked
      case "stacked":
        newSessionsViewerOrientation = AgentSessionsViewerOrientation.Stacked;
        break;
      // Update orientation based on available width
      default:
        newSessionsViewerOrientation = width >= ChatViewPane_1.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH ? AgentSessionsViewerOrientation.SideBySide : AgentSessionsViewerOrientation.Stacked;
    }
    if (newSessionsViewerOrientation === AgentSessionsViewerOrientation.Stacked && width >= ChatViewPane_1.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH && this.getViewPositionAndLocation().location === 2 && this.layoutService.isAuxiliaryBarMaximized()) {
      newSessionsViewerOrientation = AgentSessionsViewerOrientation.SideBySide;
    }
    this.sessionsViewerOrientation = newSessionsViewerOrientation;
    if (newSessionsViewerOrientation === AgentSessionsViewerOrientation.SideBySide) {
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-sidebyside", true);
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-stacked", false);
      this.sessionsViewerOrientationContext.set(AgentSessionsViewerOrientation.SideBySide);
    } else {
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-sidebyside", false);
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-stacked", true);
      this.sessionsViewerOrientationContext.set(AgentSessionsViewerOrientation.Stacked);
    }
    if (oldSessionsViewerOrientation !== this.sessionsViewerOrientation) {
      const oldSessionsViewerLimited = this.sessionsViewerLimited;
      if (this.sessionsViewerOrientation === AgentSessionsViewerOrientation.SideBySide) {
        this.sessionsViewerLimited = false;
      } else {
        this.sessionsViewerLimited = this.configurationService.getValue(ChatConfiguration.ChatViewSessionsShowRecentOnly) ?? false;
      }
      let updatePromise;
      if (oldSessionsViewerLimited !== this.sessionsViewerLimited) {
        updatePromise = this.notifySessionsControlLimitedChanged(
          false,
          true
          /* update */
        );
      } else {
        updatePromise = this.sessionsControl?.update();
      }
      if (this.sessionsViewerOrientation === AgentSessionsViewerOrientation.SideBySide) {
        updatePromise.then(() => {
          const sessionResource = this._widget?.viewModel?.sessionResource;
          if (sessionResource) {
            this.sessionsControl?.reveal(sessionResource);
          }
        });
      }
    }
    const { visible: sessionsContainerVisible } = this.updateSessionsControlVisibility();
    if (!sessionsContainerVisible || this.sessionsViewerOrientation === AgentSessionsViewerOrientation.Stacked) {
      this.sessionsViewerSashDisposables.clear();
      this.sessionsViewerSash = void 0;
    } else if (this.sessionsViewerOrientation === AgentSessionsViewerOrientation.SideBySide) {
      if (!this.sessionsViewerSashDisposables.value && this.viewPaneContainer) {
        this.createSessionsViewerSash(this.viewPaneContainer, height, width);
      }
    }
    if (!sessionsContainerVisible) {
      return { heightReduction: 0, widthReduction: 0 };
    }
    let availableSessionsHeight = height - this.sessionsTitleContainer.offsetHeight;
    if (this.sessionsViewerOrientation === AgentSessionsViewerOrientation.Stacked) {
      availableSessionsHeight -= Math.max(ChatViewPane_1.MIN_CHAT_WIDGET_HEIGHT, this._widget?.input?.inputPartHeight.get() ?? 0);
    } else {
      availableSessionsHeight -= this.sessionsNewButtonContainer?.offsetHeight ?? 0;
    }
    if (this.sessionsViewerOrientation === AgentSessionsViewerOrientation.SideBySide) {
      const sessionsViewerSidebarWidth = this.computeEffectiveSideBySideSessionsSidebarWidth(width);
      this.sessionsControlContainer.style.height = `${availableSessionsHeight}px`;
      this.sessionsControlContainer.style.width = `${sessionsViewerSidebarWidth}px`;
      this.sessionsControl.layout(availableSessionsHeight, sessionsViewerSidebarWidth);
      this.sessionsViewerSash?.layout();
      heightReduction = 0;
      widthReduction = this.sessionsContainer.offsetWidth;
    } else {
      let sessionsHeight;
      if (this.sessionsViewerLimited) {
        sessionsHeight = this.sessionsCount * AgentSessionsListDelegate.ITEM_HEIGHT;
      } else {
        sessionsHeight = availableSessionsHeight;
      }
      sessionsHeight = Math.min(availableSessionsHeight, sessionsHeight);
      this.sessionsControlContainer.style.height = `${sessionsHeight}px`;
      this.sessionsControlContainer.style.width = ``;
      this.sessionsControl.layout(sessionsHeight, width);
      heightReduction = this.sessionsContainer.offsetHeight;
      widthReduction = 0;
    }
    return { heightReduction, widthReduction };
  }
  computeEffectiveSideBySideSessionsSidebarWidth(width, sessionsViewerSidebarWidth = this.sessionsViewerSidebarWidth) {
    return Math.max(
      ChatViewPane_1.SESSIONS_SIDEBAR_MIN_WIDTH,
      // never smaller than min width for side by side sessions
      Math.min(
        sessionsViewerSidebarWidth,
        width - ChatViewPane_1.CHAT_WIDGET_DEFAULT_WIDTH
        // never so wide that chat widget is smaller than default width
      )
    );
  }
  getLastDimensions(orientation) {
    return this.lastDimensionsPerOrientation.get(orientation);
  }
  createSessionsViewerSash(container, height, width) {
    const disposables = this.sessionsViewerSashDisposables.value = new DisposableStore();
    const sash = this.sessionsViewerSash = disposables.add(new Sash(container, {
      getVerticalSashLeft: /* @__PURE__ */ __name(() => {
        const sessionsViewerSidebarWidth = this.computeEffectiveSideBySideSessionsSidebarWidth(this.lastDimensions?.width ?? width);
        const { position } = this.getViewPositionAndLocation();
        if (position === 1) {
          return (this.lastDimensions?.width ?? width) - sessionsViewerSidebarWidth;
        }
        return sessionsViewerSidebarWidth;
      }, "getVerticalSashLeft")
    }, {
      orientation: 0
      /* Orientation.VERTICAL */
    }));
    let sashStartWidth;
    disposables.add(sash.onDidStart(() => sashStartWidth = this.sessionsViewerSidebarWidth));
    disposables.add(sash.onDidEnd(() => sashStartWidth = void 0));
    disposables.add(sash.onDidChange((e) => {
      if (sashStartWidth === void 0 || !this.lastDimensions) {
        return;
      }
      const { position } = this.getViewPositionAndLocation();
      const delta = e.currentX - e.startX;
      const newWidth = position === 1 ? sashStartWidth - delta : sashStartWidth + delta;
      this.sessionsViewerSidebarWidth = this.computeEffectiveSideBySideSessionsSidebarWidth(this.lastDimensions.width, newWidth);
      this.viewState.sessionsSidebarWidth = this.sessionsViewerSidebarWidth;
      this.layoutBody(this.lastDimensions.height, this.lastDimensions.width);
    }));
    disposables.add(sash.onDidReset(() => {
      this.sessionsViewerSidebarWidth = ChatViewPane_1.SESSIONS_SIDEBAR_DEFAULT_WIDTH;
      this.viewState.sessionsSidebarWidth = this.sessionsViewerSidebarWidth;
      this.relayout();
    }));
  }
  //#endregion
  saveState() {
    if (this._widget?.viewModel) {
      this._widget.saveState();
      this.updateViewState();
      this.memento.saveMemento();
    }
    super.saveState();
  }
  updateViewState(viewState) {
    const newViewState = viewState ?? this._widget.getViewState();
    if (newViewState) {
      for (const [key, value] of Object.entries(newViewState)) {
        this.viewState[key] = value;
      }
    }
  }
  shouldShowWelcome() {
    const noPersistedSessions = !this.chatService.hasSessions();
    const hasCoreAgent = this.chatAgentService.getAgents().some((agent) => agent.isCore && agent.locations.includes(ChatAgentLocation.Chat));
    const hasDefaultAgent = this.chatAgentService.getDefaultAgent(ChatAgentLocation.Chat) !== void 0;
    const shouldShow = !hasCoreAgent && (!hasDefaultAgent || !this._widget?.viewModel && noPersistedSessions);
    this.logService.trace(`ChatViewPane#shouldShowWelcome() = ${shouldShow}: hasCoreAgent=${hasCoreAgent} hasDefaultAgent=${hasDefaultAgent} || noViewModel=${!this._widget?.viewModel} && noPersistedSessions=${noPersistedSessions}`);
    return !!shouldShow;
  }
  getActionsContext() {
    return this._widget?.viewModel ? {
      sessionResource: this._widget.viewModel.sessionResource,
      $mid: 19
      /* MarshalledId.ChatViewContext */
    } : void 0;
  }
};
ChatViewPane = ChatViewPane_1 = __decorate([
  __param(1, IKeybindingService),
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IContextKeyService),
  __param(5, IViewDescriptorService),
  __param(6, IInstantiationService),
  __param(7, IOpenerService),
  __param(8, IThemeService),
  __param(9, IHoverService),
  __param(10, IStorageService),
  __param(11, IChatService),
  __param(12, IChatAgentService),
  __param(13, ILogService),
  __param(14, IWorkbenchLayoutService),
  __param(15, IChatSessionsService),
  __param(16, ITelemetryService),
  __param(17, ILifecycleService),
  __param(18, IProgressService),
  __param(19, IAgentSessionsService),
  __param(20, IChatEntitlementService),
  __param(21, ICommandService)
], ChatViewPane);
export {
  ChatViewPane
};
//# sourceMappingURL=chatViewPane.js.map
