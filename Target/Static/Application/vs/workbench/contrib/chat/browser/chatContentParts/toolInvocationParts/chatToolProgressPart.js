var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ChatProgressContentPart } from "../chatProgressContentPart.js";
import { BaseChatToolInvocationSubPart } from "./chatToolInvocationSubPart.js";
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
let ChatToolProgressSubPart = class ChatToolProgressSubPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ChatToolProgressSubPart");
  }
  constructor(toolInvocation, context, renderer, instantiationService) {
    super(toolInvocation);
    this.toolInvocation = toolInvocation;
    this.context = context;
    this.renderer = renderer;
    this.instantiationService = instantiationService;
    this.codeblocks = [];
    this.domNode = this.createProgressPart();
  }
  createProgressPart() {
    if (this.toolInvocation.isComplete && this.toolInvocation.isConfirmed !== false && this.toolInvocation.pastTenseMessage) {
      const part = this.renderProgressContent(this.toolInvocation.pastTenseMessage);
      this._register(part);
      return part.domNode;
    } else {
      const container = document.createElement("div");
      const progressObservable = this.toolInvocation.kind === "toolInvocation" ? this.toolInvocation.progress : void 0;
      this._register(autorun((reader) => {
        const progress = progressObservable?.read(reader);
        const part = reader.store.add(this.renderProgressContent(progress?.message || this.toolInvocation.invocationMessage));
        dom.reset(container, part.domNode);
      }));
      return container;
    }
  }
  renderProgressContent(content) {
    if (typeof content === "string") {
      content = new MarkdownString().appendText(content);
    }
    const progressMessage = {
      kind: "progressMessage",
      content
    };
    const iconOverride = !this.toolInvocation.isConfirmed ? Codicon.error : this.toolInvocation.isComplete ? Codicon.check : void 0;
    return this.instantiationService.createInstance(ChatProgressContentPart, progressMessage, this.renderer, this.context, void 0, true, iconOverride);
  }
};
ChatToolProgressSubPart = __decorate([
  __param(3, IInstantiationService)
], ChatToolProgressSubPart);
export {
  ChatToolProgressSubPart
};
//# sourceMappingURL=chatToolProgressPart.js.map
