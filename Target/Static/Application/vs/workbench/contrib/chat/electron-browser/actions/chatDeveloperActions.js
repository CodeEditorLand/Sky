var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize2 } from "../../../../../nls.js";
import { Categories } from "../../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { INativeHostService } from "../../../../../platform/native/common/native.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { IChatService } from "../../common/chatService.js";
function registerChatDeveloperActions() {
  registerAction2(OpenChatStorageFolderAction);
}
__name(registerChatDeveloperActions, "registerChatDeveloperActions");
class OpenChatStorageFolderAction extends Action2 {
  static {
    __name(this, "OpenChatStorageFolderAction");
  }
  static {
    this.ID = "workbench.action.chat.openStorageFolder";
  }
  constructor() {
    super({
      id: OpenChatStorageFolderAction.ID,
      title: localize2("workbench.action.chat.openStorageFolder.label", "Open Chat Storage Folder"),
      icon: Codicon.attach,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args) {
    const chatService = accessor.get(IChatService);
    const nativeHostService = accessor.get(INativeHostService);
    const storagePath = chatService.getChatStorageFolder();
    nativeHostService.showItemInFolder(storagePath.fsPath);
  }
}
export {
  registerChatDeveloperActions
};
//# sourceMappingURL=chatDeveloperActions.js.map
