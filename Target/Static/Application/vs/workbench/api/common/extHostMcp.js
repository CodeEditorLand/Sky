var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { DeferredPromise, raceCancellationError, Sequencer, timeout } from "../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { SSEParser } from "../../../base/common/sseParser.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { LogLevel } from "../../../platform/log/common/log.js";
import { extensionPrefixedIdentifier, McpServerLaunch } from "../../contrib/mcp/common/mcpTypes.js";
import { MainContext } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import * as Convert from "./extHostTypeConverters.js";
const IExtHostMpcService = createDecorator("IExtHostMpcService");
let ExtHostMcpService = class ExtHostMcpService2 extends Disposable {
  static {
    __name(this, "ExtHostMcpService");
  }
  constructor(extHostRpc) {
    super();
    this._initialProviderPromises = /* @__PURE__ */ new Set();
    this._sseEventSources = this._register(new DisposableMap());
    this._unresolvedMcpServers = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadMcp);
  }
  $startMcp(id, launch) {
    this._startMcp(id, McpServerLaunch.fromSerialized(launch));
  }
  _startMcp(id, launch) {
    if (launch.type === 2) {
      this._sseEventSources.set(id, new McpHTTPHandle(id, launch, this._proxy));
      return;
    }
    throw new Error("not implemented");
  }
  $stopMcp(id) {
    if (this._sseEventSources.has(id)) {
      this._sseEventSources.deleteAndDispose(id);
      this._proxy.$onDidChangeState(id, {
        state: 0
        /* McpConnectionState.Kind.Stopped */
      });
    }
  }
  $sendMessage(id, message) {
    this._sseEventSources.get(id)?.send(message);
  }
  async $waitForInitialCollectionProviders() {
    await Promise.all(this._initialProviderPromises);
  }
  async $resolveMcpLaunch(collectionId, label) {
    const rec = this._unresolvedMcpServers.get(collectionId);
    if (!rec) {
      return;
    }
    const server = rec.servers.find((s) => s.label === label);
    if (!server) {
      return;
    }
    if (!rec.provider.resolveMcpServerDefinition) {
      return Convert.McpServerDefinition.from(server);
    }
    const resolved = await rec.provider.resolveMcpServerDefinition(server, CancellationToken.None);
    return resolved ? Convert.McpServerDefinition.from(resolved) : void 0;
  }
  /** {@link vscode.lm.registerMcpServerDefinitionProvider} */
  registerMcpConfigurationProvider(extension, id, provider) {
    const store = new DisposableStore();
    const metadata = extension.contributes?.modelContextServerCollections?.find((m) => m.id === id);
    if (!metadata) {
      throw new Error(`MCP configuration providers must be registered in the contributes.modelContextServerCollections array within your package.json, but "${id}" was not`);
    }
    const mcp = {
      id: extensionPrefixedIdentifier(extension.identifier, id),
      isTrustedByDefault: true,
      label: metadata?.label ?? extension.displayName ?? extension.name,
      scope: 1,
      canResolveLaunch: typeof provider.resolveMcpServerDefinition === "function",
      extensionId: extension.identifier.value
    };
    const update = /* @__PURE__ */ __name(async () => {
      const list = await provider.provideMcpServerDefinitions(CancellationToken.None);
      this._unresolvedMcpServers.set(mcp.id, { servers: list ?? [], provider });
      const servers = [];
      for (const item of list ?? []) {
        servers.push({
          id: ExtensionIdentifier.toKey(extension.identifier),
          label: item.label,
          cacheNonce: item.version,
          launch: Convert.McpServerDefinition.from(item)
        });
      }
      this._proxy.$upsertMcpCollection(mcp, servers);
    }, "update");
    store.add(toDisposable(() => {
      this._unresolvedMcpServers.delete(mcp.id);
      this._proxy.$deleteMcpCollection(mcp.id);
    }));
    if (provider.onDidChangeServerDefinitions) {
      store.add(provider.onDidChangeServerDefinitions(update));
    }
    if (provider.onDidChange) {
      store.add(provider.onDidChange(update));
    }
    const promise = new Promise((resolve) => {
      setTimeout(() => update().finally(() => {
        this._initialProviderPromises.delete(promise);
        resolve();
      }), 0);
    });
    this._initialProviderPromises.add(promise);
    return store;
  }
};
ExtHostMcpService = __decorate([
  __param(0, IExtHostRpcService)
], ExtHostMcpService);
var HttpMode;
(function(HttpMode2) {
  HttpMode2[HttpMode2["Unknown"] = 0] = "Unknown";
  HttpMode2[HttpMode2["Http"] = 1] = "Http";
  HttpMode2[HttpMode2["SSE"] = 2] = "SSE";
})(HttpMode || (HttpMode = {}));
class McpHTTPHandle extends Disposable {
  static {
    __name(this, "McpHTTPHandle");
  }
  constructor(_id, _launch, _proxy) {
    super();
    this._id = _id;
    this._launch = _launch;
    this._proxy = _proxy;
    this._requestSequencer = new Sequencer();
    this._postEndpoint = new DeferredPromise();
    this._mode = {
      value: 0
      /* HttpMode.Unknown */
    };
    this._cts = new CancellationTokenSource();
    this._abortCtrl = new AbortController();
    this._register(toDisposable(() => {
      this._abortCtrl.abort();
      this._cts.dispose(true);
    }));
    this._proxy.$onDidChangeState(this._id, {
      state: 2
      /* McpConnectionState.Kind.Running */
    });
  }
  async send(message) {
    try {
      await this._requestSequencer.queue(() => {
        if (this._mode.value === 2) {
          return this._sendLegacySSE(this._mode.endpoint, message);
        } else {
          return this._sendStreamableHttp(message, this._mode.value === 1 ? this._mode.sessionId : void 0);
        }
      });
    } catch (err) {
      const msg = `Error sending message to ${this._launch.uri}: ${String(err)}`;
      this._proxy.$onDidChangeState(this._id, { state: 3, message: msg });
    }
  }
  /**
   * Sends a streamable-HTTP request.
   * 1. Posts to the endpoint
   * 2. Updates internal state as needed. Falls back to SSE if appropriate.
   * 3. If the response body is empty, JSON, or a JSON stream, handle it appropriately.
   */
  async _sendStreamableHttp(message, sessionId) {
    const asBytes = new TextEncoder().encode(message);
    const headers = {
      ...Object.fromEntries(this._launch.headers),
      "Content-Type": "application/json",
      "Content-Length": String(asBytes.length),
      Accept: "text/event-stream, application/json"
    };
    if (sessionId) {
      headers["Mcp-Session-Id"] = sessionId;
    }
    const res = await fetch(this._launch.uri.toString(true), {
      method: "POST",
      signal: this._abortCtrl.signal,
      headers,
      body: asBytes
    });
    const wasUnknown = this._mode.value === 0;
    const nextSessionId = res.headers.get("Mcp-Session-Id");
    if (nextSessionId) {
      this._mode = { value: 1, sessionId: nextSessionId };
    }
    if (this._mode.value === 0 && res.status >= 400 && res.status < 500) {
      this._log(LogLevel.Info, `${res.status} status sending message to ${this._launch.uri}, will attempt to fall back to legacy SSE`);
      const endpoint = await this._attachSSE();
      if (endpoint) {
        this._mode = { value: 2, endpoint };
        await this._sendLegacySSE(endpoint, message);
      }
      return;
    }
    if (res.status >= 300) {
      const retryWithSessionId = this._mode.value === 1 && !!this._mode.sessionId;
      this._proxy.$onDidChangeState(this._id, {
        state: 3,
        message: `${res.status} status sending message to ${this._launch.uri}: ${await this._getErrText(res)}` + retryWithSessionId ? `; will retry with new session ID` : "",
        shouldRetry: retryWithSessionId
      });
      return;
    }
    if (this._mode.value === 0) {
      this._mode = { value: 1, sessionId: void 0 };
    }
    if (wasUnknown) {
      this._attachStreamableBackchannel();
    }
    this._handleSuccessfulStreamableHttp(res);
  }
  async _handleSuccessfulStreamableHttp(res) {
    if (res.status === 202) {
      return;
    }
    switch (res.headers.get("Content-Type")?.toLowerCase()) {
      case "text/event-stream": {
        const parser = new SSEParser((event) => {
          if (event.type === "message") {
            this._proxy.$onDidReceiveMessage(this._id, event.data);
          }
        });
        try {
          await this._doSSE(parser, res);
        } catch (err) {
          this._log(LogLevel.Warning, `Error reading SSE stream: ${String(err)}`);
        }
        break;
      }
      case "application/json":
        this._proxy.$onDidReceiveMessage(this._id, await res.text());
        break;
      default: {
        const responseBody = await res.text();
        if (isJSON(responseBody)) {
          this._proxy.$onDidReceiveMessage(this._id, responseBody);
        } else {
          this._log(LogLevel.Warning, `Unexpected ${res.status} response for request: ${responseBody}`);
        }
      }
    }
  }
  /**
   * Attaches the SSE backchannel that streamable HTTP servers can use
   * for async notifications. This is a "MAY" support, so if the server gives
   * us a 4xx code, we'll stop trying to connect..
   */
  async _attachStreamableBackchannel() {
    let lastEventId;
    for (let retry = 0; !this._store.isDisposed; retry++) {
      await timeout(Math.min(retry * 1e3, 3e4), this._cts.token);
      let res;
      try {
        const headers = {
          ...Object.fromEntries(this._launch.headers),
          "Accept": "text/event-stream"
        };
        if (this._mode.value === 1 && this._mode.sessionId !== void 0) {
          headers["Mcp-Session-Id"] = this._mode.sessionId;
        }
        if (lastEventId) {
          headers["Last-Event-ID"] = lastEventId;
        }
        res = await fetch(this._launch.uri.toString(true), {
          method: "GET",
          signal: this._abortCtrl.signal,
          headers
        });
      } catch (e) {
        this._log(LogLevel.Info, `Error connecting to ${this._launch.uri} for async notifications, will retry`);
        continue;
      }
      if (res.status >= 400) {
        this._log(LogLevel.Debug, `${res.status} status connecting to ${this._launch.uri} for async notifications; they will be disabled: ${await this._getErrText(res)}`);
        return;
      }
      retry = 0;
      const parser = new SSEParser((event) => {
        if (event.type === "message") {
          this._proxy.$onDidReceiveMessage(this._id, event.data);
        }
        if (event.id) {
          lastEventId = event.id;
        }
      });
      try {
        await this._doSSE(parser, res);
      } catch (e) {
        this._log(LogLevel.Info, `Error reading from async stream, we will reconnect: ${e}`);
      }
    }
  }
  /**
   * Starts a legacy SSE attachment, where the SSE response is the session lifetime.
   * Unlike `_attachStreamableBackchannel`, this fails the server if it disconnects.
   */
  async _attachSSE() {
    const postEndpoint = new DeferredPromise();
    let res;
    try {
      res = await fetch(this._launch.uri.toString(true), {
        method: "GET",
        signal: this._abortCtrl.signal,
        headers: {
          ...Object.fromEntries(this._launch.headers),
          "Accept": "text/event-stream"
        }
      });
      if (res.status >= 300) {
        this._proxy.$onDidChangeState(this._id, { state: 3, message: `${res.status} status connecting to ${this._launch.uri} as SSE: ${await this._getErrText(res)}` });
        return;
      }
    } catch (e) {
      this._proxy.$onDidChangeState(this._id, { state: 3, message: `Error connecting to ${this._launch.uri} as SSE: ${e}` });
      return;
    }
    const parser = new SSEParser((event) => {
      if (event.type === "message") {
        this._proxy.$onDidReceiveMessage(this._id, event.data);
      } else if (event.type === "endpoint") {
        postEndpoint.complete(new URL(event.data, this._launch.uri.toString(true)).toString());
      }
    });
    this._register(toDisposable(() => postEndpoint.cancel()));
    this._doSSE(parser, res).catch((err) => {
      this._proxy.$onDidChangeState(this._id, { state: 3, message: `Error reading SSE stream: ${String(err)}` });
    });
    return postEndpoint.p;
  }
  /**
   * Sends a legacy SSE message to the server. The response is always empty and
   * is otherwise received in {@link _attachSSE}'s loop.
   */
  async _sendLegacySSE(url, message) {
    const asBytes = new TextEncoder().encode(message);
    const res = await fetch(url, {
      method: "POST",
      signal: this._abortCtrl.signal,
      headers: {
        ...Object.fromEntries(this._launch.headers),
        "Content-Type": "application/json",
        "Content-Length": String(asBytes.length)
      },
      body: asBytes
    });
    if (res.status >= 300) {
      this._log(LogLevel.Warning, `${res.status} status sending message to ${this._postEndpoint}: ${await this._getErrText(res)}`);
    }
  }
  /** Generic handle to pipe a response into an SSE parser. */
  async _doSSE(parser, res) {
    if (!res.body) {
      return;
    }
    const reader = res.body.getReader();
    let chunk;
    do {
      try {
        chunk = await raceCancellationError(reader.read(), this._cts.token);
      } catch (err) {
        reader.cancel();
        if (this._store.isDisposed) {
          return;
        } else {
          throw err;
        }
      }
      if (chunk.value) {
        parser.feed(chunk.value);
      }
    } while (!chunk.done);
  }
  _log(level, message) {
    if (!this._store.isDisposed) {
      this._proxy.$onDidPublishLog(this._id, level, message);
    }
  }
  async _getErrText(res) {
    try {
      return await res.text();
    } catch {
      return res.statusText;
    }
  }
}
function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
__name(isJSON, "isJSON");
export {
  ExtHostMcpService,
  IExtHostMpcService
};
//# sourceMappingURL=extHostMcp.js.map
