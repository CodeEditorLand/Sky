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
import "./media/sessionsViewPane.css";
import * as DOM from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { autorun } from "../../../../base/common/observable.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { EditorsVisibleContext } from "../../../../workbench/common/contextkeys.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ViewPane } from "../../../../workbench/browser/parts/views/viewPane.js";
import { IViewDescriptorService } from "../../../../workbench/common/views.js";
import { sessionsSidebarBackground } from "../../../common/theme.js";
import { SessionsCategories } from "../../../common/categories.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { localize, localize2 } from "../../../../nls.js";
import { AgentSessionsControl } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsControl.js";
import { AgentSessionsFilter, AgentSessionsGrouping } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsFilter.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { ISessionsManagementService, IsNewChatSessionContext } from "./sessionsManagementService.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IWorkbenchLayoutService } from "../../../../workbench/services/layout/browser/layoutService.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ACTION_ID_NEW_CHAT } from "../../../../workbench/contrib/chat/browser/actions/chatActions.js";
import { IViewsService } from "../../../../workbench/services/views/common/viewsService.js";
import { AICustomizationShortcutsWidget } from "./aiCustomizationShortcutsWidget.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IHostService } from "../../../../workbench/services/host/browser/host.js";
const $ = DOM.$;
const SessionsViewId = "agentic.workbench.view.sessionsView";
const SessionsViewFilterSubMenu = new MenuId("AgentSessionsViewFilterSubMenu");
const IsGroupedByRepositoryContext = new RawContextKey("sessionsView.isGroupedByRepository", false);
const GROUPING_STORAGE_KEY = "agentSessions.grouping";
let AgenticSessionsViewPane = class AgenticSessionsViewPane2 extends ViewPane {
  static {
    __name(this, "AgenticSessionsViewPane");
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, layoutService, activeSessionService, hostService, storageService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.layoutService = layoutService;
    this.activeSessionService = activeSessionService;
    this.hostService = hostService;
    this.storageService = storageService;
    this.currentGrouping = AgentSessionsGrouping.Date;
    const stored = this.storageService.get(
      GROUPING_STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (stored && Object.values(AgentSessionsGrouping).includes(stored)) {
      this.currentGrouping = stored;
    }
  }
  renderBody(parent) {
    super.renderBody(parent);
    this.viewPaneContainer = parent;
    this.viewPaneContainer.classList.add("agent-sessions-viewpane");
    this.createControls(parent);
  }
  getLocationBasedColors() {
    const colors = super.getLocationBasedColors();
    return {
      ...colors,
      background: sessionsSidebarBackground,
      listOverrideStyles: {
        ...colors.listOverrideStyles,
        listBackground: sessionsSidebarBackground
      }
    };
  }
  createControls(parent) {
    const sessionsContainer = DOM.append(parent, $(".agent-sessions-container"));
    const isGroupedByRepoKey = this.isGroupedByRepoKey = IsGroupedByRepositoryContext.bindTo(this.contextKeyService);
    isGroupedByRepoKey.set(this.currentGrouping === AgentSessionsGrouping.Repository);
    const sessionsFilter = this._register(this.instantiationService.createInstance(AgentSessionsFilter, {
      filterMenuId: SessionsViewFilterSubMenu,
      groupResults: /* @__PURE__ */ __name(() => this.currentGrouping, "groupResults"),
      allowedProviders: [AgentSessionProviders.Background, AgentSessionProviders.Cloud],
      providerLabelOverrides: /* @__PURE__ */ new Map([
        [AgentSessionProviders.Background, localize("chat.session.providerLabel.local", "Local")]
      ])
    }));
    const sessionsSection = DOM.append(sessionsContainer, $(".agent-sessions-section"));
    const sessionsContent = DOM.append(sessionsSection, $(".agent-sessions-content"));
    const newSessionButtonContainer = DOM.append(sessionsContent, $(".agent-sessions-new-button-container"));
    const newSessionButton = this._register(new Button(newSessionButtonContainer, { ...defaultButtonStyles, secondary: true }));
    newSessionButton.label = localize("newSession", "New Session");
    this._register(newSessionButton.onDidClick(() => this.activeSessionService.openNewSessionView()));
    const keybinding = this.keybindingService.lookupKeybinding(ACTION_ID_NEW_CHAT);
    if (keybinding) {
      const keybindingHint = DOM.append(newSessionButton.element, $("span.new-session-keybinding-hint"));
      keybindingHint.textContent = keybinding.getLabel() ?? "";
    }
    this.sessionsControlContainer = DOM.append(sessionsContent, $(".agent-sessions-control-container"));
    const sessionsControl = this.sessionsControl = this._register(this.instantiationService.createInstance(AgentSessionsControl, this.sessionsControlContainer, {
      source: "agentSessionsViewPane",
      filter: sessionsFilter,
      overrideStyles: this.getLocationBasedColors().listOverrideStyles,
      disableHover: true,
      showIsolationIcon: true,
      enableApprovalRow: true,
      getHoverPosition: /* @__PURE__ */ __name(() => this.getSessionHoverPosition(), "getHoverPosition"),
      trackActiveEditorSession: /* @__PURE__ */ __name(() => true, "trackActiveEditorSession"),
      collapseOlderSections: /* @__PURE__ */ __name(() => true, "collapseOlderSections"),
      overrideSessionOpen: /* @__PURE__ */ __name((resource, openOptions) => this.activeSessionService.openSession(resource, openOptions), "overrideSessionOpen")
    }));
    this._register(this.onDidChangeBodyVisibility((visible) => sessionsControl.setVisible(visible)));
    this._register(this.hostService.onDidChangeFocus((hasFocus) => {
      if (hasFocus) {
        sessionsControl.refresh();
      }
    }));
    this._register(sessionsControl.onDidUpdate(() => {
      if (!sessionsControl.hasFocusOrSelection()) {
        this.restoreLastSelectedSession();
      }
    }));
    this._register(autorun((reader) => {
      const activeSession = this.activeSessionService.activeSession.read(reader);
      if (activeSession) {
        if (!sessionsControl.reveal(activeSession.resource)) {
          sessionsControl.clearFocus();
        }
      } else {
        sessionsControl.clearFocus();
      }
    }));
    this._register(this.instantiationService.createInstance(AICustomizationShortcutsWidget, sessionsContainer, {
      onDidToggleCollapse: /* @__PURE__ */ __name(() => {
        if (this.viewPaneContainer) {
          const { offsetHeight, offsetWidth } = this.viewPaneContainer;
          this.layoutBody(offsetHeight, offsetWidth);
        }
      }, "onDidToggleCollapse")
    }));
  }
  restoreLastSelectedSession() {
    const activeSession = this.activeSessionService.getActiveSession();
    if (activeSession && this.sessionsControl) {
      this.sessionsControl.reveal(activeSession.resource);
    }
  }
  getSessionHoverPosition() {
    const viewLocation = this.viewDescriptorService.getViewLocationById(this.id);
    const sideBarPosition = this.layoutService.getSideBarPosition();
    return {
      [
        0
        /* ViewContainerLocation.Sidebar */
      ]: sideBarPosition === 0 ? 1 : 0,
      [
        2
        /* ViewContainerLocation.AuxiliaryBar */
      ]: sideBarPosition === 0 ? 0 : 1,
      [
        3
        /* ViewContainerLocation.ChatBar */
      ]: 1,
      [
        1
        /* ViewContainerLocation.Panel */
      ]: 3
      /* HoverPosition.ABOVE */
    }[
      viewLocation ?? 2
      /* ViewContainerLocation.AuxiliaryBar */
    ];
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    if (!this.sessionsControl || !this.sessionsControlContainer) {
      return;
    }
    this.sessionsControl.layout(this.sessionsControlContainer.offsetHeight, width);
  }
  focus() {
    super.focus();
    this.sessionsControl?.focus();
  }
  refresh() {
    this.sessionsControl?.refresh();
  }
  openFind() {
    this.sessionsControl?.openFind();
  }
  toggleGroupByRepository() {
    if (this.currentGrouping === AgentSessionsGrouping.Repository) {
      this.currentGrouping = AgentSessionsGrouping.Date;
    } else {
      this.currentGrouping = AgentSessionsGrouping.Repository;
    }
    this.storageService.store(
      GROUPING_STORAGE_KEY,
      this.currentGrouping,
      0,
      0
      /* StorageTarget.USER */
    );
    this.isGroupedByRepoKey?.set(this.currentGrouping === AgentSessionsGrouping.Repository);
    this.sessionsControl?.update();
  }
};
AgenticSessionsViewPane = __decorate([
  __param(1, IKeybindingService),
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IContextKeyService),
  __param(5, IViewDescriptorService),
  __param(6, IInstantiationService),
  __param(7, IOpenerService),
  __param(8, IThemeService),
  __param(9, IHoverService),
  __param(10, IWorkbenchLayoutService),
  __param(11, ISessionsManagementService),
  __param(12, IHostService),
  __param(13, IStorageService)
], AgenticSessionsViewPane);
KeybindingsRegistry.registerKeybindingRule({
  id: ACTION_ID_NEW_CHAT,
  weight: 200 + 1,
  primary: 2048 | 44
});
const CLOSE_SESSION_COMMAND_ID = "agentSession.close";
registerAction2(class CloseSessionAction extends Action2 {
  static {
    __name(this, "CloseSessionAction");
  }
  constructor() {
    super({
      id: CLOSE_SESSION_COMMAND_ID,
      title: localize2("closeSession", "Close Session"),
      f1: true,
      precondition: ContextKeyExpr.and(IsNewChatSessionContext.negate(), EditorsVisibleContext.negate()),
      category: SessionsCategories.Sessions
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsManagementService);
    await sessionsService.openNewSessionView();
  }
});
KeybindingsRegistry.registerKeybindingRule({
  id: CLOSE_SESSION_COMMAND_ID,
  weight: 200 + 1,
  when: ContextKeyExpr.and(IsNewChatSessionContext.negate(), EditorsVisibleContext.negate()),
  primary: 2048 | 53,
  win: { primary: 2048 | 62, secondary: [
    2048 | 53
    /* KeyCode.KeyW */
  ] }
});
MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
  submenu: SessionsViewFilterSubMenu,
  title: localize2("filterAgentSessions", "Filter Sessions"),
  group: "navigation",
  order: 3,
  icon: Codicon.filter,
  when: ContextKeyExpr.equals("view", SessionsViewId)
});
registerAction2(class GroupByRepositoryAction extends Action2 {
  static {
    __name(this, "GroupByRepositoryAction");
  }
  constructor() {
    super({
      id: "sessionsView.groupByRepository",
      title: localize2("groupByRepository", "Group by Repository"),
      icon: Codicon.repo,
      category: SessionsCategories.Sessions,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", SessionsViewId), IsGroupedByRepositoryContext.negate())
      }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    view?.toggleGroupByRepository();
  }
});
registerAction2(class GroupByDateAction extends Action2 {
  static {
    __name(this, "GroupByDateAction");
  }
  constructor() {
    super({
      id: "sessionsView.groupByDate",
      title: localize2("groupByDate", "Group by Date"),
      icon: Codicon.history,
      category: SessionsCategories.Sessions,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", SessionsViewId), IsGroupedByRepositoryContext)
      }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    view?.toggleGroupByRepository();
  }
});
registerAction2(class RefreshAgentSessionsViewerAction extends Action2 {
  static {
    __name(this, "RefreshAgentSessionsViewerAction");
  }
  constructor() {
    super({
      id: "sessionsView.refresh",
      title: localize2("refresh", "Refresh Sessions"),
      icon: Codicon.refresh,
      f1: true,
      category: SessionsCategories.Sessions
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    return view?.sessionsControl?.refresh();
  }
});
registerAction2(class FindAgentSessionInViewerAction extends Action2 {
  static {
    __name(this, "FindAgentSessionInViewerAction");
  }
  constructor() {
    super({
      id: "sessionsView.find",
      title: localize2("find", "Find Session"),
      icon: Codicon.search,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.equals("view", SessionsViewId)
      }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    return view?.sessionsControl?.openFind();
  }
});
export {
  AgenticSessionsViewPane,
  SessionsViewId
};
//# sourceMappingURL=sessionsViewPane.js.map
