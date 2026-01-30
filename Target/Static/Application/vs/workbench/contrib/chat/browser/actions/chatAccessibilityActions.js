var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { localize } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IChatWidgetService } from "../chat.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { isResponseVM } from "../../common/model/chatViewModel.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../../platform/accessibility/common/accessibility.js";
import { IAccessibleViewService } from "../../../../../platform/accessibility/browser/accessibleView.js";
import { ChatThinkingAccessibleView } from "../accessibility/chatThinkingAccessibleView.js";
import { CHAT_CATEGORY } from "./chatActions.js";
const ACTION_ID_FOCUS_CHAT_CONFIRMATION = "workbench.action.chat.focusConfirmation";
const ACTION_ID_OPEN_THINKING_ACCESSIBLE_VIEW = "workbench.action.chat.openThinkingAccessibleView";
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
class OpenThinkingAccessibleViewAction extends Action2 {
  static {
    __name(this, "OpenThinkingAccessibleViewAction");
  }
  constructor() {
    super({
      id: ACTION_ID_OPEN_THINKING_ACCESSIBLE_VIEW,
      title: { value: localize("openThinkingAccessibleView", "Open Thinking Accessible View"), original: "Open Thinking Accessible View" },
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.enabled,
      f1: true,
      keybinding: {
        weight: 200,
        primary: 512 | 1024 | 60,
        linux: {
          primary: 512 | 1024 | 61
        },
        when: ChatContextKeys.inChatSession
      }
    });
  }
  async run(accessor) {
    const accessibleViewService = accessor.get(IAccessibleViewService);
    const instantiationService = accessor.get(IInstantiationService);
    const thinkingView = new ChatThinkingAccessibleView();
    const provider = instantiationService.invokeFunction(thinkingView.getProvider.bind(thinkingView));
    if (!provider) {
      alert(localize("noThinking", "No thinking"));
      return;
    }
    accessibleViewService.show(provider);
  }
}
function registerChatAccessibilityActions() {
  registerAction2(AnnounceChatConfirmationAction);
  registerAction2(OpenThinkingAccessibleViewAction);
}
__name(registerChatAccessibilityActions, "registerChatAccessibilityActions");
export {
  ACTION_ID_FOCUS_CHAT_CONFIRMATION,
  ACTION_ID_OPEN_THINKING_ACCESSIBLE_VIEW,
  registerChatAccessibilityActions
};
//# sourceMappingURL=chatAccessibilityActions.js.map
