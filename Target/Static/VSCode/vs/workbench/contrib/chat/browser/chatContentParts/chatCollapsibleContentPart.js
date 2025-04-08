var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { ButtonWithIcon } from "../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { IMarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, IDisposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IChatRendererContent } from "../../common/chatViewModel.js";
import { ChatTreeItem, IChatCodeBlockInfo } from "../chat.js";
import { IChatContentPart, IChatContentPartRenderContext } from "./chatContentParts.js";
import { $ } from "./chatReferencesContentPart.js";
import { EditorPool } from "./chatMarkdownContentPart.js";
import { CodeBlockPart, ICodeBlockData, ICodeBlockRenderOptions } from "../codeBlockPart.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { IDisposableReference } from "./chatCollections.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { autorun, IObservable, observableValue } from "../../../../../base/common/observable.js";
class ChatCollapsibleContentPart extends Disposable {
  constructor(title, context) {
    super();
    this.title = title;
    this.context = context;
    this.hasFollowingContent = this.context.contentIndex + 1 < this.context.content.length;
  }
  static {
    __name(this, "ChatCollapsibleContentPart");
  }
  _domNode;
  _onDidChangeHeight = this._register(new Emitter());
  onDidChangeHeight = this._onDidChangeHeight.event;
  hasFollowingContent;
  _isExpanded = observableValue(this, false);
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
let ChatCollapsibleEditorContentPart = class extends ChatCollapsibleContentPart {
  constructor(title, context, editorPool, textModel, languageId, options = {}, codeBlockInfo, contextKeyService) {
    super(title, context);
    this.editorPool = editorPool;
    this.textModel = textModel;
    this.languageId = languageId;
    this.options = options;
    this.codeBlockInfo = codeBlockInfo;
    this.contextKeyService = contextKeyService;
    this._contentDomNode = $("div.chat-collapsible-editor-content");
    this._editorReference = this.editorPool.get();
    this.codeblocks = [{
      ...codeBlockInfo,
      focus: /* @__PURE__ */ __name(() => {
        this._editorReference.object.focus();
        codeBlockInfo.focus();
      }, "focus")
    }];
  }
  static {
    __name(this, "ChatCollapsibleEditorContentPart");
  }
  _editorReference;
  _contentDomNode;
  _currentWidth = 0;
  codeblocks = [];
  dispose() {
    this._editorReference?.dispose();
    super.dispose();
  }
  initContent() {
    const data = {
      languageId: this.languageId,
      textModel: this.textModel,
      codeBlockIndex: this.codeBlockInfo.codeBlockIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      parentContextKeyService: this.contextKeyService,
      renderOptions: this.options
    };
    this._editorReference.object.render(data, this._currentWidth || 300);
    this._register(this._editorReference.object.onDidChangeContentHeight(() => this._onDidChangeHeight.fire()));
    this._contentDomNode.appendChild(this._editorReference.object.element);
    this._register(autorun((r) => {
      const value = this._isExpanded.read(r);
      this._contentDomNode.style.display = value ? "block" : "none";
    }));
    return this._contentDomNode;
  }
  hasSameContent(other, followingContent, element) {
    return false;
  }
  layout(width) {
    this._currentWidth = width;
    this._editorReference.object.layout(width);
  }
};
ChatCollapsibleEditorContentPart = __decorateClass([
  __decorateParam(7, IContextKeyService)
], ChatCollapsibleEditorContentPart);
export {
  ChatCollapsibleContentPart,
  ChatCollapsibleEditorContentPart
};
//# sourceMappingURL=chatCollapsibleContentPart.js.map
