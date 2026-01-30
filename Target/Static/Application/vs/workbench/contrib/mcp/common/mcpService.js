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
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, observableValue, transaction } from "../../../../base/common/observable.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { mcpAutoStartConfig } from "../../../../platform/mcp/common/mcpManagement.js";
import { IMcpRegistry } from "./mcpRegistryTypes.js";
import { McpServer, McpServerMetadataCache } from "./mcpServer.js";
import { IAutostartResult, McpServerDefinition, McpStartServerInteraction, UserInteractionRequiredError } from "./mcpTypes.js";
import { startServerAndWaitForLiveTools } from "./mcpTypesUtils.js";
let McpService = class McpService2 extends Disposable {
  static {
    __name(this, "McpService");
  }
  get lazyCollectionState() {
    return this._mcpRegistry.lazyCollectionState;
  }
  constructor(_instantiationService, _mcpRegistry, _logService, configurationService) {
    super();
    this._instantiationService = _instantiationService;
    this._mcpRegistry = _mcpRegistry;
    this._logService = _logService;
    this.configurationService = configurationService;
    this._currentAutoStarts = /* @__PURE__ */ new Set();
    this._servers = observableValue(this, []);
    this.servers = this._servers.map((servers) => servers.map((s) => s.object));
    this.userCache = this._register(_instantiationService.createInstance(
      McpServerMetadataCache,
      0
      /* StorageScope.PROFILE */
    ));
    this.workspaceCache = this._register(_instantiationService.createInstance(
      McpServerMetadataCache,
      1
      /* StorageScope.WORKSPACE */
    ));
    const updateThrottle = this._store.add(new RunOnceScheduler(() => this.updateCollectedServers(), 500));
    this._register(autorun((reader) => {
      for (const collection of this._mcpRegistry.collections.read(reader)) {
        collection.serverDefinitions.read(reader);
      }
      updateThrottle.schedule(500);
    }));
  }
  cancelAutostart() {
    for (const cts of this._currentAutoStarts) {
      cts.cancel();
    }
  }
  autostart(_token) {
    const autoStartConfig = this.configurationService.getValue(mcpAutoStartConfig);
    if (autoStartConfig === "never") {
      return observableValue(this, IAutostartResult.Empty);
    }
    const state = observableValue(this, { working: true, starting: [], serversRequiringInteraction: [] });
    const store = new DisposableStore();
    const cts = store.add(new CancellationTokenSource(_token));
    this._currentAutoStarts.add(cts);
    store.add(toDisposable(() => {
      this._currentAutoStarts.delete(cts);
    }));
    store.add(cts.token.onCancellationRequested(() => {
      state.set(IAutostartResult.Empty, void 0);
    }));
    this._autostart(autoStartConfig, state, cts.token).catch((err) => {
      this._logService.error("Error during MCP autostart:", err);
      state.set(IAutostartResult.Empty, void 0);
    }).finally(() => store.dispose());
    return state;
  }
  async _autostart(autoStartConfig, state, token) {
    await this._activateCollections();
    if (token.isCancellationRequested) {
      return;
    }
    const candidates = this.servers.get().filter(
      (s) => s.connectionState.get().state !== 3
      /* McpConnectionState.Kind.Error */
    );
    let todo = /* @__PURE__ */ new Set();
    if (autoStartConfig === "onlyNew") {
      todo = new Set(candidates.filter(
        (s) => s.cacheState.get() === 0
        /* McpServerCacheState.Unknown */
      ));
    } else if (autoStartConfig === "newAndOutdated") {
      todo = new Set(candidates.filter((s) => {
        const c = s.cacheState.get();
        return c === 0 || c === 2;
      }));
    }
    if (!todo.size) {
      state.set(IAutostartResult.Empty, void 0);
      return;
    }
    const interaction = new McpStartServerInteraction();
    const requiringInteraction = [];
    const update = /* @__PURE__ */ __name(() => state.set({
      working: todo.size > 0,
      starting: [...todo].map((t) => t.definition),
      serversRequiringInteraction: requiringInteraction
    }, void 0), "update");
    update();
    await Promise.all([...todo].map(async (server, i) => {
      try {
        await startServerAndWaitForLiveTools(server, { interaction, errorOnUserInteraction: true }, token);
      } catch (error) {
        if (error instanceof UserInteractionRequiredError) {
          requiringInteraction.push({ id: server.definition.id, label: server.definition.label, errorMessage: error.message });
        }
      } finally {
        todo.delete(server);
        if (!token.isCancellationRequested) {
          update();
        }
      }
    }));
  }
  resetCaches() {
    this.userCache.reset();
    this.workspaceCache.reset();
  }
  resetTrust() {
    this.resetCaches();
  }
  async activateCollections() {
    await this._activateCollections();
  }
  async _activateCollections() {
    const collections = await this._mcpRegistry.discoverCollections();
    this.updateCollectedServers();
    return new Set(collections.map((c) => c.id));
  }
  updateCollectedServers() {
    const prefixGenerator = new McpPrefixGenerator();
    const definitions = this._mcpRegistry.collections.get().flatMap((collectionDefinition) => collectionDefinition.serverDefinitions.get().map((serverDefinition) => {
      const toolPrefix = prefixGenerator.generate(serverDefinition.label);
      return { serverDefinition, collectionDefinition, toolPrefix };
    }));
    const nextDefinitions = new Set(definitions);
    const currentServers = this._servers.get();
    const nextServers = [];
    const pushMatch = /* @__PURE__ */ __name((match, rec) => {
      nextDefinitions.delete(match);
      nextServers.push(rec);
      const connection = rec.object.connection.get();
      if (connection && !McpServerDefinition.equals(connection.definition, match.serverDefinition)) {
        rec.object.stop();
        this._logService.debug(`MCP server ${rec.object.definition.id} stopped because the definition changed`);
      }
    }, "pushMatch");
    for (const server of currentServers) {
      const match = definitions.find((d) => defsEqual(server.object, d) && server.toolPrefix === d.toolPrefix);
      if (match) {
        pushMatch(match, server);
      } else {
        server.object.dispose();
      }
    }
    for (const def of nextDefinitions) {
      const object = this._instantiationService.createInstance(McpServer, def.collectionDefinition, def.serverDefinition, def.serverDefinition.roots, !!def.collectionDefinition.lazy, def.collectionDefinition.scope === 1 ? this.workspaceCache : this.userCache, def.toolPrefix);
      nextServers.push({ object, toolPrefix: def.toolPrefix });
    }
    transaction((tx) => {
      this._servers.set(nextServers, tx);
    });
  }
  dispose() {
    this._servers.get().forEach((s) => s.object.dispose());
    super.dispose();
  }
};
McpService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IMcpRegistry),
  __param(2, ILogService),
  __param(3, IConfigurationService)
], McpService);
function defsEqual(server, def) {
  return server.collection.id === def.collectionDefinition.id && server.definition.id === def.serverDefinition.id;
}
__name(defsEqual, "defsEqual");
class McpPrefixGenerator {
  static {
    __name(this, "McpPrefixGenerator");
  }
  constructor() {
    this.seenPrefixes = /* @__PURE__ */ new Set();
  }
  generate(label) {
    const baseToolPrefix = "mcp_" + label.toLowerCase().replace(/[^a-z0-9_.-]+/g, "_").slice(0, 18 - "mcp_".length - 1);
    let toolPrefix = baseToolPrefix + "_";
    for (let i = 2; this.seenPrefixes.has(toolPrefix); i++) {
      toolPrefix = baseToolPrefix + i + "_";
    }
    this.seenPrefixes.add(toolPrefix);
    return toolPrefix;
  }
}
export {
  McpService
};
//# sourceMappingURL=mcpService.js.map
