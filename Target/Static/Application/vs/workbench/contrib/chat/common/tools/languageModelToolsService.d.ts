import { Separator } from '../../../../../base/common/actions.js';
import { VSBuffer } from '../../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { IJSONSchema } from '../../../../../base/common/jsonSchema.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, IReader, ITransaction, ObservableSet } from '../../../../../base/common/observable.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { Location } from '../../../../../editor/common/languages.js';
import { ContextKeyExpression } from '../../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../../platform/extensions/common/extensions.js';
import { IProgress } from '../../../../../platform/progress/common/progress.js';
import { UserSelectedTools } from '../participants/chatAgents.js';
import { IVariableReference } from '../chatModes.js';
import { IChatExtensionsContent, IChatSubagentToolInvocationData, IChatTodoListContent, IChatToolInputInvocationData, IChatToolInvocation, type IChatTerminalToolInvocationData } from '../chatService/chatService.js';
import { ChatRequestToolReferenceEntry } from '../attachments/chatVariableEntries.js';
import { LanguageModelPartAudience } from '../languageModels.js';
export interface IToolData {
    readonly id: string;
    readonly source: ToolDataSource;
    readonly toolReferenceName?: string;
    readonly legacyToolReferenceFullNames?: readonly string[];
    readonly icon?: {
        dark: URI;
        light?: URI;
    } | ThemeIcon;
    readonly when?: ContextKeyExpression;
    readonly tags?: readonly string[];
    readonly displayName: string;
    readonly userDescription?: string;
    readonly modelDescription: string;
    readonly inputSchema?: IJSONSchema;
    readonly canBeReferencedInPrompt?: boolean;
    /**
     * True if the tool runs in the (possibly remote) workspace, false if it runs
     * on the host, undefined if known.
     */
    readonly runsInWorkspace?: boolean;
    readonly alwaysDisplayInputOutput?: boolean;
    /** True if this tool might ask for pre-approval */
    readonly canRequestPreApproval?: boolean;
    /** True if this tool might ask for post-approval */
    readonly canRequestPostApproval?: boolean;
}
export interface IToolProgressStep {
    readonly message: string | IMarkdownString | undefined;
    /** 0-1 progress of the tool call */
    readonly progress?: number;
}
export type ToolProgress = IProgress<IToolProgressStep>;
export type ToolDataSource = {
    type: 'extension';
    label: string;
    extensionId: ExtensionIdentifier;
} | {
    type: 'mcp';
    label: string;
    serverLabel: string | undefined;
    instructions: string | undefined;
    collectionId: string;
    definitionId: string;
} | {
    type: 'user';
    label: string;
    file: URI;
} | {
    type: 'internal';
    label: string;
} | {
    type: 'external';
    label: string;
};
export declare namespace ToolDataSource {
    const Internal: ToolDataSource;
    /** External tools may not be contributed or invoked, but may be invoked externally and described in an IChatToolInvocationSerialized */
    const External: ToolDataSource;
    function toKey(source: ToolDataSource): string;
    function equals(a: ToolDataSource, b: ToolDataSource): boolean;
    function classify(source: ToolDataSource): {
        readonly ordinal: number;
        readonly label: string;
    };
}
export interface IToolInvocation {
    callId: string;
    toolId: string;
    parameters: Record<string, any>;
    tokenBudget?: number;
    context: IToolInvocationContext | undefined;
    chatRequestId?: string;
    chatInteractionId?: string;
    /**
     * Optional tool call ID from the chat stream, used to correlate with pending streaming tool calls.
     */
    chatStreamToolCallId?: string;
    /**
     * Lets us add some nicer UI to toolcalls that came from a sub-agent, but in the long run, this should probably just be rendered in a similar way to thinking text + tool call groups
     */
    subAgentInvocationId?: string;
    toolSpecificData?: IChatTerminalToolInvocationData | IChatToolInputInvocationData | IChatExtensionsContent | IChatTodoListContent | IChatSubagentToolInvocationData;
    modelId?: string;
    userSelectedTools?: UserSelectedTools;
}
export interface IToolInvocationContext {
    /** @deprecated Use {@link sessionResource} instead */
    readonly sessionId: string;
    readonly sessionResource: URI;
}
export declare function isToolInvocationContext(obj: any): obj is IToolInvocationContext;
export interface IToolInvocationPreparationContext {
    parameters: any;
    chatRequestId?: string;
    /** @deprecated Use {@link chatSessionResource} instead */
    chatSessionId?: string;
    chatSessionResource?: URI;
    chatInteractionId?: string;
}
export type ToolInputOutputBase = {
    /** Mimetype of the value, optional */
    mimeType?: string;
    /** URI of the resource on the MCP server. */
    uri?: URI;
    /** If true, this part came in as a resource reference rather than direct data. */
    asResource?: boolean;
    /** Audience of the data part */
    audience?: LanguageModelPartAudience[];
};
export type ToolInputOutputEmbedded = ToolInputOutputBase & {
    type: 'embed';
    value: string;
    /** If true, value is text. If false or not given, value is base64 */
    isText?: boolean;
};
export type ToolInputOutputReference = ToolInputOutputBase & {
    type: 'ref';
    uri: URI;
};
export interface IToolResultInputOutputDetails {
    readonly input: string;
    readonly output: (ToolInputOutputEmbedded | ToolInputOutputReference)[];
    readonly isError?: boolean;
    /** Raw MCP tool result for MCP App UI rendering */
    readonly mcpOutput?: unknown;
}
export interface IToolResultOutputDetails {
    readonly output: {
        type: 'data';
        mimeType: string;
        value: VSBuffer;
    };
}
export declare function isToolResultInputOutputDetails(obj: any): obj is IToolResultInputOutputDetails;
export declare function isToolResultOutputDetails(obj: any): obj is IToolResultOutputDetails;
export interface IToolResult {
    content: (IToolResultPromptTsxPart | IToolResultTextPart | IToolResultDataPart)[];
    toolResultMessage?: string | IMarkdownString;
    toolResultDetails?: Array<URI | Location> | IToolResultInputOutputDetails | IToolResultOutputDetails;
    toolResultError?: string;
    toolMetadata?: unknown;
    /** Whether to ask the user to confirm these tool results. Overrides {@link IToolConfirmationMessages.confirmResults}. */
    confirmResults?: boolean;
}
export declare function toolContentToA11yString(part: IToolResult['content']): string;
export declare function toolResultHasBuffers(result: IToolResult): boolean;
export interface IToolResultPromptTsxPart {
    kind: 'promptTsx';
    value: unknown;
}
export declare function stringifyPromptTsxPart(part: IToolResultPromptTsxPart): string;
export interface IToolResultTextPart {
    kind: 'text';
    value: string;
    audience?: LanguageModelPartAudience[];
    title?: string;
}
export interface IToolResultDataPart {
    kind: 'data';
    value: {
        mimeType: string;
        data: VSBuffer;
    };
    audience?: LanguageModelPartAudience[];
    title?: string;
}
export interface IToolConfirmationMessages {
    /** Title for the confirmation. If set, the user will be asked to confirm execution of the tool */
    title?: string | IMarkdownString;
    /** MUST be set if `title` is also set */
    message?: string | IMarkdownString;
    disclaimer?: string | IMarkdownString;
    allowAutoConfirm?: boolean;
    terminalCustomActions?: ToolConfirmationAction[];
    /** If true, confirmation will be requested after the tool executes and before results are sent to the model */
    confirmResults?: boolean;
    /** If title is not set (no confirmation needed), this reason will be shown to explain why confirmation was not needed */
    confirmationNotNeededReason?: string | IMarkdownString;
}
export interface IToolConfirmationAction {
    label: string;
    disabled?: boolean;
    tooltip?: string;
    data: any;
}
export type ToolConfirmationAction = IToolConfirmationAction | Separator;
export declare enum ToolInvocationPresentation {
    Hidden = "hidden",
    HiddenAfterComplete = "hiddenAfterComplete"
}
export interface IToolInvocationStreamContext {
    toolCallId: string;
    rawInput: unknown;
    chatRequestId?: string;
    chatSessionId?: string;
    chatInteractionId?: string;
}
export interface IStreamedToolInvocation {
    invocationMessage?: string | IMarkdownString;
}
export interface IPreparedToolInvocation {
    invocationMessage?: string | IMarkdownString;
    pastTenseMessage?: string | IMarkdownString;
    originMessage?: string | IMarkdownString;
    confirmationMessages?: IToolConfirmationMessages;
    presentation?: ToolInvocationPresentation;
    toolSpecificData?: IChatTerminalToolInvocationData | IChatToolInputInvocationData | IChatExtensionsContent | IChatTodoListContent | IChatSubagentToolInvocationData;
}
export interface IToolImpl {
    invoke(invocation: IToolInvocation, countTokens: CountTokensCallback, progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    prepareToolInvocation?(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    handleToolStream?(context: IToolInvocationStreamContext, token: CancellationToken): Promise<IStreamedToolInvocation | undefined>;
}
export type IToolAndToolSetEnablementMap = ReadonlyMap<IToolData | ToolSet, boolean>;
export declare class ToolSet {
    readonly id: string;
    readonly referenceName: string;
    readonly icon: ThemeIcon;
    readonly source: ToolDataSource;
    readonly description?: string | undefined;
    readonly legacyFullNames?: string[] | undefined;
    protected readonly _tools: ObservableSet<IToolData>;
    protected readonly _toolSets: ObservableSet<ToolSet>;
    /**
     * A homogenous tool set only contains tools from the same source as the tool set itself
     */
    readonly isHomogenous: IObservable<boolean>;
    constructor(id: string, referenceName: string, icon: ThemeIcon, source: ToolDataSource, description?: string | undefined, legacyFullNames?: string[] | undefined);
    addTool(data: IToolData, tx?: ITransaction): IDisposable;
    addToolSet(toolSet: ToolSet, tx?: ITransaction): IDisposable;
    getTools(r?: IReader): Iterable<IToolData>;
}
export interface IBeginToolCallOptions {
    toolCallId: string;
    toolId: string;
    chatRequestId?: string;
    sessionResource?: URI;
    subagentInvocationId?: string;
}
export declare const ILanguageModelToolsService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageModelToolsService>;
export type CountTokensCallback = (input: string, token: CancellationToken) => Promise<number>;
export interface ILanguageModelToolsService {
    _serviceBrand: undefined;
    readonly vscodeToolSet: ToolSet;
    readonly executeToolSet: ToolSet;
    readonly readToolSet: ToolSet;
    readonly onDidChangeTools: Event<void>;
    readonly onDidPrepareToolCallBecomeUnresponsive: Event<{
        readonly sessionId: string;
        readonly toolData: IToolData;
    }>;
    registerToolData(toolData: IToolData): IDisposable;
    registerToolImplementation(id: string, tool: IToolImpl): IDisposable;
    registerTool(toolData: IToolData, tool: IToolImpl): IDisposable;
    getTools(): Iterable<IToolData>;
    readonly toolsObservable: IObservable<readonly IToolData[]>;
    getTool(id: string): IToolData | undefined;
    getToolByName(name: string, includeDisabled?: boolean): IToolData | undefined;
    /**
     * Begin a tool call in the streaming phase.
     * Creates a ChatToolInvocation in the Streaming state and appends it to the chat.
     * Returns the invocation so it can be looked up later when invokeTool is called.
     */
    beginToolCall(options: IBeginToolCallOptions): IChatToolInvocation | undefined;
    /**
     * Update the streaming state of a pending tool call.
     * Calls the tool's handleToolStream method to get a custom invocation message.
     */
    updateToolStream(toolCallId: string, partialInput: unknown, token: CancellationToken): Promise<void>;
    invokeTool(invocation: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
    cancelToolCallsForRequest(requestId: string): void;
    /** Flush any pending tool updates to the extension hosts. */
    flushToolUpdates(): void;
    readonly toolSets: IObservable<Iterable<ToolSet>>;
    getToolSet(id: string): ToolSet | undefined;
    getToolSetByName(name: string): ToolSet | undefined;
    createToolSet(source: ToolDataSource, id: string, referenceName: string, options?: {
        icon?: ThemeIcon;
        description?: string;
        legacyFullNames?: string[];
    }): ToolSet & IDisposable;
    getFullReferenceNames(): Iterable<string>;
    getFullReferenceName(tool: IToolData, toolSet?: ToolSet): string;
    getToolByFullReferenceName(fullReferenceName: string): IToolData | ToolSet | undefined;
    getDeprecatedFullReferenceNames(): Map<string, Set<string>>;
    toToolAndToolSetEnablementMap(fullReferenceNames: readonly string[], target: string | undefined): IToolAndToolSetEnablementMap;
    toFullReferenceNames(map: IToolAndToolSetEnablementMap): string[];
    toToolReferences(variableReferences: readonly IVariableReference[]): ChatRequestToolReferenceEntry[];
}
export declare function createToolInputUri(toolCallId: string): URI;
export declare function createToolSchemaUri(toolOrId: IToolData | string): URI;
export declare namespace SpecedToolAliases {
    const execute = "execute";
    const edit = "edit";
    const search = "search";
    const agent = "agent";
    const read = "read";
    const web = "web";
    const todo = "todo";
}
export declare namespace VSCodeToolReference {
    const runSubagent = "runSubagent";
    const vscode = "vscode";
}
