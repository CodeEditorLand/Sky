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
import { FileAccess } from "../../../../base/common/network.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { HOOKS_SOURCE_FOLDER, getCleanPromptName } from "../../../../workbench/contrib/chat/common/promptSyntax/config/promptFileLocations.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { PromptsStorage } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { BUILTIN_STORAGE } from "../../chat/common/builtinPromptsStorage.js";
import { IWorkbenchEnvironmentService } from "../../../../workbench/services/environment/common/environmentService.js";
import { IPathService } from "../../../../workbench/services/path/common/pathService.js";
import { ISearchService } from "../../../../workbench/services/search/common/search.js";
import { IUserDataProfileService } from "../../../../workbench/services/userDataProfile/common/userDataProfile.js";
import { IAICustomizationWorkspaceService } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
const BUILTIN_PROMPTS_URI = FileAccess.asFileUri("vs/sessions/prompts");
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
   * Returns built-in prompt files bundled with the Sessions app.
   */
  async getBuiltinPromptFiles(type) {
    if (type !== PromptsType.prompt) {
      return [];
    }
    if (!this._builtinPromptsCache) {
      this._builtinPromptsCache = /* @__PURE__ */ new Map();
    }
    let cached = this._builtinPromptsCache.get(type);
    if (!cached) {
      cached = this.discoverBuiltinPrompts(type);
      this._builtinPromptsCache.set(type, cached);
    }
    return cached;
  }
  async discoverBuiltinPrompts(type) {
    const fileService = this.instantiationService.invokeFunction((accessor) => accessor.get(IFileService));
    const promptsDir = FileAccess.asFileUri("vs/sessions/prompts");
    try {
      const stat = await fileService.resolve(promptsDir);
      if (!stat.children) {
        return [];
      }
      return stat.children.filter((child) => !child.isDirectory && child.name.endsWith(".prompt.md")).map((child) => ({ uri: child.resource, storage: BUILTIN_STORAGE, type }));
    } catch {
      return [];
    }
  }
  /**
   * Override to include built-in prompts and filter out those overridden
   * by user or workspace prompts with the same name.
   */
  async listPromptFiles(type, token) {
    const baseResults = await super.listPromptFiles(type, token);
    const builtinPrompts = await this.getBuiltinPromptFiles(type);
    if (builtinPrompts.length === 0) {
      return baseResults;
    }
    const overriddenNames = /* @__PURE__ */ new Set();
    for (const p of baseResults) {
      if (p.storage === PromptsStorage.local || p.storage === PromptsStorage.user) {
        overriddenNames.add(getCleanPromptName(p.uri));
      }
    }
    const nonOverridden = builtinPrompts.filter((p) => !overriddenNames.has(getCleanPromptName(p.uri)));
    return [...baseResults, ...nonOverridden];
  }
  async listPromptFilesForStorage(type, storage, token) {
    if (storage === BUILTIN_STORAGE) {
      return this.getBuiltinPromptFiles(type);
    }
    return super.listPromptFilesForStorage(type, storage, token);
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
  constructor(fileService, configService, workspaceService, environmentService, searchService, userDataService, logService, pathService, workspaceTrustManagementService, customizationWorkspaceService) {
    super(fileService, configService, workspaceService, environmentService, searchService, userDataService, logService, pathService, workspaceTrustManagementService);
    this.customizationWorkspaceService = customizationWorkspaceService;
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
    return Event.fromObservableLight(this.customizationWorkspaceService.activeProjectRoot);
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
    const root = this.customizationWorkspaceService.getActiveProjectRoot();
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
  __param(8, IWorkspaceTrustManagementService),
  __param(9, IAICustomizationWorkspaceService)
], AgenticPromptFilesLocator);
function getCliUserSubfolder(type) {
  switch (type) {
    case PromptsType.instructions:
      return "instructions";
    case PromptsType.skill:
      return "skills";
    case PromptsType.agent:
      return "agents";
    default:
      return void 0;
  }
}
__name(getCliUserSubfolder, "getCliUserSubfolder");
export {
  AgenticPromptsService,
  BUILTIN_PROMPTS_URI
};
//# sourceMappingURL=promptsService.js.map
