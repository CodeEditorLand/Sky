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
import { registerSingleton } from "../../../../../../platform/instantiation/common/extensions.js";
import { MenuId, MenuRegistry, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { IAgentSessionProjectionService, AgentSessionProjectionService, AGENT_SESSION_PROJECTION_ENABLED_PROVIDERS } from "./agentSessionProjectionService.js";
import { EnterAgentSessionProjectionAction, ExitAgentSessionProjectionAction, ToggleAgentStatusAction, ToggleUnifiedAgentsBarAction } from "./agentSessionProjectionActions.js";
import { registerWorkbenchContribution2 } from "../../../../../common/contributions.js";
import { AgentTitleBarStatusRendering } from "./agentTitleBarStatusWidget.js";
import { AgentTitleBarStatusService, IAgentTitleBarStatusService } from "./agentTitleBarStatusService.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { localize } from "../../../../../../nls.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { ProductQualityContext } from "../../../../../../platform/contextkey/common/contextkeys.js";
import { ChatAgentLocation, ChatConfiguration } from "../../../common/constants.js";
import { ChatContextKeys } from "../../../common/actions/chatContextKeys.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { IChatWidgetService } from "../../chat.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IAgentSessionsService } from "../agentSessionsService.js";
import { AgentSessionProviders } from "../agentSessions.js";
import { IChatEditingService } from "../../../common/editing/chatEditingService.js";
import { isSessionInProgressStatus } from "../agentSessionsModel.js";
import { autorun } from "../../../../../../base/common/observable.js";
import "./unifiedQuickAccessActions.js";
let AgentSessionReadyContribution = class AgentSessionReadyContribution2 extends Disposable {
  static {
    __name(this, "AgentSessionReadyContribution");
  }
  static {
    this.ID = "chat.agentSessionReady";
  }
  constructor(chatWidgetService, configurationService, agentTitleBarStatusService, agentSessionsService, agentSessionProjectionService, chatEditingService) {
    super();
    this.chatWidgetService = chatWidgetService;
    this.configurationService = configurationService;
    this.agentTitleBarStatusService = agentTitleBarStatusService;
    this.agentSessionsService = agentSessionsService;
    this.agentSessionProjectionService = agentSessionProjectionService;
    this.chatEditingService = chatEditingService;
    this._widgetDisposables = this._register(new DisposableStore());
    this._suppressSessionReady = false;
    for (const widget of this.chatWidgetService.getAllWidgets()) {
      if (widget.location === ChatAgentLocation.Chat) {
        this._watchWidget(widget);
      }
    }
    this._register(this.chatWidgetService.onDidAddWidget((widget) => {
      if (widget.location === ChatAgentLocation.Chat) {
        this._watchWidget(widget);
      }
    }));
    this._register(this.agentSessionProjectionService.onDidChangeProjectionMode((isActive) => {
      if (!isActive) {
        this._suppressSessionReady = true;
        this._clearEntriesWatcher();
        this.agentTitleBarStatusService.exitSessionReadyMode();
      }
    }));
    this._register(autorun((reader) => {
      this.chatEditingService.editingSessionsObs.read(reader);
      const currentWidget = this.chatWidgetService.getAllWidgets().find((w) => w.location === ChatAgentLocation.Chat);
      if (currentWidget) {
        this._checkSession(currentWidget.viewModel?.sessionResource);
      }
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => {
      const currentWidget = this.chatWidgetService.getAllWidgets().find((w) => w.location === ChatAgentLocation.Chat);
      if (currentWidget) {
        this._checkSession(currentWidget.viewModel?.sessionResource);
      }
    }));
  }
  _watchWidget(widget) {
    this._widgetDisposables.clear();
    this._checkSession(widget.viewModel?.sessionResource);
    this._widgetDisposables.add(widget.onDidChangeViewModel(() => {
      this._checkSession(widget.viewModel?.sessionResource);
    }));
  }
  _checkSession(sessionResource) {
    if (sessionResource?.toString() !== this._watchedSessionResource?.toString()) {
      this._suppressSessionReady = false;
    }
    if (this.agentSessionProjectionService.isActive) {
      const activeSession = this.agentSessionProjectionService.activeSession;
      if (sessionResource && activeSession && sessionResource.toString() !== activeSession.resource.toString()) {
        const newSession = this.agentSessionsService.getSession(sessionResource);
        if (newSession) {
          this.agentSessionProjectionService.enterProjection(newSession);
        }
      }
      return;
    }
    this._updateSessionReadyState(sessionResource);
  }
  _clearEntriesWatcher() {
    this._entriesWatcher?.dispose();
    this._entriesWatcher = void 0;
    this._watchedSessionResource = void 0;
  }
  _updateSessionReadyState(sessionResource) {
    const isEnabled = this.configurationService.getValue(ChatConfiguration.AgentSessionProjectionEnabled);
    if (!isEnabled) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    if (this.agentSessionProjectionService.isActive) {
      this._clearEntriesWatcher();
      return;
    }
    if (!sessionResource) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    const session = this.agentSessionsService.getSession(sessionResource);
    if (!session) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    if (!AGENT_SESSION_PROJECTION_ENABLED_PROVIDERS.has(session.providerType)) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    if (isSessionInProgressStatus(session.status)) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    let hasPendingChanges = false;
    if (session.providerType === AgentSessionProviders.Local) {
      const editingSession = this.chatEditingService.getEditingSession(sessionResource);
      if (!editingSession) {
        this._clearEntriesWatcher();
        this.agentTitleBarStatusService.exitSessionReadyMode();
        return;
      }
      const entries = editingSession.entries.get();
      hasPendingChanges = entries.some(
        (entry) => entry.state.get() === 0
        /* ModifiedFileEntryState.Modified */
      );
      if (hasPendingChanges && !this._suppressSessionReady) {
        this.agentTitleBarStatusService.enterSessionReadyMode(session.resource, session.label);
        if (!this._watchedSessionResource || this._watchedSessionResource.toString() !== sessionResource.toString()) {
          this._clearEntriesWatcher();
          this._watchedSessionResource = sessionResource;
          this._entriesWatcher = autorun((reader) => {
            const currentEntries = editingSession.entries.read(reader);
            const stillHasChanges = currentEntries.some(
              (entry) => entry.state.read(reader) === 0
              /* ModifiedFileEntryState.Modified */
            );
            if (!stillHasChanges) {
              this.agentTitleBarStatusService.exitSessionReadyMode();
            }
          });
        }
      } else {
        this._clearEntriesWatcher();
        this.agentTitleBarStatusService.exitSessionReadyMode();
      }
    } else {
      this._clearEntriesWatcher();
      const changeCount = Array.isArray(session.changes) ? session.changes.filter((change) => !!change.originalUri).length : 0;
      hasPendingChanges = changeCount > 0;
      if (hasPendingChanges && !this._suppressSessionReady) {
        this.agentTitleBarStatusService.enterSessionReadyMode(session.resource, session.label);
      } else {
        this.agentTitleBarStatusService.exitSessionReadyMode();
      }
    }
  }
};
AgentSessionReadyContribution = __decorate([
  __param(0, IChatWidgetService),
  __param(1, IConfigurationService),
  __param(2, IAgentTitleBarStatusService),
  __param(3, IAgentSessionsService),
  __param(4, IAgentSessionProjectionService),
  __param(5, IChatEditingService)
], AgentSessionReadyContribution);
registerAction2(EnterAgentSessionProjectionAction);
registerAction2(ExitAgentSessionProjectionAction);
registerAction2(ToggleAgentStatusAction);
registerAction2(ToggleUnifiedAgentsBarAction);
registerSingleton(
  IAgentSessionProjectionService,
  AgentSessionProjectionService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IAgentTitleBarStatusService,
  AgentTitleBarStatusService,
  1
  /* InstantiationType.Delayed */
);
registerWorkbenchContribution2(
  AgentTitleBarStatusRendering.ID,
  AgentTitleBarStatusRendering,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerWorkbenchContribution2(
  AgentSessionReadyContribution.ID,
  AgentSessionReadyContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
MenuRegistry.appendMenuItem(MenuId.CommandCenter, {
  submenu: MenuId.AgentsTitleBarControlMenu,
  title: localize("agentsControl", "Agents"),
  icon: Codicon.chatSparkle,
  when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(ContextKeyExpr.has(`config.${ChatConfiguration.AgentStatusEnabled}`), ContextKeyExpr.has(`config.${ChatConfiguration.UnifiedAgentsBar}`))),
  order: 10002
  // to the right of the chat button
});
MenuRegistry.appendMenuItem(MenuId.TitleBar, {
  submenu: MenuId.ChatTitleBarMenu,
  title: localize("title4", "Chat"),
  group: "navigation",
  icon: Codicon.chatSparkle,
  when: ContextKeyExpr.and(ChatContextKeys.supported, ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabled.negate()), ContextKeyExpr.has(`config.${ChatConfiguration.AgentStatusEnabled}`), ContextKeyExpr.has("config.window.commandCenter").negate()),
  order: 1
});
MenuRegistry.appendMenuItem(MenuId.AgentsTitleBarControlMenu, {
  command: {
    id: "workbench.action.chat.toggle",
    title: localize("openChat", "Open Chat")
  },
  when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(ContextKeyExpr.has(`config.${ChatConfiguration.AgentStatusEnabled}`), ContextKeyExpr.has(`config.${ChatConfiguration.UnifiedAgentsBar}`))),
  group: "a_open",
  order: 1
});
MenuRegistry.appendMenuItem(MenuId.AgentsTitleBarControlMenu, {
  command: {
    id: `toggle.${ChatConfiguration.UnifiedAgentsBar}`,
    title: localize("toggleAgentQuickInput", "Agent Quick Input (Experimental)"),
    toggled: ContextKeyExpr.has(`config.${ChatConfiguration.UnifiedAgentsBar}`)
  },
  when: ContextKeyExpr.and(ChatContextKeys.enabled, ProductQualityContext.notEqualsTo("stable")),
  group: "z_experimental",
  order: 10
});
//# sourceMappingURL=agentSessionsExperiments.contribution.js.map
