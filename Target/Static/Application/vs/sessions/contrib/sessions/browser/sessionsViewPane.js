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
import "../../../browser/media/sidebarActionButton.css";
import "./media/customizationsToolbar.css";
import "./media/sessionsViewPane.css";
import * as DOM from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
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
import { IPromptsService } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { IMcpService } from "../../../../workbench/contrib/mcp/common/mcpTypes.js";
import { IAICustomizationWorkspaceService } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { ISessionsManagementService } from "./sessionsManagementService.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IWorkbenchLayoutService } from "../../../../workbench/services/layout/browser/layoutService.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ACTION_ID_NEW_CHAT } from "../../../../workbench/contrib/chat/browser/actions/chatActions.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IViewsService } from "../../../../workbench/services/views/common/viewsService.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { Menus } from "../../../browser/menus.js";
import { getCustomizationTotalCount } from "./customizationCounts.js";
import { IHostService } from "../../../../workbench/services/host/browser/host.js";
const $ = DOM.$;
const SessionsViewId = "agentic.workbench.view.sessionsView";
const SessionsViewFilterSubMenu = new MenuId("AgentSessionsViewFilterSubMenu");
const CUSTOMIZATIONS_COLLAPSED_KEY = "agentSessions.customizationsCollapsed";
let AgenticSessionsViewPane = class AgenticSessionsViewPane2 extends ViewPane {
  static {
    __name(this, "AgenticSessionsViewPane");
  }
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, layoutService, storageService, promptsService, mcpService, workspaceContextService, activeSessionService, hostService, workspaceService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.layoutService = layoutService;
    this.storageService = storageService;
    this.promptsService = promptsService;
    this.mcpService = mcpService;
    this.workspaceContextService = workspaceContextService;
    this.activeSessionService = activeSessionService;
    this.hostService = hostService;
    this.workspaceService = workspaceService;
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
    const sessionsFilter = this._register(this.instantiationService.createInstance(AgentSessionsFilter, {
      filterMenuId: SessionsViewFilterSubMenu,
      groupResults: /* @__PURE__ */ __name(() => AgentSessionsGrouping.Date, "groupResults"),
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
    this.aiCustomizationContainer = DOM.append(sessionsContainer, $("div"));
    this.createAICustomizationShortcuts(this.aiCustomizationContainer);
  }
  restoreLastSelectedSession() {
    const activeSession = this.activeSessionService.getActiveSession();
    if (activeSession && this.sessionsControl) {
      this.sessionsControl.reveal(activeSession.resource);
    }
  }
  createAICustomizationShortcuts(container) {
    const isCollapsed = this.storageService.getBoolean(CUSTOMIZATIONS_COLLAPSED_KEY, 0, false);
    container.classList.add("ai-customization-toolbar");
    if (isCollapsed) {
      container.classList.add("collapsed");
    }
    const header = DOM.append(container, $(".ai-customization-header"));
    header.classList.toggle("collapsed", isCollapsed);
    const headerButtonContainer = DOM.append(header, $(".customization-link-button-container"));
    const headerButton = this._register(new Button(headerButtonContainer, {
      ...defaultButtonStyles,
      secondary: true,
      title: false,
      supportIcons: true,
      buttonSecondaryBackground: "transparent",
      buttonSecondaryHoverBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryBorder: void 0
    }));
    headerButton.element.classList.add("customization-link-button", "sidebar-action-button");
    headerButton.element.setAttribute("aria-expanded", String(!isCollapsed));
    headerButton.label = localize("customizations", "CUSTOMIZATIONS");
    const chevronContainer = DOM.append(headerButton.element, $("span.customization-link-counts"));
    const chevron = DOM.append(chevronContainer, $(".ai-customization-chevron"));
    const headerTotalCount = DOM.append(chevronContainer, $("span.ai-customization-header-total.hidden"));
    chevron.classList.add(...ThemeIcon.asClassNameArray(isCollapsed ? Codicon.chevronRight : Codicon.chevronDown));
    const toolbarContainer = DOM.append(container, $(".ai-customization-toolbar-content.sidebar-action-list"));
    this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarContainer, Menus.SidebarCustomizations, {
      hiddenItemStrategy: -1,
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup") },
      telemetrySource: "sidebarCustomizations"
    }));
    let updateCountRequestId = 0;
    const updateHeaderTotalCount = /* @__PURE__ */ __name(async () => {
      const requestId = ++updateCountRequestId;
      const totalCount = await getCustomizationTotalCount(this.promptsService, this.mcpService, this.workspaceService, this.workspaceContextService);
      if (requestId !== updateCountRequestId) {
        return;
      }
      headerTotalCount.classList.toggle("hidden", totalCount === 0);
      headerTotalCount.textContent = `${totalCount}`;
    }, "updateHeaderTotalCount");
    this._register(this.promptsService.onDidChangeCustomAgents(() => updateHeaderTotalCount()));
    this._register(this.promptsService.onDidChangeSlashCommands(() => updateHeaderTotalCount()));
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => updateHeaderTotalCount()));
    this._register(autorun((reader) => {
      this.mcpService.servers.read(reader);
      updateHeaderTotalCount();
    }));
    this._register(autorun((reader) => {
      this.workspaceService.activeProjectRoot.read(reader);
      updateHeaderTotalCount();
    }));
    updateHeaderTotalCount();
    const transitionListener = this._register(new MutableDisposable());
    const toggleCollapse = /* @__PURE__ */ __name(() => {
      const collapsed = container.classList.toggle("collapsed");
      header.classList.toggle("collapsed", collapsed);
      this.storageService.store(
        CUSTOMIZATIONS_COLLAPSED_KEY,
        collapsed,
        0,
        0
        /* StorageTarget.USER */
      );
      headerButton.element.setAttribute("aria-expanded", String(!collapsed));
      chevron.classList.remove(...ThemeIcon.asClassNameArray(Codicon.chevronRight), ...ThemeIcon.asClassNameArray(Codicon.chevronDown));
      chevron.classList.add(...ThemeIcon.asClassNameArray(collapsed ? Codicon.chevronRight : Codicon.chevronDown));
      transitionListener.value = DOM.addDisposableListener(toolbarContainer, "transitionend", () => {
        transitionListener.clear();
        if (this.viewPaneContainer) {
          const { offsetHeight, offsetWidth } = this.viewPaneContainer;
          this.layoutBody(offsetHeight, offsetWidth);
        }
      });
    }, "toggleCollapse");
    this._register(headerButton.onDidClick(() => toggleCollapse()));
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
  __param(11, IStorageService),
  __param(12, IPromptsService),
  __param(13, IMcpService),
  __param(14, IWorkspaceContextService),
  __param(15, ISessionsManagementService),
  __param(16, IHostService),
  __param(17, IAICustomizationWorkspaceService)
], AgenticSessionsViewPane);
KeybindingsRegistry.registerKeybindingRule({
  id: ACTION_ID_NEW_CHAT,
  weight: 200 + 1,
  primary: 2048 | 44
});
MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
  submenu: SessionsViewFilterSubMenu,
  title: localize2("filterAgentSessions", "Filter Sessions"),
  group: "navigation",
  order: 3,
  icon: Codicon.filter,
  when: ContextKeyExpr.equals("view", SessionsViewId)
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
