var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "./async.js";
import { CancellationToken, CancellationTokenSource } from "./cancellation.js";
import { CancellationError } from "./errors.js";
import { Disposable, toDisposable } from "./lifecycle.js";
import { hasKey } from "./types.js";
class JsonRpcError extends Error {
  static {
    __name(this, "JsonRpcError");
  }
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.data = data;
  }
}
class JsonRpcProtocol extends Disposable {
  static {
    __name(this, "JsonRpcProtocol");
  }
  static {
    this.ParseError = -32700;
  }
  static {
    this.MethodNotFound = -32601;
  }
  static {
    this.InternalError = -32603;
  }
  constructor(_send, _handlers) {
    super();
    this._send = _send;
    this._handlers = _handlers;
    this._nextRequestId = 1;
    this._pendingRequests = /* @__PURE__ */ new Map();
  }
  sendNotification(notification) {
    this._send({
      jsonrpc: "2.0",
      ...notification
    });
  }
  sendRequest(request, token = CancellationToken.None, onCancel) {
    if (this._store.isDisposed) {
      return Promise.reject(new CancellationError());
    }
    const id = this._nextRequestId++;
    const promise = new DeferredPromise();
    const cts = new CancellationTokenSource();
    this._pendingRequests.set(id, { promise, cts });
    const cancelListener = token.onCancellationRequested(() => {
      if (!promise.isSettled) {
        this._pendingRequests.delete(id);
        cts.cancel();
        onCancel?.(id);
        promise.cancel();
      }
      cancelListener.dispose();
    });
    this._send({
      jsonrpc: "2.0",
      id,
      ...request
    });
    return promise.p.finally(() => {
      cancelListener.dispose();
      this._pendingRequests.delete(id);
      cts.dispose(true);
    });
  }
  async handleMessage(message) {
    if (Array.isArray(message)) {
      for (const single of message) {
        await this._handleMessage(single);
      }
      return;
    }
    await this._handleMessage(message);
  }
  cancelPendingRequest(id) {
    const request = this._pendingRequests.get(id);
    if (request) {
      this._pendingRequests.delete(id);
      request.cts.cancel();
      request.promise.cancel();
      request.cts.dispose(true);
    }
  }
  cancelAllRequests() {
    for (const [id, pending] of this._pendingRequests) {
      this._pendingRequests.delete(id);
      pending.cts.cancel();
      pending.promise.cancel();
      pending.cts.dispose(true);
    }
  }
  async _handleMessage(message) {
    if (isJsonRpcResponse(message)) {
      if (hasKey(message, { result: true })) {
        this._handleResult(message);
      } else {
        this._handleError(message);
      }
    }
    if (isJsonRpcRequest(message)) {
      await this._handleRequest(message);
    }
    if (isJsonRpcNotification(message)) {
      this._handlers.handleNotification?.(message);
    }
  }
  _handleResult(response) {
    const request = this._pendingRequests.get(response.id);
    if (request) {
      this._pendingRequests.delete(response.id);
      request.promise.complete(response.result);
      request.cts.dispose(true);
    }
  }
  _handleError(response) {
    if (response.id === void 0) {
      return;
    }
    const request = this._pendingRequests.get(response.id);
    if (request) {
      this._pendingRequests.delete(response.id);
      request.promise.error(new JsonRpcError(response.error.code, response.error.message, response.error.data));
      request.cts.dispose(true);
    }
  }
  async _handleRequest(request) {
    if (!this._handlers.handleRequest) {
      this._send({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: JsonRpcProtocol.MethodNotFound,
          message: `Method not found: ${request.method}`
        }
      });
      return;
    }
    const cts = new CancellationTokenSource();
    this._register(toDisposable(() => cts.dispose(true)));
    try {
      const resultOrThenable = this._handlers.handleRequest(request, cts.token);
      const result = isThenable(resultOrThenable) ? await resultOrThenable : resultOrThenable;
      this._send({
        jsonrpc: "2.0",
        id: request.id,
        result
      });
    } catch (error) {
      if (error instanceof JsonRpcError) {
        this._send({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: error.code,
            message: error.message,
            data: error.data
          }
        });
      } else {
        this._send({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: JsonRpcProtocol.InternalError,
            message: error instanceof Error ? error.message : "Internal error"
          }
        });
      }
    } finally {
      cts.dispose(true);
    }
  }
  dispose() {
    this.cancelAllRequests();
    super.dispose();
  }
  static createParseError(message, data) {
    return {
      jsonrpc: "2.0",
      error: {
        code: JsonRpcProtocol.ParseError,
        message,
        data
      }
    };
  }
}
function isJsonRpcRequest(message) {
  return "method" in message && "id" in message && (typeof message.id === "string" || typeof message.id === "number");
}
__name(isJsonRpcRequest, "isJsonRpcRequest");
function isJsonRpcResponse(message) {
  return hasKey(message, { id: true, result: true }) || hasKey(message, { id: true, error: true });
}
__name(isJsonRpcResponse, "isJsonRpcResponse");
function isJsonRpcNotification(message) {
  return hasKey(message, { method: true }) && !hasKey(message, { id: true });
}
__name(isJsonRpcNotification, "isJsonRpcNotification");
function isThenable(value) {
  return typeof value === "object" && value !== null && "then" in value && typeof value.then === "function";
}
__name(isThenable, "isThenable");
export {
  JsonRpcError,
  JsonRpcProtocol,
  isJsonRpcNotification,
  isJsonRpcRequest,
  isJsonRpcResponse
};
//# sourceMappingURL=jsonRpcProtocol.js.map
