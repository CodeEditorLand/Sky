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
import "./media/changesViewActions.css";
import { $, reset } from "../../../../base/browser/dom.js";
import { BaseActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun, observableFromEvent } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize, localize2 } from "../../../../nls.js";
import { IActionViewItemService } from "../../../../platform/actions/browser/actionViewItemService.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { getAgentChangesSummary, hasValidDiff } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsModel.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { IViewsService } from "../../../../workbench/services/views/common/viewsService.js";
import { Menus } from "../../../browser/menus.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { CHANGES_VIEW_ID } from "./changesView.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { bindContextKey } from "../../../../platform/observable/common/platformObservableUtils.js";
import { activeSessionHasChangesContextKey } from "../common/changes.js";
const openChangesViewActionOptions = {
  id: "workbench.action.agentSessions.openChangesView",
  title: localize2("openChangesView", "Changes"),
  icon: Codicon.diffMultiple,
  f1: false,
  menu: {
    id: Menus.SessionTitleActions,
    order: 1,
    when: ContextKeyExpr.equals(activeSessionHasChangesContextKey.key, true)
  }
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
let ChangesActionViewItem = class ChangesActionViewItem2 extends BaseActionViewItem {
  static {
    __name(this, "ChangesActionViewItem");
  }
  constructor(action, options, sessionManagementService, agentSessionsService, hoverService) {
    super(void 0, action, options);
    this.sessionManagementService = sessionManagementService;
    this.agentSessionsService = agentSessionsService;
    this.hoverService = hoverService;
    this._renderDisposables = this._register(new DisposableStore());
    this._register(autorun((reader) => {
      this.sessionManagementService.activeSession.read(reader);
      this._updateLabel();
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => {
      this._updateLabel();
    }));
  }
  render(container) {
    super.render(container);
    this._container = container;
    container.classList.add("changes-action-view-item");
    this._updateLabel();
  }
  _updateLabel() {
    if (!this._container) {
      return;
    }
    this._renderDisposables.clear();
    reset(this._container);
    const activeSession = this.sessionManagementService.getActiveSession();
    if (!activeSession) {
      this._container.style.display = "none";
      return;
    }
    const agentSession = this.agentSessionsService.getSession(activeSession.resource);
    const changes = agentSession?.changes;
    if (!changes || !hasValidDiff(changes)) {
      this._container.style.display = "none";
      return;
    }
    const summary = getAgentChangesSummary(changes);
    if (!summary) {
      this._container.style.display = "none";
      return;
    }
    this._container.style.display = "";
    const iconEl = $("span.changes-action-icon" + ThemeIcon.asCSSSelector(Codicon.diffMultiple));
    this._container.appendChild(iconEl);
    const addedEl = $("span.changes-action-added");
    addedEl.textContent = `+${summary.insertions}`;
    this._container.appendChild(addedEl);
    const removedEl = $("span.changes-action-removed");
    removedEl.textContent = `-${summary.deletions}`;
    this._container.appendChild(removedEl);
    this._renderDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this._container, localize("agentSessions.viewChanges", "View All Changes")));
  }
};
ChangesActionViewItem = __decorate([
  __param(2, ISessionsManagementService),
  __param(3, IAgentSessionsService),
  __param(4, IHoverService)
], ChangesActionViewItem);
let ChangesViewActionsContribution = class ChangesViewActionsContribution2 extends Disposable {
  static {
    __name(this, "ChangesViewActionsContribution");
  }
  static {
    this.ID = "workbench.contrib.changesViewActions";
  }
  constructor(actionViewItemService, instantiationService, contextKeyService, sessionManagementService, agentSessionsService) {
    super();
    this._register(actionViewItemService.register(Menus.SessionTitleActions, OpenChangesViewAction.ID, (action, options) => {
      return instantiationService.createInstance(ChangesActionViewItem, action, options);
    }));
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
  __param(0, IActionViewItemService),
  __param(1, IInstantiationService),
  __param(2, IContextKeyService),
  __param(3, ISessionsManagementService),
  __param(4, IAgentSessionsService)
], ChangesViewActionsContribution);
registerWorkbenchContribution2(
  ChangesViewActionsContribution.ID,
  ChangesViewActionsContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=changesViewActions.js.map
