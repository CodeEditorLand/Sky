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
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ChatProgressContentPart } from "./chatProgressContentPart.js";
import { ChatCollapsibleListContentPart } from "./chatReferencesContentPart.js";
let ChatTaskContentPart = class ChatTaskContentPart2 extends Disposable {
  static {
    __name(this, "ChatTaskContentPart");
  }
  constructor(task, contentReferencesListPool, chatContentMarkdownRenderer, context, instantiationService) {
    super();
    this.task = task;
    if (task.progress.length) {
      this.isSettled = true;
      const refsPart = this._register(instantiationService.createInstance(ChatCollapsibleListContentPart, task.progress, task.content.value, context, contentReferencesListPool, void 0));
      this.domNode = dom.$(".chat-progress-task");
      this.domNode.appendChild(refsPart.domNode);
    } else {
      const isSettled = task.kind === "progressTask" ? task.isSettled() : true;
      this.isSettled = isSettled;
      const showSpinner = !isSettled && !context.element.isComplete;
      const progressPart = this._register(instantiationService.createInstance(ChatProgressContentPart, task, chatContentMarkdownRenderer, context, showSpinner, true, void 0, void 0, void 0));
      this.domNode = progressPart.domNode;
    }
  }
  hasSameContent(other) {
    if (other.kind === "progressTask" && this.task.kind === "progressTask" && other.isSettled() !== this.isSettled) {
      return false;
    }
    return other.kind === this.task.kind && other.progress.length === this.task.progress.length;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatTaskContentPart = __decorate([
  __param(4, IInstantiationService)
], ChatTaskContentPart);
export {
  ChatTaskContentPart
};
//# sourceMappingURL=chatTaskContentPart.js.map
