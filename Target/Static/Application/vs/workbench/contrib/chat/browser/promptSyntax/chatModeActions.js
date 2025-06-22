var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CHAT_CATEGORY } from "../actions/chatActions.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { localize, localize2 } from "../../../../../nls.js";
import { PromptsConfig } from "../../common/promptSyntax/config/config.js";
import { PromptFilePickers } from "./pickers/promptFilePickers.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { ChatViewId } from "../chat.js";
const COMFIGURE_MODES_ACTION_ID = "workbench.action.chat.manage.mode";
class ManageModeAction extends Action2 {
  static {
    __name(this, "ManageModeAction");
  }
  constructor() {
    super({
      id: COMFIGURE_MODES_ACTION_ID,
      title: localize2("configure-modes", "Configure Chat Modes..."),
      shortTitle: localize("manage-mode", "Configure Modes..."),
      icon: Codicon.bookmark,
      f1: true,
      precondition: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
      category: CHAT_CATEGORY,
      menu: [
        {
          id: MenuId.ChatModePicker,
          when: ChatContextKeys.Modes.hasCustomChatModes
        },
        {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)),
          order: 12,
          group: "2_manage"
        }
      ]
    });
  }
  async run(accessor) {
    const openerService = accessor.get(IOpenerService);
    const instaService = accessor.get(IInstantiationService);
    const pickers = instaService.createInstance(PromptFilePickers);
    const placeholder = localize("commands.mode.select-dialog.placeholder", "Select the chat mode file to open");
    const result = await pickers.selectPromptFile({ placeholder, type: PromptsType.mode, optionEdit: false });
    if (result !== void 0) {
      await openerService.open(result.promptFile);
    }
  }
}
function registerChatModeActions() {
  registerAction2(ManageModeAction);
}
__name(registerChatModeActions, "registerChatModeActions");
export {
  registerChatModeActions
};
//# sourceMappingURL=chatModeActions.js.map
