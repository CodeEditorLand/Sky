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
var AgentSessionRenderer_1, AgentSessionSectionRenderer_1;
import "./media/agentsessionsviewer.css";
import { h } from "../../../../../base/browser/dom.js";
import { localize } from "../../../../../nls.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { getAgentChangesSummary, hasValidDiff, isAgentSession, isAgentSessionSection, isAgentSessionsModel, isSessionInProgressStatus } from "./agentSessionsModel.js";
import { IconLabel } from "../../../../../base/browser/ui/iconLabel/iconLabel.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { fromNow, getDurationString } from "../../../../../base/common/date.js";
import { createMatches } from "../../../../../base/common/filters.js";
import { IMarkdownRendererService } from "../../../../../platform/markdown/browser/markdownRenderer.js";
import { allowedChatMarkdownHtmlTags } from "../widget/chatContentMarkdownRenderer.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { coalesce } from "../../../../../base/common/arrays.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { fillEditorsDragData } from "../../../../browser/dnd.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IntervalTimer } from "../../../../../base/common/async.js";
import { MenuWorkbenchToolBar } from "../../../../../platform/actions/browser/toolbar.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { renderAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
let AgentSessionRenderer = class AgentSessionRenderer2 {
  static {
    __name(this, "AgentSessionRenderer");
  }
  static {
    AgentSessionRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "agent-session";
  }
  constructor(options, markdownRendererService, productService, hoverService, instantiationService, contextKeyService) {
    this.options = options;
    this.markdownRendererService = markdownRendererService;
    this.productService = productService;
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.templateId = AgentSessionRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposable = disposables.add(new DisposableStore());
    const elements = h("div.agent-session-item@item", [
      h("div.agent-session-icon-col", [
        h("div.agent-session-icon@icon")
      ]),
      h("div.agent-session-main-col", [
        h("div.agent-session-title-row", [
          h("div.agent-session-title@title"),
          h("div.agent-session-title-toolbar@titleToolbar")
        ]),
        h("div.agent-session-details-row", [
          h("div.agent-session-diff-container@diffContainer", [
            h("span.agent-session-diff-files@filesSpan"),
            h("span.agent-session-diff-added@addedSpan"),
            h("span.agent-session-diff-removed@removedSpan")
          ]),
          h("div.agent-session-badge@badge"),
          h("div.agent-session-description@description"),
          h("div.agent-session-status@statusContainer", [
            h("span.agent-session-status-provider-icon@statusProviderIcon"),
            h("span.agent-session-status-time@statusTime")
          ])
        ])
      ])
    ]);
    const contextKeyService = disposables.add(this.contextKeyService.createScoped(elements.item));
    const scopedInstantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const titleToolbar = disposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, elements.titleToolbar, MenuId.AgentSessionItemToolbar, {
      menuOptions: { shouldForwardArgs: true }
    }));
    container.appendChild(elements.item);
    return {
      element: elements.item,
      icon: elements.icon,
      title: disposables.add(new IconLabel(elements.title, { supportHighlights: true, supportIcons: true })),
      titleToolbar,
      diffContainer: elements.diffContainer,
      diffFilesSpan: elements.filesSpan,
      diffAddedSpan: elements.addedSpan,
      diffRemovedSpan: elements.removedSpan,
      badge: elements.badge,
      description: elements.description,
      statusContainer: elements.statusContainer,
      statusProviderIcon: elements.statusProviderIcon,
      statusTime: elements.statusTime,
      contextKeyService,
      elementDisposable,
      disposables
    };
  }
  renderElement(session, index, template, details) {
    template.elementDisposable.clear();
    template.diffFilesSpan.textContent = "";
    template.diffAddedSpan.textContent = "";
    template.diffRemovedSpan.textContent = "";
    template.badge.textContent = "";
    template.description.textContent = "";
    template.element.classList.toggle("archived", session.element.isArchived());
    template.icon.className = `agent-session-icon ${ThemeIcon.asClassName(this.getIcon(session.element))}`;
    const markdownTitle = new MarkdownString(session.element.label);
    template.title.setLabel(renderAsPlaintext(markdownTitle), void 0, { matches: createMatches(session.filterData) });
    ChatContextKeys.isArchivedAgentSession.bindTo(template.contextKeyService).set(session.element.isArchived());
    ChatContextKeys.isReadAgentSession.bindTo(template.contextKeyService).set(session.element.isRead());
    ChatContextKeys.agentSessionType.bindTo(template.contextKeyService).set(session.element.providerType);
    template.titleToolbar.context = session.element;
    let hasDiff = false;
    const { changes: diff } = session.element;
    if (!isSessionInProgressStatus(session.element.status) && diff && hasValidDiff(diff)) {
      if (this.renderDiff(session, template)) {
        hasDiff = true;
      }
    }
    template.diffContainer.classList.toggle("has-diff", hasDiff);
    let hasBadge = false;
    if (!isSessionInProgressStatus(session.element.status)) {
      hasBadge = this.renderBadge(session, template);
    }
    template.badge.classList.toggle("has-badge", hasBadge);
    if (!hasDiff) {
      this.renderDescription(session, template, hasBadge);
    }
    this.renderStatus(session, template);
    this.renderHover(session, template);
  }
  renderBadge(session, template) {
    const badge = session.element.badge;
    if (badge) {
      this.renderMarkdownOrText(badge, template.badge, template.elementDisposable);
    }
    return !!badge;
  }
  renderMarkdownOrText(content, container, disposables) {
    if (typeof content === "string") {
      container.textContent = content;
    } else {
      disposables.add(this.markdownRendererService.render(content, {
        sanitizerConfig: {
          replaceWithPlaintext: true,
          allowedTags: {
            override: allowedChatMarkdownHtmlTags
          },
          allowedLinkSchemes: { augment: [this.productService.urlProtocol] }
        }
      }, container));
    }
  }
  renderDiff(session, template) {
    const diff = getAgentChangesSummary(session.element.changes);
    if (!diff) {
      return false;
    }
    if (diff.files > 0) {
      template.diffFilesSpan.textContent = diff.files === 1 ? localize("diffFile", "1 file") : localize("diffFiles", "{0} files", diff.files);
    }
    if (diff.insertions >= 0) {
      template.diffAddedSpan.textContent = `+${diff.insertions}`;
    }
    if (diff.deletions >= 0) {
      template.diffRemovedSpan.textContent = `-${diff.deletions}`;
    }
    return true;
  }
  getIcon(session) {
    if (session.status === 2) {
      return Codicon.sessionInProgress;
    }
    if (session.status === 3) {
      return Codicon.report;
    }
    if (session.status === 0) {
      return Codicon.error;
    }
    if (!session.isRead() && !session.isArchived()) {
      return Codicon.circleFilled;
    }
    return Codicon.circleSmallFilled;
  }
  renderDescription(session, template, hasBadge) {
    const description = session.element.description;
    if (description) {
      this.renderMarkdownOrText(description, template.description, template.elementDisposable);
    } else {
      if (session.element.status === 2) {
        template.description.textContent = localize("chat.session.status.inProgress", "Working...");
      } else if (session.element.status === 3) {
        template.description.textContent = localize("chat.session.status.needsInput", "Input needed.");
      } else if (hasBadge && session.element.status === 1) {
        template.description.textContent = "";
      } else if (session.element.timing.finishedOrFailedTime && session.element.timing.inProgressTime && session.element.timing.finishedOrFailedTime > session.element.timing.inProgressTime) {
        const duration = this.toDuration(session.element.timing.inProgressTime, session.element.timing.finishedOrFailedTime, false);
        template.description.textContent = session.element.status === 0 ? localize("chat.session.status.failedAfter", "Failed after {0}.", duration ?? "1s") : localize("chat.session.status.completedAfter", "Completed in {0}.", duration ?? "1s");
      } else {
        template.description.textContent = session.element.status === 0 ? localize("chat.session.status.failed", "Failed") : localize("chat.session.status.completed", "Completed");
      }
    }
  }
  toDuration(startTime, endTime, useFullTimeWords) {
    const elapsed = Math.round((endTime - startTime) / 1e3) * 1e3;
    if (elapsed < 1e3) {
      return void 0;
    }
    return getDurationString(elapsed, useFullTimeWords);
  }
  renderStatus(session, template) {
    const getTimeLabel = /* @__PURE__ */ __name((session2) => {
      let timeLabel;
      if (session2.status === 2 && session2.timing.inProgressTime) {
        timeLabel = this.toDuration(session2.timing.inProgressTime, Date.now(), false);
      }
      if (!timeLabel) {
        timeLabel = fromNow(session2.timing.lastRequestEnded ?? session2.timing.lastRequestStarted ?? session2.timing.created);
      }
      return timeLabel;
    }, "getTimeLabel");
    template.statusProviderIcon.className = `agent-session-status-provider-icon ${ThemeIcon.asClassName(session.element.icon)}`;
    template.statusTime.textContent = getTimeLabel(session.element);
    const timer = template.elementDisposable.add(new IntervalTimer());
    timer.cancelAndSet(
      () => template.statusTime.textContent = getTimeLabel(session.element),
      session.element.status === 2 ? 1e3 : 60 * 1e3
      /* every minute */
    );
  }
  renderHover(session, template) {
    template.elementDisposable.add(this.hoverService.setupDelayedHover(template.element, () => ({
      content: this.buildTooltip(session.element),
      style: 1,
      position: {
        hoverPosition: this.options.getHoverPosition()
      }
    }), { groupId: "agent.sessions" }));
  }
  buildTooltip(session) {
    const lines = [];
    lines.push(`**${session.label}**`);
    if (session.tooltip) {
      const tooltip = typeof session.tooltip === "string" ? session.tooltip : session.tooltip.value;
      lines.push(tooltip);
    } else {
      if (session.description) {
        const description = typeof session.description === "string" ? session.description : session.description.value;
        lines.push(description);
      }
      if (session.badge) {
        const badge = typeof session.badge === "string" ? session.badge : session.badge.value;
        lines.push(badge);
      }
    }
    const details = [];
    details.push(toStatusLabel(session.status));
    details.push(session.providerLabel);
    if (session.timing.finishedOrFailedTime && session.timing.inProgressTime) {
      const duration = this.toDuration(session.timing.inProgressTime, session.timing.finishedOrFailedTime, true);
      if (duration) {
        details.push(duration);
      }
    } else {
      const startTime = session.timing.lastRequestStarted ?? session.timing.created;
      details.push(fromNow(startTime, true, true));
    }
    lines.push(details.join(" \u2022 "));
    const diff = getAgentChangesSummary(session.changes);
    if (diff && hasValidDiff(session.changes)) {
      const diffParts = [];
      if (diff.files > 0) {
        diffParts.push(diff.files === 1 ? localize("tooltip.file", "1 file") : localize("tooltip.files", "{0} files", diff.files));
      }
      if (diff.insertions > 0) {
        diffParts.push(`+${diff.insertions}`);
      }
      if (diff.deletions > 0) {
        diffParts.push(`-${diff.deletions}`);
      }
      if (diffParts.length > 0) {
        lines.push(`$(diff) ${diffParts.join(", ")}`);
      }
    }
    if (session.isArchived()) {
      lines.push(`$(archive) ${localize("tooltip.archived", "Archived")}`);
    }
    return new MarkdownString(lines.join("\n\n"), { supportThemeIcons: true });
  }
  renderCompressedElements(node, index, templateData, details) {
    throw new Error("Should never happen since session is incompressible");
  }
  disposeElement(element, index, template, details) {
    template.elementDisposable.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
AgentSessionRenderer = AgentSessionRenderer_1 = __decorate([
  __param(1, IMarkdownRendererService),
  __param(2, IProductService),
  __param(3, IHoverService),
  __param(4, IInstantiationService),
  __param(5, IContextKeyService)
], AgentSessionRenderer);
function toStatusLabel(status) {
  let statusLabel;
  switch (status) {
    case 3:
      statusLabel = localize("agentSessionNeedsInput", "Needs Input");
      break;
    case 2:
      statusLabel = localize("agentSessionInProgress", "In Progress");
      break;
    case 0:
      statusLabel = localize("agentSessionFailed", "Failed");
      break;
    default:
      statusLabel = localize("agentSessionCompleted", "Completed");
  }
  return statusLabel;
}
__name(toStatusLabel, "toStatusLabel");
let AgentSessionSectionRenderer = class AgentSessionSectionRenderer2 {
  static {
    __name(this, "AgentSessionSectionRenderer");
  }
  static {
    AgentSessionSectionRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "agent-session-section";
  }
  constructor(instantiationService, contextKeyService) {
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.templateId = AgentSessionSectionRenderer_1.TEMPLATE_ID;
  }
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elements = h("div.agent-session-section@container", [
      h("span.agent-session-section-label@label"),
      h("div.agent-session-section-toolbar@toolbar")
    ]);
    const contextKeyService = disposables.add(this.contextKeyService.createScoped(elements.container));
    const scopedInstantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService])));
    const toolbar = disposables.add(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, elements.toolbar, MenuId.AgentSessionSectionToolbar, {
      menuOptions: { shouldForwardArgs: true }
    }));
    container.appendChild(elements.container);
    return {
      container: elements.container,
      label: elements.label,
      toolbar,
      contextKeyService,
      disposables
    };
  }
  renderElement(element, index, template, details) {
    template.label.textContent = element.element.label;
    ChatContextKeys.agentSessionSection.bindTo(template.contextKeyService).set(element.element.section);
    template.toolbar.context = element.element;
  }
  renderCompressedElements(node, index, templateData, details) {
    throw new Error("Should never happen since section header is incompressible");
  }
  disposeElement(element, index, template, details) {
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
AgentSessionSectionRenderer = AgentSessionSectionRenderer_1 = __decorate([
  __param(0, IInstantiationService),
  __param(1, IContextKeyService)
], AgentSessionSectionRenderer);
class AgentSessionsListDelegate {
  static {
    __name(this, "AgentSessionsListDelegate");
  }
  static {
    this.ITEM_HEIGHT = 52;
  }
  static {
    this.SECTION_HEIGHT = 26;
  }
  getHeight(element) {
    if (isAgentSessionSection(element)) {
      return AgentSessionsListDelegate.SECTION_HEIGHT;
    }
    return AgentSessionsListDelegate.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    if (isAgentSessionSection(element)) {
      return AgentSessionSectionRenderer.TEMPLATE_ID;
    }
    return AgentSessionRenderer.TEMPLATE_ID;
  }
}
class AgentSessionsAccessibilityProvider {
  static {
    __name(this, "AgentSessionsAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("agentSessions", "Agent Sessions");
  }
  getAriaLabel(element) {
    if (isAgentSessionSection(element)) {
      return localize("agentSessionSectionAriaLabel", "{0} sessions section", element.label);
    }
    return localize("agentSessionItemAriaLabel", "{0} session {1} ({2}), created {3}", element.providerLabel, element.label, toStatusLabel(element.status), new Date(element.timing.created).toLocaleString());
  }
}
class AgentSessionsDataSource {
  static {
    __name(this, "AgentSessionsDataSource");
  }
  constructor(filter, sorter) {
    this.filter = filter;
    this.sorter = sorter;
  }
  hasChildren(element) {
    if (isAgentSessionsModel(element)) {
      return true;
    } else if (isAgentSessionSection(element)) {
      return element.sessions.length > 0;
    } else {
      return false;
    }
  }
  getChildren(element) {
    if (isAgentSessionsModel(element)) {
      let filteredSessions = element.sessions.filter((session) => !this.filter?.exclude(session));
      const limitResultsCount = this.filter?.limitResults?.();
      if (!this.filter?.groupResults?.() || typeof limitResultsCount === "number") {
        filteredSessions.sort(this.sorter.compare.bind(this.sorter));
      }
      if (typeof limitResultsCount === "number") {
        filteredSessions = filteredSessions.slice(0, limitResultsCount);
      }
      this.filter?.notifyResults?.(filteredSessions.length);
      if (this.filter?.groupResults?.()) {
        return this.groupSessionsIntoSections(filteredSessions);
      }
      return filteredSessions;
    } else if (isAgentSessionSection(element)) {
      return element.sessions;
    } else {
      return [];
    }
  }
  groupSessionsIntoSections(sessions) {
    const result = [];
    const sortedSessions = sessions.sort(this.sorter.compare.bind(this.sorter));
    const groupedSessions = groupAgentSessions(sortedSessions);
    for (const { sessions: sessions2, section, label } of groupedSessions.values()) {
      if (sessions2.length === 0) {
        continue;
      }
      result.push({ section, label, sessions: sessions2 });
    }
    return result;
  }
}
const DAY_THRESHOLD = 24 * 60 * 60 * 1e3;
const WEEK_THRESHOLD = 7 * DAY_THRESHOLD;
const AgentSessionSectionLabels = {
  [
    "inProgress"
    /* AgentSessionSection.InProgress */
  ]: localize("agentSessions.inProgressSection", "In Progress"),
  [
    "today"
    /* AgentSessionSection.Today */
  ]: localize("agentSessions.todaySection", "Today"),
  [
    "yesterday"
    /* AgentSessionSection.Yesterday */
  ]: localize("agentSessions.yesterdaySection", "Yesterday"),
  [
    "week"
    /* AgentSessionSection.Week */
  ]: localize("agentSessions.weekSection", "Last Week"),
  [
    "older"
    /* AgentSessionSection.Older */
  ]: localize("agentSessions.olderSection", "Older"),
  [
    "archived"
    /* AgentSessionSection.Archived */
  ]: localize("agentSessions.archivedSection", "Archived")
};
function groupAgentSessions(sessions) {
  const now = Date.now();
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - DAY_THRESHOLD;
  const weekThreshold = now - WEEK_THRESHOLD;
  const inProgressSessions = [];
  const todaySessions = [];
  const yesterdaySessions = [];
  const weekSessions = [];
  const olderSessions = [];
  const archivedSessions = [];
  for (const session of sessions) {
    if (isSessionInProgressStatus(session.status)) {
      inProgressSessions.push(session);
    } else if (session.isArchived()) {
      archivedSessions.push(session);
    } else {
      const sessionTime = session.timing.lastRequestEnded ?? session.timing.lastRequestStarted ?? session.timing.created;
      if (sessionTime >= startOfToday) {
        todaySessions.push(session);
      } else if (sessionTime >= startOfYesterday) {
        yesterdaySessions.push(session);
      } else if (sessionTime >= weekThreshold) {
        weekSessions.push(session);
      } else {
        olderSessions.push(session);
      }
    }
  }
  return /* @__PURE__ */ new Map([
    ["inProgress", { section: "inProgress", label: AgentSessionSectionLabels[
      "inProgress"
      /* AgentSessionSection.InProgress */
    ], sessions: inProgressSessions }],
    ["today", { section: "today", label: AgentSessionSectionLabels[
      "today"
      /* AgentSessionSection.Today */
    ], sessions: todaySessions }],
    ["yesterday", { section: "yesterday", label: AgentSessionSectionLabels[
      "yesterday"
      /* AgentSessionSection.Yesterday */
    ], sessions: yesterdaySessions }],
    ["week", { section: "week", label: AgentSessionSectionLabels[
      "week"
      /* AgentSessionSection.Week */
    ], sessions: weekSessions }],
    ["older", { section: "older", label: AgentSessionSectionLabels[
      "older"
      /* AgentSessionSection.Older */
    ], sessions: olderSessions }],
    ["archived", { section: "archived", label: localize("agentSessions.archivedSectionWithCount", "Archived ({0})", archivedSessions.length), sessions: archivedSessions }]
  ]);
}
__name(groupAgentSessions, "groupAgentSessions");
class AgentSessionsIdentityProvider {
  static {
    __name(this, "AgentSessionsIdentityProvider");
  }
  getId(element) {
    if (isAgentSessionSection(element)) {
      return `section-${element.section}`;
    }
    if (isAgentSession(element)) {
      return element.resource.toString();
    }
    return "agent-sessions-id";
  }
}
class AgentSessionsCompressionDelegate {
  static {
    __name(this, "AgentSessionsCompressionDelegate");
  }
  isIncompressible(element) {
    return true;
  }
}
class AgentSessionsSorter {
  static {
    __name(this, "AgentSessionsSorter");
  }
  constructor(options) {
    this.options = options;
  }
  compare(sessionA, sessionB) {
    const aNeedsInput = sessionA.status === 3;
    const bNeedsInput = sessionB.status === 3;
    if (aNeedsInput && !bNeedsInput) {
      return -1;
    }
    if (!aNeedsInput && bNeedsInput) {
      return 1;
    }
    const aInProgress = sessionA.status === 2;
    const bInProgress = sessionB.status === 2;
    if (aInProgress && !bInProgress) {
      return -1;
    }
    if (!aInProgress && bInProgress) {
      return 1;
    }
    const aArchived = sessionA.isArchived();
    const bArchived = sessionB.isArchived();
    if (!aArchived && bArchived) {
      return -1;
    }
    if (aArchived && !bArchived) {
      return 1;
    }
    const override = this.options?.overrideCompare?.(sessionA, sessionB);
    if (typeof override === "number") {
      return override;
    }
    const timeA = sessionA.timing.lastRequestEnded ?? sessionA.timing.lastRequestStarted ?? sessionA.timing.created;
    const timeB = sessionB.timing.lastRequestEnded ?? sessionB.timing.lastRequestStarted ?? sessionB.timing.created;
    return timeB - timeA;
  }
}
class AgentSessionsKeyboardNavigationLabelProvider {
  static {
    __name(this, "AgentSessionsKeyboardNavigationLabelProvider");
  }
  getKeyboardNavigationLabel(element) {
    if (isAgentSessionSection(element)) {
      return element.label;
    }
    return element.label;
  }
  getCompressedNodeKeyboardNavigationLabel(elements) {
    return void 0;
  }
}
let AgentSessionsDragAndDrop = class AgentSessionsDragAndDrop2 extends Disposable {
  static {
    __name(this, "AgentSessionsDragAndDrop");
  }
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
  }
  onDragStart(data, originalEvent) {
    const elements = data.getData().filter((e) => isAgentSession(e));
    const uris = coalesce(elements.map((e) => e.resource));
    this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, uris, originalEvent));
  }
  getDragURI(element) {
    if (isAgentSessionSection(element)) {
      return null;
    }
    return element.resource.toString();
  }
  getDragLabel(elements, originalEvent) {
    const sessions = elements.filter((e) => isAgentSession(e));
    if (sessions.length === 1) {
      return sessions[0].label;
    }
    return localize("agentSessions.dragLabel", "{0} agent sessions", sessions.length);
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    return false;
  }
  drop(data, targetElement, targetIndex, targetSector, originalEvent) {
  }
};
AgentSessionsDragAndDrop = __decorate([
  __param(0, IInstantiationService)
], AgentSessionsDragAndDrop);
export {
  AgentSessionRenderer,
  AgentSessionSectionLabels,
  AgentSessionSectionRenderer,
  AgentSessionsAccessibilityProvider,
  AgentSessionsCompressionDelegate,
  AgentSessionsDataSource,
  AgentSessionsDragAndDrop,
  AgentSessionsIdentityProvider,
  AgentSessionsKeyboardNavigationLabelProvider,
  AgentSessionsListDelegate,
  AgentSessionsSorter,
  groupAgentSessions
};
//# sourceMappingURL=agentSessionsViewer.js.map
