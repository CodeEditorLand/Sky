var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { IAICustomizationWorkspaceService } from "../../common/aiCustomizationWorkspaceService.js";
import { IChatWidgetService } from "../chat.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { ChatModeKind } from "../../common/constants.js";
import { PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { getPromptFileDefaultLocations } from "../../common/promptSyntax/config/promptFileLocations.js";
import { IPromptsService, PromptsStorage } from "../../common/promptSyntax/service/promptsService.js";
import { URI } from "../../../../../base/common/uri.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { localize } from "../../../../../nls.js";
let CustomizationCreatorService = class CustomizationCreatorService2 {
  static {
    __name(this, "CustomizationCreatorService");
  }
  constructor(commandService, chatService, chatWidgetService, workspaceService, promptsService, quickInputService) {
    this.commandService = commandService;
    this.chatService = chatService;
    this.chatWidgetService = chatWidgetService;
    this.workspaceService = workspaceService;
    this.promptsService = promptsService;
    this.quickInputService = quickInputService;
  }
  async createWithAI(type) {
    const typeLabel = getTypeLabel(type);
    const name = await this.quickInputService.input({
      prompt: localize("generateName", "Name for the new {0}", typeLabel),
      placeHolder: localize("generateNamePlaceholder", "e.g., my-{0}", typeLabel),
      validateInput: /* @__PURE__ */ __name(async (value) => {
        if (!value || !value.trim()) {
          return localize("nameRequired", "Name is required");
        }
        return void 0;
      }, "validateInput")
    });
    if (!name) {
      return;
    }
    const trimmedName = name.trim();
    const targetDir = this.resolveTargetDirectory(type);
    const systemInstructions = buildAgentInstructions(type, targetDir, trimmedName);
    const userMessage = buildUserMessage(type, targetDir, trimmedName);
    await this.commandService.executeCommand("workbench.action.chat.newChat");
    const widget = this.chatWidgetService.lastFocusedWidget;
    const sessionResource = widget?.viewModel?.sessionResource;
    if (!sessionResource) {
      return;
    }
    await this.chatService.sendRequest(sessionResource, userMessage, {
      modeInfo: {
        kind: ChatModeKind.Agent,
        isBuiltin: false,
        modeId: "custom",
        applyCodeBlockSuggestionId: void 0,
        modeInstructions: {
          name: "customization-creator",
          content: systemInstructions,
          toolReferences: []
        }
      }
    });
  }
  /**
   * Resolves the workspace directory for a new customization file based on the
   * active project root.
   */
  resolveTargetDirectory(type) {
    return resolveWorkspaceTargetDirectory(this.workspaceService, type);
  }
  /**
   * Resolves the user-level directory for a new customization file.
   */
  async resolveUserDirectory(type) {
    return resolveUserTargetDirectory(this.promptsService, type);
  }
};
CustomizationCreatorService = __decorate([
  __param(0, ICommandService),
  __param(1, IChatService),
  __param(2, IChatWidgetService),
  __param(3, IAICustomizationWorkspaceService),
  __param(4, IPromptsService),
  __param(5, IQuickInputService)
], CustomizationCreatorService);
function resolveWorkspaceTargetDirectory(workspaceService, type) {
  const basePath = workspaceService.getActiveProjectRoot();
  if (!basePath) {
    return void 0;
  }
  const defaultLocations = getPromptFileDefaultLocations(type);
  const localLocation = defaultLocations.find((loc) => loc.storage === PromptsStorage.local);
  if (!localLocation) {
    return basePath;
  }
  return URI.joinPath(basePath, localLocation.path);
}
__name(resolveWorkspaceTargetDirectory, "resolveWorkspaceTargetDirectory");
async function resolveUserTargetDirectory(promptsService, type) {
  const folders = await promptsService.getSourceFolders(type);
  const userFolder = folders.find((f) => f.storage === PromptsStorage.user);
  return userFolder?.uri;
}
__name(resolveUserTargetDirectory, "resolveUserTargetDirectory");
function buildAgentInstructions(type, targetDir, name) {
  const targetHint = targetDir ? `
IMPORTANT: Save the file to this directory: ${targetDir.fsPath}. The name is "${name}".` : `
The name is "${name}".`;
  const writePolicy = `

CRITICAL WORKFLOW:
- In your VERY FIRST response, you MUST immediately create the file on disk from a starter template with placeholder content. Do not ask questions first -- write the file first so it appears in the diff view, then ask the user how they want to customize it.
- Every subsequent message from the user should result in you updating that same file on disk with the requested changes.
- Always write the complete file content, not partial diffs.${targetHint}`;
  switch (type) {
    case PromptsType.agent:
      return `You are a helpful assistant that guides users through creating a new custom AI agent.${writePolicy}

Create a file named "${name}.agent.md" with YAML frontmatter (name, description, tools) and system instructions. Ask the user what it should do.`;
    case PromptsType.skill:
      return `You are a helpful assistant that guides users through creating a new skill.${writePolicy}

Create a directory named "${name}" with a SKILL.md file inside it. The file should have YAML frontmatter (name, description) and instructions. Ask the user what it does.`;
    case PromptsType.instructions:
      return `You are a helpful assistant that guides users through creating a new instructions file.${writePolicy}

Create a file named "${name}.instructions.md" with YAML frontmatter (description, optional applyTo) and actionable content. Ask the user what it should cover.`;
    case PromptsType.prompt:
      return `You are a helpful assistant that guides users through creating a new reusable prompt.${writePolicy}

Create a file named "${name}.prompt.md" with YAML frontmatter (name, description) and prompt content. Ask the user what it should do.`;
    case PromptsType.hook:
      return `You are a helpful assistant that guides users through creating a new hook.${writePolicy}

Ask the user when the hook should trigger and what it should do, then write the configuration file.`;
    default:
      return `You are a helpful assistant that guides users through creating a new AI customization file.${writePolicy}

Ask the user what they want to create, then guide them step by step.`;
  }
}
__name(buildAgentInstructions, "buildAgentInstructions");
function buildUserMessage(type, targetDir, name) {
  const pathHint = targetDir ? ` Write it to \`${targetDir.fsPath}\`.` : "";
  switch (type) {
    case PromptsType.agent:
      return `Help me create a new custom agent called "${name}".${pathHint}`;
    case PromptsType.skill:
      return `Help me create a new skill called "${name}".${pathHint}`;
    case PromptsType.instructions:
      return `Help me create new instructions called "${name}".${pathHint}`;
    case PromptsType.prompt:
      return `Help me create a new prompt called "${name}".${pathHint}`;
    case PromptsType.hook:
      return `Help me create a new hook called "${name}".${pathHint}`;
    default:
      return `Help me create a new customization called "${name}".${pathHint}`;
  }
}
__name(buildUserMessage, "buildUserMessage");
function getTypeLabel(type) {
  switch (type) {
    case PromptsType.agent:
      return "agent";
    case PromptsType.skill:
      return "skill";
    case PromptsType.instructions:
      return "instructions";
    case PromptsType.prompt:
      return "prompt";
    case PromptsType.hook:
      return "hook";
    default:
      return "customization";
  }
}
__name(getTypeLabel, "getTypeLabel");
export {
  CustomizationCreatorService,
  resolveUserTargetDirectory,
  resolveWorkspaceTargetDirectory
};
//# sourceMappingURL=customizationCreatorService.js.map
