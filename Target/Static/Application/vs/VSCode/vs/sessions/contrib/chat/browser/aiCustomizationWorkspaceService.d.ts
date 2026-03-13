import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IAICustomizationWorkspaceService, AICustomizationManagementSection, IStorageSourceFilter } from '../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js';
import { IChatPromptSlashCommand, IPromptsService } from '../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { PromptsType } from '../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js';
import { IPathService } from '../../../../workbench/services/path/common/pathService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
/**
 * Agent Sessions override of IAICustomizationWorkspaceService.
 * Delegates to ISessionsManagementService to provide the active session's
 * worktree/repository as the project root, and supports worktree commit.
 *
 * Customization files are always committed to the main repository so they
 * persist across worktrees. When a worktree is active the file is also
 * copied into the worktree and committed there so the running session
 * picks it up immediately.
 */
export declare class SessionsAICustomizationWorkspaceService implements IAICustomizationWorkspaceService {
    private readonly sessionsService;
    private readonly instantiationService;
    private readonly promptsService;
    private readonly commandService;
    private readonly logService;
    private readonly fileService;
    private readonly notificationService;
    readonly _serviceBrand: undefined;
    readonly activeProjectRoot: IObservable<URI | undefined>;
    readonly hasOverrideProjectRoot: IObservable<boolean>;
    /**
     * Transient override for the project root. When set, `activeProjectRoot`
     * returns this value instead of the session-derived root.
     */
    private readonly _overrideRoot;
    /**
     * CLI-accessible user directories for customization file filtering and creation.
     */
    private readonly _cliUserRoots;
    /**
     * Pre-built filter for types that should only show CLI-accessible user roots.
     */
    private readonly _cliUserFilter;
    constructor(sessionsService: ISessionsManagementService, instantiationService: IInstantiationService, promptsService: IPromptsService, pathService: IPathService, commandService: ICommandService, logService: ILogService, fileService: IFileService, notificationService: INotificationService);
    getActiveProjectRoot(): URI | undefined;
    setOverrideProjectRoot(root: URI): void;
    clearOverrideProjectRoot(): void;
    readonly managementSections: readonly AICustomizationManagementSection[];
    private static readonly _hooksFilter;
    private static readonly _allUserRootsFilter;
    getStorageSourceFilter(type: PromptsType): IStorageSourceFilter;
    readonly isSessionsWindow = true;
    /**
     * Commits customization files. Always commits to the main repository
     * so the change persists across worktrees. When a worktree is active
     * the file is also committed there so the session sees it immediately.
     */
    commitFiles(_projectRoot: URI, fileUris: URI[]): Promise<void>;
    /**
     * Commits the deletion of files that have already been removed from disk.
     * Always stages + commits the removal in the main repository, and also
     * in the worktree if one is active.
     */
    deleteFiles(_projectRoot: URI, fileUris: URI[]): Promise<void>;
    /**
     * Computes the repository-relative path for a file. The file may be
     * located under the worktree or the repository root.
     */
    private getRelativePath;
    /**
     * Commits a single file to the main repository and optionally the worktree.
     * Copies the file content between trees when needed.
     */
    private commitFileToRepos;
    /**
     * Commits the deletion of a file to the main repository and optionally
     * the worktree. The file is already deleted from disk before this is called;
     * `git add` on a deleted path stages the removal.
     */
    private commitDeletionToRepos;
    generateCustomization(type: PromptsType): Promise<void>;
    getFilteredPromptSlashCommands(token: CancellationToken): Promise<readonly IChatPromptSlashCommand[]>;
}
