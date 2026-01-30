var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { CHAT_PROVIDER_ID } from "../common/participants/chatParticipantContribTypes.js";
const IChatWidgetService = createDecorator("chatWidgetService");
const ChatViewPaneTarget = /* @__PURE__ */ Symbol("ChatViewPaneTarget");
const IQuickChatService = createDecorator("quickChatService");
const IChatAccessibilityService = createDecorator("chatAccessibilityService");
function isIChatViewViewContext(context) {
  return typeof context.viewId === "string";
}
__name(isIChatViewViewContext, "isIChatViewViewContext");
function isIChatResourceViewContext(context) {
  return !isIChatViewViewContext(context);
}
__name(isIChatResourceViewContext, "isIChatResourceViewContext");
const IChatCodeBlockContextProviderService = createDecorator("chatCodeBlockContextProviderService");
const ChatViewId = `workbench.panel.chat.view.${CHAT_PROVIDER_ID}`;
const ChatViewContainerId = "workbench.panel.chat";
export {
  ChatViewContainerId,
  ChatViewId,
  ChatViewPaneTarget,
  IChatAccessibilityService,
  IChatCodeBlockContextProviderService,
  IChatWidgetService,
  IQuickChatService,
  isIChatResourceViewContext,
  isIChatViewViewContext
};
//# sourceMappingURL=chat.js.map
