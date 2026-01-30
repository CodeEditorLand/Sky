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
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { chatSubcommandLeader } from "../../../common/requestParser/chatParserTypes.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { localize } from "../../../../../../nls.js";
import { Button } from "../../../../../../base/browser/ui/button/button.js";
import { generateUuid } from "../../../../../../base/common/uuid.js";
let ChatAgentCommandContentPart = class ChatAgentCommandContentPart2 extends Disposable {
  static {
    __name(this, "ChatAgentCommandContentPart");
  }
  constructor(cmd, onClick, _hoverService) {
    super();
    this._hoverService = _hoverService;
    this.domNode = document.createElement("span");
    this.domNode.classList.add("chat-agent-command");
    this.domNode.setAttribute("aria-label", cmd.name);
    this.domNode.setAttribute("role", "button");
    const groupId = generateUuid();
    const commandSpan = document.createElement("span");
    this.domNode.appendChild(commandSpan);
    commandSpan.innerText = chatSubcommandLeader + cmd.name;
    this._store.add(this._hoverService.setupDelayedHover(commandSpan, {
      content: cmd.description,
      style: 1
    }, { groupId }));
    const rerun = localize("rerun", "Rerun without {0}{1}", chatSubcommandLeader, cmd.name);
    const btn = new Button(this.domNode, { ariaLabel: rerun });
    btn.icon = Codicon.close;
    this._store.add(btn.onDidClick(() => onClick()));
    this._store.add(btn);
    this._store.add(this._hoverService.setupDelayedHover(btn.element, {
      content: rerun,
      style: 1
    }, { groupId }));
  }
  hasSameContent(other, followingContent, element) {
    return false;
  }
};
ChatAgentCommandContentPart = __decorate([
  __param(2, IHoverService)
], ChatAgentCommandContentPart);
export {
  ChatAgentCommandContentPart
};
//# sourceMappingURL=chatAgentCommandContentPart.js.map
