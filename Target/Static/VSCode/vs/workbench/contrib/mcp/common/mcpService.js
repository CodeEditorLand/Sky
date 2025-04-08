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
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, IDisposable, IReference, toDisposable } from "../../../../base/common/lifecycle.js";
import { equals } from "../../../../base/common/objects.js";
import { autorun, IObservable, observableValue, transaction } from "../../../../base/common/observable.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { StorageScope } from "../../../../platform/storage/common/storage.js";
import { CountTokensCallback, ILanguageModelToolsService, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolResult } from "../../chat/common/languageModelToolsService.js";
import { IMcpRegistry } from "./mcpRegistryTypes.js";
import { McpServer, McpServerMetadataCache } from "./mcpServer.js";
import { IMcpServer, IMcpService, IMcpTool, McpCollectionDefinition, McpServerDefinition, McpServerToolsState } from "./mcpTypes.js";
let McpService = class extends Disposable {
  constructor(_instantiationService, _mcpRegistry, _toolsService, _logService) {
    super();
    this._instantiationService = _instantiationService;
    this._mcpRegistry = _mcpRegistry;
    this._toolsService = _toolsService;
    this._logService = _logService;
    this.userCache = this._register(_instantiationService.createInstance(McpServerMetadataCache, StorageScope.PROFILE));
    this.workspaceCache = this._register(_instantiationService.createInstance(McpServerMetadataCache, StorageScope.WORKSPACE));
    const updateThrottle = this._store.add(new RunOnceScheduler(() => this._updateCollectedServers(), 500));
    this._register(autorun((reader) => {
      for (const collection of this._mcpRegistry.collections.read(reader)) {
        collection.serverDefinitions.read(reader);
      }
      updateThrottle.schedule(500);
    }));
  }
  static {
    __name(this, "McpService");
  }
  _servers = observableValue(this, []);
  servers = this._servers.map((servers) => servers.map((s) => s.object));
  get lazyCollectionState() {
    return this._mcpRegistry.lazyCollectionState;
  }
  userCache;
  workspaceCache;
  resetCaches() {
    this.userCache.reset();
    this.workspaceCache.reset();
  }
  async activateCollections() {
    const collections = await this._mcpRegistry.discoverCollections();
    const collectionIds = new Set(collections.map((c) => c.id));
    this._updateCollectedServers();
    const todo = [];
    for (const { object: server } of this._servers.get()) {
      if (collectionIds.has(server.collection.id)) {
        const state = server.toolsState.get();
        if (state === McpServerToolsState.Unknown) {
          todo.push(server.start());
        }
      }
    }
    await Promise.all(todo);
  }
  _syncTools(server, store) {
    const tools = /* @__PURE__ */ new Map();
    store.add(autorun((reader) => {
      const toDelete = new Set(tools.keys());
      for (const tool of server.tools.read(reader)) {
        const existing = tools.get(tool.id);
        const collection = this._mcpRegistry.collections.get().find((c) => c.id === server.collection.id);
        const toolData = {
          id: tool.id,
          source: { type: "mcp", collectionId: server.collection.id, definitionId: server.definition.id },
          icon: Codicon.tools,
          displayName: tool.definition.name,
          toolReferenceName: tool.definition.name,
          modelDescription: tool.definition.description ?? "",
          userDescription: tool.definition.description ?? "",
          inputSchema: tool.definition.inputSchema,
          canBeReferencedInPrompt: true,
          supportsToolPicker: true,
          runsInWorkspace: collection?.scope === StorageScope.WORKSPACE || !!collection?.remoteAuthority,
          tags: ["mcp"]
        };
        if (existing) {
          if (!equals(existing.toolData, toolData)) {
            existing.toolData = toolData;
            existing.toolDispose.dispose();
            existing.toolDispose = this._toolsService.registerToolData(toolData);
          }
          toDelete.delete(tool.id);
        } else {
          tools.set(tool.id, {
            toolData,
            toolDispose: this._toolsService.registerToolData(toolData),
            implDispose: this._toolsService.registerToolImplementation(tool.id, this._instantiationService.createInstance(McpToolImplementation, tool, server))
          });
        }
      }
      for (const id of toDelete) {
        const tool = tools.get(id);
        if (tool) {
          tool.toolDispose.dispose();
          tool.implDispose.dispose();
          tools.delete(id);
        }
      }
    }));
    store.add(toDisposable(() => {
      for (const tool of tools.values()) {
        tool.toolDispose.dispose();
        tool.implDispose.dispose();
      }
    }));
  }
  _updateCollectedServers() {
    const definitions = this._mcpRegistry.collections.get().flatMap(
      (collectionDefinition) => collectionDefinition.serverDefinitions.get().map((serverDefinition) => ({
        serverDefinition,
        collectionDefinition
      }))
    );
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
      const match = definitions.find((d) => defsEqual(server.object, d));
      if (match) {
        pushMatch(match, server);
      } else {
        server.dispose();
      }
    }
    for (const def of nextDefinitions) {
      const store = new DisposableStore();
      const object = this._instantiationService.createInstance(
        McpServer,
        def.collectionDefinition,
        def.serverDefinition,
        def.serverDefinition.roots,
        !!def.collectionDefinition.lazy,
        def.collectionDefinition.scope === StorageScope.WORKSPACE ? this.workspaceCache : this.userCache
      );
      store.add(object);
      this._syncTools(object, store);
      nextServers.push({ object, dispose: /* @__PURE__ */ __name(() => store.dispose(), "dispose") });
    }
    transaction((tx) => {
      this._servers.set(nextServers, tx);
    });
  }
  dispose() {
    this._servers.get().forEach((s) => s.dispose());
    super.dispose();
  }
};
McpService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IMcpRegistry),
  __decorateParam(2, ILanguageModelToolsService),
  __decorateParam(3, ILogService)
], McpService);
function defsEqual(server, def) {
  return server.collection.id === def.collectionDefinition.id && server.definition.id === def.serverDefinition.id;
}
__name(defsEqual, "defsEqual");
let McpToolImplementation = class {
  constructor(_tool, _server, _productService) {
    this._tool = _tool;
    this._server = _server;
    this._productService = _productService;
  }
  static {
    __name(this, "McpToolImplementation");
  }
  async prepareToolInvocation(parameters) {
    const tool = this._tool;
    const server = this._server;
    const mcpToolWarning = localize(
      "mcp.tool.warning",
      "{0} This tool is from '{1}' (MCP Server). Note that MCP servers or malicious conversation content may attempt to misuse '{2}' through tools. Please carefully review any requested actions.",
      "$(info)",
      server.definition.label,
      this._productService.nameShort
    );
    return {
      confirmationMessages: {
        title: localize("msg.title", "Run `{0}`", tool.definition.name, server.definition.label),
        message: new MarkdownString(localize("msg.msg", "{0}\n\n {1}", tool.definition.description, mcpToolWarning), { supportThemeIcons: true }),
        allowAutoConfirm: true
      },
      invocationMessage: new MarkdownString(localize("msg.run", "Running `{0}`", tool.definition.name, server.definition.label)),
      pastTenseMessage: new MarkdownString(localize("msg.ran", "Ran `{0}` ", tool.definition.name, server.definition.label)),
      toolSpecificData: {
        kind: "input",
        rawInput: parameters
      }
    };
  }
  async invoke(invocation, _countTokens, token) {
    const result = {
      content: []
    };
    const outputParts = [];
    const callResult = await this._tool.call(invocation.parameters, token);
    for (const item of callResult.content) {
      if (item.type === "text") {
        result.content.push({
          kind: "text",
          value: item.text
        });
        outputParts.push(item.text);
      } else {
      }
    }
    result.toolResultDetails = {
      input: JSON.stringify(invocation.parameters, void 0, 2),
      output: outputParts.join("\n")
    };
    return result;
  }
};
McpToolImplementation = __decorateClass([
  __decorateParam(2, IProductService)
], McpToolImplementation);
export {
  McpService
};
//# sourceMappingURL=mcpService.js.map
