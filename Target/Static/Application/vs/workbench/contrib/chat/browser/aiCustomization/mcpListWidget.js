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
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IMcpWorkbenchService, IMcpService } from "../../../../contrib/mcp/common/mcpTypes.js";
import { autorun } from "../../../../../base/common/observable.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { URI } from "../../../../../base/common/uri.js";
import { InputBox } from "../../../../../base/browser/ui/inputbox/inputBox.js";
import { IContextMenuService, IContextViewService } from "../../../../../platform/contextview/browser/contextView.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Delayer } from "../../../../../base/common/async.js";
import { Separator } from "../../../../../base/common/actions.js";
import { getContextMenuActions } from "../../../../contrib/mcp/browser/mcpServerActions.js";
import { workspaceIcon, userIcon } from "./aiCustomizationIcons.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
const $ = DOM.$;
const MCP_ITEM_HEIGHT = 60;
const MCP_GROUP_HEADER_HEIGHT = 32;
const MCP_GROUP_HEADER_HEIGHT_WITH_SEPARATOR = 40;
class McpServerItemDelegate {
  static {
    __name(this, "McpServerItemDelegate");
  }
  getHeight(element) {
    if (element.type === "group-header") {
      return element.isFirst ? MCP_GROUP_HEADER_HEIGHT : MCP_GROUP_HEADER_HEIGHT_WITH_SEPARATOR;
    }
    return MCP_ITEM_HEIGHT;
  }
  getTemplateId(element) {
    if (element.type === "group-header") {
      return "mcpGroupHeader";
    }
    const server = element.server;
    return server.gallery && !server.local ? "mcpGalleryItem" : "mcpServerItem";
  }
}
class McpGroupHeaderRenderer {
  static {
    __name(this, "McpGroupHeaderRenderer");
  }
  constructor(hoverService) {
    this.hoverService = hoverService;
    this.templateId = "mcpGroupHeader";
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container.classList.add("ai-customization-group-header");
    const chevron = DOM.append(container, $(".group-chevron"));
    const icon = DOM.append(container, $(".group-icon"));
    const labelGroup = DOM.append(container, $(".group-label-group"));
    const label = DOM.append(labelGroup, $(".group-label"));
    const infoIcon = DOM.append(labelGroup, $(".group-info"));
    infoIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    const count = DOM.append(container, $(".group-count"));
    return { container, chevron, icon, label, count, infoIcon, disposables, elementDisposables };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposables.clear();
    templateData.chevron.className = "group-chevron";
    templateData.chevron.classList.add(...ThemeIcon.asClassNameArray(element.collapsed ? Codicon.chevronRight : Codicon.chevronDown));
    templateData.icon.className = "group-icon";
    templateData.icon.classList.add(...ThemeIcon.asClassNameArray(element.icon));
    templateData.label.textContent = element.label;
    templateData.count.textContent = `${element.count}`;
    templateData.elementDisposables.add(this.hoverService.setupDelayedHover(templateData.infoIcon, () => ({
      content: element.description,
      appearance: {
        compact: true,
        skipFadeInAnimation: true
      }
    })));
    templateData.container.classList.toggle("collapsed", element.collapsed);
    templateData.container.classList.toggle("has-previous-group", !element.isFirst);
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.disposables.dispose();
  }
}
let McpServerItemRenderer = class McpServerItemRenderer2 {
  static {
    __name(this, "McpServerItemRenderer");
  }
  constructor(mcpService) {
    this.mcpService = mcpService;
    this.templateId = "mcpServerItem";
  }
  renderTemplate(container) {
    container.classList.add("mcp-server-item");
    const icon = DOM.append(container, $(".mcp-server-icon"));
    icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.server));
    const details = DOM.append(container, $(".mcp-server-details"));
    const name = DOM.append(details, $(".mcp-server-name"));
    const description = DOM.append(details, $(".mcp-server-description"));
    const status = DOM.append(container, $(".mcp-server-status"));
    return { container, icon, name, description, status, disposables: new DisposableStore() };
  }
  renderElement(element, index, templateData) {
    templateData.disposables.clear();
    templateData.name.textContent = element.server.label;
    templateData.description.textContent = element.server.description || "";
    const server = this.mcpService.servers.get().find((s) => s.definition.id === element.server.id);
    templateData.disposables.add(autorun((reader) => {
      const connectionState = server?.connectionState.read(reader);
      this.updateStatus(templateData.status, connectionState?.state);
    }));
  }
  updateStatus(statusElement, state) {
    statusElement.className = "mcp-server-status";
    switch (state) {
      case 2:
        statusElement.textContent = localize("running", "Running");
        statusElement.classList.add("running");
        break;
      case 1:
        statusElement.textContent = localize("starting", "Starting");
        statusElement.classList.add("starting");
        break;
      case 3:
        statusElement.textContent = localize("error", "Error");
        statusElement.classList.add("error");
        break;
      case 0:
      default:
        statusElement.textContent = localize("stopped", "Stopped");
        statusElement.classList.add("stopped");
        break;
    }
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
McpServerItemRenderer = __decorate([
  __param(0, IMcpService)
], McpServerItemRenderer);
class McpGalleryItemRenderer {
  static {
    __name(this, "McpGalleryItemRenderer");
  }
  constructor(mcpWorkbenchService) {
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.templateId = "mcpGalleryItem";
  }
  renderTemplate(container) {
    container.classList.add("mcp-server-item", "mcp-gallery-item");
    const icon = DOM.append(container, $(".mcp-server-icon"));
    icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.server));
    const details = DOM.append(container, $(".mcp-server-details"));
    const nameRow = DOM.append(details, $(".mcp-gallery-name-row"));
    const name = DOM.append(nameRow, $(".mcp-server-name"));
    const publisher = DOM.append(nameRow, $(".mcp-gallery-publisher"));
    const description = DOM.append(details, $(".mcp-server-description"));
    const actionContainer = DOM.append(container, $(".mcp-gallery-action"));
    const installButton = new Button(actionContainer, { ...defaultButtonStyles, supportIcons: true });
    installButton.element.classList.add("mcp-gallery-install-button");
    const templateDisposables = new DisposableStore();
    templateDisposables.add(installButton);
    return { container, icon, name, publisher, description, installButton, elementDisposables: new DisposableStore(), templateDisposables };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposables.clear();
    templateData.name.textContent = element.server.label;
    templateData.publisher.textContent = element.server.publisherDisplayName ? `by ${element.server.publisherDisplayName}` : "";
    templateData.description.textContent = element.server.description || "";
    this.updateInstallButton(templateData.installButton, element.server);
    templateData.elementDisposables.add(templateData.installButton.onDidClick(async () => {
      const canInstall = this.mcpWorkbenchService.canInstall(element.server);
      if (canInstall === true) {
        templateData.installButton.label = localize("installing", "Installing...");
        templateData.installButton.enabled = false;
        await this.mcpWorkbenchService.install(element.server);
      }
    }));
    templateData.elementDisposables.add(this.mcpWorkbenchService.onChange((changed) => {
      if (!changed || changed.id === element.server.id) {
        this.updateInstallButton(templateData.installButton, element.server);
      }
    }));
  }
  updateInstallButton(button, server) {
    switch (server.installState) {
      case 1:
        button.label = localize("installed", "Installed");
        button.enabled = false;
        break;
      case 0:
        button.label = localize("installing", "Installing...");
        button.enabled = false;
        break;
      default:
        button.label = localize("install", "Install");
        button.enabled = true;
        break;
    }
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposables.dispose();
  }
}
let McpListWidget = class McpListWidget2 extends Disposable {
  static {
    __name(this, "McpListWidget");
  }
  constructor(instantiationService, mcpWorkbenchService, mcpService, commandService, openerService, contextViewService, contextMenuService, hoverService) {
    super();
    this.instantiationService = instantiationService;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.mcpService = mcpService;
    this.commandService = commandService;
    this.openerService = openerService;
    this.contextViewService = contextViewService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this._onDidSelectServer = this._register(new Emitter());
    this.onDidSelectServer = this._onDidSelectServer.event;
    this.filteredServers = [];
    this.displayEntries = [];
    this.galleryServers = [];
    this.searchQuery = "";
    this.browseMode = false;
    this.collapsedGroups = /* @__PURE__ */ new Set();
    this.delayedFilter = new Delayer(200);
    this.delayedGallerySearch = new Delayer(400);
    this.element = $(".mcp-list-widget");
    this.create();
    this._register({
      dispose: /* @__PURE__ */ __name(() => {
        this.galleryCts?.dispose();
      }, "dispose")
    });
  }
  create() {
    this.searchAndButtonContainer = DOM.append(this.element, $(".list-search-and-button-container"));
    const searchContainer = DOM.append(this.searchAndButtonContainer, $(".list-search-container"));
    this.searchInput = this._register(new InputBox(searchContainer, this.contextViewService, {
      placeholder: localize("searchMcpPlaceholder", "Type to search..."),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._register(this.searchInput.onDidChange(() => {
      this.searchQuery = this.searchInput.value;
      if (this.browseMode) {
        this.delayedGallerySearch.trigger(() => this.queryGallery());
      } else {
        this.delayedFilter.trigger(() => this.filterServers());
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
    const addButtonContainer = DOM.append(buttonContainer, $(".list-add-button-container"));
    this.addButton = this._register(new Button(addButtonContainer, { ...defaultButtonStyles, supportIcons: true }));
    this.addButton.label = `$(${Codicon.add.id}) ${localize("addServer", "Add Server")}`;
    this.addButton.element.classList.add("list-add-button");
    this._register(this.addButton.onDidClick(() => {
      this.commandService.executeCommand(
        "workbench.mcp.addConfiguration"
        /* McpCommandIds.AddConfiguration */
      );
    }));
    this.backLink = DOM.append(this.element, $(".mcp-back-link"));
    this.backLink.setAttribute("role", "button");
    this.backLink.tabIndex = 0;
    this.backLink.setAttribute("aria-label", localize("backToInstalledAriaLabel", "Back to installed servers"));
    const backIcon = DOM.append(this.backLink, $("span"));
    backIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.arrowLeft));
    const backText = DOM.append(this.backLink, $("span"));
    backText.textContent = localize("backToInstalled", "Back to installed servers");
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
    emptyIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.server));
    this.emptyText = DOM.append(this.emptyContainer, $(".empty-text"));
    this.emptySubtext = DOM.append(this.emptyContainer, $(".empty-subtext"));
    this.listContainer = DOM.append(this.element, $(".mcp-list-container"));
    this.sectionHeader = DOM.append(this.element, $(".section-footer"));
    this.sectionDescription = DOM.append(this.sectionHeader, $("p.section-footer-description"));
    this.sectionDescription.textContent = localize("mcpServersDescription", "An open standard that lets AI use external tools and services. MCP servers provide tools for file operations, databases, APIs, and more.");
    this.sectionLink = DOM.append(this.sectionHeader, $("a.section-footer-link"));
    this.sectionLink.textContent = localize("learnMoreMcp", "Learn more about MCP servers");
    this.sectionLink.href = "https://code.visualstudio.com/docs/copilot/chat/mcp-servers";
    this._register(DOM.addDisposableListener(this.sectionLink, "click", (e) => {
      e.preventDefault();
      const href = this.sectionLink.href;
      if (href) {
        this.openerService.open(URI.parse(href));
      }
    }));
    const delegate = new McpServerItemDelegate();
    const groupHeaderRenderer = new McpGroupHeaderRenderer(this.hoverService);
    const localRenderer = this.instantiationService.createInstance(McpServerItemRenderer);
    const galleryRenderer = new McpGalleryItemRenderer(this.mcpWorkbenchService);
    this.list = this._register(this.instantiationService.createInstance(WorkbenchList, "McpManagementList", this.listContainer, delegate, [groupHeaderRenderer, localRenderer, galleryRenderer], {
      multipleSelectionSupport: false,
      setRowLineHeight: false,
      horizontalScrolling: false,
      accessibilityProvider: {
        getAriaLabel(element) {
          if (element.type === "group-header") {
            return localize("mcpGroupAriaLabel", "{0}, {1} items, {2}", element.label, element.count, element.collapsed ? localize("collapsed", "collapsed") : localize("expanded", "expanded"));
          }
          return element.server.label;
        },
        getWidgetAriaLabel() {
          return localize("mcpServersListAriaLabel", "MCP Servers");
        }
      },
      openOnSingleClick: true,
      identityProvider: {
        getId(element) {
          return element.type === "group-header" ? element.id : element.server.id;
        }
      }
    }));
    this._register(this.list.onDidOpen((e) => {
      if (e.element) {
        if (e.element.type === "group-header") {
          this.toggleGroup(e.element);
        } else {
          this._onDidSelectServer.fire(e.element.server);
        }
      }
    }));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.mcpWorkbenchService.onChange(() => {
      if (!this.browseMode) {
        this.refresh();
      }
    }));
    this._register(autorun((reader) => {
      this.mcpService.servers.read(reader);
      if (!this.browseMode) {
        this.refresh();
      }
    }));
    void this.refresh();
  }
  async refresh() {
    if (this.browseMode) {
      await this.queryGallery();
    } else {
      this.filterServers();
    }
  }
  toggleBrowseMode(browse) {
    this.browseMode = browse;
    this.searchInput.value = "";
    this.searchQuery = "";
    this.backLink.style.display = browse ? "" : "none";
    this.addButton.element.parentElement.style.display = browse ? "none" : "";
    this.browseButton.element.parentElement.style.display = browse ? "none" : "";
    this.searchInput.setPlaceHolder(browse ? localize("searchGalleryPlaceholder", "Search MCP marketplace...") : localize("searchMcpPlaceholder", "Type to search..."));
    if (browse) {
      void this.queryGallery();
    } else {
      this.galleryCts?.dispose(true);
      this.galleryServers = [];
      this.filterServers();
    }
  }
  async queryGallery() {
    this.galleryCts?.dispose(true);
    const cts = this.galleryCts = new CancellationTokenSource();
    this.emptyContainer.style.display = "flex";
    this.listContainer.style.display = "none";
    this.emptyText.textContent = localize("loadingGallery", "Loading marketplace...");
    this.emptySubtext.textContent = "";
    try {
      const pager = await this.mcpWorkbenchService.queryGallery({ text: this.searchQuery.trim() || void 0 }, cts.token);
      if (cts.token.isCancellationRequested) {
        return;
      }
      this.galleryServers = pager.firstPage.items;
      this.updateGalleryList();
    } catch {
      if (!cts.token.isCancellationRequested) {
        this.galleryServers = [];
        this.emptyContainer.style.display = "flex";
        this.listContainer.style.display = "none";
        this.emptyText.textContent = localize("galleryError", "Unable to load marketplace");
        this.emptySubtext.textContent = localize("tryAgainLater", "Check your connection and try again");
      }
    }
  }
  updateGalleryList() {
    if (this.galleryServers.length === 0) {
      this.emptyContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      if (this.searchQuery.trim()) {
        this.emptyText.textContent = localize("noGalleryResults", "No servers match '{0}'", this.searchQuery);
        this.emptySubtext.textContent = localize("tryDifferentSearch", "Try a different search term");
      } else {
        this.emptyText.textContent = localize("emptyGallery", "No MCP servers available");
        this.emptySubtext.textContent = "";
      }
    } else {
      this.emptyContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
    const entries = this.galleryServers.map((server) => ({ type: "server-item", server }));
    this.list.splice(0, this.list.length, entries);
  }
  filterServers() {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.filteredServers = this.mcpWorkbenchService.local.filter((server) => server.label.toLowerCase().includes(query) || server.description?.toLowerCase().includes(query));
    } else {
      this.filteredServers = [...this.mcpWorkbenchService.local];
    }
    if (this.filteredServers.length === 0) {
      this.emptyContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      if (this.searchQuery.trim()) {
        this.emptyText.textContent = localize("noMatchingServers", "No servers match '{0}'", this.searchQuery);
        this.emptySubtext.textContent = localize("tryDifferentSearch", "Try a different search term");
      } else {
        this.emptyText.textContent = localize("noMcpServers", "No MCP servers configured");
        this.emptySubtext.textContent = localize("addMcpServer", "Add an MCP server configuration to get started");
      }
    } else {
      this.emptyContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
    const groups = [
      { scope: "workspace", label: localize("workspaceGroup", "Workspace"), icon: workspaceIcon, description: localize("workspaceGroupDescription", "MCP servers configured in your workspace settings, shared with your team via version control."), servers: [] },
      { scope: "user", label: localize("userGroup", "User"), icon: userIcon, description: localize("userGroupDescription", "MCP servers configured in your user settings. Private to you and available across all projects."), servers: [] }
    ];
    for (const server of this.filteredServers) {
      const scope = server.local?.scope;
      if (scope === "workspace") {
        groups[0].servers.push(server);
      } else {
        groups[1].servers.push(server);
      }
    }
    const entries = [];
    let isFirst = true;
    for (const group of groups) {
      if (group.servers.length === 0) {
        continue;
      }
      const collapsed = this.collapsedGroups.has(group.scope);
      entries.push({
        type: "group-header",
        id: `mcp-group-${group.scope}`,
        scope: group.scope,
        label: group.label,
        icon: group.icon,
        count: group.servers.length,
        isFirst,
        description: group.description,
        collapsed
      });
      if (!collapsed) {
        for (const server of group.servers) {
          entries.push({ type: "server-item", server });
        }
      }
      isFirst = false;
    }
    this.displayEntries = entries;
    this.list.splice(0, this.list.length, this.displayEntries);
  }
  /**
   * Toggles the collapsed state of a group.
   */
  toggleGroup(entry) {
    if (this.collapsedGroups.has(entry.scope)) {
      this.collapsedGroups.delete(entry.scope);
    } else {
      this.collapsedGroups.add(entry.scope);
    }
    this.filterServers();
  }
  /**
   * Layouts the widget.
   */
  layout(height, width) {
    const sectionFooterHeight = this.sectionHeader.offsetHeight || 100;
    const searchBarHeight = this.searchAndButtonContainer.offsetHeight || 40;
    const backLinkHeight = this.browseMode ? this.backLink.offsetHeight || 28 : 0;
    const margins = 12;
    const listHeight = height - sectionFooterHeight - searchBarHeight - backLinkHeight - margins;
    this.listContainer.style.height = `${Math.max(0, listHeight)}px`;
    this.list.layout(Math.max(0, listHeight), width);
  }
  /**
   * Focuses the search input.
   */
  focusSearch() {
    this.searchInput.focus();
  }
  /**
   * Focuses the list.
   */
  focus() {
    this.list.domFocus();
    const servers = this.list.length;
    if (servers > 0) {
      this.list.setFocus([0]);
    }
  }
  /**
   * Handles context menu for MCP server items.
   */
  onContextMenu(e) {
    if (!e.element || e.element.type !== "server-item") {
      return;
    }
    const serverEntry = e.element;
    const disposables = new DisposableStore();
    const mcpServer = this.mcpWorkbenchService.local.find((local) => local.id === serverEntry.server.id) || serverEntry.server;
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
McpListWidget = __decorate([
  __param(0, IInstantiationService),
  __param(1, IMcpWorkbenchService),
  __param(2, IMcpService),
  __param(3, ICommandService),
  __param(4, IOpenerService),
  __param(5, IContextViewService),
  __param(6, IContextMenuService),
  __param(7, IHoverService)
], McpListWidget);
export {
  McpListWidget
};
//# sourceMappingURL=mcpListWidget.js.map
