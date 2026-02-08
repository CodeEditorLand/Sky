import "./experiments/agentSessionsExperiments.contribution.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize, localize2 } from "../../../../../nls.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { Extensions as QuickAccessExtensions } from "../../../../../platform/quickinput/common/quickAccess.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { AgentSessionsViewerOrientation, AgentSessionsViewerPosition } from "./agentSessions.js";
import { IAgentSessionsService, AgentSessionsService } from "./agentSessionsService.js";
import { LocalAgentsSessionsProvider } from "./localAgentSessionsProvider.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
import { MenuId, MenuRegistry, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ArchiveAgentSessionAction, ArchiveAgentSessionSectionAction, UnarchiveAgentSessionAction, OpenAgentSessionInEditorGroupAction, OpenAgentSessionInNewEditorGroupAction, OpenAgentSessionInNewWindowAction, ShowAgentSessionsSidebar, HideAgentSessionsSidebar, ToggleAgentSessionsSidebar, RefreshAgentSessionsViewerAction, FindAgentSessionInViewerAction, MarkAgentSessionUnreadAction, MarkAgentSessionReadAction, FocusAgentSessionsAction, SetAgentSessionsOrientationStackedAction, SetAgentSessionsOrientationSideBySideAction, PickAgentSessionAction, ArchiveAllAgentSessionsAction, MarkAllAgentSessionsReadAction, RenameAgentSessionAction, DeleteAgentSessionAction, DeleteAllLocalSessionsAction, MarkAgentSessionSectionReadAction, ToggleShowAgentSessionsAction, UnarchiveAgentSessionSectionAction } from "./agentSessionsActions.js";
import { AgentSessionsQuickAccessProvider, AGENT_SESSIONS_QUICK_ACCESS_PREFIX } from "./agentSessionsQuickAccess.js";
registerAction2(FocusAgentSessionsAction);
registerAction2(PickAgentSessionAction);
registerAction2(ArchiveAllAgentSessionsAction);
registerAction2(MarkAllAgentSessionsReadAction);
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
registerAction2(ToggleShowAgentSessionsAction);
registerAction2(SetAgentSessionsOrientationStackedAction);
registerAction2(SetAgentSessionsOrientationSideBySideAction);
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  submenu: MenuId.AgentSessionsViewerFilterSubMenu,
  title: localize2("filterAgentSessions", "Filter Agent Sessions"),
  group: "navigation",
  order: 3,
  icon: Codicon.filter
});
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarRightOff
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.Stacked), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Right))
});
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarLeftOff
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.Stacked), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Left))
});
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: HideAgentSessionsSidebar.ID,
    title: HideAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarRight
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.SideBySide), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Right))
});
MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: HideAgentSessionsSidebar.ID,
    title: HideAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarLeft
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.SideBySide), ChatContextKeys.agentSessionsViewerPosition.isEqualTo(AgentSessionsViewerPosition.Left))
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
//# sourceMappingURL=agentSessions.contribution.js.map
