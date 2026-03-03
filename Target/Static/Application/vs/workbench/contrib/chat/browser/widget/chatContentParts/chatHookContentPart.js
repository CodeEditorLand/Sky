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
import { $ } from "../../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { localize } from "../../../../../../nls.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { HookType, HOOK_TYPES } from "../../../common/promptSyntax/hookSchema.js";
import { ChatCollapsibleContentPart } from "./chatCollapsibleContentPart.js";
import "./media/chatHookContentPart.css";
function getHookTypeLabel(hookType) {
  return HOOK_TYPES.find((hook) => hook.id === hookType)?.label ?? hookType;
}
__name(getHookTypeLabel, "getHookTypeLabel");
let ChatHookContentPart = class ChatHookContentPart2 extends ChatCollapsibleContentPart {
  static {
    __name(this, "ChatHookContentPart");
  }
  constructor(hookPart, context, hoverService, configurationService) {
    const hookTypeLabel = getHookTypeLabel(hookPart.hookType);
    const isStopped = !!hookPart.stopReason;
    const isWarning = !!hookPart.systemMessage;
    const toolName = hookPart.toolDisplayName;
    const title = isStopped ? toolName ? localize("hook.title.stoppedWithTool", "Blocked {0} - {1} hook", toolName, hookTypeLabel) : localize("hook.title.stopped", "Blocked by {0} hook", hookTypeLabel) : toolName ? localize("hook.title.warningWithTool", "Warning for {0} - {1} hook", toolName, hookTypeLabel) : localize("hook.title.warning", "Warning from {0} hook", hookTypeLabel);
    super(title, context, void 0, hoverService, configurationService);
    this.hookPart = hookPart;
    this.icon = isStopped ? Codicon.error : isWarning ? Codicon.warning : Codicon.check;
    if (isStopped) {
      this.domNode.classList.add("chat-hook-outcome-blocked");
    } else if (isWarning) {
      this.domNode.classList.add("chat-hook-outcome-warning");
    }
    this.setExpanded(false);
  }
  initContent() {
    const content = $(".chat-hook-details.chat-used-context-list");
    if (this.hookPart.stopReason) {
      const reasonElement = $(".chat-hook-reason", void 0, this.hookPart.stopReason);
      content.appendChild(reasonElement);
    }
    const isToolHook = this.hookPart.hookType === HookType.PreToolUse || this.hookPart.hookType === HookType.PostToolUse;
    if (this.hookPart.systemMessage && (isToolHook || !this.hookPart.stopReason)) {
      const messageElement = $(".chat-hook-message", void 0, this.hookPart.systemMessage);
      content.appendChild(messageElement);
    }
    return content;
  }
  hasSameContent(other, _followingContent, _element) {
    if (other.kind !== "hook") {
      return false;
    }
    return other.hookType === this.hookPart.hookType && other.stopReason === this.hookPart.stopReason && other.systemMessage === this.hookPart.systemMessage && other.toolDisplayName === this.hookPart.toolDisplayName;
  }
};
ChatHookContentPart = __decorate([
  __param(2, IHoverService),
  __param(3, IConfigurationService)
], ChatHookContentPart);
export {
  ChatHookContentPart
};
//# sourceMappingURL=chatHookContentPart.js.map
