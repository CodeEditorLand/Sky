var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { CHAT_CATEGORY, CHAT_CONFIG_MENU_ID } from "./chatActions.js";
import { IExtensionsWorkbenchService } from "../../../extensions/common/extensions.js";
class ManagePluginsAction extends Action2 {
  static {
    __name(this, "ManagePluginsAction");
  }
  static {
    this.ID = "workbench.action.chat.managePlugins";
  }
  constructor() {
    super({
      id: ManagePluginsAction.ID,
      title: localize2("plugins", "Plugins"),
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.enabled,
      menu: [{
        id: CHAT_CONFIG_MENU_ID,
        group: "2_plugins"
      }],
      f1: true
    });
  }
  async run(accessor) {
    accessor.get(IExtensionsWorkbenchService).openSearch("@agentPlugins ");
  }
}
function registerChatPluginActions() {
  registerAction2(ManagePluginsAction);
}
__name(registerChatPluginActions, "registerChatPluginActions");
export {
  registerChatPluginActions
};
//# sourceMappingURL=chatPluginActions.js.map
