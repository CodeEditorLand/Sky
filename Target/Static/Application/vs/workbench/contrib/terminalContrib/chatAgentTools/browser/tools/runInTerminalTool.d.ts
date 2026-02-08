import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../../../base/common/map.js';
import { OperatingSystem } from '../../../../../../base/common/platform.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService, type ServicesAccessor } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { IStorageService } from '../../../../../../platform/storage/common/storage.js';
import { ITerminalLogService, ITerminalProfile } from '../../../../../../platform/terminal/common/terminal.js';
import { IRemoteAgentService } from '../../../../../services/remote/common/remoteAgentService.js';
import { IChatService } from '../../../../chat/common/chatService/chatService.js';
import { CountTokensCallback, ILanguageModelToolsService, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../../../../chat/common/tools/languageModelToolsService.js';
import { ITerminalChatService, ITerminalService, type ITerminalInstance } from '../../../../terminal/browser/terminal.js';
import { ITerminalProfileResolverService } from '../../../../terminal/common/terminal.js';
import type { ITerminalExecuteStrategyResult } from '../executeStrategy/executeStrategy.js';
import { type IToolTerminal } from '../toolTerminalCreator.js';
import { IWorkspaceContextService } from '../../../../../../platform/workspace/common/workspace.js';
import { IHistoryService } from '../../../../../services/history/common/history.js';
import { IChatWidgetService } from '../../../../chat/browser/chat.js';
export declare function createRunInTerminalToolData(accessor: ServicesAccessor): Promise<IToolData>;
export interface IRunInTerminalInputParams {
    command: string;
    explanation: string;
    goal: string;
    isBackground: boolean;
    timeout?: number;
}
/**
 * Interface for accessing a running terminal execution.
 * Used by tools that need to await or interact with background terminal commands.
 */
export interface IActiveTerminalExecution {
    /**
     * Promise that resolves when the terminal command completes.
     */
    readonly completionPromise: Promise<ITerminalExecuteStrategyResult>;
    /**
     * The terminal instance associated with this execution.
     */
    readonly instance: ITerminalInstance;
    /**
     * Gets the current output from the terminal.
     */
    getOutput(): string;
}
export declare class RunInTerminalTool extends Disposable implements IToolImpl {
    protected readonly _chatService: IChatService;
    private readonly _configurationService;
    private readonly _historyService;
    private readonly _instantiationService;
    private readonly _labelService;
    private readonly _languageModelToolsService;
    private readonly _remoteAgentService;
    private readonly _storageService;
    private readonly _terminalChatService;
    private readonly _logService;
    private readonly _terminalService;
    private readonly _workspaceContextService;
    private readonly _chatWidgetService;
    private readonly _terminalToolCreator;
    private readonly _treeSitterCommandParser;
    private readonly _telemetry;
    private readonly _commandArtifactCollector;
    protected readonly _profileFetcher: TerminalProfileFetcher;
    private readonly _commandLineRewriters;
    private readonly _commandLineAnalyzers;
    private readonly _commandLinePresenters;
    protected readonly _sessionTerminalAssociations: ResourceMap<IToolTerminal>;
    protected readonly _osBackend: Promise<OperatingSystem>;
    private static readonly _activeExecutions;
    static getBackgroundOutput(id: string): string;
    /**
     * Gets an active terminal execution by ID. Returns undefined if not found.
     * Can be used to await the completion of a background terminal command.
     */
    static getExecution(id: string): IActiveTerminalExecution | undefined;
    /**
     * Removes an active terminal execution by ID and disposes it.
     * @returns true if the execution was found and removed, false otherwise.
     */
    static removeExecution(id: string): boolean;
    constructor(_chatService: IChatService, _configurationService: IConfigurationService, _historyService: IHistoryService, _instantiationService: IInstantiationService, _labelService: ILabelService, _languageModelToolsService: ILanguageModelToolsService, _remoteAgentService: IRemoteAgentService, _storageService: IStorageService, _terminalChatService: ITerminalChatService, _logService: ITerminalLogService, _terminalService: ITerminalService, _workspaceContextService: IWorkspaceContextService, _chatWidgetService: IChatWidgetService);
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    private _handleTerminalVisibility;
    /**
     * Initializes a terminal for command execution. For foreground mode, reuses existing cached
     * terminal from the session. For background mode, always creates a new terminal to allow
     * parallel execution.
     */
    private _initTerminal;
    private _registerInputListener;
    private _restoreTerminalAssociations;
    private _setupProcessIdAssociation;
    private _associateProcessIdWithSession;
    private _removeProcessIdAssociation;
    private _cleanupSessionTerminals;
}
export declare class TerminalProfileFetcher {
    private readonly _configurationService;
    private readonly _terminalProfileResolverService;
    private readonly _remoteAgentService;
    readonly osBackend: Promise<OperatingSystem>;
    constructor(_configurationService: IConfigurationService, _terminalProfileResolverService: ITerminalProfileResolverService, _remoteAgentService: IRemoteAgentService);
    getCopilotProfile(): Promise<ITerminalProfile>;
    getCopilotShell(): Promise<string>;
    private _getChatTerminalProfile;
    private _isValidChatAgentTerminalProfile;
}
