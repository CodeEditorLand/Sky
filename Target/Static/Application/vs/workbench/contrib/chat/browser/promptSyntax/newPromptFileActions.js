var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isEqual } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { getCodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { SnippetController2 } from "../../../../../editor/contrib/snippet/browser/snippetController2.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { INotificationService, NeverShowAgainScope, Severity } from "../../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { getLanguageIdForPromptsType, PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { IUserDataSyncEnablementService } from "../../../../../platform/userDataSync/common/userDataSync.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { CONFIGURE_SYNC_COMMAND_ID } from "../../../../services/userDataSync/common/userDataSync.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { CHAT_CATEGORY } from "../actions/chatActions.js";
import { askForPromptFileName } from "./pickers/askForPromptName.js";
import { askForPromptSourceFolder } from "./pickers/askForPromptSourceFolder.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { getCleanPromptName, SKILL_FILENAME, HOOKS_FILENAME } from "../../common/promptSyntax/config/promptFileLocations.js";
import { HOOK_TYPES } from "../../common/promptSyntax/hookSchema.js";
import { findHookCommandSelection } from "./hookUtils.js";
import { IBulkEditService, ResourceTextEdit } from "../../../../../editor/browser/services/bulkEditService.js";
import { Range } from "../../../../../editor/common/core/range.js";
class AbstractNewPromptFileAction extends Action2 {
  static {
    __name(this, "AbstractNewPromptFileAction");
  }
  constructor(id, title, type) {
    super({
      id,
      title,
      f1: false,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200
        /* KeybindingWeight.WorkbenchContrib */
      },
      menu: {
        id: MenuId.CommandPalette,
        when: ChatContextKeys.enabled
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
    const cleanName = getCleanPromptName(promptUri);
    const editor = getCodeEditor(editorService.activeTextEditorControl);
    if (editor && editor.hasModel() && isEqual(editor.getModel().uri, promptUri)) {
      SnippetController2.get(editor)?.apply([{
        range: editor.getModel().getFullModelRange(),
        template: getDefaultContentSnippet(this.type, cleanName)
      }]);
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
    notificationService.prompt(Severity.Info, localize("workbench.command.prompts.create.user.enable-sync-notification", "Do you want to backup and sync your user prompt, instruction and custom agent files with Setting Sync?'"), [
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
function getDefaultContentSnippet(promptType, name) {
  switch (promptType) {
    case PromptsType.prompt:
      return [
        `---`,
        `name: ${name ?? "${1:prompt-name}"}`,
        `description: \${2:Describe when to use this prompt}`,
        `---`,
        `\${3:Define the prompt content here. You can include instructions, examples, and any other relevant information to guide the AI's responses.}`
      ].join("\n");
    case PromptsType.instructions:
      return [
        `---`,
        `description: \${1:Describe when these instructions should be loaded}`,
        `# applyTo: '\${1|**,**/*.ts|}' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file`,
        `---`,
        `\${2:Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.}`
      ].join("\n");
    case PromptsType.agent:
      return [
        `---`,
        `name: ${name ?? "${1:agent-name}"}`,
        `description: \${2:Describe what this custom agent does and when to use it.}`,
        `argument-hint: \${3:The inputs this agent expects, e.g., "a task to implement" or "a question to answer".}`,
        `# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.`,
        `---`,
        `\${4:Define what this custom agent does, including its behavior, capabilities, and any specific instructions for its operation.}`
      ].join("\n");
    case PromptsType.skill:
      return [
        `---`,
        `name: ${name ?? "${1:skill-name}"}`,
        `description: \${2:Describe what this skill does and when to use it. Include keywords that help agents identify relevant tasks.}`,
        `---`,
        `\${3:Define the functionality provided by this skill, including detailed instructions and examples}`
      ].join("\n");
    case PromptsType.hook:
      return JSON.stringify({
        version: 1,
        hooks: {}
      }, null, 4);
    default:
      throw new Error(`Unsupported prompt type: ${promptType}`);
  }
}
__name(getDefaultContentSnippet, "getDefaultContentSnippet");
const NEW_PROMPT_COMMAND_ID = "workbench.command.new.prompt";
const NEW_INSTRUCTIONS_COMMAND_ID = "workbench.command.new.instructions";
const NEW_AGENT_COMMAND_ID = "workbench.command.new.agent";
const NEW_SKILL_COMMAND_ID = "workbench.command.new.skill";
const NEW_HOOK_COMMAND_ID = "workbench.command.new.hook";
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
class NewAgentFileAction extends AbstractNewPromptFileAction {
  static {
    __name(this, "NewAgentFileAction");
  }
  constructor() {
    super(NEW_AGENT_COMMAND_ID, localize("commands.new.agent.local.title", "New Custom Agent..."), PromptsType.agent);
  }
}
class NewSkillFileAction extends Action2 {
  static {
    __name(this, "NewSkillFileAction");
  }
  constructor() {
    super({
      id: NEW_SKILL_COMMAND_ID,
      title: localize("commands.new.skill.local.title", "New Skill File..."),
      f1: false,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200
        /* KeybindingWeight.WorkbenchContrib */
      },
      menu: {
        id: MenuId.CommandPalette,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor) {
    const openerService = accessor.get(IOpenerService);
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const instaService = accessor.get(IInstantiationService);
    const quickInputService = accessor.get(IQuickInputService);
    const selectedFolder = await instaService.invokeFunction(askForPromptSourceFolder, PromptsType.skill);
    if (!selectedFolder) {
      return;
    }
    const skillName = await quickInputService.input({
      prompt: localize("commands.new.skill.name.prompt", "Enter a name for the skill (lowercase letters, numbers, and hyphens only)"),
      placeHolder: localize("commands.new.skill.name.placeholder", "e.g., pdf-processing, data-analysis"),
      validateInput: /* @__PURE__ */ __name(async (value) => {
        if (!value || !value.trim()) {
          return localize("commands.new.skill.name.required", "Skill name is required");
        }
        const name = value.trim();
        if (name.length > 64) {
          return localize("commands.new.skill.name.tooLong", "Skill name must be 64 characters or less");
        }
        if (!/^[a-z0-9-]+$/.test(name)) {
          return localize("commands.new.skill.name.invalidChars", "Skill name may only contain lowercase letters, numbers, and hyphens");
        }
        if (name.startsWith("-") || name.endsWith("-")) {
          return localize("commands.new.skill.name.hyphenEdge", "Skill name must not start or end with a hyphen");
        }
        if (name.includes("--")) {
          return localize("commands.new.skill.name.consecutiveHyphens", "Skill name must not contain consecutive hyphens");
        }
        return void 0;
      }, "validateInput")
    });
    if (!skillName) {
      return;
    }
    const trimmedName = skillName.trim();
    const skillFolder = URI.joinPath(selectedFolder.uri, trimmedName);
    await fileService.createFolder(skillFolder);
    const skillFileUri = URI.joinPath(skillFolder, SKILL_FILENAME);
    await fileService.createFile(skillFileUri);
    await openerService.open(skillFileUri);
    const editor = getCodeEditor(editorService.activeTextEditorControl);
    if (editor && editor.hasModel() && isEqual(editor.getModel().uri, skillFileUri)) {
      SnippetController2.get(editor)?.apply([{
        range: editor.getModel().getFullModelRange(),
        template: getDefaultContentSnippet(PromptsType.skill, trimmedName)
      }]);
    }
  }
}
class NewHookFileAction extends Action2 {
  static {
    __name(this, "NewHookFileAction");
  }
  constructor() {
    super({
      id: NEW_HOOK_COMMAND_ID,
      title: localize("commands.new.hook.local.title", "New Hook..."),
      f1: false,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200
        /* KeybindingWeight.WorkbenchContrib */
      },
      menu: {
        id: MenuId.CommandPalette,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const fileService = accessor.get(IFileService);
    const instaService = accessor.get(IInstantiationService);
    const quickInputService = accessor.get(IQuickInputService);
    const bulkEditService = accessor.get(IBulkEditService);
    const selectedFolder = await instaService.invokeFunction(askForPromptSourceFolder, PromptsType.hook);
    if (!selectedFolder) {
      return;
    }
    const hookTypeItems = HOOK_TYPES.map((hookType) => ({
      id: hookType.id,
      label: hookType.label,
      description: hookType.description
    }));
    const selectedHookType = await quickInputService.pick(hookTypeItems, {
      placeHolder: localize("commands.new.hook.type.placeholder", "Select a hook type to add"),
      title: localize("commands.new.hook.type.title", "Add Hook")
    });
    if (!selectedHookType) {
      return;
    }
    await fileService.createFolder(selectedFolder.uri);
    const hookFileUri = URI.joinPath(selectedFolder.uri, HOOKS_FILENAME);
    let hooksContent;
    const fileExists = await fileService.exists(hookFileUri);
    if (fileExists) {
      const existingContent = await fileService.readFile(hookFileUri);
      try {
        hooksContent = JSON.parse(existingContent.value.toString());
        if (!hooksContent.hooks) {
          hooksContent.hooks = {};
        }
      } catch {
        const notificationService = accessor.get(INotificationService);
        notificationService.error(localize("commands.new.hook.parseError", "Failed to parse existing hooks.json. Please fix the JSON syntax errors and try again."));
        await editorService.openEditor({ resource: hookFileUri });
        return;
      }
    } else {
      hooksContent = { version: 1, hooks: {} };
    }
    const hookTypeId = selectedHookType.id;
    const newHookEntry = {
      type: "command",
      command: ""
    };
    let newHookIndex;
    if (!hooksContent.hooks[hookTypeId]) {
      hooksContent.hooks[hookTypeId] = [newHookEntry];
      newHookIndex = 0;
    } else {
      hooksContent.hooks[hookTypeId].push(newHookEntry);
      newHookIndex = hooksContent.hooks[hookTypeId].length - 1;
    }
    const jsonContent = JSON.stringify(hooksContent, null, "	");
    const existingEditor = editorService.editors.find((e) => isEqual(e.resource, hookFileUri));
    if (existingEditor) {
      await editorService.openEditor({
        resource: hookFileUri,
        options: {
          pinned: false
        }
      });
      const editor = getCodeEditor(editorService.activeTextEditorControl);
      if (editor && editor.hasModel() && isEqual(editor.getModel().uri, hookFileUri)) {
        const model = editor.getModel();
        model.pushEditOperations([], [{
          range: model.getFullModelRange(),
          text: jsonContent
        }], () => null);
        const selection = findHookCommandSelection(jsonContent, hookTypeId, newHookIndex, "command");
        if (selection && selection.endLineNumber !== void 0 && selection.endColumn !== void 0) {
          editor.setSelection({
            startLineNumber: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLineNumber: selection.endLineNumber,
            endColumn: selection.endColumn
          });
          editor.revealLineInCenter(selection.startLineNumber);
        }
      }
    } else {
      if (!fileExists) {
        await fileService.writeFile(hookFileUri, VSBuffer.fromString(jsonContent));
      } else {
        await editorService.openEditor({
          resource: hookFileUri,
          options: { pinned: false }
        });
        await bulkEditService.apply([
          new ResourceTextEdit(hookFileUri, { range: new Range(1, 1, Number.MAX_SAFE_INTEGER, 1), text: jsonContent })
        ], { label: localize("addHook", "Add Hook") });
      }
      const selection = findHookCommandSelection(jsonContent, hookTypeId, newHookIndex, "command");
      await editorService.openEditor({
        resource: hookFileUri,
        options: {
          selection,
          pinned: false
        }
      });
    }
  }
}
class NewUntitledPromptFileAction extends Action2 {
  static {
    __name(this, "NewUntitledPromptFileAction");
  }
  constructor() {
    super({
      id: "workbench.command.new.untitled.prompt",
      title: localize2("commands.new.untitled.prompt.title", "New Untitled Prompt File"),
      f1: true,
      precondition: ChatContextKeys.enabled,
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200
        /* KeybindingWeight.WorkbenchContrib */
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const languageId = getLanguageIdForPromptsType(PromptsType.prompt);
    const input = await editorService.openEditor({
      resource: void 0,
      languageId,
      options: {
        pinned: true
      }
    });
    const type = PromptsType.prompt;
    const editor = getCodeEditor(editorService.activeTextEditorControl);
    if (editor && editor.hasModel()) {
      SnippetController2.get(editor)?.apply([{
        range: editor.getModel().getFullModelRange(),
        template: getDefaultContentSnippet(type, void 0)
      }]);
    }
    return input;
  }
}
function registerNewPromptFileActions() {
  registerAction2(NewPromptFileAction);
  registerAction2(NewInstructionsFileAction);
  registerAction2(NewAgentFileAction);
  registerAction2(NewSkillFileAction);
  registerAction2(NewHookFileAction);
  registerAction2(NewUntitledPromptFileAction);
}
__name(registerNewPromptFileActions, "registerNewPromptFileActions");
export {
  NEW_AGENT_COMMAND_ID,
  NEW_HOOK_COMMAND_ID,
  NEW_INSTRUCTIONS_COMMAND_ID,
  NEW_PROMPT_COMMAND_ID,
  NEW_SKILL_COMMAND_ID,
  registerNewPromptFileActions
};
//# sourceMappingURL=newPromptFileActions.js.map
