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
  constructor(_mcpService) {
    super();
    this._mcpService = _mcpService;
    this._onDidChangeTools = this._register(new Emitter());
    this._onDidChangeResources = this._register(new Emitter());
    this._serverIdMap = /* @__PURE__ */ new Map();
    this._nextServerIndex = 0;
    let toolsInitialized = false;
    this._register(autorun((reader) => {
      for (const server of this._mcpService.servers.read(reader)) {
        server.tools.read(reader);
      }
      if (toolsInitialized) {
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
    const mcpTools = [];
    const servers = this._mcpService.servers.get();
    await Promise.all(servers.map((server) => this._ensureServerReady(server)));
    for (const server of servers) {
      const cacheState = server.cacheState.get();
      if (cacheState !== 5 && cacheState !== 1 && cacheState !== 4) {
        continue;
      }
      for (const tool of server.tools.get()) {
        if (!(tool.visibility & 1)) {
          continue;
        }
        mcpTools.push(tool.definition);
      }
    }
    return mcpTools;
  }
  async _callTool(name, args, token = CancellationToken.None) {
    for (const server of this._mcpService.servers.get()) {
      const tool = server.tools.get().find((t) => t.definition.name === name && t.visibility & 1);
      if (tool) {
        const result = await tool.call(args, void 0, token);
        return { result, serverIndex: this._getServerIndex(server) };
      }
    }
    throw new Error(`Unknown tool: ${name}`);
  }
  async _listResources() {
    const results = [];
    const servers = this._mcpService.servers.get();
    await Promise.all(servers.map(async (server) => {
      await this._ensureServerReady(server);
      const capabilities = server.capabilities.get();
      if (!capabilities || !(capabilities & 16)) {
        return;
      }
      try {
        const resources = await McpServer.callOn(server, (h) => h.listResources());
        results.push({ serverIndex: this._getServerIndex(server), resources });
      } catch {
      }
    }));
    return results;
  }
  async _readResource(serverIndex, uri, token = CancellationToken.None) {
    const server = this._getServerByIndex(serverIndex);
    if (!server) {
      throw new Error(`Unknown server index: ${serverIndex}`);
    }
    return McpServer.callOn(server, (h) => h.readResource({ uri }, token), token);
  }
  async _listResourceTemplates() {
    const results = [];
    const servers = this._mcpService.servers.get();
    await Promise.all(servers.map(async (server) => {
      await this._ensureServerReady(server);
      const capabilities = server.capabilities.get();
      if (!capabilities || !(capabilities & 16)) {
        return;
      }
      try {
        const resourceTemplates = await McpServer.callOn(server, (h) => h.listResourceTemplates());
        results.push({ serverIndex: this._getServerIndex(server), resourceTemplates });
      } catch {
      }
    }));
    return results;
  }
  async _ensureServerReady(server) {
    const cacheState = server.cacheState.get();
    if (cacheState !== 0 && cacheState !== 2) {
      return true;
    }
    try {
      return await startServerAndWaitForLiveTools(server, {
        promptType: "all-untrusted",
        errorOnUserInteraction: true
      });
    } catch {
      return false;
    }
  }
}
export {
  McpGatewayToolBrokerChannel
};
//# sourceMappingURL=mcpGatewayToolBrokerChannel.js.map
