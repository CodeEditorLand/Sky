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
import * as DOM from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IPromptsService } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { IMcpService } from "../../../../workbench/contrib/mcp/common/mcpTypes.js";
import { IAICustomizationWorkspaceService } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { Menus } from "../../../browser/menus.js";
import { getCustomizationTotalCount } from "./customizationCounts.js";
import { IAgentPluginService } from "../../../../workbench/contrib/chat/common/plugins/agentPluginService.js";
const $ = DOM.$;
const CUSTOMIZATIONS_COLLAPSED_KEY = "agentSessions.customizationsCollapsed";
let AICustomizationShortcutsWidget = class AICustomizationShortcutsWidget2 extends Disposable {
  static {
    __name(this, "AICustomizationShortcutsWidget");
  }
  constructor(container, options, instantiationService, storageService, promptsService, mcpService, workspaceContextService, workspaceService, agentPluginService) {
    super();
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.promptsService = promptsService;
    this.mcpService = mcpService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceService = workspaceService;
    this.agentPluginService = agentPluginService;
    this._render(container, options);
  }
  _render(parent, options) {
    const isCollapsed = this.storageService.getBoolean(CUSTOMIZATIONS_COLLAPSED_KEY, 0, false);
    const container = DOM.append(parent, $(".ai-customization-toolbar"));
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
      const totalCount = await getCustomizationTotalCount(this.promptsService, this.mcpService, this.workspaceService, this.workspaceContextService, this.agentPluginService);
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
        options?.onDidToggleCollapse?.();
      });
    }, "toggleCollapse");
    this._register(headerButton.onDidClick(() => toggleCollapse()));
  }
};
AICustomizationShortcutsWidget = __decorate([
  __param(2, IInstantiationService),
  __param(3, IStorageService),
  __param(4, IPromptsService),
  __param(5, IMcpService),
  __param(6, IWorkspaceContextService),
  __param(7, IAICustomizationWorkspaceService),
  __param(8, IAgentPluginService)
], AICustomizationShortcutsWidget);
export {
  AICustomizationShortcutsWidget
};
//# sourceMappingURL=aiCustomizationShortcutsWidget.js.map
