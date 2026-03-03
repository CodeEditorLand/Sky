import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, IReader } from '../../../../../base/common/observable.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { ChatRequestToolReferenceEntry } from '../../common/attachments/chatVariableEntries.js';
import { IVariableReference } from '../../common/chatModes.js';
import { IChatService, IChatToolInvocation } from '../../common/chatService/chatService.js';
import { ILanguageModelChatMetadata } from '../../common/languageModels.js';
import { ILanguageModelToolsConfirmationService } from '../../common/tools/languageModelToolsConfirmationService.js';
import { CountTokensCallback, IBeginToolCallOptions, ILanguageModelToolsService, IToolAndToolSetEnablementMap, IToolData, IToolImpl, IToolInvocation, IToolInvokedEvent, IToolResult, IToolSet, ToolDataSource, ToolSet } from '../../common/tools/languageModelToolsService.js';
export declare const globalAutoApproveDescription: import("../../../../../nls.js").ILocalizedString;
export declare class LanguageModelToolsService extends Disposable implements ILanguageModelToolsService {
    private readonly _instantiationService;
    private readonly _extensionService;
    private readonly _contextKeyService;
    private readonly _chatService;
    private readonly _dialogService;
    private readonly _telemetryService;
    private readonly _logService;
    private readonly _configurationService;
    private readonly _accessibilityService;
    private readonly _accessibilitySignalService;
    private readonly _storageService;
    private readonly _confirmationService;
    private readonly _commandService;
    _serviceBrand: undefined;
    readonly vscodeToolSet: ToolSet;
    readonly executeToolSet: ToolSet;
    readonly readToolSet: ToolSet;
    readonly agentToolSet: ToolSet;
    private readonly _onDidChangeTools;
    readonly onDidChangeTools: Event<void>;
    private readonly _onDidPrepareToolCallBecomeUnresponsive;
    readonly onDidPrepareToolCallBecomeUnresponsive: Event<{
        sessionResource: URI;
        toolData: IToolData;
    }>;
    private readonly _onDidInvokeTool;
    readonly onDidInvokeTool: Event<IToolInvokedEvent>;
    /** Throttle tools updates because it sends all tools and runs on context key updates */
    private readonly _onDidChangeToolsScheduler;
    private readonly _tools;
    private readonly _toolContextKeys;
    private readonly _ctxToolsCount;
    private readonly _callsByRequestId;
    /** Pending tool calls in the streaming phase, keyed by toolCallId */
    private readonly _pendingToolCalls;
    private readonly _isAgentModeEnabled;
    constructor(_instantiationService: IInstantiationService, _extensionService: IExtensionService, _contextKeyService: IContextKeyService, _chatService: IChatService, _dialogService: IDialogService, _telemetryService: ITelemetryService, _logService: ILogService, _configurationService: IConfigurationService, _accessibilityService: IAccessibilityService, _accessibilitySignalService: IAccessibilitySignalService, _storageService: IStorageService, _confirmationService: ILanguageModelToolsConfirmationService, _commandService: ICommandService);
    /**
     * Returns if the given tool or toolset is permitted in the current context.
     * When agent mode is enabled, all tools are permitted (no restriction)
     * When agent mode is disabled only a subset of read-only tools are permitted in agentic-loop contexts.
     */
    private isPermitted;
    dispose(): void;
    registerToolData(toolData: IToolData): IDisposable;
    flushToolUpdates(): void;
    private _refreshAllToolContextKeys;
    registerToolImplementation(id: string, tool: IToolImpl): IDisposable;
    registerTool(toolData: IToolData, tool: IToolImpl): IDisposable;
    getTools(model: ILanguageModelChatMetadata | undefined): Iterable<IToolData>;
    observeTools(model: ILanguageModelChatMetadata | undefined): IObservable<readonly IToolData[]>;
    getAllToolsIncludingDisabled(): Iterable<IToolData>;
    getTool(id: string): IToolData | undefined;
    getToolByName(name: string): IToolData | undefined;
    private _handlePreToolUseDenial;
    /**
     * Validate updatedInput from a preToolUse hook against the tool's input schema
     * using the json.validate command from the JSON extension.
     * @returns An error message string if validation fails, or undefined if valid.
     */
    private _validateUpdatedInput;
    invokeTool(dto: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
    private prepareToolInvocationWithHookResult;
    /**
     * Determines the auto-confirm decision based on a preToolUse hook result.
     * If the hook returned 'allow', auto-approves. If 'ask', forces confirmation
     * and ensures confirmation messages exist on `preparedInvocation`. Otherwise
     * falls back to normal auto-confirm logic.
     *
     * Returns the possibly-updated preparedInvocation along with the auto-confirm decision,
     * since when the hook returns 'ask' and preparedInvocation was undefined, we create one.
     */
    private resolveAutoConfirmFromHook;
    private prepareToolInvocation;
    beginToolCall(options: IBeginToolCallOptions): IChatToolInvocation | undefined;
    private _callHandleToolStream;
    updateToolStream(toolCallId: string, partialInput: unknown, token: CancellationToken): Promise<void>;
    private playAccessibilitySignal;
    private ensureToolDetails;
    private formatToolInput;
    private toolResultToIO;
    private getEligibleForAutoApprovalSpecialCase;
    private isToolEligibleForAutoApproval;
    private shouldAutoConfirm;
    private shouldAutoConfirmPostExecution;
    private _checkGlobalAutoApprove;
    private cleanupCallDisposables;
    cancelToolCallsForRequest(requestId: string): void;
    private static readonly githubMCPServerAliases;
    private static readonly playwrightMCPServerAliases;
    private getToolSetAliases;
    private getToolAliases;
    /**
     * Create a map that contains all tools and toolsets with their enablement state.
     * @param fullReferenceNames A list of tool or toolset by their full reference names that are enabled.
     * @returns A map of tool or toolset instances to their enablement state.
     */
    toToolAndToolSetEnablementMap(fullReferenceNames: readonly string[], model: ILanguageModelChatMetadata | undefined): IToolAndToolSetEnablementMap;
    toFullReferenceNames(map: IToolAndToolSetEnablementMap): string[];
    toToolReferences(variableReferences: readonly IVariableReference[]): ChatRequestToolReferenceEntry[];
    private readonly _toolSets;
    readonly toolSets: IObservable<Iterable<ToolSet>>;
    getToolSetsForModel(model: ILanguageModelChatMetadata | undefined, reader?: IReader): Iterable<IToolSet>;
    getToolSet(id: string): ToolSet | undefined;
    getToolSetByName(name: string): ToolSet | undefined;
    getSpecedToolSetName(referenceName: string): string;
    createToolSet(source: ToolDataSource, id: string, referenceName: string, options?: {
        icon?: ThemeIcon;
        description?: string;
        legacyFullNames?: string[];
    }): ToolSet & IDisposable;
    private readonly allToolsIncludingDisableObs;
    private readonly toolsWithFullReferenceName;
    getFullReferenceNames(): Iterable<string>;
    getDeprecatedFullReferenceNames(): Map<string, Set<string>>;
    getToolByFullReferenceName(fullReferenceName: string): IToolData | ToolSet | undefined;
    getFullReferenceName(tool: IToolData | IToolSet, toolSet?: IToolSet): string;
}
