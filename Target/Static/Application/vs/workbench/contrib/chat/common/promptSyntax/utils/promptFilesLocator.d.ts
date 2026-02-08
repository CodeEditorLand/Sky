import { URI } from '../../../../../../base/common/uri.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IResolvedPromptFile, IResolvedPromptSourceFolder } from '../config/promptFileLocations.js';
import { PromptsType } from '../promptTypes.js';
import { IWorkbenchEnvironmentService } from '../../../../../services/environment/common/environmentService.js';
import { ISearchService } from '../../../../../services/search/common/search.js';
import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { PromptsStorage } from '../service/promptsService.js';
import { IUserDataProfileService } from '../../../../../services/userDataProfile/common/userDataProfile.js';
import { Event } from '../../../../../../base/common/event.js';
import { ILogService } from '../../../../../../platform/log/common/log.js';
import { IPathService } from '../../../../../services/path/common/pathService.js';
/**
 * Utility class to locate prompt files.
 */
export declare class PromptFilesLocator {
    private readonly fileService;
    private readonly configService;
    private readonly workspaceService;
    private readonly environmentService;
    private readonly searchService;
    private readonly userDataService;
    private readonly logService;
    private readonly pathService;
    constructor(fileService: IFileService, configService: IConfigurationService, workspaceService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, searchService: ISearchService, userDataService: IUserDataProfileService, logService: ILogService, pathService: IPathService);
    /**
     * List all prompt files from the filesystem.
     *
     * @returns List of prompt files found in the workspace.
     */
    listFiles(type: PromptsType, storage: PromptsStorage, token: CancellationToken): Promise<readonly URI[]>;
    private listFilesInUserData;
    /**
     * Gets all user storage folders for the given prompt type.
     * This includes configured tilde paths and the VS Code user data prompts folder.
     */
    private getUserStorageFolders;
    /**
     * Gets all source folder URIs for a prompt type (both workspace and user home).
     * This is used for file watching to detect changes in all relevant locations.
     */
    private getSourceFoldersSync;
    createFilesUpdatedEvent(type: PromptsType): {
        readonly event: Event<void>;
        dispose: () => void;
    };
    getAgentSourceFolders(): Promise<readonly URI[]>;
    /**
     * Gets the hook source folders for creating new hooks.
     * Returns only the Copilot hooks folder (.github/hooks) since Claude paths are read-only.
     */
    getHookSourceFolders(): Promise<readonly URI[]>;
    /**
     * Get all possible unambiguous prompt file source folders based on
     * the current workspace folder structure.
     *
     * This method is currently primarily used by the `> Create Prompt`
     * command that providers users with the list of destination folders
     * for a newly created prompt file. Because such a list cannot contain
     * paths that include `glob pattern` in them, we need to process config
     * values and try to create a list of clear and unambiguous locations.
     *
     * @returns List of possible unambiguous prompt file folders.
     */
    getConfigBasedSourceFolders(type: PromptsType): Promise<readonly URI[]>;
    /**
     * Gets all resolved source folders for the given prompt type with metadata.
     * This method merges configured locations with default locations and resolves them
     * to absolute paths, including displayPath and isDefault information.
     *
     * @param type The type of prompt files.
     * @returns List of resolved source folders with metadata.
     */
    getResolvedSourceFolders(type: PromptsType): Promise<readonly IResolvedPromptSourceFolder[]>;
    /**
     * Gets all local (workspace) storage folders for the given prompt type.
     * This merges default folders with configured locations.
     */
    private getLocalStorageFolders;
    /**
     * Deduplicates source folders by URI.
     */
    private dedupeSourceFolders;
    /**
     * Finds all existent prompt files in the configured local source folders.
     *
     * @returns List of prompt files found in the local source folders.
     */
    private listFilesInLocal;
    private getLocalParentFolders;
    /**
     * Converts locations defined in `settings` to absolute filesystem path URIs with metadata.
     * This conversion is needed because locations in settings can be relative,
     * hence we need to resolve them based on the current workspace folders.
     * If userHome is provided, paths starting with `~` will be expanded. Otherwise these paths are ignored.
     * Preserves the type and location properties from the source folder definitions.
     */
    private toAbsoluteLocations;
    /**
     * Uses the file service to resolve the provided location and return either the file at the location of files in the directory.
     */
    private resolveFilesAtLocation;
    /**
     * Uses the search service to find all files at the provided location.
     * Requires a FileSearchProvider to be available for the folder's scheme.
     */
    private searchFilesInLocation;
    findCopilotInstructionsMDsInWorkspace(token: CancellationToken): Promise<URI[]>;
    /**
     * Gets list of `AGENTS.md` files anywhere in the workspace.
     */
    findAgentMDsInWorkspace(token: CancellationToken): Promise<URI[]>;
    private findAgentMDsInFolder;
    /**
     * Recursively traverses a folder using the file service to find AGENTS.md files.
     * This is used as a fallback when no FileSearchProvider is available for the scheme.
     */
    private findAgentMDsUsingFileService;
    /**
     * Gets list of `AGENTS.md` files only at the root workspace folder(s).
     */
    findAgentMDsInWorkspaceRoots(token: CancellationToken): Promise<URI[]>;
    getAgentFileURIFromModeFile(oldURI: URI): URI | undefined;
    private findAgentSkillsInFolder;
    /**
     * Searches for skills in all configured locations.
     */
    findAgentSkills(token: CancellationToken): Promise<IResolvedPromptFile[]>;
}
/**
 * Checks if the provided path contains a glob pattern (* or **).
 * Used to detect deprecated glob usage in prompt file locations.
 *
 * @param path - path to check
 * @returns `true` if the path contains `*` or `**`, `false` otherwise
 */
export declare function hasGlobPattern(path: string): boolean;
/**
 * Checks if the provided `pattern` could be a valid glob pattern.
 */
export declare function isValidGlob(pattern: string): boolean;
/**
 * Regex pattern string for validating paths for all prompt files.
 * Paths only support:
 * - Relative paths: someFolder, ./someFolder
 * - User home paths: ~/folder (only forward slash, not backslash for cross-platform sharing)
 * - Parent relative paths for monorepos: ../folder
 *
 * NOT supported:
 * - Absolute paths (portability issue)
 * - Glob patterns with * or ** (performance issue)
 * - Backslashes (paths should be shareable in repos across platforms)
 * - Tilde without forward slash (e.g., ~abc, ~\folder)
 * - Empty or whitespace-only paths
 *
 * The regex validates:
 * - Not a Windows absolute path (e.g., C:\, C:/)
 * - Not starting with / (Unix absolute path)
 * - No backslashes anywhere (use forward slashes only)
 * - If starts with ~, must be followed by /
 * - No glob pattern characters: * ? [ ] { }
 * - At least one non-whitespace character
 */
export declare const VALID_PROMPT_FOLDER_PATTERN = "^(?![A-Za-z]:[\\\\/])(?!/)(?!~(?!/))(?!.*\\\\)(?!.*[*?\\[\\]{}]).*\\S.*$";
/**
 * Validates if a path is allowed for simplified path configurations.
 * Only forward slashes are supported to ensure paths are shareable across platforms.
 */
export declare function isValidPromptFolderPath(path: string): boolean;
