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
var InstallPluginAction_1, EnablePluginAction_1, DisablePluginAction_1, UninstallPluginAction_1, OpenPluginFolderAction_1, OpenPluginReadmeAction_1, AgentPluginRenderer_1;
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Action, Separator } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Disposable, DisposableStore, isDisposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { PagedModel } from "../../../../base/common/paging.js";
import { basename, dirname, joinPath } from "../../../../base/common/resources.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchPagedList } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { getLocationBasedViewColors } from "../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService, Extensions as ViewExtensions } from "../../../common/views.js";
import { VIEW_CONTAINER } from "../../extensions/browser/extensions.contribution.js";
import { AbstractExtensionsListView } from "../../extensions/browser/extensionsViews.js";
import { DefaultViewsContext, extensionsFilterSubMenu, IExtensionsWorkbenchService, SearchAgentPluginsContext } from "../../extensions/common/extensions.js";
import { ChatContextKeys } from "../common/actions/chatContextKeys.js";
import { IAgentPluginService } from "../common/plugins/agentPluginService.js";
import { IPluginInstallService } from "../common/plugins/pluginInstallService.js";
import { IPluginMarketplaceService } from "../common/plugins/pluginMarketplaceService.js";
const HasInstalledAgentPluginsContext = new RawContextKey("hasInstalledAgentPlugins", false);
const InstalledAgentPluginsViewId = "workbench.views.agentPlugins.installed";
var AgentPluginItemKind;
(function(AgentPluginItemKind2) {
  AgentPluginItemKind2["Installed"] = "installed";
  AgentPluginItemKind2["Marketplace"] = "marketplace";
})(AgentPluginItemKind || (AgentPluginItemKind = {}));
function installedPluginToItem(plugin, labelService) {
  const name = basename(plugin.uri);
  const description = plugin.fromMarketplace?.description ?? labelService.getUriLabel(dirname(plugin.uri), { relative: true });
  const marketplace = plugin.fromMarketplace?.marketplace;
  return { kind: "installed", name, description, marketplace, plugin };
}
__name(installedPluginToItem, "installedPluginToItem");
function marketplacePluginToItem(plugin) {
  return {
    kind: "marketplace",
    name: plugin.name,
    description: plugin.description,
    source: plugin.source,
    marketplace: plugin.marketplace,
    marketplaceReference: plugin.marketplaceReference,
    marketplaceType: plugin.marketplaceType,
    readmeUri: plugin.readmeUri
  };
}
__name(marketplacePluginToItem, "marketplacePluginToItem");
let InstallPluginAction = class InstallPluginAction2 extends Action {
  static {
    __name(this, "InstallPluginAction");
  }
  static {
    InstallPluginAction_1 = this;
  }
  static {
    this.ID = "agentPlugin.install";
  }
  constructor(item, pluginInstallService) {
    super(InstallPluginAction_1.ID, localize("install", "Install"), "extension-action label prominent install");
    this.item = item;
    this.pluginInstallService = pluginInstallService;
  }
  async run() {
    await this.pluginInstallService.installPlugin({
      name: this.item.name,
      description: this.item.description,
      version: "",
      source: this.item.source,
      marketplace: this.item.marketplace,
      marketplaceReference: this.item.marketplaceReference,
      marketplaceType: this.item.marketplaceType,
      readmeUri: this.item.readmeUri
    });
  }
};
InstallPluginAction = InstallPluginAction_1 = __decorate([
  __param(1, IPluginInstallService)
], InstallPluginAction);
let EnablePluginAction = class EnablePluginAction2 extends Action {
  static {
    __name(this, "EnablePluginAction");
  }
  static {
    EnablePluginAction_1 = this;
  }
  static {
    this.ID = "agentPlugin.enable";
  }
  constructor(plugin, agentPluginService) {
    super(EnablePluginAction_1.ID, localize("enable", "Enable"));
    this.plugin = plugin;
    this.agentPluginService = agentPluginService;
  }
  async run() {
    this.agentPluginService.setPluginEnabled(this.plugin.uri, true);
  }
};
EnablePluginAction = EnablePluginAction_1 = __decorate([
  __param(1, IAgentPluginService)
], EnablePluginAction);
let DisablePluginAction = class DisablePluginAction2 extends Action {
  static {
    __name(this, "DisablePluginAction");
  }
  static {
    DisablePluginAction_1 = this;
  }
  static {
    this.ID = "agentPlugin.disable";
  }
  constructor(plugin, agentPluginService) {
    super(DisablePluginAction_1.ID, localize("disable", "Disable"));
    this.plugin = plugin;
    this.agentPluginService = agentPluginService;
  }
  async run() {
    this.agentPluginService.setPluginEnabled(this.plugin.uri, false);
  }
};
DisablePluginAction = DisablePluginAction_1 = __decorate([
  __param(1, IAgentPluginService)
], DisablePluginAction);
let UninstallPluginAction = class UninstallPluginAction2 extends Action {
  static {
    __name(this, "UninstallPluginAction");
  }
  static {
    UninstallPluginAction_1 = this;
  }
  static {
    this.ID = "agentPlugin.uninstall";
  }
  constructor(plugin, pluginInstallService) {
    super(UninstallPluginAction_1.ID, localize("uninstall", "Uninstall"));
    this.plugin = plugin;
    this.pluginInstallService = pluginInstallService;
  }
  async run() {
    this.pluginInstallService.uninstallPlugin(this.plugin.uri);
  }
};
UninstallPluginAction = UninstallPluginAction_1 = __decorate([
  __param(1, IPluginInstallService)
], UninstallPluginAction);
let OpenPluginFolderAction = class OpenPluginFolderAction2 extends Action {
  static {
    __name(this, "OpenPluginFolderAction");
  }
  static {
    OpenPluginFolderAction_1 = this;
  }
  static {
    this.ID = "agentPlugin.openFolder";
  }
  constructor(plugin, commandService, openerService) {
    super(OpenPluginFolderAction_1.ID, localize("openPluginFolder", "Open Plugin Folder"));
    this.plugin = plugin;
    this.commandService = commandService;
    this.openerService = openerService;
  }
  async run() {
    try {
      await this.commandService.executeCommand("revealFileInOS", this.plugin.uri);
    } catch {
      await this.openerService.open(dirname(this.plugin.uri));
    }
  }
};
OpenPluginFolderAction = OpenPluginFolderAction_1 = __decorate([
  __param(1, ICommandService),
  __param(2, IOpenerService)
], OpenPluginFolderAction);
let OpenPluginReadmeAction = class OpenPluginReadmeAction2 extends Action {
  static {
    __name(this, "OpenPluginReadmeAction");
  }
  static {
    OpenPluginReadmeAction_1 = this;
  }
  static {
    this.ID = "agentPlugin.openReadme";
  }
  constructor(readmeUri, openerService) {
    super(OpenPluginReadmeAction_1.ID, localize("openReadme", "Open README"));
    this.readmeUri = readmeUri;
    this.openerService = openerService;
  }
  async run() {
    await this.openerService.open(this.readmeUri);
  }
};
OpenPluginReadmeAction = OpenPluginReadmeAction_1 = __decorate([
  __param(1, IOpenerService)
], OpenPluginReadmeAction);
let AgentPluginRenderer = class AgentPluginRenderer2 {
  static {
    __name(this, "AgentPluginRenderer");
  }
  static {
    AgentPluginRenderer_1 = this;
  }
  static {
    this.templateId = "agentPlugin";
  }
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this.templateId = AgentPluginRenderer_1.templateId;
  }
  renderTemplate(root) {
    const element = dom.append(root, dom.$(".agent-plugin-item.extension-list-item"));
    const details = dom.append(element, dom.$(".details"));
    const headerContainer = dom.append(details, dom.$(".header-container"));
    const header = dom.append(headerContainer, dom.$(".header"));
    const name = dom.append(header, dom.$("span.name"));
    const description = dom.append(details, dom.$(".description.ellipsis"));
    const footer = dom.append(details, dom.$(".footer"));
    const detailContainer = dom.append(footer, dom.$(".publisher-container"));
    const detail = dom.append(detailContainer, dom.$("span.publisher-name"));
    const actionbar = new ActionBar(footer, { focusOnlyEnabledItems: true });
    actionbar.setFocusable(false);
    return { root, name, description, detail, actionbar, disposables: [actionbar], elementDisposables: [] };
  }
  renderPlaceholder(_index, data) {
    data.name.textContent = "";
    data.description.textContent = "";
    data.detail.textContent = "";
    data.actionbar.clear();
    this.disposeElement(void 0, 0, data);
  }
  renderElement(element, _index, data) {
    this.disposeElement(void 0, 0, data);
    data.name.textContent = element.name;
    data.description.textContent = element.description;
    data.elementDisposables.push(autorun((reader) => {
      data.root.classList.toggle("disabled", element.kind === "installed" && !element.plugin.enabled.read(reader));
    }));
    data.actionbar.clear();
    if (element.kind === "marketplace") {
      data.detail.textContent = element.marketplace;
      const installAction = this.instantiationService.createInstance(InstallPluginAction, element);
      data.elementDisposables.push(installAction);
      data.actionbar.push([installAction], { icon: true, label: true });
    } else {
      data.detail.textContent = element.marketplace ?? "";
    }
  }
  disposeElement(_element, _index, data) {
    for (const d of data.elementDisposables) {
      d.dispose();
    }
    data.elementDisposables = [];
  }
  disposeTemplate(data) {
    for (const d of data.disposables) {
      d.dispose();
    }
    this.disposeElement(void 0, 0, data);
  }
};
AgentPluginRenderer = AgentPluginRenderer_1 = __decorate([
  __param(0, IInstantiationService)
], AgentPluginRenderer);
let AgentPluginsListView = class AgentPluginsListView2 extends AbstractExtensionsListView {
  static {
    __name(this, "AgentPluginsListView");
  }
  constructor(listOptions, options, keybindingService, contextMenuService, instantiationService, themeService, hoverService, configurationService, contextKeyService, viewDescriptorService, openerService, agentPluginService, pluginMarketplaceService, pluginInstallService, labelService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.listOptions = listOptions;
    this.agentPluginService = agentPluginService;
    this.pluginMarketplaceService = pluginMarketplaceService;
    this.pluginInstallService = pluginInstallService;
    this.labelService = labelService;
    this.actionStore = this._register(new DisposableStore());
    this.queryCts = new MutableDisposable();
    this.list = null;
    this.listContainer = null;
    this.currentQuery = "@agentPlugins";
    this.refreshOnPluginsChangedScheduler = this._register(new RunOnceScheduler(() => {
      if (this.list) {
        void this.show(this.currentQuery);
      }
    }, 0));
    this._register(autorun((reader) => {
      this.agentPluginService.plugins.read(reader);
      if (this.list && this.isBodyVisible()) {
        this.refreshOnPluginsChangedScheduler.schedule();
      }
    }));
    this._register(this.pluginMarketplaceService.onDidChangeMarketplaces(() => {
      if (this.list && this.isBodyVisible()) {
        this.refreshOnPluginsChangedScheduler.schedule();
      }
    }));
  }
  renderBody(container) {
    super.renderBody(container);
    const messageContainer = dom.append(container, dom.$(".message-container"));
    const messageBox = dom.append(messageContainer, dom.$(".message"));
    const pluginsList = dom.$(".agent-plugins-list");
    this.bodyTemplate = { pluginsList, messageBox, messageContainer };
    this.listContainer = dom.append(container, pluginsList);
    this.list = this._register(this.instantiationService.createInstance(WorkbenchPagedList, `${this.id}-Agent-Plugins`, this.listContainer, {
      getHeight() {
        return 72;
      },
      getTemplateId: /* @__PURE__ */ __name(() => AgentPluginRenderer.templateId, "getTemplateId")
    }, [this.instantiationService.createInstance(AgentPluginRenderer)], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(item) {
          return item?.name ?? "";
        },
        getWidgetAriaLabel() {
          return localize("agentPlugins", "Agent Plugins");
        }
      },
      overrideStyles: getLocationBasedViewColors(this.viewDescriptorService.getViewLocationById(this.id)).listOverrideStyles
    }));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e), this));
  }
  onContextMenu(e) {
    if (!e.element) {
      return;
    }
    const actions = this.getContextMenuActions(e.element);
    if (actions.length === 0) {
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions")
    });
  }
  getContextMenuActions(item) {
    const actions = [];
    if (item.kind === "installed") {
      if (item.plugin.enabled.get()) {
        actions.push(this.instantiationService.createInstance(DisablePluginAction, item.plugin));
      } else {
        actions.push(this.instantiationService.createInstance(EnablePluginAction, item.plugin));
      }
      actions.push(new Separator());
      actions.push(this.instantiationService.createInstance(OpenPluginFolderAction, item.plugin));
      actions.push(this.instantiationService.createInstance(OpenPluginReadmeAction, joinPath(item.plugin.uri, "README.md")));
      actions.push(new Separator());
      actions.push(this.instantiationService.createInstance(UninstallPluginAction, item.plugin));
    } else {
      if (item.readmeUri) {
        actions.push(this.instantiationService.createInstance(OpenPluginReadmeAction, item.readmeUri));
      }
      actions.push(this.instantiationService.createInstance(InstallPluginAction, item));
    }
    this.actionStore.clear();
    for (const action of actions) {
      if (isDisposable(action)) {
        this.actionStore.add(action);
      }
    }
    return actions;
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.list?.layout(height, width);
  }
  async show(query) {
    this.currentQuery = query;
    const text = query.replace(/@agentPlugins/i, "").trim().toLowerCase();
    let installed = this.queryInstalled();
    if (text) {
      installed = installed.filter((p) => p.name.toLowerCase().includes(text) || p.description.toLowerCase().includes(text));
    }
    let items = installed;
    if (!this.listOptions.installedOnly) {
      const marketplace = await this.queryMarketplace(text);
      const installedPaths = new Set(installed.map((i) => i.plugin.uri.toString()));
      const filteredMarketplace = marketplace.filter((m) => {
        const expectedUri = this.pluginInstallService.getPluginInstallUri({
          name: m.name,
          description: m.description,
          version: "",
          source: m.source,
          marketplace: m.marketplace,
          marketplaceReference: m.marketplaceReference,
          marketplaceType: m.marketplaceType
        });
        return !installedPaths.has(expectedUri.toString());
      });
      items = [...installed, ...filteredMarketplace];
    }
    const model = new PagedModel(items);
    if (this.list) {
      this.list.model = model;
    }
    this.updateBody(model.length);
    return model;
  }
  queryInstalled() {
    const allPlugins = this.agentPluginService.allPlugins.get();
    return allPlugins.map((p) => installedPluginToItem(p, this.labelService));
  }
  async queryMarketplace(text) {
    this.queryCts.value?.cancel();
    const cts = new CancellationTokenSource();
    this.queryCts.value = cts;
    try {
      const plugins = await this.pluginMarketplaceService.fetchMarketplacePlugins(cts.token);
      const lowerText = text.toLowerCase();
      return plugins.filter((p) => p.name.toLowerCase().includes(lowerText) || p.description.toLowerCase().includes(lowerText)).map(marketplacePluginToItem);
    } catch {
      return [];
    }
  }
  updateBody(count) {
    if (this.bodyTemplate) {
      this.bodyTemplate.pluginsList.classList.toggle("hidden", count === 0);
      this.bodyTemplate.messageContainer.classList.toggle("hidden", count > 0);
      if (count === 0 && this.isBodyVisible()) {
        this.bodyTemplate.messageBox.textContent = localize("noAgentPlugins", "No agent plugins found.");
      }
    }
  }
};
AgentPluginsListView = __decorate([
  __param(2, IKeybindingService),
  __param(3, IContextMenuService),
  __param(4, IInstantiationService),
  __param(5, IThemeService),
  __param(6, IHoverService),
  __param(7, IConfigurationService),
  __param(8, IContextKeyService),
  __param(9, IViewDescriptorService),
  __param(10, IOpenerService),
  __param(11, IAgentPluginService),
  __param(12, IPluginMarketplaceService),
  __param(13, IPluginInstallService),
  __param(14, ILabelService)
], AgentPluginsListView);
class AgentPluginsBrowseCommand extends Action2 {
  static {
    __name(this, "AgentPluginsBrowseCommand");
  }
  constructor() {
    super({
      id: "workbench.agentPlugins.browse",
      title: localize2("agentPlugins.browse", "Agent Plugins"),
      tooltip: localize2("agentPlugins.browse.tooltip", "Browse Agent Plugins"),
      icon: Codicon.search,
      precondition: ChatContextKeys.Setup.hidden.negate(),
      menu: [{
        id: extensionsFilterSubMenu,
        group: "1_predefined",
        order: 2,
        when: ChatContextKeys.Setup.hidden.negate()
      }, {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", InstalledAgentPluginsViewId), ChatContextKeys.Setup.hidden.negate()),
        group: "navigation"
      }]
    });
  }
  async run(accessor) {
    accessor.get(IExtensionsWorkbenchService).openSearch("@agentPlugins ");
  }
}
let AgentPluginsViewsContribution = class AgentPluginsViewsContribution2 extends Disposable {
  static {
    __name(this, "AgentPluginsViewsContribution");
  }
  static {
    this.ID = "workbench.chat.agentPlugins.views.contribution";
  }
  constructor(contextKeyService, agentPluginService) {
    super();
    const hasInstalledKey = HasInstalledAgentPluginsContext.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      hasInstalledKey.set(agentPluginService.allPlugins.read(reader).length > 0);
    }));
    registerAction2(AgentPluginsBrowseCommand);
    Registry.as(ViewExtensions.ViewsRegistry).registerViews([
      {
        id: InstalledAgentPluginsViewId,
        name: localize2("agent-plugins-installed", "Agent Plugins - Installed"),
        ctorDescriptor: new SyncDescriptor(AgentPluginsListView, [{ installedOnly: true }]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledAgentPluginsContext, ChatContextKeys.Setup.hidden.negate()),
        weight: 30,
        order: 5,
        canToggleVisibility: true
      },
      {
        id: "workbench.views.agentPlugins.default.marketplace",
        name: localize2("agent-plugins", "Agent Plugins"),
        ctorDescriptor: new SyncDescriptor(AgentPluginsListView, [{}]),
        when: ContextKeyExpr.and(DefaultViewsContext, HasInstalledAgentPluginsContext.toNegated(), ChatContextKeys.Setup.hidden.negate()),
        weight: 30,
        order: 5,
        canToggleVisibility: true,
        hideByDefault: true
      },
      {
        id: "workbench.views.agentPlugins.marketplace",
        name: localize2("agent-plugins", "Agent Plugins"),
        ctorDescriptor: new SyncDescriptor(AgentPluginsListView, [{}]),
        when: ContextKeyExpr.and(SearchAgentPluginsContext, ChatContextKeys.Setup.hidden.negate())
      }
    ], VIEW_CONTAINER);
  }
};
AgentPluginsViewsContribution = __decorate([
  __param(0, IContextKeyService),
  __param(1, IAgentPluginService)
], AgentPluginsViewsContribution);
export {
  AgentPluginsListView,
  AgentPluginsViewsContribution,
  HasInstalledAgentPluginsContext,
  InstalledAgentPluginsViewId
};
//# sourceMappingURL=agentPluginsView.js.map
