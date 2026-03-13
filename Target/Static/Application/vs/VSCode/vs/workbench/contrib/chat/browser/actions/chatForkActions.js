var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { revive } from "../../../../../base/common/marshalling.js";
import { URI } from "../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { isChatTreeItem, isRequestVM, isResponseVM } from "../../common/model/chatViewModel.js";
import { CHAT_CATEGORY } from "./chatActions.js";
import { ChatViewPaneTarget, IChatWidgetService } from "../chat.js";
function registerChatForkActions() {
  registerAction2(class ForkConversationAction extends Action2 {
    static {
      __name(this, "ForkConversationAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.forkConversation",
        title: localize2("chat.forkConversation.label", "Fork Conversation"),
        tooltip: localize2("chat.forkConversation.tooltip", "Fork conversation from this point"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.repoForked,
        precondition: ChatContextKeys.enabled,
        menu: [
          {
            id: MenuId.ChatMessageCheckpoint,
            group: "navigation",
            order: 3,
            when: ContextKeyExpr.and(ChatContextKeys.isRequest, ChatContextKeys.lockedToCodingAgent.negate())
          }
        ]
      });
    }
    async run(accessor, ...args) {
      const chatWidgetService = accessor.get(IChatWidgetService);
      const chatService = accessor.get(IChatService);
      const forkedTitlePrefix = localize("chat.forked.titlePrefix", "Forked: ");
      if (URI.isUri(args[0])) {
        const sourceSessionResource = args[0];
        const chatModel2 = chatService.getSession(sourceSessionResource);
        if (!chatModel2) {
          return;
        }
        const serializedData2 = chatModel2.toJSON();
        if (serializedData2.requests.length === 0) {
          return;
        }
        const cleanData = revive(JSON.parse(JSON.stringify(serializedData2)));
        cleanData.sessionId = generateUuid();
        const forkTimestamp = Date.now();
        cleanData.creationDate = forkTimestamp;
        cleanData.customTitle = chatModel2.title.startsWith(forkedTitlePrefix) ? chatModel2.title : localize("chat.forked.title", "Forked: {0}", chatModel2.title);
        for (const [index, req] of cleanData.requests.entries()) {
          req.shouldBeRemovedOnSend = void 0;
          req.isHidden = void 0;
          req.requestId = generateUuid();
          req.responseId = req.responseId ? generateUuid() : void 0;
          req.timestamp = forkTimestamp + index;
          if (req.response) {
            req.modelState = { value: 1, completedAt: forkTimestamp + index };
          }
        }
        const modelRef2 = chatService.loadSessionFromData(cleanData);
        const newSessionResource2 = modelRef2.object.sessionResource;
        setTimeout(async () => {
          try {
            await chatWidgetService.openSession(newSessionResource2, ChatViewPaneTarget);
          } finally {
            modelRef2.dispose();
          }
        }, 0);
        return;
      }
      const arg = args[0];
      let item = isChatTreeItem(arg) ? arg : isChatTreeItem(arg?.element) ? arg.element : isChatTreeItem(arg?.context) ? arg.context : isChatTreeItem(arg?.item) ? arg.item : void 0;
      const widget = item && chatWidgetService.getWidgetBySessionResource(item.sessionResource) || chatWidgetService.lastFocusedWidget;
      if (!isResponseVM(item) && !isRequestVM(item)) {
        item = widget?.getFocus();
      }
      if (!item) {
        return;
      }
      const sessionResource = widget?.viewModel?.sessionResource ?? (isChatTreeItem(item) ? item.sessionResource : void 0);
      if (!sessionResource) {
        return;
      }
      const chatModel = chatService.getSession(sessionResource);
      if (!chatModel) {
        return;
      }
      const targetRequestId = isRequestVM(item) ? item.id : isResponseVM(item) ? item.requestId : void 0;
      if (!targetRequestId) {
        return;
      }
      const serializedData = chatModel.toJSON();
      const isRequestItem = isRequestVM(item);
      let targetIndex = -1;
      if (widget?.viewModel) {
        let requestIndex = -1;
        for (const entry of widget.viewModel.getItems()) {
          if (isRequestVM(entry)) {
            requestIndex += 1;
          }
          if (entry.id === item?.id) {
            targetIndex = isRequestVM(entry) ? Math.max(0, requestIndex - 1) : requestIndex;
            break;
          }
        }
      }
      if (targetIndex < 0) {
        const requestIndex = chatModel.getRequests().findIndex((r) => r.id === targetRequestId);
        targetIndex = isRequestItem ? Math.max(0, requestIndex - 1) : requestIndex;
      }
      if (targetIndex < 0) {
        return;
      }
      const forkedData = revive(JSON.parse(JSON.stringify({
        ...serializedData,
        requests: serializedData.requests.slice(0, targetIndex + 1)
      })));
      forkedData.sessionId = generateUuid();
      const forkedTimestamp = Date.now();
      forkedData.creationDate = forkedTimestamp;
      forkedData.customTitle = chatModel.title.startsWith(forkedTitlePrefix) ? chatModel.title : localize("chat.forked.title", "Forked: {0}", chatModel.title);
      for (const [index, req] of forkedData.requests.entries()) {
        req.shouldBeRemovedOnSend = void 0;
        req.isHidden = void 0;
        req.requestId = generateUuid();
        req.responseId = req.responseId ? generateUuid() : void 0;
        req.timestamp = forkedTimestamp + index;
        if (req.response) {
          req.modelState = { value: 1, completedAt: forkedTimestamp + index };
        }
      }
      const modelRef = chatService.loadSessionFromData(forkedData);
      if (!modelRef) {
        return;
      }
      const newSessionResource = modelRef.object.sessionResource;
      await chatWidgetService.openSession(newSessionResource, ChatViewPaneTarget);
      modelRef.dispose();
    }
  });
}
__name(registerChatForkActions, "registerChatForkActions");
export {
  registerChatForkActions
};
//# sourceMappingURL=chatForkActions.js.map
