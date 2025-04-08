var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../base/browser/dom.js";
import { Button, IButtonStyles } from "../../../../base/browser/ui/button/button.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IChatAgentService } from "../common/chatAgents.js";
import { formatChatQuestion } from "../common/chatParserTypes.js";
import { IChatFollowup } from "../common/chatService.js";
import { ChatAgentLocation } from "../common/constants.js";
const $ = dom.$;
let ChatFollowups = class extends Disposable {
  constructor(container, followups, location, options, clickHandler, chatAgentService) {
    super();
    this.location = location;
    this.options = options;
    this.clickHandler = clickHandler;
    this.chatAgentService = chatAgentService;
    const followupsContainer = dom.append(container, $(".interactive-session-followups"));
    followups.forEach((followup) => this.renderFollowup(followupsContainer, followup));
  }
  static {
    __name(this, "ChatFollowups");
  }
  renderFollowup(container, followup) {
    if (!this.chatAgentService.getDefaultAgent(this.location)) {
      return;
    }
    const tooltipPrefix = formatChatQuestion(this.chatAgentService, this.location, "", followup.agentId, followup.subCommand);
    if (tooltipPrefix === void 0) {
      return;
    }
    const baseTitle = followup.kind === "reply" ? followup.title || followup.message : followup.title;
    const message = followup.kind === "reply" ? followup.message : followup.title;
    const tooltip = (tooltipPrefix + ("tooltip" in followup && followup.tooltip || message)).trim();
    const button = this._register(new Button(container, { ...this.options, title: tooltip }));
    if (followup.kind === "reply") {
      button.element.classList.add("interactive-followup-reply");
    } else if (followup.kind === "command") {
      button.element.classList.add("interactive-followup-command");
    }
    button.element.ariaLabel = localize("followUpAriaLabel", "Follow up question: {0}", baseTitle);
    button.label = new MarkdownString(baseTitle);
    this._register(button.onDidClick(() => this.clickHandler(followup)));
  }
};
ChatFollowups = __decorateClass([
  __decorateParam(5, IChatAgentService)
], ChatFollowups);
export {
  ChatFollowups
};
//# sourceMappingURL=chatFollowups.js.map
