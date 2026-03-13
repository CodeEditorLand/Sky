import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { ResourceSet } from '../../../../../base/common/map.js';
import { OperatingSystem } from '../../../../../base/common/platform.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IRemoteAgentService } from '../../../../services/remote/common/remoteAgentService.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { ChatRequestVariableSet } from '../attachments/chatVariableEntries.js';
import { ILanguageModelToolsService } from '../tools/languageModelToolsService.js';
import { IPromptPath, IPromptsService } from './service/promptsService.js';
import { ChatModeKind } from '../constants.js';
import { UserSelectedTools } from '../participants/chatAgents.js';
export type InstructionsCollectionEvent = {
    applyingInstructionsCount: number;
    referencedInstructionsCount: number;
    agentInstructionsCount: number;
    listedInstructionsCount: number;
    totalInstructionsCount: number;
    claudeRulesCount: number;
    claudeMdCount: number;
    claudeAgentsCount: number;
};
export declare function newInstructionsCollectionEvent(): InstructionsCollectionEvent;
export declare class ComputeAutomaticInstructions {
    private readonly _modeKind;
    private readonly _enabledTools;
    private readonly _enabledSubagents;
    private readonly _sessionResource;
    private readonly _promptsService;
    readonly _logService: ILogService;
    private readonly _labelService;
    private readonly _configurationService;
    private readonly _contextKeyService;
    private readonly _workspaceService;
    private readonly _fileService;
    private readonly _remoteAgentService;
    private readonly _telemetryService;
    private readonly _languageModelToolsService;
    private _parseResults;
    constructor(_modeKind: ChatModeKind, _enabledTools: UserSelectedTools | undefined, _enabledSubagents: (readonly string[]) | undefined, _sessionResource: URI | undefined, _promptsService: IPromptsService, _logService: ILogService, _labelService: ILabelService, _configurationService: IConfigurationService, _contextKeyService: IContextKeyService, _workspaceService: IWorkspaceContextService, _fileService: IFileService, _remoteAgentService: IRemoteAgentService, _telemetryService: ITelemetryService, _languageModelToolsService: ILanguageModelToolsService);
    private _parseInstructionsFile;
    collect(variables: ChatRequestVariableSet, token: CancellationToken): Promise<void>;
    private sendTelemetry;
    /** public for testing */
    addApplyingInstructions(instructionFiles: readonly IPromptPath[], context: {
        files: ResourceSet;
        instructions: ResourceSet;
    }, variables: ChatRequestVariableSet, telemetryEvent: InstructionsCollectionEvent, token: CancellationToken): Promise<void>;
    private _getContext;
    private _addAgentInstructions;
    /**
     * Combines the `applyTo` and `paths` attributes into a single comma-separated
     * pattern string that can be matched by {@link _matches}.
     * Used for the instructions list XML output where both should be shown.
     */
    private _getApplyToPattern;
    private _matches;
    private _getTool;
    private _getCustomizationsIndex;
    private _addReferencedInstructions;
}
export declare function getFilePath(uri: URI, remoteOS: OperatingSystem | undefined): string;
