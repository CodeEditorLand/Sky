var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals } from "../../../../base/common/arrays.js";
import { DeferredPromise, IntervalTimer } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { canLog, ILogger, LogLevel } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IMcpMessageTransport } from "./mcpRegistryTypes.js";
import { McpConnectionState, MpcResponseError } from "./mcpTypes.js";
import { MCP } from "./modelContextProtocol.js";
class McpServerRequestHandler extends Disposable {
  constructor(launch, logger) {
    super();
    this.launch = launch;
    this.logger = logger;
    this._register(launch.onDidReceiveMessage((message) => this.handleMessage(message)));
    this._register(autorun((reader) => {
      const state = launch.state.read(reader).state;
      if (state === McpConnectionState.Kind.Error || state === McpConnectionState.Kind.Stopped) {
        this.cancelAllRequests();
      }
    }));
  }
  static {
    __name(this, "McpServerRequestHandler");
  }
  _nextRequestId = 1;
  _pendingRequests = /* @__PURE__ */ new Map();
  _hasAnnouncedRoots = false;
  _roots = [];
  set roots(roots) {
    if (!equals(this._roots, roots)) {
      this._roots = roots;
      if (this._hasAnnouncedRoots) {
        this.sendNotification({ method: "notifications/roots/list_changed" });
        this._hasAnnouncedRoots = false;
      }
    }
  }
  _serverInit;
  get capabilities() {
    return this._serverInit.capabilities;
  }
  // Event emitters for server notifications
  _onDidReceiveCancelledNotification = this._register(new Emitter());
  onDidReceiveCancelledNotification = this._onDidReceiveCancelledNotification.event;
  _onDidReceiveProgressNotification = this._register(new Emitter());
  onDidReceiveProgressNotification = this._onDidReceiveProgressNotification.event;
  _onDidChangeResourceList = this._register(new Emitter());
  onDidChangeResourceList = this._onDidChangeResourceList.event;
  _onDidUpdateResource = this._register(new Emitter());
  onDidUpdateResource = this._onDidUpdateResource.event;
  _onDidChangeToolList = this._register(new Emitter());
  onDidChangeToolList = this._onDidChangeToolList.event;
  _onDidChangePromptList = this._register(new Emitter());
  onDidChangePromptList = this._onDidChangePromptList.event;
  /**
   * Connects to the MCP server and does the initialization handshake.
   * @throws MpcResponseError if the server fails to initialize.
   */
  static async create(instaService, launch, logger, token) {
    const mcp = new McpServerRequestHandler(launch, logger);
    const store = new DisposableStore();
    try {
      const timer = store.add(new IntervalTimer());
      timer.cancelAndSet(() => {
        logger.info("Waiting for server to respond to `initialize` request...");
      }, 5e3);
      await instaService.invokeFunction(async (accessor) => {
        const productService = accessor.get(IProductService);
        const initialized = await mcp.sendRequest({
          method: "initialize",
          params: {
            protocolVersion: MCP.LATEST_PROTOCOL_VERSION,
            capabilities: {
              roots: { listChanged: true }
            },
            clientInfo: {
              name: productService.nameLong,
              version: productService.version
            }
          }
        }, token);
        mcp._serverInit = initialized;
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
    if (canLog(this.logger.getLevel(), LogLevel.Debug)) {
      this.logger.debug(`[editor -> server] ${JSON.stringify(mcp)}`);
    }
    this.launch.send(mcp);
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
  async sendRequestPaginated(method, getItems, initialParams, token = CancellationToken.None) {
    let allItems = [];
    let nextCursor = void 0;
    do {
      const params = {
        ...initialParams,
        cursor: nextCursor
      };
      const result = await this.sendRequest({ method, params }, token);
      allItems = allItems.concat(getItems(result));
      nextCursor = result.nextCursor;
    } while (nextCursor !== void 0 && !token.isCancellationRequested);
    return allItems;
  }
  sendNotification(notification) {
    this.send({ ...notification, jsonrpc: MCP.JSONRPC_VERSION });
  }
  /**
   * Handle incoming messages from the server
   */
  handleMessage(message) {
    if (canLog(this.logger.getLevel(), LogLevel.Debug)) {
      this.logger.debug(`[server <- editor] ${JSON.stringify(message)}`);
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
  handleServerRequest(request) {
    switch (request.method) {
      case "ping":
        return this.respondToRequest(request, this.handlePing(request));
      case "roots/list":
        return this.respondToRequest(request, this.handleRootsList(request));
      default: {
        const errorResponse = {
          jsonrpc: MCP.JSONRPC_VERSION,
          id: request.id,
          error: {
            code: MCP.METHOD_NOT_FOUND,
            message: `Method not found: ${request.method}`
          }
        };
        this.send(errorResponse);
        break;
      }
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
    }
  }
  handleCancelledNotification(request) {
    const pendingRequest = this._pendingRequests.get(request.params.requestId);
    if (pendingRequest) {
      this._pendingRequests.delete(request.params.requestId);
      pendingRequest.promise.cancel();
    }
  }
  handleLoggingNotification(request) {
    let contents = typeof request.params.data === "string" ? request.params.data : JSON.stringify(request.params.data);
    if (request.params.logger) {
      contents = `${request.params.logger}: ${contents}`;
    }
    switch (request.params?.level) {
      case "debug":
        this.logger.debug(contents);
        break;
      case "info":
      case "notice":
        this.logger.info(contents);
        break;
      case "warning":
        this.logger.warn(contents);
        break;
      case "error":
      case "critical":
      case "alert":
      case "emergency":
        this.logger.error(contents);
        break;
      default:
        this.logger.info(contents);
        break;
    }
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
   * Send an initialize request
   */
  initialize(params, token) {
    return this.sendRequest({ method: "initialize", params }, token);
  }
  /**
   * List available resources
   */
  listResources(params, token) {
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
    return this.sendRequestPaginated("resources/templates/list", (result) => result.resourceTemplates, params, token);
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
    return this.sendRequestPaginated("prompts/list", (result) => result.prompts, params, token);
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
    return this.sendRequestPaginated("tools/list", (result) => result.tools, params, token);
  }
  /**
   * Call a specific tool
   */
  callTool(params, token) {
    return this.sendRequest({ method: "tools/call", params }, token);
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
}
export {
  McpServerRequestHandler
};
//# sourceMappingURL=mcpServerRequestHandler.js.map
