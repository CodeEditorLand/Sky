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
import * as dom from "../../../../../base/browser/dom.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { localize } from "../../../../../nls.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { getAttachableImageExtension } from "../chatAttachmentResolve.js";
import { ChatAttachmentsContentPart } from "./chatAttachmentsContentPart.js";
import { ChatQueryTitlePart } from "./chatConfirmationWidget.js";
let ChatCollapsibleInputOutputContentPart = class ChatCollapsibleInputOutputContentPart2 extends Disposable {
  static {
    __name(this, "ChatCollapsibleInputOutputContentPart");
  }
  set title(s) {
    this._titlePart.title = s;
  }
  get title() {
    return this._titlePart.title;
  }
  get expanded() {
    return this._expanded.get();
  }
  constructor(title, subtitle, context, editorPool, input, output, isError, initiallyExpanded, contextKeyService, _instantiationService) {
    super();
    this.context = context;
    this.editorPool = editorPool;
    this.input = input;
    this.output = output;
    this.contextKeyService = contextKeyService;
    this._instantiationService = _instantiationService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._currentWidth = 0;
    this._editorReferences = [];
    this.codeblocks = [];
    const elements = dom.h(".chat-confirmation-widget@root", [
      dom.h(".chat-confirmation-widget-title.expandable@titleContainer", [
        dom.h(".chat-confirmation-widget-expando@expando"),
        dom.h(".chat-confirmation-widget-title-inner@title"),
        dom.h(".chat-confirmation-widget-title-icon@icon")
      ]),
      dom.h(".chat-confirmation-widget-message@message")
    ]);
    this.domNode = elements.root;
    const titlePart = this._titlePart = this._register(_instantiationService.createInstance(ChatQueryTitlePart, elements.title, title, subtitle, _instantiationService.createInstance(MarkdownRenderer, {})));
    this._register(titlePart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    const spacer = document.createElement("span");
    spacer.style.flexGrow = "1";
    elements.title.appendChild(spacer);
    const check = dom.h(isError ? ThemeIcon.asCSSSelector(Codicon.error) : output ? ThemeIcon.asCSSSelector(Codicon.check) : ThemeIcon.asCSSSelector(ThemeIcon.modify(Codicon.loading, "spin")));
    elements.icon.appendChild(check.root);
    const expanded = this._expanded = observableValue(this, initiallyExpanded);
    const btn = this._register(new Button(elements.expando, {}));
    this._register(autorun((r) => {
      const value = expanded.read(r);
      btn.icon = value ? Codicon.chevronDown : Codicon.chevronRight;
      elements.root.classList.toggle("collapsed", !value);
      this._onDidChangeHeight.fire();
    }));
    const toggle = /* @__PURE__ */ __name((e) => {
      if (!e.defaultPrevented) {
        const value = expanded.get();
        expanded.set(!value, void 0);
        e.preventDefault();
      }
    }, "toggle");
    this._register(btn.onDidClick(toggle));
    this._register(dom.addDisposableListener(elements.titleContainer, dom.EventType.CLICK, toggle));
    elements.message.appendChild(this.createMessageContents());
  }
  createMessageContents() {
    const contents = dom.h("div", [
      dom.h("h3@inputTitle"),
      dom.h("div@input"),
      dom.h("h3@outputTitle"),
      dom.h("div@output")
    ]);
    const { input, output } = this;
    contents.inputTitle.textContent = localize("chat.input", "Input");
    this.addCodeBlock(input, contents.input);
    if (!output) {
      contents.output.remove();
      contents.outputTitle.remove();
    } else {
      contents.outputTitle.textContent = localize("chat.output", "Output");
      for (const part of output.parts) {
        if (part.kind === "data" && getAttachableImageExtension(part.mimeType)) {
          const n = this._register(this._instantiationService.createInstance(ChatAttachmentsContentPart, [{ kind: "image", id: generateUuid(), name: `image.${getAttachableImageExtension(part.mimeType)}`, value: part.value, mimeType: part.mimeType, isURL: false }], void 0, void 0));
          contents.output.appendChild(n.domNode);
        } else if (part.kind === "code") {
          this.addCodeBlock(part, contents.output);
        }
      }
    }
    return contents.root;
  }
  addCodeBlock(part, container) {
    const data = {
      languageId: part.languageId,
      textModel: Promise.resolve(part.textModel),
      codeBlockIndex: part.codeBlockInfo.codeBlockIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      parentContextKeyService: this.contextKeyService,
      renderOptions: part.options,
      chatSessionId: this.context.element.sessionId
    };
    const editorReference = this._register(this.editorPool.get());
    editorReference.object.render(data, this._currentWidth || 300);
    this._register(editorReference.object.onDidChangeContentHeight(() => this._onDidChangeHeight.fire()));
    container.appendChild(editorReference.object.element);
    this._editorReferences.push(editorReference);
  }
  hasSameContent(other, followingContent, element) {
    return false;
  }
  layout(width) {
    this._currentWidth = width;
    this._editorReferences.forEach((r) => r.object.layout(width));
  }
};
ChatCollapsibleInputOutputContentPart = __decorate([
  __param(8, IContextKeyService),
  __param(9, IInstantiationService)
], ChatCollapsibleInputOutputContentPart);
export {
  ChatCollapsibleInputOutputContentPart
};
//# sourceMappingURL=chatToolInputOutputContentPart.js.map
