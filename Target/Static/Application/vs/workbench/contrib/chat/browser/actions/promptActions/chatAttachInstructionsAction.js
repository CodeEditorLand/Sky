var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CHAT_CATEGORY } from "../chatActions.js";
import { localize, localize2 } from "../../../../../../nls.js";
import { ChatContextKeys } from "../../../common/chatContextKeys.js";
import { assertDefined } from "../../../../../../base/common/types.js";
import { IPromptsService } from "../../../common/promptSyntax/service/types.js";
import { PromptsConfig } from "../../../../../../platform/prompts/common/config.js";
import { IViewsService } from "../../../../../services/views/common/viewsService.js";
import { PromptFilePickers } from "./dialogs/askToSelectPrompt/promptFilePickers.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { Action2, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { attachInstructionsFiles } from "./dialogs/askToSelectPrompt/utils/attachInstructions.js";
const ATTACH_INSTRUCTIONS_ACTION_ID = "workbench.action.chat.attach.instructions";
class AttachInstructionsAction extends Action2 {
  static {
    __name(this, "AttachInstructionsAction");
  }
  constructor() {
    super({
      id: ATTACH_INSTRUCTIONS_ACTION_ID,
      title: localize2("attach-instructions.capitalized.ellipses", "Attach Instructions..."),
      f1: false,
      precondition: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
      category: CHAT_CATEGORY
    });
  }
  async run(accessor, options) {
    const viewsService = accessor.get(IViewsService);
    const promptsService = accessor.get(IPromptsService);
    const commandService = accessor.get(ICommandService);
    const instaService = accessor.get(IInstantiationService);
    const pickers = instaService.createInstance(PromptFilePickers);
    const { skipSelectionDialog, resource } = options;
    const attachOptions = {
      widget: options.widget,
      viewsService,
      commandService
    };
    if (skipSelectionDialog === true) {
      assertDefined(resource, "Resource must be defined when skipping prompt selection dialog.");
      const widget = await attachInstructionsFiles([resource], attachOptions);
      widget.focusInput();
      return;
    }
    const promptFiles = await promptsService.listPromptFiles("instructions");
    const placeholder = localize("commands.instructions.select-dialog.placeholder", "Select instructions files to attach");
    const instructions = await pickers.selectInstructionsFiles({ promptFiles, placeholder });
    if (instructions !== void 0) {
      const widget = await attachInstructionsFiles(instructions, attachOptions);
      widget.focusInput();
    }
  }
}
const runAttachInstructionsAction = /* @__PURE__ */ __name(async (commandService, options) => {
  return await commandService.executeCommand(ATTACH_INSTRUCTIONS_ACTION_ID, options);
}, "runAttachInstructionsAction");
const registerAttachPromptActions = /* @__PURE__ */ __name(() => {
  registerAction2(AttachInstructionsAction);
}, "registerAttachPromptActions");
export {
  registerAttachPromptActions,
  runAttachInstructionsAction
};
//# sourceMappingURL=chatAttachInstructionsAction.js.map
