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
import * as dom from "../../../../base/browser/dom.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IChatAgentService } from "../common/chatAgents.js";
import { formatChatQuestion } from "../common/chatParserTypes.js";
const $ = dom.$;
let ChatFollowups = class ChatFollowups2 extends Disposable {
  static {
    __name(this, "ChatFollowups");
  }
  constructor(container, followups, location, options, clickHandler, chatAgentService) {
    super();
    this.location = location;
    this.options = options;
    this.clickHandler = clickHandler;
    this.chatAgentService = chatAgentService;
    const followupsContainer = dom.append(container, $(".interactive-session-followups"));
    followups.forEach((followup) => this.renderFollowup(followupsContainer, followup));
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
ChatFollowups = __decorate([
  __param(5, IChatAgentService)
], ChatFollowups);
export {
  ChatFollowups
};
//# sourceMappingURL=chatFollowups.js.map
