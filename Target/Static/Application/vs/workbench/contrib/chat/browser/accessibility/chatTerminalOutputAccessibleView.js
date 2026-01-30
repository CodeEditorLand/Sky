var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AccessibleContentProvider } from "../../../../../platform/accessibility/browser/accessibleView.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { ITerminalChatService } from "../../../terminal/browser/terminal.js";
class ChatTerminalOutputAccessibleView {
  static {
    __name(this, "ChatTerminalOutputAccessibleView");
  }
  constructor() {
    this.priority = 115;
    this.name = "chatTerminalOutput";
    this.type = "view";
    this.when = ChatContextKeys.inChatTerminalToolOutput;
  }
  getProvider(accessor) {
    const terminalChatService = accessor.get(ITerminalChatService);
    const part = terminalChatService.getFocusedProgressPart();
    if (!part) {
      return;
    }
    const content = part.getCommandAndOutputAsText();
    if (!content) {
      return;
    }
    return new AccessibleContentProvider(
      "chatTerminalOutput",
      { type: "view", id: "chatTerminalOutput", language: "text" },
      () => content,
      () => part.focusOutput(),
      "accessibility.verbosity.terminalChatOutput"
      /* AccessibilityVerbositySettingId.TerminalChatOutput */
    );
  }
}
export {
  ChatTerminalOutputAccessibleView
};
//# sourceMappingURL=chatTerminalOutputAccessibleView.js.map
