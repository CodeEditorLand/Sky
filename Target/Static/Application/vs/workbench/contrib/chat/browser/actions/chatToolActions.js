var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { isResponseVM } from "../../common/chatViewModel.js";
import { ChatMode } from "../../common/constants.js";
import { ToolSet } from "../../common/languageModelToolsService.js";
import { IChatWidgetService } from "../chat.js";
import { CHAT_CATEGORY } from "./chatActions.js";
import { showToolsPicker } from "./chatToolPicker.js";
const AcceptToolConfirmationActionId = "workbench.action.chat.acceptTool";
class AcceptToolConfirmation extends Action2 {
  static {
    __name(this, "AcceptToolConfirmation");
  }
  constructor() {
    super({
      id: AcceptToolConfirmationActionId,
      title: localize2("chat.accept", "Accept"),
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasToolConfirmation),
        primary: 2048 | 3,
        // Override chatEditor.action.accept
        weight: 200 + 1
      }
    });
  }
  run(accessor, ...args) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    const lastItem = widget?.viewModel?.getItems().at(-1);
    if (!isResponseVM(lastItem)) {
      return;
    }
    const unconfirmedToolInvocation = lastItem.model.response.value.find((item) => item.kind === "toolInvocation" && !item.isConfirmed);
    if (unconfirmedToolInvocation) {
      unconfirmedToolInvocation.confirmed.complete(true);
    }
    widget?.focusInput();
  }
}
class ConfigureToolsAction extends Action2 {
  static {
    __name(this, "ConfigureToolsAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.configureTools",
      title: localize("label", "Configure Tools..."),
      icon: Codicon.tools,
      f1: false,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.chatMode.isEqualTo(ChatMode.Agent),
      menu: {
        when: ChatContextKeys.chatMode.isEqualTo(ChatMode.Agent),
        id: MenuId.ChatExecute,
        group: "navigation",
        order: 1
      }
    });
  }
  async run(accessor, ...args) {
    const instaService = accessor.get(IInstantiationService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const telemetryService = accessor.get(ITelemetryService);
    let widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      let isChatActionContext2 = function(obj) {
        return obj && typeof obj === "object" && obj.widget;
      };
      var isChatActionContext = isChatActionContext2;
      __name(isChatActionContext2, "isChatActionContext");
      const context = args[0];
      if (isChatActionContext2(context)) {
        widget = context.widget;
      }
    }
    if (!widget) {
      return;
    }
    await instaService.invokeFunction(showToolsPicker, localize("placeholder", "Select tools that are available to chat"), widget.input.selectedToolsModel.entriesMap, (newEntriesMap) => {
      const disableToolSets = [];
      const disableTools = [];
      for (const [item, enabled] of newEntriesMap) {
        if (!enabled) {
          if (item instanceof ToolSet) {
            disableToolSets.push(item);
          } else {
            disableTools.push(item);
          }
        }
      }
      widget.input.selectedToolsModel.disable(disableToolSets, disableTools, false);
    });
    telemetryService.publicLog2("chat/selectedTools", {
      total: widget.input.selectedToolsModel.entriesMap.size,
      enabled: widget.input.selectedToolsModel.entries.get().size
    });
  }
}
function registerChatToolActions() {
  registerAction2(AcceptToolConfirmation);
  registerAction2(ConfigureToolsAction);
}
__name(registerChatToolActions, "registerChatToolActions");
export {
  AcceptToolConfirmationActionId,
  registerChatToolActions
};
//# sourceMappingURL=chatToolActions.js.map
