var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { renderMarkdownAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ChatContextKeys } from "../common/chatContextKeys.js";
import { isResponseVM } from "../common/chatViewModel.js";
import { IChatWidgetService } from "./chat.js";
class ChatResponseAccessibleView {
  static {
    __name(this, "ChatResponseAccessibleView");
  }
  constructor() {
    this.priority = 100;
    this.name = "panelChat";
    this.type = "view";
    this.when = ChatContextKeys.inChatSession;
  }
  getProvider(accessor) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const chatInputFocused = widget.hasInputFocus();
    if (chatInputFocused) {
      widget.focusLastMessage();
    }
    const verifiedWidget = widget;
    const focusedItem = verifiedWidget.getFocus();
    if (!focusedItem) {
      return;
    }
    return new ChatResponseAccessibleProvider(verifiedWidget, focusedItem, chatInputFocused);
  }
}
class ChatResponseAccessibleProvider extends Disposable {
  static {
    __name(this, "ChatResponseAccessibleProvider");
  }
  constructor(_widget, item, _chatInputFocused) {
    super();
    this._widget = _widget;
    this._chatInputFocused = _chatInputFocused;
    this.id = "panelChat";
    this.verbositySettingKey = "accessibility.verbosity.panelChat";
    this.options = {
      type: "view"
      /* AccessibleViewType.View */
    };
    this._focusedItem = item;
  }
  provideContent() {
    return this._getContent(this._focusedItem);
  }
  _getContent(item) {
    let responseContent = isResponseVM(item) ? item.response.toString() : "";
    if (!responseContent && "errorDetails" in item && item.errorDetails) {
      responseContent = item.errorDetails.message;
    }
    if (isResponseVM(item)) {
      const toolInvocations = item.response.value.filter((item2) => item2.kind === "toolInvocation");
      for (const toolInvocation of toolInvocations) {
        if (toolInvocation.confirmationMessages) {
          const title = typeof toolInvocation.confirmationMessages.title === "string" ? toolInvocation.confirmationMessages.title : toolInvocation.confirmationMessages.title.value;
          const message = typeof toolInvocation.confirmationMessages.message === "string" ? toolInvocation.confirmationMessages.message : stripIcons(renderMarkdownAsPlaintext(toolInvocation.confirmationMessages.message));
          let input = "";
          if (toolInvocation.toolSpecificData) {
            input = toolInvocation.toolSpecificData?.kind === "terminal" ? toolInvocation.toolSpecificData.command : input = toolInvocation.toolSpecificData?.kind === "extensions" ? JSON.stringify(toolInvocation.toolSpecificData.extensions) : JSON.stringify(toolInvocation.toolSpecificData.rawInput);
          }
          responseContent += `${title}`;
          if (input) {
            responseContent += `: ${input}`;
          }
          responseContent += `
${message}
`;
        } else if (toolInvocation.isComplete && toolInvocation.resultDetails && "input" in toolInvocation.resultDetails) {
          responseContent += "\n" + toolInvocation.resultDetails.isError ? "Errored " : "Completed ";
          responseContent += `${`${typeof toolInvocation.invocationMessage === "string" ? toolInvocation.invocationMessage : stripIcons(renderMarkdownAsPlaintext(toolInvocation.invocationMessage))} with input: ${toolInvocation.resultDetails.input}`}
`;
        }
      }
      const pastConfirmations = item.response.value.filter((item2) => item2.kind === "toolInvocationSerialized");
      for (const pastConfirmation of pastConfirmations) {
        if (pastConfirmation.isComplete && pastConfirmation.resultDetails && "input" in pastConfirmation.resultDetails) {
          if (pastConfirmation.pastTenseMessage) {
            responseContent += `
${`${typeof pastConfirmation.pastTenseMessage === "string" ? pastConfirmation.pastTenseMessage : stripIcons(renderMarkdownAsPlaintext(pastConfirmation.pastTenseMessage))} with input: ${pastConfirmation.resultDetails.input}`}
`;
          }
        }
      }
    }
    return renderMarkdownAsPlaintext(new MarkdownString(responseContent), true);
  }
  onClose() {
    this._widget.reveal(this._focusedItem);
    if (this._chatInputFocused) {
      this._widget.focusInput();
    } else {
      this._widget.focus(this._focusedItem);
    }
  }
  provideNextContent() {
    const next = this._widget.getSibling(this._focusedItem, "next");
    if (next) {
      this._focusedItem = next;
      return this._getContent(next);
    }
    return;
  }
  providePreviousContent() {
    const previous = this._widget.getSibling(this._focusedItem, "previous");
    if (previous) {
      this._focusedItem = previous;
      return this._getContent(previous);
    }
    return;
  }
}
export {
  ChatResponseAccessibleView
};
//# sourceMappingURL=chatResponseAccessibleView.js.map
