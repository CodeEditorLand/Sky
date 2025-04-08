var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as vscode from "vscode";
import { importAMDNodeModule } from "../../../amdX.js";
import { DeferredPromise, Sequencer } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Lazy } from "../../../base/common/lazy.js";
import { Disposable, DisposableMap, DisposableStore, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { StorageScope } from "../../../platform/storage/common/storage.js";
import { extensionPrefixedIdentifier, McpCollectionDefinition, McpConnectionState, McpServerDefinition, McpServerLaunch, McpServerTransportSSE, McpServerTransportType } from "../../contrib/mcp/common/mcpTypes.js";
import { ExtHostMcpShape, MainContext, MainThreadMcpShape } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { LogLevel } from "../../../platform/log/common/log.js";
const IExtHostMpcService = createDecorator("IExtHostMpcService");
let ExtHostMcpService = class extends Disposable {
  static {
    __name(this, "ExtHostMcpService");
  }
  _proxy;
  _initialProviderPromises = /* @__PURE__ */ new Set();
  _sseEventSources = this._register(new DisposableMap());
  _eventSource = new Lazy(async () => {
    const es = await importAMDNodeModule("@c4312/eventsource-umd", "dist/index.umd.js");
    return es.EventSource;
  });
  constructor(extHostRpc) {
    super();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadMcp);
  }
  $startMcp(id, launch) {
    this._startMcp(id, McpServerLaunch.fromSerialized(launch));
  }
  _startMcp(id, launch) {
    if (launch.type === McpServerTransportType.SSE) {
      this._sseEventSources.set(id, new McpSSEHandle(this._eventSource.value, id, launch, this._proxy));
      return;
    }
    throw new Error("not implemented");
  }
  $stopMcp(id) {
    if (this._sseEventSources.has(id)) {
      this._sseEventSources.deleteAndDispose(id);
      this._proxy.$onDidChangeState(id, { state: McpConnectionState.Kind.Stopped });
    }
  }
  $sendMessage(id, message) {
    this._sseEventSources.get(id)?.send(message);
  }
  async $waitForInitialCollectionProviders() {
    await Promise.all(this._initialProviderPromises);
  }
  /** {@link vscode.lm.registerMcpConfigurationProvider} */
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
      scope: StorageScope.WORKSPACE
    };
    const update = /* @__PURE__ */ __name(async () => {
      const list = await provider.provideMcpServerDefinitions(CancellationToken.None);
      function isSSEConfig(candidate) {
        return !!candidate.uri;
      }
      __name(isSSEConfig, "isSSEConfig");
      const servers = [];
      for (const item of list ?? []) {
        servers.push({
          id: ExtensionIdentifier.toKey(extension.identifier),
          label: item.label,
          launch: isSSEConfig(item) ? {
            type: McpServerTransportType.SSE,
            uri: item.uri,
            headers: item.headers
          } : {
            type: McpServerTransportType.Stdio,
            cwd: item.cwd,
            args: item.args,
            command: item.command,
            env: item.env,
            envFile: void 0
          }
        });
      }
      this._proxy.$upsertMcpCollection(mcp, servers);
    }, "update");
    store.add(toDisposable(() => {
      this._proxy.$deleteMcpCollection(mcp.id);
    }));
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
ExtHostMcpService = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostMcpService);
class McpSSEHandle extends Disposable {
  constructor(eventSourceCtor, _id, launch, _proxy) {
    super();
    this._id = _id;
    this._proxy = _proxy;
    eventSourceCtor.then((EventSourceCtor) => this._attach(EventSourceCtor, launch));
  }
  static {
    __name(this, "McpSSEHandle");
  }
  _requestSequencer = new Sequencer();
  _postEndpoint = new DeferredPromise();
  _attach(EventSourceCtor, launch) {
    if (this._store.isDisposed) {
      return;
    }
    const eventSource = new EventSourceCtor(launch.uri.toString(), {
      // recommended way to do things https://github.com/EventSource/eventsource?tab=readme-ov-file#setting-http-request-headers
      fetch: /* @__PURE__ */ __name((input, init) => fetch(input, {
        ...init,
        headers: {
          ...Object.fromEntries(launch.headers),
          ...init?.headers
        }
      }).then(async (res) => {
        if (res.status >= 300) {
          this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Error, message: `${res.status} status connecting to ${launch.uri}: ${await this._getErrText(res)}` });
          eventSource.close();
        }
        return res;
      }, (err) => {
        this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Error, message: `Error connecting to ${launch.uri}: ${String(err)}` });
        eventSource.close();
        return Promise.reject(err);
      }), "fetch")
    });
    this._register(toDisposable(() => eventSource.close()));
    eventSource.addEventListener("endpoint", (e) => {
      this._postEndpoint.complete(new URL(e.data, launch.uri.toString()).toString());
    });
    eventSource.addEventListener("message", (e) => {
      this._proxy.$onDidReceiveMessage(this._id, e.data);
    });
    eventSource.addEventListener("open", () => {
      this._proxy.$onDidChangeState(this._id, { state: McpConnectionState.Kind.Running });
    });
    eventSource.addEventListener("error", (err) => {
      this._postEndpoint.cancel();
      this._proxy.$onDidChangeState(this._id, {
        state: McpConnectionState.Kind.Error,
        message: `Error connecting to ${launch.uri}: ${err.code || 0} ${err.message || JSON.stringify(err)}`
      });
      eventSource.close();
    });
  }
  async send(message) {
    try {
      const res = await this._requestSequencer.queue(async () => {
        const endpoint = await this._postEndpoint.p;
        const asBytes = new TextEncoder().encode(message);
        return fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": String(asBytes.length)
          },
          body: asBytes
        });
      });
      if (res.status >= 300) {
        this._proxy.$onDidPublishLog(this._id, LogLevel.Warning, `${res.status} status sending message to ${this._postEndpoint}: ${await this._getErrText(res)}`);
      }
    } catch (err) {
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
export {
  ExtHostMcpService,
  IExtHostMpcService
};
//# sourceMappingURL=extHostMcp.js.map
