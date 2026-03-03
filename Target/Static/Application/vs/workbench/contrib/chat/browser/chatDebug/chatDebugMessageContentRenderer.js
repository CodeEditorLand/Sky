var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as DOM from "../../../../../base/browser/dom.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { renderCollapsibleSection } from "./chatDebugCollapsible.js";
const $ = DOM.$;
function renderUserMessageContent(event) {
  const disposables = new DisposableStore();
  const container = $("div.chat-debug-message-content");
  container.tabIndex = 0;
  DOM.append(container, $("div.chat-debug-message-content-title", void 0, localize("chatDebug.userMessage", "User Message")));
  DOM.append(container, $("div.chat-debug-message-content-summary", void 0, event.message));
  if (event.sections.length > 0) {
    const sectionsContainer = DOM.append(container, $("div.chat-debug-message-sections"));
    DOM.append(sectionsContainer, $("div.chat-debug-message-sections-label", void 0, localize("chatDebug.promptSections", "Prompt Sections ({0})", event.sections.length)));
    for (const section of event.sections) {
      renderCollapsibleSection(sectionsContainer, section, disposables);
    }
  }
  return { element: container, disposables };
}
__name(renderUserMessageContent, "renderUserMessageContent");
function renderAgentResponseContent(event) {
  const disposables = new DisposableStore();
  const container = $("div.chat-debug-message-content");
  container.tabIndex = 0;
  DOM.append(container, $("div.chat-debug-message-content-title", void 0, localize("chatDebug.agentResponse", "Agent Response")));
  DOM.append(container, $("div.chat-debug-message-content-summary", void 0, event.message));
  if (event.sections.length > 0) {
    const sectionsContainer = DOM.append(container, $("div.chat-debug-message-sections"));
    DOM.append(sectionsContainer, $("div.chat-debug-message-sections-label", void 0, localize("chatDebug.responseSections", "Response Sections ({0})", event.sections.length)));
    for (const section of event.sections) {
      renderCollapsibleSection(sectionsContainer, section, disposables);
    }
  }
  return { element: container, disposables };
}
__name(renderAgentResponseContent, "renderAgentResponseContent");
function messageEventToPlainText(event) {
  const lines = [];
  const label = event.kind === "userMessage" ? localize("chatDebug.userMessage", "User Message") : localize("chatDebug.agentResponse", "Agent Response");
  lines.push(`${label}: ${event.message}`);
  lines.push("");
  for (const section of event.sections) {
    lines.push(`--- ${section.name} ---`);
    lines.push(section.content);
    lines.push("");
  }
  return lines.join("\n");
}
__name(messageEventToPlainText, "messageEventToPlainText");
function renderResolvedMessageContent(content) {
  const disposables = new DisposableStore();
  const container = $("div.chat-debug-message-content");
  container.tabIndex = 0;
  const title = content.type === "user" ? localize("chatDebug.userMessage", "User Message") : localize("chatDebug.agentResponse", "Agent Response");
  DOM.append(container, $("div.chat-debug-message-content-title", void 0, title));
  DOM.append(container, $("div.chat-debug-message-content-summary", void 0, content.message));
  if (content.sections.length > 0) {
    const sectionsContainer = DOM.append(container, $("div.chat-debug-message-sections"));
    const label = content.type === "user" ? localize("chatDebug.promptSections", "Prompt Sections ({0})", content.sections.length) : localize("chatDebug.responseSections", "Response Sections ({0})", content.sections.length);
    DOM.append(sectionsContainer, $("div.chat-debug-message-sections-label", void 0, label));
    for (const section of content.sections) {
      renderCollapsibleSection(sectionsContainer, section, disposables);
    }
  }
  return { element: container, disposables };
}
__name(renderResolvedMessageContent, "renderResolvedMessageContent");
function resolvedMessageToPlainText(content) {
  const lines = [];
  const label = content.type === "user" ? localize("chatDebug.userMessage", "User Message") : localize("chatDebug.agentResponse", "Agent Response");
  lines.push(`${label}: ${content.message}`);
  lines.push("");
  for (const section of content.sections) {
    lines.push(`--- ${section.name} ---`);
    lines.push(section.content);
    lines.push("");
  }
  return lines.join("\n");
}
__name(resolvedMessageToPlainText, "resolvedMessageToPlainText");
export {
  messageEventToPlainText,
  renderAgentResponseContent,
  renderResolvedMessageContent,
  renderUserMessageContent,
  resolvedMessageToPlainText
};
//# sourceMappingURL=chatDebugMessageContentRenderer.js.map
