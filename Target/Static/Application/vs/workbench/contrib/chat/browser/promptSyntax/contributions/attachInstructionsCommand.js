var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../nls.js";
import { CHAT_CATEGORY } from "../../actions/chatActions.js";
import { IChatWidgetService } from "../../chat.js";
import { ChatContextKeys } from "../../../common/chatContextKeys.js";
import { runAttachInstructionsAction } from "../../actions/promptActions/index.js";
import { PromptsConfig } from "../../../../../../platform/prompts/common/config.js";
import { INSTRUCTIONS_LANGUAGE_ID } from "../../../common/promptSyntax/constants.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { MenuId, MenuRegistry } from "../../../../../../platform/actions/common/actions.js";
import { ICodeEditorService } from "../../../../../../editor/browser/services/codeEditorService.js";
import { KeybindingsRegistry } from "../../../../../../platform/keybinding/common/keybindingsRegistry.js";
const INSTRUCTIONS_COMMAND_ID = "workbench.command.instructions.attach";
const INSTRUCTIONS_COMMAND_KEY_BINDING = 2048 | 90 | 512;
const command = /* @__PURE__ */ __name(async (accessor) => {
  const commandService = accessor.get(ICommandService);
  await runAttachInstructionsAction(commandService, {
    resource: getActiveInstructionsFileUri(accessor),
    widget: getFocusedChatWidget(accessor)
  });
}, "command");
function getFocusedChatWidget(accessor) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const { lastFocusedWidget } = chatWidgetService;
  if (!lastFocusedWidget) {
    return void 0;
  }
  if (!lastFocusedWidget.hasInputFocus()) {
    return void 0;
  }
  return lastFocusedWidget;
}
__name(getFocusedChatWidget, "getFocusedChatWidget");
const getActiveInstructionsFileUri = /* @__PURE__ */ __name((accessor) => {
  const codeEditorService = accessor.get(ICodeEditorService);
  const model = codeEditorService.getActiveCodeEditor()?.getModel();
  if (model?.getLanguageId() === INSTRUCTIONS_LANGUAGE_ID) {
    return model.uri;
  }
  return void 0;
}, "getActiveInstructionsFileUri");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: INSTRUCTIONS_COMMAND_ID,
  weight: 200,
  primary: INSTRUCTIONS_COMMAND_KEY_BINDING,
  handler: command,
  when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: INSTRUCTIONS_COMMAND_ID,
    title: localize("attach-instructions.capitalized.ellipses", "Attach Instructions..."),
    category: CHAT_CATEGORY
  },
  when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
});
export {
  INSTRUCTIONS_COMMAND_ID,
  getActiveInstructionsFileUri,
  getFocusedChatWidget
};
//# sourceMappingURL=attachInstructionsCommand.js.map
