import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as ViewContainerExtensions } from "../../../../workbench/common/views.js";
import { localize, localize2 } from "../../../../nls.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ViewPaneContainer } from "../../../../workbench/browser/parts/views/viewPaneContainer.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { SessionsTitleBarContribution } from "./sessionsTitleBarWidget.js";
import { AgenticSessionsViewPane, SessionsViewId } from "./sessionsViewPane.js";
import { SessionsManagementService, ISessionsManagementService } from "./sessionsManagementService.js";
const agentSessionsViewIcon = registerIcon("chat-sessions-icon", Codicon.commentDiscussionSparkle, localize("agentSessionsViewIcon", "Icon for Agent Sessions View"));
const AGENT_SESSIONS_VIEW_TITLE = localize2("agentSessions.view.label", "Sessions");
const SessionsContainerId = "agentic.workbench.view.sessionsContainer";
const agentSessionsViewContainer = Registry.as(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
  id: SessionsContainerId,
  title: AGENT_SESSIONS_VIEW_TITLE,
  icon: agentSessionsViewIcon,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [SessionsContainerId, { mergeViewWithContainerWhenSingleView: true }]),
  storageId: SessionsContainerId,
  hideIfEmpty: true,
  order: 6,
  windowVisibility: 2
  /* WindowVisibility.Sessions */
}, 0, { isDefault: true });
const agentSessionsViewDescriptor = {
  id: SessionsViewId,
  containerIcon: agentSessionsViewIcon,
  containerTitle: AGENT_SESSIONS_VIEW_TITLE.value,
  singleViewPaneContainerTitle: AGENT_SESSIONS_VIEW_TITLE.value,
  name: AGENT_SESSIONS_VIEW_TITLE,
  canToggleVisibility: false,
  canMoveView: false,
  ctorDescriptor: new SyncDescriptor(AgenticSessionsViewPane),
  windowVisibility: 2
  /* WindowVisibility.Sessions */
};
Registry.as(ViewContainerExtensions.ViewsRegistry).registerViews([agentSessionsViewDescriptor], agentSessionsViewContainer);
registerWorkbenchContribution2(
  SessionsTitleBarContribution.ID,
  SessionsTitleBarContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerSingleton(
  ISessionsManagementService,
  SessionsManagementService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=sessions.contribution.js.map
