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
import { NotSelectableGroupId } from "../../../../../base/browser/ui/list/list.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
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
import { Emitter } from "../../../../../base/common/event.js";
import { renderAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { AgentSessionHoverWidget } from "./agentSessionHoverWidget.js";
import { AgentSessionProviders, getAgentSessionTime } from "./agentSessions.js";
import { AgentSessionsGrouping } from "./agentSessionsFilter.js";
import { autorun } from "../../../../../base/common/observable.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { BugIndicatingError } from "../../../../../base/common/errors.js";
let AgentSessionRenderer = class AgentSessionRenderer2 extends Disposable {
  static {
    __name(this, "AgentSessionRenderer");
  }
  static {
    AgentSessionRenderer_1 = this;
  }
  static {
    this.TEMPLATE_ID = "agent-session";
  }
  static {
    this.APPROVAL_ROW_MAX_LINES = 3;
  }
  static {
    this._APPROVAL_ROW_LINE_HEIGHT = 18;
  }
  static {
    this._APPROVAL_ROW_OVERHEAD = 14;
  }
  // 4px margin-top + 4px padding-top + 4px padding-bottom + 2px border
  static getApprovalRowHeight(label) {
    const lineCount = Math.min(label.split(/\r?\n/).length, AgentSessionRenderer_1.APPROVAL_ROW_MAX_LINES);
    return lineCount * AgentSessionRenderer_1._APPROVAL_ROW_LINE_HEIGHT + AgentSessionRenderer_1._APPROVAL_ROW_OVERHEAD;
  }
  constructor(options, _approvalModel, _activeSessionResource, markdownRendererService, productService, hoverService, instantiationService, contextKeyService) {
    super();
    this.options = options;
    this._approvalModel = _approvalModel;
    this._activeSessionResource = _activeSessionResource;
    this.markdownRendererService = markdownRendererService;
    this.productService = productService;
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.templateId = AgentSessionRenderer_1.TEMPLATE_ID;
    this.sessionHover = this._register(new MutableDisposable());
    this._onDidChangeItemHeight = this._register(new Emitter());
    this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
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
            h("span.agent-session-diff-added@addedSpan"),
            h("span.agent-session-diff-removed@removedSpan")
          ]),
          h("div.agent-session-description@description"),
          h("div.agent-session-details-right", [
            h("div.agent-session-badge@badge"),
            h("span.agent-session-separator@separator"),
            h("div.agent-session-status@statusContainer", [
              h("span.agent-session-status-provider-icon@statusProviderIcon"),
              h("span.agent-session-status-time@statusTime")
            ])
          ])
        ]),
        h("div.agent-session-approval-row@approvalRow", [
          h("span.agent-session-approval-label@approvalLabel"),
          h("div.agent-session-approval-button@approvalButtonContainer")
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
      diffAddedSpan: elements.addedSpan,
      diffRemovedSpan: elements.removedSpan,
      badge: elements.badge,
      separator: elements.separator,
      description: elements.description,
      statusContainer: elements.statusContainer,
      statusProviderIcon: elements.statusProviderIcon,
      statusTime: elements.statusTime,
      approvalRow: elements.approvalRow,
      approvalLabel: elements.approvalLabel,
      approvalButtonContainer: elements.approvalButtonContainer,
      contextKeyService,
      elementDisposable,
      disposables
    };
  }
  renderElement(session, index, template, details) {
    template.elementDisposable.clear();
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
    let hasAgentSessionChanges = false;
    if (session.element.providerType === AgentSessionProviders.Background || session.element.providerType === AgentSessionProviders.Cloud) {
      hasAgentSessionChanges = Array.isArray(diff) && diff.length > 0;
    } else {
      hasAgentSessionChanges = hasDiff;
    }
    ChatContextKeys.hasAgentSessionChanges.bindTo(template.contextKeyService).set(hasAgentSessionChanges);
    const hasBadge = this.renderBadge(session, template);
    template.badge.classList.toggle("has-badge", hasBadge);
    if (!hasDiff) {
      this.renderDescription(session, template);
    }
    template.separator.classList.toggle("has-separator", hasBadge);
    this.renderStatus(session, template);
    this.renderHover(session, template);
    if (this._approvalModel) {
      this.renderApprovalRow(session, template);
    }
  }
  renderBadge(session, template) {
    const badge = session.element.badge;
    if (!badge) {
      return false;
    }
    if (this.options.isGroupedByRepository?.()) {
      const raw = typeof badge === "string" ? badge : badge.value;
      if (/^\$\((?:repo|folder|worktree)\)\s*.+/.test(raw)) {
        return false;
      }
    }
    this.renderMarkdownOrText(badge, template.badge, template.elementDisposable);
    return true;
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
  renderDescription(session, template) {
    const description = session.element.description;
    if (description) {
      this.renderMarkdownOrText(description, template.description, template.elementDisposable);
      return;
    }
    if (session.element.status === 2) {
      template.description.textContent = localize("chat.session.status.inProgress", "Working...");
    } else if (session.element.status === 3) {
      template.description.textContent = localize("chat.session.status.needsInput", "Input needed.");
    } else if (session.element.timing.lastRequestEnded && session.element.timing.lastRequestStarted && session.element.timing.lastRequestEnded > session.element.timing.lastRequestStarted) {
      const duration = this.toDuration(session.element.timing.lastRequestStarted, session.element.timing.lastRequestEnded, false, true);
      template.description.textContent = session.element.status === 0 ? localize("chat.session.status.failedAfter", "Failed after {0}", duration) : localize("chat.session.status.completedAfter", "Completed in {0}", duration);
    } else {
      template.description.textContent = session.element.status === 0 ? localize("chat.session.status.failed", "Failed") : localize("chat.session.status.completed", "Completed");
    }
  }
  toDuration(startTime, endTime, useFullTimeWords, disallowNow) {
    const elapsed = Math.max(
      Math.round((endTime - startTime) / 1e3) * 1e3,
      1e3
      /* clamp to 1s */
    );
    if (!disallowNow && elapsed < 6e4) {
      return localize("secondsDuration", "now");
    }
    return getDurationString(elapsed, useFullTimeWords);
  }
  renderStatus(session, template) {
    const getTimeLabel = /* @__PURE__ */ __name((session2) => {
      let timeLabel;
      if (session2.status === 2 && session2.timing.lastRequestStarted) {
        timeLabel = this.toDuration(session2.timing.lastRequestStarted, Date.now(), false, false);
      }
      if (!timeLabel) {
        const date = getAgentSessionTime(session2.timing);
        const seconds = Math.round(((/* @__PURE__ */ new Date()).getTime() - date) / 1e3);
        if (seconds < 60) {
          timeLabel = localize("secondsDuration", "now");
        } else {
          timeLabel = sessionDateFromNow(date);
        }
      }
      return timeLabel;
    }, "getTimeLabel");
    const isLocal = session.element.providerType === AgentSessionProviders.Local;
    if (isLocal) {
      template.statusProviderIcon.className = "";
    } else if (this.options.showIsolationIcon && session.element.providerType === AgentSessionProviders.Background) {
      const hasWorktree = typeof session.element.metadata?.worktreePath === "string";
      const isolationIcon = hasWorktree ? Codicon.worktree : Codicon.folder;
      template.statusProviderIcon.className = `agent-session-status-provider-icon ${ThemeIcon.asClassName(isolationIcon)}`;
    } else {
      template.statusProviderIcon.className = `agent-session-status-provider-icon ${ThemeIcon.asClassName(session.element.icon)}`;
    }
    template.statusTime.textContent = getTimeLabel(session.element);
    const timer = template.elementDisposable.add(new IntervalTimer());
    timer.cancelAndSet(
      () => template.statusTime.textContent = getTimeLabel(session.element),
      session.element.status === 2 ? 1e3 : 60 * 1e3
      /* every minute */
    );
  }
  renderHover(session, template) {
    if (this.options.disableHover) {
      return;
    }
    if (!isSessionInProgressStatus(session.element.status) && session.element.isRead()) {
      return;
    }
    const reducedDelay = session.element.status === 3;
    template.elementDisposable.add(this.hoverService.setupDelayedHover(template.element, () => this.buildHoverContent(session.element), { groupId: "agent.sessions", reducedDelay }));
  }
  buildHoverContent(session) {
    if (this.sessionHover.value?.session.resource.toString() !== session.resource.toString()) {
      this.sessionHover.value = this.instantiationService.createInstance(AgentSessionHoverWidget, session);
    }
    const widget = this.sessionHover.value;
    return {
      id: `agent.session.hover.${session.resource.toString()}`,
      content: widget.domNode,
      style: 1,
      onDidShow: /* @__PURE__ */ __name(() => widget.onRendered(), "onDidShow"),
      position: {
        hoverPosition: this.options.getHoverPosition()
      }
    };
  }
  renderApprovalRow(session, template) {
    if (this._approvalModel === void 0) {
      throw new BugIndicatingError("Approval model is required to render approval row");
    }
    const approvalModel = this._approvalModel;
    const initialInfo = approvalModel.getApproval(session.element.resource).get();
    let wasVisible = !!initialInfo;
    template.approvalRow.classList.toggle("visible", wasVisible);
    const buttonStore = template.elementDisposable.add(new DisposableStore());
    template.elementDisposable.add(autorun((reader) => {
      buttonStore.clear();
      const info = approvalModel.getApproval(session.element.resource).read(reader);
      const visible = !!info;
      template.approvalRow.classList.toggle("visible", visible);
      if (info) {
        const lines = info.label.split("\n");
        const maxLines = AgentSessionRenderer_1.APPROVAL_ROW_MAX_LINES;
        const visibleLines = lines.slice(0, maxLines);
        if (lines.length > maxLines) {
          visibleLines[maxLines - 1] = `${visibleLines[maxLines - 1]} \u2026`;
        }
        const langId = info.languageId ?? "json";
        const labelContent = new MarkdownString();
        for (const line of visibleLines) {
          labelContent.appendCodeblock(langId, line);
        }
        this.renderMarkdownOrText(labelContent, template.approvalLabel, buttonStore);
        const fullContent = new MarkdownString().appendCodeblock(info.languageId ?? "json", info.label);
        buttonStore.add(this.hoverService.setupDelayedHover(template.approvalLabel, {
          content: fullContent,
          style: 1,
          position: {
            hoverPosition: 2
            /* HoverPosition.BELOW */
          }
        }));
        template.approvalButtonContainer.textContent = "";
        const isActive = this._activeSessionResource.read(reader)?.toString() === session.element.resource.toString();
        const button = buttonStore.add(new Button(template.approvalButtonContainer, {
          title: localize("allowActionOnce", "Allow once"),
          secondary: isActive,
          ...defaultButtonStyles
        }));
        button.label = localize("allowAction", "Allow");
        buttonStore.add(button.onDidClick(() => info.confirm()));
      }
      if (wasVisible !== visible) {
        wasVisible = visible;
        this._onDidChangeItemHeight.fire(session.element);
      }
    }));
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
  __param(3, IMarkdownRendererService),
  __param(4, IProductService),
  __param(5, IHoverService),
  __param(6, IInstantiationService),
  __param(7, IContextKeyService)
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
    this.ITEM_HEIGHT = 54;
  }
  static {
    this.SECTION_HEIGHT = 26;
  }
  constructor(_approvalModel) {
    this._approvalModel = _approvalModel;
  }
  getHeight(element) {
    if (isAgentSessionSection(element)) {
      return AgentSessionsListDelegate.SECTION_HEIGHT;
    }
    let height = AgentSessionsListDelegate.ITEM_HEIGHT;
    const approval = this._approvalModel?.getApproval(element.resource).get();
    if (approval) {
      height += AgentSessionRenderer.getApprovalRowHeight(approval.label);
    }
    return height;
  }
  hasDynamicHeight(element) {
    return !!this._approvalModel && isAgentSession(element);
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
  getWidgetRole() {
    return "list";
  }
  getRole(element) {
    return "listitem";
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
class AgentSessionsDataSource extends Disposable {
  static {
    __name(this, "AgentSessionsDataSource");
  }
  static {
    this.CAPPED_SESSIONS_LIMIT = 3;
  }
  constructor(filter, sorter) {
    super();
    this.filter = filter;
    this.sorter = sorter;
    this._onDidGetChildren = this._register(new Emitter());
    this.onDidGetChildren = this._onDidGetChildren.event;
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
      this._onDidGetChildren.fire(filteredSessions.length);
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
    const sortedSessions = sessions.sort(this.sorter.compare.bind(this.sorter));
    if (this.filter?.groupResults?.() === AgentSessionsGrouping.Capped) {
      if (this.filter?.getExcludes().read) {
        return sortedSessions;
      }
      return this.groupSessionsCapped(sortedSessions);
    } else if (this.filter?.groupResults?.() === AgentSessionsGrouping.Repository) {
      return this.groupSessionsByRepository(sortedSessions);
    } else {
      return this.groupSessionsByDate(sortedSessions);
    }
  }
  groupSessionsCapped(sortedSessions) {
    const result = [];
    const firstArchivedIndex = sortedSessions.findIndex((session) => session.isArchived());
    const nonArchivedCount = firstArchivedIndex === -1 ? sortedSessions.length : firstArchivedIndex;
    const topSessions = sortedSessions.slice(0, Math.min(AgentSessionsDataSource.CAPPED_SESSIONS_LIMIT, nonArchivedCount));
    const othersSessions = sortedSessions.slice(topSessions.length);
    result.push(...topSessions);
    if (othersSessions.length > 0) {
      result.push({
        section: "more",
        label: AgentSessionSectionLabels[
          "more"
          /* AgentSessionSection.More */
        ],
        sessions: othersSessions
      });
    }
    return result;
  }
  groupSessionsByDate(sortedSessions) {
    const result = [];
    const groupedSessions = groupAgentSessionsByDate(sortedSessions);
    for (const { sessions, section, label } of groupedSessions.values()) {
      if (sessions.length === 0) {
        continue;
      }
      result.push({ section, label, sessions });
    }
    return result;
  }
  groupSessionsByRepository(sortedSessions) {
    const repoMap = /* @__PURE__ */ new Map();
    const archivedSessions = [];
    const unknownKey = "\0unknown";
    const unknownLabel = localize("agentSessions.noRepository", "Other");
    for (const session of sortedSessions) {
      if (session.isArchived()) {
        archivedSessions.push(session);
        continue;
      }
      const repoName = this.getRepositoryName(session);
      const repoId = repoName || unknownKey;
      const repoLabel = repoName || unknownLabel;
      let group = repoMap.get(repoId);
      if (!group) {
        group = { label: repoLabel, sessions: [] };
        repoMap.set(repoId, group);
      }
      group.sessions.push(session);
    }
    const result = [];
    for (const [, { label, sessions }] of repoMap) {
      result.push({
        section: "repository",
        label,
        sessions
      });
    }
    if (archivedSessions.length > 0) {
      result.push({
        section: "archived",
        label: AgentSessionSectionLabels[
          "archived"
          /* AgentSessionSection.Archived */
        ],
        sessions: archivedSessions
      });
    }
    return result;
  }
  getRepositoryName(session) {
    const metadata = session.metadata;
    if (metadata) {
      const owner = metadata.owner;
      const name = metadata.name;
      if (owner && name) {
        return name;
      }
      const nwo = metadata.repositoryNwo;
      if (nwo && nwo.includes("/")) {
        return nwo.split("/").pop();
      }
      const repository = metadata.repository;
      if (repository) {
        const repoName = this.parseRepositoryName(repository);
        if (repoName) {
          return repoName;
        }
      }
      const repositoryUrl = metadata.repositoryUrl;
      if (repositoryUrl) {
        const repoName = this.parseRepositoryName(repositoryUrl);
        if (repoName) {
          return repoName;
        }
      }
      const repositoryPath = metadata.repositoryPath;
      if (repositoryPath) {
        const repoName = this.extractRepoNameFromPath(repositoryPath);
        if (repoName) {
          return repoName;
        }
      }
      const worktreePath = metadata.worktreePath;
      if (worktreePath) {
        const repoName = this.extractRepoNameFromPath(worktreePath);
        if (repoName) {
          return repoName;
        }
      }
      const workingDirectoryPath = metadata.workingDirectoryPath;
      if (workingDirectoryPath) {
        const repoName = this.extractRepoNameFromPath(workingDirectoryPath);
        if (repoName) {
          return repoName;
        }
      }
    }
    const badge = session.badge;
    if (badge) {
      const raw = typeof badge === "string" ? badge : badge.value;
      const badgeMatch = raw.match(/\$\((?:repo|folder|worktree)\)\s*(.+)/);
      if (badgeMatch) {
        return badgeMatch[1].trim();
      }
    }
    return void 0;
  }
  /**
   * Parses a repository name from various formats: "owner/repo", URLs,
   * and git@host:owner/repo.git style references.
   */
  parseRepositoryName(value) {
    if (value.includes("/") && !value.includes("://") && !value.startsWith("git@")) {
      let repoSegment = value.split("/").filter(Boolean).pop();
      if (repoSegment?.endsWith(".git")) {
        repoSegment = repoSegment.slice(0, -4);
      }
      return repoSegment || void 0;
    }
    try {
      const url = new URL(value);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        let repoSegment = parts[1];
        if (repoSegment.endsWith(".git")) {
          repoSegment = repoSegment.slice(0, -4);
        }
        return repoSegment || void 0;
      }
    } catch {
    }
    if (value.startsWith("git@")) {
      const colonIndex = value.indexOf(":");
      if (colonIndex !== -1 && colonIndex < value.length - 1) {
        const pathPart = value.substring(colonIndex + 1);
        let repoSegment = pathPart.split("/").filter(Boolean).pop();
        if (repoSegment?.endsWith(".git")) {
          repoSegment = repoSegment.slice(0, -4);
        }
        return repoSegment || void 0;
      }
    }
    return void 0;
  }
  /**
   * Extracts the repository name from a filesystem path, handling git worktree
   * conventions where paths follow `<repo>.worktrees/<worktree-name>`.
   */
  extractRepoNameFromPath(dirPath) {
    const segments = dirPath.split(/[/\\]/).filter(Boolean);
    if (segments.length < 2) {
      return segments[0];
    }
    const parent = segments[segments.length - 2];
    if (parent.endsWith(".worktrees")) {
      return parent.slice(0, -".worktrees".length) || void 0;
    }
    return segments[segments.length - 1];
  }
}
const AgentSessionSectionLabels = {
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
  ]: localize("agentSessions.weekSection", "Last 7 days"),
  [
    "older"
    /* AgentSessionSection.Older */
  ]: localize("agentSessions.olderSection", "Older"),
  [
    "archived"
    /* AgentSessionSection.Archived */
  ]: localize("agentSessions.archivedSection", "Archived"),
  [
    "more"
    /* AgentSessionSection.More */
  ]: localize("agentSessions.moreSection", "More")
};
const DAY_THRESHOLD = 24 * 60 * 60 * 1e3;
const WEEK_THRESHOLD = 7 * DAY_THRESHOLD;
function groupAgentSessionsByDate(sessions) {
  const now = Date.now();
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - DAY_THRESHOLD;
  const weekThreshold = now - WEEK_THRESHOLD;
  const todaySessions = [];
  const yesterdaySessions = [];
  const weekSessions = [];
  const olderSessions = [];
  const archivedSessions = [];
  for (const session of sessions) {
    if (session.isArchived()) {
      archivedSessions.push(session);
    } else {
      const sessionTime = getAgentSessionTime(session.timing);
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
    ["archived", { section: "archived", label: AgentSessionSectionLabels[
      "archived"
      /* AgentSessionSection.Archived */
    ], sessions: archivedSessions }]
  ]);
}
__name(groupAgentSessionsByDate, "groupAgentSessionsByDate");
function sessionDateFromNow(sessionTime) {
  const now = Date.now();
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - DAY_THRESHOLD;
  const startOfTwoDaysAgo = startOfYesterday - DAY_THRESHOLD;
  if (sessionTime < startOfToday && sessionTime >= startOfYesterday) {
    return localize("date.fromNow.days.singular", "1 day");
  }
  if (sessionTime < startOfYesterday && sessionTime >= startOfTwoDaysAgo) {
    return localize("date.fromNow.days.multiple", "2 days");
  }
  return fromNow(sessionTime, false);
}
__name(sessionDateFromNow, "sessionDateFromNow");
class AgentSessionsIdentityProvider {
  static {
    __name(this, "AgentSessionsIdentityProvider");
  }
  getId(element) {
    if (isAgentSessionSection(element)) {
      return `section-${element.section}-${element.label}`;
    }
    if (isAgentSession(element)) {
      return element.resource.toString();
    }
    return "agent-sessions-id";
  }
  getGroupId(element) {
    if (isAgentSessionSection(element) || isAgentSessionsModel(element)) {
      return NotSelectableGroupId;
    }
    return 1;
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
    const timeA = getAgentSessionTime(sessionA.timing);
    const timeB = getAgentSessionTime(sessionB.timing);
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
  groupAgentSessionsByDate,
  sessionDateFromNow,
  toStatusLabel
};
//# sourceMappingURL=agentSessionsViewer.js.map
