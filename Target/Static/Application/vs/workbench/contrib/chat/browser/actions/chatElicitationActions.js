var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { isResponseVM } from "../../common/model/chatViewModel.js";
import { IChatWidgetService } from "../chat.js";
import { CHAT_CATEGORY } from "./chatActions.js";
const AcceptElicitationRequestActionId = "workbench.action.chat.acceptElicitation";
class AcceptElicitationRequestAction extends Action2 {
  static {
    __name(this, "AcceptElicitationRequestAction");
  }
  constructor() {
    super({
      id: AcceptElicitationRequestActionId,
      title: localize2("chat.acceptElicitation", "Accept Request"),
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasElicitationRequest),
        primary: 2048 | 3,
        weight: 200 + 1
      }
    });
  }
  async run(accessor) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const items = widget.viewModel?.getItems();
    if (!items?.length) {
      return;
    }
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (!isResponseVM(item)) {
        continue;
      }
      for (const content of item.response.value) {
        if (content.kind === "elicitation2" && content.state.get() === "pending") {
          await content.accept(true);
          widget.focusInput();
          return;
        }
      }
    }
  }
}
function registerChatElicitationActions() {
  registerAction2(AcceptElicitationRequestAction);
}
__name(registerChatElicitationActions, "registerChatElicitationActions");
export {
  AcceptElicitationRequestActionId,
  registerChatElicitationActions
};
//# sourceMappingURL=chatElicitationActions.js.map
