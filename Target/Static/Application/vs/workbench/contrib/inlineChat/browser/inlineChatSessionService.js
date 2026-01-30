var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ChatViewPaneTarget, IChatWidgetService } from "../../chat/browser/chat.js";
import { IChatService } from "../../chat/common/chatService/chatService.js";
import { ChatAgentLocation } from "../../chat/common/constants.js";
const IInlineChatSessionService = createDecorator("IInlineChatSessionService");
async function moveToPanelChat(accessor, model, resend) {
  const chatService = accessor.get(IChatService);
  const widgetService = accessor.get(IChatWidgetService);
  const widget = await widgetService.revealWidget();
  if (widget && widget.viewModel && model) {
    let lastRequest;
    for (const request of model.getRequests().slice()) {
      await chatService.adoptRequest(widget.viewModel.model.sessionResource, request);
      lastRequest = request;
    }
    if (lastRequest && resend) {
      chatService.resendRequest(lastRequest, { location: widget.location });
    }
    widget.focusResponseItem();
  }
}
__name(moveToPanelChat, "moveToPanelChat");
async function askInPanelChat(accessor, request, state) {
  const widgetService = accessor.get(IChatWidgetService);
  const chatService = accessor.get(IChatService);
  if (!request) {
    return;
  }
  const newModelRef = chatService.startSession(ChatAgentLocation.Chat);
  const newModel = newModelRef.object;
  newModel.inputModel.setState({ ...state });
  const widget = await widgetService.openSession(newModelRef.object.sessionResource, ChatViewPaneTarget);
  newModelRef.dispose();
  widget?.acceptInput(request.message.text);
}
__name(askInPanelChat, "askInPanelChat");
export {
  IInlineChatSessionService,
  askInPanelChat,
  moveToPanelChat
};
//# sourceMappingURL=inlineChatSessionService.js.map
