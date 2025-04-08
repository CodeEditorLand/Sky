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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { IChatAgentCommand } from "../../common/chatAgents.js";
import { chatSubcommandLeader } from "../../common/chatParserTypes.js";
import { IChatRendererContent } from "../../common/chatViewModel.js";
import { ChatTreeItem } from "../chat.js";
import { IChatContentPart } from "./chatContentParts.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize } from "../../../../../nls.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
let ChatAgentCommandContentPart = class extends Disposable {
  constructor(cmd, onClick, _hoverService) {
    super();
    this._hoverService = _hoverService;
    this.domNode.classList.add("chat-agent-command");
    this.domNode.setAttribute("aria-label", cmd.name);
    this.domNode.setAttribute("role", "button");
    const groupId = generateUuid();
    const commandSpan = document.createElement("span");
    this.domNode.appendChild(commandSpan);
    commandSpan.innerText = chatSubcommandLeader + cmd.name;
    this._store.add(this._hoverService.setupDelayedHover(commandSpan, { content: cmd.description, appearance: { showPointer: true } }, { groupId }));
    const rerun = localize("rerun", "Rerun without {0}{1}", chatSubcommandLeader, cmd.name);
    const btn = new Button(this.domNode, { ariaLabel: rerun });
    btn.icon = Codicon.close;
    this._store.add(btn.onDidClick(() => onClick()));
    this._store.add(btn);
    this._store.add(this._hoverService.setupDelayedHover(btn.element, { content: rerun, appearance: { showPointer: true } }, { groupId }));
  }
  static {
    __name(this, "ChatAgentCommandContentPart");
  }
  domNode = document.createElement("span");
  hasSameContent(other, followingContent, element) {
    return false;
  }
};
ChatAgentCommandContentPart = __decorateClass([
  __decorateParam(2, IHoverService)
], ChatAgentCommandContentPart);
export {
  ChatAgentCommandContentPart
};
//# sourceMappingURL=chatAgentCommandContentPart.js.map
