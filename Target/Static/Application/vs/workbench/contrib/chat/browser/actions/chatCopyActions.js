var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { CHAT_CATEGORY, stringifyItem } from "./chatActions.js";
import { IChatWidgetService } from "../chat.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { isRequestVM, isResponseVM } from "../../common/chatViewModel.js";
function registerChatCopyActions() {
  registerAction2(class CopyAllAction extends Action2 {
    static {
      __name(this, "CopyAllAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.copyAll",
        title: localize2("interactive.copyAll.label", "Copy All"),
        f1: false,
        category: CHAT_CATEGORY,
        menu: {
          id: MenuId.ChatContext,
          when: ChatContextKeys.responseIsFiltered.negate(),
          group: "copy"
        }
      });
    }
    run(accessor, ...args) {
      const clipboardService = accessor.get(IClipboardService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const widget = chatWidgetService.lastFocusedWidget;
      if (widget) {
        const viewModel = widget.viewModel;
        const sessionAsText = viewModel?.getItems().filter((item) => isRequestVM(item) || isResponseVM(item) && !item.errorDetails?.responseIsFiltered).map((item) => stringifyItem(item)).join("\n\n");
        if (sessionAsText) {
          clipboardService.writeText(sessionAsText);
        }
      }
    }
  });
  registerAction2(class CopyItemAction extends Action2 {
    static {
      __name(this, "CopyItemAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.copyItem",
        title: localize2("interactive.copyItem.label", "Copy"),
        f1: false,
        category: CHAT_CATEGORY,
        menu: {
          id: MenuId.ChatContext,
          when: ChatContextKeys.responseIsFiltered.negate(),
          group: "copy"
        }
      });
    }
    run(accessor, ...args) {
      const item = args[0];
      if (!isRequestVM(item) && !isResponseVM(item)) {
        return;
      }
      const clipboardService = accessor.get(IClipboardService);
      const text = stringifyItem(item, false);
      clipboardService.writeText(text);
    }
  });
}
__name(registerChatCopyActions, "registerChatCopyActions");
export {
  registerChatCopyActions
};
//# sourceMappingURL=chatCopyActions.js.map
