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
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { defaultBreadcrumbsWidgetStyles, defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { ChatDebugLogLevel, IChatDebugService } from "../../common/chatDebugService.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { ChatAgentLocation } from "../../common/constants.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { getChatSessionType, LocalChatSessionUri } from "../../common/model/chatUri.js";
import { IChatWidgetService } from "../chat.js";
import { setupBreadcrumbKeyboardNavigation, TextBreadcrumbItem } from "./chatDebugTypes.js";
const $ = DOM.$;
var OverviewNavigation;
(function(OverviewNavigation2) {
  OverviewNavigation2["Home"] = "home";
  OverviewNavigation2["Logs"] = "logs";
  OverviewNavigation2["FlowChart"] = "flowchart";
})(OverviewNavigation || (OverviewNavigation = {}));
let ChatDebugOverviewView = class ChatDebugOverviewView2 extends Disposable {
  static {
    __name(this, "ChatDebugOverviewView");
  }
  constructor(parent, chatService, chatDebugService, chatWidgetService, chatSessionsService) {
    super();
    this.chatService = chatService;
    this.chatDebugService = chatDebugService;
    this.chatWidgetService = chatWidgetService;
    this.chatSessionsService = chatSessionsService;
    this._onNavigate = this._register(new Emitter());
    this.onNavigate = this._onNavigate.event;
    this.loadDisposables = this._register(new DisposableStore());
    this.isFirstLoad = true;
    this.container = DOM.append(parent, $(".chat-debug-overview"));
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
            /* OverviewNavigation.Home */
          );
        }
      }
    }));
    this.content = DOM.append(this.container, $(".chat-debug-overview-content"));
  }
  setSession(sessionResource) {
    this.currentSessionResource = sessionResource;
    this.isFirstLoad = true;
  }
  show() {
    DOM.show(this.container);
    this.load();
  }
  hide() {
    DOM.hide(this.container);
  }
  refresh() {
    if (this.container.style.display !== "none") {
      if (this.metricsContainer && this.currentSessionResource) {
        DOM.clearNode(this.metricsContainer);
        const events = this.chatDebugService.getEvents(this.currentSessionResource);
        this.renderMetricsContent(this.metricsContainer, events);
        this.isFirstLoad = false;
      } else {
        this.load();
      }
    }
  }
  updateBreadcrumb() {
    if (!this.currentSessionResource) {
      return;
    }
    const sessionTitle = this.chatService.getSessionTitle(this.currentSessionResource) || LocalChatSessionUri.parseLocalSessionId(this.currentSessionResource) || this.currentSessionResource.toString();
    this.breadcrumbWidget.setItems([
      new TextBreadcrumbItem(localize("chatDebug.title", "Agent Debug Panel"), true),
      new TextBreadcrumbItem(sessionTitle)
    ]);
  }
  load() {
    DOM.clearNode(this.content);
    this.loadDisposables.clear();
    this.updateBreadcrumb();
    if (!this.currentSessionResource) {
      return;
    }
    const sessionTitle = this.chatService.getSessionTitle(this.currentSessionResource) || LocalChatSessionUri.parseLocalSessionId(this.currentSessionResource) || this.currentSessionResource.toString();
    const titleRow = DOM.append(this.content, $(".chat-debug-overview-title-row"));
    const titleEl = DOM.append(titleRow, $("h2.chat-debug-overview-title"));
    DOM.append(titleEl, $(`span${ThemeIcon.asCSSSelector(Codicon.comment)}`));
    titleEl.append(sessionTitle);
    const titleActions = DOM.append(titleRow, $(".chat-debug-overview-title-actions"));
    const revealSessionBtn = this.loadDisposables.add(new Button(titleActions, { ariaLabel: localize("chatDebug.revealChatSession", "Reveal Chat Session"), title: localize("chatDebug.revealChatSession", "Reveal Chat Session") }));
    revealSessionBtn.element.classList.add("chat-debug-icon-button");
    revealSessionBtn.icon = Codicon.goToFile;
    this.loadDisposables.add(revealSessionBtn.onDidClick(() => {
      if (this.currentSessionResource) {
        this.chatWidgetService.openSession(this.currentSessionResource);
      }
    }));
    this.renderSessionDetails(this.currentSessionResource);
    const events = this.chatDebugService.getEvents(this.currentSessionResource);
    this.renderDerivedOverview(events, this.isFirstLoad && events.length === 0);
    this.isFirstLoad = false;
  }
  renderSessionDetails(sessionUri) {
    const model = this.chatService.getSession(sessionUri);
    const details = [];
    const sessionType = getChatSessionType(sessionUri);
    const contribution = this.chatSessionsService.getChatSessionContribution(sessionType);
    const sessionTypeName = contribution?.displayName || (sessionType === "local" ? localize("chatDebug.sessionType.local", "Local") : sessionType);
    details.push({ label: localize("chatDebug.detail.sessionType", "Session Type"), value: sessionTypeName });
    if (model) {
      const locationLabel = this.getLocationLabel(model.initialLocation);
      details.push({ label: localize("chatDebug.detail.location", "Location"), value: locationLabel });
      const inProgress = model.requestInProgress.get();
      const statusLabel = inProgress ? localize("chatDebug.status.inProgress", "In Progress") : localize("chatDebug.status.idle", "Idle");
      details.push({ label: localize("chatDebug.detail.status", "Status"), value: statusLabel });
      const timing = model.timing;
      details.push({ label: localize("chatDebug.detail.created", "Created"), value: new Date(timing.created).toLocaleString() });
      if (timing.lastRequestEnded) {
        details.push({ label: localize("chatDebug.detail.lastActivity", "Last Activity"), value: new Date(timing.lastRequestEnded).toLocaleString() });
      } else if (timing.lastRequestStarted) {
        details.push({ label: localize("chatDebug.detail.lastActivity", "Last Activity"), value: new Date(timing.lastRequestStarted).toLocaleString() });
      }
    }
    if (details.length > 0) {
      const section = DOM.append(this.content, $(".chat-debug-overview-section"));
      DOM.append(section, $("h3.chat-debug-overview-section-label", void 0, localize("chatDebug.sessionDetails", "Session Details")));
      const detailsGrid = DOM.append(section, $(".chat-debug-overview-details"));
      for (const detail of details) {
        const row = DOM.append(detailsGrid, $(".chat-debug-overview-detail-row"));
        DOM.append(row, $("span.chat-debug-overview-detail-label", void 0, detail.label));
        DOM.append(row, $("span.chat-debug-overview-detail-value", void 0, detail.value));
      }
    }
  }
  getLocationLabel(location) {
    switch (location) {
      case ChatAgentLocation.Chat:
        return localize("chatDebug.location.chat", "Chat Panel");
      case ChatAgentLocation.Terminal:
        return localize("chatDebug.location.terminal", "Terminal");
      case ChatAgentLocation.Notebook:
        return localize("chatDebug.location.notebook", "Notebook");
      case ChatAgentLocation.EditorInline:
        return localize("chatDebug.location.editor", "Editor Inline");
      default:
        return String(location);
    }
  }
  renderDerivedOverview(events, showShimmer) {
    const metricsSection = DOM.append(this.content, $(".chat-debug-overview-section"));
    DOM.append(metricsSection, $("h3.chat-debug-overview-section-label", void 0, localize("chatDebug.summary", "Summary")));
    this.metricsContainer = DOM.append(metricsSection, $(".chat-debug-overview-metrics"));
    if (showShimmer) {
      this.renderMetricsShimmer(this.metricsContainer);
    } else {
      this.renderMetricsContent(this.metricsContainer, events);
    }
    const actionsSection = DOM.append(this.content, $(".chat-debug-overview-section"));
    DOM.append(actionsSection, $("h3.chat-debug-overview-section-label", void 0, localize("chatDebug.exploreTraceData", "Explore Trace Data")));
    const row = DOM.append(actionsSection, $(".chat-debug-overview-actions"));
    const viewLogsBtn = this.loadDisposables.add(new Button(row, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: localize("chatDebug.viewLogs", "View Logs") }));
    viewLogsBtn.element.classList.add("chat-debug-overview-action-button");
    viewLogsBtn.label = `$(list-flat) ${localize("chatDebug.viewLogs", "View Logs")}`;
    this.loadDisposables.add(viewLogsBtn.onDidClick(() => {
      this._onNavigate.fire(
        "logs"
        /* OverviewNavigation.Logs */
      );
    }));
    const flowChartBtn = this.loadDisposables.add(new Button(row, { ...defaultButtonStyles, secondary: true, supportIcons: true, title: localize("chatDebug.agentFlowChart", "Agent Flow Chart") }));
    flowChartBtn.element.classList.add("chat-debug-overview-action-button");
    flowChartBtn.label = `$(type-hierarchy) ${localize("chatDebug.agentFlowChart", "Agent Flow Chart")}`;
    this.loadDisposables.add(flowChartBtn.onDidClick(() => {
      this._onNavigate.fire(
        "flowchart"
        /* OverviewNavigation.FlowChart */
      );
    }));
  }
  renderMetricsShimmer(container) {
    const placeholderLabels = [
      localize("chatDebug.metric.modelTurns", "Model Turns"),
      localize("chatDebug.metric.toolCalls", "Tool Calls"),
      localize("chatDebug.metric.totalTokens", "Total Tokens"),
      localize("chatDebug.metric.errors", "Errors"),
      localize("chatDebug.metric.totalEvents", "Total Events")
    ];
    for (const label of placeholderLabels) {
      const card = DOM.append(container, $(".chat-debug-overview-metric-card"));
      DOM.append(card, $("div.chat-debug-overview-metric-label", void 0, label));
      const valueEl = DOM.append(card, $("div.chat-debug-overview-metric-value"));
      const shimmer = DOM.append(valueEl, $("span.chat-debug-overview-metric-shimmer"));
      shimmer.textContent = "\xA0";
    }
  }
  renderMetricsContent(container, events) {
    const modelTurns = events.filter((e) => e.kind === "modelTurn");
    const toolCalls = events.filter((e) => e.kind === "toolCall");
    const errors = events.filter((e) => e.kind === "generic" && e.level === ChatDebugLogLevel.Error || e.kind === "toolCall" && e.result === "error");
    const totalTokens = modelTurns.reduce((sum, e) => sum + (e.totalTokens ?? 0), 0);
    const metrics = [
      { label: localize("chatDebug.metric.modelTurns", "Model Turns"), value: String(modelTurns.length) },
      { label: localize("chatDebug.metric.toolCalls", "Tool Calls"), value: String(toolCalls.length) },
      { label: localize("chatDebug.metric.totalTokens", "Total Tokens"), value: totalTokens.toLocaleString() },
      { label: localize("chatDebug.metric.errors", "Errors"), value: String(errors.length) },
      { label: localize("chatDebug.metric.totalEvents", "Total Events"), value: String(events.length) }
    ];
    for (const metric of metrics) {
      const card = DOM.append(container, $(".chat-debug-overview-metric-card"));
      DOM.append(card, $("div.chat-debug-overview-metric-label", void 0, metric.label));
      DOM.append(card, $("div.chat-debug-overview-metric-value", void 0, metric.value));
    }
  }
};
ChatDebugOverviewView = __decorate([
  __param(1, IChatService),
  __param(2, IChatDebugService),
  __param(3, IChatWidgetService),
  __param(4, IChatSessionsService)
], ChatDebugOverviewView);
export {
  ChatDebugOverviewView,
  OverviewNavigation
};
//# sourceMappingURL=chatDebugOverviewView.js.map
