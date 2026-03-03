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
var SessionsAICustomizationWorkspaceService_1;
import { derived } from "../../../../base/common/observable.js";
import { joinPath } from "../../../../base/common/resources.js";
import { AICustomizationManagementSection } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { PromptsStorage } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { CustomizationCreatorService } from "../../../../workbench/contrib/chat/browser/aiCustomization/customizationCreatorService.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { IPathService } from "../../../../workbench/services/path/common/pathService.js";
let SessionsAICustomizationWorkspaceService = class SessionsAICustomizationWorkspaceService2 {
  static {
    __name(this, "SessionsAICustomizationWorkspaceService");
  }
  static {
    SessionsAICustomizationWorkspaceService_1 = this;
  }
  constructor(sessionsService, instantiationService, pathService) {
    this.sessionsService = sessionsService;
    this.instantiationService = instantiationService;
    this.managementSections = [
      AICustomizationManagementSection.Agents,
      AICustomizationManagementSection.Skills,
      AICustomizationManagementSection.Instructions,
      AICustomizationManagementSection.Prompts,
      AICustomizationManagementSection.Hooks
      // TODO: Re-enable MCP Servers once CLI MCP configuration is unified with VS Code
      // AICustomizationManagementSection.McpServers,
    ];
    this.isSessionsWindow = true;
    const userHome = pathService.userHome({ preferLocal: true });
    this._cliUserRoots = [
      joinPath(userHome, ".copilot"),
      joinPath(userHome, ".claude"),
      joinPath(userHome, ".agents")
    ];
    this._cliUserFilter = {
      sources: [PromptsStorage.local, PromptsStorage.user],
      includedUserFileRoots: this._cliUserRoots
    };
    this.activeProjectRoot = derived((reader) => {
      const session = this.sessionsService.activeSession.read(reader);
      return session?.worktree ?? session?.repository;
    });
  }
  getActiveProjectRoot() {
    const session = this.sessionsService.getActiveSession();
    return session?.worktree ?? session?.repository;
  }
  static {
    this._hooksFilter = {
      sources: [PromptsStorage.local]
    };
  }
  static {
    this._allUserRootsFilter = {
      sources: [PromptsStorage.local, PromptsStorage.user]
    };
  }
  getStorageSourceFilter(type) {
    if (type === PromptsType.hook) {
      return SessionsAICustomizationWorkspaceService_1._hooksFilter;
    }
    if (type === PromptsType.prompt) {
      return SessionsAICustomizationWorkspaceService_1._allUserRootsFilter;
    }
    return this._cliUserFilter;
  }
  async commitFiles(projectRoot, fileUris) {
    const session = this.sessionsService.getActiveSession();
    if (session) {
      await this.sessionsService.commitWorktreeFiles(session, fileUris);
    }
  }
  async generateCustomization(type) {
    const creator = this.instantiationService.createInstance(CustomizationCreatorService);
    await creator.createWithAI(type);
  }
};
SessionsAICustomizationWorkspaceService = SessionsAICustomizationWorkspaceService_1 = __decorate([
  __param(0, ISessionsManagementService),
  __param(1, IInstantiationService),
  __param(2, IPathService)
], SessionsAICustomizationWorkspaceService);
export {
  SessionsAICustomizationWorkspaceService
};
//# sourceMappingURL=aiCustomizationWorkspaceService.js.map
