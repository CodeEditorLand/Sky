var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
class BaseChatToolInvocationSubPart extends Disposable {
  static {
    __name(this, "BaseChatToolInvocationSubPart");
  }
  static {
    this.idPool = 0;
  }
  constructor(toolInvocation) {
    super();
    this._onNeedsRerender = this._register(new Emitter());
    this.onNeedsRerender = this._onNeedsRerender.event;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this.codeblocksPartId = "tool-" + BaseChatToolInvocationSubPart.idPool++;
    if (toolInvocation.kind === "toolInvocation" && !toolInvocation.isComplete) {
      toolInvocation.isCompletePromise.then(() => this._onNeedsRerender.fire());
    }
  }
}
export {
  BaseChatToolInvocationSubPart
};
//# sourceMappingURL=chatToolInvocationSubPart.js.map
