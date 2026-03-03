var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../base/common/uri.js";
import { localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { Categories } from "../../../../../platform/action/common/actionCommonCategories.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { isChatViewTitleActionContext } from "../../common/actions/chatActions.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IChatDebugService } from "../../common/chatDebugService.js";
import { ChatViewId, IChatWidgetService } from "../chat.js";
import { CHAT_CATEGORY, CHAT_CONFIG_MENU_ID } from "./chatActions.js";
import { ChatDebugEditorInput } from "../chatDebug/chatDebugEditorInput.js";
function registerChatOpenAgentDebugPanelAction() {
  registerAction2(class OpenAgentDebugPanelAction extends Action2 {
    static {
      __name(this, "OpenAgentDebugPanelAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.openAgentDebugPanel",
        title: localize2("chat.openAgentDebugPanel.label", "Open Agent Debug Panel"),
        f1: true,
        category: Categories.Developer,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const chatDebugService = accessor.get(IChatDebugService);
      chatDebugService.activeSessionResource = void 0;
      const options = { pinned: true, viewHint: "home" };
      await editorService.openEditor(ChatDebugEditorInput.instance, options);
    }
  });
  registerAction2(class OpenAgentDebugPanelForSessionAction extends Action2 {
    static {
      __name(this, "OpenAgentDebugPanelForSessionAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.openAgentDebugPanelForSession",
        title: localize2("chat.openAgentDebugPanelForSession.label", "Show Agent Logs"),
        f1: false,
        category: CHAT_CATEGORY,
        precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.chatSessionHasDebugData),
        menu: [{
          id: CHAT_CONFIG_MENU_ID,
          when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)),
          order: 0,
          group: "4_logs"
        }, {
          id: MenuId.ChatWelcomeContext,
          group: "2_settings",
          order: 0,
          when: ChatContextKeys.inChatEditor.negate()
        }]
      });
    }
    async run(accessor, context) {
      const editorService = accessor.get(IEditorService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const chatDebugService = accessor.get(IChatDebugService);
      let sessionResource;
      if (URI.isUri(context)) {
        sessionResource = context;
      } else if (isChatViewTitleActionContext(context)) {
        sessionResource = context.sessionResource;
      }
      if (!sessionResource) {
        const widget = chatWidgetService.lastFocusedWidget;
        sessionResource = widget?.viewModel?.sessionResource;
      }
      chatDebugService.activeSessionResource = sessionResource;
      const options = { pinned: true, sessionResource, viewHint: "logs" };
      await editorService.openEditor(ChatDebugEditorInput.instance, options);
    }
  });
}
__name(registerChatOpenAgentDebugPanelAction, "registerChatOpenAgentDebugPanelAction");
export {
  registerChatOpenAgentDebugPanelAction
};
//# sourceMappingURL=chatOpenAgentDebugPanelAction.js.map
