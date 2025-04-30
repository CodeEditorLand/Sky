var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isEqual } from "../../../../../../../base/common/resources.js";
import { URI } from "../../../../../../../base/common/uri.js";
import { getCodeEditor } from "../../../../../../../editor/browser/editorBrowser.js";
import { SnippetController2 } from "../../../../../../../editor/contrib/snippet/browser/snippetController2.js";
import { localize } from "../../../../../../../nls.js";
import { MenuId, MenuRegistry } from "../../../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../../../../platform/files/common/files.js";
import { KeybindingsRegistry } from "../../../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILabelService } from "../../../../../../../platform/label/common/label.js";
import { ILogService } from "../../../../../../../platform/log/common/log.js";
import { INotificationService, NeverShowAgainScope, Severity } from "../../../../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../../../../platform/opener/common/opener.js";
import { PromptsConfig } from "../../../../../../../platform/prompts/common/config.js";
import { IQuickInputService } from "../../../../../../../platform/quickinput/common/quickInput.js";
import { IUserDataSyncEnablementService } from "../../../../../../../platform/userDataSync/common/userDataSync.js";
import { IWorkspaceContextService } from "../../../../../../../platform/workspace/common/workspace.js";
import { IEditorService } from "../../../../../../services/editor/common/editorService.js";
import { CONFIGURE_SYNC_COMMAND_ID } from "../../../../../../services/userDataSync/common/userDataSync.js";
import { ISnippetsService } from "../../../../../snippets/browser/snippets.js";
import { ChatContextKeys } from "../../../../common/chatContextKeys.js";
import { INSTRUCTIONS_LANGUAGE_ID, PROMPT_LANGUAGE_ID } from "../../../../common/promptSyntax/constants.js";
import { IPromptsService } from "../../../../common/promptSyntax/service/types.js";
import { CHAT_CATEGORY } from "../../../actions/chatActions.js";
import { askForPromptFileName } from "./dialogs/askForPromptName.js";
import { askForPromptSourceFolder } from "./dialogs/askForPromptSourceFolder.js";
import { createPromptFile } from "./utils/createPromptFile.js";
const command = /* @__PURE__ */ __name(async (accessor, type) => {
  const logService = accessor.get(ILogService);
  const fileService = accessor.get(IFileService);
  const labelService = accessor.get(ILabelService);
  const openerService = accessor.get(IOpenerService);
  const promptsService = accessor.get(IPromptsService);
  const commandService = accessor.get(ICommandService);
  const quickInputService = accessor.get(IQuickInputService);
  const notificationService = accessor.get(INotificationService);
  const workspaceService = accessor.get(IWorkspaceContextService);
  const userDataSyncEnablementService = accessor.get(IUserDataSyncEnablementService);
  const snippetService = accessor.get(ISnippetsService);
  const editorService = accessor.get(IEditorService);
  const placeHolder = type === "instructions" ? localize("workbench.command.instructions.create.location.placeholder", "Select a location to create the instructions file in...") : localize("workbench.command.prompt.create.location.placeholder", "Select a location to create the prompt file in...");
  const selectedFolder = await askForPromptSourceFolder({
    type,
    placeHolder,
    labelService,
    openerService,
    promptsService,
    workspaceService,
    quickInputService
  });
  if (!selectedFolder) {
    return;
  }
  const fileName = await askForPromptFileName(type, selectedFolder.uri, quickInputService, fileService);
  if (!fileName) {
    return;
  }
  const promptUri = await createPromptFile({
    fileName,
    folder: selectedFolder.uri,
    content: "",
    fileService,
    openerService
  });
  await openerService.open(promptUri);
  const editor = getCodeEditor(editorService.activeTextEditorControl);
  if (editor && editor.hasModel() && isEqual(editor.getModel().uri, promptUri)) {
    const languageId = type === "instructions" ? INSTRUCTIONS_LANGUAGE_ID : PROMPT_LANGUAGE_ID;
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
  notificationService.prompt(Severity.Info, localize("workbench.command.prompts.create.user.enable-sync-notification", "Do you want to backup and sync your user prompt and instruction files with Setting Sync?'"), [
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
}, "command");
function register(type, id, title) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id,
    weight: 200,
    handler: /* @__PURE__ */ __name(async (accessor) => {
      return command(accessor, type);
    }, "handler"),
    when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id,
      title,
      category: CHAT_CATEGORY
    },
    when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
  });
}
__name(register, "register");
const NEW_PROMPT_COMMAND_ID = "workbench.command.new.prompt";
const NEW_INSTRUCTIONS_COMMAND_ID = "workbench.command.new.instructions";
register("instructions", NEW_INSTRUCTIONS_COMMAND_ID, localize("commands.new.instructions.local.title", "New Instructions File..."));
register("prompt", NEW_PROMPT_COMMAND_ID, localize("commands.new.prompt.local.title", "New Prompt File..."));
export {
  NEW_INSTRUCTIONS_COMMAND_ID,
  NEW_PROMPT_COMMAND_ID
};
//# sourceMappingURL=createPromptCommand.js.map
