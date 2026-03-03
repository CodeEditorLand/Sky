var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AccessibleContentProvider } from "../../../../../platform/accessibility/browser/accessibleView.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
import { TerminalChatController } from "./terminalChatController.js";
import { IMenuService, MenuItemAction } from "../../../../../platform/actions/common/actions.js";
import { MENU_TERMINAL_CHAT_WIDGET_STATUS, TerminalChatContextKeys } from "./terminalChat.js";
class TerminalInlineChatAccessibleView {
  static {
    __name(this, "TerminalInlineChatAccessibleView");
  }
  constructor() {
    this.priority = 105;
    this.name = "terminalInlineChat";
    this.type = "view";
    this.when = TerminalChatContextKeys.focused;
  }
  getProvider(accessor) {
    const terminalService = accessor.get(ITerminalService);
    const menuService = accessor.get(IMenuService);
    const actions = [];
    const contextKeyService = TerminalChatController.activeChatController?.scopedContextKeyService;
    if (contextKeyService) {
      const menuActions = menuService.getMenuActions(MENU_TERMINAL_CHAT_WIDGET_STATUS, contextKeyService);
      for (const action of menuActions) {
        for (const a of action[1]) {
          if (a instanceof MenuItemAction) {
            actions.push(a);
          }
        }
      }
    }
    const controller = terminalService.activeInstance?.getContribution(TerminalChatController.ID) ?? void 0;
    if (!controller?.lastResponseContent) {
      return;
    }
    const responseContent = controller.lastResponseContent;
    return new AccessibleContentProvider("terminal-chat", {
      type: "view"
      /* AccessibleViewType.View */
    }, () => {
      return responseContent;
    }, () => {
      controller.focus();
    }, "accessibility.verbosity.inlineChat", void 0, actions);
  }
}
export {
  TerminalInlineChatAccessibleView
};
//# sourceMappingURL=terminalChatAccessibleView.js.map
