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
import * as DOM from "../../../../../base/browser/dom.js";
import { BreadcrumbsWidget } from "../../../../../base/browser/ui/breadcrumbs/breadcrumbsWidget.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { combinedDisposable, Disposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../base/common/observable.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { WorkbenchList, WorkbenchObjectTree } from "../../../../../platform/list/browser/listService.js";
import { defaultBreadcrumbsWidgetStyles, defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { FilterWidget } from "../../../../browser/parts/views/viewFilter.js";
import { IChatDebugService } from "../../common/chatDebugService.js";
import { filterDebugEventsByText } from "../../common/chatDebugEvents.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { LocalChatSessionUri } from "../../common/model/chatUri.js";
import { ChatDebugEventRenderer, ChatDebugEventDelegate, ChatDebugEventTreeRenderer } from "./chatDebugEventList.js";
import { setupBreadcrumbKeyboardNavigation, TextBreadcrumbItem } from "./chatDebugTypes.js";
import { bindFilterContextKeys } from "./chatDebugFilters.js";
import { ChatDebugDetailPanel } from "./chatDebugDetailPanel.js";
import { IChatWidgetService } from "../chat.js";
import { createDebugEventsAttachment } from "./chatDebugAttachment.js";
const $ = DOM.$;
var LogsNavigation;
(function(LogsNavigation2) {
  LogsNavigation2["Home"] = "home";
  LogsNavigation2["Overview"] = "overview";
})(LogsNavigation || (LogsNavigation = {}));
let ChatDebugLogsView = class ChatDebugLogsView2 extends Disposable {
  static {
    __name(this, "ChatDebugLogsView");
  }
  constructor(parent, filterState, chatService, chatDebugService, instantiationService, contextKeyService, chatWidgetService) {
    super();
    this.filterState = filterState;
    this.chatService = chatService;
    this.chatDebugService = chatDebugService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.chatWidgetService = chatWidgetService;
    this._onNavigate = this._register(new Emitter());
    this.onNavigate = this._onNavigate.event;
    this.logsViewMode = "list";
    this.events = [];
    this.eventListener = this._register(new MutableDisposable());
    this.sessionStateDisposable = this._register(new MutableDisposable());
    this.refreshScheduler = this._register(new RunOnceScheduler(() => this.refreshList(), 50));
    this.container = DOM.append(parent, $(".chat-debug-logs"));
    DOM.hide(this.container);
    const breadcrumbContainer = DOM.append(this.container, $(".chat-debug-breadcrumb"));
    this.breadcrumbWidget = this._register(new BreadcrumbsWidget(breadcrumbContainer, 3, void 0, Codicon.chevronRight, defaultBreadcrumbsWidgetStyles));
    this._register(setupBreadcrumbKeyboardNavigation(breadcrumbContainer, this.breadcrumbWidget));
    this._register(this.breadcrumbWidget.onDidSelectItem((e) => {
      if (e.type === "select" && e.item instanceof TextBreadcrumbItem) {
        this.breadcrumbWidget.setSelection(void 0);
        const items = this.breadcrumbWidget.getItems();
        const idx = items.indexOf(e.item);
        if (idx === 0) {
          this._onNavigate.fire(
            "home"
            /* LogsNavigation.Home */
          );
        } else if (idx === 1) {
          this._onNavigate.fire(
            "overview"
            /* LogsNavigation.Overview */
          );
        }
      }
    }));
    this.headerContainer = DOM.append(this.container, $(".chat-debug-editor-header"));
    const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.headerContainer));
    const syncContextKeys = bindFilterContextKeys(this.filterState, scopedContextKeyService);
    syncContextKeys();
    const childInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
    this.filterWidget = this._register(childInstantiationService.createInstance(FilterWidget, {
      placeholder: localize("chatDebug.search", "Filter (e.g. text, !exclude, before:YYYY-MM-DDTHH:MM:SS)"),
      ariaLabel: localize("chatDebug.filterAriaLabel", "Filter debug events")
    }));
    this.viewModeToggle = this._register(new Button(this.headerContainer, { ...defaultButtonStyles, secondary: true, title: localize("chatDebug.toggleViewMode", "Toggle between list and tree view") }));
    this.viewModeToggle.element.classList.add("chat-debug-view-mode-toggle", "monaco-text-button");
    this.updateViewModeToggle();
    this._register(this.viewModeToggle.onDidClick(() => {
      this.toggleViewMode();
    }));
    const filterContainer = DOM.append(this.headerContainer, $(".viewpane-filter-container"));
    filterContainer.appendChild(this.filterWidget.element);
    const troubleshootButton = this._register(new Button(this.headerContainer, { ...defaultButtonStyles, secondary: true, title: localize("chatDebug.troubleshoot", "Add snapshot to Chat") }));
    troubleshootButton.element.classList.add("chat-debug-troubleshoot-button", "monaco-text-button");
    DOM.append(troubleshootButton.element, $(`span${ThemeIcon.asCSSSelector(Codicon.chatSparkle)}`));
    this._register(troubleshootButton.onDidClick(async () => {
      if (!this.currentSessionResource) {
        return;
      }
      const widget = await this.chatWidgetService.openSession(this.currentSessionResource);
      if (widget) {
        const attachment = await createDebugEventsAttachment(this.currentSessionResource, this.chatDebugService);
        widget.attachmentModel.addContext(attachment);
        widget.focusInput();
      }
    }));
    this._register(this.filterWidget.onDidChangeFilterText((text) => {
      this.filterState.setTextFilter(text);
    }));
    this._register(this.filterState.onDidChange(() => {
      syncContextKeys();
      this.updateMoreFiltersChecked();
      this.refreshList();
    }));
    const contentContainer = DOM.append(this.container, $(".chat-debug-logs-content"));
    const mainColumn = DOM.append(contentContainer, $(".chat-debug-logs-main"));
    this.tableHeader = DOM.append(mainColumn, $(".chat-debug-table-header"));
    DOM.append(this.tableHeader, $("span.chat-debug-col-created", void 0, localize("chatDebug.col.created", "Created")));
    DOM.append(this.tableHeader, $("span.chat-debug-col-name", void 0, localize("chatDebug.col.name", "Name")));
    DOM.append(this.tableHeader, $("span.chat-debug-col-details", void 0, localize("chatDebug.col.details", "Details")));
    this.bodyContainer = DOM.append(mainColumn, $(".chat-debug-logs-body"));
    this.listContainer = DOM.append(this.bodyContainer, $(".chat-debug-list-container"));
    const accessibilityProvider = {
      getAriaLabel: /* @__PURE__ */ __name((e) => {
        switch (e.kind) {
          case "toolCall":
            return localize("chatDebug.aria.toolCall", "Tool call: {0}{1}", e.toolName, e.result ? ` (${e.result})` : "");
          case "modelTurn":
            return localize("chatDebug.aria.modelTurn", "Model turn: {0}{1}", e.model ?? localize("chatDebug.aria.model", "model"), e.totalTokens ? localize("chatDebug.aria.tokenCount", " {0} tokens", e.totalTokens) : "");
          case "generic":
            return `${e.category ? e.category + ": " : ""}${e.name}: ${e.details ?? ""}`;
          case "subagentInvocation":
            return localize("chatDebug.aria.subagent", "Subagent: {0}{1}", e.agentName, e.description ? ` - ${e.description}` : "");
          case "userMessage":
            return localize("chatDebug.aria.userMessage", "User message: {0}", e.message);
          case "agentResponse":
            return localize("chatDebug.aria.agentResponse", "Agent response: {0}", e.message);
        }
      }, "getAriaLabel"),
      getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("chatDebug.ariaLabel", "Chat Debug Events"), "getWidgetAriaLabel")
    };
    let nextFallbackId = 0;
    const fallbackIds = /* @__PURE__ */ new WeakMap();
    const identityProvider = {
      getId: /* @__PURE__ */ __name((e) => {
        if (e.id) {
          return e.id;
        }
        let fallback = fallbackIds.get(e);
        if (!fallback) {
          fallback = `_fallback_${nextFallbackId++}`;
          fallbackIds.set(e, fallback);
        }
        return fallback;
      }, "getId")
    };
    this.list = this._register(this.instantiationService.createInstance(WorkbenchList, "ChatDebugEvents", this.listContainer, new ChatDebugEventDelegate(), [new ChatDebugEventRenderer()], { identityProvider, accessibilityProvider }));
    this.treeContainer = DOM.append(this.bodyContainer, $(".chat-debug-list-container"));
    DOM.hide(this.treeContainer);
    this.tree = this._register(this.instantiationService.createInstance(WorkbenchObjectTree, "ChatDebugEventsTree", this.treeContainer, new ChatDebugEventDelegate(), [new ChatDebugEventTreeRenderer()], { identityProvider, accessibilityProvider }));
    this.shimmerRow = DOM.append(this.bodyContainer, $(".chat-debug-logs-shimmer-row"));
    this.shimmerRow.setAttribute("aria-label", localize("chatDebug.loadingMore", "Loading more events\u2026"));
    this.shimmerRow.setAttribute("aria-busy", "true");
    DOM.append(this.shimmerRow, $("span.chat-debug-logs-shimmer-bar"));
    DOM.hide(this.shimmerRow);
    this.detailPanel = this._register(this.instantiationService.createInstance(ChatDebugDetailPanel, contentContainer));
    this._register(this.detailPanel.onDidHide(() => {
      if (this.list.getSelection().length > 0) {
        this.list.setSelection([]);
      }
      if (this.tree.getSelection().length > 0) {
        this.tree.setSelection([]);
      }
    }));
    this._register(this.list.onDidChangeSelection((e) => {
      const selected = e.elements[0];
      if (selected) {
        this.detailPanel.show(selected);
      } else {
        this.detailPanel.hide();
      }
    }));
    this._register(this.tree.onDidChangeSelection((e) => {
      const selected = e.elements[0];
      if (selected) {
        this.detailPanel.show(selected);
      } else {
        this.detailPanel.hide();
      }
    }));
  }
  setSession(sessionResource) {
    this.currentSessionResource = sessionResource;
  }
  setFilterText(text) {
    this.filterWidget.setFilterText(text);
  }
  show() {
    DOM.show(this.container);
    this.loadEvents();
    this.refreshList();
  }
  hide() {
    DOM.hide(this.container);
  }
  focus() {
    if (this.logsViewMode === "tree") {
      this.tree.domFocus();
    } else {
      this.list.domFocus();
    }
  }
  updateBreadcrumb() {
    if (!this.currentSessionResource) {
      return;
    }
    const sessionTitle = this.chatService.getSessionTitle(this.currentSessionResource) || LocalChatSessionUri.parseLocalSessionId(this.currentSessionResource) || this.currentSessionResource.toString();
    this.breadcrumbWidget.setItems([
      new TextBreadcrumbItem(localize("chatDebug.title", "Agent Debug Panel"), true),
      new TextBreadcrumbItem(sessionTitle, true),
      new TextBreadcrumbItem(localize("chatDebug.logs", "Logs"))
    ]);
  }
  layout(dimension) {
    this.currentDimension = dimension;
    const breadcrumbHeight = 22;
    const headerHeight = this.headerContainer.offsetHeight;
    const tableHeaderHeight = this.tableHeader.offsetHeight;
    const detailVisible = this.detailPanel.element.style.display !== "none";
    const detailWidth = detailVisible ? this.detailPanel.element.offsetWidth : 0;
    const listHeight = dimension.height - breadcrumbHeight - headerHeight - tableHeaderHeight;
    const listWidth = dimension.width - detailWidth;
    if (this.logsViewMode === "tree") {
      this.tree.layout(listHeight, listWidth);
    } else {
      this.list.layout(listHeight, listWidth);
    }
  }
  refreshList() {
    let filtered = this.events;
    filtered = filtered.filter((e) => {
      const category = e.kind === "generic" ? e.category : void 0;
      return this.filterState.isKindVisible(e.kind, category);
    });
    const filterText = this.filterState.textFilter;
    if (filterText) {
      filtered = filterDebugEventsByText(filtered, filterText);
    }
    if (this.logsViewMode === "list") {
      this.list.splice(0, this.list.length, filtered);
    } else {
      this.refreshTree(filtered);
    }
    this.updateShimmerPosition(filtered.length);
  }
  updateShimmerPosition(itemCount) {
    this.shimmerRow.style.top = `${itemCount * 28}px`;
  }
  addEvent(event) {
    const time = event.created.getTime();
    let lo = 0;
    let hi = this.events.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (this.events[mid].created.getTime() <= time) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    if (lo === this.events.length) {
      this.events.push(event);
    } else {
      this.events.splice(lo, 0, event);
    }
    this.scheduleRefresh();
  }
  scheduleRefresh() {
    if (!this.refreshScheduler.isScheduled()) {
      this.refreshScheduler.schedule();
    }
  }
  loadEvents() {
    this.events = [...this.chatDebugService.getEvents(this.currentSessionResource || void 0)];
    const addEventDisposable = this.chatDebugService.onDidAddEvent((e) => {
      if (!this.currentSessionResource || e.sessionResource.toString() === this.currentSessionResource.toString()) {
        this.addEvent(e);
      }
    });
    const clearEventsDisposable = this.chatDebugService.onDidClearProviderEvents((sessionResource) => {
      if (!this.currentSessionResource || sessionResource.toString() === this.currentSessionResource.toString()) {
        this.events = [...this.chatDebugService.getEvents(this.currentSessionResource || void 0)];
        this.refreshList();
      }
    });
    this.eventListener.value = combinedDisposable(addEventDisposable, clearEventsDisposable);
    this.updateBreadcrumb();
    this.trackSessionState();
  }
  trackSessionState() {
    if (!this.currentSessionResource) {
      DOM.hide(this.shimmerRow);
      this.sessionStateDisposable.clear();
      return;
    }
    const model = this.chatService.getSession(this.currentSessionResource);
    if (!model) {
      DOM.hide(this.shimmerRow);
      this.sessionStateDisposable.clear();
      return;
    }
    this.sessionStateDisposable.value = autorun((reader) => {
      const inProgress = model.requestInProgress.read(reader);
      if (inProgress) {
        DOM.show(this.shimmerRow);
      } else {
        DOM.hide(this.shimmerRow);
      }
    });
  }
  refreshTree(filtered) {
    const treeElements = this.buildTreeHierarchy(filtered);
    this.tree.setChildren(null, treeElements);
  }
  buildTreeHierarchy(events) {
    const idToEvent = /* @__PURE__ */ new Map();
    const idToChildren = /* @__PURE__ */ new Map();
    const roots = [];
    for (const event of events) {
      if (event.id) {
        idToEvent.set(event.id, event);
      }
    }
    for (const event of events) {
      if (event.parentEventId && idToEvent.has(event.parentEventId)) {
        let children = idToChildren.get(event.parentEventId);
        if (!children) {
          children = [];
          idToChildren.set(event.parentEventId, children);
        }
        children.push(event);
      } else {
        roots.push(event);
      }
    }
    const toTreeElement = /* @__PURE__ */ __name((event) => {
      const children = event.id ? idToChildren.get(event.id) : void 0;
      return {
        element: event,
        children: children?.map(toTreeElement),
        collapsible: (children?.length ?? 0) > 0,
        collapsed: false
      };
    }, "toTreeElement");
    return roots.map(toTreeElement);
  }
  toggleViewMode() {
    if (this.logsViewMode === "list") {
      this.logsViewMode = "tree";
      DOM.hide(this.listContainer);
      DOM.show(this.treeContainer);
    } else {
      this.logsViewMode = "list";
      DOM.show(this.listContainer);
      DOM.hide(this.treeContainer);
    }
    this.updateViewModeToggle();
    this.refreshList();
    if (this.currentDimension) {
      this.layout(this.currentDimension);
    }
  }
  updateViewModeToggle() {
    const el = this.viewModeToggle.element;
    DOM.clearNode(el);
    const isTree = this.logsViewMode === "tree";
    DOM.append(el, $(`span${ThemeIcon.asCSSSelector(isTree ? Codicon.listTree : Codicon.listFlat)}`));
    const labelContainer = DOM.append(el, $("span.chat-debug-view-mode-labels"));
    const treeLabel = DOM.append(labelContainer, $("span.chat-debug-view-mode-label"));
    treeLabel.textContent = localize("chatDebug.treeView", "Tree View");
    const listLabel = DOM.append(labelContainer, $("span.chat-debug-view-mode-label"));
    listLabel.textContent = localize("chatDebug.listView", "List View");
    if (isTree) {
      listLabel.classList.add("hidden");
    } else {
      treeLabel.classList.add("hidden");
    }
    const activeLabel = isTree ? localize("chatDebug.switchToListView", "Switch to List View") : localize("chatDebug.switchToTreeView", "Switch to Tree View");
    el.setAttribute("aria-label", activeLabel);
    this.viewModeToggle.setTitle(activeLabel);
  }
  updateMoreFiltersChecked() {
    this.filterWidget.checkMoreFilters(!this.filterState.isAllFiltersDefault());
  }
};
ChatDebugLogsView = __decorate([
  __param(2, IChatService),
  __param(3, IChatDebugService),
  __param(4, IInstantiationService),
  __param(5, IContextKeyService),
  __param(6, IChatWidgetService)
], ChatDebugLogsView);
export {
  ChatDebugLogsView,
  LogsNavigation
};
//# sourceMappingURL=chatDebugLogsView.js.map
