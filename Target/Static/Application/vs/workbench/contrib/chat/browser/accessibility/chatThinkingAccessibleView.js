var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AccessibleContentProvider } from "../../../../../platform/accessibility/browser/accessibleView.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IChatWidgetService } from "../chat.js";
import { isResponseVM } from "../../common/model/chatViewModel.js";
class ChatThinkingAccessibleView {
  static {
    __name(this, "ChatThinkingAccessibleView");
  }
  constructor() {
    this.priority = 105;
    this.name = "chatThinking";
    this.type = "view";
    this.when = ContextKeyExpr.false();
  }
  getProvider(accessor) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const viewModel = widget.viewModel;
    if (!viewModel) {
      return;
    }
    const items = viewModel.getItems();
    const latestResponse = [...items].reverse().find((item) => isResponseVM(item));
    if (!latestResponse || !isResponseVM(latestResponse)) {
      return;
    }
    const thinkingContent = this._extractThinkingContent(latestResponse);
    if (!thinkingContent) {
      return;
    }
    return new AccessibleContentProvider(
      "chatThinking",
      { type: "view", id: "chatThinking", language: "markdown" },
      () => thinkingContent,
      () => widget.focusInput(),
      "accessibility.verbosity.panelChat"
      /* AccessibilityVerbositySettingId.Chat */
    );
  }
  _extractThinkingContent(response) {
    const thinkingParts = [];
    for (const part of response.response.value) {
      if (part.kind === "thinking") {
        const value = Array.isArray(part.value) ? part.value.join("") : part.value || "";
        const trimmed = value.trim();
        if (trimmed) {
          thinkingParts.push(trimmed);
        }
      }
    }
    if (thinkingParts.length === 0) {
      return void 0;
    }
    return thinkingParts.join("\n\n");
  }
}
export {
  ChatThinkingAccessibleView
};
//# sourceMappingURL=chatThinkingAccessibleView.js.map
