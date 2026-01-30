var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize2 } from "../../../../../nls.js";
import { Categories } from "../../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { IChatWidgetService } from "../chat.js";
function registerChatDeveloperActions() {
  registerAction2(LogChatInputHistoryAction);
  registerAction2(LogChatIndexAction);
  registerAction2(InspectChatModelAction);
}
__name(registerChatDeveloperActions, "registerChatDeveloperActions");
class LogChatInputHistoryAction extends Action2 {
  static {
    __name(this, "LogChatInputHistoryAction");
  }
  static {
    this.ID = "workbench.action.chat.logInputHistory";
  }
  constructor() {
    super({
      id: LogChatInputHistoryAction.ID,
      title: localize2("workbench.action.chat.logInputHistory.label", "Log Chat Input History"),
      icon: Codicon.attach,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    chatWidgetService.lastFocusedWidget?.logInputHistory();
  }
}
class LogChatIndexAction extends Action2 {
  static {
    __name(this, "LogChatIndexAction");
  }
  static {
    this.ID = "workbench.action.chat.logChatIndex";
  }
  constructor() {
    super({
      id: LogChatIndexAction.ID,
      title: localize2("workbench.action.chat.logChatIndex.label", "Log Chat Index"),
      icon: Codicon.attach,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args) {
    const chatService = accessor.get(IChatService);
    chatService.logChatIndex();
  }
}
class InspectChatModelAction extends Action2 {
  static {
    __name(this, "InspectChatModelAction");
  }
  static {
    this.ID = "workbench.action.chat.inspectChatModel";
  }
  constructor() {
    super({
      id: InspectChatModelAction.ID,
      title: localize2("workbench.action.chat.inspectChatModel.label", "Inspect Chat Model"),
      icon: Codicon.inspect,
      category: Categories.Developer,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor, ...args) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const editorService = accessor.get(IEditorService);
    const widget = chatWidgetService.lastFocusedWidget;
    if (!widget?.viewModel) {
      return;
    }
    const model = widget.viewModel.model;
    const modelData = model.toJSON();
    let output = "# Chat Model Inspection\n\n";
    const requests = modelData.requests;
    if (requests && requests.length > 0) {
      const latestRequest = requests[requests.length - 1];
      if (latestRequest.response) {
        output += "## Latest Response\n\n";
        output += "```json\n" + JSON.stringify(latestRequest.response, null, 2) + "\n```\n\n";
      }
    }
    output += "## Full Chat Model\n\n";
    output += "```json\n" + JSON.stringify(modelData, null, 2) + "\n```\n";
    await editorService.openEditor({
      resource: void 0,
      contents: output,
      languageId: "markdown",
      options: {
        pinned: true
      }
    });
  }
}
export {
  registerChatDeveloperActions
};
//# sourceMappingURL=chatDeveloperActions.js.map
