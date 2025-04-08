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
import * as dom from "../../../../../base/browser/dom.js";
import { Button } from "../../../../../base/browser/ui/button/button.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { defaultButtonStyles } from "../../../../../platform/theme/browser/defaultStyles.js";
import { IChatContentPart, IChatContentPartRenderContext } from "./chatContentParts.js";
import { IChatProgressRenderableResponseContent } from "../../common/chatModel.js";
import { IChatCommandButton } from "../../common/chatService.js";
import { isResponseVM } from "../../common/chatViewModel.js";
const $ = dom.$;
let ChatCommandButtonContentPart = class extends Disposable {
  constructor(commandButton, context, commandService) {
    super();
    this.commandService = commandService;
    this.domNode = $(".chat-command-button");
    const enabled = !isResponseVM(context.element) || !context.element.isStale;
    const tooltip = enabled ? commandButton.command.tooltip : localize("commandButtonDisabled", "Button not available in restored chat");
    const button = this._register(new Button(this.domNode, { ...defaultButtonStyles, supportIcons: true, title: tooltip }));
    button.label = commandButton.command.title;
    button.enabled = enabled;
    this._register(button.onDidClick(() => this.commandService.executeCommand(commandButton.command.id, ...commandButton.command.arguments ?? [])));
  }
  static {
    __name(this, "ChatCommandButtonContentPart");
  }
  domNode;
  hasSameContent(other) {
    return other.kind === "command";
  }
};
ChatCommandButtonContentPart = __decorateClass([
  __decorateParam(2, ICommandService)
], ChatCommandButtonContentPart);
export {
  ChatCommandButtonContentPart
};
//# sourceMappingURL=chatCommandContentPart.js.map
