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
import "./media/agentFeedbackEditorInput.css";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { addStandardDisposableListener, getWindow, ModifierKeyEmitter } from "../../../../base/browser/dom.js";
import { IAgentFeedbackService } from "./agentFeedbackService.js";
import { IChatEditingService } from "../../../../workbench/contrib/chat/common/editing/chatEditingService.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { getSessionForResource } from "./agentFeedbackEditorUtils.js";
import { localize } from "../../../../nls.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Action } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Emitter } from "../../../../base/common/event.js";
class AgentFeedbackInputWidget {
  static {
    __name(this, "AgentFeedbackInputWidget");
  }
  static {
    this._ID = "agentFeedback.inputWidget";
  }
  static {
    this._MIN_WIDTH = 150;
  }
  static {
    this._MAX_WIDTH = 400;
  }
  constructor(_editor) {
    this._editor = _editor;
    this.allowEditorOverflow = false;
    this._position = null;
    this._lineHeight = 0;
    this._onDidTriggerAdd = new Emitter();
    this.onDidTriggerAdd = this._onDidTriggerAdd.event;
    this._onDidTriggerAddAndSubmit = new Emitter();
    this.onDidTriggerAddAndSubmit = this._onDidTriggerAddAndSubmit.event;
    this._isShowingAlt = false;
    this._domNode = document.createElement("div");
    this._domNode.classList.add("agent-feedback-input-widget");
    this._domNode.style.display = "none";
    this._inputElement = document.createElement("textarea");
    this._inputElement.rows = 1;
    this._inputElement.placeholder = localize("agentFeedback.addFeedback", "Add Feedback");
    this._domNode.appendChild(this._inputElement);
    this._measureElement = document.createElement("span");
    this._measureElement.classList.add("agent-feedback-input-measure");
    this._domNode.appendChild(this._measureElement);
    const actionsContainer = document.createElement("div");
    actionsContainer.classList.add("agent-feedback-input-actions");
    this._domNode.appendChild(actionsContainer);
    this._addAction = new Action("agentFeedback.add", localize("agentFeedback.add", "Add Feedback (Enter)"), ThemeIcon.asClassName(Codicon.plus), false, () => {
      this._onDidTriggerAdd.fire();
      return Promise.resolve();
    });
    this._addAndSubmitAction = new Action("agentFeedback.addAndSubmit", localize("agentFeedback.addAndSubmit", "Add Feedback and Submit (Alt+Enter)"), ThemeIcon.asClassName(Codicon.send), false, () => {
      this._onDidTriggerAddAndSubmit.fire();
      return Promise.resolve();
    });
    this._actionBar = new ActionBar(actionsContainer);
    this._actionBar.push(this._addAction, { icon: true, label: false, keybinding: localize("enter", "Enter") });
    const modifierKeyEmitter = ModifierKeyEmitter.getInstance();
    modifierKeyEmitter.event((status) => {
      this._updateActionForAlt(status.altKey);
    });
    this._editor.applyFontInfo(this._inputElement);
    this._editor.applyFontInfo(this._measureElement);
    this._lineHeight = 22;
    this._inputElement.style.lineHeight = `${this._lineHeight}px`;
  }
  _updateActionForAlt(altKey) {
    if (altKey && !this._isShowingAlt) {
      this._isShowingAlt = true;
      this._actionBar.clear();
      this._actionBar.push(this._addAndSubmitAction, { icon: true, label: false, keybinding: localize("altEnter", "Alt+Enter") });
    } else if (!altKey && this._isShowingAlt) {
      this._isShowingAlt = false;
      this._actionBar.clear();
      this._actionBar.push(this._addAction, { icon: true, label: false, keybinding: localize("enter", "Enter") });
    }
  }
  getId() {
    return AgentFeedbackInputWidget._ID;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return this._position;
  }
  get inputElement() {
    return this._inputElement;
  }
  setPosition(position) {
    this._position = position;
    this._editor.layoutOverlayWidget(this);
  }
  show() {
    this._domNode.style.display = "";
  }
  hide() {
    this._domNode.style.display = "none";
  }
  clearInput() {
    this._inputElement.value = "";
    this._updateActionEnabled();
    this._autoSize();
  }
  autoSize() {
    this._autoSize();
  }
  updateActionEnabled() {
    this._updateActionEnabled();
  }
  _updateActionEnabled() {
    const hasText = this._inputElement.value.trim().length > 0;
    this._addAction.enabled = hasText;
    this._addAndSubmitAction.enabled = hasText;
  }
  _autoSize() {
    const text = this._inputElement.value || this._inputElement.placeholder;
    this._measureElement.textContent = text;
    const textWidth = this._measureElement.scrollWidth;
    const width = Math.max(AgentFeedbackInputWidget._MIN_WIDTH, Math.min(textWidth + 10, AgentFeedbackInputWidget._MAX_WIDTH));
    this._inputElement.style.width = `${width}px`;
    this._inputElement.style.height = "auto";
    const newHeight = Math.max(this._inputElement.scrollHeight, this._lineHeight);
    this._inputElement.style.height = `${newHeight}px`;
  }
  dispose() {
    this._actionBar.dispose();
    this._addAction.dispose();
    this._addAndSubmitAction.dispose();
    this._onDidTriggerAdd.dispose();
    this._onDidTriggerAddAndSubmit.dispose();
  }
}
let AgentFeedbackEditorInputContribution = class AgentFeedbackEditorInputContribution2 extends Disposable {
  static {
    __name(this, "AgentFeedbackEditorInputContribution");
  }
  static {
    this.ID = "agentFeedback.editorInputContribution";
  }
  constructor(_editor, _agentFeedbackService, _chatEditingService, _agentSessionsService) {
    super();
    this._editor = _editor;
    this._agentFeedbackService = _agentFeedbackService;
    this._chatEditingService = _chatEditingService;
    this._agentSessionsService = _agentSessionsService;
    this._visible = false;
    this._mouseDown = false;
    this._widgetListeners = this._store.add(new DisposableStore());
    this._store.add(this._editor.onDidChangeCursorSelection(() => this._onSelectionChanged()));
    this._store.add(this._editor.onDidChangeModel(() => this._onModelChanged()));
    this._store.add(this._editor.onDidScrollChange(() => {
      if (this._visible) {
        this._updatePosition();
      }
    }));
    this._store.add(this._editor.onMouseDown((e) => {
      if (this._isWidgetTarget(e.event.target)) {
        return;
      }
      this._mouseDown = true;
      this._hide();
    }));
    this._store.add(this._editor.onMouseUp((e) => {
      this._mouseDown = false;
      if (this._isWidgetTarget(e.event.target)) {
        return;
      }
      this._onSelectionChanged();
    }));
    this._store.add(this._editor.onDidBlurEditorWidget(() => {
      if (!this._visible) {
        return;
      }
      getWindow(this._editor.getDomNode()).setTimeout(() => {
        if (!this._visible) {
          return;
        }
        if (this._isWidgetTarget(getWindow(this._editor.getDomNode()).document.activeElement)) {
          return;
        }
        this._hide();
      }, 0);
    }));
    this._store.add(this._editor.onDidFocusEditorText(() => this._onSelectionChanged()));
  }
  _isWidgetTarget(target) {
    return !!this._widget && !!target && this._widget.getDomNode().contains(target);
  }
  _ensureWidget() {
    if (!this._widget) {
      this._widget = new AgentFeedbackInputWidget(this._editor);
      this._store.add(this._widget.onDidTriggerAdd(() => this._addFeedback()));
      this._store.add(this._widget.onDidTriggerAddAndSubmit(() => this._addFeedbackAndSubmit()));
      this._editor.addOverlayWidget(this._widget);
    }
    return this._widget;
  }
  _onModelChanged() {
    this._hide();
    this._sessionResource = void 0;
  }
  _onSelectionChanged() {
    if (this._mouseDown || !this._editor.hasTextFocus()) {
      return;
    }
    const selection = this._editor.getSelection();
    if (!selection || selection.isEmpty()) {
      this._hide();
      return;
    }
    const model = this._editor.getModel();
    if (!model) {
      this._hide();
      return;
    }
    const sessionResource = getSessionForResource(model.uri, this._chatEditingService, this._agentSessionsService);
    if (!sessionResource) {
      this._hide();
      return;
    }
    this._sessionResource = sessionResource;
    this._show();
  }
  _show() {
    const widget = this._ensureWidget();
    if (!this._visible) {
      this._visible = true;
      this._registerWidgetListeners(widget);
    }
    widget.clearInput();
    widget.show();
    this._updatePosition();
  }
  _hide() {
    if (!this._visible) {
      return;
    }
    this._visible = false;
    this._widgetListeners.clear();
    if (this._widget) {
      this._widget.hide();
      this._widget.setPosition(null);
      this._widget.clearInput();
    }
  }
  _registerWidgetListeners(widget) {
    this._widgetListeners.clear();
    const editorDomNode = this._editor.getDomNode();
    if (editorDomNode) {
      this._widgetListeners.add(addStandardDisposableListener(editorDomNode, "keydown", (e) => {
        if (!this._visible) {
          return;
        }
        if (!this._editor.hasTextFocus()) {
          return;
        }
        if (e.keyCode === 5 || e.keyCode === 4 || e.keyCode === 6 || e.keyCode === 57) {
          return;
        }
        if (e.ctrlKey || e.altKey || e.metaKey) {
          return;
        }
        if (e.keyCode === 9) {
          this._hide();
          this._editor.focus();
          return;
        }
        if (getWindow(widget.inputElement).document.activeElement !== widget.inputElement) {
          widget.inputElement.focus();
        }
      }));
    }
    this._widgetListeners.add(addStandardDisposableListener(widget.inputElement, "keydown", (e) => {
      if (e.keyCode === 9) {
        e.preventDefault();
        e.stopPropagation();
        this._hide();
        this._editor.focus();
        return;
      }
      if (e.keyCode === 3 && e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        this._addFeedbackAndSubmit();
        return;
      }
      if (e.keyCode === 3) {
        e.preventDefault();
        e.stopPropagation();
        this._addFeedback();
        return;
      }
    }));
    this._widgetListeners.add(addStandardDisposableListener(widget.inputElement, "keypress", (e) => {
      e.stopPropagation();
    }));
    this._widgetListeners.add(addStandardDisposableListener(widget.inputElement, "input", () => {
      widget.autoSize();
      widget.updateActionEnabled();
      this._updatePosition();
    }));
    this._widgetListeners.add(addStandardDisposableListener(widget.inputElement, "blur", () => {
      const win = getWindow(widget.inputElement);
      win.setTimeout(() => {
        if (!this._visible) {
          return;
        }
        if (this._editor.hasWidgetFocus()) {
          return;
        }
        this._hide();
      }, 0);
    }));
  }
  _addFeedback() {
    if (!this._widget) {
      return false;
    }
    const text = this._widget.inputElement.value.trim();
    if (!text) {
      return false;
    }
    const selection = this._editor.getSelection();
    const model = this._editor.getModel();
    if (!selection || !model || !this._sessionResource) {
      return false;
    }
    this._agentFeedbackService.addFeedback(this._sessionResource, model.uri, selection, text);
    this._hide();
    this._editor.focus();
    return true;
  }
  _addFeedbackAndSubmit() {
    if (!this._widget) {
      return;
    }
    const text = this._widget.inputElement.value.trim();
    if (!text) {
      return;
    }
    const selection = this._editor.getSelection();
    const model = this._editor.getModel();
    if (!selection || !model || !this._sessionResource) {
      return;
    }
    const sessionResource = this._sessionResource;
    this._hide();
    this._editor.focus();
    this._agentFeedbackService.addFeedbackAndSubmit(sessionResource, model.uri, selection, text);
  }
  _updatePosition() {
    if (!this._widget || !this._visible) {
      return;
    }
    const selection = this._editor.getSelection();
    if (!selection || selection.isEmpty()) {
      this._hide();
      return;
    }
    const cursorPosition = selection.getDirection() === 0 ? selection.getEndPosition() : selection.getStartPosition();
    const scrolledPosition = this._editor.getScrolledVisiblePosition(cursorPosition);
    if (!scrolledPosition) {
      this._widget.setPosition(null);
      return;
    }
    const lineHeight = this._editor.getOption(
      75
      /* EditorOption.lineHeight */
    );
    const layoutInfo = this._editor.getLayoutInfo();
    const widgetDom = this._widget.getDomNode();
    const widgetHeight = widgetDom.offsetHeight || 30;
    const widgetWidth = widgetDom.offsetWidth || 150;
    let top;
    if (selection.getDirection() === 0) {
      top = scrolledPosition.top + lineHeight;
      if (top + widgetHeight > layoutInfo.height) {
        top = scrolledPosition.top - widgetHeight;
      }
    } else {
      top = scrolledPosition.top - widgetHeight;
      if (top < 0) {
        top = scrolledPosition.top + lineHeight;
      }
    }
    top = Math.max(0, Math.min(top, layoutInfo.height - widgetHeight));
    const left = Math.max(0, Math.min(scrolledPosition.left, layoutInfo.width - widgetWidth));
    this._widget.setPosition({ preference: { top, left } });
  }
  dispose() {
    if (this._widget) {
      this._editor.removeOverlayWidget(this._widget);
      this._widget.dispose();
      this._widget = void 0;
    }
    super.dispose();
  }
};
AgentFeedbackEditorInputContribution = __decorate([
  __param(1, IAgentFeedbackService),
  __param(2, IChatEditingService),
  __param(3, IAgentSessionsService)
], AgentFeedbackEditorInputContribution);
registerEditorContribution(
  AgentFeedbackEditorInputContribution.ID,
  AgentFeedbackEditorInputContribution,
  3
  /* EditorContributionInstantiation.Eventually */
);
export {
  AgentFeedbackEditorInputContribution
};
//# sourceMappingURL=agentFeedbackEditorInputContribution.js.map
