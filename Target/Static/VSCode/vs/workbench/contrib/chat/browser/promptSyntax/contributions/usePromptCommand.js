var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../nls.js";
import { URI } from "../../../../../../base/common/uri.js";
import { CHAT_CATEGORY } from "../../actions/chatActions.js";
import { IChatWidget, IChatWidgetService } from "../../chat.js";
import { ChatContextKeys } from "../../../common/chatContextKeys.js";
import { KeyMod, KeyCode } from "../../../../../../base/common/keyCodes.js";
import { PromptsConfig } from "../../../../../../platform/prompts/common/config.js";
import { isPromptFile } from "../../../../../../platform/prompts/common/constants.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { MenuId, MenuRegistry } from "../../../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IActiveCodeEditor, isCodeEditor, isDiffEditor } from "../../../../../../editor/browser/editorBrowser.js";
import { KeybindingsRegistry, KeybindingWeight } from "../../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IChatAttachPromptActionOptions, ATTACH_PROMPT_ACTION_ID } from "../../actions/chatAttachPromptAction/chatAttachPromptAction.js";
const COMMAND_ID = "workbench.command.prompts.use";
const COMMAND_KEY_BINDING = KeyMod.CtrlCmd | KeyCode.Slash | KeyMod.Alt;
const command = /* @__PURE__ */ __name(async (accessor) => {
  const commandService = accessor.get(ICommandService);
  const options = {
    resource: getActivePromptUri(accessor),
    widget: getFocusedChatWidget(accessor)
  };
  await commandService.executeCommand(ATTACH_PROMPT_ACTION_ID, options);
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
function getActiveCodeEditor(accessor) {
  const editorService = accessor.get(IEditorService);
  const { activeTextEditorControl } = editorService;
  if (isCodeEditor(activeTextEditorControl) && activeTextEditorControl.hasModel()) {
    return activeTextEditorControl;
  }
  if (isDiffEditor(activeTextEditorControl)) {
    const originalEditor = activeTextEditorControl.getOriginalEditor();
    if (!originalEditor.hasModel()) {
      return void 0;
    }
    return originalEditor;
  }
  return void 0;
}
__name(getActiveCodeEditor, "getActiveCodeEditor");
const getActivePromptUri = /* @__PURE__ */ __name((accessor) => {
  const activeEditor = getActiveCodeEditor(accessor);
  if (!activeEditor) {
    return void 0;
  }
  const { uri } = activeEditor.getModel();
  if (isPromptFile(uri)) {
    return uri;
  }
  return void 0;
}, "getActivePromptUri");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: COMMAND_ID,
  weight: KeybindingWeight.WorkbenchContrib,
  primary: COMMAND_KEY_BINDING,
  handler: command,
  when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: COMMAND_ID,
    title: localize("commands.prompts.use.title", "Use Prompt"),
    category: CHAT_CATEGORY
  },
  when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
});
export {
  COMMAND_ID,
  getActiveCodeEditor,
  getFocusedChatWidget
};
//# sourceMappingURL=usePromptCommand.js.map
