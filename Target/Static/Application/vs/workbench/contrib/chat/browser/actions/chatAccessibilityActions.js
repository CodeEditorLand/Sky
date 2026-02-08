var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { localize } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IChatWidgetService } from "../chat.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { isResponseVM } from "../../common/model/chatViewModel.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../../platform/accessibility/common/accessibility.js";
const ACTION_ID_FOCUS_CHAT_CONFIRMATION = "workbench.action.chat.focusConfirmation";
class AnnounceChatConfirmationAction extends Action2 {
  static {
    __name(this, "AnnounceChatConfirmationAction");
  }
  constructor() {
    super({
      id: ACTION_ID_FOCUS_CHAT_CONFIRMATION,
      title: { value: localize("focusChatConfirmation", "Focus Chat Confirmation"), original: "Focus Chat Confirmation" },
      category: { value: localize("chat.category", "Chat"), original: "Chat" },
      precondition: ChatContextKeys.enabled,
      f1: true,
      keybinding: {
        weight: 200,
        primary: 2048 | 31 | 1024,
        when: CONTEXT_ACCESSIBILITY_MODE_ENABLED
      }
    });
  }
  async run(accessor) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const pendingWidget = chatWidgetService.getAllWidgets().find((widget) => widget.viewModel?.model.requestNeedsInput.get());
    if (!pendingWidget) {
      alert(localize("noChatSession", "No active chat session found."));
      return;
    }
    const viewModel = pendingWidget.viewModel;
    if (!viewModel) {
      alert(localize("chatNotReady", "Chat interface not ready."));
      return;
    }
    let firstConfirmationElement;
    const lastResponse = viewModel.getItems()[viewModel.getItems().length - 1];
    if (isResponseVM(lastResponse)) {
      const confirmationWidgets = pendingWidget.domNode.querySelectorAll(".chat-confirmation-widget-container");
      if (confirmationWidgets.length > 0) {
        firstConfirmationElement = confirmationWidgets[0];
      }
    }
    if (firstConfirmationElement) {
      firstConfirmationElement.focus();
    } else {
      alert(localize("noConfirmationRequired", "No chat confirmation required"));
    }
  }
}
function registerChatAccessibilityActions() {
  registerAction2(AnnounceChatConfirmationAction);
}
__name(registerChatAccessibilityActions, "registerChatAccessibilityActions");
export {
  ACTION_ID_FOCUS_CHAT_CONFIRMATION,
  registerChatAccessibilityActions
};
//# sourceMappingURL=chatAccessibilityActions.js.map
