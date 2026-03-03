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
import { Codicon } from "../../../../base/common/codicons.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { SessionsCategories } from "../../../common/categories.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ViewPaneContainer } from "../../../../workbench/browser/parts/views/viewPaneContainer.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { Extensions as ViewContainerExtensions } from "../../../../workbench/common/views.js";
import { OutputViewPane } from "../../../../workbench/contrib/output/browser/outputView.js";
import { OUTPUT_VIEW_ID } from "../../../../workbench/services/output/common/output.js";
import { IViewsService } from "../../../../workbench/services/views/common/viewsService.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
const SESSIONS_LOGS_CONTAINER_ID = "workbench.sessions.panel.logsContainer";
const CONTEXT_SESSIONS_SHOW_LOGS = new RawContextKey("sessionsShowLogs", false);
const logsViewIcon = registerIcon("sessions-logs-view-icon", Codicon.output, localize("sessionsLogsViewIcon", "View icon of the logs view in the sessions window."));
let RegisterLogsViewContainerContribution = class RegisterLogsViewContainerContribution2 {
  static {
    __name(this, "RegisterLogsViewContainerContribution");
  }
  static {
    this.ID = "sessions.registerLogsViewContainer";
  }
  constructor(contextKeyService, environmentService) {
    CONTEXT_SESSIONS_SHOW_LOGS.bindTo(contextKeyService).set(!environmentService.isBuilt);
    const viewContainerRegistry = Registry.as(ViewContainerExtensions.ViewContainersRegistry);
    const viewsRegistry = Registry.as(ViewContainerExtensions.ViewsRegistry);
    const outputViewContainer = viewContainerRegistry.get(OUTPUT_VIEW_ID);
    if (outputViewContainer) {
      const view = viewsRegistry.getView(OUTPUT_VIEW_ID);
      if (view) {
        viewsRegistry.deregisterViews([view], outputViewContainer);
      }
      viewContainerRegistry.deregisterViewContainer(outputViewContainer);
    }
    const logsViewContainer = viewContainerRegistry.registerViewContainer({
      id: SESSIONS_LOGS_CONTAINER_ID,
      title: localize2("logs", "Logs"),
      icon: logsViewIcon,
      order: 2,
      ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [SESSIONS_LOGS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
      storageId: SESSIONS_LOGS_CONTAINER_ID,
      hideIfEmpty: true,
      windowVisibility: 2
    }, 1, { doNotRegisterOpenCommand: true });
    viewsRegistry.registerViews([{
      id: OUTPUT_VIEW_ID,
      name: localize2("logs", "Logs"),
      containerIcon: logsViewIcon,
      ctorDescriptor: new SyncDescriptor(OutputViewPane),
      canToggleVisibility: true,
      canMoveView: false,
      when: CONTEXT_SESSIONS_SHOW_LOGS,
      windowVisibility: 2
    }], logsViewContainer);
  }
};
RegisterLogsViewContainerContribution = __decorate([
  __param(0, IContextKeyService),
  __param(1, IEnvironmentService)
], RegisterLogsViewContainerContribution);
registerWorkbenchContribution2(
  RegisterLogsViewContainerContribution.ID,
  RegisterLogsViewContainerContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.sessions.action.showLogs",
      title: localize2("sessionsShowLogs", "Show Logs"),
      category: SessionsCategories.Sessions,
      f1: true
    });
  }
  async run(accessor) {
    const contextKeyService = accessor.get(IContextKeyService);
    const viewsService = accessor.get(IViewsService);
    CONTEXT_SESSIONS_SHOW_LOGS.bindTo(contextKeyService).set(true);
    await viewsService.openView(OUTPUT_VIEW_ID, true);
  }
});
//# sourceMappingURL=logs.contribution.js.map
