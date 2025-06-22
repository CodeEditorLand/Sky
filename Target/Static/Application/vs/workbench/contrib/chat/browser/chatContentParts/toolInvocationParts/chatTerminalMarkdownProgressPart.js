var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../../base/common/htmlContent.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ChatMarkdownContentPart } from "../chatMarkdownContentPart.js";
import { ChatCustomProgressPart } from "../chatProgressContentPart.js";
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
let ChatTerminalMarkdownProgressPart = class ChatTerminalMarkdownProgressPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ChatTerminalMarkdownProgressPart");
  }
  get codeblocks() {
    return this.markdownPart?.codeblocks ?? [];
  }
  constructor(toolInvocation, terminalData, context, renderer, editorPool, currentWidthDelegate, codeBlockStartIndex, codeBlockModelCollection, instantiationService) {
    super(toolInvocation);
    const content = new MarkdownString(`\`\`\`${terminalData.language}
${terminalData.command}
\`\`\``);
    const chatMarkdownContent = {
      kind: "markdownContent",
      content
    };
    const codeBlockRenderOptions = {
      hideToolbar: true,
      reserveWidth: 19,
      verticalPadding: 5,
      editorOptions: {
        wordWrap: "on"
      }
    };
    this.markdownPart = this._register(instantiationService.createInstance(ChatMarkdownContentPart, chatMarkdownContent, context, editorPool, false, codeBlockStartIndex, renderer, currentWidthDelegate(), codeBlockModelCollection, { codeBlockRenderOptions }));
    this._register(this.markdownPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    const icon = !toolInvocation.isConfirmed ? Codicon.error : toolInvocation.isComplete ? Codicon.check : ThemeIcon.modify(Codicon.loading, "spin");
    const progressPart = instantiationService.createInstance(ChatCustomProgressPart, this.markdownPart.domNode, icon);
    this.domNode = progressPart.domNode;
  }
};
ChatTerminalMarkdownProgressPart = __decorate([
  __param(8, IInstantiationService)
], ChatTerminalMarkdownProgressPart);
export {
  ChatTerminalMarkdownProgressPart
};
//# sourceMappingURL=chatTerminalMarkdownProgressPart.js.map
