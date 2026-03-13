var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { McpServer } from "./mcpServer.js";
import { startServerAndWaitForLiveTools } from "./mcpTypesUtils.js";
class McpGatewayToolBrokerChannel extends Disposable {
  static {
    __name(this, "McpGatewayToolBrokerChannel");
  }
  constructor(_mcpService, _logService, _startupGracePeriodMs = 5e3) {
    super();
    this._mcpService = _mcpService;
    this._logService = _logService;
    this._startupGracePeriodMs = _startupGracePeriodMs;
    this._onDidChangeTools = this._register(new Emitter());
    this._onDidChangeResources = this._register(new Emitter());
    this._serverIdMap = /* @__PURE__ */ new Map();
    this._nextServerIndex = 0;
    this._startupGrace = /* @__PURE__ */ new Map();
    this._logService.debug("[McpGateway][ToolBroker] Initialized");
    let toolsInitialized = false;
    this._register(autorun((reader) => {
      for (const server of this._mcpService.servers.read(reader)) {
        server.tools.read(reader);
      }
      if (toolsInitialized) {
        this._logService.debug("[McpGateway][ToolBroker] Tools changed, firing onDidChangeTools");
        this._onDidChangeTools.fire();
      } else {
        toolsInitialized = true;
      }
    }));
    let resourcesInitialized = false;
    this._register(autorun((reader) => {
      for (const server of this._mcpService.servers.read(reader)) {
        server.capabilities.read(reader);
      }
      if (resourcesInitialized) {
        this._logService.debug("[McpGateway][ToolBroker] Resources changed, firing onDidChangeResources");
        this._onDidChangeResources.fire();
      } else {
        resourcesInitialized = true;
      }
    }));
  }
  _getServerIndex(server) {
    const defId = server.definition.id;
    let index = this._serverIdMap.get(defId);
    if (index === void 0) {
      index = this._nextServerIndex++;
      this._serverIdMap.set(defId, index);
    }
    return index;
  }
  _getServerByIndex(serverIndex) {
    for (const server of this._mcpService.servers.get()) {
      if (this._getServerIndex(server) === serverIndex) {
        return server;
      }
    }
    return void 0;
  }
  _waitForStartup(server) {
    const id = server.definition.id;
    const existing = this._startupGrace.get(id);
    if (existing?.resolved) {
      const state = server.cacheState.get();
      if (state === 0 || state === 2) {
        this._startupGrace.delete(id);
      }
    }
    if (!this._startupGrace.has(id)) {
      const entry = {
        promise: Promise.race([
          this._ensureServerReady(server),
          new Promise((resolve) => setTimeout(() => resolve(false), this._startupGracePeriodMs))
        ]),
        resolved: false
      };
      entry.promise.then(() => {
        entry.resolved = true;
      });
      this._startupGrace.set(id, entry);
    }
    return this._startupGrace.get(id).promise;
  }
  async _shouldUseCachedData(server) {
    const cacheState = server.cacheState.get();
    if (cacheState === 0 || cacheState === 2) {
      await this._waitForStartup(server);
      const newState = server.cacheState.get();
      return newState === 5 || newState === 1 || newState === 4;
    }
    return cacheState === 5 || cacheState === 1 || cacheState === 4;
  }
  listen(_ctx, event) {
    switch (event) {
      case "onDidChangeTools":
        return this._onDidChangeTools.event;
      case "onDidChangeResources":
        return this._onDidChangeResources.event;
    }
    throw new Error(`Invalid listen: ${event}`);
  }
  async call(_ctx, command, arg, cancellationToken) {
    this._logService.debug(`[McpGateway][ToolBroker] IPC call: ${command}`);
    switch (command) {
      case "listTools": {
        const tools = await this._listTools();
        return tools;
      }
      case "callTool": {
        const { name, args } = arg;
        const result = await this._callTool(name, args || {}, cancellationToken);
        return result;
      }
      case "listResources": {
        const resources = await this._listResources();
        return resources;
      }
      case "readResource": {
        const { serverIndex, uri } = arg;
        const result = await this._readResource(serverIndex, uri, cancellationToken);
        return result;
      }
      case "listResourceTemplates": {
        const templates = await this._listResourceTemplates();
        return templates;
      }
    }
    throw new Error(`Invalid call: ${command}`);
  }
  async _listTools() {
    const servers = this._mcpService.servers.get();
    const perServer = await Promise.all(servers.map(async (server) => {
      if (!await this._shouldUseCachedData(server)) {
        this._logService.debug(`[McpGateway][ToolBroker] Server '${server.definition.id}' not ready, skipping tool listing`);
        return [];
      }
      return server.tools.get().filter(
        (t) => t.visibility & 1
        /* McpToolVisibility.Model */
      ).map((t) => t.definition);
    }));
    const mcpTools = perServer.flat();
    this._logService.debug(`[McpGateway][ToolBroker] listTools result: ${mcpTools.length} tool(s): [${mcpTools.map((t) => t.name).join(", ")}]`);
    return mcpTools;
  }
  async _callTool(name, args, token = CancellationToken.None) {
    this._logService.debug(`[McpGateway][ToolBroker] callTool '${name}' with args: ${JSON.stringify(args)}`);
    for (const server of this._mcpService.servers.get()) {
      const tool = server.tools.get().find((t) => t.definition.name === name && t.visibility & 1);
      if (tool) {
        this._logService.debug(`[McpGateway][ToolBroker] Found tool '${name}' on server '${server.definition.id}' (index=${this._getServerIndex(server)})`);
        const result = await tool.call(args, void 0, token);
        this._logService.debug(`[McpGateway][ToolBroker] Tool '${name}' completed (isError=${result.isError ?? false}, content blocks=${result.content.length})`);
        return { result, serverIndex: this._getServerIndex(server) };
      }
    }
    this._logService.warn(`[McpGateway][ToolBroker] Tool '${name}' not found on any server`);
    throw new Error(`Unknown tool: ${name}`);
  }
  async _listResources() {
    const results = [];
    const servers = this._mcpService.servers.get();
    this._logService.debug(`[McpGateway][ToolBroker] listResources: ${servers.length} server(s) known`);
    await Promise.all(servers.map(async (server) => {
      if (!await this._shouldUseCachedData(server)) {
        return;
      }
      const capabilities = server.capabilities.get();
      if (!capabilities || !(capabilities & 16)) {
        this._logService.debug(`[McpGateway][ToolBroker] Server '${server.definition.id}' has no resource capability, skipping`);
        return;
      }
      try {
        const resources = await McpServer.callOn(server, (h) => h.listResources());
        this._logService.debug(`[McpGateway][ToolBroker] Server '${server.definition.id}' (index=${this._getServerIndex(server)}) listed ${resources.length} resource(s)`);
        results.push({ serverIndex: this._getServerIndex(server), resources });
      } catch (error) {
        this._logService.warn(`[McpGateway][ToolBroker] Server '${server.definition.id}' failed to list resources`, error);
      }
    }));
    this._logService.debug(`[McpGateway][ToolBroker] listResources result: ${results.length} server(s) with resources`);
    return results;
  }
  async _readResource(serverIndex, uri, token = CancellationToken.None) {
    const server = this._getServerByIndex(serverIndex);
    if (!server) {
      this._logService.warn(`[McpGateway][ToolBroker] readResource: unknown server index ${serverIndex}`);
      throw new Error(`Unknown server index: ${serverIndex}`);
    }
    this._logService.debug(`[McpGateway][ToolBroker] readResource '${uri}' from server '${server.definition.id}' (index=${serverIndex})`);
    const result = await McpServer.callOn(server, (h) => h.readResource({ uri }, token), token);
    this._logService.debug(`[McpGateway][ToolBroker] readResource returned ${result.contents.length} content(s)`);
    return result;
  }
  async _listResourceTemplates() {
    const results = [];
    const servers = this._mcpService.servers.get();
    this._logService.debug(`[McpGateway][ToolBroker] listResourceTemplates: ${servers.length} server(s) known`);
    await Promise.all(servers.map(async (server) => {
      if (!await this._shouldUseCachedData(server)) {
        return;
      }
      const capabilities = server.capabilities.get();
      if (!capabilities || !(capabilities & 16)) {
        return;
      }
      try {
        const resourceTemplates = await McpServer.callOn(server, (h) => h.listResourceTemplates());
        this._logService.debug(`[McpGateway][ToolBroker] Server '${server.definition.id}' (index=${this._getServerIndex(server)}) listed ${resourceTemplates.length} resource template(s)`);
        results.push({ serverIndex: this._getServerIndex(server), resourceTemplates });
      } catch (error) {
        this._logService.warn(`[McpGateway][ToolBroker] Server '${server.definition.id}' failed to list resource templates`, error);
      }
    }));
    this._logService.debug(`[McpGateway][ToolBroker] listResourceTemplates result: ${results.length} server(s) with templates`);
    return results;
  }
  async _ensureServerReady(server) {
    const cacheState = server.cacheState.get();
    if (cacheState !== 0 && cacheState !== 2) {
      return true;
    }
    this._logService.debug(`[McpGateway][ToolBroker] Server '${server.definition.id}' not ready (cacheState=${cacheState}), starting...`);
    try {
      const ready = await startServerAndWaitForLiveTools(server, {
        promptType: "all-untrusted",
        errorOnUserInteraction: true
      });
      this._logService.debug(`[McpGateway][ToolBroker] Server '${server.definition.id}' ready=${ready}`);
      return ready;
    } catch (error) {
      this._logService.warn(`[McpGateway][ToolBroker] Server '${server.definition.id}' failed to start`, error);
      return false;
    }
  }
}
export {
  McpGatewayToolBrokerChannel
};
//# sourceMappingURL=mcpGatewayToolBrokerChannel.js.map
