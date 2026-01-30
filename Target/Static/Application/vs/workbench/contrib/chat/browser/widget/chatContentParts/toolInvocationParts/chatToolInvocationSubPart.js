var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../../../base/common/themables.js";
import { IChatToolInvocation } from "../../../../common/chatService/chatService.js";
class BaseChatToolInvocationSubPart extends Disposable {
  static {
    __name(this, "BaseChatToolInvocationSubPart");
  }
  static {
    this.idPool = 0;
  }
  get codeblocksPartId() {
    return this._codeBlocksPartId;
  }
  constructor(toolInvocation) {
    super();
    this.toolInvocation = toolInvocation;
    this._onNeedsRerender = this._register(new Emitter());
    this.onNeedsRerender = this._onNeedsRerender.event;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._codeBlocksPartId = "tool-" + BaseChatToolInvocationSubPart.idPool++;
  }
  getIcon() {
    const toolInvocation = this.toolInvocation;
    const confirmState = IChatToolInvocation.executionConfirmedOrDenied(toolInvocation);
    const isSkipped = confirmState?.type === 5;
    if (isSkipped) {
      return Codicon.circleSlash;
    }
    return confirmState?.type === 0 ? Codicon.error : IChatToolInvocation.isComplete(toolInvocation) ? Codicon.check : ThemeIcon.modify(Codicon.loading, "spin");
  }
}
export {
  BaseChatToolInvocationSubPart
};
//# sourceMappingURL=chatToolInvocationSubPart.js.map
