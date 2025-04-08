var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ServicesAccessor } from "../../../../../../editor/browser/editorExtensions.js";
import { localize2 } from "../../../../../../nls.js";
import { Action2 } from "../../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../../../platform/quickinput/common/quickInput.js";
import { IViewsService } from "../../../../../services/views/common/viewsService.js";
import { ChatContextKeys } from "../../../common/chatContextKeys.js";
import { IPromptsService } from "../../../common/promptSyntax/service/types.js";
import { CHAT_CATEGORY } from "../chatActions.js";
import { ISelectPromptOptions, askToSelectPrompt } from "./dialogs/askToSelectPrompt/askToSelectPrompt.js";
const ATTACH_PROMPT_ACTION_ID = "workbench.action.chat.attach.prompt";
class AttachPromptAction extends Action2 {
  static {
    __name(this, "AttachPromptAction");
  }
  constructor() {
    super({
      id: ATTACH_PROMPT_ACTION_ID,
      title: localize2("workbench.action.chat.attach.prompt.label", "Use Prompt"),
      f1: false,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY
    });
  }
  async run(accessor, options) {
    const fileService = accessor.get(IFileService);
    const labelService = accessor.get(ILabelService);
    const viewsService = accessor.get(IViewsService);
    const openerService = accessor.get(IOpenerService);
    const dialogService = accessor.get(IDialogService);
    const promptsService = accessor.get(IPromptsService);
    const commandService = accessor.get(ICommandService);
    const quickInputService = accessor.get(IQuickInputService);
    const promptFiles = await promptsService.listPromptFiles();
    await askToSelectPrompt({
      ...options,
      promptFiles,
      fileService,
      viewsService,
      labelService,
      dialogService,
      openerService,
      commandService,
      quickInputService
    });
  }
}
export {
  ATTACH_PROMPT_ACTION_ID,
  AttachPromptAction
};
//# sourceMappingURL=chatAttachPromptAction.js.map
