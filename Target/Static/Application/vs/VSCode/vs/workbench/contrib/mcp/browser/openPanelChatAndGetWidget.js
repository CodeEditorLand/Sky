var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { raceTimeout } from "../../../../base/common/async.js";
import { Event } from "../../../../base/common/event.js";
import { ChatViewId } from "../../chat/browser/chat.js";
import { ChatAgentLocation } from "../../chat/common/constants.js";
async function openPanelChatAndGetWidget(viewsService, chatService) {
  await viewsService.openView(ChatViewId, true);
  const widgets = chatService.getWidgetsByLocations(ChatAgentLocation.Chat);
  if (widgets.length) {
    return widgets[0];
  }
  const eventPromise = Event.toPromise(Event.filter(chatService.onDidAddWidget, (e) => e.location === ChatAgentLocation.Chat));
  return await raceTimeout(
    eventPromise,
    1e4,
    // should be enough time for chat to initialize...
    () => eventPromise.cancel()
  );
}
__name(openPanelChatAndGetWidget, "openPanelChatAndGetWidget");
export {
  openPanelChatAndGetWidget
};
//# sourceMappingURL=openPanelChatAndGetWidget.js.map
