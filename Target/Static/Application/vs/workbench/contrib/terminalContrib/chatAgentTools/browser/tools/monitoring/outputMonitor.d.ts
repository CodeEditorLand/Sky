import { CancellationToken } from '../../../../../../../base/common/cancellation.js';
import { Event } from '../../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { IChatWidgetService } from '../../../../../chat/browser/chat.js';
import { IChatService } from '../../../../../chat/common/chatService/chatService.js';
import { ILanguageModelsService } from '../../../../../chat/common/languageModels.js';
import { IToolInvocationContext } from '../../../../../chat/common/tools/languageModelToolsService.js';
import { ITaskService } from '../../../../../tasks/common/taskService.js';
import { IExecution, IPollingResult, OutputMonitorState } from './types.js';
import { IConfigurationService } from '../../../../../../../platform/configuration/common/configuration.js';
import { ITerminalService } from '../../../../../terminal/browser/terminal.js';
import { ITerminalLogService } from '../../../../../../../platform/terminal/common/terminal.js';
export interface IOutputMonitor extends Disposable {
    readonly pollingResult: IPollingResult & {
        pollDurationMs: number;
    } | undefined;
    readonly outputMonitorTelemetryCounters: IOutputMonitorTelemetryCounters;
    readonly onDidFinishCommand: Event<void>;
}
export interface IOutputMonitorTelemetryCounters {
    inputToolManualAcceptCount: number;
    inputToolManualRejectCount: number;
    inputToolManualChars: number;
    inputToolAutoAcceptCount: number;
    inputToolAutoChars: number;
    inputToolManualShownCount: number;
    inputToolFreeFormInputShownCount: number;
    inputToolFreeFormInputCount: number;
}
export declare class OutputMonitor extends Disposable implements IOutputMonitor {
    private readonly _execution;
    private readonly _pollFn;
    private readonly _languageModelsService;
    private readonly _taskService;
    private readonly _chatService;
    private readonly _chatWidgetService;
    private readonly _configurationService;
    private readonly _logService;
    private readonly _terminalService;
    private _state;
    get state(): OutputMonitorState;
    private _lastPromptMarker;
    private _lastPrompt;
    private _promptPart;
    private _pollingResult;
    get pollingResult(): IPollingResult & {
        pollDurationMs: number;
    } | undefined;
    /**
     * Flag to track if user has inputted since idle was detected.
     * This is used to skip showing prompts if the user already provided input.
     */
    private _userInputtedSinceIdleDetected;
    private readonly _userInputListener;
    private readonly _outputMonitorTelemetryCounters;
    get outputMonitorTelemetryCounters(): Readonly<IOutputMonitorTelemetryCounters>;
    private readonly _onDidFinishCommand;
    readonly onDidFinishCommand: Event<void>;
    constructor(_execution: IExecution, _pollFn: ((execution: IExecution, token: CancellationToken, taskService: ITaskService) => Promise<IPollingResult | undefined>) | undefined, invocationContext: IToolInvocationContext | undefined, token: CancellationToken, command: string, _languageModelsService: ILanguageModelsService, _taskService: ITaskService, _chatService: IChatService, _chatWidgetService: IChatWidgetService, _configurationService: IConfigurationService, _logService: ITerminalLogService, _terminalService: ITerminalService);
    private _startMonitoring;
    private _handleIdleState;
    private _handleTimeoutState;
    /**
     * Single bounded polling pass that returns when:
     *  - terminal becomes inactive/idle, or
     *  - timeout window elapses.
     */
    private _waitForIdle;
    /**
     * Sets up a listener for user input that triggers immediately when idle is detected.
     * This ensures we catch any input that happens between idle detection and prompt creation.
     */
    private _setupIdleInputListener;
    /**
     * Cleans up the idle input listener and resets the flag.
     */
    private _cleanupIdleInputListener;
    private _assessOutputForErrors;
    private _determineUserInputOptions;
    private _selectAndHandleOption;
    private _requestFreeFormTerminalInput;
    private _confirmRunInTerminal;
    private _showInstance;
    private _createElicitationPart;
    private _getLanguageModel;
}
export declare function detectsInputRequiredPattern(cursorLine: string): boolean;
export declare function detectsNonInteractiveHelpPattern(cursorLine: string): boolean;
