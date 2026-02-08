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
import { $ } from "../../../../../../base/browser/dom.js";
import { ButtonWithIcon } from "../../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../../../base/common/observable.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { renderFileWidgets } from "./chatInlineAnchorWidget.js";
let ChatCollapsibleContentPart = class ChatCollapsibleContentPart2 extends Disposable {
  static {
    __name(this, "ChatCollapsibleContentPart");
  }
  get icon() {
    return this._overrideIcon.get();
  }
  set icon(value) {
    this._overrideIcon.set(value, void 0);
  }
  constructor(title, context, hoverMessage, hoverService) {
    super();
    this.title = title;
    this.hoverMessage = hoverMessage;
    this.hoverService = hoverService;
    this._renderedTitleWithWidgets = this._register(new MutableDisposable());
    this._isExpanded = observableValue(this, false);
    this._overrideIcon = observableValue(this, void 0);
    this._contentInitialized = false;
    this.element = context.element;
    this.hasFollowingContent = context.contentIndex + 1 < context.content.length;
  }
  get domNode() {
    this._domNode ??= this.init();
    return this._domNode;
  }
  init() {
    const referencesLabel = this.title;
    const buttonElement = $(".chat-used-context-label", void 0);
    const collapseButton = this._register(new ButtonWithIcon(buttonElement, {
      buttonBackground: void 0,
      buttonBorder: void 0,
      buttonForeground: void 0,
      buttonHoverBackground: void 0,
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0
    }));
    this._collapseButton = collapseButton;
    this._domNode = $(".chat-used-context", void 0, buttonElement);
    collapseButton.label = referencesLabel;
    if (this.hoverMessage) {
      this._register(this.hoverService.setupDelayedHover(collapseButton.iconElement, {
        content: this.hoverMessage,
        style: 1
      }));
    }
    this._register(collapseButton.onDidClick(() => {
      const value = this._isExpanded.get();
      this._isExpanded.set(!value, void 0);
    }));
    this._isExpanded.set(this.isExpanded(), void 0);
    this._register(autorun((r) => {
      const expanded = this._isExpanded.read(r);
      collapseButton.icon = this._overrideIcon.read(r) ?? (expanded ? Codicon.chevronDown : Codicon.chevronRight);
      this._domNode?.classList.toggle("chat-used-context-collapsed", !expanded);
      this.updateAriaLabel(collapseButton.element, typeof referencesLabel === "string" ? referencesLabel : referencesLabel.value, expanded);
      if ((expanded || this.shouldInitEarly()) && !this._contentInitialized) {
        this._contentInitialized = true;
        this._contentElement = this.initContent();
        this._domNode?.appendChild(this._contentElement);
      }
    }));
    return this._domNode;
  }
  shouldInitEarly() {
    return false;
  }
  updateAriaLabel(element, label, expanded) {
    element.ariaLabel = label;
    element.ariaExpanded = String(expanded);
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
  get expanded() {
    return this._isExpanded;
  }
  isExpanded() {
    return this._isExpanded.get();
  }
  setExpanded(value) {
    this._isExpanded.set(value, void 0);
  }
  setTitle(title) {
    this.title = title;
    if (this._collapseButton) {
      this._collapseButton.label = title;
      this.updateAriaLabel(this._collapseButton.element, title, this.isExpanded());
    }
  }
  // Render collapsible dropdown title with widgets
  setTitleWithWidgets(content, instantiationService, chatMarkdownAnchorService, chatContentMarkdownRenderer) {
    if (this._store.isDisposed || !this._collapseButton) {
      return;
    }
    const result = chatContentMarkdownRenderer.render(content);
    result.element.classList.add("collapsible-title-content");
    renderFileWidgets(result.element, instantiationService, chatMarkdownAnchorService, this._store);
    const labelElement = this._collapseButton.labelElement;
    labelElement.textContent = "";
    labelElement.appendChild(result.element);
    const textContent = result.element.textContent || "";
    this.updateAriaLabel(this._collapseButton.element, textContent, this.isExpanded());
    this._renderedTitleWithWidgets.value = result;
  }
};
ChatCollapsibleContentPart = __decorate([
  __param(3, IHoverService)
], ChatCollapsibleContentPart);
export {
  ChatCollapsibleContentPart
};
//# sourceMappingURL=chatCollapsibleContentPart.js.map
