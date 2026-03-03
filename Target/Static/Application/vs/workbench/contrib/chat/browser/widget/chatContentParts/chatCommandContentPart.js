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
import { Button } from "../../../../../../base/browser/ui/button/button.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../nls.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { defaultButtonStyles } from "../../../../../../platform/theme/browser/defaultStyles.js";
import { isResponseVM } from "../../../common/model/chatViewModel.js";
const $ = dom.$;
let ChatCommandButtonContentPart = class ChatCommandButtonContentPart2 extends Disposable {
  static {
    __name(this, "ChatCommandButtonContentPart");
  }
  constructor(commandButton, context, commandService) {
    super();
    this.commandService = commandService;
    this.domNode = $(".chat-command-button");
    const enabled = !isResponseVM(context.element) || !context.element.isStale;
    this.renderButton(this.domNode, commandButton.command, enabled);
    if (commandButton.additionalCommands) {
      for (const command of commandButton.additionalCommands) {
        this.renderButton(this.domNode, command, enabled, true);
      }
    }
  }
  renderButton(container, command, enabled, secondary) {
    const tooltip = enabled ? command.tooltip : localize("commandButtonDisabled", "Button not available in restored chat");
    const button = this._register(new Button(container, { ...defaultButtonStyles, supportIcons: true, title: tooltip, secondary }));
    button.label = command.title;
    button.enabled = enabled;
    this._register(button.onDidClick(() => this.commandService.executeCommand(command.id, ...command.arguments ?? [])));
  }
  hasSameContent(other) {
    return other.kind === "command";
  }
};
ChatCommandButtonContentPart = __decorate([
  __param(2, ICommandService)
], ChatCommandButtonContentPart);
export {
  ChatCommandButtonContentPart
};
//# sourceMappingURL=chatCommandContentPart.js.map
