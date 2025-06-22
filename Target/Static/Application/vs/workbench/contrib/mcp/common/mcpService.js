var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { decodeBase64 } from "../../../../base/common/buffer.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { markdownCommandLink, MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { equals } from "../../../../base/common/objects.js";
import { autorun, observableValue, transaction } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ChatResponseResource, getAttachableImageExtension } from "../../chat/common/chatModel.js";
import { ILanguageModelToolsService } from "../../chat/common/languageModelToolsService.js";
import { IMcpRegistry } from "./mcpRegistryTypes.js";
import { McpServer, McpServerMetadataCache } from "./mcpServer.js";
import { McpResourceURI, McpServerDefinition } from "./mcpTypes.js";
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
let McpService = class McpService2 extends Disposable {
  static {
    __name(this, "McpService");
  }
  get lazyCollectionState() {
    return this._mcpRegistry.lazyCollectionState;
  }
  constructor(_instantiationService, _mcpRegistry, _toolsService, _logService) {
    super();
    this._instantiationService = _instantiationService;
    this._mcpRegistry = _mcpRegistry;
    this._toolsService = _toolsService;
    this._logService = _logService;
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
  resetCaches() {
    this.userCache.reset();
    this.workspaceCache.reset();
  }
  async activateCollections() {
    const collections = await this._mcpRegistry.discoverCollections();
    const collectionIds = new Set(collections.map((c) => c.id));
    this.updateCollectedServers();
    const todo = [];
    for (const { object: server } of this._servers.get()) {
      if (collectionIds.has(server.collection.id)) {
        const state = server.cacheState.get();
        if (state === 0) {
          todo.push(server.start());
        }
      }
    }
    await Promise.all(todo);
  }
  _syncTools(server, toolSet, source, store) {
    const tools = /* @__PURE__ */ new Map();
    store.add(autorun((reader) => {
      const toDelete = new Set(tools.keys());
      const toRegister = [];
      const registerTool = /* @__PURE__ */ __name((tool, toolData, store2) => {
        store2.add(this._toolsService.registerToolData(toolData));
        store2.add(this._toolsService.registerToolImplementation(tool.id, this._instantiationService.createInstance(McpToolImplementation, tool, server)));
        store2.add(toolSet.addTool(toolData));
      }, "registerTool");
      for (const tool of server.tools.read(reader)) {
        const existing = tools.get(tool.id);
        const collection = this._mcpRegistry.collections.get().find((c) => c.id === server.collection.id);
        const toolData = {
          id: tool.id,
          source,
          icon: Codicon.tools,
          displayName: tool.definition.annotations?.title || tool.definition.name,
          toolReferenceName: tool.referenceName,
          modelDescription: tool.definition.description ?? "",
          userDescription: tool.definition.description ?? "",
          inputSchema: tool.definition.inputSchema,
          canBeReferencedInPrompt: true,
          alwaysDisplayInputOutput: true,
          runsInWorkspace: collection?.scope === 1 || !!collection?.remoteAuthority,
          tags: ["mcp"]
        };
        if (existing) {
          if (!equals(existing.toolData, toolData)) {
            existing.toolData = toolData;
            existing.store.clear();
            registerTool(tool, toolData, store);
          }
          toDelete.delete(tool.id);
        } else {
          const store2 = new DisposableStore();
          toRegister.push(() => registerTool(tool, toolData, store2));
          tools.set(tool.id, { toolData, store: store2 });
        }
      }
      for (const id of toDelete) {
        const tool = tools.get(id);
        if (tool) {
          tool.store.dispose();
          tools.delete(id);
        }
      }
      for (const fn of toRegister) {
        fn();
      }
    }));
    store.add(toDisposable(() => {
      for (const tool of tools.values()) {
        tool.store.dispose();
      }
    }));
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
        server.dispose();
      }
    }
    for (const def of nextDefinitions) {
      const store = new DisposableStore();
      const object = this._instantiationService.createInstance(McpServer, def.collectionDefinition, def.serverDefinition, def.serverDefinition.roots, !!def.collectionDefinition.lazy, def.collectionDefinition.scope === 1 ? this.workspaceCache : this.userCache, def.toolPrefix);
      const source = { type: "mcp", label: object.definition.label, collectionId: object.collection.id, definitionId: object.definition.id };
      const toolSet = this._toolsService.createToolSet(source, def.serverDefinition.id, def.serverDefinition.label, {
        icon: Codicon.mcp,
        description: localize("mcp.toolset", "{0}: All Tools", def.serverDefinition.label)
      });
      store.add(toolSet);
      store.add(object);
      this._syncTools(object, toolSet, source, store);
      nextServers.push({ object, dispose: /* @__PURE__ */ __name(() => store.dispose(), "dispose"), toolPrefix: def.toolPrefix });
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
McpService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IMcpRegistry),
  __param(2, ILanguageModelToolsService),
  __param(3, ILogService)
], McpService);
function defsEqual(server, def) {
  return server.collection.id === def.collectionDefinition.id && server.definition.id === def.serverDefinition.id;
}
__name(defsEqual, "defsEqual");
let McpToolImplementation = class McpToolImplementation2 {
  static {
    __name(this, "McpToolImplementation");
  }
  constructor(_tool, _server, _productService) {
    this._tool = _tool;
    this._server = _server;
    this._productService = _productService;
  }
  async prepareToolInvocation(parameters) {
    const tool = this._tool;
    const server = this._server;
    const mcpToolWarning = localize("mcp.tool.warning", "Note that MCP servers or malicious conversation content may attempt to misuse '{0}' through tools.", this._productService.nameShort);
    const needsConfirmation = !tool.definition.annotations?.readOnlyHint;
    const title = tool.definition.annotations?.title || "`" + tool.definition.name + "`";
    const subtitle = localize("msg.subtitle", "{0} (MCP Server)", server.definition.label);
    return {
      confirmationMessages: needsConfirmation ? {
        title: new MarkdownString(localize("msg.title", "Run {0}", title)),
        message: new MarkdownString(tool.definition.description, { supportThemeIcons: true }),
        disclaimer: mcpToolWarning,
        allowAutoConfirm: true
      } : void 0,
      invocationMessage: new MarkdownString(localize("msg.run", "Running {0}", title)),
      pastTenseMessage: new MarkdownString(localize("msg.ran", "Ran {0} ", title)),
      originMessage: new MarkdownString(markdownCommandLink({
        id: "workbench.mcp.showConfiguration",
        title: subtitle,
        arguments: [server.collection.id, server.definition.id]
      }), { isTrusted: true }),
      toolSpecificData: {
        kind: "input",
        rawInput: parameters
      }
    };
  }
  async invoke(invocation, _countTokens, progress, token) {
    const result = {
      content: []
    };
    const callResult = await this._tool.callWithProgress(invocation.parameters, progress, { chatRequestId: invocation.chatRequestId, chatSessionId: invocation.context?.sessionId }, token);
    const details = {
      input: JSON.stringify(invocation.parameters, void 0, 2),
      output: [],
      isError: callResult.isError === true
    };
    for (const item of callResult.content) {
      const audience = item.annotations?.audience || ["assistant"];
      if (audience.includes("user")) {
        if (item.type === "text") {
          progress.report({ message: item.text });
        }
      }
      const addAsInlineData = /* @__PURE__ */ __name((mimeType, value, uri) => {
        details.output.push({ mimeType, value, uri });
        if (isForModel) {
          result.content.push({
            kind: "data",
            value: { mimeType, data: decodeBase64(value) }
          });
        }
      }, "addAsInlineData");
      const isForModel = audience.includes("assistant");
      if (item.type === "text") {
        details.output.push({ isText: true, value: item.text });
        if (isForModel) {
          result.content.push({
            kind: "text",
            value: item.text
          });
        }
      } else if (item.type === "image" || item.type === "audio") {
        addAsInlineData(item.mimeType || "image/png", item.data);
      } else if (item.type === "resource") {
        const uri = McpResourceURI.fromServer(this._server.definition, item.resource.uri);
        if (item.resource.mimeType && getAttachableImageExtension(item.resource.mimeType) && "blob" in item.resource) {
          addAsInlineData(item.resource.mimeType, item.resource.blob, uri);
        } else {
          details.output.push({
            uri,
            isText: "text" in item.resource,
            mimeType: item.resource.mimeType,
            value: "blob" in item.resource ? item.resource.blob : item.resource.text,
            asResource: true
          });
          if (isForModel) {
            const permalink = invocation.chatRequestId && invocation.context && ChatResponseResource.createUri(invocation.context.sessionId, invocation.chatRequestId, invocation.callId, result.content.length, basename(uri));
            result.content.push({
              kind: "text",
              value: "text" in item.resource ? item.resource.text : `The tool returns a resource which can be read from the URI ${permalink || uri}`
            });
          }
        }
      }
    }
    result.toolResultDetails = details;
    return result;
  }
};
McpToolImplementation = __decorate([
  __param(2, IProductService)
], McpToolImplementation);
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
