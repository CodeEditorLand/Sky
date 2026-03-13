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
import "./media/aiCustomizationManagement.css";
import * as DOM from "../../../../../base/browser/dom.js";
import { Disposable, DisposableStore, isDisposable } from "../../../../../base/common/lifecycle.js";
import { Emitter } from "../../../../../base/common/event.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchList } from "../../../../../platform/list/browser/listService.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles, defaultInputBoxStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { autorun } from "../../../../../base/common/observable.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { URI } from "../../../../../base/common/uri.js";
import { InputBox } from "../../../../../base/browser/ui/inputbox/inputBox.js";
import { IContextMenuService, IContextViewService } from "../../../../../platform/contextview/browser/contextView.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Delayer } from "../../../../../base/common/async.js";
import { Separator } from "../../../../../base/common/actions.js";
import { basename, dirname } from "../../../../../base/common/resources.js";
import { getDefaultHoverDelegate } from "../../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IAgentPluginService } from "../../common/plugins/agentPluginService.js";
import { isContributionEnabled } from "../../common/enablement.js";
import { getInstalledPluginContextMenuActions } from "../agentPluginActions.js";
import { IPluginMarketplaceService } from "../../common/plugins/pluginMarketplaceService.js";
import { IPluginInstallService } from "../../common/plugins/pluginInstallService.js";
import { pluginIcon } from "./aiCustomizationIcons.js";
import { formatDisplayName, truncateToFirstSentence } from "./aiCustomizationListWidget.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { CustomizationGroupHeaderRenderer, CUSTOMIZATION_GROUP_HEADER_HEIGHT, CUSTOMIZATION_GROUP_HEADER_HEIGHT_WITH_SEPARATOR } from "./customizationGroupHeaderRenderer.js";
const $ = DOM.$;
const PLUGIN_ITEM_HEIGHT = 36;
class PluginItemDelegate {
  static {
    __name(this, "PluginItemDelegate");
  }
  getHeight(element) {
    if (element.type === "group-header") {
      return element.isFirst ? CUSTOMIZATION_GROUP_HEADER_HEIGHT : CUSTOMIZATION_GROUP_HEADER_HEIGHT_WITH_SEPARATOR;
    }
    if (element.type === "marketplace-item") {
      return 62;
    }
    return PLUGIN_ITEM_HEIGHT;
  }
  getTemplateId(element) {
    if (element.type === "group-header") {
      return "pluginGroupHeader";
    }
    if (element.type === "marketplace-item") {
      return "pluginMarketplaceItem";
    }
    return "pluginInstalledItem";
  }
}
class PluginInstalledItemRenderer {
  static {
    __name(this, "PluginInstalledItemRenderer");
  }
  constructor() {
    this.templateId = "pluginInstalledItem";
  }
  renderTemplate(container) {
    container.classList.add("mcp-server-item");
    const typeIcon = DOM.append(container, $(".mcp-server-icon"));
    typeIcon.classList.add(...ThemeIcon.asClassNameArray(pluginIcon));
    const details = DOM.append(container, $(".mcp-server-details"));
    const name = DOM.append(details, $(".mcp-server-name"));
    const description = DOM.append(details, $(".mcp-server-description"));
    const status = DOM.append(container, $(".mcp-server-status"));
    return { container, typeIcon, name, description, status, disposables: new DisposableStore() };
  }
  renderElement(element, _index, templateData) {
    templateData.disposables.clear();
    templateData.name.textContent = formatDisplayName(element.item.name);
    if (element.item.description) {
      templateData.description.textContent = truncateToFirstSentence(element.item.description);
      templateData.description.style.display = "";
    } else {
      templateData.description.style.display = "none";
    }
    templateData.disposables.add(autorun((reader) => {
      const enabled = isContributionEnabled(element.item.plugin.enablement.read(reader));
      templateData.container.classList.toggle("disabled", !enabled);
      templateData.status.className = "mcp-server-status";
      if (enabled) {
        templateData.status.textContent = localize("enabled", "Enabled");
        templateData.status.classList.add("running");
      } else {
        templateData.status.textContent = localize("disabled", "Disabled");
        templateData.status.classList.add("disabled");
      }
    }));
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
}
class PluginMarketplaceItemRenderer {
  static {
    __name(this, "PluginMarketplaceItemRenderer");
  }
  constructor(pluginInstallService) {
    this.pluginInstallService = pluginInstallService;
    this.templateId = "pluginMarketplaceItem";
  }
  renderTemplate(container) {
    container.classList.add("mcp-server-item", "mcp-gallery-item", "extension-list-item");
    const details = DOM.append(container, $(".details"));
    const headerContainer = DOM.append(details, $(".header-container"));
    const header = DOM.append(headerContainer, $(".header"));
    const name = DOM.append(header, $("span.name"));
    const description = DOM.append(details, $(".description.ellipsis"));
    const footer = DOM.append(details, $(".footer"));
    const publisherContainer = DOM.append(footer, $(".publisher-container"));
    const publisher = DOM.append(publisherContainer, $("span.publisher-name"));
    const actionContainer = DOM.append(footer, $(".mcp-gallery-action"));
    const installButton = new Button(actionContainer, { ...defaultButtonStyles, supportIcons: true });
    installButton.element.classList.add("mcp-gallery-install-button");
    const templateDisposables = new DisposableStore();
    templateDisposables.add(installButton);
    return { container, name, publisher, description, installButton, elementDisposables: new DisposableStore(), templateDisposables };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposables.clear();
    templateData.name.textContent = element.item.name;
    templateData.publisher.textContent = element.item.marketplace ? localize("byPublisher", "by {0}", element.item.marketplace) : "";
    templateData.description.textContent = element.item.description || "";
    templateData.installButton.label = localize("install", "Install");
    templateData.installButton.enabled = true;
    templateData.elementDisposables.add(templateData.installButton.onDidClick(async () => {
      templateData.installButton.label = localize("installing", "Installing...");
      templateData.installButton.enabled = false;
      try {
        await this.pluginInstallService.installPlugin({
          name: element.item.name,
          description: element.item.description,
          version: "",
          sourceDescriptor: element.item.sourceDescriptor,
          source: element.item.source,
          marketplace: element.item.marketplace,
          marketplaceReference: element.item.marketplaceReference,
          marketplaceType: element.item.marketplaceType,
          readmeUri: element.item.readmeUri
        });
        templateData.installButton.label = localize("installed", "Installed");
      } catch (_e) {
        templateData.installButton.label = localize("install", "Install");
        templateData.installButton.enabled = true;
      }
    }));
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposables.dispose();
  }
}
function installedPluginToItem(plugin, labelService) {
  const name = plugin.label ?? basename(plugin.uri);
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
    sourceDescriptor: plugin.sourceDescriptor,
    marketplace: plugin.marketplace,
    marketplaceReference: plugin.marketplaceReference,
    marketplaceType: plugin.marketplaceType,
    readmeUri: plugin.readmeUri
  };
}
__name(marketplacePluginToItem, "marketplacePluginToItem");
let PluginListWidget = class PluginListWidget2 extends Disposable {
  static {
    __name(this, "PluginListWidget");
  }
  constructor(instantiationService, agentPluginService, pluginMarketplaceService, pluginInstallService, openerService, contextViewService, contextMenuService, hoverService, labelService, commandService) {
    super();
    this.instantiationService = instantiationService;
    this.agentPluginService = agentPluginService;
    this.pluginMarketplaceService = pluginMarketplaceService;
    this.pluginInstallService = pluginInstallService;
    this.openerService = openerService;
    this.contextViewService = contextViewService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.commandService = commandService;
    this._onDidSelectPlugin = this._register(new Emitter());
    this.onDidSelectPlugin = this._onDidSelectPlugin.event;
    this.installedItems = [];
    this.displayEntries = [];
    this.marketplaceItems = [];
    this.searchQuery = "";
    this.browseMode = false;
    this.collapsedGroups = /* @__PURE__ */ new Set();
    this.delayedFilter = new Delayer(200);
    this.delayedMarketplaceSearch = new Delayer(400);
    this.element = $(".mcp-list-widget");
    this.create();
    this._register({
      dispose: /* @__PURE__ */ __name(() => {
        this.marketplaceCts?.dispose();
      }, "dispose")
    });
  }
  create() {
    this.searchAndButtonContainer = DOM.append(this.element, $(".list-search-and-button-container"));
    const searchContainer = DOM.append(this.searchAndButtonContainer, $(".list-search-container"));
    this.searchInput = this._register(new InputBox(searchContainer, this.contextViewService, {
      placeholder: localize("searchPluginsPlaceholder", "Type to search..."),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._register(this.searchInput.onDidChange(() => {
      this.searchQuery = this.searchInput.value;
      if (this.browseMode) {
        this.delayedMarketplaceSearch.trigger(() => this.queryMarketplace());
      } else {
        this.delayedFilter.trigger(() => this.filterPlugins());
      }
    }));
    const buttonContainer = DOM.append(this.searchAndButtonContainer, $(".list-button-group"));
    const browseButtonContainer = DOM.append(buttonContainer, $(".list-add-button-container"));
    this.browseButton = this._register(new Button(browseButtonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.browseButton.label = `$(${Codicon.library.id}) ${localize("browseMarketplace", "Browse Marketplace")}`;
    this.browseButton.element.classList.add("list-add-button");
    this._register(this.browseButton.onDidClick(() => {
      this.toggleBrowseMode(!this.browseMode);
    }));
    const installFromSourceButton = this._register(new Button(buttonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    installFromSourceButton.label = `$(${Codicon.add.id})`;
    installFromSourceButton.setTitle(localize("installFromSource", "Install Plugin from Source"));
    installFromSourceButton.element.classList.add("list-icon-button");
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), installFromSourceButton.element, localize("installFromSourceTooltip", "Install Plugin from Source")));
    this._register(installFromSourceButton.onDidClick(() => {
      this.commandService.executeCommand("workbench.action.chat.installPluginFromSource");
    }));
    this.backLink = DOM.append(this.element, $(".mcp-back-link"));
    this.backLink.setAttribute("role", "button");
    this.backLink.tabIndex = 0;
    this.backLink.setAttribute("aria-label", localize("backToInstalledPluginsAriaLabel", "Back to installed plugins"));
    const backIcon = DOM.append(this.backLink, $("span"));
    backIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.arrowLeft));
    const backText = DOM.append(this.backLink, $("span"));
    backText.textContent = localize("backToInstalledPlugins", "Back to installed plugins");
    this._register(DOM.addDisposableListener(this.backLink, "click", () => {
      this.toggleBrowseMode(false);
    }));
    this._register(DOM.addDisposableListener(this.backLink, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleBrowseMode(false);
      }
    }));
    this.backLink.style.display = "none";
    this.emptyContainer = DOM.append(this.element, $(".mcp-empty-state"));
    const emptyIcon = DOM.append(this.emptyContainer, $(".empty-icon"));
    emptyIcon.classList.add(...ThemeIcon.asClassNameArray(pluginIcon));
    this.emptyText = DOM.append(this.emptyContainer, $(".empty-text"));
    this.emptySubtext = DOM.append(this.emptyContainer, $(".empty-subtext"));
    this.listContainer = DOM.append(this.element, $(".mcp-list-container"));
    this.sectionHeader = DOM.append(this.element, $(".section-footer"));
    this.sectionDescription = DOM.append(this.sectionHeader, $("p.section-footer-description"));
    this.sectionDescription.textContent = localize("pluginsDescription", "Extend your AI agent with plugins that add commands, skills, agents, hooks, and MCP servers from reusable packages.");
    this.sectionLink = DOM.append(this.sectionHeader, $("a.section-footer-link"));
    this.sectionLink.textContent = localize("learnMorePlugins", "Learn more about agent plugins");
    this.sectionLink.href = "https://code.visualstudio.com/docs/copilot/chat/agent-plugins";
    this._register(DOM.addDisposableListener(this.sectionLink, "click", (e) => {
      e.preventDefault();
      const href = this.sectionLink.href;
      if (href) {
        this.openerService.open(URI.parse(href));
      }
    }));
    const delegate = new PluginItemDelegate();
    const groupHeaderRenderer = new CustomizationGroupHeaderRenderer("pluginGroupHeader", this.hoverService);
    const installedRenderer = new PluginInstalledItemRenderer();
    const marketplaceRenderer = new PluginMarketplaceItemRenderer(this.pluginInstallService);
    this.list = this._register(this.instantiationService.createInstance(WorkbenchList, "PluginManagementList", this.listContainer, delegate, [groupHeaderRenderer, installedRenderer, marketplaceRenderer], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(element) {
          if (element.type === "group-header") {
            return localize("pluginGroupAriaLabel", "{0}, {1} items, {2}", element.label, element.count, element.collapsed ? localize("collapsed", "collapsed") : localize("expanded", "expanded"));
          }
          if (element.type === "marketplace-item") {
            return element.item.name;
          }
          return element.item.name;
        },
        getWidgetAriaLabel() {
          return localize("pluginsListAriaLabel", "Plugins");
        }
      },
      openOnSingleClick: true,
      identityProvider: {
        getId(element) {
          if (element.type === "group-header") {
            return element.id;
          }
          if (element.type === "marketplace-item") {
            return `marketplace-${element.item.marketplaceReference.canonicalId}/${element.item.source}`;
          }
          return element.item.plugin.uri.toString();
        }
      }
    }));
    this._register(this.list.onDidOpen((e) => {
      if (e.element) {
        if (e.element.type === "group-header") {
          this.toggleGroup(e.element);
        } else if (e.element.type === "plugin-item") {
          this._onDidSelectPlugin.fire(e.element.item);
        } else if (e.element.type === "marketplace-item") {
          this._onDidSelectPlugin.fire(e.element.item);
        }
      }
    }));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e)));
    this._register(autorun((reader) => {
      const plugins = this.agentPluginService.plugins.read(reader);
      for (const plugin of plugins) {
        plugin.enablement.read(reader);
      }
      if (!this.browseMode) {
        this.refresh();
      }
    }));
    this._register(this.pluginMarketplaceService.onDidChangeMarketplaces(() => {
      if (!this.browseMode) {
        this.refresh();
      }
    }));
    void this.refresh();
  }
  async refresh() {
    if (this.browseMode) {
      await this.queryMarketplace();
    } else {
      this.filterPlugins();
    }
  }
  toggleBrowseMode(browse) {
    this.browseMode = browse;
    this.searchInput.value = "";
    this.searchQuery = "";
    this.backLink.style.display = browse ? "" : "none";
    this.browseButton.element.parentElement.style.display = browse ? "none" : "";
    this.searchInput.setPlaceHolder(browse ? localize("searchMarketplacePlaceholder", "Search plugin marketplace...") : localize("searchPluginsPlaceholder", "Type to search..."));
    if (browse) {
      void this.queryMarketplace();
    } else {
      this.marketplaceCts?.dispose(true);
      this.marketplaceItems = [];
      this.filterPlugins();
    }
  }
  async queryMarketplace() {
    this.marketplaceCts?.dispose(true);
    const cts = this.marketplaceCts = new CancellationTokenSource();
    this.emptyContainer.style.display = "flex";
    this.listContainer.style.display = "none";
    this.emptyText.textContent = localize("loadingMarketplace", "Loading marketplace...");
    this.emptySubtext.textContent = "";
    try {
      const plugins = await this.pluginMarketplaceService.fetchMarketplacePlugins(cts.token);
      if (cts.token.isCancellationRequested) {
        return;
      }
      const query = this.searchQuery.toLowerCase().trim();
      const filtered = query ? plugins.filter((p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)) : plugins;
      const installedUris = new Set(this.agentPluginService.plugins.get().map((p) => p.uri.toString()));
      this.marketplaceItems = filtered.filter((p) => {
        const expectedUri = this.pluginInstallService.getPluginInstallUri(p);
        return !installedUris.has(expectedUri.toString());
      }).map(marketplacePluginToItem);
      this.updateMarketplaceList();
    } catch {
      if (!cts.token.isCancellationRequested) {
        this.marketplaceItems = [];
        this.emptyContainer.style.display = "flex";
        this.listContainer.style.display = "none";
        this.emptyText.textContent = localize("marketplaceError", "Unable to load marketplace");
        this.emptySubtext.textContent = localize("tryAgainLater", "Check your connection and try again");
      }
    }
  }
  updateMarketplaceList() {
    if (this.marketplaceItems.length === 0) {
      this.emptyContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      if (this.searchQuery.trim()) {
        this.emptyText.textContent = localize("noMarketplaceResults", "No plugins match '{0}'", this.searchQuery);
        this.emptySubtext.textContent = localize("tryDifferentSearch", "Try a different search term");
      } else {
        this.emptyText.textContent = localize("emptyMarketplace", "No plugins available");
        this.emptySubtext.textContent = "";
      }
    } else {
      this.emptyContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
    const entries = this.marketplaceItems.map((item) => ({ type: "marketplace-item", item }));
    this.list.splice(0, this.list.length, entries);
  }
  filterPlugins() {
    const query = this.searchQuery.toLowerCase().trim();
    const allPlugins = this.agentPluginService.plugins.get();
    this.installedItems = allPlugins.map((p) => installedPluginToItem(p, this.labelService)).filter((item) => !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
    if (this.installedItems.length === 0) {
      this.emptyContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      if (this.searchQuery.trim()) {
        this.emptyText.textContent = localize("noMatchingPlugins", "No plugins match '{0}'", this.searchQuery);
        this.emptySubtext.textContent = localize("tryDifferentSearch", "Try a different search term");
      } else {
        this.emptyText.textContent = localize("noPlugins", "No plugins installed");
        this.emptySubtext.textContent = localize("browseToAdd", "Browse the marketplace to discover and install plugins");
      }
    } else {
      this.emptyContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
    const enabledPlugins = this.installedItems.filter((item) => isContributionEnabled(item.plugin.enablement.get()));
    const disabledPlugins = this.installedItems.filter((item) => !isContributionEnabled(item.plugin.enablement.get()));
    const entries = [];
    let isFirst = true;
    if (enabledPlugins.length > 0) {
      const collapsed = this.collapsedGroups.has("enabled");
      entries.push({
        type: "group-header",
        id: "plugin-group-enabled",
        group: "enabled",
        label: localize("enabledGroup", "Enabled"),
        icon: pluginIcon,
        count: enabledPlugins.length,
        isFirst,
        description: localize("enabledGroupDescription", "Plugins that are currently active and providing commands, skills, agents, and other capabilities."),
        collapsed
      });
      if (!collapsed) {
        for (const item of enabledPlugins) {
          entries.push({ type: "plugin-item", item });
        }
      }
      isFirst = false;
    }
    if (disabledPlugins.length > 0) {
      const collapsed = this.collapsedGroups.has("disabled");
      entries.push({
        type: "group-header",
        id: "plugin-group-disabled",
        group: "disabled",
        label: localize("disabledGroup", "Disabled"),
        icon: pluginIcon,
        count: disabledPlugins.length,
        isFirst,
        description: localize("disabledGroupDescription", "Plugins that are installed but currently disabled. Enable them to use their capabilities."),
        collapsed
      });
      if (!collapsed) {
        for (const item of disabledPlugins) {
          entries.push({ type: "plugin-item", item });
        }
      }
    }
    this.displayEntries = entries;
    this.list.splice(0, this.list.length, this.displayEntries);
  }
  toggleGroup(entry) {
    if (this.collapsedGroups.has(entry.group)) {
      this.collapsedGroups.delete(entry.group);
    } else {
      this.collapsedGroups.add(entry.group);
    }
    this.filterPlugins();
  }
  layout(height, width) {
    const sectionFooterHeight = this.sectionHeader.offsetHeight || 0;
    const searchBarHeight = this.searchAndButtonContainer.offsetHeight || 52;
    const backLinkHeight = this.browseMode ? this.backLink.offsetHeight || 28 : 0;
    const listHeight = height - sectionFooterHeight - searchBarHeight - backLinkHeight;
    this.listContainer.style.height = `${Math.max(0, listHeight)}px`;
    this.list.layout(Math.max(0, listHeight), width);
    if (sectionFooterHeight === 0) {
      DOM.getWindow(this.listContainer).requestAnimationFrame(() => {
        if (this._store.isDisposed) {
          return;
        }
        const actualFooterHeight = this.sectionHeader.offsetHeight;
        if (actualFooterHeight > 0) {
          const correctedHeight = height - actualFooterHeight - searchBarHeight - backLinkHeight;
          this.listContainer.style.height = `${Math.max(0, correctedHeight)}px`;
          this.list.layout(Math.max(0, correctedHeight), width);
        }
      });
    }
  }
  focusSearch() {
    this.searchInput.focus();
  }
  focus() {
    this.list.domFocus();
    if (this.list.length > 0) {
      this.list.setFocus([0]);
    }
  }
  onContextMenu(e) {
    if (!e.element || e.element.type !== "plugin-item") {
      return;
    }
    const entry = e.element;
    const disposables = new DisposableStore();
    const groups = getInstalledPluginContextMenuActions(entry.item.plugin, this.instantiationService);
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
    if (actions.length > 0 && actions[actions.length - 1] instanceof Separator) {
      actions.pop();
    }
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
      onHide: /* @__PURE__ */ __name(() => disposables.dispose(), "onHide")
    });
  }
};
PluginListWidget = __decorate([
  __param(0, IInstantiationService),
  __param(1, IAgentPluginService),
  __param(2, IPluginMarketplaceService),
  __param(3, IPluginInstallService),
  __param(4, IOpenerService),
  __param(5, IContextViewService),
  __param(6, IContextMenuService),
  __param(7, IHoverService),
  __param(8, ILabelService),
  __param(9, ICommandService)
], PluginListWidget);
export {
  PluginListWidget
};
//# sourceMappingURL=pluginListWidget.js.map
