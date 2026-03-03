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
import { PromptsService } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsServiceImpl.js";
import { PromptFilesLocator } from "../../../../workbench/contrib/chat/common/promptSyntax/utils/promptFilesLocator.js";
import { Event } from "../../../../base/common/event.js";
import { basename, isEqualOrParent, joinPath } from "../../../../base/common/resources.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { HOOKS_SOURCE_FOLDER } from "../../../../workbench/contrib/chat/common/promptSyntax/config/promptFileLocations.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { PromptsStorage } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { IWorkbenchEnvironmentService } from "../../../../workbench/services/environment/common/environmentService.js";
import { IPathService } from "../../../../workbench/services/path/common/pathService.js";
import { ISearchService } from "../../../../workbench/services/search/common/search.js";
import { IUserDataProfileService } from "../../../../workbench/services/userDataProfile/common/userDataProfile.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
class AgenticPromptsService extends PromptsService {
  static {
    __name(this, "AgenticPromptsService");
  }
  createPromptFilesLocator() {
    return this.instantiationService.createInstance(AgenticPromptFilesLocator);
  }
  getCopilotRoot() {
    if (!this._copilotRoot) {
      const pathService = this.instantiationService.invokeFunction((accessor) => accessor.get(IPathService));
      this._copilotRoot = joinPath(pathService.userHome({ preferLocal: true }), ".copilot");
    }
    return this._copilotRoot;
  }
  /**
   * Override to use ~/.copilot as the user-level source folder for creation,
   * instead of the VS Code profile's promptsHome.
   */
  async getSourceFolders(type) {
    const folders = await super.getSourceFolders(type);
    const copilotRoot = this.getCopilotRoot();
    return folders.map((folder) => {
      if (folder.storage === PromptsStorage.user) {
        const subfolder = getCliUserSubfolder(type);
        return subfolder ? { ...folder, uri: joinPath(copilotRoot, subfolder) } : folder;
      }
      return folder;
    });
  }
}
let AgenticPromptFilesLocator = class AgenticPromptFilesLocator2 extends PromptFilesLocator {
  static {
    __name(this, "AgenticPromptFilesLocator");
  }
  constructor(fileService, configService, workspaceService, environmentService, searchService, userDataService, logService, pathService, activeSessionService) {
    super(fileService, configService, workspaceService, environmentService, searchService, userDataService, logService, pathService);
    this.activeSessionService = activeSessionService;
  }
  getWorkspaceFolders() {
    const folder = this.getActiveWorkspaceFolder();
    return folder ? [folder] : [];
  }
  getWorkspaceFolder(resource) {
    const folder = this.getActiveWorkspaceFolder();
    if (!folder) {
      return void 0;
    }
    return isEqualOrParent(resource, folder.uri) ? folder : void 0;
  }
  onDidChangeWorkspaceFolders() {
    return Event.fromObservableLight(this.activeSessionService.activeSession);
  }
  async getHookSourceFolders() {
    const configured = await super.getHookSourceFolders();
    if (configured.length > 0) {
      return configured;
    }
    const folder = this.getActiveWorkspaceFolder();
    return folder ? [joinPath(folder.uri, HOOKS_SOURCE_FOLDER)] : [];
  }
  getActiveWorkspaceFolder() {
    const session = this.activeSessionService.getActiveSession();
    const root = session?.worktree ?? session?.repository;
    if (!root) {
      return void 0;
    }
    return {
      uri: root,
      name: basename(root),
      index: 0,
      toResource: /* @__PURE__ */ __name((relativePath) => joinPath(root, relativePath), "toResource")
    };
  }
};
AgenticPromptFilesLocator = __decorate([
  __param(0, IFileService),
  __param(1, IConfigurationService),
  __param(2, IWorkspaceContextService),
  __param(3, IWorkbenchEnvironmentService),
  __param(4, ISearchService),
  __param(5, IUserDataProfileService),
  __param(6, ILogService),
  __param(7, IPathService),
  __param(8, ISessionsManagementService)
], AgenticPromptFilesLocator);
function getCliUserSubfolder(type) {
  switch (type) {
    case PromptsType.instructions:
      return "instructions";
    case PromptsType.skill:
      return "skills";
    case PromptsType.agent:
      return "agents";
    case PromptsType.prompt:
      return "prompts";
    default:
      return void 0;
  }
}
__name(getCliUserSubfolder, "getCliUserSubfolder");
export {
  AgenticPromptsService
};
//# sourceMappingURL=promptsService.js.map
