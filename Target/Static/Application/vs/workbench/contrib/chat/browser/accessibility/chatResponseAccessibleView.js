var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { renderAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { Emitter } from "../../../../../base/common/event.js";
import { isMarkdownString } from "../../../../../base/common/htmlContent.js";
import { stripIcons } from "../../../../../base/common/iconLabels.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { migrateLegacyTerminalToolSpecificData } from "../../common/chat.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IChatToolInvocation, isLegacyChatTerminalToolInvocationData } from "../../common/chatService/chatService.js";
import { isResponseVM } from "../../common/model/chatViewModel.js";
import { isToolResultInputOutputDetails, isToolResultOutputDetails, toolContentToA11yString } from "../../common/tools/languageModelToolsService.js";
import { IChatWidgetService } from "../chat.js";
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
      widget.focusResponseItem();
    }
    const verifiedWidget = widget;
    const focusedItem = verifiedWidget.getFocus();
    if (!focusedItem) {
      return;
    }
    return new ChatResponseAccessibleProvider(verifiedWidget, focusedItem, chatInputFocused);
  }
}
function isOutputDetailsSerialized(obj) {
  return typeof obj === "object" && obj !== null && "output" in obj && typeof obj.output === "object" && obj.output?.type === "data" && typeof obj.output?.base64Data === "string";
}
__name(isOutputDetailsSerialized, "isOutputDetailsSerialized");
function getToolSpecificDataDescription(toolSpecificData) {
  if (!toolSpecificData) {
    return "";
  }
  if (isLegacyChatTerminalToolInvocationData(toolSpecificData) || toolSpecificData.kind === "terminal") {
    const terminalData = migrateLegacyTerminalToolSpecificData(toolSpecificData);
    return terminalData.commandLine.userEdited ?? terminalData.commandLine.toolEdited ?? terminalData.commandLine.original;
  }
  switch (toolSpecificData.kind) {
    case "subagent": {
      const parts = [];
      if (toolSpecificData.agentName) {
        parts.push(localize("subagentName", "Agent: {0}", toolSpecificData.agentName));
      }
      if (toolSpecificData.description) {
        parts.push(toolSpecificData.description);
      }
      if (toolSpecificData.prompt) {
        parts.push(localize("subagentPrompt", "Task: {0}", toolSpecificData.prompt));
      }
      return parts.join(". ") || "";
    }
    case "extensions":
      return toolSpecificData.extensions.length > 0 ? localize("extensionsList", "Extensions: {0}", toolSpecificData.extensions.join(", ")) : "";
    case "todoList": {
      const todos = toolSpecificData.todoList;
      if (todos.length === 0) {
        return "";
      }
      const todoDescriptions = todos.map((t) => localize("todoItem", "{0} ({1})", t.title, t.status));
      return localize("todoListCount", "{0} items: {1}", todos.length, todoDescriptions.join("; "));
    }
    case "pullRequest":
      return localize("pullRequestInfo", "PR: {0} by {1}", toolSpecificData.title, toolSpecificData.author);
    case "input":
      return typeof toolSpecificData.rawInput === "string" ? toolSpecificData.rawInput : JSON.stringify(toolSpecificData.rawInput);
    default:
      return "";
  }
}
__name(getToolSpecificDataDescription, "getToolSpecificDataDescription");
function getResultDetailsDescription(resultDetails) {
  if (!resultDetails) {
    return {};
  }
  if (Array.isArray(resultDetails)) {
    const files = resultDetails.map((ref) => {
      if (URI.isUri(ref)) {
        return ref.fsPath || ref.path;
      }
      return ref.uri.fsPath || ref.uri.path;
    });
    return { files };
  }
  if (isToolResultInputOutputDetails(resultDetails)) {
    return {
      input: resultDetails.input,
      isError: resultDetails.isError
    };
  }
  if (isOutputDetailsSerialized(resultDetails)) {
    return {
      input: localize("binaryOutput", "{0} data", resultDetails.output.mimeType)
    };
  }
  if (isToolResultOutputDetails(resultDetails)) {
    return {
      input: localize("binaryOutput", "{0} data", resultDetails.output.mimeType)
    };
  }
  return {};
}
__name(getResultDetailsDescription, "getResultDetailsDescription");
function getToolInvocationA11yDescription(invocationMessage, pastTenseMessage, toolSpecificData, resultDetails, isComplete) {
  const parts = [];
  const message = isComplete && pastTenseMessage ? pastTenseMessage : invocationMessage;
  if (message) {
    parts.push(message);
  }
  const toolDataDesc = getToolSpecificDataDescription(toolSpecificData);
  if (toolDataDesc) {
    parts.push(toolDataDesc);
  }
  if (isComplete && resultDetails) {
    const details = getResultDetailsDescription(resultDetails);
    if (details.isError) {
      parts.unshift(localize("errored", "Errored"));
    }
    if (details.input && !toolDataDesc) {
      parts.push(localize("input", "Input: {0}", details.input));
    }
    if (details.files && details.files.length > 0) {
      parts.push(localize("files", "Files: {0}", details.files.join(", ")));
    }
  }
  return parts.join(". ");
}
__name(getToolInvocationA11yDescription, "getToolInvocationA11yDescription");
class ChatResponseAccessibleProvider extends Disposable {
  static {
    __name(this, "ChatResponseAccessibleProvider");
  }
  constructor(_widget, item, _wasOpenedFromInput) {
    super();
    this._widget = _widget;
    this._wasOpenedFromInput = _wasOpenedFromInput;
    this._focusedItemDisposables = this._register(new DisposableStore());
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this.id = "panelChat";
    this.verbositySettingKey = "accessibility.verbosity.panelChat";
    this.options = {
      type: "view"
      /* AccessibleViewType.View */
    };
    this._setFocusedItem(item);
  }
  provideContent() {
    return this._getContent(this._focusedItem);
  }
  _setFocusedItem(item) {
    this._focusedItem = item;
    this._focusedItemDisposables.clear();
    if (isResponseVM(item)) {
      this._focusedItemDisposables.add(item.model.onDidChange(() => this._onDidChangeContent.fire()));
    }
  }
  _renderMessageAsPlaintext(message) {
    return typeof message === "string" ? message : stripIcons(renderAsPlaintext(message, { useLinkFormatter: true }));
  }
  _getContent(item) {
    const contentParts = [];
    if (!isResponseVM(item)) {
      return "";
    }
    if ("errorDetails" in item && item.errorDetails) {
      contentParts.push(item.errorDetails.message);
    }
    for (const part of item.response.value) {
      switch (part.kind) {
        case "thinking": {
          const thinkingValue = Array.isArray(part.value) ? part.value.join("") : part.value || "";
          const trimmed = thinkingValue.trim();
          if (trimmed) {
            contentParts.push(localize("thinkingContent", "Thinking: {0}", trimmed));
          }
          break;
        }
        case "markdownContent": {
          const text = renderAsPlaintext(part.content, { includeCodeBlocksFences: true, useLinkFormatter: true });
          if (text.trim()) {
            contentParts.push(text);
          }
          break;
        }
        case "elicitation2":
        case "elicitationSerialized": {
          const title = part.title;
          let elicitationContent = "";
          if (typeof title === "string") {
            elicitationContent += `${title}
`;
          } else if (isMarkdownString(title)) {
            elicitationContent += renderAsPlaintext(title, { includeCodeBlocksFences: true }) + "\n";
          }
          const message = part.message;
          if (isMarkdownString(message)) {
            elicitationContent += renderAsPlaintext(message, { includeCodeBlocksFences: true });
          } else {
            elicitationContent += message;
          }
          if (elicitationContent.trim()) {
            contentParts.push(elicitationContent);
          }
          break;
        }
        case "toolInvocation": {
          const state = part.state.get();
          if (state.type === 1 && state.confirmationMessages?.title) {
            const title = this._renderMessageAsPlaintext(state.confirmationMessages.title);
            const message = state.confirmationMessages.message ? this._renderMessageAsPlaintext(state.confirmationMessages.message) : "";
            const toolDataDesc = getToolSpecificDataDescription(part.toolSpecificData);
            let toolContent = title;
            if (toolDataDesc) {
              toolContent += `: ${toolDataDesc}`;
            }
            if (message) {
              toolContent += `
${message}`;
            }
            contentParts.push(toolContent);
          } else if (state.type === 3) {
            const postApprovalDetails = isToolResultInputOutputDetails(state.resultDetails) ? state.resultDetails.input : isToolResultOutputDetails(state.resultDetails) ? void 0 : toolContentToA11yString(state.contentForModel);
            contentParts.push(localize("toolPostApprovalA11yView", "Approve results of {0}? Result: ", part.toolId) + (postApprovalDetails ?? ""));
          } else {
            const resultDetails = IChatToolInvocation.resultDetails(part);
            const isComplete = IChatToolInvocation.isComplete(part);
            const description = getToolInvocationA11yDescription(this._renderMessageAsPlaintext(part.invocationMessage), part.pastTenseMessage ? this._renderMessageAsPlaintext(part.pastTenseMessage) : void 0, part.toolSpecificData, resultDetails, isComplete);
            if (description) {
              contentParts.push(description);
            }
          }
          break;
        }
        case "toolInvocationSerialized": {
          const description = getToolInvocationA11yDescription(this._renderMessageAsPlaintext(part.invocationMessage), part.pastTenseMessage ? this._renderMessageAsPlaintext(part.pastTenseMessage) : void 0, part.toolSpecificData, part.resultDetails, part.isComplete);
          if (description) {
            contentParts.push(description);
          }
          break;
        }
      }
    }
    return this._normalizeWhitespace(contentParts.join("\n"));
  }
  _normalizeWhitespace(content) {
    const lines = content.split(/\r?\n/);
    const normalized = [];
    for (const line of lines) {
      if (line.trim().length === 0) {
        continue;
      }
      normalized.push(line);
    }
    return normalized.join("\n");
  }
  onClose() {
    this._widget.reveal(this._focusedItem);
    if (this._wasOpenedFromInput) {
      this._widget.focusInput();
    } else {
      this._widget.focus(this._focusedItem);
    }
  }
  provideNextContent() {
    const next = this._widget.getSibling(this._focusedItem, "next");
    if (next) {
      this._setFocusedItem(next);
      return this._getContent(next);
    }
    return;
  }
  providePreviousContent() {
    const previous = this._widget.getSibling(this._focusedItem, "previous");
    if (previous) {
      this._setFocusedItem(previous);
      return this._getContent(previous);
    }
    return;
  }
}
export {
  ChatResponseAccessibleView,
  getResultDetailsDescription,
  getToolInvocationA11yDescription,
  getToolSpecificDataDescription
};
//# sourceMappingURL=chatResponseAccessibleView.js.map
