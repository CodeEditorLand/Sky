var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize2 } from "../../../../../nls.js";
import { Categories } from "../../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { IChatService } from "../../common/chatService.js";
import { IChatWidgetService } from "../chat.js";
function registerChatDeveloperActions() {
  registerAction2(LogChatInputHistoryAction);
  registerAction2(LogChatIndexAction);
}
__name(registerChatDeveloperActions, "registerChatDeveloperActions");
class LogChatInputHistoryAction extends Action2 {
  static {
    __name(this, "LogChatInputHistoryAction");
  }
  static {
    this.ID = "workbench.action.chat.logInputHistory";
  }
  constructor() {
    super({
      id: LogChatInputHistoryAction.ID,
      title: localize2("workbench.action.chat.logInputHistory.label", "Log Chat Input History"),
      icon: Codicon.attach,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    chatWidgetService.lastFocusedWidget?.logInputHistory();
  }
}
class LogChatIndexAction extends Action2 {
  static {
    __name(this, "LogChatIndexAction");
  }
  static {
    this.ID = "workbench.action.chat.logChatIndex";
  }
  constructor() {
    super({
      id: LogChatIndexAction.ID,
      title: localize2("workbench.action.chat.logChatIndex.label", "Log Chat Index"),
      icon: Codicon.attach,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args) {
    const chatService = accessor.get(IChatService);
    chatService.logChatIndex();
  }
}
export {
  registerChatDeveloperActions
};
//# sourceMappingURL=chatDeveloperActions.js.map
