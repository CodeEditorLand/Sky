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
var AgentFeedbackEditorWidget_1;
import "./media/agentFeedbackEditorWidget.css";
import { Action } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { Event } from "../../../../base/common/event.js";
import { autorun, observableSignalFromEvent } from "../../../../base/common/observable.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { $, addDisposableListener, clearNode, getTotalWidth } from "../../../../base/browser/dom.js";
import { Range } from "../../../../editor/common/core/range.js";
import { overviewRulerRangeHighlight } from "../../../../editor/common/core/editorColorRegistry.js";
import { OverviewRulerLane } from "../../../../editor/common/model.js";
import { themeColorFromId } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import * as nls from "../../../../nls.js";
import { IAgentFeedbackService } from "./agentFeedbackService.js";
import { IChatEditingService } from "../../../../workbench/contrib/chat/common/editing/chatEditingService.js";
import { isIChatSessionFileChange2 } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { getSessionForResource } from "./agentFeedbackEditorUtils.js";
import { ICodeReviewService } from "../../codeReview/browser/codeReviewService.js";
import { getSessionEditorComments, groupNearbySessionEditorComments, toSessionEditorCommentId } from "./sessionEditorComments.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { isEqual } from "../../../../base/common/resources.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
let AgentFeedbackEditorWidget = class AgentFeedbackEditorWidget2 extends Disposable {
  static {
    __name(this, "AgentFeedbackEditorWidget");
  }
  static {
    AgentFeedbackEditorWidget_1 = this;
  }
  static {
    this._idPool = 0;
  }
  constructor(_editor, _commentItems, _sessionResource, _agentFeedbackService, _codeReviewService, _markdownRendererService) {
    super();
    this._editor = _editor;
    this._commentItems = _commentItems;
    this._sessionResource = _sessionResource;
    this._agentFeedbackService = _agentFeedbackService;
    this._codeReviewService = _codeReviewService;
    this._markdownRendererService = _markdownRendererService;
    this._id = `agent-feedback-widget-${AgentFeedbackEditorWidget_1._idPool++}`;
    this._itemElements = /* @__PURE__ */ new Map();
    this._position = null;
    this._isExpanded = false;
    this._disposed = false;
    this._startLineNumber = 1;
    this._eventStore = this._register(new DisposableStore());
    this._rangeHighlightDecoration = this._editor.createDecorationsCollection();
    this._domNode = $("div.agent-feedback-widget");
    this._domNode.classList.add("collapsed");
    this._headerNode = $("div.agent-feedback-widget-header");
    this._titleNode = $("span.agent-feedback-widget-title");
    this._updateTitle();
    this._headerNode.appendChild(this._titleNode);
    this._headerNode.appendChild($("span.agent-feedback-widget-spacer"));
    this._toggleButton = $("div.agent-feedback-widget-toggle");
    this._updateToggleButton();
    this._headerNode.appendChild(this._toggleButton);
    this._domNode.appendChild(this._headerNode);
    this._bodyNode = $("div.agent-feedback-widget-body");
    this._bodyNode.classList.add("collapsed");
    this._buildFeedbackItems();
    this._domNode.appendChild(this._bodyNode);
    const arrow = $("div.agent-feedback-widget-arrow");
    this._domNode.appendChild(arrow);
    this._setupEventHandlers();
    this._domNode.classList.add("visible");
    this._editor.addOverlayWidget(this);
  }
  _setupEventHandlers() {
    this._eventStore.add(addDisposableListener(this._toggleButton, "click", (e) => {
      e.stopPropagation();
      this._toggleExpanded();
    }));
    this._eventStore.add(addDisposableListener(this._headerNode, "click", () => {
      this._toggleExpanded();
    }));
  }
  _toggleExpanded() {
    if (this._isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  _updateTitle() {
    const count = this._commentItems.length;
    if (count === 1) {
      this._titleNode.textContent = nls.localize("oneComment", "1 comment");
    } else {
      this._titleNode.textContent = nls.localize("nComments", "{0} comments", count);
    }
  }
  _updateToggleButton() {
    clearNode(this._toggleButton);
    if (this._isExpanded) {
      this._toggleButton.appendChild(renderIcon(Codicon.chevronUp));
      this._toggleButton.title = nls.localize("collapse", "Collapse");
    } else {
      this._toggleButton.appendChild(renderIcon(Codicon.chevronDown));
      this._toggleButton.title = nls.localize("expand", "Expand");
    }
  }
  _buildFeedbackItems() {
    clearNode(this._bodyNode);
    this._itemElements.clear();
    for (const comment of this._commentItems) {
      const item = $("div.agent-feedback-widget-item");
      item.classList.add(`agent-feedback-widget-item-${comment.source}`);
      if (comment.suggestion) {
        item.classList.add("agent-feedback-widget-item-suggestion");
      }
      this._itemElements.set(comment.id, item);
      const itemHeader = $("div.agent-feedback-widget-item-header");
      const itemMeta = $("div.agent-feedback-widget-item-meta");
      const lineInfo = $("span.agent-feedback-widget-line-info");
      if (comment.range.startLineNumber === comment.range.endLineNumber) {
        lineInfo.textContent = nls.localize("lineNumber", "Line {0}", comment.range.startLineNumber);
      } else {
        lineInfo.textContent = nls.localize("lineRange", "Lines {0}-{1}", comment.range.startLineNumber, comment.range.endLineNumber);
      }
      itemMeta.appendChild(lineInfo);
      if (comment.source !== "agentFeedback") {
        const typeBadge = $("span.agent-feedback-widget-item-type");
        typeBadge.textContent = this._getTypeLabel(comment);
        itemMeta.appendChild(typeBadge);
      }
      itemHeader.appendChild(itemMeta);
      const actionBarContainer = $("div.agent-feedback-widget-item-actions");
      const actionBar = this._eventStore.add(new ActionBar(actionBarContainer));
      if (comment.canConvertToAgentFeedback) {
        actionBar.push(new Action("agentFeedback.widget.convert", nls.localize("convertComment", "Convert to Agent Feedback"), ThemeIcon.asClassName(Codicon.check), true, () => this._convertToAgentFeedback(comment)), { icon: true, label: false });
      }
      actionBar.push(new Action("agentFeedback.widget.remove", nls.localize("removeComment", "Remove"), ThemeIcon.asClassName(Codicon.close), true, () => this._removeComment(comment)), { icon: true, label: false });
      itemHeader.appendChild(actionBarContainer);
      item.appendChild(itemHeader);
      const text = $("div.agent-feedback-widget-text");
      const rendered = this._markdownRendererService.render(new MarkdownString(comment.text));
      this._eventStore.add(rendered);
      text.appendChild(rendered.element);
      item.appendChild(text);
      if (comment.suggestion?.edits.length) {
        item.appendChild(this._renderSuggestion(comment));
      }
      this._eventStore.add(addDisposableListener(item, "mouseenter", () => {
        this._highlightRange(comment);
      }));
      this._eventStore.add(addDisposableListener(item, "mouseleave", () => {
        this._rangeHighlightDecoration.clear();
      }));
      this._eventStore.add(addDisposableListener(item, "click", (e) => {
        if (e.target?.closest(".action-bar")) {
          return;
        }
        this.focusFeedback(comment.id);
        this._agentFeedbackService.setNavigationAnchor(this._sessionResource, comment.id);
        this._revealComment(comment);
      }));
      this._bodyNode.appendChild(item);
    }
  }
  _getTypeLabel(comment) {
    if (comment.source === "prReview") {
      return nls.localize("prReviewComment", "PR Review");
    }
    if (comment.source === "codeReview") {
      return comment.suggestion ? nls.localize("reviewSuggestion", "Review Suggestion") : nls.localize("reviewComment", "Review");
    }
    return comment.suggestion ? nls.localize("feedbackSuggestion", "Feedback Suggestion") : nls.localize("feedbackComment", "Feedback");
  }
  _renderSuggestion(comment) {
    const suggestionNode = $("div.agent-feedback-widget-suggestion");
    const title = $("div.agent-feedback-widget-suggestion-title");
    title.textContent = nls.localize("suggestedChange", "Suggested Change");
    suggestionNode.appendChild(title);
    for (const edit of comment.suggestion?.edits ?? []) {
      const editNode = $("div.agent-feedback-widget-suggestion-edit");
      const rangeLabel = $("div.agent-feedback-widget-suggestion-range");
      if (edit.range.startLineNumber === edit.range.endLineNumber) {
        rangeLabel.textContent = nls.localize("suggestionLineNumber", "Line {0}", edit.range.startLineNumber);
      } else {
        rangeLabel.textContent = nls.localize("suggestionLineRange", "Lines {0}-{1}", edit.range.startLineNumber, edit.range.endLineNumber);
      }
      editNode.appendChild(rangeLabel);
      const newText = $("pre.agent-feedback-widget-suggestion-text");
      newText.textContent = edit.newText;
      editNode.appendChild(newText);
      suggestionNode.appendChild(editNode);
    }
    return suggestionNode;
  }
  _removeComment(comment) {
    if (comment.source === "prReview") {
      this._codeReviewService.resolvePRReviewThread(this._sessionResource, comment.sourceId);
      return;
    }
    if (comment.source === "codeReview") {
      this._codeReviewService.removeComment(this._sessionResource, comment.sourceId);
      return;
    }
    this._agentFeedbackService.removeFeedback(this._sessionResource, comment.sourceId);
  }
  _convertToAgentFeedback(comment) {
    if (!comment.canConvertToAgentFeedback) {
      return;
    }
    const feedback = this._agentFeedbackService.addFeedback(this._sessionResource, comment.resourceUri, comment.range, comment.text, comment.suggestion);
    this._agentFeedbackService.setNavigationAnchor(this._sessionResource, toSessionEditorCommentId("agentFeedback", feedback.id));
    if (comment.source === "codeReview") {
      this._codeReviewService.removeComment(this._sessionResource, comment.sourceId);
    }
  }
  /**
   * Expand the widget body.
   */
  expand() {
    this._isExpanded = true;
    this._domNode.classList.remove("collapsed");
    this._bodyNode.classList.remove("collapsed");
    this._updateToggleButton();
    this._editor.layoutOverlayWidget(this);
  }
  /**
   * Collapse the widget body.
   */
  collapse() {
    this._isExpanded = false;
    this._domNode.classList.add("collapsed");
    this._bodyNode.classList.add("collapsed");
    this._updateToggleButton();
    this.clearFocus();
    this._editor.layoutOverlayWidget(this);
  }
  /**
   * Focus a specific feedback item within this widget.
   * Highlights its range in the editor and marks it as focused.
   */
  focusFeedback(feedbackId) {
    for (const el of this._itemElements.values()) {
      el.classList.remove("focused");
    }
    const feedback = this._commentItems.find((f) => f.id === feedbackId);
    if (!feedback) {
      return;
    }
    const itemEl = this._itemElements.get(feedbackId);
    itemEl?.classList.add("focused");
    this._highlightRange(feedback);
  }
  /**
   * Clear focus state and range highlighting.
   */
  clearFocus() {
    for (const el of this._itemElements.values()) {
      el.classList.remove("focused");
    }
    this._rangeHighlightDecoration.clear();
  }
  _highlightRange(feedback) {
    const endLineNumber = feedback.range.endLineNumber;
    const range = new Range(feedback.range.startLineNumber, 1, endLineNumber, this._editor.getModel()?.getLineMaxColumn(endLineNumber) ?? 1);
    this._rangeHighlightDecoration.set([
      {
        range,
        options: {
          description: "agent-feedback-range-highlight",
          className: "rangeHighlight",
          isWholeLine: true,
          linesDecorationsClassName: "agent-feedback-widget-range-glyph"
        }
      },
      {
        range,
        options: {
          description: "agent-feedback-range-highlight-overview",
          overviewRuler: {
            color: themeColorFromId(overviewRulerRangeHighlight),
            position: OverviewRulerLane.Full
          }
        }
      }
    ]);
  }
  /**
   * Returns true if this widget contains the given feedback item (by id).
   */
  containsFeedback(feedbackId) {
    return this._commentItems.some((f) => f.id === feedbackId);
  }
  /**
   * Updates the widget position and layout.
   */
  layout(startLineNumber) {
    if (this._disposed) {
      return;
    }
    this._startLineNumber = startLineNumber;
    const lineHeight = this._editor.getOption(
      75
      /* EditorOption.lineHeight */
    );
    const { contentLeft, contentWidth, verticalScrollbarWidth } = this._editor.getLayoutInfo();
    const scrollTop = this._editor.getScrollTop();
    const widgetWidth = getTotalWidth(this._domNode) || 280;
    const widgetHeight = this._domNode.offsetHeight || 0;
    const contentRelativeTop = this._editor.getTopForLineNumber(startLineNumber) - lineHeight;
    const scrollHeight = this._editor.getScrollHeight();
    const clampedContentTop = Math.min(Math.max(0, contentRelativeTop), Math.max(0, scrollHeight - widgetHeight));
    this._position = {
      stackOrdinal: 2,
      preference: {
        top: clampedContentTop - scrollTop,
        left: contentLeft + contentWidth - (2 * verticalScrollbarWidth + widgetWidth)
      }
    };
    this._editor.layoutOverlayWidget(this);
  }
  /**
   * Shows or hides the widget.
   */
  toggle(show) {
    this._domNode.classList.toggle("visible", show);
    if (show && this._commentItems.length > 0) {
      this.layout(this._commentItems[0].range.startLineNumber);
    }
  }
  /**
   * Relayouts the widget at its current line number.
   */
  relayout() {
    if (this._startLineNumber) {
      this.layout(this._startLineNumber);
    }
  }
  // IOverlayWidget implementation
  getId() {
    return this._id;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return this._position;
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._rangeHighlightDecoration.clear();
    this._editor.removeOverlayWidget(this);
    super.dispose();
  }
  _revealComment(comment) {
    const range = new Range(comment.range.startLineNumber, 1, comment.range.endLineNumber, this._editor.getModel()?.getLineMaxColumn(comment.range.endLineNumber) ?? 1);
    this._editor.revealRangeInCenterIfOutsideViewport(
      range,
      0
      /* ScrollType.Smooth */
    );
  }
};
AgentFeedbackEditorWidget = AgentFeedbackEditorWidget_1 = __decorate([
  __param(3, IAgentFeedbackService),
  __param(4, ICodeReviewService),
  __param(5, IMarkdownRendererService)
], AgentFeedbackEditorWidget);
let AgentFeedbackEditorWidgetContribution = class AgentFeedbackEditorWidgetContribution2 extends Disposable {
  static {
    __name(this, "AgentFeedbackEditorWidgetContribution");
  }
  static {
    this.ID = "agentFeedback.editorWidgetContribution";
  }
  constructor(_editor, _agentFeedbackService, _chatEditingService, _agentSessionsService, _codeReviewService, _instantiationService) {
    super();
    this._editor = _editor;
    this._agentFeedbackService = _agentFeedbackService;
    this._chatEditingService = _chatEditingService;
    this._agentSessionsService = _agentSessionsService;
    this._codeReviewService = _codeReviewService;
    this._instantiationService = _instantiationService;
    this._widgets = [];
    this._store.add(this._agentFeedbackService.onDidChangeNavigation((sessionResource) => {
      if (this._sessionResource && sessionResource.toString() === this._sessionResource.toString()) {
        this._handleNavigation();
      }
    }));
    const rebuildSignal = observableSignalFromEvent(this, Event.any(this._agentFeedbackService.onDidChangeFeedback, this._editor.onDidChangeModel));
    this._store.add(Event.any(this._editor.onDidScrollChange, this._editor.onDidLayoutChange)(() => {
      for (const widget of this._widgets) {
        widget.relayout();
      }
    }));
    this._store.add(autorun((reader) => {
      rebuildSignal.read(reader);
      this._resolveSession();
      if (!this._sessionResource) {
        this._clearWidgets();
        return;
      }
      this._rebuildWidgets(this._codeReviewService.getReviewState(this._sessionResource).read(reader), this._codeReviewService.getPRReviewState(this._sessionResource).read(reader));
      this._handleNavigation();
    }));
  }
  _resolveSession() {
    const model = this._editor.getModel();
    if (!model) {
      this._sessionResource = void 0;
      return;
    }
    this._sessionResource = getSessionForResource(model.uri, this._chatEditingService, this._agentSessionsService);
  }
  _rebuildWidgets(reviewState = this._sessionResource ? this._codeReviewService.getReviewState(this._sessionResource).get() : void 0, prReviewState = this._sessionResource ? this._codeReviewService.getPRReviewState(this._sessionResource).get() : void 0) {
    this._clearWidgets();
    if (!this._sessionResource || !reviewState) {
      return;
    }
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const comments = getSessionEditorComments(this._sessionResource, this._agentFeedbackService.getFeedback(this._sessionResource), reviewState, prReviewState);
    const fileComments = this._getCommentsForModel(model.uri, comments);
    if (fileComments.length === 0) {
      return;
    }
    const groups = groupNearbySessionEditorComments(fileComments, 5);
    for (const group of groups) {
      const widget = this._instantiationService.createInstance(AgentFeedbackEditorWidget, this._editor, group, this._sessionResource);
      this._widgets.push(widget);
      widget.layout(group[0].range.startLineNumber);
    }
  }
  _getCommentsForModel(resourceUri, comments) {
    const change = this._getSessionChangeForResource(resourceUri);
    if (!change) {
      return comments.filter((comment) => isEqual(comment.resourceUri, resourceUri));
    }
    if (!this._isCurrentOrModifiedResource(change, resourceUri)) {
      return [];
    }
    return comments.filter((comment) => comment.resourceUri.fsPath === resourceUri.fsPath);
  }
  _getSessionChangeForResource(resourceUri) {
    if (!this._sessionResource) {
      return void 0;
    }
    const changes = this._agentSessionsService.getSession(this._sessionResource)?.changes;
    if (!(changes instanceof Array)) {
      return void 0;
    }
    return changes.find((change) => this._changeMatchesFsPath(change, resourceUri));
  }
  _changeMatchesFsPath(change, resourceUri) {
    if (isIChatSessionFileChange2(change)) {
      return change.uri.fsPath === resourceUri.fsPath || change.modifiedUri?.fsPath === resourceUri.fsPath || change.originalUri?.fsPath === resourceUri.fsPath;
    }
    return change.modifiedUri.fsPath === resourceUri.fsPath || change.originalUri?.fsPath === resourceUri.fsPath;
  }
  _isCurrentOrModifiedResource(change, resourceUri) {
    if (isIChatSessionFileChange2(change)) {
      return isEqual(change.uri, resourceUri) || (change.modifiedUri ? isEqual(change.modifiedUri, resourceUri) : false);
    }
    return isEqual(change.modifiedUri, resourceUri);
  }
  _handleNavigation() {
    if (!this._sessionResource) {
      return;
    }
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const comments = getSessionEditorComments(this._sessionResource, this._agentFeedbackService.getFeedback(this._sessionResource), this._codeReviewService.getReviewState(this._sessionResource).get(), this._codeReviewService.getPRReviewState(this._sessionResource).get());
    const bearing = this._agentFeedbackService.getNavigationBearing(this._sessionResource, comments);
    if (bearing.activeIdx < 0) {
      return;
    }
    const activeFeedback = comments[bearing.activeIdx];
    if (!activeFeedback) {
      return;
    }
    if (this._getCommentsForModel(model.uri, [activeFeedback]).length === 0) {
      for (const widget of this._widgets) {
        widget.collapse();
      }
      return;
    }
    for (const widget of this._widgets) {
      if (widget.containsFeedback(activeFeedback.id)) {
        widget.expand();
        widget.focusFeedback(activeFeedback.id);
      } else {
        widget.collapse();
      }
    }
    const range = new Range(activeFeedback.range.startLineNumber, 1, activeFeedback.range.endLineNumber, 1);
    this._editor.revealRangeInCenterIfOutsideViewport(
      range,
      0
      /* ScrollType.Smooth */
    );
  }
  _clearWidgets() {
    for (const widget of this._widgets) {
      widget.dispose();
    }
    this._widgets.length = 0;
  }
  dispose() {
    this._clearWidgets();
    super.dispose();
  }
};
AgentFeedbackEditorWidgetContribution = __decorate([
  __param(1, IAgentFeedbackService),
  __param(2, IChatEditingService),
  __param(3, IAgentSessionsService),
  __param(4, ICodeReviewService),
  __param(5, IInstantiationService)
], AgentFeedbackEditorWidgetContribution);
registerEditorContribution(
  AgentFeedbackEditorWidgetContribution.ID,
  AgentFeedbackEditorWidgetContribution,
  3
  /* EditorContributionInstantiation.Eventually */
);
export {
  AgentFeedbackEditorWidget
};
//# sourceMappingURL=agentFeedbackEditorWidgetContribution.js.map
