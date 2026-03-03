import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogger, LogLevel } from '../../../../platform/log/common/log.js';
import { IMcpMessageTransport } from './mcpRegistryTypes.js';
import { IMcpTaskInternal, McpTaskManager } from './mcpTaskManager.js';
import { IMcpClientMethods } from './mcpTypes.js';
import { MCP } from './modelContextProtocol.js';
export interface McpRoot {
    uri: string;
    name?: string;
}
export interface IMcpServerRequestHandlerOptions extends IMcpClientMethods {
    /** MCP message transport */
    launch: IMcpMessageTransport;
    /** Logger instance. */
    logger: ILogger;
    /** Log level MCP messages is logged at */
    requestLogLevel?: LogLevel;
    /** Task manager for server-side MCP tasks (shared across reconnections) */
    taskManager: McpTaskManager;
}
/**
 * Request handler for communicating with an MCP server.
 *
 * Handles sending requests and receiving responses, with automatic
 * handling of ping requests and typed client request methods.
 */
export declare class McpServerRequestHandler extends Disposable {
    private readonly _rpc;
    private _hasAnnouncedRoots;
    private _roots;
    set roots(roots: MCP.Root[]);
    private _serverInit;
    get capabilities(): MCP.ServerCapabilities;
    get serverInfo(): MCP.Implementation;
    get serverInstructions(): string | undefined;
    private readonly _onDidReceiveCancelledNotification;
    readonly onDidReceiveCancelledNotification: import("../../../../base/common/event.js").Event<MCP.CancelledNotification>;
    private readonly _onDidReceiveProgressNotification;
    readonly onDidReceiveProgressNotification: import("../../../../base/common/event.js").Event<MCP.ProgressNotification>;
    private readonly _onDidReceiveElicitationCompleteNotification;
    readonly onDidReceiveElicitationCompleteNotification: import("../../../../base/common/event.js").Event<MCP.ElicitationCompleteNotification>;
    private readonly _onDidChangeResourceList;
    readonly onDidChangeResourceList: import("../../../../base/common/event.js").Event<void>;
    private readonly _onDidUpdateResource;
    readonly onDidUpdateResource: import("../../../../base/common/event.js").Event<MCP.ResourceUpdatedNotification>;
    private readonly _onDidChangeToolList;
    readonly onDidChangeToolList: import("../../../../base/common/event.js").Event<void>;
    private readonly _onDidChangePromptList;
    readonly onDidChangePromptList: import("../../../../base/common/event.js").Event<void>;
    /**
     * Connects to the MCP server and does the initialization handshake.
     * @throws MpcResponseError if the server fails to initialize.
     */
    static create(instaService: IInstantiationService, opts: IMcpServerRequestHandlerOptions, token?: CancellationToken): Promise<McpServerRequestHandler>;
    readonly logger: ILogger;
    private readonly _launch;
    private readonly _requestLogLevel;
    private readonly _createMessageRequestHandler;
    private readonly _elicitationRequestHandler;
    private readonly _taskManager;
    protected constructor({ launch, logger, createMessageRequestHandler, elicitationRequestHandler, requestLogLevel, taskManager, }: IMcpServerRequestHandlerOptions);
    /**
     * Send a client request to the server and return the response.
     *
     * @param request The request to send
     * @param token Cancellation token
     * @param timeoutMs Optional timeout in milliseconds
     * @returns A promise that resolves with the response
     */
    private sendRequest;
    private send;
    /**
     * Handles paginated requests by making multiple requests until all items are retrieved.
     *
     * @param method The method name to call
     * @param getItems Function to extract the array of items from a result
     * @param initialParams Initial parameters
     * @param token Cancellation token
     * @returns Promise with all items combined
     */
    private sendRequestPaginated;
    private sendNotification;
    /**
     * Handle incoming server requests
     */
    private handleServerRequest;
    /**
     * Handle incoming server notifications
     */
    private handleServerNotification;
    private handleCancelledNotification;
    private handleLoggingNotification;
    /**
     * Send a response to a ping request
     */
    private handlePing;
    /**
     * Send a response to a roots/list request
     */
    private handleRootsList;
    private cancelAllRequests;
    dispose(): void;
    /**
     * Forwards log level changes to the MCP server if it supports logging
     */
    private _sendLogLevelToServer;
    /**
     * Send an initialize request
     */
    initialize(params: MCP.InitializeRequest['params'], token?: CancellationToken): Promise<MCP.InitializeResult>;
    /**
     * List available resources
     */
    listResources(params?: MCP.ListResourcesRequest['params'], token?: CancellationToken): Promise<MCP.Resource[]>;
    /**
     * List available resources (iterable)
     */
    listResourcesIterable(params?: MCP.ListResourcesRequest['params'], token?: CancellationToken): AsyncIterable<MCP.Resource[]>;
    /**
     * Read a specific resource
     */
    readResource(params: MCP.ReadResourceRequest['params'], token?: CancellationToken): Promise<MCP.ReadResourceResult>;
    /**
     * List available resource templates
     */
    listResourceTemplates(params?: MCP.ListResourceTemplatesRequest['params'], token?: CancellationToken): Promise<MCP.ResourceTemplate[]>;
    /**
     * Subscribe to resource updates
     */
    subscribe(params: MCP.SubscribeRequest['params'], token?: CancellationToken): Promise<MCP.EmptyResult>;
    /**
     * Unsubscribe from resource updates
     */
    unsubscribe(params: MCP.UnsubscribeRequest['params'], token?: CancellationToken): Promise<MCP.EmptyResult>;
    /**
     * List available prompts
     */
    listPrompts(params?: MCP.ListPromptsRequest['params'], token?: CancellationToken): Promise<MCP.Prompt[]>;
    /**
     * Get a specific prompt
     */
    getPrompt(params: MCP.GetPromptRequest['params'], token?: CancellationToken): Promise<MCP.GetPromptResult>;
    /**
     * List available tools
     */
    listTools(params?: MCP.ListToolsRequest['params'], token?: CancellationToken): Promise<MCP.Tool[]>;
    /**
     * Call a specific tool. Supports tasks automatically if `task` is set on the request.
     */
    callTool(params: MCP.CallToolRequest['params'] & MCP.Request['params'], token?: CancellationToken): Promise<MCP.CallToolResult>;
    /**
     * Set the logging level
     */
    setLevel(params: MCP.SetLevelRequest['params'], token?: CancellationToken): Promise<MCP.EmptyResult>;
    /**
     * Find completions for an argument
     */
    complete(params: MCP.CompleteRequest['params'], token?: CancellationToken): Promise<MCP.CompleteResult>;
    /**
     * Get task status
     */
    getTask(params: {
        taskId: string;
    }, token?: CancellationToken): Promise<MCP.GetTaskResult>;
    /**
     * Get task result
     */
    getTaskResult(params: {
        taskId: string;
    }, token?: CancellationToken): Promise<MCP.GetTaskPayloadResult>;
    /**
     * Cancel a task
     */
    cancelTask(params: {
        taskId: string;
    }, token?: CancellationToken): Promise<MCP.CancelTaskResult>;
    /**
     * List all tasks
     */
    listTasks(params?: MCP.ListTasksRequest['params'], token?: CancellationToken): Promise<MCP.Task[]>;
}
/**
 * Implementation of a task that handles polling, status notifications, and handler reconnections. It implements the task polling loop internally and can also be
 * updated externally via `onDidUpdateState`, when notifications are received
 * for example.
 * @internal
 */
export declare class McpTask<T extends MCP.Result> extends Disposable implements IMcpTaskInternal {
    private readonly _task;
    private readonly promise;
    get result(): Promise<T>;
    get id(): string;
    private _lastTaskState;
    private _handler;
    constructor(_task: MCP.Task, _token?: CancellationToken);
    onDidUpdateState(task: MCP.Task): void;
    setHandler(handler: McpServerRequestHandler | undefined): void;
}
