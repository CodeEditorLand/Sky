var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CHAT_CATEGORY } from "../chatActions.js";
import { OS } from "../../../../../../base/common/platform.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { ChatContextKeys } from "../../../common/chatContextKeys.js";
import { assertDefined } from "../../../../../../base/common/types.js";
import { ResourceContextKey } from "../../../../../common/contextkeys.js";
import { PROMPT_LANGUAGE_ID } from "../../../common/promptSyntax/constants.js";
import { IPromptsService } from "../../../common/promptSyntax/service/types.js";
import { localize, localize2 } from "../../../../../../nls.js";
import { UILabelProvider } from "../../../../../../base/common/keybindingLabels.js";
import { PromptsConfig } from "../../../../../../platform/prompts/common/config.js";
import { IViewsService } from "../../../../../services/views/common/viewsService.js";
import { PromptFilePickers } from "./dialogs/askToSelectPrompt/promptFilePickers.js";
import { EditorContextKeys } from "../../../../../../editor/common/editorContextKeys.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { runPromptFile } from "./dialogs/askToSelectPrompt/utils/runPrompt.js";
import { ICodeEditorService } from "../../../../../../editor/browser/services/codeEditorService.js";
import { Action2, MenuId, registerAction2 } from "../../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
const EDITOR_ACTIONS_CONDITION = ContextKeyExpr.and(ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled), ResourceContextKey.HasResource, ResourceContextKey.LangId.isEqualTo(PROMPT_LANGUAGE_ID));
const COMMAND_KEY_BINDING = 256 | 90 | 512;
const RUN_CURRENT_PROMPT_ACTION_ID = "workbench.action.chat.run.prompt.current";
const RUN_SELECTED_PROMPT_ACTION_ID = "workbench.action.chat.run.prompt";
class RunPromptBaseAction extends Action2 {
  static {
    __name(this, "RunPromptBaseAction");
  }
  constructor(options) {
    super({
      id: options.id,
      title: options.title,
      f1: false,
      precondition: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
      category: CHAT_CATEGORY,
      icon: options.icon,
      keybinding: {
        when: ContextKeyExpr.and(EditorContextKeys.editorTextFocus, EDITOR_ACTIONS_CONDITION),
        weight: 200,
        primary: options.keybinding
      },
      menu: [
        {
          id: MenuId.EditorTitleRun,
          group: "navigation",
          order: options.alt ? 0 : 1,
          alt: options.alt,
          when: EDITOR_ACTIONS_CONDITION
        }
      ]
    });
  }
  /**
   * Executes the run prompt action with provided options.
   */
  async execute(resource, inNewChat, accessor) {
    const viewsService = accessor.get(IViewsService);
    const commandService = accessor.get(ICommandService);
    resource ||= getActivePromptFileUri(accessor);
    assertDefined(resource, "Cannot find URI resource for an active text editor.");
    const { widget } = await runPromptFile(resource, {
      inNewChat,
      commandService,
      viewsService
    });
    return widget;
  }
}
const RUN_CURRENT_PROMPT_ACTION_TITLE = localize2("run-prompt.capitalized", "Run Prompt in Current Chat");
const RUN_CURRENT_PROMPT_ACTION_ICON = Codicon.playCircle;
class RunCurrentPromptAction extends RunPromptBaseAction {
  static {
    __name(this, "RunCurrentPromptAction");
  }
  constructor() {
    super({
      id: RUN_CURRENT_PROMPT_ACTION_ID,
      title: RUN_CURRENT_PROMPT_ACTION_TITLE,
      icon: RUN_CURRENT_PROMPT_ACTION_ICON,
      keybinding: COMMAND_KEY_BINDING
    });
  }
  async run(accessor, resource) {
    return await super.execute(resource, false, accessor);
  }
}
class RunSelectedPromptAction extends Action2 {
  static {
    __name(this, "RunSelectedPromptAction");
  }
  constructor() {
    super({
      id: RUN_SELECTED_PROMPT_ACTION_ID,
      title: localize2("run-prompt.capitalized.ellipses", "Run Prompt..."),
      icon: Codicon.bookmark,
      f1: true,
      precondition: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
      keybinding: {
        when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
        weight: 200,
        primary: COMMAND_KEY_BINDING
      },
      category: CHAT_CATEGORY
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const promptsService = accessor.get(IPromptsService);
    const commandService = accessor.get(ICommandService);
    const instaService = accessor.get(IInstantiationService);
    const pickers = instaService.createInstance(PromptFilePickers);
    const promptFiles = await promptsService.listPromptFiles("prompt");
    const placeholder = localize("commands.prompt.select-dialog.placeholder", "Select the prompt file to run (hold {0}-key to use in new chat)", UILabelProvider.modifierLabels[OS].ctrlKey);
    const result = await pickers.selectPromptFile({ promptFiles, placeholder });
    if (result === void 0) {
      return;
    }
    const { promptFile, keyMods } = result;
    const runPromptOptions = {
      inNewChat: keyMods.ctrlCmd,
      viewsService,
      commandService
    };
    const { widget } = await runPromptFile(promptFile, runPromptOptions);
    widget.focusInput();
  }
}
const getActivePromptFileUri = /* @__PURE__ */ __name((accessor) => {
  const codeEditorService = accessor.get(ICodeEditorService);
  const model = codeEditorService.getActiveCodeEditor()?.getModel();
  if (model?.getLanguageId() === PROMPT_LANGUAGE_ID) {
    return model.uri;
  }
  return void 0;
}, "getActivePromptFileUri");
const RUN_CURRENT_PROMPT_IN_NEW_CHAT_ACTION_ID = "workbench.action.chat.run-in-new-chat.prompt.current";
const RUN_IN_NEW_CHAT_ACTION_TITLE = localize2("run-prompt-in-new-chat.capitalized", "Run Prompt In New Chat");
const RUN_IN_NEW_CHAT_ACTION_ICON = Codicon.play;
class RunCurrentPromptInNewChatAction extends RunPromptBaseAction {
  static {
    __name(this, "RunCurrentPromptInNewChatAction");
  }
  constructor() {
    super({
      id: RUN_CURRENT_PROMPT_IN_NEW_CHAT_ACTION_ID,
      title: RUN_IN_NEW_CHAT_ACTION_TITLE,
      icon: RUN_IN_NEW_CHAT_ACTION_ICON,
      keybinding: COMMAND_KEY_BINDING | 2048,
      alt: {
        id: RUN_CURRENT_PROMPT_ACTION_ID,
        title: RUN_CURRENT_PROMPT_ACTION_TITLE,
        icon: RUN_CURRENT_PROMPT_ACTION_ICON
      }
    });
  }
  async run(accessor, resource) {
    return await super.execute(resource, true, accessor);
  }
}
const registerRunPromptActions = /* @__PURE__ */ __name(() => {
  registerAction2(RunCurrentPromptInNewChatAction);
  registerAction2(RunCurrentPromptAction);
  registerAction2(RunSelectedPromptAction);
}, "registerRunPromptActions");
export {
  getActivePromptFileUri,
  registerRunPromptActions
};
//# sourceMappingURL=chatRunPromptAction.js.map
