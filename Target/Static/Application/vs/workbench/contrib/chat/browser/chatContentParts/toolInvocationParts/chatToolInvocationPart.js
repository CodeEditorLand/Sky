var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { isToolResultInputOutputDetails } from "../../../common/languageModelToolsService.js";
import { ExtensionsInstallConfirmationWidgetSubPart } from "./chatExtensionsInstallToolSubPart.js";
import { ChatInputOutputMarkdownProgressPart } from "./chatInputOutputMarkdownProgressPart.js";
import { ChatResultListSubPart } from "./chatResultListSubPart.js";
import { ChatTerminalMarkdownProgressPart } from "./chatTerminalMarkdownProgressPart.js";
import { TerminalConfirmationWidgetSubPart } from "./chatTerminalToolSubPart.js";
import { ToolConfirmationSubPart } from "./chatToolConfirmationSubPart.js";
import { ChatToolProgressSubPart } from "./chatToolProgressPart.js";
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
let ChatToolInvocationPart = class ChatToolInvocationPart2 extends Disposable {
  static {
    __name(this, "ChatToolInvocationPart");
  }
  get codeblocks() {
    return this.subPart?.codeblocks ?? [];
  }
  get codeblocksPartId() {
    return this.subPart?.codeblocksPartId;
  }
  constructor(toolInvocation, context, renderer, listPool, editorPool, currentWidthDelegate, codeBlockModelCollection, codeBlockStartIndex, instantiationService) {
    super();
    this.toolInvocation = toolInvocation;
    this.context = context;
    this.renderer = renderer;
    this.listPool = listPool;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.codeBlockStartIndex = codeBlockStartIndex;
    this.instantiationService = instantiationService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this.domNode = dom.$(".chat-tool-invocation-part");
    if (toolInvocation.presentation === "hidden") {
      return;
    }
    const partStore = this._register(new DisposableStore());
    const render = /* @__PURE__ */ __name(() => {
      dom.clearNode(this.domNode);
      partStore.clear();
      this.subPart = partStore.add(this.createToolInvocationSubPart());
      this.domNode.appendChild(this.subPart.domNode);
      partStore.add(this.subPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
      partStore.add(this.subPart.onNeedsRerender(() => {
        render();
        this._onDidChangeHeight.fire();
      }));
    }, "render");
    render();
  }
  createToolInvocationSubPart() {
    if (this.toolInvocation.kind === "toolInvocation") {
      if (this.toolInvocation.toolSpecificData?.kind === "extensions") {
        return this.instantiationService.createInstance(ExtensionsInstallConfirmationWidgetSubPart, this.toolInvocation, this.context);
      }
      if (this.toolInvocation.confirmationMessages) {
        if (this.toolInvocation.toolSpecificData?.kind === "terminal") {
          return this.instantiationService.createInstance(TerminalConfirmationWidgetSubPart, this.toolInvocation, this.toolInvocation.toolSpecificData, this.context, this.renderer, this.editorPool, this.currentWidthDelegate, this.codeBlockStartIndex);
        } else {
          return this.instantiationService.createInstance(ToolConfirmationSubPart, this.toolInvocation, this.context, this.renderer, this.editorPool, this.currentWidthDelegate, this.codeBlockModelCollection, this.codeBlockStartIndex);
        }
      }
    }
    if (this.toolInvocation.toolSpecificData?.kind === "terminal") {
      return this.instantiationService.createInstance(ChatTerminalMarkdownProgressPart, this.toolInvocation, this.toolInvocation.toolSpecificData, this.context, this.renderer, this.editorPool, this.currentWidthDelegate, this.codeBlockStartIndex, this.codeBlockModelCollection);
    }
    if (Array.isArray(this.toolInvocation.resultDetails) && this.toolInvocation.resultDetails?.length) {
      return this.instantiationService.createInstance(ChatResultListSubPart, this.toolInvocation, this.context, this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage, this.toolInvocation.resultDetails, this.listPool);
    }
    if (isToolResultInputOutputDetails(this.toolInvocation.resultDetails)) {
      return this.instantiationService.createInstance(ChatInputOutputMarkdownProgressPart, this.toolInvocation, this.context, this.editorPool, this.codeBlockStartIndex, this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage, this.toolInvocation.originMessage, this.toolInvocation.resultDetails.input, this.toolInvocation.resultDetails.output, !!this.toolInvocation.resultDetails.isError, this.currentWidthDelegate);
    }
    if (this.toolInvocation.kind === "toolInvocation" && this.toolInvocation.toolSpecificData?.kind === "input" && !this.toolInvocation.isComplete) {
      return this.instantiationService.createInstance(ChatInputOutputMarkdownProgressPart, this.toolInvocation, this.context, this.editorPool, this.codeBlockStartIndex, this.toolInvocation.invocationMessage, this.toolInvocation.originMessage, typeof this.toolInvocation.toolSpecificData.rawInput === "string" ? this.toolInvocation.toolSpecificData.rawInput : JSON.stringify(this.toolInvocation.toolSpecificData.rawInput, null, 2), void 0, false, this.currentWidthDelegate);
    }
    return this.instantiationService.createInstance(ChatToolProgressSubPart, this.toolInvocation, this.context, this.renderer);
  }
  hasSameContent(other, followingContent, element) {
    return (other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized") && this.toolInvocation.toolCallId === other.toolCallId;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatToolInvocationPart = __decorate([
  __param(8, IInstantiationService)
], ChatToolInvocationPart);
export {
  ChatToolInvocationPart
};
//# sourceMappingURL=chatToolInvocationPart.js.map
