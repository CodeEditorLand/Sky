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
var AgentStatusWidget_1;
import "./media/agentStatusWidget.css";
import { $, addDisposableListener, EventType, reset } from "../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize } from "../../../../../nls.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { getDefaultHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { AgentStatusMode, IAgentStatusService } from "./agentStatusService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ExitAgentSessionProjectionAction } from "./agentSessionProjectionActions.js";
import { IAgentSessionsService } from "./agentSessionsService.js";
import { isSessionInProgressStatus } from "./agentSessionsModel.js";
import { BaseActionViewItem } from "../../../../../base/browser/ui/actionbar/actionViewItems.js";
import { SubmenuAction } from "../../../../../base/common/actions.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../../services/environment/browser/environmentService.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { Schemas } from "../../../../../base/common/network.js";
import { renderAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { openSession } from "./agentSessionsOpener.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IMenuService, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { WorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { createActionViewItem } from "../../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { FocusAgentSessionsAction } from "./agentSessionsActions.js";
const ACTION_ID = "workbench.action.quickchat.toggle";
const SEARCH_BUTTON_ACITON_ID = "workbench.action.quickOpenWithModes";
const NLS_EXTENSION_HOST = localize("devExtensionWindowTitlePrefix", "[Extension Development Host]");
const TITLE_DIRTY = "\u25CF ";
let AgentStatusWidget = class AgentStatusWidget2 extends BaseActionViewItem {
  static {
    __name(this, "AgentStatusWidget");
  }
  static {
    AgentStatusWidget_1 = this;
  }
  static {
    this._quickOpenCommandId = "workbench.action.quickOpenWithModes";
  }
  constructor(action, options, instantiationService, agentStatusService, hoverService, commandService, keybindingService, agentSessionsService, labelService, workspaceContextService, environmentService, editorGroupsService, editorService, menuService, contextKeyService, storageService) {
    super(void 0, action, options);
    this.instantiationService = instantiationService;
    this.agentStatusService = agentStatusService;
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
    this._dynamicDisposables = this._register(new DisposableStore());
    this._commandCenterMenu = this._register(this.menuService.createMenu(MenuId.CommandCenterCenter, this.contextKeyService));
    this._register(this.agentStatusService.onDidChangeMode(() => {
      this._render();
    }));
    this._register(this.agentStatusService.onDidChangeSessionInfo(() => {
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
  }
  render(container) {
    super.render(container);
    this._container = container;
    container.classList.add("agent-status-container");
    this._render();
  }
  _render() {
    if (!this._container) {
      return;
    }
    const mode = this.agentStatusService.mode;
    const sessionInfo = this.agentStatusService.sessionInfo;
    const { activeSessions, unreadSessions, attentionNeededSessions } = this._getSessionStats();
    const attentionSession = attentionNeededSessions.length > 0 ? [...attentionNeededSessions].sort((a, b) => {
      const timeA = a.timing.lastRequestStarted ?? a.timing.created;
      const timeB = b.timing.lastRequestStarted ?? b.timing.created;
      return timeB - timeA;
    })[0] : void 0;
    const attentionText = attentionSession?.description ? typeof attentionSession.description === "string" ? attentionSession.description : renderAsPlaintext(attentionSession.description) : attentionSession?.label;
    const label = this._getLabel();
    const stateKey = JSON.stringify({
      mode,
      sessionTitle: sessionInfo?.title,
      activeCount: activeSessions.length,
      unreadCount: unreadSessions.length,
      attentionCount: attentionNeededSessions.length,
      attentionText,
      label
    });
    if (this._lastRenderState === stateKey) {
      return;
    }
    this._lastRenderState = stateKey;
    reset(this._container);
    this._dynamicDisposables.clear();
    if (this.agentStatusService.mode === AgentStatusMode.Session) {
      this._renderSessionMode(this._dynamicDisposables);
    } else {
      this._renderChatInputMode(this._dynamicDisposables);
    }
  }
  // #region Session Statistics
  /**
   * Get computed session statistics for rendering.
   */
  _getSessionStats() {
    const sessions = this.agentSessionsService.model.sessions;
    const activeSessions = sessions.filter((s) => isSessionInProgressStatus(s.status));
    const unreadSessions = sessions.filter((s) => !s.isRead());
    const attentionNeededSessions = sessions.filter(
      (s) => s.status === 3
      /* AgentSessionStatus.NeedsInput */
    );
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
    pill.setAttribute("aria-label", localize("openQuickChat", "Open Quick Chat"));
    pill.tabIndex = 0;
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
    const hoverLabel = localize("askAnythingPlaceholder", "Ask anything or describe what to build next");
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
      const kbForTooltip = this.keybindingService.lookupKeybinding(ACTION_ID)?.getLabel();
      return kbForTooltip ? localize("askTooltip", "Open Quick Chat ({0})", kbForTooltip) : localize("askTooltip2", "Open Quick Chat");
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
    this._renderStatusBadge(disposables, activeSessions, unreadSessions);
  }
  _renderSessionMode(disposables) {
    if (!this._container) {
      return;
    }
    const { activeSessions, unreadSessions } = this._getSessionStats();
    this._renderCommandCenterToolbar(disposables);
    const pill = $("div.agent-status-pill.session-mode");
    this._container.appendChild(pill);
    this._renderSearchButton(disposables, pill);
    const titleLabel = $("span.agent-status-title");
    const sessionInfo = this.agentStatusService.sessionInfo;
    titleLabel.textContent = sessionInfo?.title ?? localize("agentSessionProjection", "Agent Session Projection");
    pill.appendChild(titleLabel);
    this._renderEscapeButton(disposables, pill);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, pill, () => {
      const sessionInfo2 = this.agentStatusService.sessionInfo;
      return sessionInfo2 ? localize("agentSessionProjectionTooltip", "Agent Session Projection: {0}", sessionInfo2.title) : localize("agentSessionProjection", "Agent Session Projection");
    }));
    this._renderStatusBadge(disposables, activeSessions, unreadSessions);
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
        if (action.id === AgentStatusWidget_1._quickOpenCommandId) {
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
    container.appendChild(searchButton);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    const searchKb = this.keybindingService.lookupKeybinding(SEARCH_BUTTON_ACITON_ID)?.getLabel();
    const searchTooltip = searchKb ? localize("openQuickOpenTooltip", "Go to File ({0})", searchKb) : localize("openQuickOpenTooltip2", "Go to File");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, searchButton, searchTooltip));
    disposables.add(addDisposableListener(searchButton, EventType.CLICK, (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.commandService.executeCommand(SEARCH_BUTTON_ACITON_ID);
    }));
    disposables.add(addDisposableListener(searchButton, EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        this.commandService.executeCommand(SEARCH_BUTTON_ACITON_ID);
      }
    }));
  }
  /**
   * Render the status badge showing in-progress and/or unread session counts.
   * Shows split UI with both indicators when both types exist.
   * When no notifications, shows a chat sparkle icon.
   */
  _renderStatusBadge(disposables, activeSessions, unreadSessions) {
    if (!this._container) {
      return;
    }
    const hasActiveSessions = activeSessions.length > 0;
    const hasUnreadSessions = unreadSessions.length > 0;
    const hasContent = hasActiveSessions || hasUnreadSessions;
    this._clearFilterIfCategoryEmpty(hasUnreadSessions, hasActiveSessions);
    const badge = $("div.agent-status-badge");
    this._container.appendChild(badge);
    if (!hasContent) {
      badge.classList.add("empty");
      return;
    }
    if (hasUnreadSessions) {
      const unreadSection = $("span.agent-status-badge-section.unread");
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
    }
    if (hasActiveSessions) {
      const activeSection = $("span.agent-status-badge-section.active");
      activeSection.setAttribute("role", "button");
      activeSection.tabIndex = 0;
      const runningIcon = $("span.agent-status-icon");
      reset(runningIcon, renderIcon(Codicon.sessionInProgress));
      activeSection.appendChild(runningIcon);
      const runningCount = $("span.agent-status-text");
      runningCount.textContent = String(activeSessions.length);
      activeSection.appendChild(runningCount);
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
    }
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, badge, () => {
      const parts = [];
      if (hasUnreadSessions) {
        parts.push(unreadSessions.length === 1 ? localize("unreadSessionsTooltip1", "{0} unread session", unreadSessions.length) : localize("unreadSessionsTooltip", "{0} unread sessions", unreadSessions.length));
      }
      if (hasActiveSessions) {
        parts.push(activeSessions.length === 1 ? localize("activeSessionsTooltip1", "{0} session in progress", activeSessions.length) : localize("activeSessionsTooltip", "{0} sessions in progress", activeSessions.length));
      }
      return parts.join(", ");
    }));
  }
  /**
   * Clear the filter if the currently filtered category becomes empty.
   * For example, if filtered to "unread" but no unread sessions exist, clear the filter.
   */
  _clearFilterIfCategoryEmpty(hasUnreadSessions, hasActiveSessions) {
    const FILTER_STORAGE_KEY = "agentSessions.filterExcludes.agentsessionsviewerfiltersubmenu";
    const currentFilterStr = this.storageService.get(
      FILTER_STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (!currentFilterStr) {
      return;
    }
    let currentFilter;
    try {
      currentFilter = JSON.parse(currentFilterStr);
    } catch {
      return;
    }
    if (!currentFilter) {
      return;
    }
    const isFilteredToUnread = currentFilter.read === true && currentFilter.states.length === 0;
    const isFilteredToInProgress = currentFilter.states?.length === 2 && currentFilter.read === false;
    if (isFilteredToUnread && !hasUnreadSessions || isFilteredToInProgress && !hasActiveSessions) {
      const clearedFilter = {
        providers: [],
        states: [],
        archived: true,
        read: false
      };
      this.storageService.store(
        FILTER_STORAGE_KEY,
        JSON.stringify(clearedFilter),
        0,
        0
        /* StorageTarget.USER */
      );
    }
  }
  /**
   * Opens the agent sessions view with a specific filter applied, or clears filter if already applied.
   * @param filterType 'unread' to show only unread sessions, 'inProgress' to show only in-progress sessions
   */
  _openSessionsWithFilter(filterType) {
    const FILTER_STORAGE_KEY = "agentSessions.filterExcludes.agentsessionsviewerfiltersubmenu";
    const currentFilterStr = this.storageService.get(
      FILTER_STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    let currentFilter;
    if (currentFilterStr) {
      try {
        currentFilter = JSON.parse(currentFilterStr);
      } catch {
      }
    }
    const isCurrentlyFilteredToUnread = currentFilter?.read === true && currentFilter.states.length === 0;
    const isCurrentlyFilteredToInProgress = currentFilter?.states?.length === 2 && currentFilter.read === false;
    let excludes;
    if (filterType === "unread") {
      if (isCurrentlyFilteredToUnread) {
        excludes = {
          providers: [],
          states: [],
          archived: true,
          read: false
        };
      } else {
        excludes = {
          providers: [],
          states: [],
          archived: true,
          read: true
          // exclude read sessions
        };
      }
    } else {
      if (isCurrentlyFilteredToInProgress) {
        excludes = {
          providers: [],
          states: [],
          archived: true,
          read: false
        };
      } else {
        excludes = {
          providers: [],
          states: [
            1,
            0
            /* AgentSessionStatus.Failed */
          ],
          archived: true,
          read: false
        };
      }
    }
    this.storageService.store(
      FILTER_STORAGE_KEY,
      JSON.stringify(excludes),
      0,
      0
      /* StorageTarget.USER */
    );
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
  // #endregion
  // #region Click Handlers
  /**
   * Handle pill click - opens the displayed session if showing progress, otherwise executes default action
   */
  _handlePillClick() {
    if (this._displayedSession) {
      this.instantiationService.invokeFunction(openSession, this._displayedSession);
    } else {
      this.commandService.executeCommand(ACTION_ID);
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
AgentStatusWidget = AgentStatusWidget_1 = __decorate([
  __param(2, IInstantiationService),
  __param(3, IAgentStatusService),
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
  __param(15, IStorageService)
], AgentStatusWidget);
export {
  AgentStatusWidget
};
//# sourceMappingURL=agentStatusWidget.js.map
