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
import { raceCancellationError, Sequencer } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import * as json from "../../../../base/common/json.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../base/common/map.js";
import { autorun, autorunWithStore, derived, disposableObservableValue, observableFromEvent, ObservablePromise, observableValue, transaction } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IOutputService } from "../../../services/output/common/output.js";
import { mcpActivationEvent } from "./mcpConfiguration.js";
import { IMcpRegistry } from "./mcpRegistryTypes.js";
import { extensionMcpCollectionPrefix, McpConnectionFailedError, McpConnectionState } from "./mcpTypes.js";
const toolInvalidCharRe = /[^a-z0-9_-]/gi;
let McpServerMetadataCache = class McpServerMetadataCache2 extends Disposable {
  static {
    __name(this, "McpServerMetadataCache");
  }
  constructor(scope, storageService) {
    super();
    this.didChange = false;
    this.cache = new LRUCache(128);
    this.extensionServers = /* @__PURE__ */ new Map();
    const storageKey = "mcpToolCache";
    this._register(storageService.onWillSaveState(() => {
      if (this.didChange) {
        storageService.store(
          storageKey,
          {
            extensionServers: [...this.extensionServers],
            serverTools: this.cache.toJSON()
          },
          scope,
          1
          /* StorageTarget.MACHINE */
        );
        this.didChange = false;
      }
    }));
    try {
      const cached = storageService.getObject(storageKey, scope);
      this.extensionServers = new Map(cached?.extensionServers ?? []);
      cached?.serverTools?.forEach(([k, v]) => this.cache.set(k, v));
    } catch {
    }
  }
  /** Resets the cache for tools and extension servers */
  reset() {
    this.cache.clear();
    this.extensionServers.clear();
    this.didChange = true;
  }
  /** Gets cached tools for a server (used before a server is running) */
  getTools(definitionId) {
    return this.cache.get(definitionId);
  }
  /** Sets cached tools for a server */
  storeTools(definitionId, nonce, tools) {
    this.cache.set(definitionId, { ...this.cache.get(definitionId), nonce, tools });
    this.didChange = true;
  }
  /** Gets cached servers for a collection (used for extensions, before the extension activates) */
  getServers(collectionId) {
    return this.extensionServers.get(collectionId);
  }
  /** Sets cached servers for a collection */
  storeServers(collectionId, entry) {
    if (entry) {
      this.extensionServers.set(collectionId, entry);
    } else {
      this.extensionServers.delete(collectionId);
    }
    this.didChange = true;
  }
};
McpServerMetadataCache = __decorate([
  __param(1, IStorageService)
], McpServerMetadataCache);
let McpServer = class McpServer2 extends Disposable {
  static {
    __name(this, "McpServer");
  }
  get toolsFromCache() {
    return this._toolCache.getTools(this.definition.id);
  }
  get trusted() {
    return this._mcpRegistry.getTrust(this.collection);
  }
  constructor(collection, definition, explicitRoots, _requiresExtensionActivation, _toolCache, _mcpRegistry, workspacesService, _extensionService, _loggerService, _outputService, _telemetryService, _commandService, _instantiationService, _notificationService, _openerService) {
    super();
    this.collection = collection;
    this.definition = definition;
    this._requiresExtensionActivation = _requiresExtensionActivation;
    this._toolCache = _toolCache;
    this._mcpRegistry = _mcpRegistry;
    this._extensionService = _extensionService;
    this._loggerService = _loggerService;
    this._outputService = _outputService;
    this._telemetryService = _telemetryService;
    this._commandService = _commandService;
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this._openerService = _openerService;
    this._connectionSequencer = new Sequencer();
    this._connection = this._register(disposableObservableValue(this, void 0));
    this.connection = this._connection;
    this.connectionState = derived((reader) => this._connection.read(reader)?.state.read(reader) ?? {
      state: 0
      /* McpConnectionState.Kind.Stopped */
    });
    this.toolsFromServerPromise = observableValue(this, void 0);
    this.toolsFromServer = derived((reader) => this.toolsFromServerPromise.read(reader)?.promiseResult.read(reader)?.data);
    this.toolsState = derived((reader) => {
      const currentNonce = /* @__PURE__ */ __name(() => this._mcpRegistry.collections.read(reader).find((c) => c.id === this.collection.id)?.serverDefinitions.read(reader).find((d) => d.id === this.definition.id)?.cacheNonce, "currentNonce");
      const stateWhenServingFromCache = /* @__PURE__ */ __name(() => {
        if (!this.toolsFromCache) {
          return 0;
        }
        return currentNonce() === this.toolsFromCache.nonce ? 1 : 2;
      }, "stateWhenServingFromCache");
      const fromServer = this.toolsFromServerPromise.read(reader);
      const connectionState = this.connectionState.read(reader);
      const isIdle = McpConnectionState.canBeStarted(connectionState.state) && !fromServer;
      if (isIdle) {
        return stateWhenServingFromCache();
      }
      const fromServerResult = fromServer?.promiseResult.read(reader);
      if (!fromServerResult) {
        return this.toolsFromCache ? 4 : 3;
      }
      if (fromServerResult.error) {
        return stateWhenServingFromCache();
      }
      return fromServerResult.data?.nonce === currentNonce() ? 5 : 2;
    });
    this._loggerId = `mcpServer.${definition.id}`;
    this._logger = this._register(_loggerService.createLogger(this._loggerId, { hidden: true, name: `MCP: ${definition.label}` }));
    this._register(toDisposable(() => _loggerService.deregisterLogger(this._loggerId)));
    const workspaces = explicitRoots ? observableValue(this, explicitRoots.map((uri) => ({ uri, name: basename(uri) }))) : observableFromEvent(this, workspacesService.onDidChangeWorkspaceFolders, () => workspacesService.getWorkspace().folders);
    this._register(autorunWithStore((reader) => {
      const cnx = this._connection.read(reader)?.handler.read(reader);
      if (!cnx) {
        return;
      }
      cnx.roots = workspaces.read(reader).map((wf) => ({
        uri: wf.uri.toString(),
        name: wf.name
      }));
    }));
    this._register(autorunWithStore((reader, store) => {
      const cnx = this._connection.read(reader);
      const handler = cnx?.handler.read(reader);
      if (handler) {
        this.populateLiveData(handler, cnx?.definition.cacheNonce, store);
      } else {
        this.resetLiveData();
      }
    }));
    const toolPrefix = this._mcpRegistry.collectionToolPrefix(this.collection);
    this.tools = derived((reader) => {
      const serverTools = this.toolsFromServer.read(reader);
      const definitions = serverTools?.tools ?? this.toolsFromCache?.tools ?? [];
      const prefix = toolPrefix.read(reader);
      return definitions.map((def) => new McpTool(this, prefix, def)).sort((a, b) => a.compare(b));
    });
  }
  showOutput() {
    this._loggerService.setVisibility(this._loggerId, true);
    this._outputService.showChannel(this._loggerId);
  }
  start(isFromInteraction) {
    return this._connectionSequencer.queue(async () => {
      const activationEvent = mcpActivationEvent(this.collection.id.slice(extensionMcpCollectionPrefix.length));
      if (this._requiresExtensionActivation && !this._extensionService.activationEventIsDone(activationEvent)) {
        await this._extensionService.activateByEvent(activationEvent);
        await Promise.all(this._mcpRegistry.delegates.map((r) => r.waitForInitialProviderPromises()));
        if (this._store.isDisposed) {
          return {
            state: 0
            /* McpConnectionState.Kind.Stopped */
          };
        }
      }
      let connection = this._connection.get();
      if (connection && McpConnectionState.canBeStarted(connection.state.get().state)) {
        connection.dispose();
        connection = void 0;
        this._connection.set(connection, void 0);
      }
      if (!connection) {
        connection = await this._mcpRegistry.resolveConnection({
          logger: this._logger,
          collectionRef: this.collection,
          definitionRef: this.definition,
          forceTrust: isFromInteraction
        });
        if (!connection) {
          return {
            state: 0
            /* McpConnectionState.Kind.Stopped */
          };
        }
        if (this._store.isDisposed) {
          connection.dispose();
          return {
            state: 0
            /* McpConnectionState.Kind.Stopped */
          };
        }
        this._connection.set(connection, void 0);
      }
      const start = Date.now();
      const state = await connection.start();
      this._telemetryService.publicLog2("mcp/serverBootState", {
        state: McpConnectionState.toKindString(state.state),
        time: Date.now() - start
      });
      if (state.state === 3 && isFromInteraction) {
        this.showInteractiveError(connection, state);
      }
      return state;
    });
  }
  showInteractiveError(cnx, error) {
    if (error.code === "ENOENT" && cnx.launchDefinition.type === 1) {
      let docsLink;
      switch (cnx.launchDefinition.command) {
        case "uvx":
          docsLink = `https://aka.ms/vscode-mcp-install/uvx`;
          break;
        case "npx":
          docsLink = `https://aka.ms/vscode-mcp-install/npx`;
          break;
      }
      const options = [{
        label: localize("mcp.command.showOutput", "Show Output"),
        run: /* @__PURE__ */ __name(() => this.showOutput(), "run")
      }];
      if (docsLink) {
        options.push({
          label: localize("mcpServerInstall", "Install {0}", cnx.launchDefinition.command),
          run: /* @__PURE__ */ __name(() => this._openerService.open(URI.parse(docsLink)), "run")
        });
      }
      this._notificationService.prompt(Severity.Error, localize("mcpServerNotFound", 'The command "{0}" needed to run {1} was not found.', cnx.launchDefinition.command, cnx.definition.label), options);
    } else {
      this._notificationService.warn(localize("mcpServerError", "The MCP server {0} could not be started: {1}", cnx.definition.label, error.message));
    }
  }
  stop() {
    return this._connection.get()?.stop() || Promise.resolve();
  }
  resetLiveData() {
    transaction((tx) => {
      this.toolsFromServerPromise.set(void 0, tx);
    });
  }
  async _normalizeTool(originalTool) {
    const tool = { ...originalTool, serverToolName: originalTool.name };
    if (!tool.description) {
      this._logger.warn(`Tool ${tool.name} does not have a description. Tools must be accurately described to be called`);
      tool.description = "<empty>";
    }
    if (toolInvalidCharRe.test(tool.name)) {
      this._logger.warn(`Tool ${JSON.stringify(tool.name)} is invalid. Tools names may only contain [a-z0-9_-]`);
      tool.name = tool.name.replace(toolInvalidCharRe, "_");
    }
    let diagnostics = [];
    const toolJson = JSON.stringify(tool.inputSchema);
    try {
      const schemaUri = URI.parse("https://json-schema.org/draft-07/schema");
      diagnostics = await this._commandService.executeCommand("json.validate", schemaUri, toolJson) || [];
    } catch (e) {
    }
    if (!diagnostics.length) {
      return tool;
    }
    const tree = json.parseTree(toolJson);
    const messages = diagnostics.map((d) => {
      const node = json.findNodeAtOffset(tree, d.range[0].character);
      const path = node && `/${json.getNodePath(node).join("/")}`;
      return d.message + (path ? ` (at ${path})` : "");
    });
    return { error: messages };
  }
  async _getValidatedTools(handler, tools) {
    let error = "";
    const validations = await Promise.all(tools.map((t) => this._normalizeTool(t)));
    const validated = [];
    for (const [i, result] of validations.entries()) {
      if ("error" in result) {
        error += localize("mcpBadSchema.tool", "Tool `{0}` has invalid JSON parameters:", tools[i].name) + "\n";
        for (const message of result.error) {
          error += `	- ${message}
`;
        }
        error += `	- Schema: ${JSON.stringify(tools[i].inputSchema)}

`;
      } else {
        validated.push(result);
      }
    }
    if (error) {
      handler.logger.warn(`${tools.length - validated.length} tools have invalid JSON schemas and will be omitted`);
      warnInvalidTools(this._instantiationService, this.definition.label, error);
    }
    return validated;
  }
  populateLiveData(handler, cacheNonce, store) {
    const cts = new CancellationTokenSource();
    store.add(toDisposable(() => cts.dispose(true)));
    const updateTools = /* @__PURE__ */ __name((tx) => {
      const toolPromise = handler.capabilities.tools ? handler.listTools({}, cts.token) : Promise.resolve([]);
      const toolPromiseSafe = toolPromise.then(async (tools) => {
        handler.logger.info(`Discovered ${tools.length} tools`);
        return { tools: await this._getValidatedTools(handler, tools), nonce: cacheNonce };
      });
      this.toolsFromServerPromise.set(new ObservablePromise(toolPromiseSafe), tx);
      return [toolPromiseSafe];
    }, "updateTools");
    store.add(handler.onDidChangeToolList(() => {
      handler.logger.info("Tool list changed, refreshing tools...");
      updateTools(void 0);
    }));
    let promises;
    transaction((tx) => {
      promises = updateTools(tx);
    });
    Promise.all(promises).then(([{ tools }]) => {
      this._toolCache.storeTools(this.definition.id, cacheNonce, tools);
      this._telemetryService.publicLog2("mcp/serverBoot", {
        supportsLogging: !!handler.capabilities.logging,
        supportsPrompts: !!handler.capabilities.prompts,
        supportsResources: !!handler.capabilities.resources,
        toolCount: tools.length
      });
    });
  }
  /**
   * Helper function to call the function on the handler once it's online. The
   * connection started if it is not already.
   */
  async callOn(fn, token = CancellationToken.None) {
    await this.start();
    let ranOnce = false;
    let d;
    const callPromise = new Promise((resolve, reject) => {
      d = autorun((reader) => {
        const connection = this._connection.read(reader);
        if (!connection || ranOnce) {
          return;
        }
        const handler = connection.handler.read(reader);
        if (!handler) {
          const state = connection.state.read(reader);
          if (state.state === 3) {
            reject(new McpConnectionFailedError(`MCP server could not be started: ${state.message}`));
            return;
          } else if (state.state === 0) {
            reject(new McpConnectionFailedError("MCP server has stopped"));
            return;
          } else {
            return;
          }
        }
        resolve(fn(handler));
        ranOnce = true;
      });
    });
    return raceCancellationError(callPromise, token).finally(() => d.dispose());
  }
};
McpServer = __decorate([
  __param(5, IMcpRegistry),
  __param(6, IWorkspaceContextService),
  __param(7, IExtensionService),
  __param(8, ILoggerService),
  __param(9, IOutputService),
  __param(10, ITelemetryService),
  __param(11, ICommandService),
  __param(12, IInstantiationService),
  __param(13, INotificationService),
  __param(14, IOpenerService)
], McpServer);
class McpTool {
  static {
    __name(this, "McpTool");
  }
  get definition() {
    return this._definition;
  }
  constructor(_server, idPrefix, _definition) {
    this._server = _server;
    this._definition = _definition;
    this.id = (idPrefix + _definition.name).replaceAll(".", "_");
  }
  call(params, token) {
    const name = this._definition.serverToolName ?? this._definition.name;
    return this._server.callOn((h) => h.callTool({ name, arguments: params }, token), token);
  }
  callWithProgress(params, progress, token) {
    return this._callWithProgress(params, progress, token);
  }
  _callWithProgress(params, progress, token, allowRetry = true) {
    const name = this._definition.serverToolName ?? this._definition.name;
    const progressToken = generateUuid();
    return this._server.callOn((h) => {
      let lastProgressN = 0;
      const listener = h.onDidReceiveProgressNotification((e) => {
        if (e.params.progressToken === progressToken) {
          progress.report({
            message: e.params.message,
            increment: e.params.progress - lastProgressN,
            total: e.params.total
          });
          lastProgressN = e.params.progress;
        }
      });
      return h.callTool({ name, arguments: params, _meta: { progressToken } }, token).finally(() => listener.dispose()).catch((err) => {
        const state = this._server.connectionState.get();
        if (allowRetry && state.state === 3 && state.shouldRetry) {
          return this._callWithProgress(params, progress, token, false);
        } else {
          throw err;
        }
      });
    }, token);
  }
  compare(other) {
    return this._definition.name.localeCompare(other.definition.name);
  }
}
function warnInvalidTools(instaService, serverName, errorText) {
  instaService.invokeFunction((accessor) => {
    const notificationService = accessor.get(INotificationService);
    const editorService = accessor.get(IEditorService);
    notificationService.notify({
      severity: Severity.Warning,
      message: localize("mcpBadSchema", "MCP server `{0}` has tools with invalid parameters which will be omitted.", serverName),
      actions: {
        primary: [{
          class: void 0,
          enabled: true,
          id: "mcpBadSchema.show",
          tooltip: "",
          label: localize("mcpBadSchema.show", "Show"),
          run: /* @__PURE__ */ __name(() => {
            editorService.openEditor({
              resource: void 0,
              contents: errorText
            });
          }, "run")
        }]
      }
    });
  });
}
__name(warnInvalidTools, "warnInvalidTools");
export {
  McpServer,
  McpServerMetadataCache,
  McpTool
};
//# sourceMappingURL=mcpServer.js.map
