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
import { disposableTimeout } from "../../../base/common/async.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { ISettableObservable, observableValue } from "../../../base/common/observable.js";
import { LogLevel } from "../../../platform/log/common/log.js";
import { IMcpMessageTransport, IMcpRegistry } from "../../contrib/mcp/common/mcpRegistryTypes.js";
import { McpCollectionDefinition, McpConnectionState, McpServerDefinition, McpServerTransportType } from "../../contrib/mcp/common/mcpTypes.js";
import { MCP } from "../../contrib/mcp/common/modelContextProtocol.js";
import { ExtensionHostKind, extensionHostKindToString } from "../../services/extensions/common/extensionHostKind.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext, MainThreadMcpShape } from "../common/extHost.protocol.js";
let MainThreadMcp = class extends Disposable {
  constructor(_extHostContext, _mcpRegistry) {
    super();
    this._extHostContext = _extHostContext;
    this._mcpRegistry = _mcpRegistry;
    const proxy = _extHostContext.getProxy(ExtHostContext.ExtHostMcp);
    this._register(this._mcpRegistry.registerDelegate({
      // Prefer Node.js extension hosts when they're available. No CORS issues etc.
      priority: _extHostContext.extensionHostKind === ExtensionHostKind.LocalWebWorker ? 0 : 1,
      waitForInitialProviderPromises() {
        return proxy.$waitForInitialCollectionProviders();
      },
      canStart(collection, serverDefinition) {
        if (collection.remoteAuthority !== _extHostContext.remoteAuthority) {
          return false;
        }
        if (serverDefinition.launch.type === McpServerTransportType.Stdio && _extHostContext.extensionHostKind === ExtensionHostKind.LocalWebWorker) {
          return false;
        }
        return true;
      },
      start: /* @__PURE__ */ __name((collection, _serverDefiniton, resolveLaunch) => {
        const id = ++this._serverIdCounter;
        const launch = new ExtHostMcpServerLaunch(
          _extHostContext.extensionHostKind,
          () => proxy.$stopMcp(id),
          (msg) => proxy.$sendMessage(id, JSON.stringify(msg))
        );
        this._servers.set(id, launch);
        proxy.$startMcp(id, resolveLaunch);
        return launch;
      }, "start")
    }));
  }
  _serverIdCounter = 0;
  _servers = /* @__PURE__ */ new Map();
  _collectionDefinitions = this._register(new DisposableMap());
  $upsertMcpCollection(collection, serversDto) {
    const servers = serversDto.map(McpServerDefinition.fromSerialized);
    const existing = this._collectionDefinitions.get(collection.id);
    if (existing) {
      existing.servers.set(servers, void 0);
    } else {
      const serverDefinitions = observableValue("mcpServers", servers);
      const handle = this._mcpRegistry.registerCollection({
        ...collection,
        remoteAuthority: this._extHostContext.remoteAuthority,
        serverDefinitions
      });
      this._collectionDefinitions.set(collection.id, {
        fromExtHost: collection,
        servers: serverDefinitions,
        dispose: /* @__PURE__ */ __name(() => handle.dispose(), "dispose")
      });
    }
  }
  $deleteMcpCollection(collectionId) {
    this._collectionDefinitions.deleteAndDispose(collectionId);
  }
  $onDidChangeState(id, update) {
    const server = this._servers.get(id);
    if (!server) {
      return;
    }
    server.state.set(update, void 0);
    if (!McpConnectionState.isRunning(update)) {
      server.dispose();
      this._servers.delete(id);
    }
  }
  $onDidPublishLog(id, level, log) {
    if (typeof level === "string") {
      level = LogLevel.Info;
      log = level;
    }
    this._servers.get(id)?.pushLog(level, log);
  }
  $onDidReceiveMessage(id, message) {
    this._servers.get(id)?.pushMessage(message);
  }
  dispose() {
    for (const server of this._servers.values()) {
      server.extHostDispose();
    }
    this._servers.clear();
    super.dispose();
  }
};
__name(MainThreadMcp, "MainThreadMcp");
MainThreadMcp = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadMcp),
  __decorateParam(1, IMcpRegistry)
], MainThreadMcp);
class ExtHostMcpServerLaunch extends Disposable {
  constructor(extHostKind, stop, send) {
    super();
    this.stop = stop;
    this.send = send;
    this._register(disposableTimeout(() => {
      this.pushLog(LogLevel.Info, `Starting server from ${extensionHostKindToString(extHostKind)} extension host`);
    }));
  }
  static {
    __name(this, "ExtHostMcpServerLaunch");
  }
  state = observableValue("mcpServerState", { state: McpConnectionState.Kind.Starting });
  _onDidLog = this._register(new Emitter());
  onDidLog = this._onDidLog.event;
  _onDidReceiveMessage = this._register(new Emitter());
  onDidReceiveMessage = this._onDidReceiveMessage.event;
  pushLog(level, message) {
    this._onDidLog.fire({ message, level });
  }
  pushMessage(message) {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch (e) {
      this.pushLog(LogLevel.Warning, `Failed to parse message: ${JSON.stringify(message)}`);
    }
    if (parsed) {
      this._onDidReceiveMessage.fire(parsed);
    }
  }
  extHostDispose() {
    if (McpConnectionState.isRunning(this.state.get())) {
      this.pushLog(LogLevel.Warning, "Extension host shut down, server will stop.");
      this.state.set({ state: McpConnectionState.Kind.Stopped }, void 0);
    }
    this.dispose();
  }
  dispose() {
    if (McpConnectionState.isRunning(this.state.get())) {
      this.stop();
    }
    super.dispose();
  }
}
export {
  MainThreadMcp
};
//# sourceMappingURL=mainThreadMcp.js.map
