var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../../base/common/arrays.js";
import { assertNever, softAssertNever } from "../../../../base/common/assert.js";
import { DeferredPromise, disposableTimeout, IntervalTimer } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, ObservablePromise, observableValue, transaction } from "../../../../base/common/observable.js";
import { canLog, log, LogLevel } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { McpError, MpcResponseError } from "./mcpTypes.js";
import { isTaskResult, translateMcpLogMessage } from "./mcpTypesUtils.js";
import { MCP } from "./modelContextProtocol.js";
class McpServerRequestHandler extends Disposable {
  static {
    __name(this, "McpServerRequestHandler");
  }
  set roots(roots) {
    if (!equals(this._roots, roots)) {
      this._roots = roots;
      if (this._hasAnnouncedRoots) {
        this.sendNotification({ method: "notifications/roots/list_changed" });
        this._hasAnnouncedRoots = false;
      }
    }
  }
  get capabilities() {
    return this._serverInit.capabilities;
  }
  get serverInfo() {
    return this._serverInit.serverInfo;
  }
  get serverInstructions() {
    return this._serverInit.instructions;
  }
  /**
   * Connects to the MCP server and does the initialization handshake.
   * @throws MpcResponseError if the server fails to initialize.
   */
  static async create(instaService, opts, token) {
    const mcp = new McpServerRequestHandler(opts);
    const store = new DisposableStore();
    try {
      const timer = store.add(new IntervalTimer());
      timer.cancelAndSet(() => {
        opts.logger.info("Waiting for server to respond to `initialize` request...");
      }, 5e3);
      await instaService.invokeFunction(async (accessor) => {
        const productService = accessor.get(IProductService);
        const initialized = await mcp.sendRequest({
          method: "initialize",
          params: {
            protocolVersion: MCP.LATEST_PROTOCOL_VERSION,
            capabilities: {
              roots: { listChanged: true },
              sampling: opts.createMessageRequestHandler ? {} : void 0,
              elicitation: opts.elicitationRequestHandler ? { form: {}, url: {} } : void 0,
              tasks: {
                list: {},
                cancel: {},
                requests: {
                  sampling: opts.createMessageRequestHandler ? { createMessage: {} } : void 0,
                  elicitation: opts.elicitationRequestHandler ? { create: {} } : void 0
                }
              }
            },
            clientInfo: {
              name: productService.nameLong,
              version: productService.version
            }
          }
        }, token);
        mcp._serverInit = initialized;
        mcp._sendLogLevelToServer(opts.logger.getLevel());
        mcp.sendNotification({
          method: "notifications/initialized"
        });
      });
      return mcp;
    } catch (e) {
      mcp.dispose();
      throw e;
    } finally {
      store.dispose();
    }
  }
  constructor({ launch, logger, createMessageRequestHandler, elicitationRequestHandler, requestLogLevel = LogLevel.Debug, taskManager }) {
    super();
    this._nextRequestId = 1;
    this._pendingRequests = /* @__PURE__ */ new Map();
    this._hasAnnouncedRoots = false;
    this._roots = [];
    this._onDidReceiveCancelledNotification = this._register(new Emitter());
    this.onDidReceiveCancelledNotification = this._onDidReceiveCancelledNotification.event;
    this._onDidReceiveProgressNotification = this._register(new Emitter());
    this.onDidReceiveProgressNotification = this._onDidReceiveProgressNotification.event;
    this._onDidReceiveElicitationCompleteNotification = this._register(new Emitter());
    this.onDidReceiveElicitationCompleteNotification = this._onDidReceiveElicitationCompleteNotification.event;
    this._onDidChangeResourceList = this._register(new Emitter());
    this.onDidChangeResourceList = this._onDidChangeResourceList.event;
    this._onDidUpdateResource = this._register(new Emitter());
    this.onDidUpdateResource = this._onDidUpdateResource.event;
    this._onDidChangeToolList = this._register(new Emitter());
    this.onDidChangeToolList = this._onDidChangeToolList.event;
    this._onDidChangePromptList = this._register(new Emitter());
    this.onDidChangePromptList = this._onDidChangePromptList.event;
    this._launch = launch;
    this.logger = logger;
    this._requestLogLevel = requestLogLevel;
    this._createMessageRequestHandler = createMessageRequestHandler;
    this._elicitationRequestHandler = elicitationRequestHandler;
    this._taskManager = taskManager;
    this._taskManager.setHandler(this);
    this._register(this._taskManager.onDidUpdateTask((task) => {
      this.send({
        jsonrpc: MCP.JSONRPC_VERSION,
        method: "notifications/tasks/status",
        params: task
      });
    }));
    this._register(toDisposable(() => this._taskManager.setHandler(void 0)));
    this._register(launch.onDidReceiveMessage((message) => this.handleMessage(message)));
    this._register(autorun((reader) => {
      const state = launch.state.read(reader).state;
      if (state === 3 || state === 0) {
        this.cancelAllRequests();
      }
    }));
    this._register(logger.onDidChangeLogLevel((logLevel) => {
      this._sendLogLevelToServer(logLevel);
    }));
  }
  /**
   * Send a client request to the server and return the response.
   *
   * @param request The request to send
   * @param token Cancellation token
   * @param timeoutMs Optional timeout in milliseconds
   * @returns A promise that resolves with the response
   */
  async sendRequest(request, token = CancellationToken.None) {
    if (this._store.isDisposed) {
      return Promise.reject(new CancellationError());
    }
    const id = this._nextRequestId++;
    const jsonRpcRequest = {
      jsonrpc: MCP.JSONRPC_VERSION,
      id,
      ...request
    };
    const promise = new DeferredPromise();
    this._pendingRequests.set(id, { promise });
    const cancelListener = token.onCancellationRequested(() => {
      if (!promise.isSettled) {
        this._pendingRequests.delete(id);
        this.sendNotification({ method: "notifications/cancelled", params: { requestId: id } });
        promise.cancel();
      }
      cancelListener.dispose();
    });
    this.send(jsonRpcRequest);
    const ret = promise.p.finally(() => {
      cancelListener.dispose();
      this._pendingRequests.delete(id);
    });
    return ret;
  }
  send(mcp) {
    if (canLog(this.logger.getLevel(), this._requestLogLevel)) {
      log(this.logger, this._requestLogLevel, `[editor -> server] ${JSON.stringify(mcp)}`);
    }
    this._launch.send(mcp);
  }
  /**
   * Handles paginated requests by making multiple requests until all items are retrieved.
   *
   * @param method The method name to call
   * @param getItems Function to extract the array of items from a result
   * @param initialParams Initial parameters
   * @param token Cancellation token
   * @returns Promise with all items combined
   */
  async *sendRequestPaginated(method, getItems, initialParams, token = CancellationToken.None) {
    let nextCursor = void 0;
    do {
      const params = {
        ...initialParams,
        cursor: nextCursor
      };
      const result = await this.sendRequest({ method, params }, token);
      yield getItems(result);
      nextCursor = result.nextCursor;
    } while (nextCursor !== void 0 && !token.isCancellationRequested);
  }
  sendNotification(notification) {
    this.send({ ...notification, jsonrpc: MCP.JSONRPC_VERSION });
  }
  /**
   * Handle incoming messages from the server
   */
  handleMessage(message) {
    if (canLog(this.logger.getLevel(), this._requestLogLevel)) {
      log(this.logger, this._requestLogLevel, `[server -> editor] ${JSON.stringify(message)}`);
    }
    if ("id" in message) {
      if ("result" in message) {
        this.handleResult(message);
      } else if ("error" in message) {
        this.handleError(message);
      }
    }
    if ("method" in message) {
      if ("id" in message) {
        this.handleServerRequest(message);
      } else {
        this.handleServerNotification(message);
      }
    }
  }
  /**
   * Handle successful responses
   */
  handleResult(response) {
    const request = this._pendingRequests.get(response.id);
    if (request) {
      this._pendingRequests.delete(response.id);
      request.promise.complete(response.result);
    }
  }
  /**
   * Handle error responses
   */
  handleError(response) {
    const request = this._pendingRequests.get(response.id);
    if (request) {
      this._pendingRequests.delete(response.id);
      request.promise.error(new MpcResponseError(response.error.message, response.error.code, response.error.data));
    }
  }
  /**
   * Handle incoming server requests
   */
  async handleServerRequest(request) {
    try {
      let response;
      if (request.method === "ping") {
        response = this.handlePing(request);
      } else if (request.method === "roots/list") {
        response = this.handleRootsList(request);
      } else if (request.method === "sampling/createMessage" && this._createMessageRequestHandler) {
        if (request.params.task) {
          const taskResult = this._taskManager.createTask(request.params.task.ttl ?? null, (token) => this._createMessageRequestHandler(request.params, token));
          taskResult._meta ??= {};
          taskResult._meta["io.modelcontextprotocol/related-task"] = { taskId: taskResult.task.taskId };
          response = taskResult;
        } else {
          response = await this._createMessageRequestHandler(request.params);
        }
      } else if (request.method === "elicitation/create" && this._elicitationRequestHandler) {
        if (request.params.task) {
          const taskResult = this._taskManager.createTask(request.params.task.ttl ?? null, (token) => this._elicitationRequestHandler(request.params, token));
          taskResult._meta ??= {};
          taskResult._meta["io.modelcontextprotocol/related-task"] = { taskId: taskResult.task.taskId };
          response = taskResult;
        } else {
          response = await this._elicitationRequestHandler(request.params);
        }
      } else if (request.method === "tasks/get") {
        response = this._taskManager.getTask(request.params.taskId);
      } else if (request.method === "tasks/result") {
        response = await this._taskManager.getTaskResult(request.params.taskId);
      } else if (request.method === "tasks/cancel") {
        response = this._taskManager.cancelTask(request.params.taskId);
      } else if (request.method === "tasks/list") {
        response = this._taskManager.listTasks();
      } else {
        throw McpError.methodNotFound(request.method);
      }
      this.respondToRequest(request, response);
    } catch (e) {
      if (!(e instanceof McpError)) {
        this.logger.error(`Error handling request ${request.method}:`, e);
        e = McpError.unknown(e);
      }
      const errorResponse = {
        jsonrpc: MCP.JSONRPC_VERSION,
        id: request.id,
        error: {
          code: e.code,
          message: e.message,
          data: e.data
        }
      };
      this.send(errorResponse);
    }
  }
  /**
   * Handle incoming server notifications
   */
  handleServerNotification(request) {
    switch (request.method) {
      case "notifications/message":
        return this.handleLoggingNotification(request);
      case "notifications/cancelled":
        this._onDidReceiveCancelledNotification.fire(request);
        return this.handleCancelledNotification(request);
      case "notifications/progress":
        this._onDidReceiveProgressNotification.fire(request);
        return;
      case "notifications/resources/list_changed":
        this._onDidChangeResourceList.fire();
        return;
      case "notifications/resources/updated":
        this._onDidUpdateResource.fire(request);
        return;
      case "notifications/tools/list_changed":
        this._onDidChangeToolList.fire();
        return;
      case "notifications/prompts/list_changed":
        this._onDidChangePromptList.fire();
        return;
      case "notifications/elicitation/complete":
        this._onDidReceiveElicitationCompleteNotification.fire(request);
        return;
      case "notifications/tasks/status":
        this._taskManager.getClientTask(request.params.taskId)?.onDidUpdateState(request.params);
        return;
      default:
        softAssertNever(request);
    }
  }
  handleCancelledNotification(request) {
    if (request.params.requestId) {
      const pendingRequest = this._pendingRequests.get(request.params.requestId);
      if (pendingRequest) {
        this._pendingRequests.delete(request.params.requestId);
        pendingRequest.promise.cancel();
      }
    }
  }
  handleLoggingNotification(request) {
    translateMcpLogMessage(this.logger, request.params);
  }
  /**
   * Send a generic response to a request
   */
  respondToRequest(request, result) {
    const response = {
      jsonrpc: MCP.JSONRPC_VERSION,
      id: request.id,
      result
    };
    this.send(response);
  }
  /**
   * Send a response to a ping request
   */
  handlePing(_request) {
    return {};
  }
  /**
   * Send a response to a roots/list request
   */
  handleRootsList(_request) {
    this._hasAnnouncedRoots = true;
    return { roots: this._roots };
  }
  cancelAllRequests() {
    this._pendingRequests.forEach((pending) => pending.promise.cancel());
    this._pendingRequests.clear();
  }
  dispose() {
    this.cancelAllRequests();
    super.dispose();
  }
  /**
   * Forwards log level changes to the MCP server if it supports logging
   */
  async _sendLogLevelToServer(logLevel) {
    try {
      if (!this.capabilities.logging) {
        return;
      }
      await this.setLevel({ level: mapLogLevelToMcp(logLevel) });
    } catch (error) {
      this.logger.error(`Failed to set MCP server log level: ${error}`);
    }
  }
  /**
   * Send an initialize request
   */
  initialize(params, token) {
    return this.sendRequest({ method: "initialize", params }, token);
  }
  /**
   * List available resources
   */
  listResources(params, token) {
    return Iterable.asyncToArrayFlat(this.listResourcesIterable(params, token));
  }
  /**
   * List available resources (iterable)
   */
  listResourcesIterable(params, token) {
    return this.sendRequestPaginated("resources/list", (result) => result.resources, params, token);
  }
  /**
   * Read a specific resource
   */
  readResource(params, token) {
    return this.sendRequest({ method: "resources/read", params }, token);
  }
  /**
   * List available resource templates
   */
  listResourceTemplates(params, token) {
    return Iterable.asyncToArrayFlat(this.sendRequestPaginated("resources/templates/list", (result) => result.resourceTemplates, params, token));
  }
  /**
   * Subscribe to resource updates
   */
  subscribe(params, token) {
    return this.sendRequest({ method: "resources/subscribe", params }, token);
  }
  /**
   * Unsubscribe from resource updates
   */
  unsubscribe(params, token) {
    return this.sendRequest({ method: "resources/unsubscribe", params }, token);
  }
  /**
   * List available prompts
   */
  listPrompts(params, token) {
    return Iterable.asyncToArrayFlat(this.sendRequestPaginated("prompts/list", (result) => result.prompts, params, token));
  }
  /**
   * Get a specific prompt
   */
  getPrompt(params, token) {
    return this.sendRequest({ method: "prompts/get", params }, token);
  }
  /**
   * List available tools
   */
  listTools(params, token) {
    return Iterable.asyncToArrayFlat(this.sendRequestPaginated("tools/list", (result) => result.tools, params, token));
  }
  /**
   * Call a specific tool. Supports tasks automatically if `task` is set on the request.
   */
  async callTool(params, token) {
    const response = await this.sendRequest({ method: "tools/call", params }, token);
    if (isTaskResult(response)) {
      const task = new McpTask(response.task, token);
      this._taskManager.adoptClientTask(task);
      task.setHandler(this);
      return task.result.finally(() => {
        this._taskManager.abandonClientTask(task.id);
      });
    }
    return response;
  }
  /**
   * Set the logging level
   */
  setLevel(params, token) {
    return this.sendRequest({ method: "logging/setLevel", params }, token);
  }
  /**
   * Find completions for an argument
   */
  complete(params, token) {
    return this.sendRequest({ method: "completion/complete", params }, token);
  }
  /**
   * Get task status
   */
  getTask(params, token) {
    return this.sendRequest({ method: "tasks/get", params }, token);
  }
  /**
   * Get task result
   */
  getTaskResult(params, token) {
    return this.sendRequest({ method: "tasks/result", params }, token);
  }
  /**
   * Cancel a task
   */
  cancelTask(params, token) {
    return this.sendRequest({ method: "tasks/cancel", params }, token);
  }
  /**
   * List all tasks
   */
  listTasks(params, token) {
    return Iterable.asyncToArrayFlat(this.sendRequestPaginated("tasks/list", (result) => result.tasks, params, token));
  }
}
function isTaskInTerminalState(task) {
  return task.status === "completed" || task.status === "failed" || task.status === "cancelled";
}
__name(isTaskInTerminalState, "isTaskInTerminalState");
class McpTask extends Disposable {
  static {
    __name(this, "McpTask");
  }
  get result() {
    return this.promise.p;
  }
  get id() {
    return this._task.taskId;
  }
  constructor(_task, _token = CancellationToken.None) {
    super();
    this._task = _task;
    this.promise = new DeferredPromise();
    this._handler = observableValue("mcpTaskHandler", void 0);
    const expiresAt = _task.ttl ? Date.now() + _task.ttl : void 0;
    this._lastTaskState = observableValue("lastTaskState", this._task);
    const store = this._register(new DisposableStore());
    if (_token.isCancellationRequested) {
      this._lastTaskState.set({ ...this._task, status: "cancelled" }, void 0);
    } else {
      store.add(_token.onCancellationRequested(() => {
        const current = this._lastTaskState.get();
        if (!isTaskInTerminalState(current)) {
          this._lastTaskState.set({ ...current, status: "cancelled" }, void 0);
        }
      }));
    }
    if (expiresAt) {
      const ttlTimeout = expiresAt - Date.now();
      if (ttlTimeout <= 0) {
        this._lastTaskState.set({ ...this._task, status: "cancelled", statusMessage: "Task timed out." }, void 0);
      } else {
        store.add(disposableTimeout(() => {
          const current = this._lastTaskState.get();
          if (!isTaskInTerminalState(current)) {
            this._lastTaskState.set({ ...current, status: "cancelled", statusMessage: "Task timed out." }, void 0);
          }
        }, ttlTimeout));
      }
    }
    const inputRequiredLookup = observableValue("activeResultLookup", void 0);
    store.add(autorun((reader) => {
      const current = this._lastTaskState.read(reader);
      if (isTaskInTerminalState(current)) {
        return;
      }
      const lookup = inputRequiredLookup.read(reader);
      if (lookup) {
        const result = lookup.promiseResult.read(reader);
        return transaction((tx) => {
          if (!result) {
          } else if (result.data) {
            inputRequiredLookup.set(void 0, tx);
            this._lastTaskState.set(result.data, tx);
          } else {
            inputRequiredLookup.set(void 0, tx);
            if (result.error instanceof McpError && result.error.code === MCP.INVALID_PARAMS) {
              this._lastTaskState.set({ ...current, status: "cancelled" }, void 0);
            } else {
              this._lastTaskState.set({ ...current, status: "working" }, void 0);
            }
          }
        });
      }
      const handler = this._handler.read(reader);
      if (!handler) {
        return;
      }
      const pollInterval = _task.pollInterval ?? 2e3;
      const cts = new CancellationTokenSource(_token);
      reader.store.add(toDisposable(() => cts.dispose(true)));
      reader.store.add(disposableTimeout(() => {
        handler.getTask({ taskId: current.taskId }, cts.token).catch((e) => {
          if (e instanceof McpError && e.code === MCP.INVALID_PARAMS) {
            return { ...current, status: "cancelled" };
          } else {
            return { ...current };
          }
        }).then((r) => {
          if (r && !cts.token.isCancellationRequested) {
            this._lastTaskState.set(r, void 0);
          }
        });
      }, pollInterval));
    }));
    const lastStatus = this._lastTaskState.map((task) => task.status);
    store.add(autorun((reader) => {
      const status = lastStatus.read(reader);
      if (status === "failed") {
        const current = this._lastTaskState.read(void 0);
        this.promise.error(new Error(`Task ${current.taskId} failed: ${current.statusMessage ?? "unknown error"}`));
        store.dispose();
      } else if (status === "cancelled") {
        this.promise.cancel();
        store.dispose();
      } else if (status === "input_required") {
        const handler = this._handler.read(reader);
        if (handler) {
          const current = this._lastTaskState.read(void 0);
          const cts = new CancellationTokenSource(_token);
          reader.store.add(toDisposable(() => cts.dispose(true)));
          inputRequiredLookup.set(new ObservablePromise(handler.getTask({ taskId: current.taskId }, cts.token)), void 0);
        }
      } else if (status === "completed") {
        const handler = this._handler.read(reader);
        if (handler) {
          this.promise.settleWith(handler.getTaskResult({ taskId: _task.taskId }, _token));
          store.dispose();
        }
      } else if (status === "working") {
      } else {
        softAssertNever(status);
      }
    }));
  }
  onDidUpdateState(task) {
    this._lastTaskState.set(task, void 0);
  }
  setHandler(handler) {
    this._handler.set(handler, void 0);
  }
}
function mapLogLevelToMcp(logLevel) {
  switch (logLevel) {
    case LogLevel.Trace:
      return "debug";
    // MCP doesn't have trace, use debug
    case LogLevel.Debug:
      return "debug";
    case LogLevel.Info:
      return "info";
    case LogLevel.Warning:
      return "warning";
    case LogLevel.Error:
      return "error";
    case LogLevel.Off:
      return "emergency";
    // MCP doesn't have off, use emergency
    default:
      return assertNever(logLevel);
  }
}
__name(mapLogLevelToMcp, "mapLogLevelToMcp");
export {
  McpServerRequestHandler,
  McpTask
};
//# sourceMappingURL=mcpServerRequestHandler.js.map
