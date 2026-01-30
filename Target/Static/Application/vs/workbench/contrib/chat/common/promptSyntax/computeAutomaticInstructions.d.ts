import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { ResourceSet } from '../../../../../base/common/map.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { ChatRequestVariableSet } from '../attachments/chatVariableEntries.js';
import { ILanguageModelToolsService, IToolAndToolSetEnablementMap } from '../tools/languageModelToolsService.js';
import { IPromptPath, IPromptsService } from './service/promptsService.js';
export type InstructionsCollectionEvent = {
    applyingInstructionsCount: number;
    referencedInstructionsCount: number;
    agentInstructionsCount: number;
    listedInstructionsCount: number;
    totalInstructionsCount: number;
};
export declare function newInstructionsCollectionEvent(): InstructionsCollectionEvent;
export declare class ComputeAutomaticInstructions {
    private readonly _enabledTools;
    private readonly _promptsService;
    readonly _logService: ILogService;
    private readonly _labelService;
    private readonly _configurationService;
    private readonly _workspaceService;
    private readonly _fileService;
    private readonly _telemetryService;
    private readonly _languageModelToolsService;
    private _parseResults;
    constructor(_enabledTools: IToolAndToolSetEnablementMap | undefined, _promptsService: IPromptsService, _logService: ILogService, _labelService: ILabelService, _configurationService: IConfigurationService, _workspaceService: IWorkspaceContextService, _fileService: IFileService, _telemetryService: ITelemetryService, _languageModelToolsService: ILanguageModelToolsService);
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
    private _matches;
    private _getTool;
    private _getInstructionsWithPatternsList;
    private _addReferencedInstructions;
}
