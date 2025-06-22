var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise, raceCancellationError, Sequencer, timeout } from "../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { SSEParser } from "../../../base/common/sseParser.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { canLog, ILogService, LogLevel } from "../../../platform/log/common/log.js";
import { extensionPrefixedIdentifier, McpServerLaunch } from "../../contrib/mcp/common/mcpTypes.js";
import { MainContext } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import * as Convert from "./extHostTypeConverters.js";
import { AUTH_SERVER_METADATA_DISCOVERY_PATH, getDefaultMetadataForUrl, getMetadataWithDefaultValues, getResourceServerBaseUrlFromDiscoveryUrl, isAuthorizationProtectedResourceMetadata, isAuthorizationServerMetadata, parseWWWAuthenticateHeader } from "../../../base/common/oauth.js";
import { URI } from "../../../base/common/uri.js";
import { MCP } from "../../contrib/mcp/common/modelContextProtocol.js";
import { CancellationError } from "../../../base/common/errors.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
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
const IExtHostMpcService = createDecorator("IExtHostMpcService");
let ExtHostMcpService = class ExtHostMcpService2 extends Disposable {
  static {
    __name(this, "ExtHostMcpService");
  }
  constructor(extHostRpc, _logService, _extHostInitData) {
    super();
    this._logService = _logService;
    this._extHostInitData = _extHostInitData;
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
      this._sseEventSources.set(id, new McpHTTPHandle(id, launch, this._proxy, this._logService));
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
    const metadata = extension.contributes?.mcpServerDefinitionProviders?.find((m) => m.id === id);
    if (!metadata) {
      throw new Error(`MCP configuration providers must be registered in the contributes.mcpServerDefinitionProviders array within your package.json, but "${id}" was not`);
    }
    const mcp = {
      id: extensionPrefixedIdentifier(extension.identifier, id),
      isTrustedByDefault: true,
      label: metadata?.label ?? extension.displayName ?? extension.name,
      scope: 1,
      canResolveLaunch: typeof provider.resolveMcpServerDefinition === "function",
      extensionId: extension.identifier.value,
      configTarget: this._extHostInitData.remote.isRemote ? 4 : 2
    };
    const update = /* @__PURE__ */ __name(async () => {
      const list = await provider.provideMcpServerDefinitions(CancellationToken.None);
      this._unresolvedMcpServers.set(mcp.id, { servers: list ?? [], provider });
      const servers = [];
      for (const item of list ?? []) {
        let id2 = ExtensionIdentifier.toKey(extension.identifier) + "/" + item.label;
        if (servers.some((s) => s.id === id2)) {
          let i = 2;
          while (servers.some((s) => s.id === id2 + i)) {
            i++;
          }
          id2 = id2 + i;
        }
        servers.push({
          id: id2,
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
    if (provider.onDidChangeMcpServerDefinitions) {
      store.add(provider.onDidChangeMcpServerDefinitions(update));
    }
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
  __param(0, IExtHostRpcService),
  __param(1, ILogService),
  __param(2, IExtHostInitDataService)
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
  constructor(_id, _launch, _proxy, _logService) {
    super();
    this._id = _id;
    this._launch = _launch;
    this._proxy = _proxy;
    this._logService = _logService;
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
    await this._addAuthHeader(headers);
    const res = await this._fetchWithAuthRetry(this._launch.uri.toString(true), {
      method: "POST",
      headers,
      body: asBytes
    }, headers);
    const wasUnknown = this._mode.value === 0;
    const nextSessionId = res.headers.get("Mcp-Session-Id");
    if (nextSessionId) {
      this._mode = { value: 1, sessionId: nextSessionId };
    }
    if (this._mode.value === 0 && // We care about 4xx errors...
    res.status >= 400 && res.status < 500 && res.status !== 401 && res.status !== 403) {
      this._log(LogLevel.Info, `${res.status} status sending message to ${this._launch.uri}, will attempt to fall back to legacy SSE`);
      this._sseFallbackWithMessage(message);
      return;
    }
    if (res.status >= 300) {
      const retryWithSessionId = this._mode.value === 1 && !!this._mode.sessionId && (res.status === 400 || res.status === 404);
      this._proxy.$onDidChangeState(this._id, {
        state: 3,
        message: `${res.status} status sending message to ${this._launch.uri}: ${await this._getErrText(res)}` + (retryWithSessionId ? `; will retry with new session ID` : ""),
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
    this._handleSuccessfulStreamableHttp(res, message);
  }
  async _sseFallbackWithMessage(message) {
    const endpoint = await this._attachSSE();
    if (endpoint) {
      this._mode = { value: 2, endpoint };
      await this._sendLegacySSE(endpoint, message);
    }
  }
  async _populateAuthMetadata(originalResponse) {
    let resourceMetadataChallenge;
    if (originalResponse.headers.has("WWW-Authenticate")) {
      const authHeader = originalResponse.headers.get("WWW-Authenticate");
      const { scheme, params } = parseWWWAuthenticateHeader(authHeader);
      if (scheme === "Bearer" && params["resource_metadata"]) {
        resourceMetadataChallenge = params["resource_metadata"];
      }
    }
    let serverMetadataUrl;
    let scopesSupported;
    let resource;
    if (resourceMetadataChallenge) {
      const resourceMetadata = await this._getResourceMetadata(resourceMetadataChallenge);
      serverMetadataUrl = resourceMetadata.authorization_servers?.[0];
      scopesSupported = resourceMetadata.scopes_supported;
      resource = resourceMetadata;
    }
    const baseUrl = new URL(originalResponse.url).origin;
    let addtionalHeaders = {};
    if (!serverMetadataUrl) {
      serverMetadataUrl = baseUrl;
      addtionalHeaders = {
        ...Object.fromEntries(this._launch.headers)
      };
    }
    try {
      const serverMetadataResponse = await this._getAuthorizationServerMetadata(serverMetadataUrl, addtionalHeaders);
      const serverMetadataWithDefaults = getMetadataWithDefaultValues(serverMetadataResponse);
      this._authMetadata = {
        authorizationServer: URI.parse(serverMetadataUrl),
        serverMetadata: serverMetadataWithDefaults,
        resourceMetadata: resource
      };
      return;
    } catch (e) {
      this._log(LogLevel.Warning, `Error populating auth metadata: ${String(e)}`);
    }
    const defaultMetadata = getDefaultMetadataForUrl(new URL(baseUrl));
    defaultMetadata.scopes_supported = scopesSupported ?? defaultMetadata.scopes_supported ?? [];
    this._authMetadata = {
      authorizationServer: URI.parse(serverMetadataUrl),
      serverMetadata: defaultMetadata,
      resourceMetadata: resource
    };
  }
  async _getResourceMetadata(resourceMetadata) {
    const resourceMetadataUrl = new URL(resourceMetadata);
    const mcpServerUrl = new URL(this._launch.uri.toString(true));
    let additionalHeaders = {};
    if (resourceMetadataUrl.origin === mcpServerUrl.origin) {
      additionalHeaders = {
        ...Object.fromEntries(this._launch.headers)
      };
    }
    const resourceMetadataResponse = await this._fetch(resourceMetadata, {
      method: "GET",
      headers: {
        ...additionalHeaders,
        "Accept": "application/json",
        "MCP-Protocol-Version": MCP.LATEST_PROTOCOL_VERSION
      }
    });
    if (resourceMetadataResponse.status !== 200) {
      throw new Error(`Failed to fetch resource metadata: ${resourceMetadataResponse.status} ${await this._getErrText(resourceMetadataResponse)}`);
    }
    const body = await resourceMetadataResponse.json();
    if (isAuthorizationProtectedResourceMetadata(body)) {
      const resolvedResource = getResourceServerBaseUrlFromDiscoveryUrl(resourceMetadata);
      if (body.resource !== resolvedResource) {
        throw new Error(`Protected Resource Metadata resource "${body.resource}" does not match MCP server resolved resource "${resolvedResource}". The MCP server must follow OAuth spec https://datatracker.ietf.org/doc/html/rfc9728#PRConfigurationValidation`);
      }
      return body;
    } else {
      throw new Error(`Invalid resource metadata: ${JSON.stringify(body)}`);
    }
  }
  async _getAuthorizationServerMetadata(authorizationServer, addtionalHeaders) {
    const authorizationServerUrl = new URL(authorizationServer);
    const extraPath = authorizationServerUrl.pathname === "/" ? "" : authorizationServerUrl.pathname;
    const pathToFetch = new URL(AUTH_SERVER_METADATA_DISCOVERY_PATH, authorizationServer).toString() + extraPath;
    let authServerMetadataResponse = await this._fetch(pathToFetch, {
      method: "GET",
      headers: {
        ...addtionalHeaders,
        "Accept": "application/json",
        "MCP-Protocol-Version": MCP.LATEST_PROTOCOL_VERSION
      }
    });
    if (authServerMetadataResponse.status !== 200) {
      authServerMetadataResponse = await this._fetch(URI.joinPath(URI.parse(authorizationServer), ".well-known", "openid-configuration").toString(true), {
        method: "GET",
        headers: {
          ...addtionalHeaders,
          "Accept": "application/json",
          "MCP-Protocol-Version": MCP.LATEST_PROTOCOL_VERSION
        }
      });
      if (authServerMetadataResponse.status !== 200) {
        throw new Error(`Failed to fetch authorization server metadata: ${authServerMetadataResponse.status} ${await this._getErrText(authServerMetadataResponse)}`);
      }
    }
    const body = await authServerMetadataResponse.json();
    if (isAuthorizationServerMetadata(body)) {
      return body;
    }
    throw new Error(`Invalid authorization server metadata: ${JSON.stringify(body)}`);
  }
  async _handleSuccessfulStreamableHttp(res, message) {
    if (res.status === 202) {
      return;
    }
    switch (res.headers.get("Content-Type")?.toLowerCase()) {
      case "text/event-stream": {
        const parser = new SSEParser((event) => {
          if (event.type === "message") {
            this._proxy.$onDidReceiveMessage(this._id, event.data);
          } else if (event.type === "endpoint") {
            this._log(LogLevel.Warning, `Received SSE endpoint from a POST to ${this._launch.uri}, will fall back to legacy SSE`);
            this._sseFallbackWithMessage(message);
            throw new CancellationError();
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
        await this._addAuthHeader(headers);
        if (this._mode.value === 1 && this._mode.sessionId !== void 0) {
          headers["Mcp-Session-Id"] = this._mode.sessionId;
        }
        if (lastEventId) {
          headers["Last-Event-ID"] = lastEventId;
        }
        res = await this._fetchWithAuthRetry(this._launch.uri.toString(true), {
          method: "GET",
          headers
        }, headers);
      } catch (e) {
        this._log(LogLevel.Info, `Error connecting to ${this._launch.uri} for async notifications, will retry`);
        continue;
      }
      if (res.status >= 400) {
        this._log(LogLevel.Debug, `${res.status} status connecting to ${this._launch.uri} for async notifications; they will be disabled: ${await this._getErrText(res)}`);
        return;
      }
      if (res.headers.get("content-type")?.toLowerCase().includes("text/event-stream")) {
        retry = 0;
      }
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
    const headers = {
      ...Object.fromEntries(this._launch.headers),
      "Accept": "text/event-stream"
    };
    await this._addAuthHeader(headers);
    let res;
    try {
      res = await this._fetchWithAuthRetry(this._launch.uri.toString(true), {
        method: "GET",
        headers
      }, headers);
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
    const headers = {
      ...Object.fromEntries(this._launch.headers),
      "Content-Type": "application/json",
      "Content-Length": String(asBytes.length)
    };
    await this._addAuthHeader(headers);
    const res = await this._fetch(url, {
      method: "POST",
      headers,
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
  async _addAuthHeader(headers) {
    if (this._authMetadata) {
      try {
        const token = await this._proxy.$getTokenFromServerMetadata(this._id, this._authMetadata.authorizationServer, this._authMetadata.serverMetadata, this._authMetadata.resourceMetadata);
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        this._log(LogLevel.Warning, `Error getting token from server metadata: ${String(e)}`);
      }
    }
    return headers;
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
  /**
   * Helper method to perform fetch with 401 authentication retry logic.
   * If the initial request returns 401 and we don't have auth metadata,
   * it will populate the auth metadata and retry once.
   */
  async _fetchWithAuthRetry(url, init, headers) {
    const doFetch = /* @__PURE__ */ __name(() => this._fetch(url, init), "doFetch");
    let res = await doFetch();
    if (res.status === 401) {
      if (!this._authMetadata) {
        await this._populateAuthMetadata(res);
        await this._addAuthHeader(headers);
        if (headers["Authorization"]) {
          init.headers = headers;
          res = await doFetch();
        }
      }
    }
    return res;
  }
  async _fetch(url, init) {
    if (canLog(this._logService.getLevel(), LogLevel.Trace)) {
      const traceObj = { ...init, headers: { ...init.headers } };
      if (traceObj.body) {
        traceObj.body = new TextDecoder().decode(traceObj.body);
      }
      if (traceObj.headers?.Authorization) {
        traceObj.headers.Authorization = "***";
      }
      this._log(LogLevel.Trace, `Fetching ${url} with options: ${JSON.stringify(traceObj)}`);
    }
    const res = await fetch(url, {
      ...init,
      signal: this._abortCtrl.signal
    });
    if (canLog(this._logService.getLevel(), LogLevel.Trace)) {
      const headers = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });
      this._log(LogLevel.Trace, `Fetched ${url}: ${JSON.stringify({
        status: res.status,
        headers
      })}`);
    }
    return res;
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
