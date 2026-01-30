import { IAction } from '../../../../../base/common/actions.js';
import { DeferredPromise } from '../../../../../base/common/async.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { IReference } from '../../../../../base/common/lifecycle.js';
import { IObservable, IReader } from '../../../../../base/common/observable.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI, UriComponents } from '../../../../../base/common/uri.js';
import { IRange } from '../../../../../editor/common/core/range.js';
import { ISelection } from '../../../../../editor/common/core/selection.js';
import { Command, Location, TextEdit } from '../../../../../editor/common/languages.js';
import { FileType } from '../../../../../platform/files/common/files.js';
import { IAutostartResult } from '../../../mcp/common/mcpTypes.js';
import { ICellEditOperation } from '../../../notebook/common/notebookCommon.js';
import { IWorkspaceSymbol } from '../../../search/common/search.js';
import { IChatAgentCommand, IChatAgentData, IChatAgentResult, UserSelectedTools } from '../participants/chatAgents.js';
import { IChatEditingSession } from '../editing/chatEditingService.js';
import { IChatModel, IChatRequestModeInfo, IChatRequestModel, IChatRequestVariableData, IChatResponseModel, IExportableChatData, ISerializableChatData } from '../model/chatModel.js';
import { IParsedChatRequest } from '../requestParser/chatParserTypes.js';
import { IChatParserContext } from '../requestParser/chatRequestParser.js';
import { IChatRequestVariableEntry } from '../attachments/chatVariableEntries.js';
import { IChatRequestVariableValue } from '../attachments/chatVariables.js';
import { ChatAgentLocation } from '../constants.js';
import { IPreparedToolInvocation, IToolConfirmationMessages, IToolResult, IToolResultInputOutputDetails, ToolDataSource } from '../tools/languageModelToolsService.js';
export interface IChatRequest {
    message: string;
    variables: Record<string, IChatRequestVariableValue[]>;
}
export declare enum ChatErrorLevel {
    Info = 0,
    Warning = 1,
    Error = 2
}
export interface IChatResponseErrorDetailsConfirmationButton {
    data: any;
    label: string;
    isSecondary?: boolean;
}
export interface IChatResponseErrorDetails {
    message: string;
    responseIsIncomplete?: boolean;
    responseIsFiltered?: boolean;
    responseIsRedacted?: boolean;
    isQuotaExceeded?: boolean;
    isRateLimited?: boolean;
    level?: ChatErrorLevel;
    confirmationButtons?: IChatResponseErrorDetailsConfirmationButton[];
    code?: string;
}
export interface IChatResponseProgressFileTreeData {
    label: string;
    uri: URI;
    type?: FileType;
    children?: IChatResponseProgressFileTreeData[];
}
export type IDocumentContext = {
    uri: URI;
    version: number;
    ranges: IRange[];
};
export declare function isIDocumentContext(obj: unknown): obj is IDocumentContext;
export interface IChatUsedContext {
    documents: IDocumentContext[];
    kind: 'usedContext';
}
export declare function isIUsedContext(obj: unknown): obj is IChatUsedContext;
export interface IChatContentVariableReference {
    variableName: string;
    value?: URI | Location;
}
export declare function isChatContentVariableReference(obj: unknown): obj is IChatContentVariableReference;
export declare enum ChatResponseReferencePartStatusKind {
    Complete = 1,
    Partial = 2,
    Omitted = 3
}
export declare enum ChatResponseClearToPreviousToolInvocationReason {
    NoReason = 0,
    FilteredContentRetry = 1,
    CopyrightContentRetry = 2
}
export interface IChatContentReference {
    reference: URI | Location | IChatContentVariableReference | string;
    iconPath?: ThemeIcon | {
        light: URI;
        dark?: URI;
    };
    options?: {
        status?: {
            description: string;
            kind: ChatResponseReferencePartStatusKind;
        };
        diffMeta?: {
            added: number;
            removed: number;
        };
        originalUri?: URI;
    };
    kind: 'reference';
}
export interface IChatCodeCitation {
    value: URI;
    license: string;
    snippet: string;
    kind: 'codeCitation';
}
export interface IChatContentInlineReference {
    resolveId?: string;
    inlineReference: URI | Location | IWorkspaceSymbol;
    name?: string;
    kind: 'inlineReference';
}
export interface IChatMarkdownContent {
    kind: 'markdownContent';
    content: IMarkdownString;
    inlineReferences?: Record<string, IChatContentInlineReference>;
}
export interface IChatTreeData {
    treeData: IChatResponseProgressFileTreeData;
    kind: 'treeData';
}
export interface IMultiDiffResource {
    originalUri?: URI;
    modifiedUri?: URI;
    goToFileUri?: URI;
    added?: number;
    removed?: number;
}
export interface IChatMultiDiffInnerData {
    title: string;
    resources: IMultiDiffResource[];
}
export interface IChatMultiDiffData {
    multiDiffData: IChatMultiDiffInnerData | IObservable<IChatMultiDiffInnerData>;
    kind: 'multiDiffData';
    collapsed?: boolean;
    readOnly?: boolean;
    toJSON(): IChatMultiDiffDataSerialized;
}
export interface IChatMultiDiffDataSerialized {
    multiDiffData: IChatMultiDiffInnerData;
    kind: 'multiDiffData';
    collapsed?: boolean;
    readOnly?: boolean;
}
export declare class ChatMultiDiffData implements IChatMultiDiffData {
    readonly kind = "multiDiffData";
    readonly collapsed?: boolean | undefined;
    readonly readOnly?: boolean | undefined;
    readonly multiDiffData: IChatMultiDiffData['multiDiffData'];
    constructor(opts: {
        multiDiffData: IChatMultiDiffInnerData | IObservable<IChatMultiDiffInnerData>;
        collapsed?: boolean;
        readOnly?: boolean;
    });
    toJSON(): IChatMultiDiffDataSerialized;
}
export interface IChatProgressMessage {
    content: IMarkdownString;
    kind: 'progressMessage';
}
export interface IChatTask extends IChatTaskDto {
    deferred: DeferredPromise<string | void>;
    progress: (IChatWarningMessage | IChatContentReference)[];
    readonly onDidAddProgress: Event<IChatWarningMessage | IChatContentReference>;
    add(progress: IChatWarningMessage | IChatContentReference): void;
    complete: (result: string | void) => void;
    task: () => Promise<string | void>;
    isSettled: () => boolean;
    toJSON(): IChatTaskSerialized;
}
export interface IChatUndoStop {
    kind: 'undoStop';
    id: string;
}
export interface IChatExternalEditsDto {
    kind: 'externalEdits';
    undoStopId: string;
    start: boolean; /** true=start, false=stop */
    resources: UriComponents[];
}
export interface IChatTaskDto {
    content: IMarkdownString;
    kind: 'progressTask';
}
export interface IChatTaskSerialized {
    content: IMarkdownString;
    progress: (IChatWarningMessage | IChatContentReference)[];
    kind: 'progressTaskSerialized';
}
export interface IChatTaskResult {
    content: IMarkdownString | void;
    kind: 'progressTaskResult';
}
export interface IChatWarningMessage {
    content: IMarkdownString;
    kind: 'warning';
}
export interface IChatAgentVulnerabilityDetails {
    title: string;
    description: string;
}
export interface IChatResponseCodeblockUriPart {
    kind: 'codeblockUri';
    uri: URI;
    isEdit?: boolean;
    undoStopId?: string;
}
export interface IChatAgentMarkdownContentWithVulnerability {
    content: IMarkdownString;
    vulnerabilities: IChatAgentVulnerabilityDetails[];
    kind: 'markdownVuln';
}
export interface IChatCommandButton {
    command: Command;
    kind: 'command';
    additionalCommands?: Command[];
}
export interface IChatMoveMessage {
    uri: URI;
    range: IRange;
    kind: 'move';
}
export interface IChatTextEdit {
    uri: URI;
    edits: TextEdit[];
    kind: 'textEdit';
    done?: boolean;
    isExternalEdit?: boolean;
}
export interface IChatClearToPreviousToolInvocation {
    kind: 'clearToPreviousToolInvocation';
    reason: ChatResponseClearToPreviousToolInvocationReason;
}
export interface IChatNotebookEdit {
    uri: URI;
    edits: ICellEditOperation[];
    kind: 'notebookEdit';
    done?: boolean;
    isExternalEdit?: boolean;
}
export interface IChatConfirmation {
    title: string;
    message: string | IMarkdownString;
    data: any;
    buttons?: string[];
    isUsed?: boolean;
    kind: 'confirmation';
}
export declare const enum ElicitationState {
    Pending = "pending",
    Accepted = "accepted",
    Rejected = "rejected"
}
export interface IChatElicitationRequest {
    kind: 'elicitation2';
    title: string | IMarkdownString;
    message: string | IMarkdownString;
    acceptButtonLabel: string;
    rejectButtonLabel: string | undefined;
    subtitle?: string | IMarkdownString;
    source?: ToolDataSource;
    state: IObservable<ElicitationState>;
    acceptedResult?: Record<string, unknown>;
    moreActions?: IAction[];
    accept(value: IAction | true): Promise<void>;
    reject?: () => Promise<void>;
    isHidden?: IObservable<boolean>;
    hide?(): void;
    toJSON(): IChatElicitationRequestSerialized;
}
export interface IChatElicitationRequestSerialized {
    kind: 'elicitationSerialized';
    title: string | IMarkdownString;
    message: string | IMarkdownString;
    subtitle: string | IMarkdownString | undefined;
    source: ToolDataSource | undefined;
    state: ElicitationState.Accepted | ElicitationState.Rejected;
    isHidden: boolean;
    acceptedResult?: Record<string, unknown>;
}
export interface IChatThinkingPart {
    kind: 'thinking';
    value?: string | string[];
    id?: string;
    metadata?: {
        readonly [key: string]: any;
    };
    generatedTitle?: string;
}
export interface IChatTerminalToolInvocationData {
    kind: 'terminal';
    commandLine: {
        original: string;
        userEdited?: string;
        toolEdited?: string;
    };
    /** The working directory URI for the terminal */
    cwd?: UriComponents;
    /**
     * Pre-computed confirmation display data (localization must happen at source).
     * Contains the command line to show in confirmation (potentially without cd prefix)
     * and the formatted cwd label if a cd prefix was extracted.
     */
    confirmation?: {
        /** The command line to display in the confirmation editor */
        commandLine: string;
        /** The formatted cwd label to show in title (if cd was extracted) */
        cwdLabel?: string;
        /** The cd prefix to prepend back when user edits */
        cdPrefix?: string;
    };
    /**
     * Overrides to apply to the presentation of the tool call only, but not actually change the
     * command that gets run. For example, python -c "print('hello')" can be presented as just
     * the Python code with Python syntax highlighting.
     */
    presentationOverrides?: {
        /** The command line to display in the UI */
        commandLine: string;
        /** The language for syntax highlighting */
        language: string;
    };
    /** Message for model recommending the use of an alternative tool */
    alternativeRecommendation?: string;
    language: string;
    terminalToolSessionId?: string;
    /** The predefined command ID that will be used for this terminal command */
    terminalCommandId?: string;
    /** Serialized URI for the command that was executed in the terminal */
    terminalCommandUri?: UriComponents;
    /** Serialized output of the executed command */
    terminalCommandOutput?: {
        text: string;
        truncated?: boolean;
        lineCount?: number;
    };
    /** Stored theme colors at execution time to style detached output */
    terminalTheme?: {
        background?: string;
        foreground?: string;
    };
    /** Stored command state to restore decorations after reload */
    terminalCommandState?: {
        exitCode?: number;
        timestamp?: number;
        duration?: number;
    };
    autoApproveInfo?: IMarkdownString;
}
/**
 * @deprecated This is the old API shape, we should support this for a while before removing it so
 * we don't break existing chats
 */
export interface ILegacyChatTerminalToolInvocationData {
    kind: 'terminal';
    command: string;
    language: string;
}
export declare function isLegacyChatTerminalToolInvocationData(data: unknown): data is ILegacyChatTerminalToolInvocationData;
export interface IChatToolInputInvocationData {
    kind: 'input';
    rawInput: any;
    /** Optional MCP App UI metadata for rendering during and after tool execution */
    mcpAppData?: {
        /** URI of the UI resource for rendering (e.g., "ui://weather-server/dashboard") */
        resourceUri: string;
        /** Reference to the server definition for reconnection */
        serverDefinitionId: string;
        /** Reference to the collection containing the server */
        collectionId: string;
    };
}
export declare const enum ToolConfirmKind {
    Denied = 0,
    ConfirmationNotNeeded = 1,
    Setting = 2,
    LmServicePerTool = 3,
    UserAction = 4,
    Skipped = 5
}
export type ConfirmedReason = {
    type: ToolConfirmKind.Denied;
} | {
    type: ToolConfirmKind.ConfirmationNotNeeded;
    reason?: string | IMarkdownString;
} | {
    type: ToolConfirmKind.Setting;
    id: string;
} | {
    type: ToolConfirmKind.LmServicePerTool;
    scope: 'session' | 'workspace' | 'profile';
} | {
    type: ToolConfirmKind.UserAction;
} | {
    type: ToolConfirmKind.Skipped;
};
export interface IChatToolInvocation {
    readonly presentation: IPreparedToolInvocation['presentation'];
    readonly toolSpecificData?: IChatTerminalToolInvocationData | ILegacyChatTerminalToolInvocationData | IChatToolInputInvocationData | IChatExtensionsContent | IChatPullRequestContent | IChatTodoListContent | IChatSubagentToolInvocationData;
    readonly originMessage: string | IMarkdownString | undefined;
    readonly invocationMessage: string | IMarkdownString;
    readonly pastTenseMessage: string | IMarkdownString | undefined;
    readonly source: ToolDataSource;
    readonly toolId: string;
    readonly toolCallId: string;
    readonly subAgentInvocationId?: string;
    readonly state: IObservable<IChatToolInvocation.State>;
    generatedTitle?: string;
    kind: 'toolInvocation';
    toJSON(): IChatToolInvocationSerialized;
}
export declare namespace IChatToolInvocation {
    export const enum StateKind {
        /** Tool call is streaming partial input from the LM */
        Streaming = 0,
        WaitingForConfirmation = 1,
        Executing = 2,
        WaitingForPostApproval = 3,
        Completed = 4,
        Cancelled = 5
    }
    interface IChatToolInvocationStateBase {
        type: StateKind;
    }
    export interface IChatToolInvocationStreamingState extends IChatToolInvocationStateBase {
        type: StateKind.Streaming;
        /** Observable partial input from the LM stream */
        readonly partialInput: IObservable<unknown>;
        /** Custom invocation message from handleToolStream */
        readonly streamingMessage: IObservable<string | IMarkdownString | undefined>;
    }
    /** Properties available after streaming is complete */
    interface IChatToolInvocationPostStreamState {
        readonly parameters: unknown;
        readonly confirmationMessages?: IToolConfirmationMessages;
    }
    interface IChatToolInvocationWaitingForConfirmationState extends IChatToolInvocationStateBase, IChatToolInvocationPostStreamState {
        type: StateKind.WaitingForConfirmation;
        confirm(reason: ConfirmedReason): void;
    }
    interface IChatToolInvocationPostConfirmState extends IChatToolInvocationPostStreamState {
        confirmed: ConfirmedReason;
    }
    interface IChatToolInvocationExecutingState extends IChatToolInvocationStateBase, IChatToolInvocationPostConfirmState {
        type: StateKind.Executing;
        progress: IObservable<{
            message?: string | IMarkdownString;
            progress: number | undefined;
        }>;
    }
    interface IChatToolInvocationPostExecuteState extends IChatToolInvocationPostConfirmState {
        resultDetails: IToolResult['toolResultDetails'];
    }
    interface IChatToolWaitingForPostApprovalState extends IChatToolInvocationStateBase, IChatToolInvocationPostExecuteState {
        type: StateKind.WaitingForPostApproval;
        confirm(reason: ConfirmedReason): void;
        contentForModel: IToolResult['content'];
    }
    interface IChatToolInvocationCompleteState extends IChatToolInvocationStateBase, IChatToolInvocationPostExecuteState {
        type: StateKind.Completed;
        postConfirmed: ConfirmedReason | undefined;
        contentForModel: IToolResult['content'];
    }
    interface IChatToolInvocationCancelledState extends IChatToolInvocationStateBase, IChatToolInvocationPostStreamState {
        type: StateKind.Cancelled;
        reason: ToolConfirmKind.Denied | ToolConfirmKind.Skipped;
    }
    export type State = IChatToolInvocationStreamingState | IChatToolInvocationWaitingForConfirmationState | IChatToolInvocationExecutingState | IChatToolWaitingForPostApprovalState | IChatToolInvocationCompleteState | IChatToolInvocationCancelledState;
    export function executionConfirmedOrDenied(invocation: IChatToolInvocation | IChatToolInvocationSerialized, reader?: IReader): ConfirmedReason | undefined;
    export function awaitConfirmation(invocation: IChatToolInvocation, token?: CancellationToken): Promise<ConfirmedReason>;
    export function confirmWith(invocation: IChatToolInvocation | undefined, reason: ConfirmedReason): boolean;
    export function awaitPostConfirmation(invocation: IChatToolInvocation, token?: CancellationToken): Promise<ConfirmedReason>;
    export function resultDetails(invocation: IChatToolInvocation | IChatToolInvocationSerialized, reader?: IReader): IToolResultInputOutputDetails | import("../tools/languageModelToolsService.js").IToolResultOutputDetails | (URI | Location)[] | IToolResultOutputDetailsSerialized | undefined;
    export function isComplete(invocation: IChatToolInvocation | IChatToolInvocationSerialized, reader?: IReader): boolean;
    export function isStreaming(invocation: IChatToolInvocation | IChatToolInvocationSerialized, reader?: IReader): boolean;
    /**
     * Get parameters from invocation. Returns undefined during streaming state.
     */
    export function getParameters(invocation: IChatToolInvocation | IChatToolInvocationSerialized, reader?: IReader): unknown | undefined;
    /**
     * Get confirmation messages from invocation. Returns undefined during streaming state.
     */
    export function getConfirmationMessages(invocation: IChatToolInvocation | IChatToolInvocationSerialized, reader?: IReader): IToolConfirmationMessages | undefined;
    export {};
}
export interface IToolResultOutputDetailsSerialized {
    output: {
        type: 'data';
        mimeType: string;
        base64Data: string;
    };
}
/**
 * This is a IChatToolInvocation that has been serialized, like after window reload, so it is no longer an active tool invocation.
 */
export interface IChatToolInvocationSerialized {
    presentation: IPreparedToolInvocation['presentation'];
    toolSpecificData?: IChatTerminalToolInvocationData | IChatToolInputInvocationData | IChatExtensionsContent | IChatPullRequestContent | IChatTodoListContent | IChatSubagentToolInvocationData;
    invocationMessage: string | IMarkdownString;
    originMessage: string | IMarkdownString | undefined;
    pastTenseMessage: string | IMarkdownString | undefined;
    resultDetails?: Array<URI | Location> | IToolResultInputOutputDetails | IToolResultOutputDetailsSerialized;
    /** boolean used by pre-1.104 versions */
    isConfirmed: ConfirmedReason | boolean | undefined;
    isComplete: boolean;
    toolCallId: string;
    toolId: string;
    source: ToolDataSource;
    readonly subAgentInvocationId?: string;
    generatedTitle?: string;
    kind: 'toolInvocationSerialized';
}
export interface IChatExtensionsContent {
    extensions: string[];
    kind: 'extensions';
}
export interface IChatPullRequestContent {
    uri: URI;
    title: string;
    description: string;
    author: string;
    linkTag: string;
    kind: 'pullRequest';
}
export interface IChatSubagentToolInvocationData {
    kind: 'subagent';
    description?: string;
    agentName?: string;
    prompt?: string;
    result?: string;
}
export interface IChatTodoListContent {
    kind: 'todoList';
    sessionId: string;
    todoList: Array<{
        id: string;
        title: string;
        description: string;
        status: 'not-started' | 'in-progress' | 'completed';
    }>;
}
export interface IChatMcpServersStarting {
    readonly kind: 'mcpServersStarting';
    readonly state?: IObservable<IAutostartResult>;
    didStartServerIds?: string[];
    toJSON(): IChatMcpServersStartingSerialized;
}
export interface IChatMcpServersStartingSerialized {
    readonly kind: 'mcpServersStarting';
    readonly state?: undefined;
    didStartServerIds?: string[];
}
export declare class ChatMcpServersStarting implements IChatMcpServersStarting {
    readonly state: IObservable<IAutostartResult>;
    readonly kind = "mcpServersStarting";
    didStartServerIds?: string[];
    get isEmpty(): boolean;
    constructor(state: IObservable<IAutostartResult>);
    wait(): Promise<IAutostartResult>;
    toJSON(): IChatMcpServersStartingSerialized;
}
export type IChatProgress = IChatMarkdownContent | IChatAgentMarkdownContentWithVulnerability | IChatTreeData | IChatMultiDiffData | IChatMultiDiffDataSerialized | IChatUsedContext | IChatContentReference | IChatContentInlineReference | IChatCodeCitation | IChatProgressMessage | IChatTask | IChatTaskResult | IChatCommandButton | IChatWarningMessage | IChatTextEdit | IChatNotebookEdit | IChatMoveMessage | IChatResponseCodeblockUriPart | IChatConfirmation | IChatClearToPreviousToolInvocation | IChatToolInvocation | IChatToolInvocationSerialized | IChatExtensionsContent | IChatPullRequestContent | IChatUndoStop | IChatThinkingPart | IChatTaskSerialized | IChatElicitationRequest | IChatElicitationRequestSerialized | IChatMcpServersStarting | IChatMcpServersStartingSerialized;
export interface IChatFollowup {
    kind: 'reply';
    message: string;
    agentId: string;
    subCommand?: string;
    title?: string;
    tooltip?: string;
}
export declare function isChatFollowup(obj: unknown): obj is IChatFollowup;
export declare enum ChatAgentVoteDirection {
    Down = 0,
    Up = 1
}
export declare enum ChatAgentVoteDownReason {
    IncorrectCode = "incorrectCode",
    DidNotFollowInstructions = "didNotFollowInstructions",
    IncompleteCode = "incompleteCode",
    MissingContext = "missingContext",
    PoorlyWrittenOrFormatted = "poorlyWrittenOrFormatted",
    RefusedAValidRequest = "refusedAValidRequest",
    OffensiveOrUnsafe = "offensiveOrUnsafe",
    Other = "other",
    WillReportIssue = "willReportIssue"
}
export interface IChatVoteAction {
    kind: 'vote';
    direction: ChatAgentVoteDirection;
    reason: ChatAgentVoteDownReason | undefined;
}
export declare enum ChatCopyKind {
    Action = 1,
    Toolbar = 2
}
export interface IChatCopyAction {
    kind: 'copy';
    codeBlockIndex: number;
    copyKind: ChatCopyKind;
    copiedCharacters: number;
    totalCharacters: number;
    copiedText: string;
    totalLines: number;
    copiedLines: number;
    modelId: string;
    languageId?: string;
}
export interface IChatInsertAction {
    kind: 'insert';
    codeBlockIndex: number;
    totalCharacters: number;
    totalLines: number;
    languageId?: string;
    modelId: string;
    newFile?: boolean;
}
export interface IChatApplyAction {
    kind: 'apply';
    codeBlockIndex: number;
    totalCharacters: number;
    totalLines: number;
    languageId?: string;
    modelId: string;
    newFile?: boolean;
    codeMapper?: string;
    editsProposed: boolean;
}
export interface IChatTerminalAction {
    kind: 'runInTerminal';
    codeBlockIndex: number;
    languageId?: string;
}
export interface IChatCommandAction {
    kind: 'command';
    commandButton: IChatCommandButton;
}
export interface IChatFollowupAction {
    kind: 'followUp';
    followup: IChatFollowup;
}
export interface IChatBugReportAction {
    kind: 'bug';
}
export interface IChatInlineChatCodeAction {
    kind: 'inlineChat';
    action: 'accepted' | 'discarded';
}
export interface IChatEditingSessionAction {
    kind: 'chatEditingSessionAction';
    uri: URI;
    hasRemainingEdits: boolean;
    outcome: 'accepted' | 'rejected' | 'userModified';
}
export interface IChatEditingHunkAction {
    kind: 'chatEditingHunkAction';
    uri: URI;
    lineCount: number;
    linesAdded: number;
    linesRemoved: number;
    outcome: 'accepted' | 'rejected';
    hasRemainingEdits: boolean;
    modeId?: string;
    modelId?: string;
    languageId?: string;
}
export type ChatUserAction = IChatVoteAction | IChatCopyAction | IChatInsertAction | IChatApplyAction | IChatTerminalAction | IChatCommandAction | IChatFollowupAction | IChatBugReportAction | IChatInlineChatCodeAction | IChatEditingSessionAction | IChatEditingHunkAction;
export interface IChatUserActionEvent {
    action: ChatUserAction;
    agentId: string | undefined;
    command: string | undefined;
    sessionResource: URI;
    requestId: string;
    result: IChatAgentResult | undefined;
    modelId?: string | undefined;
    modeId?: string | undefined;
}
export interface IChatDynamicRequest {
    /**
     * The message that will be displayed in the UI
     */
    message: string;
    /**
     * Any extra metadata/context that will go to the provider.
     */
    metadata?: any;
}
export interface IChatCompleteResponse {
    message: string | ReadonlyArray<IChatProgress>;
    result?: IChatAgentResult;
    followups?: IChatFollowup[];
}
export interface IChatSessionStats {
    fileCount: number;
    added: number;
    removed: number;
}
export type IChatSessionTiming = {
    /**
     * Timestamp when the session was created in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
     */
    created: number;
    /**
     * Timestamp when the most recent request started in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
     *
     * Should be undefined if no requests have been made yet.
     */
    lastRequestStarted: number | undefined;
    /**
     * Timestamp when the most recent request completed in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
     *
     * Should be undefined if the most recent request is still in progress or if no requests have been made yet.
     */
    lastRequestEnded: number | undefined;
};
interface ILegacyChatSessionTiming {
    startTime: number;
    endTime?: number;
}
export declare function convertLegacyChatSessionTiming(timing: IChatSessionTiming | ILegacyChatSessionTiming): IChatSessionTiming;
export declare const enum ResponseModelState {
    Pending = 0,
    Complete = 1,
    Cancelled = 2,
    Failed = 3,
    NeedsInput = 4
}
export interface IChatDetail {
    sessionResource: URI;
    title: string;
    lastMessageDate: number;
    timing: IChatSessionTiming | ILegacyChatSessionTiming;
    isActive: boolean;
    stats?: IChatSessionStats;
    lastResponseState: ResponseModelState;
}
export interface IChatProviderInfo {
    id: string;
}
export interface IChatSendRequestResponseState {
    responseCreatedPromise: Promise<IChatResponseModel>;
    responseCompletePromise: Promise<void>;
}
export interface IChatSendRequestData extends IChatSendRequestResponseState {
    agent: IChatAgentData;
    slashCommand?: IChatAgentCommand;
}
export interface IChatEditorLocationData {
    type: ChatAgentLocation.EditorInline;
    id: string;
    document: URI;
    selection: ISelection;
    wholeRange: IRange;
}
export interface IChatNotebookLocationData {
    type: ChatAgentLocation.Notebook;
    sessionInputUri: URI;
}
export interface IChatTerminalLocationData {
    type: ChatAgentLocation.Terminal;
}
export type IChatLocationData = IChatEditorLocationData | IChatNotebookLocationData | IChatTerminalLocationData;
export interface IChatSendRequestOptions {
    modeInfo?: IChatRequestModeInfo;
    userSelectedModelId?: string;
    userSelectedTools?: IObservable<UserSelectedTools>;
    location?: ChatAgentLocation;
    locationData?: IChatLocationData;
    parserContext?: IChatParserContext;
    attempt?: number;
    noCommandDetection?: boolean;
    acceptedConfirmationData?: any[];
    rejectedConfirmationData?: any[];
    attachedContext?: IChatRequestVariableEntry[];
    /** The target agent ID can be specified with this property instead of using @ in 'message' */
    agentId?: string;
    /** agentId, but will not add a @ name to the request */
    agentIdSilent?: string;
    slashCommand?: string;
    /**
     * The label of the confirmation action that was selected.
     */
    confirmation?: string;
}
export type IChatModelReference = IReference<IChatModel>;
export declare const IChatService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatService>;
export interface IChatService {
    _serviceBrand: undefined;
    transferredSessionResource: URI | undefined;
    readonly onDidSubmitRequest: Event<{
        readonly chatSessionResource: URI;
    }>;
    readonly onDidCreateModel: Event<IChatModel>;
    /**
     * An observable containing all live chat models.
     */
    readonly chatModels: IObservable<Iterable<IChatModel>>;
    isEnabled(location: ChatAgentLocation): boolean;
    hasSessions(): boolean;
    startSession(location: ChatAgentLocation, options?: IChatSessionStartOptions): IChatModelReference;
    /**
     * Get an active session without holding a reference to it.
     */
    getSession(sessionResource: URI): IChatModel | undefined;
    /**
     * Acquire a reference to an active session.
     */
    getActiveSessionReference(sessionResource: URI): IChatModelReference | undefined;
    getOrRestoreSession(sessionResource: URI): Promise<IChatModelReference | undefined>;
    getSessionTitle(sessionResource: URI): string | undefined;
    loadSessionFromContent(data: IExportableChatData | ISerializableChatData | URI): IChatModelReference | undefined;
    loadSessionForResource(resource: URI, location: ChatAgentLocation, token: CancellationToken): Promise<IChatModelReference | undefined>;
    readonly editingSessions: IChatEditingSession[];
    getChatSessionFromInternalUri(sessionResource: URI): IChatSessionContext | undefined;
    /**
     * Returns whether the request was accepted.`
     */
    sendRequest(sessionResource: URI, message: string, options?: IChatSendRequestOptions): Promise<IChatSendRequestData | undefined>;
    /**
     * Sets a custom title for a chat model.
     */
    setTitle(sessionResource: URI, title: string): void;
    appendProgress(request: IChatRequestModel, progress: IChatProgress): void;
    resendRequest(request: IChatRequestModel, options?: IChatSendRequestOptions): Promise<void>;
    adoptRequest(sessionResource: URI, request: IChatRequestModel): Promise<void>;
    removeRequest(sessionResource: URI, requestId: string): Promise<void>;
    cancelCurrentRequestForSession(sessionResource: URI): void;
    addCompleteRequest(sessionResource: URI, message: IParsedChatRequest | string, variableData: IChatRequestVariableData | undefined, attempt: number | undefined, response: IChatCompleteResponse): void;
    setChatSessionTitle(sessionResource: URI, title: string): void;
    getLocalSessionHistory(): Promise<IChatDetail[]>;
    clearAllHistoryEntries(): Promise<void>;
    removeHistoryEntry(sessionResource: URI): Promise<void>;
    getChatStorageFolder(): URI;
    logChatIndex(): void;
    getLiveSessionItems(): Promise<IChatDetail[]>;
    getHistorySessionItems(): Promise<IChatDetail[]>;
    getMetadataForSession(sessionResource: URI): Promise<IChatDetail | undefined>;
    readonly onDidPerformUserAction: Event<IChatUserActionEvent>;
    notifyUserAction(event: IChatUserActionEvent): void;
    readonly onDidDisposeSession: Event<{
        readonly sessionResource: URI[];
        readonly reason: 'cleared';
    }>;
    transferChatSession(transferredSessionResource: URI, toWorkspace: URI): Promise<void>;
    activateDefaultAgent(location: ChatAgentLocation): Promise<void>;
    readonly edits2Enabled: boolean;
    readonly requestInProgressObs: IObservable<boolean>;
    /**
     * For tests only!
     */
    setSaveModelsEnabled(enabled: boolean): void;
    /**
     * For tests only!
     */
    waitForModelDisposals(): Promise<void>;
}
export interface IChatSessionContext {
    readonly chatSessionType: string;
    readonly chatSessionResource: URI;
    readonly isUntitled: boolean;
}
export declare const KEYWORD_ACTIVIATION_SETTING_ID = "accessibility.voice.keywordActivation";
export interface IChatSessionStartOptions {
    canUseTools?: boolean;
    disableBackgroundKeepAlive?: boolean;
}
export {};
