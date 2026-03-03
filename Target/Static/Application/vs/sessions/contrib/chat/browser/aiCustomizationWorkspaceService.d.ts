import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IAICustomizationWorkspaceService, AICustomizationManagementSection, IStorageSourceFilter } from '../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { PromptsType } from '../../../../workbench/contrib/chat/common/promptSyntax/promptTypes.js';
import { IPathService } from '../../../../workbench/services/path/common/pathService.js';
/**
 * Agent Sessions override of IAICustomizationWorkspaceService.
 * Delegates to ISessionsManagementService to provide the active session's
 * worktree/repository as the project root, and supports worktree commit.
 */
export declare class SessionsAICustomizationWorkspaceService implements IAICustomizationWorkspaceService {
    private readonly sessionsService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    readonly activeProjectRoot: IObservable<URI | undefined>;
    /**
     * CLI-accessible user directories for customization file filtering and creation.
     */
    private readonly _cliUserRoots;
    /**
     * Pre-built filter for types that should only show CLI-accessible user roots.
     */
    private readonly _cliUserFilter;
    constructor(sessionsService: ISessionsManagementService, instantiationService: IInstantiationService, pathService: IPathService);
    getActiveProjectRoot(): URI | undefined;
    readonly managementSections: readonly AICustomizationManagementSection[];
    private static readonly _hooksFilter;
    private static readonly _allUserRootsFilter;
    getStorageSourceFilter(type: PromptsType): IStorageSourceFilter;
    /**
     * Returns the CLI-accessible user directories (~/.copilot, ~/.claude, ~/.agents).
     */
    readonly isSessionsWindow = true;
    commitFiles(projectRoot: URI, fileUris: URI[]): Promise<void>;
    generateCustomization(type: PromptsType): Promise<void>;
}
