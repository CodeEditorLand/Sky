var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isEqual } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { getCodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { SnippetController2 } from "../../../../../editor/contrib/snippet/browser/snippetController2.js";
import { localize } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { INotificationService, NeverShowAgainScope, Severity } from "../../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { PromptsConfig } from "../../common/promptSyntax/config/config.js";
import { getLanguageIdForPromptsType, PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { IUserDataSyncEnablementService } from "../../../../../platform/userDataSync/common/userDataSync.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { CONFIGURE_SYNC_COMMAND_ID } from "../../../../services/userDataSync/common/userDataSync.js";
import { ISnippetsService } from "../../../snippets/browser/snippets.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { CHAT_CATEGORY } from "../actions/chatActions.js";
import { askForPromptFileName } from "./pickers/askForPromptName.js";
import { askForPromptSourceFolder } from "./pickers/askForPromptSourceFolder.js";
class AbstractNewPromptFileAction extends Action2 {
  static {
    __name(this, "AbstractNewPromptFileAction");
  }
  constructor(id, title, type) {
    super({
      id,
      title,
      f1: false,
      precondition: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled),
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200
        /* KeybindingWeight.WorkbenchContrib */
      },
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
      }
    });
    this.type = type;
  }
  async run(accessor) {
    const logService = accessor.get(ILogService);
    const openerService = accessor.get(IOpenerService);
    const commandService = accessor.get(ICommandService);
    const notificationService = accessor.get(INotificationService);
    const userDataSyncEnablementService = accessor.get(IUserDataSyncEnablementService);
    const snippetService = accessor.get(ISnippetsService);
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const instaService = accessor.get(IInstantiationService);
    const selectedFolder = await instaService.invokeFunction(askForPromptSourceFolder, this.type);
    if (!selectedFolder) {
      return;
    }
    const fileName = await instaService.invokeFunction(askForPromptFileName, this.type, selectedFolder.uri);
    if (!fileName) {
      return;
    }
    await fileService.createFolder(selectedFolder.uri);
    const promptUri = URI.joinPath(selectedFolder.uri, fileName);
    await fileService.createFile(promptUri);
    await openerService.open(promptUri);
    const editor = getCodeEditor(editorService.activeTextEditorControl);
    if (editor && editor.hasModel() && isEqual(editor.getModel().uri, promptUri)) {
      const languageId = getLanguageIdForPromptsType(this.type);
      const snippets = await snippetService.getSnippets(languageId, { fileTemplateSnippets: true, noRecencySort: true, includeNoPrefixSnippets: true });
      if (snippets.length > 0) {
        SnippetController2.get(editor)?.apply([{
          range: editor.getModel().getFullModelRange(),
          template: snippets[0].body
        }]);
      }
    }
    if (selectedFolder.storage !== "user") {
      return;
    }
    const isConfigured = userDataSyncEnablementService.isResourceEnablementConfigured(
      "prompts"
      /* SyncResource.Prompts */
    );
    const isSettingsSyncEnabled = userDataSyncEnablementService.isEnabled();
    if (isConfigured === true || isSettingsSyncEnabled === false) {
      return;
    }
    notificationService.prompt(Severity.Info, localize("workbench.command.prompts.create.user.enable-sync-notification", "Do you want to backup and sync your user prompt, instruction and mode files with Setting Sync?'"), [
      {
        label: localize("enable.capitalized", "Enable"),
        run: /* @__PURE__ */ __name(() => {
          commandService.executeCommand(CONFIGURE_SYNC_COMMAND_ID).catch((error) => {
            logService.error(`Failed to run '${CONFIGURE_SYNC_COMMAND_ID}' command: ${error}.`);
          });
        }, "run")
      },
      {
        label: localize("learnMore.capitalized", "Learn More"),
        run: /* @__PURE__ */ __name(() => {
          openerService.open(URI.parse("https://aka.ms/vscode-settings-sync-help"));
        }, "run")
      }
    ], {
      neverShowAgain: {
        id: "workbench.command.prompts.create.user.enable-sync-notification",
        scope: NeverShowAgainScope.PROFILE
      }
    });
  }
}
const NEW_PROMPT_COMMAND_ID = "workbench.command.new.prompt";
const NEW_INSTRUCTIONS_COMMAND_ID = "workbench.command.new.instructions";
const NEW_MODE_COMMAND_ID = "workbench.command.new.mode";
class NewPromptFileAction extends AbstractNewPromptFileAction {
  static {
    __name(this, "NewPromptFileAction");
  }
  constructor() {
    super(NEW_PROMPT_COMMAND_ID, localize("commands.new.prompt.local.title", "New Prompt File..."), PromptsType.prompt);
  }
}
class NewInstructionsFileAction extends AbstractNewPromptFileAction {
  static {
    __name(this, "NewInstructionsFileAction");
  }
  constructor() {
    super(NEW_INSTRUCTIONS_COMMAND_ID, localize("commands.new.instructions.local.title", "New Instructions File..."), PromptsType.instructions);
  }
}
class NewModeFileAction extends AbstractNewPromptFileAction {
  static {
    __name(this, "NewModeFileAction");
  }
  constructor() {
    super(NEW_MODE_COMMAND_ID, localize("commands.new.mode.local.title", "New Mode File..."), PromptsType.mode);
  }
}
function registerNewPromptFileActions() {
  registerAction2(NewPromptFileAction);
  registerAction2(NewInstructionsFileAction);
  registerAction2(NewModeFileAction);
}
__name(registerNewPromptFileActions, "registerNewPromptFileActions");
export {
  NEW_INSTRUCTIONS_COMMAND_ID,
  NEW_MODE_COMMAND_ID,
  NEW_PROMPT_COMMAND_ID,
  registerNewPromptFileActions
};
//# sourceMappingURL=newPromptFileActions.js.map
