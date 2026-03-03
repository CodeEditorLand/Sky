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
var AICustomizationWorkspaceService_1;
import { derived, observableFromEventOpts } from "../../../../../base/common/observable.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IAICustomizationWorkspaceService, AICustomizationManagementSection } from "../../common/aiCustomizationWorkspaceService.js";
import { registerSingleton } from "../../../../../platform/instantiation/common/extensions.js";
import { PromptsStorage } from "../../common/promptSyntax/service/promptsService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { PromptsType } from "../../common/promptSyntax/promptTypes.js";
import { GENERATE_AGENT_COMMAND_ID, GENERATE_HOOK_COMMAND_ID, GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID, GENERATE_PROMPT_COMMAND_ID, GENERATE_SKILL_COMMAND_ID } from "../actions/chatActions.js";
let AICustomizationWorkspaceService = class AICustomizationWorkspaceService2 {
  static {
    __name(this, "AICustomizationWorkspaceService");
  }
  static {
    AICustomizationWorkspaceService_1 = this;
  }
  constructor(workspaceContextService, commandService) {
    this.workspaceContextService = workspaceContextService;
    this.commandService = commandService;
    this.managementSections = [
      AICustomizationManagementSection.Agents,
      AICustomizationManagementSection.Skills,
      AICustomizationManagementSection.Instructions,
      AICustomizationManagementSection.Prompts,
      AICustomizationManagementSection.Hooks,
      AICustomizationManagementSection.McpServers
    ];
    this.isSessionsWindow = false;
    const workspaceFolders = observableFromEventOpts({ owner: this }, this.workspaceContextService.onDidChangeWorkspaceFolders, () => this.workspaceContextService.getWorkspace().folders);
    this.activeProjectRoot = derived((reader) => {
      const folders = workspaceFolders.read(reader);
      return folders[0]?.uri;
    });
  }
  getActiveProjectRoot() {
    const folders = this.workspaceContextService.getWorkspace().folders;
    return folders[0]?.uri;
  }
  static {
    this._defaultFilter = {
      sources: [PromptsStorage.local, PromptsStorage.user, PromptsStorage.extension, PromptsStorage.plugin]
    };
  }
  getStorageSourceFilter(_type) {
    return AICustomizationWorkspaceService_1._defaultFilter;
  }
  async commitFiles(_projectRoot, _fileUris) {
  }
  async generateCustomization(type) {
    const commandIds = {
      [PromptsType.agent]: GENERATE_AGENT_COMMAND_ID,
      [PromptsType.skill]: GENERATE_SKILL_COMMAND_ID,
      [PromptsType.instructions]: GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID,
      [PromptsType.prompt]: GENERATE_PROMPT_COMMAND_ID,
      [PromptsType.hook]: GENERATE_HOOK_COMMAND_ID
    };
    const commandId = commandIds[type];
    if (commandId) {
      await this.commandService.executeCommand(commandId);
    }
  }
};
AICustomizationWorkspaceService = AICustomizationWorkspaceService_1 = __decorate([
  __param(0, IWorkspaceContextService),
  __param(1, ICommandService)
], AICustomizationWorkspaceService);
registerSingleton(
  IAICustomizationWorkspaceService,
  AICustomizationWorkspaceService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=aiCustomizationWorkspaceService.js.map
