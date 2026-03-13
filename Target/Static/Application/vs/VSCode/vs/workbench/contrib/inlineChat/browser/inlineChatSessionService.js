var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { IChatService } from "../../chat/common/chatService/chatService.js";
import { ChatAgentLocation, ChatModeKind } from "../../chat/common/constants.js";
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
  const newModelRef = chatService.startNewLocalSession(ChatAgentLocation.Chat);
  const newModel = newModelRef.object;
  newModel.inputModel.setState({
    ...state,
    mode: { id: "agent", kind: ChatModeKind.Agent }
  });
  const widget = await widgetService.openSession(newModelRef.object.sessionResource);
  newModelRef.dispose();
  widget?.acceptInput(request.message.text);
}
__name(askInPanelChat, "askInPanelChat");
async function continueInPanelChat(accessor, session) {
  const request = session.chatModel.getRequests().at(-1);
  if (!request) {
    return;
  }
  await askInPanelChat(accessor, request, session.chatModel.inputModel.state.get());
  session.dispose();
}
__name(continueInPanelChat, "continueInPanelChat");
function rephraseInlineChat(accessor, session) {
  const request = session.chatModel.getRequests().at(-1);
  if (!request) {
    return void 0;
  }
  accessor.get(IChatService).removeRequest(session.chatModel.sessionResource, request.id);
  session.chatModel.inputModel.setState({ inputText: request.message.text });
  session.setTerminationState(void 0);
  return request.message.text;
}
__name(rephraseInlineChat, "rephraseInlineChat");
export {
  IInlineChatSessionService,
  askInPanelChat,
  continueInPanelChat,
  moveToPanelChat,
  rephraseInlineChat
};
//# sourceMappingURL=inlineChatSessionService.js.map
