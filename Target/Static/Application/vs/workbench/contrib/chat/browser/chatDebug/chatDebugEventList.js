var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "../../../../../base/browser/dom.js";
import { localize } from "../../../../../nls.js";
import { ChatDebugLogLevel } from "../../common/chatDebugService.js";
import { safeIntl } from "../../../../../base/common/date.js";
const $ = DOM.$;
function safeStr(value, fallback = "") {
  if (value === null || value === void 0 || typeof value !== "string") {
    return fallback;
  }
  return value;
}
__name(safeStr, "safeStr");
const dateFormatter = safeIntl.DateTimeFormat(void 0, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
});
function renderEventToTemplate(element, templateData) {
  templateData.created.textContent = dateFormatter.value.format(element.created);
  switch (element.kind) {
    case "toolCall":
      templateData.name.textContent = safeStr(element.toolName, localize("chatDebug.unknownEvent", "(unknown)"));
      templateData.details.textContent = safeStr(element.result);
      break;
    case "modelTurn":
      templateData.name.textContent = safeStr(element.model) || localize("chatDebug.modelTurn", "Model Turn");
      templateData.details.textContent = [
        safeStr(element.requestName),
        element.totalTokens !== void 0 ? localize("chatDebug.tokens", "{0} tokens", element.totalTokens) : ""
      ].filter(Boolean).join(" \xB7 ");
      break;
    case "generic":
      templateData.name.textContent = safeStr(element.name, localize("chatDebug.unknownEvent", "(unknown)"));
      templateData.details.textContent = safeStr(element.details);
      break;
    case "subagentInvocation":
      templateData.name.textContent = safeStr(element.agentName, localize("chatDebug.unknownEvent", "(unknown)"));
      templateData.details.textContent = safeStr(element.description) || safeStr(element.status);
      break;
    case "userMessage":
      templateData.name.textContent = localize("chatDebug.userMessage", "User Message");
      templateData.details.textContent = safeStr(element.message);
      break;
    case "agentResponse":
      templateData.name.textContent = localize("chatDebug.agentResponse", "Agent Response");
      templateData.details.textContent = safeStr(element.message);
      break;
  }
  const isError = element.kind === "generic" && element.level === ChatDebugLogLevel.Error || element.kind === "toolCall" && element.result === "error";
  const isWarning = element.kind === "generic" && element.level === ChatDebugLogLevel.Warning;
  const isTrace = element.kind === "generic" && element.level === ChatDebugLogLevel.Trace;
  templateData.container.classList.toggle("chat-debug-log-error", isError);
  templateData.container.classList.toggle("chat-debug-log-warning", isWarning);
  templateData.container.classList.toggle("chat-debug-log-trace", isTrace);
}
__name(renderEventToTemplate, "renderEventToTemplate");
function createEventTemplate(container) {
  container.classList.add("chat-debug-log-row");
  const created = DOM.append(container, $("span.chat-debug-log-created"));
  const name = DOM.append(container, $("span.chat-debug-log-name"));
  const details = DOM.append(container, $("span.chat-debug-log-details"));
  return { container, created, name, details };
}
__name(createEventTemplate, "createEventTemplate");
class ChatDebugEventRenderer {
  static {
    __name(this, "ChatDebugEventRenderer");
  }
  static {
    this.TEMPLATE_ID = "chatDebugEvent";
  }
  get templateId() {
    return ChatDebugEventRenderer.TEMPLATE_ID;
  }
  renderTemplate(container) {
    return createEventTemplate(container);
  }
  renderElement(element, index, templateData) {
    renderEventToTemplate(element, templateData);
  }
  disposeTemplate(_templateData) {
  }
}
class ChatDebugEventDelegate {
  static {
    __name(this, "ChatDebugEventDelegate");
  }
  getHeight(_element) {
    return 28;
  }
  getTemplateId(_element) {
    return ChatDebugEventRenderer.TEMPLATE_ID;
  }
}
class ChatDebugEventTreeRenderer {
  static {
    __name(this, "ChatDebugEventTreeRenderer");
  }
  static {
    this.TEMPLATE_ID = "chatDebugEvent";
  }
  get templateId() {
    return ChatDebugEventTreeRenderer.TEMPLATE_ID;
  }
  renderTemplate(container) {
    return createEventTemplate(container);
  }
  renderElement(node, index, templateData) {
    renderEventToTemplate(node.element, templateData);
  }
  disposeTemplate(_templateData) {
  }
}
export {
  ChatDebugEventDelegate,
  ChatDebugEventRenderer,
  ChatDebugEventTreeRenderer
};
//# sourceMappingURL=chatDebugEventList.js.map
