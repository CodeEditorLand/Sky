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
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { IMarkdownRendererService } from "../../../../../../platform/markdown/browser/markdownRenderer.js";
import { ChatResourceGroupWidget } from "./chatResourceGroupWidget.js";
let ChatToolOutputContentSubPart = class ChatToolOutputContentSubPart2 extends Disposable {
  static {
    __name(this, "ChatToolOutputContentSubPart");
  }
  constructor(context, parts, _instantiationService, contextKeyService, _markdownRendererService, modelService, languageService) {
    super();
    this.context = context;
    this.parts = parts;
    this._instantiationService = _instantiationService;
    this.contextKeyService = contextKeyService;
    this._markdownRendererService = _markdownRendererService;
    this.modelService = modelService;
    this.languageService = languageService;
    this._editorReferences = [];
    this.codeblocks = [];
    this.domNode = this.createOutputContents();
  }
  toMdString(value) {
    if (typeof value === "string") {
      return new MarkdownString("").appendText(value);
    }
    return new MarkdownString(value.value, { isTrusted: value.isTrusted });
  }
  createOutputContents() {
    const container = dom.$("div");
    for (let i = 0; i < this.parts.length; i++) {
      const part = this.parts[i];
      if (part.kind === "code") {
        const codeParts = [part];
        while (i + 1 < this.parts.length && this.parts[i + 1].kind === "code") {
          codeParts.push(this.parts[++i]);
        }
        this.addCodeBlock(codeParts, container);
        continue;
      }
      const group = [];
      for (let k = i; k < this.parts.length; k++) {
        const part2 = this.parts[k];
        if (part2.kind !== "data") {
          break;
        }
        group.push(part2);
      }
      this.addResourceGroup(group, container);
      i += group.length - 1;
    }
    return container;
  }
  addResourceGroup(parts, container) {
    const widget = this._register(this._instantiationService.createInstance(ChatResourceGroupWidget, parts));
    container.appendChild(widget.domNode);
  }
  addCodeBlock(parts, container) {
    const firstPart = parts[0];
    if (firstPart.title) {
      const title = dom.$("div.chat-confirmation-widget-title");
      const renderedTitle = this._register(this._markdownRendererService.render(this.toMdString(firstPart.title)));
      title.appendChild(renderedTitle.element);
      container.appendChild(title);
    }
    const combinedText = parts.map((p) => p.data).join("\n");
    const textModel = this._register(this.modelService.createModel(combinedText, this.languageService.createById(firstPart.languageId), void 0, true));
    const data = {
      languageId: firstPart.languageId,
      textModel: Promise.resolve(textModel),
      codeBlockIndex: firstPart.codeBlockIndex,
      codeBlockPartIndex: 0,
      element: this.context.element,
      parentContextKeyService: this.contextKeyService,
      renderOptions: firstPart.options,
      chatSessionResource: this.context.element.sessionResource
    };
    const editorReference = this._register(this.context.editorPool.get());
    editorReference.object.render(data, this.context.currentWidth.get());
    container.appendChild(editorReference.object.element);
    this._editorReferences.push(editorReference);
    this.codeblocks.push({
      ownerMarkdownPartId: firstPart.ownerMarkdownPartId,
      codeBlockIndex: firstPart.codeBlockIndex,
      elementId: this.context.element.id,
      uri: textModel.uri,
      uriPromise: Promise.resolve(textModel.uri),
      codemapperUri: void 0,
      chatSessionResource: this.context.element.sessionResource,
      focus: /* @__PURE__ */ __name(() => {
      }, "focus")
    });
  }
  layout(width) {
    this._editorReferences.forEach((r) => r.object.layout(width));
  }
};
ChatToolOutputContentSubPart = __decorate([
  __param(2, IInstantiationService),
  __param(3, IContextKeyService),
  __param(4, IMarkdownRendererService),
  __param(5, IModelService),
  __param(6, ILanguageService)
], ChatToolOutputContentSubPart);
export {
  ChatToolOutputContentSubPart
};
//# sourceMappingURL=chatToolOutputContentSubPart.js.map
