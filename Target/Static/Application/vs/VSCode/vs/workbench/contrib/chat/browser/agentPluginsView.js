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
var UpdatePluginAction_1, ManagePluginAction_1, AgentPluginRenderer_1;
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Action, Separator } from "../../../../base/common/actions.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, disposeIfDisposable, isDisposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { autorun, derived } from "../../../../base/common/observable.js";
import { PagedModel } from "../../../../base/common/paging.js";
import { dirname } from "../../../../base/common/resources.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchPagedList } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { getLocationBasedViewColors } from "../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService, Extensions as ViewExtensions } from "../../../common/views.js";
import { IEditorService, MODAL_GROUP } from "../../../services/editor/common/editorService.js";
import { VIEW_CONTAINER } from "../../extensions/browser/extensions.contribution.js";
import { manageExtensionIcon } from "../../extensions/browser/extensionsIcons.js";
import { AbstractExtensionsListView } from "../../extensions/browser/extensionsViews.js";
import { DefaultViewsContext, extensionsFilterSubMenu, IExtensionsWorkbenchService, SearchAgentPluginsContext } from "../../extensions/common/extensions.js";
import { ChatContextKeys } from "../common/actions/chatContextKeys.js";
import { IAgentPluginService } from "../common/plugins/agentPluginService.js";
import { isContributionEnabled } from "../common/enablement.js";
import { IPluginInstallService } from "../common/plugins/pluginInstallService.js";
import { hasSourceChanged, IPluginMarketplaceService } from "../common/plugins/pluginMarketplaceService.js";
import { AgentPluginEditorInput } from "./agentPluginEditor/agentPluginEditorInput.js";
import { getInstalledPluginContextMenuActions, InstallPluginAction, OpenPluginReadmeAction } from "./agentPluginActions.js";
const HasInstalledAgentPluginsContext = new RawContextKey("hasInstalledAgentPlugins", false);
const InstalledAgentPluginsViewId = "workbench.views.agentPlugins.installed";
function installedPluginToItem(plugin, labelService, outdated) {
  const name = plugin.label;
  const description = plugin.fromMarketplace?.description ?? labelService.getUriLabel(dirname(plugin.uri), { relative: true });
  const marketplace = plugin.fromMarketplace?.marketplace;
  return { kind: "installed", name, description, marketplace, plugin, outdated };
}
__name(installedPluginToItem, "installedPluginToItem");
function marketplacePluginToItem(plugin) {
  return {
    kind: "marketplace",
    name: plugin.name,
    description: plugin.description,
    source: plugin.source,
    sourceDescriptor: plugin.sourceDescriptor,
    marketplace: plugin.marketplace,
    marketplaceReference: plugin.marketplaceReference,
    marketplaceType: plugin.marketplaceType,
    readmeUri: plugin.readmeUri
  };
}
__name(marketplacePluginToItem, "marketplacePluginToItem");
let UpdatePluginAction = class UpdatePluginAction2 extends Action {
  static {
    __name(this, "UpdatePluginAction");
  }
  static {
    UpdatePluginAction_1 = this;
  }
  static {
    this.ID = "agentPlugin.update";
  }
  constructor(plugin, liveMarketplacePlugin, pluginInstallService, pluginMarketplaceService) {
    super(UpdatePluginAction_1.ID, localize("update", "Update"), "extension-action label prominent install");
    this.plugin = plugin;
    this.liveMarketplacePlugin = liveMarketplacePlugin;
    this.pluginInstallService = pluginInstallService;
    this.pluginMarketplaceService = pluginMarketplaceService;
  }
  async run() {
    if (await this.pluginInstallService.updatePlugin(this.liveMarketplacePlugin)) {
      this.pluginMarketplaceService.addInstalledPlugin(this.plugin.uri, this.liveMarketplacePlugin);
    }
  }
};
UpdatePluginAction = UpdatePluginAction_1 = __decorate([
  __param(2, IPluginInstallService),
  __param(3, IPluginMarketplaceService)
], UpdatePluginAction);
let ManagePluginAction = class ManagePluginAction2 extends Action {
  static {
    __name(this, "ManagePluginAction");
  }
  static {
    ManagePluginAction_1 = this;
  }
  static {
    this.ID = "agentPlugin.manage";
  }
  static {
    this.CLASS = `extension-action icon manage ${ThemeIcon.asClassName(manageExtensionIcon)}`;
  }
  constructor(getActionGroups, instantiationService) {
    super(ManagePluginAction_1.ID, "", ManagePluginAction_1.CLASS, true);
    this.getActionGroups = getActionGroups;
    this.instantiationService = instantiationService;
    this._actionViewItem = null;
    this.tooltip = localize("manage", "Manage");
  }
  createActionViewItem(options) {
    this._actionViewItem = this.instantiationService.createInstance(DropDownActionViewItem, this, options);
    return this._actionViewItem;
  }
  async run() {
    this._actionViewItem?.showMenu(this.getActionGroups());
  }
};
ManagePluginAction = ManagePluginAction_1 = __decorate([
  __param(1, IInstantiationService)
], ManagePluginAction);
let DropDownActionViewItem = class DropDownActionViewItem2 extends ActionViewItem {
  static {
    __name(this, "DropDownActionViewItem");
  }
  constructor(action, options, contextMenuService) {
    super(null, action, { ...options, icon: true, label: false });
    this.contextMenuService = contextMenuService;
  }
  showMenu(actionGroups) {
    if (!this.element) {
      return;
    }
    const actions = actionGroups.flatMap((group) => [...group, new Separator()]);
    if (actions.length > 0) {
      actions.pop();
    }
    const { left, top, height } = dom.getDomNodePagePosition(this.element);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => ({ x: left, y: top + height + 10 }), "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
      onHide: /* @__PURE__ */ __name(() => disposeIfDisposable(actions), "onHide")
    });
  }
};
DropDownActionViewItem = __decorate([
  __param(2, IContextMenuService)
], DropDownActionViewItem);
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
    const actionbar = new ActionBar(footer, {
      focusOnlyEnabledItems: true,
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action instanceof ManagePluginAction) {
          return action.createActionViewItem(options);
        }
        return void 0;
      }, "actionViewItemProvider")
    });
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
      data.root.classList.toggle("disabled", element.kind === "installed" && !isContributionEnabled(element.plugin.enablement.read(reader)));
    }));
    const updateActions = /* @__PURE__ */ __name((reader) => {
      data.actionbar.clear();
      if (element.kind === "marketplace") {
        data.detail.textContent = element.marketplace;
        const installAction = this.instantiationService.createInstance(InstallPluginAction, element);
        reader.store.add(installAction);
        data.actionbar.push([installAction], { icon: true, label: true });
      } else {
        data.detail.textContent = element.marketplace ?? "";
        const actions = [];
        const livePlugin = element.outdated?.read(reader);
        if (livePlugin) {
          const updateAction = this.instantiationService.createInstance(UpdatePluginAction, element.plugin, livePlugin);
          reader.store.add(updateAction);
          actions.push(updateAction);
        }
        const manageAction = this.instantiationService.createInstance(ManagePluginAction, () => getInstalledPluginContextMenuActions(element.plugin, this.instantiationService));
        reader.store.add(manageAction);
        actions.push(manageAction);
        data.actionbar.push(actions, { icon: true, label: true });
      }
    }, "updateActions");
    data.elementDisposables.push(autorun(updateActions));
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
  constructor(listOptions, options, keybindingService, contextMenuService, instantiationService, themeService, hoverService, configurationService, contextKeyService, viewDescriptorService, openerService, agentPluginService, pluginMarketplaceService, pluginInstallService, labelService, editorService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.listOptions = listOptions;
    this.agentPluginService = agentPluginService;
    this.pluginMarketplaceService = pluginMarketplaceService;
    this.pluginInstallService = pluginInstallService;
    this.labelService = labelService;
    this.editorService = editorService;
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
      const plugins = this.agentPluginService.plugins.read(reader);
      for (const plugin of plugins) {
        plugin.enablement.read(reader);
      }
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
    this._register(Event.debounce(Event.filter(this.list.onDidOpen, (e) => e.element !== null), (_, event) => event, 75, true)((options) => {
      this.editorService.openEditor(this.instantiationService.createInstance(AgentPluginEditorInput, options.element), options.editorOptions, MODAL_GROUP);
    }));
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
    let actions;
    if (item.kind === "installed") {
      const groups = getInstalledPluginContextMenuActions(item.plugin, this.instantiationService);
      actions = groups.flatMap((group) => [...group, new Separator()]);
      if (actions.length > 0) {
        actions.pop();
      }
    } else {
      actions = [];
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
    const stripped = query.replace(/@agentPlugins/i, "").trim();
    const isRecommended = /^@recommended$/i.test(stripped);
    const text = isRecommended ? "" : stripped.toLowerCase();
    let installed = this.queryInstalled();
    if (text) {
      installed = installed.filter((p) => p.name.toLowerCase().includes(text) || p.description.toLowerCase().includes(text));
    }
    if (isRecommended) {
      const recommended = this.pluginMarketplaceService.recommendedPlugins.get();
      installed = installed.filter((p) => {
        const marketplace = p.plugin.fromMarketplace;
        if (!marketplace) {
          return false;
        }
        const key = `${marketplace.name}@${marketplace.marketplace}`;
        return recommended.has(key);
      });
    }
    let items = installed;
    if (!this.listOptions.installedOnly) {
      const marketplacePlugins = await this.queryMarketplacePlugins();
      let filteredMp = marketplacePlugins;
      if (isRecommended) {
        const recommended = this.pluginMarketplaceService.recommendedPlugins.get();
        filteredMp = filteredMp.filter((p) => {
          const key = `${p.name}@${p.marketplace}`;
          return recommended.has(key);
        });
      } else {
        const lowerText = text.toLowerCase();
        filteredMp = filteredMp.filter((p) => p.name.toLowerCase().includes(lowerText) || p.description.toLowerCase().includes(lowerText));
      }
      const marketplace = filteredMp.map(marketplacePluginToItem);
      const installedPaths = new Set(installed.map((i) => i.plugin.uri.toString()));
      const filteredMarketplace = marketplace.filter((m) => {
        const expectedUri = this.pluginInstallService.getPluginInstallUri({
          name: m.name,
          description: m.description,
          version: "",
          source: m.source,
          sourceDescriptor: m.sourceDescriptor,
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
  /**
   * Builds the installed plugin list using only cached marketplace data
   * (no IO). The cached data is populated by {@link fetchMarketplacePlugins}
   * and exposed via the {@link IPluginMarketplaceService.lastFetchedPlugins}
   * observable, which the view's autorun subscribes to for reactivity.
   */
  queryInstalled() {
    const marketplaceObs = derived((reader) => {
      const cachedMarketplace = this.pluginMarketplaceService.lastFetchedPlugins.read(reader);
      const marketplaceByKey = /* @__PURE__ */ new Map();
      for (const mp of cachedMarketplace) {
        marketplaceByKey.set(`${mp.marketplaceReference.canonicalId}::${mp.name}`, mp);
      }
      const installedByUri = /* @__PURE__ */ new Map();
      for (const entry of this.pluginMarketplaceService.installedPlugins.read(reader)) {
        installedByUri.set(entry.pluginUri.toString(), entry.plugin);
      }
      return { marketplaceByKey, installedByUri };
    });
    const plugins = this.agentPluginService.plugins.get();
    return plugins.map((p) => {
      const isOutdated = derived((reader) => {
        const { marketplaceByKey, installedByUri } = marketplaceObs.read(reader);
        const storedPlugin = installedByUri.get(p.uri.toString()) ?? p.fromMarketplace;
        if (storedPlugin) {
          const key = `${storedPlugin.marketplaceReference.canonicalId}::${storedPlugin.name}`;
          const live = marketplaceByKey.get(key);
          if (live && hasSourceChanged(storedPlugin.sourceDescriptor, live.sourceDescriptor)) {
            return live;
          }
        }
        return void 0;
      });
      return installedPluginToItem(p, this.labelService, isOutdated);
    });
  }
  async queryMarketplacePlugins() {
    this.queryCts.value?.cancel();
    const cts = new CancellationTokenSource();
    this.queryCts.value = cts;
    try {
      return await this.pluginMarketplaceService.fetchMarketplacePlugins(cts.token);
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
  __param(14, ILabelService),
  __param(15, IEditorService)
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
class CheckForPluginUpdatesCommand extends Action2 {
  static {
    __name(this, "CheckForPluginUpdatesCommand");
  }
  constructor() {
    super({
      id: "workbench.agentPlugins.checkForUpdates",
      title: localize2("agentPlugins.checkForUpdates", "Update Plugins"),
      category: localize2("chat.category", "Chat"),
      precondition: ChatContextKeys.enabled,
      f1: true
    });
  }
  async run(accessor) {
    await accessor.get(IPluginInstallService).updateAllPlugins({}, CancellationToken.None);
  }
}
class ForceUpdatePluginsCommand extends Action2 {
  static {
    __name(this, "ForceUpdatePluginsCommand");
  }
  constructor() {
    super({
      id: "workbench.agentPlugins.forceUpdate",
      title: localize2("agentPlugins.forceUpdate", "Update Plugins (Force)"),
      category: localize2("chat.category", "Chat"),
      precondition: ChatContextKeys.enabled,
      f1: true
    });
  }
  async run(accessor) {
    await accessor.get(IPluginInstallService).updateAllPlugins({ force: true }, CancellationToken.None);
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
      hasInstalledKey.set(agentPluginService.plugins.read(reader).length > 0);
    }));
    registerAction2(AgentPluginsBrowseCommand);
    registerAction2(CheckForPluginUpdatesCommand);
    registerAction2(ForceUpdatePluginsCommand);
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
