import { IMarkdownString } from '../../../../../../base/common/htmlContent.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { ConfirmedReason, IChatExtensionsContent, IChatSubagentToolInvocationData, IChatTodoListContent, IChatToolInputInvocationData, IChatToolInvocation, IChatToolInvocationSerialized, type IChatTerminalToolInvocationData } from '../../chatService/chatService.js';
import { IPreparedToolInvocation, IToolConfirmationMessages, IToolData, IToolProgressStep, IToolResult, ToolDataSource } from '../../tools/languageModelToolsService.js';
export interface IStreamingToolCallOptions {
    toolCallId: string;
    toolId: string;
    toolData: IToolData;
    subagentInvocationId?: string;
    chatRequestId?: string;
}
export declare class ChatToolInvocation implements IChatToolInvocation {
    readonly toolCallId: string;
    readonly kind: 'toolInvocation';
    invocationMessage: string | IMarkdownString;
    readonly originMessage: string | IMarkdownString | undefined;
    pastTenseMessage: string | IMarkdownString | undefined;
    confirmationMessages: IToolConfirmationMessages | undefined;
    presentation: IPreparedToolInvocation['presentation'];
    readonly toolId: string;
    source: ToolDataSource;
    readonly subAgentInvocationId: string | undefined;
    parameters: unknown;
    generatedTitle?: string;
    readonly chatRequestId?: string;
    toolSpecificData?: IChatTerminalToolInvocationData | IChatToolInputInvocationData | IChatExtensionsContent | IChatTodoListContent | IChatSubagentToolInvocationData;
    private readonly _progress;
    private readonly _state;
    private readonly _partialInput;
    private readonly _streamingMessage;
    get state(): IObservable<IChatToolInvocation.State>;
    /**
     * Create a tool invocation in streaming state.
     * Use this when the tool call is beginning to stream partial input from the LM.
     */
    static createStreaming(options: IStreamingToolCallOptions): ChatToolInvocation;
    constructor(preparedInvocation: IPreparedToolInvocation | undefined, toolData: IToolData, toolCallId: string, subAgentInvocationId: string | undefined, parameters: unknown, isStreaming?: boolean, chatRequestId?: string);
    /**
     * Update the partial input observable during streaming.
     */
    updatePartialInput(input: unknown): void;
    /**
     * Update the streaming message (from handleToolStream).
     */
    updateStreamingMessage(message: string | IMarkdownString): void;
    /**
     * Transition from streaming state to prepared/executing state.
     * Called when the full tool call is ready.
     */
    transitionFromStreaming(preparedInvocation: IPreparedToolInvocation | undefined, parameters: unknown, autoConfirmed: ConfirmedReason | undefined): void;
    private _setCompleted;
    didExecuteTool(result: IToolResult | undefined, final?: boolean, checkIfResultAutoApproved?: () => Promise<ConfirmedReason | undefined>): Promise<IChatToolInvocation.State>;
    acceptProgress(step: IToolProgressStep): void;
    toJSON(): IChatToolInvocationSerialized;
}
