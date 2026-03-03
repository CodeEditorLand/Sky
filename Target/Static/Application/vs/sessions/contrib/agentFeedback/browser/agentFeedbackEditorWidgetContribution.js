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
import "./media/agentFeedbackEditorWidget.css";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { Event } from "../../../../base/common/event.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { $, addDisposableListener, clearNode, getTotalWidth } from "../../../../base/browser/dom.js";
import { Range } from "../../../../editor/common/core/range.js";
import { overviewRulerRangeHighlight } from "../../../../editor/common/core/editorColorRegistry.js";
import { OverviewRulerLane } from "../../../../editor/common/model.js";
import { themeColorFromId } from "../../../../platform/theme/common/themeService.js";
import * as nls from "../../../../nls.js";
import { IAgentFeedbackService } from "./agentFeedbackService.js";
import { IChatEditingService } from "../../../../workbench/contrib/chat/common/editing/chatEditingService.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { getSessionForResource } from "./agentFeedbackEditorUtils.js";
function groupNearbyFeedback(items, lineThreshold = 5) {
  if (items.length === 0) {
    return [];
  }
  const sorted = [...items].sort((a, b) => a.range.startLineNumber - b.range.startLineNumber);
  const groups = [];
  let currentGroup = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const firstItem = currentGroup[0];
    const currentItem = sorted[i];
    const verticalSpan = currentItem.range.startLineNumber - firstItem.range.startLineNumber;
    if (verticalSpan <= lineThreshold) {
      currentGroup.push(currentItem);
    } else {
      groups.push(currentGroup);
      currentGroup = [currentItem];
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  return groups;
}
__name(groupNearbyFeedback, "groupNearbyFeedback");
class AgentFeedbackEditorWidget extends Disposable {
  static {
    __name(this, "AgentFeedbackEditorWidget");
  }
  static {
    this._idPool = 0;
  }
  constructor(_editor, _feedbackItems, _agentFeedbackService, _sessionResource) {
    super();
    this._editor = _editor;
    this._feedbackItems = _feedbackItems;
    this._agentFeedbackService = _agentFeedbackService;
    this._sessionResource = _sessionResource;
    this._id = `agent-feedback-widget-${AgentFeedbackEditorWidget._idPool++}`;
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
    this._dismissButton = $("div.agent-feedback-widget-dismiss");
    this._dismissButton.appendChild(renderIcon(Codicon.close));
    this._dismissButton.title = nls.localize("dismiss", "Dismiss");
    this._headerNode.appendChild(this._dismissButton);
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
    this._eventStore.add(addDisposableListener(this._dismissButton, "click", (e) => {
      e.stopPropagation();
      this._dismiss();
    }));
  }
  _toggleExpanded() {
    if (this._isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  _dismiss() {
    for (const feedback of this._feedbackItems) {
      this._agentFeedbackService.removeFeedback(this._sessionResource, feedback.id);
    }
    this._domNode.classList.add("fadeOut");
    const dispose = /* @__PURE__ */ __name(() => {
      this.dispose();
    }, "dispose");
    const handle = setTimeout(dispose, 150);
    this._domNode.addEventListener("animationend", () => {
      clearTimeout(handle);
      dispose();
    }, { once: true });
  }
  _updateTitle() {
    const count = this._feedbackItems.length;
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
    for (const feedback of this._feedbackItems) {
      const item = $("div.agent-feedback-widget-item");
      this._itemElements.set(feedback.id, item);
      const lineInfo = $("span.agent-feedback-widget-line-info");
      if (feedback.range.startLineNumber === feedback.range.endLineNumber) {
        lineInfo.textContent = nls.localize("lineNumber", "Line {0}", feedback.range.startLineNumber);
      } else {
        lineInfo.textContent = nls.localize("lineRange", "Lines {0}-{1}", feedback.range.startLineNumber, feedback.range.endLineNumber);
      }
      item.appendChild(lineInfo);
      const text = $("span.agent-feedback-widget-text");
      text.textContent = feedback.text;
      item.appendChild(text);
      this._eventStore.add(addDisposableListener(item, "mouseenter", () => {
        this._highlightRange(feedback);
      }));
      this._eventStore.add(addDisposableListener(item, "mouseleave", () => {
        this._rangeHighlightDecoration.clear();
      }));
      this._bodyNode.appendChild(item);
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
    const feedback = this._feedbackItems.find((f) => f.id === feedbackId);
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
    return this._feedbackItems.some((f) => f.id === feedbackId);
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
    if (show && this._feedbackItems.length > 0) {
      this.layout(this._feedbackItems[0].range.startLineNumber);
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
}
let AgentFeedbackEditorWidgetContribution = class AgentFeedbackEditorWidgetContribution2 extends Disposable {
  static {
    __name(this, "AgentFeedbackEditorWidgetContribution");
  }
  static {
    this.ID = "agentFeedback.editorWidgetContribution";
  }
  constructor(_editor, _agentFeedbackService, _chatEditingService, _agentSessionsService) {
    super();
    this._editor = _editor;
    this._agentFeedbackService = _agentFeedbackService;
    this._chatEditingService = _chatEditingService;
    this._agentSessionsService = _agentSessionsService;
    this._widgets = [];
    this._store.add(this._agentFeedbackService.onDidChangeFeedback((e) => {
      if (this._sessionResource && e.sessionResource.toString() === this._sessionResource.toString()) {
        this._rebuildWidgets();
      }
    }));
    this._store.add(this._agentFeedbackService.onDidChangeNavigation((sessionResource) => {
      if (this._sessionResource && sessionResource.toString() === this._sessionResource.toString()) {
        this._handleNavigation();
      }
    }));
    this._store.add(this._editor.onDidChangeModel(() => {
      this._resolveSession();
      this._rebuildWidgets();
    }));
    this._store.add(Event.any(this._editor.onDidScrollChange, this._editor.onDidLayoutChange)(() => {
      for (const widget of this._widgets) {
        widget.relayout();
      }
    }));
    this._resolveSession();
    this._rebuildWidgets();
  }
  _resolveSession() {
    const model = this._editor.getModel();
    if (!model) {
      this._sessionResource = void 0;
      return;
    }
    this._sessionResource = getSessionForResource(model.uri, this._chatEditingService, this._agentSessionsService);
  }
  _rebuildWidgets() {
    this._clearWidgets();
    if (!this._sessionResource) {
      return;
    }
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const allFeedback = this._agentFeedbackService.getFeedback(this._sessionResource);
    const fileFeedback = allFeedback.filter((f) => f.resourceUri.toString() === model.uri.toString());
    if (fileFeedback.length === 0) {
      return;
    }
    const groups = groupNearbyFeedback(fileFeedback, 5);
    for (const group of groups) {
      const widget = new AgentFeedbackEditorWidget(this._editor, group, this._agentFeedbackService, this._sessionResource);
      this._widgets.push(widget);
      widget.layout(group[0].range.startLineNumber);
    }
  }
  _handleNavigation() {
    if (!this._sessionResource) {
      return;
    }
    const bearing = this._agentFeedbackService.getNavigationBearing(this._sessionResource);
    if (bearing.activeIdx < 0) {
      return;
    }
    const allFeedback = this._agentFeedbackService.getFeedback(this._sessionResource);
    const activeFeedback = allFeedback[bearing.activeIdx];
    if (!activeFeedback) {
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
  __param(3, IAgentSessionsService)
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
