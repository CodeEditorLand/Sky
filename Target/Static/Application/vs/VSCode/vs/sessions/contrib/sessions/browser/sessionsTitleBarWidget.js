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
import "./media/sessionsTitleBarWidget.css";
import { $, addDisposableListener, EventType, getActiveWindow, reset } from "../../../../base/browser/dom.js";
import { Separator } from "../../../../base/common/actions.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { localize } from "../../../../nls.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { BaseActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IMenuService, MenuId, MenuRegistry, SubmenuItemAction } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService, ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { ChatContextKeys } from "../../../../workbench/contrib/chat/common/actions/chatContextKeys.js";
import { getAgentChangesSummary, hasValidDiff } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsModel.js";
import { IChatSessionsService } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { Menus } from "../../../browser/menus.js";
import { IActionViewItemService } from "../../../../platform/actions/browser/actionViewItemService.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { ISessionsManagementService } from "./sessionsManagementService.js";
import { FocusAgentSessionsAction } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsActions.js";
import { AgentSessionsPicker } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsPicker.js";
import { autorun } from "../../../../base/common/observable.js";
import { IChatService } from "../../../../workbench/contrib/chat/common/chatService/chatService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderIcon } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { basename } from "../../../../base/common/resources.js";
import { IsAuxiliaryWindowContext } from "../../../../workbench/common/contextkeys.js";
import { SessionsWelcomeVisibleContext } from "../../../common/contextkeys.js";
let SessionsTitleBarWidget = class SessionsTitleBarWidget2 extends BaseActionViewItem {
  static {
    __name(this, "SessionsTitleBarWidget");
  }
  constructor(action, options, instantiationService, hoverService, activeSessionService, chatService, agentSessionsService, contextMenuService, menuService, contextKeyService, chatSessionsService) {
    super(void 0, action, options);
    this.instantiationService = instantiationService;
    this.hoverService = hoverService;
    this.activeSessionService = activeSessionService;
    this.chatService = chatService;
    this.agentSessionsService = agentSessionsService;
    this.contextMenuService = contextMenuService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.chatSessionsService = chatSessionsService;
    this._dynamicDisposables = this._register(new DisposableStore());
    this._modelChangeListener = this._register(new MutableDisposable());
    this._isRendering = false;
    this._register(autorun((reader) => {
      const activeSession = this.activeSessionService.activeSession.read(reader);
      this._trackModelTitleChanges(activeSession?.resource);
      this._lastRenderState = void 0;
      this._render();
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => {
      this._lastRenderState = void 0;
      this._render();
    }));
  }
  render(container) {
    super.render(container);
    this._container = container;
    container.classList.add("agent-sessions-titlebar-container");
    this._render();
  }
  setFocusable(_focusable) {
  }
  // Override onClick to prevent the base class from running the underlying
  // submenu action when the widget handles clicks itself.
  onClick() {
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
      const label = this._getActiveSessionLabel();
      const icon = this._getActiveSessionIcon();
      const repoLabel = this._getRepositoryLabel();
      const changesSummary = this._getChangesSummary();
      const renderState = `${icon?.id ?? ""}|${label}|${repoLabel ?? ""}|${changesSummary?.insertions ?? ""}|${changesSummary?.deletions ?? ""}`;
      if (this._lastRenderState === renderState) {
        return;
      }
      this._lastRenderState = renderState;
      reset(this._container);
      this._dynamicDisposables.clear();
      this._container.setAttribute("role", "button");
      this._container.setAttribute("aria-label", localize("agentSessionsShowSessions", "Show Sessions"));
      this._container.tabIndex = 0;
      const sessionPill = $("span.agent-sessions-titlebar-pill");
      const centerGroup = $("span.agent-sessions-titlebar-center");
      if (icon) {
        const iconEl = $("span.agent-sessions-titlebar-icon" + ThemeIcon.asCSSSelector(icon));
        centerGroup.appendChild(iconEl);
      }
      const labelEl = $("span.agent-sessions-titlebar-label");
      labelEl.textContent = label;
      centerGroup.appendChild(labelEl);
      if (repoLabel) {
        const separator1 = $("span.agent-sessions-titlebar-separator");
        separator1.textContent = "\xB7";
        centerGroup.appendChild(separator1);
        const repoEl = $("span.agent-sessions-titlebar-repo");
        repoEl.textContent = repoLabel;
        centerGroup.appendChild(repoEl);
      }
      if (changesSummary) {
        const separator2 = $("span.agent-sessions-titlebar-separator");
        separator2.textContent = "\xB7";
        centerGroup.appendChild(separator2);
        const changesEl = $("span.agent-sessions-titlebar-changes");
        const addedEl = $("span.agent-sessions-titlebar-changes-added");
        addedEl.textContent = `+${changesSummary.insertions}`;
        changesEl.appendChild(addedEl);
        const removedEl = $("span.agent-sessions-titlebar-changes-removed");
        removedEl.textContent = `-${changesSummary.deletions}`;
        changesEl.appendChild(removedEl);
        centerGroup.appendChild(changesEl);
      }
      sessionPill.appendChild(centerGroup);
      this._dynamicDisposables.add(addDisposableListener(sessionPill, EventType.MOUSE_DOWN, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }));
      this._dynamicDisposables.add(addDisposableListener(sessionPill, EventType.CLICK, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._showSessionsPicker();
      }));
      this._dynamicDisposables.add(addDisposableListener(sessionPill, EventType.CONTEXT_MENU, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._showContextMenu(e);
      }));
      this._container.appendChild(sessionPill);
      this._dynamicDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), sessionPill, label));
      this._dynamicDisposables.add(addDisposableListener(this._container, EventType.KEY_DOWN, (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          this._showSessionsPicker();
        }
      }));
    } finally {
      this._isRendering = false;
    }
  }
  /**
   * Track title changes on the chat model for the given session resource.
   * When the model title changes, re-render the widget.
   */
  _trackModelTitleChanges(sessionResource) {
    this._modelChangeListener.clear();
    if (!sessionResource) {
      return;
    }
    const model = this.chatService.getSession(sessionResource);
    if (!model) {
      return;
    }
    this._modelChangeListener.value = model.onDidChange((e) => {
      if (e.kind === "setCustomTitle" || e.kind === "addRequest") {
        this._lastRenderState = void 0;
        this._render();
      }
    });
  }
  /**
   * Get the label of the active chat session.
   */
  _getActiveSessionLabel() {
    const activeSession = this.activeSessionService.getActiveSession();
    const label = activeSession?.label;
    if (label) {
      return label;
    }
    if (activeSession) {
      const activeModel = this.chatService.getSession(activeSession.resource);
      if (activeModel?.title) {
        return activeModel.title;
      }
    }
    return localize("agentSessions.newSession", "New Session");
  }
  /**
   * Get the icon for the active session's kind/provider.
   */
  _getActiveSessionIcon() {
    const activeSession = this.activeSessionService.getActiveSession();
    if (!activeSession) {
      return void 0;
    }
    const agentSession = this.agentSessionsService.getSession(activeSession.resource);
    if (agentSession) {
      if (agentSession.providerType === AgentSessionProviders.Background) {
        const hasWorktree = typeof agentSession.metadata?.worktreePath === "string";
        return hasWorktree ? Codicon.worktree : Codicon.folder;
      }
      return agentSession.icon;
    }
    const provider = getAgentSessionProvider(activeSession.resource);
    if (provider !== void 0) {
      return getAgentSessionProviderIcon(provider);
    }
    return void 0;
  }
  /**
   * Get the repository label for the active session.
   */
  _getRepositoryLabel() {
    const activeSession = this.activeSessionService.getActiveSession();
    if (!activeSession) {
      return void 0;
    }
    const uri = activeSession.repository;
    if (!uri) {
      return void 0;
    }
    return basename(uri);
  }
  _showContextMenu(e) {
    const activeSession = this.activeSessionService.getActiveSession();
    if (!activeSession) {
      return;
    }
    const agentSession = this.agentSessionsService.getSession(activeSession.resource);
    if (!agentSession) {
      return;
    }
    this.chatSessionsService.activateChatSessionItemProvider(agentSession.providerType);
    const contextOverlay = [
      [ChatContextKeys.isArchivedAgentSession.key, agentSession.isArchived()],
      [ChatContextKeys.isReadAgentSession.key, agentSession.isRead()],
      [ChatContextKeys.agentSessionType.key, agentSession.providerType]
    ];
    const menu = this.menuService.createMenu(MenuId.AgentSessionsContext, this.contextKeyService.createOverlay(contextOverlay));
    const marshalledContext = {
      session: agentSession,
      sessions: [agentSession],
      $mid: 25
    };
    this.contextMenuService.showContextMenu({
      getActions: /* @__PURE__ */ __name(() => Separator.join(...menu.getActions({ arg: marshalledContext, shouldForwardArgs: true }).map(([, actions]) => actions)), "getActions"),
      getAnchor: /* @__PURE__ */ __name(() => new StandardMouseEvent(getActiveWindow(), e), "getAnchor"),
      getActionsContext: /* @__PURE__ */ __name(() => marshalledContext, "getActionsContext")
    });
    menu.dispose();
  }
  /**
   * Get the changes summary for the active session.
   */
  _getChangesSummary() {
    const activeSession = this.activeSessionService.getActiveSession();
    if (!activeSession) {
      return void 0;
    }
    const agentSession = this.agentSessionsService.getSession(activeSession.resource);
    const changes = agentSession?.changes;
    if (!changes || !hasValidDiff(changes)) {
      return void 0;
    }
    return getAgentChangesSummary(changes);
  }
  _showSessionsPicker() {
    const picker = this.instantiationService.createInstance(AgentSessionsPicker, void 0, {
      overrideSessionOpen: /* @__PURE__ */ __name((session, openOptions) => this.activeSessionService.openSession(session.resource, openOptions), "overrideSessionOpen")
    });
    picker.pickAgentSession();
  }
};
SessionsTitleBarWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IHoverService),
  __param(4, ISessionsManagementService),
  __param(5, IChatService),
  __param(6, IAgentSessionsService),
  __param(7, IContextMenuService),
  __param(8, IMenuService),
  __param(9, IContextKeyService),
  __param(10, IChatSessionsService)
], SessionsTitleBarWidget);
let SessionsTitleBarContribution = class SessionsTitleBarContribution2 extends Disposable {
  static {
    __name(this, "SessionsTitleBarContribution");
  }
  static {
    this.ID = "workbench.contrib.agentSessionsTitleBar";
  }
  constructor(actionViewItemService, instantiationService) {
    super();
    this._register(MenuRegistry.appendMenuItem(Menus.CommandCenter, {
      submenu: Menus.TitleBarSessionTitle,
      title: localize("agentSessionsControl", "Agent Sessions"),
      order: 101,
      when: ContextKeyExpr.and(IsAuxiliaryWindowContext.negate(), SessionsWelcomeVisibleContext.negate())
    }));
    this._register(MenuRegistry.appendMenuItem(Menus.TitleBarSessionTitle, {
      command: {
        id: FocusAgentSessionsAction.id,
        title: localize("showSessions", "Show Sessions")
      },
      group: "a_sessions",
      order: 1,
      when: IsAuxiliaryWindowContext.negate()
    }));
    this._register(actionViewItemService.register(Menus.CommandCenter, Menus.TitleBarSessionTitle, (action, options) => {
      if (!(action instanceof SubmenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(SessionsTitleBarWidget, action, options);
    }, void 0));
  }
};
SessionsTitleBarContribution = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IInstantiationService)
], SessionsTitleBarContribution);
export {
  SessionsTitleBarContribution,
  SessionsTitleBarWidget
};
//# sourceMappingURL=sessionsTitleBarWidget.js.map
