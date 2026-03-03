import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { AgentFileType, IPromptsService } from '../common/promptSyntax/service/promptsService.js';
import { PromptsType } from '../common/promptSyntax/promptTypes.js';
import { ILanguageModelToolsService } from '../common/tools/languageModelToolsService.js';
/**
 * Interface for tip definitions that have exclusion criteria tracked by this class.
 * This subset is all TipEligibilityTracker needs to know about tip definitions.
 */
export interface ITipExclusionConfig {
    readonly id: string;
    /** Command IDs that, if ever executed, make this tip ineligible. */
    readonly excludeWhenCommandsExecuted?: readonly string[];
    /** Chat mode names that, if ever used, make this tip ineligible. */
    readonly excludeWhenModesUsed?: readonly string[];
    /** Tool IDs that, if ever invoked, make this tip ineligible. */
    readonly excludeWhenToolsInvoked?: readonly string[];
    /** File-based exclusion configuration. */
    readonly excludeWhenPromptFilesExist?: {
        readonly promptType: PromptsType;
        readonly agentFileType?: AgentFileType;
        readonly excludeUntilChecked?: boolean;
    };
}
/**
 * Tracks user-level signals that determine whether certain tips should be
 * excluded. Persists state to application storage and disposes listeners once all
 * signals of interest have been observed.
 */
export declare class TipEligibilityTracker extends Disposable {
    private readonly _storageService;
    private readonly _promptsService;
    private readonly _languageModelToolsService;
    private readonly _logService;
    private readonly _executedCommands;
    private readonly _usedModes;
    private readonly _invokedTools;
    private readonly _pendingCommands;
    private readonly _pendingModes;
    private readonly _pendingTools;
    private readonly _commandListener;
    private readonly _toolListener;
    /**
     * Tip IDs excluded because prompt files of the required type exist in the workspace.
     * Tips with `excludeUntilChecked` are pre-added and removed if no files are found.
     */
    private readonly _excludedByFiles;
    /** Tips that have file-based exclusions, kept for re-checks. */
    private readonly _tipsWithFileExclusions;
    /** Generation counter per tip ID to discard stale async file-check results. */
    private readonly _fileCheckGeneration;
    private readonly _fileChecksInFlight;
    constructor(tips: readonly ITipExclusionConfig[], commandService: ICommandService, _storageService: IStorageService, _promptsService: IPromptsService, _languageModelToolsService: ILanguageModelToolsService, _logService: ILogService);
    recordCommandExecuted(commandId: string): void;
    /**
     * Records the current chat mode (kind + name) so future tip eligibility
     * checks can exclude mode-related tips. No-ops once all tracked modes
     * have been observed.
     */
    recordCurrentMode(contextKeyService: IContextKeyService): void;
    /**
     * Returns `true` when the tip should be **excluded** from the eligible set.
     */
    isExcluded(tip: ITipExclusionConfig): boolean;
    /**
     * Revalidates all file-based tip exclusions. Tips with `excludeUntilChecked`
     * are conservatively hidden until the re-check completes.
     */
    refreshPromptFileExclusions(): void;
    private _checkForPromptFiles;
    private _doCheckForPromptFiles;
    private _persistSet;
    private _readApplicationWithProfileFallback;
}
