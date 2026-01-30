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
import * as dom from "../../../../../../base/browser/dom.js";
import { ButtonWithIcon } from "../../../../../../base/browser/ui/button/button.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { localize } from "../../../../../../nls.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { LanguageModelPartAudience } from "../../../common/languageModels.js";
import { ChatQueryTitlePart } from "./chatConfirmationWidget.js";
import { ChatToolOutputContentSubPart } from "./chatToolOutputContentSubPart.js";
let ChatCollapsibleInputOutputContentPart = class ChatCollapsibleInputOutputContentPart2 extends Disposable {
  static {
    __name(this, "ChatCollapsibleInputOutputContentPart");
  }
  get codeblocks() {
    const inputCodeblocks = this._editorReferences.map((ref) => {
      const cbi = this.input.codeBlockInfo;
      return cbi;
    });
    const outputCodeblocks = this._outputSubPart?.codeblocks ?? [];
    return [...inputCodeblocks, ...outputCodeblocks];
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
  constructor(title, subtitle, progressTooltip, context, input, output, isError, initiallyExpanded, contextKeyService, _instantiationService, hoverService) {
    super();
    this.context = context;
    this.input = input;
    this.output = output;
    this.contextKeyService = contextKeyService;
    this._instantiationService = _instantiationService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._currentWidth = 0;
    this._editorReferences = [];
    this._currentWidth = context.currentWidth.get();
    const container = dom.h(".chat-confirmation-widget-container");
    const titleEl = dom.h(".chat-confirmation-widget-title-inner");
    const elements = dom.h(".chat-confirmation-widget");
    this.domNode = container.root;
    container.root.appendChild(elements.root);
    const titlePart = this._titlePart = this._register(_instantiationService.createInstance(ChatQueryTitlePart, titleEl.root, title, subtitle));
    this._register(titlePart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    const spacer = document.createElement("span");
    spacer.style.flexGrow = "1";
    const btn = this._register(new ButtonWithIcon(elements.root, {}));
    btn.element.classList.add("chat-confirmation-widget-title", "monaco-text-button");
    btn.labelElement.append(titleEl.root);
    const check = dom.h(isError ? ThemeIcon.asCSSSelector(Codicon.error) : output ? ThemeIcon.asCSSSelector(Codicon.check) : ThemeIcon.asCSSSelector(ThemeIcon.modify(Codicon.loading, "spin")));
    if (progressTooltip) {
      this._register(hoverService.setupDelayedHover(check.root, {
        content: progressTooltip,
        style: 1
      }));
    }
    const expanded = this._expanded = observableValue(this, initiallyExpanded);
    this._register(autorun((r) => {
      const value = expanded.read(r);
      btn.icon = isError ? Codicon.error : output ? Codicon.check : ThemeIcon.modify(Codicon.loading, "spin");
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
    const message = dom.h(".chat-confirmation-widget-message");
    message.root.appendChild(this.createMessageContents());
    elements.root.appendChild(message.root);
    const topLevelResources = this.output?.parts.filter((p) => p.kind === "data").filter((p) => !p.audience || p.audience.includes(LanguageModelPartAudience.User));
    if (topLevelResources?.length) {
      const resourceSubPart = this._register(this._instantiationService.createInstance(ChatToolOutputContentSubPart, this.context, topLevelResources));
      const group = resourceSubPart.domNode;
      group.classList.add("chat-collapsible-top-level-resource-group");
      container.root.appendChild(group);
      this._register(autorun((r) => {
        group.style.display = expanded.read(r) ? "none" : "";
      }));
    }
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
      const outputSubPart = this._register(this._instantiationService.createInstance(ChatToolOutputContentSubPart, this.context, output.parts));
      this._outputSubPart = outputSubPart;
      this._register(outputSubPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
      contents.output.appendChild(outputSubPart.domNode);
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
      chatSessionResource: this.context.element.sessionResource
    };
    const editorReference = this._register(this.context.editorPool.get());
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
    this._outputSubPart?.layout(width);
  }
};
ChatCollapsibleInputOutputContentPart = __decorate([
  __param(8, IContextKeyService),
  __param(9, IInstantiationService),
  __param(10, IHoverService)
], ChatCollapsibleInputOutputContentPart);
export {
  ChatCollapsibleInputOutputContentPart
};
//# sourceMappingURL=chatToolInputOutputContentPart.js.map
