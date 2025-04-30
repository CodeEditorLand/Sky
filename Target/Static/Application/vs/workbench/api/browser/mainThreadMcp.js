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
import { disposableTimeout } from "../../../base/common/async.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { observableValue } from "../../../base/common/observable.js";
import { LogLevel } from "../../../platform/log/common/log.js";
import { IMcpRegistry } from "../../contrib/mcp/common/mcpRegistryTypes.js";
import { McpConnectionState, McpServerDefinition, McpServerLaunch } from "../../contrib/mcp/common/mcpTypes.js";
import { extensionHostKindToString } from "../../services/extensions/common/extensionHostKind.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadMcp = class MainThreadMcp2 extends Disposable {
  static {
    __name(this, "MainThreadMcp");
  }
  constructor(_extHostContext, _mcpRegistry) {
    super();
    this._extHostContext = _extHostContext;
    this._mcpRegistry = _mcpRegistry;
    this._serverIdCounter = 0;
    this._servers = /* @__PURE__ */ new Map();
    this._collectionDefinitions = this._register(new DisposableMap());
    const proxy = this._proxy = _extHostContext.getProxy(ExtHostContext.ExtHostMcp);
    this._register(this._mcpRegistry.registerDelegate({
      // Prefer Node.js extension hosts when they're available. No CORS issues etc.
      priority: _extHostContext.extensionHostKind === 2 ? 0 : 1,
      waitForInitialProviderPromises() {
        return proxy.$waitForInitialCollectionProviders();
      },
      canStart(collection, serverDefinition) {
        if (collection.remoteAuthority !== _extHostContext.remoteAuthority) {
          return false;
        }
        if (serverDefinition.launch.type === 1 && _extHostContext.extensionHostKind === 2) {
          return false;
        }
        return true;
      },
      start: /* @__PURE__ */ __name((collection, _serverDefiniton, resolveLaunch) => {
        const id = ++this._serverIdCounter;
        const launch = new ExtHostMcpServerLaunch(_extHostContext.extensionHostKind, () => proxy.$stopMcp(id), (msg) => proxy.$sendMessage(id, JSON.stringify(msg)));
        this._servers.set(id, launch);
        proxy.$startMcp(id, resolveLaunch);
        return launch;
      }, "start")
    }));
  }
  $upsertMcpCollection(collection, serversDto) {
    const servers = serversDto.map(McpServerDefinition.fromSerialized);
    const existing = this._collectionDefinitions.get(collection.id);
    if (existing) {
      existing.servers.set(servers, void 0);
    } else {
      const serverDefinitions = observableValue("mcpServers", servers);
      const handle = this._mcpRegistry.registerCollection({
        ...collection,
        resolveServerLanch: collection.canResolveLaunch ? async (def) => {
          const r = await this._proxy.$resolveMcpLaunch(collection.id, def.label);
          return r ? McpServerLaunch.fromSerialized(r) : void 0;
        } : void 0,
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
MainThreadMcp = __decorate([
  extHostNamedCustomer(MainContext.MainThreadMcp),
  __param(1, IMcpRegistry)
], MainThreadMcp);
class ExtHostMcpServerLaunch extends Disposable {
  static {
    __name(this, "ExtHostMcpServerLaunch");
  }
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
      if (Array.isArray(parsed)) {
        parsed.forEach((p) => this._onDidReceiveMessage.fire(p));
      } else {
        this._onDidReceiveMessage.fire(parsed);
      }
    }
  }
  constructor(extHostKind, stop, send) {
    super();
    this.stop = stop;
    this.send = send;
    this.state = observableValue("mcpServerState", {
      state: 1
      /* McpConnectionState.Kind.Starting */
    });
    this._onDidLog = this._register(new Emitter());
    this.onDidLog = this._onDidLog.event;
    this._onDidReceiveMessage = this._register(new Emitter());
    this.onDidReceiveMessage = this._onDidReceiveMessage.event;
    this._register(disposableTimeout(() => {
      this.pushLog(LogLevel.Info, `Starting server from ${extensionHostKindToString(extHostKind)} extension host`);
    }));
  }
  extHostDispose() {
    if (McpConnectionState.isRunning(this.state.get())) {
      this.pushLog(LogLevel.Warning, "Extension host shut down, server will stop.");
      this.state.set({
        state: 0
        /* McpConnectionState.Kind.Stopped */
      }, void 0);
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
