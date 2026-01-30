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
var McpServerRenderer_1;
import "./media/mcpServersView.css";
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { createMarkdownCommandLink, MarkdownString } from "../../../../base/common/htmlContent.js";
import { combinedDisposable, Disposable, DisposableStore, dispose, isDisposable } from "../../../../base/common/lifecycle.js";
import { DelayedPagedModel, PagedModel, IterativePagedModel } from "../../../../base/common/paging.js";
import { localize, localize2 } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyDefinedExpr, ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { WorkbenchPagedList } from "../../../../platform/list/browser/listService.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { getLocationBasedViewColors } from "../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService, Extensions as ViewExtensions } from "../../../common/views.js";
import { HasInstalledMcpServersContext, IMcpWorkbenchService, InstalledMcpServersViewId, McpServerContainers, McpServersGalleryStatusContext } from "../common/mcpTypes.js";
import { DropDownAction, getContextMenuActions, InstallAction, InstallingLabelAction, ManageMcpServerAction, McpServerStatusAction } from "./mcpServerActions.js";
import { PublisherWidget, StarredWidget, McpServerIconWidget, McpServerHoverWidget, McpServerScopeBadgeWidget } from "./mcpServerWidgets.js";
import { ActionRunner, Separator } from "../../../../base/common/actions.js";
import { mcpGalleryServiceEnablementConfig, mcpGalleryServiceUrlConfig } from "../../../../platform/mcp/common/mcpManagement.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { DefaultViewsContext, SearchMcpServersContext } from "../../extensions/common/extensions.js";
import { VIEW_CONTAINER } from "../../extensions/browser/extensions.contribution.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { AbstractExtensionsListView } from "../../extensions/browser/extensionsViews.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { mcpServerIcon } from "./mcpServerIcons.js";
import { IMcpGalleryManifestService } from "../../../../platform/mcp/common/mcpGalleryManifest.js";
import { ProductQualityContext } from "../../../../platform/contextkey/common/contextkeys.js";
import { SeverityIcon } from "../../../../base/browser/ui/severityIcon/severityIcon.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.js";
let McpServersListView = class McpServersListView2 extends AbstractExtensionsListView {
  static {
    __name(this, "McpServersListView");
  }
  constructor(mpcViewOptions, options, keybindingService, contextMenuService, instantiationService, themeService, hoverService, configurationService, contextKeyService, viewDescriptorService, openerService, dialogService, mcpWorkbenchService, mcpGalleryManifestService, layoutService, markdownRendererService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.mpcViewOptions = mpcViewOptions;
    this.dialogService = dialogService;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.mcpGalleryManifestService = mcpGalleryManifestService;
    this.layoutService = layoutService;
    this.markdownRendererService = markdownRendererService;
    this.list = null;
    this.listContainer = null;
    this.welcomeContainer = null;
    this.contextMenuActionRunner = this._register(new ActionRunner());
  }
  renderBody(container) {
    super.renderBody(container);
    this.welcomeContainer = dom.append(container, dom.$(".mcp-welcome-container.hide"));
    this.createWelcomeContent(this.welcomeContainer);
    const messageContainer = dom.append(container, dom.$(".message-container"));
    const messageSeverityIcon = dom.append(messageContainer, dom.$(""));
    const messageBox = dom.append(messageContainer, dom.$(".message"));
    const mcpServersList = dom.$(".mcp-servers-list");
    this.bodyTemplate = {
      mcpServersList,
      messageBox,
      messageContainer,
      messageSeverityIcon
    };
    this.listContainer = dom.append(container, mcpServersList);
    this.list = this._register(this.instantiationService.createInstance(WorkbenchPagedList, `${this.id}-MCP-Servers`, this.listContainer, {
      getHeight() {
        return 72;
      },
      getTemplateId: /* @__PURE__ */ __name(() => McpServerRenderer.templateId, "getTemplateId")
    }, [this.instantiationService.createInstance(McpServerRenderer, {
      hoverOptions: {
        position: /* @__PURE__ */ __name(() => {
          const viewLocation = this.viewDescriptorService.getViewLocationById(this.id);
          if (viewLocation === 0) {
            return this.layoutService.getSideBarPosition() === 0 ? 1 : 0;
          }
          if (viewLocation === 2) {
            return this.layoutService.getSideBarPosition() === 0 ? 0 : 1;
          }
          return 1;
        }, "position")
      }
    })], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(mcpServer) {
          return mcpServer?.label ?? "";
        },
        getWidgetAriaLabel() {
          return localize("mcp servers", "MCP Servers");
        }
      },
      overrideStyles: getLocationBasedViewColors(this.viewDescriptorService.getViewLocationById(this.id)).listOverrideStyles,
      openOnSingleClick: true
    }));
    this._register(Event.debounce(Event.filter(this.list.onDidOpen, (e) => e.element !== null), (_, event) => event, 75, true)((options) => {
      this.mcpWorkbenchService.open(options.element, options.editorOptions);
    }));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e), this));
    if (this.input) {
      this.renderInput();
    }
  }
  async onContextMenu(e) {
    if (e.element) {
      const disposables = new DisposableStore();
      const mcpServer = e.element ? this.mcpWorkbenchService.local.find((local) => local.id === e.element.id) || e.element : e.element;
      const groups = getContextMenuActions(mcpServer, false, this.instantiationService);
      const actions = [];
      for (const menuActions of groups) {
        for (const menuAction of menuActions) {
          actions.push(menuAction);
          if (isDisposable(menuAction)) {
            disposables.add(menuAction);
          }
        }
        actions.push(new Separator());
      }
      actions.pop();
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
        actionRunner: this.contextMenuActionRunner,
        onHide: /* @__PURE__ */ __name(() => disposables.dispose(), "onHide")
      });
    }
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.list?.layout(height, width);
  }
  async show(query) {
    if (this.input) {
      this.input.disposables.dispose();
      this.input = void 0;
    }
    if (this.mpcViewOptions.showWelcome) {
      this.input = { model: new PagedModel([]), disposables: new DisposableStore(), showWelcomeContent: true };
    } else {
      this.input = await this.query(query.trim());
    }
    this.renderInput();
    if (this.input.onDidChangeModel) {
      this.input.disposables.add(this.input.onDidChangeModel((model) => {
        if (!this.input) {
          return;
        }
        this.input.model = model;
        this.renderInput();
      }));
    }
    return this.input.model;
  }
  renderInput() {
    if (!this.input) {
      return;
    }
    if (this.list) {
      this.list.model = new DelayedPagedModel(this.input.model);
    }
    this.showWelcomeContent(!!this.input.showWelcomeContent);
    if (!this.input.showWelcomeContent) {
      this.updateBody();
    }
  }
  showWelcomeContent(show) {
    this.welcomeContainer?.classList.toggle("hide", !show);
    this.listContainer?.classList.toggle("hide", show);
  }
  createWelcomeContent(welcomeContainer) {
    const welcomeContent = dom.append(welcomeContainer, dom.$(".mcp-welcome-content"));
    const iconContainer = dom.append(welcomeContent, dom.$(".mcp-welcome-icon"));
    const iconElement = dom.append(iconContainer, dom.$("span"));
    iconElement.className = ThemeIcon.asClassName(mcpServerIcon);
    const title = dom.append(welcomeContent, dom.$(".mcp-welcome-title"));
    title.textContent = localize("mcp.welcome.title", "MCP Servers");
    const settingsCommandLink = createMarkdownCommandLink({ id: "workbench.action.openSettings", arguments: [`@id:${mcpGalleryServiceEnablementConfig}`], title: mcpGalleryServiceEnablementConfig, tooltip: localize("mcp.welcome.settings.tooltip", "Open Settings") }).toString();
    const description = dom.append(welcomeContent, dom.$(".mcp-welcome-description"));
    const markdownResult = this._register(this.markdownRendererService.render(new MarkdownString(localize("mcp.welcome.descriptionWithLink", "Browse and install [Model Context Protocol (MCP) servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) directly from VS Code to extend agent mode with extra tools for connecting to databases, invoking APIs and performing specialized tasks."), { isTrusted: { enabledCommands: ["workbench.action.openSettings"] } }).appendMarkdown("\n\n").appendMarkdown(localize("mcp.gallery.enableDialog.setting", "This feature is currently in preview. You can disable it anytime using the setting {0}.", settingsCommandLink))));
    description.appendChild(markdownResult.element);
    const buttonContainer = dom.append(welcomeContent, dom.$(".mcp-welcome-button-container"));
    const button = this._register(new Button(buttonContainer, {
      title: localize("mcp.welcome.enableGalleryButton", "Enable MCP Servers Marketplace"),
      ...defaultButtonStyles
    }));
    button.label = localize("mcp.welcome.enableGalleryButton", "Enable MCP Servers Marketplace");
    this._register(button.onDidClick(async () => {
      const { result } = await this.dialogService.prompt({
        type: "info",
        message: localize("mcp.gallery.enableDialog.title", "Enable MCP Servers Marketplace?"),
        custom: {
          markdownDetails: [{
            markdown: new MarkdownString(localize("mcp.gallery.enableDialog.setting", "This feature is currently in preview. You can disable it anytime using the setting {0}.", settingsCommandLink), { isTrusted: true })
          }]
        },
        buttons: [
          { label: localize("mcp.gallery.enableDialog.enable", "Enable"), run: /* @__PURE__ */ __name(() => true, "run") },
          { label: localize("mcp.gallery.enableDialog.cancel", "Cancel"), run: /* @__PURE__ */ __name(() => false, "run") }
        ]
      });
      if (result) {
        await this.configurationService.updateValue(mcpGalleryServiceEnablementConfig, true);
      }
    }));
  }
  updateBody(message) {
    if (this.bodyTemplate) {
      const count = this.input?.model.length ?? 0;
      this.bodyTemplate.mcpServersList.classList.toggle("hidden", count === 0);
      this.bodyTemplate.messageContainer.classList.toggle("hidden", !message && count > 0);
      if (this.isBodyVisible()) {
        if (message) {
          this.bodyTemplate.messageSeverityIcon.className = SeverityIcon.className(message.severity);
          this.bodyTemplate.messageBox.textContent = message.text;
        } else if (count === 0) {
          this.bodyTemplate.messageSeverityIcon.className = "";
          this.bodyTemplate.messageBox.textContent = localize("no extensions found", "No MCP Servers found.");
        }
        if (this.bodyTemplate.messageBox.textContent) {
          alert(this.bodyTemplate.messageBox.textContent);
        }
      }
    }
  }
  async query(query) {
    const disposables = new DisposableStore();
    if (query) {
      const servers2 = await this.mcpWorkbenchService.queryGallery({ text: query.replace("@mcp", "") });
      const model = disposables.add(new IterativePagedModel(servers2));
      return { model, disposables };
    }
    const onDidChangeModel = disposables.add(new Emitter());
    let servers = await this.mcpWorkbenchService.queryLocal();
    disposables.add(Event.debounce(this.mcpWorkbenchService.onChange, () => void 0)(() => {
      const mergedMcpServers = this.mergeChangedMcpServers(servers, [...this.mcpWorkbenchService.local]);
      if (mergedMcpServers) {
        servers = mergedMcpServers;
        onDidChangeModel.fire(new PagedModel(servers));
      }
    }));
    disposables.add(this.mcpWorkbenchService.onReset(() => onDidChangeModel.fire(new PagedModel([...this.mcpWorkbenchService.local]))));
    return { model: new PagedModel(servers), onDidChangeModel: onDidChangeModel.event, disposables };
  }
  mergeChangedMcpServers(mcpServers, newMcpServers) {
    const oldMcpServers = [...mcpServers];
    const findPreviousMcpServerIndex = /* @__PURE__ */ __name((from) => {
      let index = -1;
      const previousMcpServerInNew = newMcpServers[from];
      if (previousMcpServerInNew) {
        index = oldMcpServers.findIndex((e) => e.id === previousMcpServerInNew.id);
        if (index === -1) {
          return findPreviousMcpServerIndex(from - 1);
        }
      }
      return index;
    }, "findPreviousMcpServerIndex");
    let hasChanged = false;
    for (let index = 0; index < newMcpServers.length; index++) {
      const newMcpServer = newMcpServers[index];
      if (mcpServers.every((r) => r.id !== newMcpServer.id)) {
        hasChanged = true;
        mcpServers.splice(findPreviousMcpServerIndex(index - 1) + 1, 0, newMcpServer);
      }
    }
    for (let index = mcpServers.length - 1; index >= 0; index--) {
      const oldMcpServer = mcpServers[index];
      if (newMcpServers.every((r) => r.id !== oldMcpServer.id) && newMcpServers.some((r) => r.name === oldMcpServer.name)) {
        hasChanged = true;
        mcpServers.splice(index, 1);
      }
    }
    if (!hasChanged) {
      if (mcpServers.length === newMcpServers.length) {
        for (let index = 0; index < newMcpServers.length; index++) {
          if (mcpServers[index]?.id !== newMcpServers[index]?.id) {
            hasChanged = true;
            mcpServers = newMcpServers;
            break;
          }
        }
      }
    }
    return hasChanged ? mcpServers : void 0;
  }
};
McpServersListView = __decorate([
  __param(2, IKeybindingService),
  __param(3, IContextMenuService),
  __param(4, IInstantiationService),
  __param(5, IThemeService),
  __param(6, IHoverService),
  __param(7, IConfigurationService),
  __param(8, IContextKeyService),
  __param(9, IViewDescriptorService),
  __param(10, IOpenerService),
  __param(11, IDialogService),
  __param(12, IMcpWorkbenchService),
  __param(13, IMcpGalleryManifestService),
  __param(14, IWorkbenchLayoutService),
  __param(15, IMarkdownRendererService)
], McpServersListView);
let McpServerRenderer = class McpServerRenderer2 {
  static {
    __name(this, "McpServerRenderer");
  }
  static {
    McpServerRenderer_1 = this;
  }
  static {
    this.templateId = "mcpServer";
  }
  constructor(options, instantiationService, mcpWorkbenchService, notificationService) {
    this.options = options;
    this.instantiationService = instantiationService;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.notificationService = notificationService;
    this.templateId = McpServerRenderer_1.templateId;
  }
  renderTemplate(root) {
    const element = dom.append(root, dom.$(".mcp-server-item.extension-list-item"));
    const iconContainer = dom.append(element, dom.$(".icon-container"));
    const iconWidget = this.instantiationService.createInstance(McpServerIconWidget, iconContainer);
    const details = dom.append(element, dom.$(".details"));
    const headerContainer = dom.append(details, dom.$(".header-container"));
    const header = dom.append(headerContainer, dom.$(".header"));
    const name = dom.append(header, dom.$("span.name"));
    const starred = dom.append(header, dom.$("span.ratings"));
    const description = dom.append(details, dom.$(".description.ellipsis"));
    const footer = dom.append(details, dom.$(".footer"));
    const publisherWidget = this.instantiationService.createInstance(PublisherWidget, dom.append(footer, dom.$(".publisher-container")), true);
    const actionbar = new ActionBar(footer, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof DropDownAction) {
          return action.createActionViewItem(options);
        }
        return void 0;
      }, "actionViewItemProvider"),
      focusOnlyEnabledItems: true
    });
    actionbar.setFocusable(false);
    const actionBarListener = actionbar.onDidRun(({ error }) => error && this.notificationService.error(error));
    const mcpServerStatusAction = this.instantiationService.createInstance(McpServerStatusAction);
    const actions = [
      this.instantiationService.createInstance(InstallAction, true),
      this.instantiationService.createInstance(InstallingLabelAction),
      this.instantiationService.createInstance(ManageMcpServerAction, false),
      mcpServerStatusAction
    ];
    const widgets = [
      iconWidget,
      publisherWidget,
      this.instantiationService.createInstance(StarredWidget, starred, true),
      this.instantiationService.createInstance(McpServerScopeBadgeWidget, iconContainer),
      this.instantiationService.createInstance(McpServerHoverWidget, { target: root, position: this.options.hoverOptions.position }, mcpServerStatusAction)
    ];
    const extensionContainers = this.instantiationService.createInstance(McpServerContainers, [...actions, ...widgets]);
    actionbar.push(actions, { icon: true, label: true });
    const disposable = combinedDisposable(...actions, ...widgets, actionbar, actionBarListener, extensionContainers);
    return {
      root,
      element,
      name,
      description,
      starred,
      disposables: [disposable],
      actionbar,
      mcpServerDisposables: [],
      set mcpServer(mcpServer) {
        extensionContainers.mcpServer = mcpServer;
      }
    };
  }
  renderPlaceholder(index, data) {
    data.element.classList.add("loading");
    data.mcpServerDisposables = dispose(data.mcpServerDisposables);
    data.name.textContent = "";
    data.description.textContent = "";
    data.starred.style.display = "none";
    data.mcpServer = null;
  }
  renderElement(mcpServer, index, data) {
    data.element.classList.remove("loading");
    data.mcpServerDisposables = dispose(data.mcpServerDisposables);
    data.root.setAttribute("data-mcp-server-id", mcpServer.id);
    data.name.textContent = mcpServer.label;
    data.description.textContent = mcpServer.description;
    data.starred.style.display = "";
    data.mcpServer = mcpServer;
    const updateEnablement = /* @__PURE__ */ __name(() => data.root.classList.toggle(
      "disabled",
      !!mcpServer.runtimeStatus?.state && mcpServer.runtimeStatus.state !== 2
      /* McpServerEnablementState.Enabled */
    ), "updateEnablement");
    updateEnablement();
    data.mcpServerDisposables.push(this.mcpWorkbenchService.onChange((e) => {
      if (!e || e.id === mcpServer.id) {
        updateEnablement();
      }
    }));
  }
  disposeElement(mcpServer, index, data) {
    data.mcpServerDisposables = dispose(data.mcpServerDisposables);
  }
  disposeTemplate(data) {
    data.mcpServerDisposables = dispose(data.mcpServerDisposables);
    data.disposables = dispose(data.disposables);
  }
};
McpServerRenderer = McpServerRenderer_1 = __decorate([
  __param(1, IInstantiationService),
  __param(2, IMcpWorkbenchService),
  __param(3, INotificationService)
], McpServerRenderer);
class DefaultBrowseMcpServersView extends McpServersListView {
  static {
    __name(this, "DefaultBrowseMcpServersView");
  }
  renderBody(container) {
    super.renderBody(container);
    this._register(this.mcpGalleryManifestService.onDidChangeMcpGalleryManifest(() => this.show()));
  }
  async show() {
    return super.show("@mcp");
  }
}
class McpServersViewsContribution extends Disposable {
  static {
    __name(this, "McpServersViewsContribution");
  }
  static {
    this.ID = "workbench.mcp.servers.views.contribution";
  }
  constructor() {
    super();
    Registry.as(ViewExtensions.ViewsRegistry).registerViews([
      {
        id: InstalledMcpServersViewId,
        name: localize2("mcp-installed", "MCP Servers - Installed"),
        ctorDescriptor: new SyncDescriptor(McpServersListView, [{}]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledMcpServersContext, ChatContextKeys.Setup.hidden.negate()),
        weight: 40,
        order: 4,
        canToggleVisibility: true
      },
      {
        id: "workbench.views.mcp.default.marketplace",
        name: localize2("mcp", "MCP Servers"),
        ctorDescriptor: new SyncDescriptor(DefaultBrowseMcpServersView, [{}]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledMcpServersContext.toNegated(), ChatContextKeys.Setup.hidden.negate(), McpServersGalleryStatusContext.isEqualTo(
          "available"
          /* McpGalleryManifestStatus.Available */
        ), ContextKeyExpr.or(ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceUrlConfig}`), ProductQualityContext.notEqualsTo("stable"), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceEnablementConfig}`))),
        weight: 40,
        order: 4,
        canToggleVisibility: true
      },
      {
        id: "workbench.views.mcp.marketplace",
        name: localize2("mcp", "MCP Servers"),
        ctorDescriptor: new SyncDescriptor(McpServersListView, [{}]),
        when: ContextKeyExpr.and(SearchMcpServersContext, ChatContextKeys.Setup.hidden.negate(), McpServersGalleryStatusContext.isEqualTo(
          "available"
          /* McpGalleryManifestStatus.Available */
        ), ContextKeyExpr.or(ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceUrlConfig}`), ProductQualityContext.notEqualsTo("stable"), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceEnablementConfig}`)))
      },
      {
        id: "workbench.views.mcp.default.welcomeView",
        name: localize2("mcp", "MCP Servers"),
        ctorDescriptor: new SyncDescriptor(DefaultBrowseMcpServersView, [{ showWelcome: true }]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledMcpServersContext.toNegated(), ChatContextKeys.Setup.hidden.negate(), McpServersGalleryStatusContext.isEqualTo(
          "available"
          /* McpGalleryManifestStatus.Available */
        ), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceUrlConfig}`).negate(), ProductQualityContext.isEqualTo("stable"), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceEnablementConfig}`).negate()),
        weight: 40,
        order: 4,
        canToggleVisibility: true
      },
      {
        id: "workbench.views.mcp.welcomeView",
        name: localize2("mcp", "MCP Servers"),
        ctorDescriptor: new SyncDescriptor(McpServersListView, [{ showWelcome: true }]),
        when: ContextKeyExpr.and(SearchMcpServersContext, ChatContextKeys.Setup.hidden.negate(), McpServersGalleryStatusContext.isEqualTo(
          "available"
          /* McpGalleryManifestStatus.Available */
        ), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceUrlConfig}`).negate(), ProductQualityContext.isEqualTo("stable"), ContextKeyDefinedExpr.create(`config.${mcpGalleryServiceEnablementConfig}`).negate())
      }
    ], VIEW_CONTAINER);
  }
}
export {
  DefaultBrowseMcpServersView,
  McpServersListView,
  McpServersViewsContribution
};
//# sourceMappingURL=mcpServersView.js.map
