var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ChatViewId, showChatView } from "../chat.js";
import { ACTION_ID_NEW_CHAT, CHAT_CATEGORY } from "../actions/chatActions.js";
import { OS } from "../../../../../base/common/platform.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { assertDefined } from "../../../../../base/common/types.js";
import { ResourceContextKey } from "../../../../common/contextkeys.js";
import { PromptsType, PROMPT_LANGUAGE_ID } from "../../common/promptSyntax/promptTypes.js";
import { localize, localize2 } from "../../../../../nls.js";
import { UILabelProvider } from "../../../../../base/common/keybindingLabels.js";
import { PromptsConfig } from "../../common/promptSyntax/config/config.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { PromptFilePickers } from "./pickers/promptFilePickers.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { getPromptCommandName } from "../../common/promptSyntax/service/promptsServiceImpl.js";
const EDITOR_ACTIONS_CONDITION = ContextKeyExpr.and(ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled), ResourceContextKey.HasResource, ResourceContextKey.LangId.isEqualTo(PROMPT_LANGUAGE_ID));
const COMMAND_KEY_BINDING = 256 | 90 | 512;
const RUN_CURRENT_PROMPT_ACTION_ID = "workbench.action.chat.run.prompt.current";
const RUN_SELECTED_PROMPT_ACTION_ID = "workbench.action.chat.run.prompt";
const CONFIGURE_PROMPTS_ACTION_ID = "workbench.action.chat.configure.prompts";
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
    if (inNewChat === true) {
      await commandService.executeCommand(ACTION_ID_NEW_CHAT);
    }
    const widget = await showChatView(viewsService);
    if (widget) {
      widget.setInput(`/${getPromptCommandName(resource.path)}`);
      await widget.acceptInput();
    }
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
    const commandService = accessor.get(ICommandService);
    const instaService = accessor.get(IInstantiationService);
    const pickers = instaService.createInstance(PromptFilePickers);
    const placeholder = localize("commands.prompt.select-dialog.placeholder", "Select the prompt file to run (hold {0}-key to use in new chat)", UILabelProvider.modifierLabels[OS].ctrlKey);
    const result = await pickers.selectPromptFile({ placeholder, type: PromptsType.prompt });
    if (result === void 0) {
      return;
    }
    const { promptFile, keyMods } = result;
    if (keyMods.ctrlCmd === true) {
      await commandService.executeCommand(ACTION_ID_NEW_CHAT);
    }
    const widget = await showChatView(viewsService);
    if (widget) {
      widget.setInput(`/${getPromptCommandName(promptFile.path)}`);
      await widget.acceptInput();
      widget.focusInput();
    }
  }
}
class ManagePromptFilesAction extends Action2 {
  static {
    __name(this, "ManagePromptFilesAction");
  }
  constructor() {
    super({
      id: CONFIGURE_PROMPTS_ACTION_ID,
      title: localize2("configure-prompts", "Configure Prompt Files..."),
      icon: Codicon.bookmark,
      f1: true,
      precondition: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
      category: CHAT_CATEGORY,
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)),
        order: 10,
        group: "2_manage"
      }
    });
  }
  async run(accessor) {
    const openerService = accessor.get(IOpenerService);
    const instaService = accessor.get(IInstantiationService);
    const pickers = instaService.createInstance(PromptFilePickers);
    const placeholder = localize("commands.prompt.manage-dialog.placeholder", "Select the prompt file to open");
    const result = await pickers.selectPromptFile({ placeholder, type: PromptsType.prompt, optionEdit: false });
    if (result !== void 0) {
      await openerService.open(result.promptFile);
    }
  }
}
function getActivePromptFileUri(accessor) {
  const codeEditorService = accessor.get(ICodeEditorService);
  const model = codeEditorService.getActiveCodeEditor()?.getModel();
  if (model?.getLanguageId() === PROMPT_LANGUAGE_ID) {
    return model.uri;
  }
  return void 0;
}
__name(getActivePromptFileUri, "getActivePromptFileUri");
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
function registerRunPromptActions() {
  registerAction2(RunCurrentPromptInNewChatAction);
  registerAction2(RunCurrentPromptAction);
  registerAction2(RunSelectedPromptAction);
  registerAction2(ManagePromptFilesAction);
}
__name(registerRunPromptActions, "registerRunPromptActions");
export {
  registerRunPromptActions
};
//# sourceMappingURL=runPromptAction.js.map
