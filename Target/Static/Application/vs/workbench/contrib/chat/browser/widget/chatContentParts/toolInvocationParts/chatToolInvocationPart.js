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
import * as dom from "../../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../../../base/common/lifecycle.js";
import { autorun, derived } from "../../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { IChatToolInvocation } from "../../../../common/chatService/chatService.js";
import { IChatTodoListService } from "../../../../common/tools/chatTodoListService.js";
import { isToolResultInputOutputDetails, isToolResultOutputDetails, ToolInvocationPresentation } from "../../../../common/tools/languageModelToolsService.js";
import { ExtensionsInstallConfirmationWidgetSubPart } from "./chatExtensionsInstallToolSubPart.js";
import { ChatInputOutputMarkdownProgressPart } from "./chatInputOutputMarkdownProgressPart.js";
import { ChatMcpAppSubPart } from "./chatMcpAppSubPart.js";
import { ChatResultListSubPart } from "./chatResultListSubPart.js";
import { ChatSimpleToolProgressPart } from "./chatSimpleToolProgressPart.js";
import { ChatTerminalToolConfirmationSubPart } from "./chatTerminalToolConfirmationSubPart.js";
import { ChatTerminalToolProgressPart } from "./chatTerminalToolProgressPart.js";
import { ToolConfirmationSubPart } from "./chatToolConfirmationSubPart.js";
import { ChatToolOutputSubPart } from "./chatToolOutputPart.js";
import { ChatToolPostExecuteConfirmationPart } from "./chatToolPostExecuteConfirmationPart.js";
import { ChatToolProgressSubPart } from "./chatToolProgressPart.js";
import { ChatToolStreamingSubPart } from "./chatToolStreamingSubPart.js";
let ChatToolInvocationPart = class ChatToolInvocationPart2 extends Disposable {
  static {
    __name(this, "ChatToolInvocationPart");
  }
  get codeblocks() {
    const codeblocks = this.subPart?.codeblocks ?? [];
    if (this.mcpAppPart) {
      codeblocks.push(...this.mcpAppPart.codeblocks);
    }
    return codeblocks;
  }
  get codeblocksPartId() {
    return this.subPart?.codeblocksPartId;
  }
  constructor(toolInvocation, context, renderer, listPool, editorPool, currentWidthDelegate, codeBlockModelCollection, announcedToolProgressKeys, codeBlockStartIndex, instantiationService, chatTodoListService) {
    super();
    this.toolInvocation = toolInvocation;
    this.context = context;
    this.renderer = renderer;
    this.listPool = listPool;
    this.editorPool = editorPool;
    this.currentWidthDelegate = currentWidthDelegate;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.announcedToolProgressKeys = announcedToolProgressKeys;
    this.codeBlockStartIndex = codeBlockStartIndex;
    this.instantiationService = instantiationService;
    this.chatTodoListService = chatTodoListService;
    this._onDidRemount = this._register(new Emitter());
    this.domNode = dom.$(".chat-tool-invocation-part");
    if (toolInvocation.presentation === "hidden") {
      return;
    }
    if (toolInvocation.toolSpecificData?.kind === "todoList") {
      const sessionResource = context.element.sessionResource;
      const todos = toolInvocation.toolSpecificData.todoList.map((todo, index) => {
        const parsedId = parseInt(todo.id, 10);
        const id = Number.isNaN(parsedId) ? index + 1 : parsedId;
        return {
          id,
          title: todo.title,
          status: todo.status
        };
      });
      this.chatTodoListService.setTodos(sessionResource, todos);
    }
    if (toolInvocation.kind === "toolInvocation") {
      const initialState = toolInvocation.state.get().type;
      this._register(autorun((reader) => {
        if (toolInvocation.state.read(reader).type !== initialState) {
          render();
        }
      }));
    }
    const partStore = this._register(new DisposableStore());
    let subPartDomNode = document.createElement("div");
    this.domNode.appendChild(subPartDomNode);
    const render = /* @__PURE__ */ __name(() => {
      partStore.clear();
      if (toolInvocation.presentation === ToolInvocationPresentation.HiddenAfterComplete && IChatToolInvocation.isComplete(toolInvocation)) {
        dom.hide(this.domNode);
        return;
      }
      dom.show(this.domNode);
      this.subPart = partStore.add(this.createToolInvocationSubPart());
      subPartDomNode.replaceWith(this.subPart.domNode);
      subPartDomNode = this.subPart.domNode;
      const isConfirmation = this.subPart instanceof ToolConfirmationSubPart || this.subPart instanceof ChatTerminalToolConfirmationSubPart || this.subPart instanceof ExtensionsInstallConfirmationWidgetSubPart || this.subPart instanceof ChatToolPostExecuteConfirmationPart;
      this.domNode.classList.toggle("has-confirmation", isConfirmation);
      partStore.add(this.subPart.onNeedsRerender(render));
    }, "render");
    const mcpAppRenderData = this.getMcpAppRenderData();
    if (mcpAppRenderData) {
      const shouldRender = derived((r) => {
        const outcome = IChatToolInvocation.executionConfirmedOrDenied(toolInvocation, r);
        return !!outcome && outcome.type !== 0 && outcome.type !== 5;
      });
      let appDomNode = document.createElement("div");
      this.domNode.appendChild(appDomNode);
      this._register(autorun((r) => {
        if (shouldRender.read(r)) {
          this.mcpAppPart = r.store.add(this.instantiationService.createInstance(ChatMcpAppSubPart, this.toolInvocation, this._onDidRemount.event, context, mcpAppRenderData));
          appDomNode.replaceWith(this.mcpAppPart.domNode);
          appDomNode = this.mcpAppPart.domNode;
        } else {
          this.mcpAppPart = void 0;
          dom.clearNode(appDomNode);
        }
      }));
    }
    render();
  }
  createToolInvocationSubPart() {
    if (this.toolInvocation.kind === "toolInvocation") {
      if (this.toolInvocation.toolSpecificData?.kind === "extensions") {
        return this.instantiationService.createInstance(ExtensionsInstallConfirmationWidgetSubPart, this.toolInvocation, this.context);
      }
      const state = this.toolInvocation.state.get();
      if (state.type === 0) {
        return this.instantiationService.createInstance(ChatToolStreamingSubPart, this.toolInvocation, this.context, this.renderer);
      }
      if (state.type === 1) {
        if (this.toolInvocation.toolSpecificData?.kind === "terminal") {
          return this.instantiationService.createInstance(ChatTerminalToolConfirmationSubPart, this.toolInvocation, this.toolInvocation.toolSpecificData, this.context, this.renderer, this.editorPool, this.currentWidthDelegate, this.codeBlockModelCollection, this.codeBlockStartIndex);
        } else {
          return this.instantiationService.createInstance(ToolConfirmationSubPart, this.toolInvocation, this.context, this.renderer, this.editorPool, this.currentWidthDelegate, this.codeBlockModelCollection, this.codeBlockStartIndex);
        }
      }
      if (state.type === 3) {
        return this.instantiationService.createInstance(ChatToolPostExecuteConfirmationPart, this.toolInvocation, this.context);
      }
    }
    if (this.toolInvocation.toolSpecificData?.kind === "terminal") {
      return this.instantiationService.createInstance(ChatTerminalToolProgressPart, this.toolInvocation, this.toolInvocation.toolSpecificData, this.context, this.renderer, this.editorPool, this.currentWidthDelegate, this.codeBlockStartIndex, this.codeBlockModelCollection);
    }
    if (this.toolInvocation.toolSpecificData?.kind === "resources" && this.toolInvocation.toolSpecificData.values.length > 0) {
      return this.instantiationService.createInstance(ChatResultListSubPart, this.toolInvocation, this.context, this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage, this.toolInvocation.toolSpecificData.values, this.listPool);
    }
    if (this.toolInvocation.toolSpecificData?.kind === "simpleToolInvocation") {
      return this.instantiationService.createInstance(ChatSimpleToolProgressPart, this.toolInvocation, this.context, this.codeBlockStartIndex, this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage, this.toolInvocation.originMessage, this.toolInvocation.toolSpecificData, false);
    }
    const resultDetails = IChatToolInvocation.resultDetails(this.toolInvocation);
    if (Array.isArray(resultDetails) && resultDetails.length) {
      return this.instantiationService.createInstance(ChatResultListSubPart, this.toolInvocation, this.context, this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage, resultDetails, this.listPool);
    }
    if (isToolResultOutputDetails(resultDetails)) {
      return this.instantiationService.createInstance(ChatToolOutputSubPart, this.toolInvocation, this.context, this._onDidRemount.event);
    }
    if (isToolResultInputOutputDetails(resultDetails)) {
      return this.instantiationService.createInstance(ChatInputOutputMarkdownProgressPart, this.toolInvocation, this.context, this.codeBlockStartIndex, this.toolInvocation.pastTenseMessage ?? this.toolInvocation.invocationMessage, this.toolInvocation.originMessage, resultDetails.input, resultDetails.output, !!resultDetails.isError);
    }
    if (this.toolInvocation.kind === "toolInvocation" && this.toolInvocation.toolSpecificData?.kind === "input" && !IChatToolInvocation.isComplete(this.toolInvocation)) {
      return this.instantiationService.createInstance(ChatInputOutputMarkdownProgressPart, this.toolInvocation, this.context, this.codeBlockStartIndex, this.toolInvocation.invocationMessage, this.toolInvocation.originMessage, typeof this.toolInvocation.toolSpecificData.rawInput === "string" ? this.toolInvocation.toolSpecificData.rawInput : JSON.stringify(this.toolInvocation.toolSpecificData.rawInput, null, 2), void 0, false);
    }
    return this.instantiationService.createInstance(ChatToolProgressSubPart, this.toolInvocation, this.context, this.renderer, this.announcedToolProgressKeys);
  }
  /**
   * Gets MCP App render data if this tool invocation has MCP App UI.
   * Returns data from either:
   * - toolSpecificData.mcpAppData (for in-progress tools)
   * - result details mcpOutput (for completed tools)
   */
  getMcpAppRenderData() {
    const toolSpecificData = this.toolInvocation.toolSpecificData;
    if (toolSpecificData?.kind === "input" && toolSpecificData.mcpAppData) {
      const rawInput = typeof toolSpecificData.rawInput === "string" ? toolSpecificData.rawInput : JSON.stringify(toolSpecificData.rawInput, null, 2);
      return {
        resourceUri: toolSpecificData.mcpAppData.resourceUri,
        serverDefinitionId: toolSpecificData.mcpAppData.serverDefinitionId,
        collectionId: toolSpecificData.mcpAppData.collectionId,
        input: rawInput,
        sessionResource: this.context.element.sessionResource
      };
    }
    return void 0;
  }
  onDidRemount() {
    this._onDidRemount.fire();
  }
  hasSameContent(other, followingContent, element) {
    return (other.kind === "toolInvocation" || other.kind === "toolInvocationSerialized") && this.toolInvocation.toolCallId === other.toolCallId;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatToolInvocationPart = __decorate([
  __param(9, IInstantiationService),
  __param(10, IChatTodoListService)
], ChatToolInvocationPart);
export {
  ChatToolInvocationPart
};
//# sourceMappingURL=chatToolInvocationPart.js.map
