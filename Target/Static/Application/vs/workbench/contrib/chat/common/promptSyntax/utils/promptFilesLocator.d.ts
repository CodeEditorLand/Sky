import { URI } from '../../../../../../base/common/uri.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IResolvedPromptFile } from '../config/promptFileLocations.js';
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
     * Converts skill locations to absolute filesystem path URIs with restricted validation.
     * Unlike toAbsoluteLocations(), this method enforces stricter rules for skills:
     * - No glob patterns (performance concerns)
     * - No absolute paths (portability concerns)
     * - Only relative paths, tilde paths, and parent relative paths
     *
     * @param configuredLocations - Source folder definitions from configuration
     * @param userHome - User home URI for tilde expansion (optional for workspace-only resolution)
     * @returns List of resolved absolute URIs with metadata
     */
    private toAbsoluteLocationsForSkills;
    /**
     * Uses the file service to resolve the provided location and return either the file at the location of files in the directory.
     */
    private resolveFilesAtLocation;
    /**
     * Uses the search service to find all files at the provided location
     */
    private searchFilesInLocation;
    findCopilotInstructionsMDsInWorkspace(token: CancellationToken): Promise<URI[]>;
    /**
     * Gets list of `AGENTS.md` files anywhere in the workspace.
     */
    findAgentMDsInWorkspace(token: CancellationToken): Promise<URI[]>;
    private findAgentMDsInFolder;
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
 * Checks if the provided `pattern` could be a valid glob pattern.
 */
export declare function isValidGlob(pattern: string): boolean;
/**
 * Regex pattern string for validating skill paths.
 * Skills only support:
 * - Relative paths: someFolder, ./someFolder
 * - User home paths: ~/folder or ~\folder
 * - Parent relative paths for monorepos: ../folder
 *
 * NOT supported:
 * - Absolute paths (portability issue)
 * - Glob patterns with * or ** (performance issue)
 * - Tilde without path separator (e.g., ~abc)
 * - Empty or whitespace-only paths
 *
 * The regex validates:
 * - Not a Windows absolute path (e.g., C:\)
 * - Not starting with / (Unix absolute path)
 * - If starts with ~, must be followed by / or \
 * - No glob pattern characters: * ? [ ] { }
 * - At least one non-whitespace character
 */
export declare const VALID_SKILL_PATH_PATTERN = "^(?![A-Za-z]:[\\\\/])(?![\\\\/])(?!~(?![\\\\/]))(?!.*[*?\\[\\]{}]).*\\S.*$";
/**
 * Validates if a path is allowed for skills configuration.
 */
export declare function isValidSkillPath(path: string): boolean;
