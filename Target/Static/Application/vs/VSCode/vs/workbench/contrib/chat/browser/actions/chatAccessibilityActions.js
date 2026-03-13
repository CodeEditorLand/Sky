var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { localize } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IChatWidgetService } from "../chat.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { isResponseVM } from "../../common/model/chatViewModel.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../../platform/accessibility/common/accessibility.js";
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from "../../../../contrib/accessibility/browser/accessibilityConfiguration.js";
import { CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_STORAGE_KEY, isThinkingContentIncludedInAccessibleView } from "../accessibility/chatResponseAccessibleView.js";
const ACTION_ID_FOCUS_CHAT_CONFIRMATION = "workbench.action.chat.focusConfirmation";
const ACTION_ID_TOGGLE_THINKING_CONTENT_ACCESSIBLE_VIEW = "workbench.action.chat.toggleThinkingContentAccessibleView";
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
        when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ChatContextKeys.Editing.hasQuestionCarousel.negate())
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
      if (firstConfirmationElement.contains(pendingWidget.domNode.ownerDocument.activeElement)) {
        pendingWidget.focusInput();
      } else {
        firstConfirmationElement.focus();
      }
    } else {
      alert(localize("noConfirmationRequired", "No chat confirmation required"));
    }
  }
}
class ToggleThinkingContentAccessibleViewAction extends Action2 {
  static {
    __name(this, "ToggleThinkingContentAccessibleViewAction");
  }
  constructor() {
    super({
      id: ACTION_ID_TOGGLE_THINKING_CONTENT_ACCESSIBLE_VIEW,
      title: { value: localize("toggleThinkingContentAccessibleView", "Toggle Thinking Content in Accessible View"), original: "Toggle Thinking Content in Accessible View" },
      category: { value: localize("chat.category", "Chat"), original: "Chat" },
      precondition: ChatContextKeys.enabled,
      f1: true,
      keybinding: {
        primary: 512 | 50,
        weight: 200,
        when: ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(
          accessibleViewCurrentProviderId.key,
          "panelChat"
          /* AccessibleViewProviderId.PanelChat */
        ))
      }
    });
  }
  async run(accessor) {
    const storageService = accessor.get(IStorageService);
    const includeThinking = isThinkingContentIncludedInAccessibleView(storageService);
    const updatedValue = !includeThinking;
    storageService.store(
      CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_STORAGE_KEY,
      updatedValue,
      0,
      0
      /* StorageTarget.USER */
    );
    alert(updatedValue ? localize("thinkingContentShown", "Thinking content will be included in the accessible view.") : localize("thinkingContentHidden", "Thinking content will be hidden from the accessible view."));
  }
}
function registerChatAccessibilityActions() {
  registerAction2(AnnounceChatConfirmationAction);
  registerAction2(ToggleThinkingContentAccessibleViewAction);
}
__name(registerChatAccessibilityActions, "registerChatAccessibilityActions");
export {
  ACTION_ID_FOCUS_CHAT_CONFIRMATION,
  ACTION_ID_TOGGLE_THINKING_CONTENT_ACCESSIBLE_VIEW,
  registerChatAccessibilityActions
};
//# sourceMappingURL=chatAccessibilityActions.js.map
