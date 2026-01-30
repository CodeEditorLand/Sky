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
import { Codicon } from "../../../../../../../base/common/codicons.js";
import { IInstantiationService } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { ChatCollapsibleListContentPart } from "../chatReferencesContentPart.js";
import { BaseChatToolInvocationSubPart } from "./chatToolInvocationSubPart.js";
import { getToolApprovalMessage } from "./chatToolPartUtilities.js";
let ChatResultListSubPart = class ChatResultListSubPart2 extends BaseChatToolInvocationSubPart {
  static {
    __name(this, "ChatResultListSubPart");
  }
  constructor(toolInvocation, context, message, toolDetails, listPool, instantiationService) {
    super(toolInvocation);
    this.codeblocks = [];
    const collapsibleListPart = this._register(instantiationService.createInstance(ChatCollapsibleListContentPart, toolDetails.map((detail) => ({
      kind: "reference",
      reference: detail
    })), message, context, listPool, getToolApprovalMessage(toolInvocation)));
    collapsibleListPart.icon = Codicon.check;
    this._register(collapsibleListPart.onDidChangeHeight(() => this._onDidChangeHeight.fire()));
    this.domNode = collapsibleListPart.domNode;
  }
};
ChatResultListSubPart = __decorate([
  __param(5, IInstantiationService)
], ChatResultListSubPart);
export {
  ChatResultListSubPart
};
//# sourceMappingURL=chatResultListSubPart.js.map
