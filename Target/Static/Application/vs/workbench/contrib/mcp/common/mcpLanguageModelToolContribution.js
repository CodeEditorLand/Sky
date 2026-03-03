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
import { decodeBase64, VSBuffer } from "../../../../base/common/buffer.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { equals } from "../../../../base/common/objects.js";
import { autorun } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { isDefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IImageResizeService } from "../../../../platform/imageResize/common/imageResizeService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { mcpAppsEnabledConfig } from "../../../../platform/mcp/common/mcpManagement.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ChatResponseResource, getAttachableImageExtension } from "../../chat/common/model/chatModel.js";
import { LanguageModelPartAudience } from "../../chat/common/languageModels.js";
import { ILanguageModelToolsService } from "../../chat/common/tools/languageModelToolsService.js";
import { IMcpRegistry } from "./mcpRegistryTypes.js";
import { IMcpService, McpResourceURI, McpToolResourceLinkMimeType } from "./mcpTypes.js";
import { mcpServerToSourceData } from "./mcpTypesUtils.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { McpServer } from "./mcpServer.js";
let McpLanguageModelToolContribution = class McpLanguageModelToolContribution2 extends Disposable {
  static {
    __name(this, "McpLanguageModelToolContribution");
  }
  static {
    this.ID = "workbench.contrib.mcp.languageModelTools";
  }
  constructor(_toolsService, mcpService, _instantiationService, _mcpRegistry, lifecycleService) {
    super();
    this._toolsService = _toolsService;
    this._instantiationService = _instantiationService;
    this._mcpRegistry = _mcpRegistry;
    this.lifecycleService = lifecycleService;
    const previous = this._register(new DisposableMap());
    this._register(autorun((reader) => {
      const servers = mcpService.servers.read(reader);
      const toDelete = new Set(previous.keys());
      for (const server of servers) {
        const previousRec = previous.get(server);
        if (previousRec) {
          toDelete.delete(server);
          if (!previousRec.source || equals(previousRec.source, mcpServerToSourceData(server, reader))) {
            continue;
          }
          previousRec.dispose();
        }
        const store = new DisposableStore();
        const rec = { dispose: /* @__PURE__ */ __name(() => store.dispose(), "dispose") };
        const toolSet = new Lazy(() => {
          const source = rec.source = mcpServerToSourceData(server);
          const referenceName = server.definition.label.toLowerCase().replace(/\s+/g, "-");
          const toolSet2 = store.add(this._toolsService.createToolSet(source, server.definition.id, referenceName, {
            icon: Codicon.mcp,
            description: localize("mcp.toolset", "{0}: All Tools", server.definition.label)
          }));
          return { toolSet: toolSet2, source };
        });
        this._syncTools(server, toolSet, store);
        previous.set(server, rec);
      }
      for (const key of toDelete) {
        previous.deleteAndDispose(key);
      }
    }));
  }
  _syncTools(server, collectionData, store) {
    const tools = /* @__PURE__ */ new Map();
    const collectionObservable = this._mcpRegistry.collections.map((collections) => collections.find((c) => c.id === server.collection.id));
    store.add(autorun((reader) => {
      const toDelete = new Set(tools.keys());
      const toRegister = [];
      const registerTool = /* @__PURE__ */ __name((tool, toolData, store2) => {
        store2.add(this._toolsService.registerTool(toolData, this._instantiationService.createInstance(McpToolImplementation, tool, server)));
        store2.add(collectionData.value.toolSet.addTool(toolData));
      }, "registerTool");
      if (this.lifecycleService.willShutdown) {
        return;
      }
      const collection = collectionObservable.read(reader);
      if (!collection) {
        tools.forEach((t) => t.store.dispose());
        tools.clear();
        return;
      }
      for (const tool of server.tools.read(reader)) {
        if (!(tool.visibility & 1)) {
          continue;
        }
        const existing = tools.get(tool.id);
        const icons = tool.icons.getUrl(22);
        const toolData = {
          id: tool.id,
          source: collectionData.value.source,
          icon: icons || Codicon.tools,
          // duplicative: https://github.com/modelcontextprotocol/modelcontextprotocol/pull/813
          displayName: tool.definition.annotations?.title || tool.definition.title || tool.definition.name,
          toolReferenceName: tool.referenceName,
          modelDescription: tool.definition.description ?? "",
          userDescription: tool.definition.description ?? "",
          inputSchema: tool.definition.inputSchema,
          canBeReferencedInPrompt: true,
          alwaysDisplayInputOutput: true,
          canRequestPreApproval: !tool.definition.annotations?.readOnlyHint,
          canRequestPostApproval: !!tool.definition.annotations?.openWorldHint,
          runsInWorkspace: collection?.scope === 1 || !!collection?.remoteAuthority,
          tags: ["mcp"]
        };
        if (existing) {
          if (!equals(existing.toolData, toolData)) {
            existing.toolData = toolData;
            existing.store.clear();
            registerTool(tool, toolData, existing.store);
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
      this._toolsService.flushToolUpdates();
    }));
    store.add(toDisposable(() => {
      for (const tool of tools.values()) {
        tool.store.dispose();
      }
    }));
  }
};
McpLanguageModelToolContribution = __decorate([
  __param(0, ILanguageModelToolsService),
  __param(1, IMcpService),
  __param(2, IInstantiationService),
  __param(3, IMcpRegistry),
  __param(4, ILifecycleService)
], McpLanguageModelToolContribution);
let McpToolImplementation = class McpToolImplementation2 {
  static {
    __name(this, "McpToolImplementation");
  }
  constructor(_tool, _server, _configurationService, _productService, _fileService, _imageResizeService) {
    this._tool = _tool;
    this._server = _server;
    this._configurationService = _configurationService;
    this._productService = _productService;
    this._fileService = _fileService;
    this._imageResizeService = _imageResizeService;
  }
  async prepareToolInvocation(context) {
    const tool = this._tool;
    const server = this._server;
    const sandboxEnabled = await McpServer.callOn(server, async (_handler, connection) => {
      return connection.definition.sandboxEnabled;
    });
    const isSandboxedServer = sandboxEnabled === true;
    const mcpToolWarning = localize("mcp.tool.warning", "Note that MCP servers or malicious conversation content may attempt to misuse '{0}' through tools.", this._productService.nameShort);
    const title = tool.definition.annotations?.title || tool.definition.title || "`" + tool.definition.name + "`";
    let confirm;
    if (!isSandboxedServer) {
      confirm = {};
      if (!tool.definition.annotations?.readOnlyHint) {
        confirm.title = new MarkdownString(localize("msg.title", "Run {0}", title));
        confirm.message = new MarkdownString(tool.definition.description, { supportThemeIcons: true });
        confirm.disclaimer = mcpToolWarning;
        confirm.allowAutoConfirm = true;
      }
      if (tool.definition.annotations?.openWorldHint) {
        confirm.confirmResults = true;
      }
    }
    const mcpUiEnabled = this._configurationService.getValue(mcpAppsEnabledConfig);
    return {
      confirmationMessages: confirm,
      invocationMessage: new MarkdownString(localize("msg.run", "Running {0}", title)),
      pastTenseMessage: new MarkdownString(localize("msg.ran", "Ran {0} ", title)),
      originMessage: localize("msg.subtitle", "{0} (MCP Server)", server.definition.label),
      toolSpecificData: {
        kind: "input",
        rawInput: context.parameters,
        mcpAppData: mcpUiEnabled && tool.uiResourceUri ? {
          resourceUri: tool.uiResourceUri,
          serverDefinitionId: server.definition.id,
          collectionId: server.collection.id
        } : void 0
      }
    };
  }
  async invoke(invocation, _countTokens, progress, token) {
    const result = {
      content: []
    };
    const callResult = await this._tool.callWithProgress(invocation.parameters, progress, { chatRequestId: invocation.chatRequestId, chatSessionResource: invocation.context?.sessionResource }, token);
    const details = {
      input: JSON.stringify(invocation.parameters, void 0, 2),
      output: [],
      isError: callResult.isError === true
    };
    for (const item of callResult.content) {
      const audience = item.annotations?.audience?.map((a) => {
        if (a === "assistant") {
          return LanguageModelPartAudience.Assistant;
        } else if (a === "user") {
          return LanguageModelPartAudience.User;
        } else {
          return void 0;
        }
      }).filter(isDefined);
      if (audience?.includes(LanguageModelPartAudience.User)) {
        if (item.type === "text") {
          progress.report({ message: item.text });
        }
      }
      const addAsInlineData = /* @__PURE__ */ __name(async (mimeType, value, uri) => {
        details.output.push({ type: "embed", mimeType, value, uri, audience });
        if (isForModel) {
          let finalData;
          try {
            const resized = await this._imageResizeService.resizeImage(decodeBase64(value).buffer, mimeType);
            finalData = VSBuffer.wrap(resized);
          } catch {
            finalData = decodeBase64(value);
          }
          result.content.push({ kind: "data", value: { mimeType, data: finalData }, audience });
        }
      }, "addAsInlineData");
      const addAsLinkedResource = /* @__PURE__ */ __name((uri, mimeType) => {
        const json = { uri, underlyingMimeType: mimeType };
        result.content.push({
          kind: "data",
          audience,
          value: {
            mimeType: McpToolResourceLinkMimeType,
            data: VSBuffer.fromString(JSON.stringify(json))
          }
        });
      }, "addAsLinkedResource");
      const isForModel = !audience || audience.includes(LanguageModelPartAudience.Assistant);
      if (item.type === "text") {
        details.output.push({ type: "embed", isText: true, value: item.text });
        if (isForModel && !callResult.structuredContent) {
          result.content.push({
            kind: "text",
            audience,
            value: item.text
          });
        }
      } else if (item.type === "image" || item.type === "audio") {
        await addAsInlineData(item.mimeType || "image/png", item.data);
      } else if (item.type === "resource_link") {
        const uri = McpResourceURI.fromServer(this._server.definition, item.uri);
        details.output.push({
          type: "ref",
          uri,
          audience,
          mimeType: item.mimeType
        });
        if (isForModel) {
          if (item.mimeType && getAttachableImageExtension(item.mimeType)) {
            result.content.push({
              kind: "data",
              audience,
              value: {
                mimeType: item.mimeType,
                data: await this._fileService.readFile(uri).then((f) => f.value).catch(() => VSBuffer.alloc(0))
              }
            });
          } else {
            addAsLinkedResource(uri, item.mimeType);
          }
        }
      } else if (item.type === "resource") {
        const uri = McpResourceURI.fromServer(this._server.definition, item.resource.uri);
        if (item.resource.mimeType && getAttachableImageExtension(item.resource.mimeType) && "blob" in item.resource) {
          await addAsInlineData(item.resource.mimeType, item.resource.blob, uri);
        } else {
          details.output.push({
            type: "embed",
            uri,
            isText: "text" in item.resource,
            mimeType: item.resource.mimeType,
            value: "blob" in item.resource ? item.resource.blob : item.resource.text,
            audience,
            asResource: true
          });
          if (isForModel) {
            const permalink = invocation.context && ChatResponseResource.createUri(invocation.context.sessionResource, invocation.callId, result.content.length, basename(uri));
            addAsLinkedResource(permalink || uri, item.resource.mimeType);
          }
        }
      }
    }
    if (callResult.structuredContent) {
      details.output.push({ type: "embed", isText: true, value: JSON.stringify(callResult.structuredContent, null, 2), audience: [LanguageModelPartAudience.Assistant] });
      result.content.push({ kind: "text", value: JSON.stringify(callResult.structuredContent), audience: [LanguageModelPartAudience.Assistant] });
    }
    if (this._tool.uiResourceUri) {
      details.mcpOutput = callResult;
    }
    result.toolResultDetails = details;
    return result;
  }
};
McpToolImplementation = __decorate([
  __param(2, IConfigurationService),
  __param(3, IProductService),
  __param(4, IFileService),
  __param(5, IImageResizeService)
], McpToolImplementation);
export {
  McpLanguageModelToolContribution
};
//# sourceMappingURL=mcpLanguageModelToolContribution.js.map
