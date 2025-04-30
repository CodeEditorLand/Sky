var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ButtonWithIcon } from "../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../../base/common/observable.js";
import { localize } from "../../../../../nls.js";
import { $ } from "./chatReferencesContentPart.js";
class ChatCollapsibleContentPart extends Disposable {
  static {
    __name(this, "ChatCollapsibleContentPart");
  }
  constructor(title, context) {
    super();
    this.title = title;
    this.context = context;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._isExpanded = observableValue(this, false);
    this.hasFollowingContent = this.context.contentIndex + 1 < this.context.content.length;
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
    this._domNode = $(".chat-used-context", void 0, buttonElement);
    collapseButton.label = referencesLabel;
    this._register(collapseButton.onDidClick(() => {
      const value = this._isExpanded.get();
      this._isExpanded.set(!value, void 0);
    }));
    this._register(autorun((r) => {
      const value = this._isExpanded.read(r);
      collapseButton.icon = value ? Codicon.chevronDown : Codicon.chevronRight;
      this._domNode?.classList.toggle("chat-used-context-collapsed", !value);
      this.updateAriaLabel(collapseButton.element, typeof referencesLabel === "string" ? referencesLabel : referencesLabel.value, this.isExpanded());
      if (this._domNode?.isConnected) {
        queueMicrotask(() => {
          this._onDidChangeHeight.fire();
        });
      }
    }));
    const content = this.initContent();
    this._domNode.appendChild(content);
    return this._domNode;
  }
  updateAriaLabel(element, label, expanded) {
    element.ariaLabel = expanded ? localize("usedReferencesExpanded", "{0}, expanded", label) : localize("usedReferencesCollapsed", "{0}, collapsed", label);
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
}
export {
  ChatCollapsibleContentPart
};
//# sourceMappingURL=chatCollapsibleContentPart.js.map
