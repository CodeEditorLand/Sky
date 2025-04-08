var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../nls.js";
import { createPromptFile } from "./utils/createPromptFile.js";
import { CHAT_CATEGORY } from "../../../actions/chatActions.js";
import { askForPromptName } from "./dialogs/askForPromptName.js";
import { ChatContextKeys } from "../../../../common/chatContextKeys.js";
import { ILogService } from "../../../../../../../platform/log/common/log.js";
import { askForPromptSourceFolder } from "./dialogs/askForPromptSourceFolder.js";
import { IFileService } from "../../../../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../../../platform/opener/common/opener.js";
import { PromptsConfig } from "../../../../../../../platform/prompts/common/config.js";
import { ICommandService } from "../../../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../../../platform/contextkey/common/contextkey.js";
import { MenuId, MenuRegistry } from "../../../../../../../platform/actions/common/actions.js";
import { IPromptPath, IPromptsService } from "../../../../common/promptSyntax/service/types.js";
import { IQuickInputService } from "../../../../../../../platform/quickinput/common/quickInput.js";
import { ServicesAccessor } from "../../../../../../../platform/instantiation/common/instantiation.js";
import { IWorkspaceContextService } from "../../../../../../../platform/workspace/common/workspace.js";
import { CONFIGURE_SYNC_COMMAND_ID } from "../../../../../../services/userDataSync/common/userDataSync.js";
import { IUserDataSyncEnablementService, SyncResource } from "../../../../../../../platform/userDataSync/common/userDataSync.js";
import { KeybindingsRegistry, KeybindingWeight } from "../../../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { INotificationService, NeverShowAgainScope, Severity } from "../../../../../../../platform/notification/common/notification.js";
const BASE_COMMAND_ID = "workbench.command.prompts.create";
const LOCAL_COMMAND_ID = `${BASE_COMMAND_ID}.local`;
const USER_COMMAND_ID = `${BASE_COMMAND_ID}.user`;
const LOCAL_COMMAND_TITLE = localize("commands.prompts.create.title.local", "Create Prompt");
const USER_COMMAND_TITLE = localize("commands.prompts.create.title.user", "Create User Prompt");
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
  const fileName = await askForPromptName(type, quickInputService);
  if (!fileName) {
    return;
  }
  const selectedFolder = await askForPromptSourceFolder({
    type,
    labelService,
    openerService,
    promptsService,
    workspaceService,
    quickInputService
  });
  if (!selectedFolder) {
    return;
  }
  const content = localize(
    "workbench.command.prompts.create.initial-content",
    "Add prompt contents..."
  );
  const promptUri = await createPromptFile({
    fileName,
    folder: selectedFolder,
    content,
    fileService,
    openerService
  });
  await openerService.open(promptUri);
  if (type !== "user") {
    return;
  }
  const isConfigured = userDataSyncEnablementService.isResourceEnablementConfigured(SyncResource.Prompts);
  const isSettingsSyncEnabled = userDataSyncEnablementService.isEnabled();
  if (isConfigured === true || isSettingsSyncEnabled === false) {
    return;
  }
  notificationService.prompt(
    Severity.Info,
    localize(
      "workbench.command.prompts.create.user.enable-sync-notification",
      "User prompts are not currently synchronized. Do you want to enable synchronization of the user prompts?"
    ),
    [
      {
        label: localize("enable.capitalized", "Enable"),
        run: /* @__PURE__ */ __name(() => {
          commandService.executeCommand(CONFIGURE_SYNC_COMMAND_ID).catch((error) => {
            logService.error(`Failed to run '${CONFIGURE_SYNC_COMMAND_ID}' command: ${error}.`);
          });
        }, "run")
      }
    ],
    {
      neverShowAgain: {
        id: "workbench.command.prompts.create.user.enable-sync-notification",
        scope: NeverShowAgainScope.PROFILE
      }
    }
  );
}, "command");
const commandFactory = /* @__PURE__ */ __name((type) => {
  return async (accessor) => {
    return command(accessor, type);
  };
}, "commandFactory");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: LOCAL_COMMAND_ID,
  weight: KeybindingWeight.WorkbenchContrib,
  handler: commandFactory("local"),
  when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: USER_COMMAND_ID,
  weight: KeybindingWeight.WorkbenchContrib,
  handler: commandFactory("user"),
  when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: LOCAL_COMMAND_ID,
    title: LOCAL_COMMAND_TITLE,
    category: CHAT_CATEGORY
  },
  when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: USER_COMMAND_ID,
    title: USER_COMMAND_TITLE,
    category: CHAT_CATEGORY
  },
  when: ContextKeyExpr.and(PromptsConfig.enabledCtx, ChatContextKeys.enabled)
});
//# sourceMappingURL=createPromptCommand.js.map
