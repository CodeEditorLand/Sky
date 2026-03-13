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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { observableFromEvent } from "../../../../base/common/observable.js";
import { localize2 } from "../../../../nls.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { hasValidDiff } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsModel.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { IViewsService } from "../../../../workbench/services/views/common/viewsService.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { CHANGES_VIEW_ID } from "./changesView.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { bindContextKey } from "../../../../platform/observable/common/platformObservableUtils.js";
import { activeSessionHasChangesContextKey } from "../common/changes.js";
const openChangesViewActionOptions = {
  id: "workbench.action.agentSessions.openChangesView",
  title: localize2("openChangesView", "Changes"),
  icon: Codicon.diffMultiple,
  f1: false
};
class OpenChangesViewAction extends Action2 {
  static {
    __name(this, "OpenChangesViewAction");
  }
  static {
    this.ID = openChangesViewActionOptions.id;
  }
  constructor() {
    super(openChangesViewActionOptions);
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    await viewsService.openView(CHANGES_VIEW_ID, true);
  }
}
registerAction2(OpenChangesViewAction);
let ChangesViewActionsContribution = class ChangesViewActionsContribution2 extends Disposable {
  static {
    __name(this, "ChangesViewActionsContribution");
  }
  static {
    this.ID = "workbench.contrib.changesViewActions";
  }
  constructor(contextKeyService, sessionManagementService, agentSessionsService) {
    super();
    const sessionsChanged = observableFromEvent(this, agentSessionsService.model.onDidChangeSessions, () => {
    });
    this._register(bindContextKey(activeSessionHasChangesContextKey, contextKeyService, (reader) => {
      sessionManagementService.activeSession.read(reader);
      sessionsChanged.read(reader);
      const activeSession = sessionManagementService.getActiveSession();
      if (!activeSession) {
        return false;
      }
      const agentSession = agentSessionsService.getSession(activeSession.resource);
      return !!agentSession?.changes && hasValidDiff(agentSession.changes);
    }));
  }
};
ChangesViewActionsContribution = __decorate([
  __param(0, IContextKeyService),
  __param(1, ISessionsManagementService),
  __param(2, IAgentSessionsService)
], ChangesViewActionsContribution);
registerWorkbenchContribution2(
  ChangesViewActionsContribution.ID,
  ChangesViewActionsContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=changesViewActions.js.map
