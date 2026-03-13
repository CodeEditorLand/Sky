var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { ChatConfiguration } from "../../common/constants.js";
import { isRequestVM } from "../../common/model/chatViewModel.js";
import { IChatWidgetService } from "../chat.js";
import { CHAT_CATEGORY } from "./chatActions.js";
const editingQueue = ChatContextKeys.editingRequestType.isEqualTo(
  "q"
  /* ChatContextKeys.EditingRequestType.Queue */
);
const editingSteer = ChatContextKeys.editingRequestType.isEqualTo(
  "st"
  /* ChatContextKeys.EditingRequestType.Steer */
);
const editingQueueOrSteer = ContextKeyExpr.or(editingQueue, editingSteer);
const queuingActionsPresent = ContextKeyExpr.and(ContextKeyExpr.or(ChatContextKeys.requestInProgress, editingQueueOrSteer), ChatContextKeys.editingRequestType.notEqualsTo(
  "s"
  /* ChatContextKeys.EditingRequestType.Sent */
));
const steerIsDefault = ContextKeyExpr.equals(`config.${ChatConfiguration.RequestQueueingDefaultAction}`, "steer");
const queueIsDefault = steerIsDefault.negate();
const effectiveDefaultIsQueue = ContextKeyExpr.or(ContextKeyExpr.and(queueIsDefault, editingQueueOrSteer.negate()), editingQueue);
const effectiveDefaultIsSteer = ContextKeyExpr.or(ContextKeyExpr.and(steerIsDefault, editingQueueOrSteer.negate()), editingSteer);
function isRemovePendingRequestContext(context) {
  return !!context && typeof context === "object" && "sessionResource" in context && "pendingRequestId" in context && URI.isUri(context.sessionResource) && typeof context.pendingRequestId === "string";
}
__name(isRemovePendingRequestContext, "isRemovePendingRequestContext");
class ChatQueueMessageAction extends Action2 {
  static {
    __name(this, "ChatQueueMessageAction");
  }
  static {
    this.ID = "workbench.action.chat.queueMessage";
  }
  constructor() {
    super({
      id: ChatQueueMessageAction.ID,
      title: localize2("chat.queueMessage", "Add to Queue"),
      tooltip: localize("chat.queueMessage.tooltip", "Queue this message to send after the current request completes"),
      icon: Codicon.add,
      f1: false,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(queuingActionsPresent, ChatContextKeys.inputHasText),
      keybinding: [{
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, queuingActionsPresent, effectiveDefaultIsSteer),
        primary: 512 | 3,
        weight: 100 + 1
      }, {
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, queuingActionsPresent, effectiveDefaultIsQueue),
        primary: 3,
        weight: 100 + 1
      }]
    });
  }
  run(accessor, ...args) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (!widget?.viewModel) {
      return;
    }
    const inputValue = widget.getInput();
    if (!inputValue.trim()) {
      return;
    }
    widget.acceptInput(void 0, {
      queue: "queued"
      /* ChatRequestQueueKind.Queued */
    });
  }
}
class ChatSteerWithMessageAction extends Action2 {
  static {
    __name(this, "ChatSteerWithMessageAction");
  }
  static {
    this.ID = "workbench.action.chat.steerWithMessage";
  }
  constructor() {
    super({
      id: ChatSteerWithMessageAction.ID,
      title: localize2("chat.steerWithMessage", "Steer with Message"),
      tooltip: localize("chat.steerWithMessage.tooltip", "Send this message at the next opportunity, signaling the current request to yield"),
      icon: Codicon.arrowUp,
      f1: false,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(queuingActionsPresent, ChatContextKeys.inputHasText),
      keybinding: [{
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, queuingActionsPresent, effectiveDefaultIsSteer),
        primary: 3,
        weight: 100 + 1
      }, {
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, queuingActionsPresent, effectiveDefaultIsQueue),
        primary: 512 | 3,
        weight: 100 + 1
      }]
    });
  }
  run(accessor, ...args) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (!widget?.viewModel) {
      return;
    }
    const inputValue = widget.getInput();
    if (!inputValue.trim()) {
      return;
    }
    widget.acceptInput(void 0, {
      queue: "steering"
      /* ChatRequestQueueKind.Steering */
    });
  }
}
class ChatRemovePendingRequestAction extends Action2 {
  static {
    __name(this, "ChatRemovePendingRequestAction");
  }
  static {
    this.ID = "workbench.action.chat.removePendingRequest";
  }
  constructor() {
    super({
      id: ChatRemovePendingRequestAction.ID,
      title: localize2("chat.removePendingRequest", "Remove from Queue"),
      icon: Codicon.close,
      f1: false,
      category: CHAT_CATEGORY,
      menu: [{
        id: MenuId.ChatMessageTitle,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.and(ChatContextKeys.isRequest, ChatContextKeys.isPendingRequest)
      }]
    });
  }
  run(accessor, ...args) {
    const chatService = accessor.get(IChatService);
    const [context] = args;
    if (isRequestVM(context) && context.pendingKind) {
      chatService.removePendingRequest(context.sessionResource, context.id);
      return;
    }
    if (isRemovePendingRequestContext(context)) {
      chatService.removePendingRequest(context.sessionResource, context.pendingRequestId);
      return;
    }
  }
}
class ChatSendPendingImmediatelyAction extends Action2 {
  static {
    __name(this, "ChatSendPendingImmediatelyAction");
  }
  static {
    this.ID = "workbench.action.chat.sendPendingImmediately";
  }
  constructor() {
    super({
      id: ChatSendPendingImmediatelyAction.ID,
      title: localize2("chat.sendPendingImmediately", "Send Immediately"),
      icon: Codicon.arrowUp,
      f1: false,
      category: CHAT_CATEGORY,
      menu: [{
        id: MenuId.ChatMessageTitle,
        group: "navigation",
        order: 3,
        when: ContextKeyExpr.and(ChatContextKeys.isRequest, ChatContextKeys.isPendingRequest)
      }]
    });
  }
  async run(accessor, ...args) {
    const chatService = accessor.get(IChatService);
    const widgetService = accessor.get(IChatWidgetService);
    const [context] = args;
    if (!isRequestVM(context) || !context.pendingKind) {
      return;
    }
    const widget = widgetService.getWidgetBySessionResource(context.sessionResource);
    const model = widget?.viewModel?.model;
    if (!model) {
      return;
    }
    const pendingRequests = model.getPendingRequests();
    const targetIndex = pendingRequests.findIndex((r) => r.request.id === context.id);
    if (targetIndex === -1) {
      return;
    }
    const targetRequest = pendingRequests[targetIndex];
    const reordered = [
      { requestId: targetRequest.request.id, kind: targetRequest.kind },
      ...pendingRequests.filter((_, i) => i !== targetIndex).map((r) => ({ requestId: r.request.id, kind: r.kind }))
    ];
    chatService.setPendingRequests(context.sessionResource, reordered);
    await chatService.cancelCurrentRequestForSession(context.sessionResource, "queueRunNext");
    chatService.processPendingRequests(context.sessionResource);
  }
}
class ChatRemoveAllPendingRequestsAction extends Action2 {
  static {
    __name(this, "ChatRemoveAllPendingRequestsAction");
  }
  static {
    this.ID = "workbench.action.chat.removeAllPendingRequests";
  }
  constructor() {
    super({
      id: ChatRemoveAllPendingRequestsAction.ID,
      title: localize2("chat.removeAllPendingRequests", "Remove All Queued"),
      icon: Codicon.clearAll,
      f1: false,
      category: CHAT_CATEGORY,
      menu: [{
        id: MenuId.ChatContext,
        group: "navigation",
        order: 3,
        when: ChatContextKeys.hasPendingRequests
      }]
    });
  }
  run(accessor, ...args) {
    const chatService = accessor.get(IChatService);
    const widgetService = accessor.get(IChatWidgetService);
    const [context] = args;
    const widget = isRequestVM(context) && widgetService.getWidgetBySessionResource(context.sessionResource) || widgetService.lastFocusedWidget;
    const model = widget?.viewModel?.model;
    if (!model) {
      return;
    }
    for (const pendingRequest of [...model.getPendingRequests()]) {
      chatService.removePendingRequest(model.sessionResource, pendingRequest.request.id);
    }
  }
}
function registerChatQueueActions() {
  registerAction2(ChatQueueMessageAction);
  registerAction2(ChatSteerWithMessageAction);
  registerAction2(ChatRemovePendingRequestAction);
  registerAction2(ChatSendPendingImmediatelyAction);
  registerAction2(ChatRemoveAllPendingRequestsAction);
  MenuRegistry.appendMenuItem(MenuId.ChatExecuteQueue, {
    command: { id: ChatQueueMessageAction.ID, title: localize2("chat.queueMessage", "Add to Queue"), icon: Codicon.add },
    group: "navigation",
    order: 1
  });
  MenuRegistry.appendMenuItem(MenuId.ChatExecuteQueue, {
    command: { id: ChatSteerWithMessageAction.ID, title: localize2("chat.steerWithMessage", "Steer with Message"), icon: Codicon.arrowUp },
    group: "navigation",
    order: 2
  });
  MenuRegistry.appendMenuItem(MenuId.ChatExecute, {
    submenu: MenuId.ChatExecuteQueue,
    title: localize2("chat.queueSubmenu", "Queue"),
    icon: Codicon.listOrdered,
    when: ContextKeyExpr.and(queuingActionsPresent, ChatContextKeys.inputHasText),
    group: "navigation",
    order: 4
  });
}
__name(registerChatQueueActions, "registerChatQueueActions");
export {
  ChatQueueMessageAction,
  ChatRemoveAllPendingRequestsAction,
  ChatRemovePendingRequestAction,
  ChatSendPendingImmediatelyAction,
  ChatSteerWithMessageAction,
  registerChatQueueActions
};
//# sourceMappingURL=chatQueueActions.js.map
