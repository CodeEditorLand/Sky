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
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
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
    const outputCodeblocks = this._outputSubPart?.codeblocks ?? [];
    return outputCodeblocks;
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
  constructor(title, subtitle, progressTooltip, context, input, output, isError, initiallyExpanded, contextKeyService, _instantiationService, hoverService, modelService, languageService) {
    super();
    this.context = context;
    this.input = input;
    this.output = output;
    this.contextKeyService = contextKeyService;
    this._instantiationService = _instantiationService;
    this.modelService = modelService;
    this.languageService = languageService;
    this._editorReferences = [];
    this._contentInitialized = false;
    const container = dom.h(".chat-confirmation-widget-container");
    const titleEl = dom.h(".chat-confirmation-widget-title-inner");
    const elements = dom.h(".chat-confirmation-widget");
    this.domNode = container.root;
    container.root.appendChild(elements.root);
    this._titlePart = this._register(_instantiationService.createInstance(ChatQueryTitlePart, titleEl.root, title, subtitle));
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
      if (value && !this._contentInitialized) {
        this._contentInitialized = true;
        const messageContainer = dom.h(".chat-confirmation-widget-message");
        messageContainer.root.appendChild(this.createMessageContents());
        elements.root.appendChild(messageContainer.root);
      }
    }));
    const toggle = /* @__PURE__ */ __name((e) => {
      if (!e.defaultPrevented) {
        const value = expanded.get();
        expanded.set(!value, void 0);
        e.preventDefault();
      }
    }, "toggle");
    this._register(btn.onDidClick(toggle));
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
      contents.output.appendChild(outputSubPart.domNode);
    }
    return contents.root;
  }
  addCodeBlock(part, container) {
    const textModel = this._register(this.modelService.createModel(part.data, this.languageService.createById(part.languageId), void 0, true));
    const data = {
      languageId: part.languageId,
      textModel: Promise.resolve(textModel),
      codeBlockIndex: part.codeBlockIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      parentContextKeyService: this.contextKeyService,
      renderOptions: part.options,
      chatSessionResource: this.context.element.sessionResource
    };
    const editorReference = this._register(this.context.editorPool.get());
    editorReference.object.render(data, this.context.currentWidth.get() || 300);
    container.appendChild(editorReference.object.element);
    this._editorReferences.push(editorReference);
  }
  hasSameContent(other, followingContent, element) {
    return false;
  }
  layout(width) {
    this._editorReferences.forEach((r) => r.object.layout(width));
    this._outputSubPart?.layout(width);
  }
};
ChatCollapsibleInputOutputContentPart = __decorate([
  __param(8, IContextKeyService),
  __param(9, IInstantiationService),
  __param(10, IHoverService),
  __param(11, IModelService),
  __param(12, ILanguageService)
], ChatCollapsibleInputOutputContentPart);
export {
  ChatCollapsibleInputOutputContentPart
};
//# sourceMappingURL=chatToolInputOutputContentPart.js.map
