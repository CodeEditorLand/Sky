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
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../../../nls.js";
import { mainWindow } from "../../../../../base/browser/window.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { Extensions as QuickAccessExtensions } from "../../../../../platform/quickinput/common/quickAccess.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { AgentSessionsViewerOrientation, AgentSessionsViewerPosition } from "./agentSessions.js";
import { IAgentSessionsService, AgentSessionsService } from "./agentSessionsService.js";
import { LocalAgentsSessionsProvider } from "./localAgentSessionsProvider.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
import { MenuId, MenuRegistry, registerAction2, SubmenuItemAction } from "../../../../../platform/actions/common/actions.js";
import { ArchiveAgentSessionAction, ArchiveAgentSessionSectionAction, UnarchiveAgentSessionSectionAction, UnarchiveAgentSessionAction, OpenAgentSessionInEditorGroupAction, OpenAgentSessionInNewEditorGroupAction, OpenAgentSessionInNewWindowAction, ShowAgentSessionsSidebar, HideAgentSessionsSidebar, ToggleAgentSessionsSidebar, RefreshAgentSessionsViewerAction, FindAgentSessionInViewerAction, MarkAgentSessionUnreadAction, MarkAgentSessionReadAction, MarkAgentSessionSectionReadAction, FocusAgentSessionsAction, SetAgentSessionsOrientationStackedAction, SetAgentSessionsOrientationSideBySideAction, ShowAllAgentSessionsAction, ShowRecentAgentSessionsAction, HideAgentSessionsAction, PickAgentSessionAction, ArchiveAllAgentSessionsAction, RenameAgentSessionAction, DeleteAgentSessionAction, DeleteAllLocalSessionsAction } from "./agentSessionsActions.js";
import { AgentSessionsQuickAccessProvider, AGENT_SESSIONS_QUICK_ACCESS_PREFIX } from "./agentSessionsQuickAccess.js";
import { IAgentSessionProjectionService, AgentSessionProjectionService } from "./agentSessionProjectionService.js";
import { EnterAgentSessionProjectionAction, ExitAgentSessionProjectionAction, ToggleAgentStatusAction, ToggleAgentSessionProjectionAction } from "./agentSessionProjectionActions.js";
import { IAgentStatusService, AgentStatusService } from "./agentStatusService.js";
import { AgentStatusWidget } from "./agentStatusWidget.js";
import { IActionViewItemService } from "../../../../../platform/actions/browser/actionViewItemService.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ChatConfiguration } from "../../common/constants.js";
import { AuxiliaryBarMaximizedContext } from "../../../../common/contextkeys.js";
registerAction2(FocusAgentSessionsAction);
registerAction2(PickAgentSessionAction);
registerAction2(ArchiveAllAgentSessionsAction);
registerAction2(ArchiveAgentSessionSectionAction);
registerAction2(UnarchiveAgentSessionSectionAction);
registerAction2(MarkAgentSessionSectionReadAction);
registerAction2(ArchiveAgentSessionAction);
registerAction2(UnarchiveAgentSessionAction);
registerAction2(RenameAgentSessionAction);
registerAction2(DeleteAgentSessionAction);
registerAction2(DeleteAllLocalSessionsAction);
registerAction2(MarkAgentSessionUnreadAction);
registerAction2(MarkAgentSessionReadAction);
registerAction2(OpenAgentSessionInNewWindowAction);
registerAction2(OpenAgentSessionInEditorGroupAction);
registerAction2(OpenAgentSessionInNewEditorGroupAction);
registerAction2(RefreshAgentSessionsViewerAction);
registerAction2(FindAgentSessionInViewerAction);
registerAction2(ShowAgentSessionsSidebar);
registerAction2(HideAgentSessionsSidebar);
registerAction2(ToggleAgentSessionsSidebar);
registerAction2(ShowAllAgentSessionsAction);
registerAction2(ShowRecentAgentSessionsAction);
registerAction2(HideAgentSessionsAction);
registerAction2(SetAgentSessionsOrientationStackedAction);
registerAction2(SetAgentSessionsOrientationSideBySideAction);
registerAction2(EnterAgentSessionProjectionAction);
registerAction2(ExitAgentSessionProjectionAction);
registerAction2(ToggleAgentStatusAction);
registerAction2(ToggleAgentSessionProjectionAction);
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  submenu: MenuId.AgentSessionsViewerFilterSubMenu,
  title: localize2("filterAgentSessions", "Filter Agent Sessions"),
  group: "navigation",
  order: 3,
  icon: Codicon.filter,
  when: ChatContextKeys.agentSessionsViewerLimited.negate()
});
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarRightOff
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.Stacked), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Right), AuxiliaryBarMaximizedContext.negate())
});
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarLeftOff
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.Stacked), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Left), AuxiliaryBarMaximizedContext.negate())
});
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: HideAgentSessionsSidebar.ID,
    title: HideAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarRight
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.SideBySide), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Right), AuxiliaryBarMaximizedContext.negate())
});
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: HideAgentSessionsSidebar.ID,
    title: HideAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarLeft
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.SideBySide), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Left), AuxiliaryBarMaximizedContext.negate())
});
MenuRegistry.appendMenuItem(MenuId.ChatViewSessionTitleToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarLeftOff
  },
  group: "navigation",
  order: 1,
  when: ContextKeyExpr.and(ContextKeyExpr.or(ChatContextKeys.agentSessionsViewerVisible.negate(), ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.Stacked)), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Left))
});
MenuRegistry.appendMenuItem(MenuId.ChatViewSessionTitleToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarRightOff
  },
  group: "navigation",
  order: 1,
  when: ContextKeyExpr.and(ContextKeyExpr.or(ChatContextKeys.agentSessionsViewerVisible.negate(), ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.Stacked)), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Right))
});
Registry.as(QuickAccessExtensions.Quickaccess).registerQuickAccessProvider({
  ctor: AgentSessionsQuickAccessProvider,
  prefix: AGENT_SESSIONS_QUICK_ACCESS_PREFIX,
  contextKey: "inAgentSessionsPicker",
  when: ChatContextKeys.enabled,
  placeholder: localize("agentSessionsQuickAccessPlaceholder", "Search agent sessions by name"),
  helpEntries: [{
    description: localize("agentSessionsQuickAccessHelp", "Show All Agent Sessions"),
    commandId: "workbench.action.chat.history"
  }]
});
registerWorkbenchContribution2(
  LocalAgentsSessionsProvider.ID,
  LocalAgentsSessionsProvider,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerSingleton(
  IAgentSessionsService,
  AgentSessionsService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IAgentStatusService,
  AgentStatusService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IAgentSessionProjectionService,
  AgentSessionProjectionService,
  1
  /* InstantiationType.Delayed */
);
MenuRegistry.appendMenuItem(MenuId.CommandCenter, {
  submenu: MenuId.AgentsControlMenu,
  title: localize("agentsControl", "Agents"),
  icon: Codicon.chatSparkle,
  when: ContextKeyExpr.has(`config.${ChatConfiguration.AgentStatusEnabled}`),
  order: 10002
  // to the right of the chat button
});
MenuRegistry.appendMenuItem(MenuId.AgentsControlMenu, {
  command: {
    id: "workbench.action.chat.toggle",
    title: localize("openChat", "Open Chat")
  },
  when: ContextKeyExpr.has(`config.${ChatConfiguration.AgentStatusEnabled}`)
});
let AgentStatusRendering = class AgentStatusRendering2 extends Disposable {
  static {
    __name(this, "AgentStatusRendering");
  }
  static {
    this.ID = "workbench.contrib.agentStatus.rendering";
  }
  constructor(actionViewItemService, instantiationService, configurationService) {
    super();
    this._register(actionViewItemService.register(MenuId.CommandCenter, MenuId.AgentsControlMenu, (action, options) => {
      if (!(action instanceof SubmenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(AgentStatusWidget, action, options);
    }, void 0));
    const updateClass = /* @__PURE__ */ __name(() => {
      const enabled = configurationService.getValue(ChatConfiguration.AgentStatusEnabled) === true;
      mainWindow.document.body.classList.toggle("agent-status-enabled", enabled);
      if (enabled && configurationService.getValue(
        "window.commandCenter"
        /* LayoutSettings.COMMAND_CENTER */
      ) !== true) {
        configurationService.updateValue("window.commandCenter", true);
      }
    }, "updateClass");
    updateClass();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatConfiguration.AgentStatusEnabled)) {
        updateClass();
      }
    }));
  }
};
AgentStatusRendering = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IInstantiationService),
  __param(2, IConfigurationService)
], AgentStatusRendering);
registerWorkbenchContribution2(
  AgentStatusRendering.ID,
  AgentStatusRendering,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=agentSessions.contribution.js.map
