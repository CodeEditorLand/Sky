var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { CHAT_PROVIDER_ID } from "../common/chatParticipantContribTypes.js";
const IChatWidgetService = createDecorator("chatWidgetService");
async function showChatView(viewsService) {
  return (await viewsService.openView(ChatViewId))?.widget;
}
__name(showChatView, "showChatView");
function showCopilotView(viewsService, layoutService) {
  if (layoutService.activeContainer !== layoutService.mainContainer) {
    layoutService.mainContainer.focus();
  }
  return showChatView(viewsService);
}
__name(showCopilotView, "showCopilotView");
const IQuickChatService = createDecorator("quickChatService");
const IChatAccessibilityService = createDecorator("chatAccessibilityService");
const IChatCodeBlockContextProviderService = createDecorator("chatCodeBlockContextProviderService");
const ChatViewId = `workbench.panel.chat.view.${CHAT_PROVIDER_ID}`;
export {
  ChatViewId,
  IChatAccessibilityService,
  IChatCodeBlockContextProviderService,
  IChatWidgetService,
  IQuickChatService,
  showChatView,
  showCopilotView
};
//# sourceMappingURL=chat.js.map
