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
import { derived, observableValue } from "../../../../base/common/observable.js";
import { joinPath, relativePath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { AICustomizationManagementSection, applyStorageSourceFilter } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { IPromptsService, PromptsStorage } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { BUILTIN_STORAGE } from "../../chat/common/builtinPromptsStorage.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { CustomizationCreatorService } from "../../../../workbench/contrib/chat/browser/aiCustomization/customizationCreatorService.js";
import { PromptsType } from "../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js";
import { IPathService } from "../../../../workbench/services/path/common/pathService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { localize } from "../../../../nls.js";
let SessionsAICustomizationWorkspaceService = class SessionsAICustomizationWorkspaceService2 {
  static {
    __name(this, "SessionsAICustomizationWorkspaceService");
  }
  static {
    SessionsAICustomizationWorkspaceService_1 = this;
  }
  constructor(sessionsService, instantiationService, promptsService, pathService, commandService, logService, fileService, notificationService) {
    this.sessionsService = sessionsService;
    this.instantiationService = instantiationService;
    this.promptsService = promptsService;
    this.commandService = commandService;
    this.logService = logService;
    this.fileService = fileService;
    this.notificationService = notificationService;
    this.managementSections = [
      AICustomizationManagementSection.Agents,
      AICustomizationManagementSection.Skills,
      AICustomizationManagementSection.Instructions,
      AICustomizationManagementSection.Prompts,
      AICustomizationManagementSection.Hooks,
      AICustomizationManagementSection.McpServers,
      AICustomizationManagementSection.Plugins
    ];
    this.isSessionsWindow = true;
    const userHome = pathService.userHome({ preferLocal: true });
    this._cliUserRoots = [
      joinPath(userHome, ".copilot"),
      joinPath(userHome, ".claude"),
      joinPath(userHome, ".agents")
    ];
    this._cliUserFilter = {
      sources: [PromptsStorage.local, PromptsStorage.user, PromptsStorage.plugin, BUILTIN_STORAGE],
      includedUserFileRoots: this._cliUserRoots
    };
    this._overrideRoot = observableValue(this, void 0);
    this.activeProjectRoot = derived((reader) => {
      const override = this._overrideRoot.read(reader);
      if (override) {
        return override;
      }
      const session = this.sessionsService.activeSession.read(reader);
      return session?.worktree ?? session?.repository;
    });
    this.hasOverrideProjectRoot = derived((reader) => {
      return this._overrideRoot.read(reader) !== void 0;
    });
  }
  getActiveProjectRoot() {
    const override = this._overrideRoot.get();
    if (override) {
      return override;
    }
    const session = this.sessionsService.getActiveSession();
    return session?.worktree ?? session?.repository;
  }
  setOverrideProjectRoot(root) {
    this._overrideRoot.set(root, void 0);
  }
  clearOverrideProjectRoot() {
    this._overrideRoot.set(void 0, void 0);
  }
  static {
    this._hooksFilter = {
      sources: [PromptsStorage.local, PromptsStorage.plugin]
    };
  }
  static {
    this._allUserRootsFilter = {
      sources: [PromptsStorage.local, PromptsStorage.user, PromptsStorage.plugin, BUILTIN_STORAGE]
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
  /**
   * Commits customization files. Always commits to the main repository
   * so the change persists across worktrees. When a worktree is active
   * the file is also committed there so the session sees it immediately.
   */
  async commitFiles(_projectRoot, fileUris) {
    const session = this.sessionsService.getActiveSession();
    if (!session?.repository) {
      return;
    }
    for (const fileUri of fileUris) {
      await this.commitFileToRepos(fileUri, session.repository, session.worktree);
    }
  }
  /**
   * Commits the deletion of files that have already been removed from disk.
   * Always stages + commits the removal in the main repository, and also
   * in the worktree if one is active.
   */
  async deleteFiles(_projectRoot, fileUris) {
    const session = this.sessionsService.getActiveSession();
    if (!session?.repository) {
      return;
    }
    for (const fileUri of fileUris) {
      await this.commitDeletionToRepos(fileUri, session.repository, session.worktree);
    }
  }
  /**
   * Computes the repository-relative path for a file. The file may be
   * located under the worktree or the repository root.
   */
  getRelativePath(fileUri, repositoryUri, worktreeUri) {
    if (worktreeUri) {
      const rel = relativePath(worktreeUri, fileUri);
      if (rel) {
        return rel;
      }
    }
    return relativePath(repositoryUri, fileUri);
  }
  /**
   * Commits a single file to the main repository and optionally the worktree.
   * Copies the file content between trees when needed.
   */
  async commitFileToRepos(fileUri, repositoryUri, worktreeUri) {
    const relPath = this.getRelativePath(fileUri, repositoryUri, worktreeUri);
    if (!relPath) {
      return;
    }
    const repoFileUri = URI.joinPath(repositoryUri, relPath);
    try {
      if (repoFileUri.toString() !== fileUri.toString()) {
        const content = await this.fileService.readFile(fileUri);
        await this.fileService.writeFile(repoFileUri, content.value);
      }
      await this.commandService.executeCommand("github.copilot.cli.sessions.commitToRepository", { repositoryUri, fileUri: repoFileUri });
    } catch (error) {
      this.logService.error("[SessionsAICustomizationWorkspaceService] Failed to commit to repository:", error);
      if (worktreeUri) {
        this.notificationService.notify({
          severity: Severity.Warning,
          message: localize("commitToRepoFailed", "Your customization was saved to this session's worktree, but we couldn't apply it to the default branch. You may need to apply it manually.")
        });
      }
    }
    if (worktreeUri) {
      const worktreeFileUri = URI.joinPath(worktreeUri, relPath);
      try {
        if (worktreeFileUri.toString() !== fileUri.toString()) {
          const content = await this.fileService.readFile(fileUri);
          await this.fileService.writeFile(worktreeFileUri, content.value);
        }
        await this.commandService.executeCommand("github.copilot.cli.sessions.commitToWorktree", { worktreeUri, fileUri: worktreeFileUri });
      } catch (error) {
        this.logService.error("[SessionsAICustomizationWorkspaceService] Failed to commit to worktree:", error);
      }
    }
  }
  /**
   * Commits the deletion of a file to the main repository and optionally
   * the worktree. The file is already deleted from disk before this is called;
   * `git add` on a deleted path stages the removal.
   */
  async commitDeletionToRepos(fileUri, repositoryUri, worktreeUri) {
    const relPath = this.getRelativePath(fileUri, repositoryUri, worktreeUri);
    if (!relPath) {
      return;
    }
    const repoFileUri = URI.joinPath(repositoryUri, relPath);
    try {
      if (await this.fileService.exists(repoFileUri)) {
        await this.fileService.del(repoFileUri, { useTrash: true, recursive: true });
      }
      await this.commandService.executeCommand("github.copilot.cli.sessions.commitToRepository", { repositoryUri, fileUri: repoFileUri });
    } catch (error) {
      this.logService.error("[SessionsAICustomizationWorkspaceService] Failed to commit deletion to repository:", error);
      if (worktreeUri) {
        this.notificationService.notify({
          severity: Severity.Warning,
          message: localize("deleteFromRepoFailed", "Your customization was removed from this session's worktree, but we couldn't apply the change to the default branch. You may need to remove it manually.")
        });
      }
    }
    if (worktreeUri) {
      const worktreeFileUri = URI.joinPath(worktreeUri, relPath);
      try {
        await this.commandService.executeCommand("github.copilot.cli.sessions.commitToWorktree", { worktreeUri, fileUri: worktreeFileUri });
      } catch (error) {
        this.logService.error("[SessionsAICustomizationWorkspaceService] Failed to commit deletion to worktree:", error);
      }
    }
  }
  async generateCustomization(type) {
    const creator = this.instantiationService.createInstance(CustomizationCreatorService);
    await creator.createWithAI(type);
  }
  async getFilteredPromptSlashCommands(token) {
    const allCommands = await this.promptsService.getPromptSlashCommands(token);
    return allCommands.filter((cmd) => {
      const filter = this.getStorageSourceFilter(cmd.promptPath.type);
      return applyStorageSourceFilter([cmd.promptPath], filter).length > 0;
    });
  }
};
SessionsAICustomizationWorkspaceService = SessionsAICustomizationWorkspaceService_1 = __decorate([
  __param(0, ISessionsManagementService),
  __param(1, IInstantiationService),
  __param(2, IPromptsService),
  __param(3, IPathService),
  __param(4, ICommandService),
  __param(5, ILogService),
  __param(6, IFileService),
  __param(7, INotificationService)
], SessionsAICustomizationWorkspaceService);
export {
  SessionsAICustomizationWorkspaceService
};
//# sourceMappingURL=aiCustomizationWorkspaceService.js.map
