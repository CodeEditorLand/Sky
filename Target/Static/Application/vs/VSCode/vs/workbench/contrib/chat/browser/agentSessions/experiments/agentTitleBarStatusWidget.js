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
import "./media/agenttitlebarstatuswidget.css";
import { $, addDisposableListener, EventType, getWindow, isHTMLElement, reset } from "../../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Event as EventUtils } from "../../../../../../base/common/event.js";
import { localize } from "../../../../../../nls.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { getDefaultHoverDelegate } from "../../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { AgentStatusMode, IAgentTitleBarStatusService } from "./agentTitleBarStatusService.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import { EnterAgentSessionProjectionAction, ExitAgentSessionProjectionAction } from "./agentSessionProjectionActions.js";
import { UNIFIED_QUICK_ACCESS_ACTION_ID } from "./unifiedQuickAccessActions.js";
import { IAgentSessionsService } from "../agentSessionsService.js";
import { isSessionInProgressStatus } from "../agentSessionsModel.js";
import { BaseActionViewItem } from "../../../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Separator, SubmenuAction, toAction } from "../../../../../../base/common/actions.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../../../services/environment/browser/environmentService.js";
import { IEditorGroupsService } from "../../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { renderAsPlaintext } from "../../../../../../base/browser/markdownRenderer.js";
import { openSession } from "../agentSessionsOpener.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IMenuService, MenuId, MenuItemAction, SubmenuItemAction } from "../../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { WorkbenchToolBar } from "../../../../../../platform/actions/browser/toolbar.js";
import { DropdownWithPrimaryActionViewItem } from "../../../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js";
import { createActionViewItem } from "../../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import { FocusAgentSessionsAction } from "../agentSessionsActions.js";
import { IActionViewItemService } from "../../../../../../platform/actions/browser/actionViewItemService.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { mainWindow } from "../../../../../../base/browser/window.js";
import { ChatConfiguration } from "../../../common/constants.js";
import { ChatEntitlement, IChatEntitlementService } from "../../../../../services/chat/common/chatEntitlementService.js";
import { IChatWidgetService } from "../../chat.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.js";
const TOGGLE_CHAT_ACTION_ID = "workbench.action.chat.toggle";
const CHAT_SETUP_ACTION_ID = "workbench.action.chat.triggerSetup";
const OPEN_CHAT_QUOTA_EXCEEDED_DIALOG = "workbench.action.chat.openQuotaExceededDialog";
const QUICK_OPEN_ACTION_ID = "workbench.action.quickOpenWithModes";
const FILTER_STORAGE_KEY = "agentSessions.filterExcludes.agentsessionsviewerfiltersubmenu";
const PREVIOUS_FILTER_STORAGE_KEY = "agentSessions.filterExcludes.previousUserFilter";
const NLS_EXTENSION_HOST = localize("devExtensionWindowTitlePrefix", "[Extension Development Host]");
const TITLE_DIRTY = "\u25CF ";
let AgentTitleBarStatusWidget = class AgentTitleBarStatusWidget2 extends BaseActionViewItem {
  static {
    __name(this, "AgentTitleBarStatusWidget");
  }
  constructor(action, options, instantiationService, agentTitleBarStatusService, hoverService, commandService, keybindingService, agentSessionsService, labelService, workspaceContextService, environmentService, editorGroupsService, editorService, menuService, contextKeyService, storageService, configurationService, chatEntitlementService, chatWidgetService, telemetryService) {
    super(void 0, action, options);
    this.instantiationService = instantiationService;
    this.agentTitleBarStatusService = agentTitleBarStatusService;
    this.hoverService = hoverService;
    this.commandService = commandService;
    this.keybindingService = keybindingService;
    this.agentSessionsService = agentSessionsService;
    this.labelService = labelService;
    this.workspaceContextService = workspaceContextService;
    this.environmentService = environmentService;
    this.editorGroupsService = editorGroupsService;
    this.editorService = editorService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.chatEntitlementService = chatEntitlementService;
    this.chatWidgetService = chatWidgetService;
    this.telemetryService = telemetryService;
    this._dynamicDisposables = this._register(new DisposableStore());
    this._isRendering = false;
    this._badgeFilterAppliedByThisWindow = null;
    this._commandCenterMenu = this._register(this.menuService.createMenu(MenuId.CommandCenterCenter, this.contextKeyService));
    this._chatTitleBarMenu = this._register(this.menuService.createMenu(MenuId.ChatTitleBarMenu, this.contextKeyService));
    this._register(this.agentTitleBarStatusService.onDidChangeMode(() => {
      this._render();
    }));
    this._register(this.agentTitleBarStatusService.onDidChangeSessionInfo(() => {
      this._render();
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => {
      this._render();
    }));
    this._register(this.editorService.onDidActiveEditorChange(() => {
      this._render();
    }));
    this._register(this.editorGroupsService.onDidChangeEditorPartOptions(({ newPartOptions, oldPartOptions }) => {
      if (newPartOptions.showTabs !== oldPartOptions.showTabs) {
        this._render();
      }
    }));
    this._register(this._commandCenterMenu.onDidChange(() => {
      this._lastRenderState = void 0;
      this._render();
    }));
    this._register(this.storageService.onDidChangeValue(0, "agentSessions.filterExcludes.agentsessionsviewerfiltersubmenu", this._store)(() => {
      this._render();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatConfiguration.UnifiedAgentsBar) || e.affectsConfiguration(ChatConfiguration.AgentStatusEnabled) || e.affectsConfiguration(ChatConfiguration.ChatViewSessionsEnabled)) {
        this._lastRenderState = void 0;
        this._render();
      }
    }));
    this._register(EventUtils.any(this.chatEntitlementService.onDidChangeSentiment, this.chatEntitlementService.onDidChangeQuotaExceeded, this.chatEntitlementService.onDidChangeEntitlement, this.chatEntitlementService.onDidChangeAnonymous)(() => {
      this._lastRenderState = void 0;
      this._render();
    }));
    this._register(this.chatWidgetService.onDidAddWidget(() => {
      this._render();
    }));
    this._register(this.chatWidgetService.onDidBackgroundSession(() => {
      this._render();
    }));
  }
  render(container) {
    super.render(container);
    this._container = container;
    container.classList.add("agent-status-container");
    container.tabIndex = -1;
    this._render();
  }
  // Override focus methods - the container itself shouldn't be focusable,
  // focus is handled by the inner interactive elements (badge sections)
  setFocusable(_focusable) {
  }
  focus() {
    this._firstFocusableElement?.focus();
  }
  blur() {
    if (!this._container) {
      return;
    }
    const activeElement = getWindow(this._container).document.activeElement;
    if (isHTMLElement(activeElement) && this._container.contains(activeElement)) {
      activeElement.blur();
    }
  }
  _render() {
    if (!this._container) {
      return;
    }
    if (this._isRendering) {
      return;
    }
    this._isRendering = true;
    try {
      const mode = this.agentTitleBarStatusService.mode;
      const sessionInfo = this.agentTitleBarStatusService.sessionInfo;
      const { activeSessions, unreadSessions, attentionNeededSessions } = this._getSessionStats();
      const attentionSession = attentionNeededSessions.length > 0 ? [...attentionNeededSessions].sort((a, b) => {
        const timeA = a.timing.lastRequestStarted ?? a.timing.created;
        const timeB = b.timing.lastRequestStarted ?? b.timing.created;
        return timeB - timeA;
      })[0] : void 0;
      const attentionText = attentionSession?.description ? typeof attentionSession.description === "string" ? attentionSession.description : renderAsPlaintext(attentionSession.description) : attentionSession?.label;
      const label = this._getLabel();
      const { isFilteredToUnread, isFilteredToInProgress } = this._getCurrentFilterState();
      const unifiedAgentsBarEnabled = this.configurationService.getValue(ChatConfiguration.UnifiedAgentsBar) === true;
      const agentStatusEnabled = this.configurationService.getValue(ChatConfiguration.AgentStatusEnabled) === true;
      const viewSessionsEnabled = this.configurationService.getValue(ChatConfiguration.ChatViewSessionsEnabled) !== false;
      const stateKey = JSON.stringify({
        mode,
        sessionTitle: sessionInfo?.title,
        activeCount: activeSessions.length,
        unreadCount: unreadSessions.length,
        attentionCount: attentionNeededSessions.length,
        attentionText,
        label,
        isFilteredToUnread,
        isFilteredToInProgress,
        unifiedAgentsBarEnabled,
        agentStatusEnabled,
        viewSessionsEnabled
      });
      if (this._lastRenderState === stateKey) {
        return;
      }
      this._lastRenderState = stateKey;
      reset(this._container);
      this._dynamicDisposables.clear();
      this._firstFocusableElement = void 0;
      if (this.agentTitleBarStatusService.mode === AgentStatusMode.Session) {
        this._renderSessionMode(this._dynamicDisposables);
      } else if (this.agentTitleBarStatusService.mode === AgentStatusMode.SessionReady) {
        this._renderSessionReadyMode(this._dynamicDisposables);
      } else if (unifiedAgentsBarEnabled) {
        this._renderChatInputMode(this._dynamicDisposables);
      } else if (agentStatusEnabled) {
        this._renderBadgeOnlyMode(this._dynamicDisposables);
      }
    } finally {
      this._isRendering = false;
    }
  }
  // #region Session Statistics
  /**
   * Get computed session statistics for rendering.
   * Respects the current provider (session type) filter when calculating counts.
   */
  _getSessionStats() {
    const sessions = this.agentSessionsService.model.sessions;
    const currentFilter = this._getStoredFilter();
    const excludedProviders = currentFilter?.providers ?? [];
    const filteredSessions = excludedProviders.length > 0 ? sessions.filter((s) => !excludedProviders.includes(s.providerType)) : sessions;
    const activeSessions = filteredSessions.filter((s) => isSessionInProgressStatus(s.status) && !s.isArchived());
    const unreadSessions = filteredSessions.filter((s) => !s.isRead());
    const attentionNeededSessions = filteredSessions.filter((s) => s.status === 3 && !this.chatWidgetService.getWidgetBySessionResource(s.resource));
    return {
      activeSessions,
      unreadSessions,
      attentionNeededSessions,
      hasActiveSessions: activeSessions.length > 0,
      hasUnreadSessions: unreadSessions.length > 0,
      hasAttentionNeeded: attentionNeededSessions.length > 0
    };
  }
  // #endregion
  // #region Mode Renderers
  _renderChatInputMode(disposables) {
    if (!this._container) {
      return;
    }
    const { activeSessions, unreadSessions, attentionNeededSessions, hasAttentionNeeded } = this._getSessionStats();
    this._renderCommandCenterToolbar(disposables);
    const pill = $("div.agent-status-pill.chat-input-mode");
    if (hasAttentionNeeded) {
      pill.classList.add("needs-attention");
    }
    pill.setAttribute("role", "button");
    pill.setAttribute("aria-label", localize("openQuickAccess", "Open Quick Access"));
    pill.tabIndex = 0;
    this._firstFocusableElement = pill;
    this._container.appendChild(pill);
    const leftIcon = $("span.agent-status-left-icon");
    if (hasAttentionNeeded) {
      const reportIcon = renderIcon(Codicon.report);
      const countSpan = $("span.agent-status-attention-count");
      countSpan.textContent = String(attentionNeededSessions.length);
      reset(leftIcon, reportIcon, countSpan);
      leftIcon.classList.add("has-attention");
    } else {
      reset(leftIcon, renderIcon(Codicon.searchSparkle));
    }
    pill.appendChild(leftIcon);
    const label = $("span.agent-status-label");
    const { session: attentionSession, progress: progressText } = this._getSessionNeedingAttention(attentionNeededSessions);
    this._displayedSession = attentionSession;
    const defaultLabel = progressText ?? this._getLabel();
    if (progressText) {
      label.classList.add("has-progress");
    }
    const hoverLabel = localize("askAnythingPlaceholder", "Ask anything or describe what to build");
    label.textContent = defaultLabel;
    pill.appendChild(label);
    const sendIcon = $("span.agent-status-send");
    reset(sendIcon, renderIcon(Codicon.send));
    sendIcon.classList.add("hidden");
    pill.appendChild(sendIcon);
    if (!progressText) {
      disposables.add(addDisposableListener(pill, EventType.MOUSE_ENTER, () => {
        reset(leftIcon, renderIcon(Codicon.searchSparkle));
        leftIcon.classList.remove("has-attention");
        label.textContent = hoverLabel;
        label.classList.remove("has-progress");
        sendIcon.classList.remove("hidden");
      }));
      disposables.add(addDisposableListener(pill, EventType.MOUSE_LEAVE, () => {
        reset(leftIcon, renderIcon(Codicon.searchSparkle));
        label.textContent = defaultLabel;
        sendIcon.classList.add("hidden");
      }));
    }
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, pill, () => {
      if (this._displayedSession) {
        return localize("openSessionTooltip", "Open session: {0}", this._displayedSession.label);
      }
      const kbForTooltip = this.keybindingService.lookupKeybinding(UNIFIED_QUICK_ACCESS_ACTION_ID)?.getLabel();
      return kbForTooltip ? localize("askTooltip", "Open Quick Access ({0})", kbForTooltip) : localize("askTooltip2", "Open Quick Access");
    }));
    disposables.add(addDisposableListener(pill, EventType.CLICK, (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._handlePillClick();
    }));
    disposables.add(addDisposableListener(pill, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        this._handlePillClick();
      }
    }));
    if (this.configurationService.getValue(ChatConfiguration.AgentStatusEnabled) === true) {
      this._renderStatusBadge(disposables, activeSessions, unreadSessions, attentionNeededSessions);
    }
  }
  _renderSessionMode(disposables) {
    if (!this._container) {
      return;
    }
    const { activeSessions, unreadSessions, attentionNeededSessions } = this._getSessionStats();
    this._renderCommandCenterToolbar(disposables);
    const pill = $("div.agent-status-pill.session-mode");
    this._container.appendChild(pill);
    this._renderSearchButton(disposables, pill);
    const titleLabel = $("span.agent-status-title");
    const sessionInfo = this.agentTitleBarStatusService.sessionInfo;
    titleLabel.textContent = sessionInfo?.title ?? localize("agentSessionProjection", "Agent Session Projection");
    pill.appendChild(titleLabel);
    this._renderEscapeButton(disposables, pill);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, pill, () => {
      const sessionInfo2 = this.agentTitleBarStatusService.sessionInfo;
      return sessionInfo2 ? localize("agentSessionProjectionTooltip", "Agent Session Projection: {0}", sessionInfo2.title) : localize("agentSessionProjection", "Agent Session Projection");
    }));
    const exitHandler = /* @__PURE__ */ __name((e) => {
      e.preventDefault();
      e.stopPropagation();
      this.commandService.executeCommand(ExitAgentSessionProjectionAction.ID);
    }, "exitHandler");
    disposables.add(addDisposableListener(pill, EventType.CLICK, exitHandler));
    disposables.add(addDisposableListener(pill, EventType.MOUSE_DOWN, exitHandler));
    if (this.configurationService.getValue(ChatConfiguration.AgentStatusEnabled) === true) {
      this._renderStatusBadge(disposables, activeSessions, unreadSessions, attentionNeededSessions);
    }
  }
  /**
   * Render session ready mode - shows session title + enter projection button.
   * Used when a projection-capable session is available but not yet entered.
   */
  _renderSessionReadyMode(disposables) {
    if (!this._container) {
      return;
    }
    const { activeSessions, unreadSessions, attentionNeededSessions } = this._getSessionStats();
    const pill = $("div.agent-status-pill.session-ready-mode");
    this._container.appendChild(pill);
    const titleLabel = $("span.agent-status-title");
    const sessionInfo = this.agentTitleBarStatusService.sessionInfo;
    titleLabel.textContent = sessionInfo?.title ?? localize("agentSessionReady", "Review Changes");
    pill.appendChild(titleLabel);
    this._renderEnterButton(disposables, pill);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, pill, () => {
      const sessionInfo2 = this.agentTitleBarStatusService.sessionInfo;
      return sessionInfo2 ? localize("agentSessionReadyTooltip", "Review changes from: {0}", sessionInfo2.title) : localize("agentSessionReadyGeneric", "Review agent session changes");
    }));
    const enterHandler = /* @__PURE__ */ __name((e) => {
      e.preventDefault();
      e.stopPropagation();
      const sessionInfo2 = this.agentTitleBarStatusService.sessionInfo;
      if (sessionInfo2) {
        const session = this.agentSessionsService.getSession(sessionInfo2.sessionResource);
        if (session) {
          this.commandService.executeCommand(EnterAgentSessionProjectionAction.ID, session);
        }
      }
    }, "enterHandler");
    disposables.add(addDisposableListener(pill, EventType.CLICK, enterHandler));
    disposables.add(addDisposableListener(pill, EventType.MOUSE_DOWN, enterHandler));
    if (this.configurationService.getValue(ChatConfiguration.AgentStatusEnabled) === true) {
      this._renderStatusBadge(disposables, activeSessions, unreadSessions, attentionNeededSessions);
    }
  }
  /**
   * Render badge-only mode - just the status badge without the full pill.
   * Used when Agent Status is enabled but Enhanced Agent Status is not.
   */
  _renderBadgeOnlyMode(disposables) {
    if (!this._container) {
      return;
    }
    const { activeSessions, unreadSessions, attentionNeededSessions } = this._getSessionStats();
    this._renderStatusBadge(disposables, activeSessions, unreadSessions, attentionNeededSessions);
  }
  // #endregion
  // #region Reusable Components
  /**
   * Render command center toolbar items (like debug toolbar) that are registered to CommandCenter
   * Filters out the quick open action since we provide our own search UI.
   * Adds a dot separator after the toolbar if content was rendered.
   */
  _renderCommandCenterToolbar(disposables) {
    if (!this._container) {
      return;
    }
    const allActions = [];
    for (const [, actions] of this._commandCenterMenu.getActions({ shouldForwardArgs: true })) {
      for (const action of actions) {
        if (action.id === QUICK_OPEN_ACTION_ID) {
          continue;
        }
        if (action instanceof SubmenuAction) {
          allActions.push(...action.actions);
        } else {
          allActions.push(action);
        }
      }
    }
    if (allActions.length === 0) {
      return;
    }
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    const toolbarContainer = $("div.agent-status-command-center-toolbar");
    this._container.appendChild(toolbarContainer);
    const toolbar = this.instantiationService.createInstance(WorkbenchToolBar, toolbarContainer, {
      hiddenItemStrategy: -1,
      telemetrySource: "agentStatusCommandCenter",
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        return createActionViewItem(this.instantiationService, action, { ...options, hoverDelegate });
      }, "actionViewItemProvider")
    });
    disposables.add(toolbar);
    toolbar.setActions(allActions);
    const separator = renderIcon(Codicon.circleSmallFilled);
    separator.classList.add("agent-status-separator");
    this._container.appendChild(separator);
  }
  /**
   * Render the search button. If parent is provided, appends to parent; otherwise appends to container.
   */
  _renderSearchButton(disposables, parent) {
    const container = parent ?? this._container;
    if (!container) {
      return;
    }
    const searchButton = $("span.agent-status-search");
    reset(searchButton, renderIcon(Codicon.searchSparkle));
    searchButton.setAttribute("role", "button");
    searchButton.setAttribute("aria-label", localize("openQuickOpen", "Open Quick Open"));
    searchButton.tabIndex = 0;
    if (!this._firstFocusableElement) {
      this._firstFocusableElement = searchButton;
    }
    container.appendChild(searchButton);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    const searchKb = this.keybindingService.lookupKeybinding(QUICK_OPEN_ACTION_ID)?.getLabel();
    const searchTooltip = searchKb ? localize("openQuickOpenTooltip", "Go to File ({0})", searchKb) : localize("openQuickOpenTooltip2", "Go to File");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, searchButton, searchTooltip));
    disposables.add(addDisposableListener(searchButton, EventType.CLICK, (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.commandService.executeCommand(QUICK_OPEN_ACTION_ID);
    }));
    disposables.add(addDisposableListener(searchButton, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        this.commandService.executeCommand(QUICK_OPEN_ACTION_ID);
      }
    }));
  }
  /**
   * Render the status badge showing in-progress, needs-input, and/or unread session counts.
   * Shows split UI with sparkle icon on left, then unread, needs-input, and active indicators.
   * Always renders the sparkle icon section.
   */
  _renderStatusBadge(disposables, activeSessions, unreadSessions, attentionNeededSessions) {
    if (!this._container) {
      return;
    }
    const hasActiveSessions = activeSessions.length > 0;
    const hasUnreadSessions = unreadSessions.length > 0;
    const hasAttentionNeeded = attentionNeededSessions.length > 0;
    this._clearFilterIfCategoryEmpty(hasUnreadSessions, hasActiveSessions);
    const badge = $("div.agent-status-badge");
    this._container.appendChild(badge);
    const sparkleContainer = $("span.agent-status-badge-section.sparkle");
    sparkleContainer.tabIndex = 0;
    if (!this._firstFocusableElement) {
      this._firstFocusableElement = sparkleContainer;
    }
    badge.appendChild(sparkleContainer);
    const menuActions = Separator.join(...this._chatTitleBarMenu.getActions({ shouldForwardArgs: true }).map(([, actions]) => actions));
    const chatSentiment = this.chatEntitlementService.sentiment;
    const chatQuotaExceeded = this.chatEntitlementService.quotas.chat?.percentRemaining === 0;
    const signedOut = this.chatEntitlementService.entitlement === ChatEntitlement.Unknown;
    const anonymous = this.chatEntitlementService.anonymous;
    const free = this.chatEntitlementService.entitlement === ChatEntitlement.Free;
    let primaryActionId = TOGGLE_CHAT_ACTION_ID;
    let primaryActionTitle = localize("toggleChat", "Toggle Chat");
    let primaryActionIcon = Codicon.chatSparkle;
    if (chatSentiment.installed && !chatSentiment.disabled) {
      if (signedOut && !anonymous) {
        primaryActionId = CHAT_SETUP_ACTION_ID;
        primaryActionTitle = localize("signInToChatSetup", "Sign in to use AI features...");
        primaryActionIcon = Codicon.chatSparkleError;
      } else if (chatQuotaExceeded && free) {
        primaryActionId = OPEN_CHAT_QUOTA_EXCEEDED_DIALOG;
        primaryActionTitle = localize("chatQuotaExceededButton", "GitHub Copilot Free plan chat messages quota reached. Click for details.");
        primaryActionIcon = Codicon.chatSparkleWarning;
      }
    }
    const primaryAction = this.instantiationService.createInstance(MenuItemAction, {
      id: primaryActionId,
      title: primaryActionTitle,
      icon: primaryActionIcon
    }, void 0, void 0, void 0, void 0);
    const dropdownAction = toAction({
      id: "agentStatus.sparkle.dropdown",
      label: localize("agentStatus.sparkle.dropdown", "More Actions"),
      run() {
      }
    });
    const sparkleDropdown = this.instantiationService.createInstance(DropdownWithPrimaryActionViewItem, primaryAction, dropdownAction, menuActions, "agent-status-sparkle-dropdown", { skipTelemetry: true });
    sparkleDropdown.render(sparkleContainer);
    disposables.add(sparkleDropdown);
    disposables.add(addDisposableListener(sparkleContainer, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        this.commandService.executeCommand(primaryActionId);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        sparkleDropdown.showDropdown();
      }
    }));
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    const viewSessionsEnabled = this.configurationService.getValue(ChatConfiguration.ChatViewSessionsEnabled) !== false;
    if (viewSessionsEnabled && hasUnreadSessions && this.workspaceContextService.getWorkbenchState() !== 1) {
      const { isFilteredToUnread } = this._getCurrentFilterState();
      const unreadSection = $("span.agent-status-badge-section.unread");
      if (isFilteredToUnread) {
        unreadSection.classList.add("filtered");
      }
      unreadSection.setAttribute("role", "button");
      unreadSection.tabIndex = 0;
      const unreadIcon = $("span.agent-status-icon");
      reset(unreadIcon, renderIcon(Codicon.circleFilled));
      unreadSection.appendChild(unreadIcon);
      const unreadCount = $("span.agent-status-text");
      unreadCount.textContent = String(unreadSessions.length);
      unreadSection.appendChild(unreadCount);
      badge.appendChild(unreadSection);
      disposables.add(addDisposableListener(unreadSection, EventType.CLICK, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._openSessionsWithFilter("unread");
      }));
      disposables.add(addDisposableListener(unreadSection, EventType.KEY_DOWN, (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          this._openSessionsWithFilter("unread");
        }
      }));
      const unreadTooltip = unreadSessions.length === 1 ? localize("unreadSessionsTooltip1", "{0} unread session", unreadSessions.length) : localize("unreadSessionsTooltip", "{0} unread sessions", unreadSessions.length);
      disposables.add(this.hoverService.setupManagedHover(hoverDelegate, unreadSection, unreadTooltip));
    }
    if (viewSessionsEnabled && hasActiveSessions) {
      const { isFilteredToInProgress } = this._getCurrentFilterState();
      const activeSection = $("span.agent-status-badge-section.active");
      if (hasAttentionNeeded) {
        activeSection.classList.add("needs-input");
      }
      if (isFilteredToInProgress) {
        activeSection.classList.add("filtered");
      }
      activeSection.setAttribute("role", "button");
      activeSection.tabIndex = 0;
      const statusIcon = $("span.agent-status-icon");
      reset(statusIcon, renderIcon(hasAttentionNeeded ? Codicon.report : Codicon.sessionInProgress));
      activeSection.appendChild(statusIcon);
      const statusCount = $("span.agent-status-text");
      statusCount.textContent = String(hasAttentionNeeded ? attentionNeededSessions.length : activeSessions.length);
      activeSection.appendChild(statusCount);
      badge.appendChild(activeSection);
      disposables.add(addDisposableListener(activeSection, EventType.CLICK, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._openSessionsWithFilter("inProgress");
      }));
      disposables.add(addDisposableListener(activeSection, EventType.KEY_DOWN, (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          this._openSessionsWithFilter("inProgress");
        }
      }));
      const activeTooltip = hasAttentionNeeded ? attentionNeededSessions.length === 1 ? localize("needsInputSessionsTooltip1", "{0} session needs input", attentionNeededSessions.length) : localize("needsInputSessionsTooltip", "{0} sessions need input", attentionNeededSessions.length) : activeSessions.length === 1 ? localize("activeSessionsTooltip1", "{0} session in progress", activeSessions.length) : localize("activeSessionsTooltip", "{0} sessions in progress", activeSessions.length);
      disposables.add(this.hoverService.setupManagedHover(hoverDelegate, activeSection, activeTooltip));
    }
  }
  /**
   * Clear the filter if the currently filtered category becomes empty.
   * For example, if filtered to "unread" but no unread sessions exist, restore user's previous filter.
   * Only auto-clears if THIS window applied the badge filter to avoid cross-window interference.
   */
  _clearFilterIfCategoryEmpty(hasUnreadSessions, hasActiveSessions) {
    if (this._badgeFilterAppliedByThisWindow === "unread" && !hasUnreadSessions) {
      this._restoreUserFilter();
    } else if (this._badgeFilterAppliedByThisWindow === "inProgress" && !hasActiveSessions) {
      this._restoreUserFilter();
    }
  }
  /**
   * Get the current filter state from storage.
   */
  _getCurrentFilterState() {
    const filter = this._getStoredFilter();
    if (!filter) {
      return { isFilteredToUnread: false, isFilteredToInProgress: false };
    }
    const isFilteredToUnread = filter.read === true && filter.states.length === 0;
    const isFilteredToInProgress = filter.states?.length === 2 && filter.read === false;
    return { isFilteredToUnread, isFilteredToInProgress };
  }
  /**
   * Get the stored filter object from storage.
   */
  _getStoredFilter() {
    const filterStr = this.storageService.get(
      FILTER_STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (!filterStr) {
      return void 0;
    }
    try {
      return JSON.parse(filterStr);
    } catch {
      return void 0;
    }
  }
  /**
   * Store a filter object to storage.
   */
  _storeFilter(filter) {
    this.storageService.store(
      FILTER_STORAGE_KEY,
      JSON.stringify(filter),
      0,
      0
      /* StorageTarget.USER */
    );
  }
  /**
   * Clear all filters (reset to default).
   */
  _clearFilter() {
    this._storeFilter({
      providers: [],
      states: [],
      archived: true,
      read: false
    });
  }
  /**
   * Save the current user filter before we override it with a badge filter.
   * Only saves if the current filter is NOT already a badge filter (unread or in-progress).
   * This preserves the original user filter when switching between badge filters.
   */
  _saveUserFilter() {
    const { isFilteredToUnread, isFilteredToInProgress } = this._getCurrentFilterState();
    if (isFilteredToUnread || isFilteredToInProgress) {
      return;
    }
    const currentFilter = this._getStoredFilter();
    if (currentFilter) {
      this.storageService.store(
        PREVIOUS_FILTER_STORAGE_KEY,
        JSON.stringify(currentFilter),
        0,
        0
        /* StorageTarget.USER */
      );
    }
  }
  /**
   * Restore the user's previous filter (saved before we applied a badge filter).
   */
  _restoreUserFilter() {
    const previousFilterStr = this.storageService.get(
      PREVIOUS_FILTER_STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (previousFilterStr) {
      try {
        const previousFilter = JSON.parse(previousFilterStr);
        this._storeFilter(previousFilter);
      } catch {
        this._clearFilter();
      }
    } else {
      this._clearFilter();
    }
    this.storageService.remove(
      PREVIOUS_FILTER_STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    this._badgeFilterAppliedByThisWindow = null;
  }
  /**
   * Opens the agent sessions view with a specific filter applied, or restores previous filter if already applied.
   * Preserves session type (provider) filters while toggling only status filters.
   * @param filterType 'unread' to show only unread sessions, 'inProgress' to show only in-progress sessions
   */
  _openSessionsWithFilter(filterType) {
    const { isFilteredToUnread, isFilteredToInProgress } = this._getCurrentFilterState();
    const currentFilter = this._getStoredFilter();
    const preservedProviders = currentFilter?.providers ?? [];
    const isToggleOff = filterType === "unread" && isFilteredToUnread || filterType === "inProgress" && isFilteredToInProgress;
    this.telemetryService.publicLog2("agentStatusWidget.click", {
      source: filterType,
      action: isToggleOff ? "clearFilter" : "applyFilter"
    });
    if (filterType === "unread") {
      if (isFilteredToUnread) {
        this._restoreUserFilter();
      } else {
        this._saveUserFilter();
        this._storeFilter({
          providers: preservedProviders,
          states: [],
          archived: true,
          read: true
        });
        this._badgeFilterAppliedByThisWindow = "unread";
      }
    } else {
      if (isFilteredToInProgress) {
        this._restoreUserFilter();
      } else {
        this._saveUserFilter();
        this._storeFilter({
          providers: preservedProviders,
          states: [
            1,
            0
            /* AgentSessionStatus.Failed */
          ],
          archived: true,
          read: false
        });
        this._badgeFilterAppliedByThisWindow = "inProgress";
      }
    }
    this.commandService.executeCommand(FocusAgentSessionsAction.id);
  }
  /**
   * Render the escape button for exiting session projection mode.
   */
  _renderEscapeButton(disposables, parent) {
    const escButton = $("span.agent-status-esc-button");
    escButton.textContent = "Esc";
    escButton.setAttribute("role", "button");
    escButton.setAttribute("aria-label", localize("exitAgentSessionProjection", "Exit Agent Session Projection"));
    escButton.tabIndex = 0;
    parent.appendChild(escButton);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, escButton, localize("exitAgentSessionProjectionTooltip", "Exit Agent Session Projection (Escape)")));
    disposables.add(addDisposableListener(escButton, EventType.MOUSE_DOWN, (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.commandService.executeCommand(ExitAgentSessionProjectionAction.ID);
    }));
    disposables.add(addDisposableListener(escButton, EventType.CLICK, (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.commandService.executeCommand(ExitAgentSessionProjectionAction.ID);
    }));
    disposables.add(addDisposableListener(escButton, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        this.commandService.executeCommand(ExitAgentSessionProjectionAction.ID);
      }
    }));
  }
  /**
   * Render the enter button for entering session projection mode.
   */
  _renderEnterButton(disposables, parent) {
    const enterButton = $("span.agent-status-enter-button");
    const keybinding = this.keybindingService.lookupKeybinding(EnterAgentSessionProjectionAction.ID);
    enterButton.textContent = keybinding?.getLabel() ?? localize("review", "Review");
    enterButton.setAttribute("role", "button");
    enterButton.setAttribute("aria-label", localize("enterAgentSessionProjection", "Enter Agent Session Projection"));
    enterButton.tabIndex = 0;
    if (!this._firstFocusableElement) {
      this._firstFocusableElement = enterButton;
    }
    parent.appendChild(enterButton);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    const hoverText = keybinding ? localize("enterAgentSessionProjectionTooltip", "Review Changes ({0})", keybinding.getLabel()) : localize("enterAgentSessionProjectionTooltipNoKey", "Review Changes");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, enterButton, hoverText));
    const enterProjection = /* @__PURE__ */ __name((e) => {
      e.preventDefault();
      e.stopPropagation();
      const sessionInfo = this.agentTitleBarStatusService.sessionInfo;
      if (sessionInfo) {
        const session = this.agentSessionsService.getSession(sessionInfo.sessionResource);
        if (session) {
          this.commandService.executeCommand(EnterAgentSessionProjectionAction.ID, session);
        }
      }
    }, "enterProjection");
    disposables.add(addDisposableListener(enterButton, EventType.MOUSE_DOWN, enterProjection));
    disposables.add(addDisposableListener(enterButton, EventType.CLICK, enterProjection));
    disposables.add(addDisposableListener(enterButton, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        enterProjection(e);
      }
    }));
  }
  // #endregion
  // #region Click Handlers
  /**
   * Handle pill click - opens the displayed session if showing progress, otherwise opens unified quick access
   */
  _handlePillClick() {
    if (this._displayedSession) {
      this.telemetryService.publicLog2("agentStatusWidget.click", {
        source: "pill",
        action: "openSession"
      });
      this.instantiationService.invokeFunction(openSession, this._displayedSession);
    } else {
      this.telemetryService.publicLog2("agentStatusWidget.click", {
        source: "pill",
        action: "quickAccess"
      });
      this.commandService.executeCommand(UNIFIED_QUICK_ACCESS_ACTION_ID);
    }
  }
  // #endregion
  // #region Session Helpers
  /**
   * Get the session most urgently needing user attention (approval/confirmation/input).
   * Returns undefined if no sessions need attention.
   */
  _getSessionNeedingAttention(attentionNeededSessions) {
    if (attentionNeededSessions.length === 0) {
      return { session: void 0, progress: void 0 };
    }
    const sorted = [...attentionNeededSessions].sort((a, b) => {
      const timeA = a.timing.lastRequestStarted ?? a.timing.created;
      const timeB = b.timing.lastRequestStarted ?? b.timing.created;
      return timeB - timeA;
    });
    const mostRecent = sorted[0];
    if (!mostRecent.description) {
      return { session: mostRecent, progress: mostRecent.label };
    }
    const progress = typeof mostRecent.description === "string" ? mostRecent.description : renderAsPlaintext(mostRecent.description);
    return { session: mostRecent, progress };
  }
  // #endregion
  // #region Label Helpers
  /**
   * Compute the label to display, matching the command center behavior.
   * Includes prefix and suffix decorations (remote host, extension dev host, etc.)
   */
  _getLabel() {
    const { prefix, suffix } = this._getTitleDecorations();
    let label = this.labelService.getWorkspaceLabel(this.workspaceContextService.getWorkspace());
    if (this.editorGroupsService.partOptions.showTabs === "none") {
      const activeEditor = this.editorService.activeEditor;
      if (activeEditor) {
        const dirty = activeEditor.isDirty() && !activeEditor.isSaving() ? TITLE_DIRTY : "";
        label = `${dirty}${activeEditor.getTitle(
          0
          /* Verbosity.SHORT */
        )}`;
      }
    }
    if (!label) {
      label = localize("agentStatusWidget.askAnything", "Ask anything...");
    }
    if (prefix) {
      label = localize("label1", "{0} {1}", prefix, label);
    }
    if (suffix) {
      label = localize("label2", "{0} {1}", label, suffix);
    }
    return label.replaceAll(/\r\n|\r|\n/g, "\u23CE");
  }
  /**
   * Get prefix and suffix decorations for the title (matching WindowTitle behavior)
   */
  _getTitleDecorations() {
    let prefix;
    const suffix = void 0;
    if (this.environmentService.remoteAuthority) {
      prefix = this.labelService.getHostLabel(Schemas.vscodeRemote, this.environmentService.remoteAuthority);
    }
    if (this.environmentService.isExtensionDevelopment) {
      prefix = !prefix ? NLS_EXTENSION_HOST : `${NLS_EXTENSION_HOST} - ${prefix}`;
    }
    return { prefix, suffix };
  }
};
AgentTitleBarStatusWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IAgentTitleBarStatusService),
  __param(4, IHoverService),
  __param(5, ICommandService),
  __param(6, IKeybindingService),
  __param(7, IAgentSessionsService),
  __param(8, ILabelService),
  __param(9, IWorkspaceContextService),
  __param(10, IBrowserWorkbenchEnvironmentService),
  __param(11, IEditorGroupsService),
  __param(12, IEditorService),
  __param(13, IMenuService),
  __param(14, IContextKeyService),
  __param(15, IStorageService),
  __param(16, IConfigurationService),
  __param(17, IChatEntitlementService),
  __param(18, IChatWidgetService),
  __param(19, ITelemetryService)
], AgentTitleBarStatusWidget);
let AgentTitleBarStatusRendering = class AgentTitleBarStatusRendering2 extends Disposable {
  static {
    __name(this, "AgentTitleBarStatusRendering");
  }
  static {
    this.ID = "workbench.contrib.agentStatus.rendering";
  }
  constructor(actionViewItemService, instantiationService, configurationService) {
    super();
    this._register(actionViewItemService.register(MenuId.CommandCenter, MenuId.AgentsTitleBarControlMenu, (action, options) => {
      if (!(action instanceof SubmenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(AgentTitleBarStatusWidget, action, options);
    }, void 0));
    const updateClass = /* @__PURE__ */ __name(() => {
      const commandCenterEnabled = configurationService.getValue(
        "window.commandCenter"
        /* LayoutSettings.COMMAND_CENTER */
      ) === true;
      const enabled = configurationService.getValue(ChatConfiguration.AgentStatusEnabled) === true && commandCenterEnabled;
      const enhanced = configurationService.getValue(ChatConfiguration.UnifiedAgentsBar) === true && commandCenterEnabled;
      mainWindow.document.body.classList.toggle("agent-status-enabled", enabled);
      mainWindow.document.body.classList.toggle("unified-agents-bar", enhanced);
    }, "updateClass");
    updateClass();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatConfiguration.AgentStatusEnabled) || e.affectsConfiguration(ChatConfiguration.UnifiedAgentsBar) || e.affectsConfiguration(
        "window.commandCenter"
        /* LayoutSettings.COMMAND_CENTER */
      )) {
        updateClass();
      }
    }));
  }
};
AgentTitleBarStatusRendering = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IInstantiationService),
  __param(2, IConfigurationService)
], AgentTitleBarStatusRendering);
export {
  AgentTitleBarStatusRendering,
  AgentTitleBarStatusWidget
};
//# sourceMappingURL=agentTitleBarStatusWidget.js.map
