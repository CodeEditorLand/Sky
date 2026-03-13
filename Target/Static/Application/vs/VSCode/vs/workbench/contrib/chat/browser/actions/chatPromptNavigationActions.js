var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { CHAT_CATEGORY } from "./chatActions.js";
import { IChatWidgetService } from "../chat.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { isRequestVM, isResponseVM } from "../../common/model/chatViewModel.js";
function registerChatPromptNavigationActions() {
  registerAction2(class NextUserPromptAction extends Action2 {
    static {
      __name(this, "NextUserPromptAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.nextUserPrompt",
        title: localize2("interactive.nextUserPrompt.label", "Next User Prompt"),
        keybinding: {
          primary: 2048 | 512 | 18,
          weight: 200,
          when: ChatContextKeys.inChatSession
        },
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args) {
      navigateUserPrompts(accessor, false);
    }
  });
  registerAction2(class PreviousUserPromptAction extends Action2 {
    static {
      __name(this, "PreviousUserPromptAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.previousUserPrompt",
        title: localize2("interactive.previousUserPrompt.label", "Previous User Prompt"),
        keybinding: {
          primary: 2048 | 512 | 16,
          weight: 200,
          when: ChatContextKeys.inChatSession
        },
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args) {
      navigateUserPrompts(accessor, true);
    }
  });
}
__name(registerChatPromptNavigationActions, "registerChatPromptNavigationActions");
function navigateUserPrompts(accessor, reverse) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const widget = chatWidgetService.lastFocusedWidget;
  if (!widget) {
    return;
  }
  const items = widget.viewModel?.getItems();
  if (!items || items.length === 0) {
    return;
  }
  const userPrompts = items.filter((item) => isRequestVM(item));
  if (userPrompts.length === 0) {
    return;
  }
  const focused = widget.getFocus();
  let currentIndex = -1;
  if (focused) {
    if (isRequestVM(focused)) {
      currentIndex = userPrompts.findIndex((prompt) => prompt.id === focused.id);
    } else if (isResponseVM(focused)) {
      currentIndex = userPrompts.findIndex((prompt) => prompt.id === focused.requestId);
    }
  }
  let nextIndex;
  if (currentIndex === -1) {
    nextIndex = reverse ? userPrompts.length - 1 : 0;
  } else {
    nextIndex = reverse ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0) {
      nextIndex = 0;
    } else if (nextIndex >= userPrompts.length) {
      nextIndex = userPrompts.length - 1;
    }
    if (nextIndex === currentIndex) {
      return;
    }
  }
  const targetPrompt = userPrompts[nextIndex];
  if (targetPrompt) {
    widget.focus(targetPrompt);
    widget.reveal(targetPrompt);
  }
}
__name(navigateUserPrompts, "navigateUserPrompts");
export {
  registerChatPromptNavigationActions
};
//# sourceMappingURL=chatPromptNavigationActions.js.map
