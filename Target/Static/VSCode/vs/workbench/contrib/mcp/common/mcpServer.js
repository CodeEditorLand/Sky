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
import { raceCancellationError, Sequencer } from "../../../../base/common/async.js";
import * as json from "../../../../base/common/json.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../base/common/map.js";
import { autorun, autorunWithStore, derived, disposableObservableValue, IObservable, ITransaction, observableFromEvent, ObservablePromise, observableValue, transaction } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ILogger, ILoggerService } from "../../../../platform/log/common/log.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IOutputService } from "../../../services/output/common/output.js";
import { mcpActivationEvent } from "./mcpConfiguration.js";
import { IMcpRegistry } from "./mcpRegistryTypes.js";
import { McpServerRequestHandler } from "./mcpServerRequestHandler.js";
import { extensionMcpCollectionPrefix, IMcpServer, IMcpServerConnection, IMcpTool, McpCollectionReference, McpConnectionFailedError, McpConnectionState, McpDefinitionReference, McpServerDefinition, McpServerToolsState } from "./mcpTypes.js";
import { MCP } from "./modelContextProtocol.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { localize } from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
const toolInvalidCharRe = /[^a-z0-9_-]/gi;
let McpServerMetadataCache = class extends Disposable {
  static {
    __name(this, "McpServerMetadataCache");
  }
  didChange = false;
  cache = new LRUCache(128);
  extensionServers = /* @__PURE__ */ new Map();
  constructor(scope, storageService) {
    super();
    const storageKey = "mcpToolCache";
    this._register(storageService.onWillSaveState(() => {
      if (this.didChange) {
        storageService.store(storageKey, {
          extensionServers: [...this.extensionServers],
          serverTools: this.cache.toJSON()
        }, scope, StorageTarget.MACHINE);
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
    return this.cache.get(definitionId)?.tools;
  }
  /** Sets cached tools for a server */
  storeTools(definitionId, tools) {
    this.cache.set(definitionId, { ...this.cache.get(definitionId), tools });
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
McpServerMetadataCache = __decorateClass([
  __decorateParam(1, IStorageService)
], McpServerMetadataCache);
let McpServer = class extends Disposable {
  constructor(collection, definition, explicitRoots, _requiresExtensionActivation, _toolCache, _mcpRegistry, workspacesService, _extensionService, _loggerService, _outputService, _telemetryService, _commandService, _instantiationService) {
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
    this._loggerId = `mcpServer.${definition.id}`;
    this._logger = this._register(_loggerService.createLogger(this._loggerId, { hidden: true, name: `MCP: ${definition.label}` }));
    this._register(toDisposable(() => _loggerService.deregisterLogger(this._loggerId)));
    const workspaces = explicitRoots ? observableValue(this, explicitRoots.map((uri) => ({ uri, name: basename(uri) }))) : observableFromEvent(
      this,
      workspacesService.onDidChangeWorkspaceFolders,
      () => workspacesService.getWorkspace().folders
    );
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
      const cnx = this._connection.read(reader)?.handler.read(reader);
      if (cnx) {
        this.populateLiveData(cnx, store);
      } else {
        this.resetLiveData();
      }
    }));
    this._register(autorun((reader) => {
      const tools = this.toolsFromServer.read(reader);
      if (tools) {
        this._toolCache.storeTools(definition.id, tools);
      }
    }));
    const toolPrefix = this._mcpRegistry.collectionToolPrefix(this.collection);
    this.tools = derived((reader) => {
      const serverTools = this.toolsFromServer.read(reader);
      const definitions = serverTools ?? this.toolsFromCache ?? [];
      const prefix = toolPrefix.read(reader);
      return definitions.map((def) => new McpTool(this, prefix, def));
    });
  }
  static {
    __name(this, "McpServer");
  }
  _connectionSequencer = new Sequencer();
  _connection = this._register(disposableObservableValue(this, void 0));
  connection = this._connection;
  connectionState = derived((reader) => this._connection.read(reader)?.state.read(reader) ?? { state: McpConnectionState.Kind.Stopped });
  get toolsFromCache() {
    return this._toolCache.getTools(this.definition.id);
  }
  toolsFromServerPromise = observableValue(this, void 0);
  toolsFromServer = derived((reader) => this.toolsFromServerPromise.read(reader)?.promiseResult.read(reader)?.data);
  tools;
  toolsState = derived((reader) => {
    const fromServer = this.toolsFromServerPromise.read(reader);
    const connectionState = this.connectionState.read(reader);
    const isIdle = McpConnectionState.canBeStarted(connectionState.state) && !fromServer;
    if (isIdle) {
      return this.toolsFromCache ? McpServerToolsState.Cached : McpServerToolsState.Unknown;
    }
    const fromServerResult = fromServer?.promiseResult.read(reader);
    if (!fromServerResult) {
      return this.toolsFromCache ? McpServerToolsState.RefreshingFromCached : McpServerToolsState.RefreshingFromUnknown;
    }
    return fromServerResult.error ? this.toolsFromCache ? McpServerToolsState.Cached : McpServerToolsState.Unknown : McpServerToolsState.Live;
  });
  _loggerId;
  _logger;
  get trusted() {
    return this._mcpRegistry.getTrust(this.collection);
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
          return { state: McpConnectionState.Kind.Stopped };
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
          return { state: McpConnectionState.Kind.Stopped };
        }
        if (this._store.isDisposed) {
          connection.dispose();
          return { state: McpConnectionState.Kind.Stopped };
        }
        this._connection.set(connection, void 0);
      }
      const start = Date.now();
      const state = await connection.start();
      this._telemetryService.publicLog2("mcp/serverBootState", {
        state: McpConnectionState.toKindString(state.state),
        time: Date.now() - start
      });
      return state;
    });
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
  populateLiveData(handler, store) {
    const cts = new CancellationTokenSource();
    store.add(toDisposable(() => cts.dispose(true)));
    const updateTools = /* @__PURE__ */ __name((tx) => {
      const toolPromise = handler.capabilities.tools ? handler.listTools({}, cts.token) : Promise.resolve([]);
      const toolPromiseSafe = toolPromise.then(async (tools) => {
        handler.logger.info(`Discovered ${tools.length} tools`);
        return this._getValidatedTools(handler, tools);
      });
      this.toolsFromServerPromise.set(new ObservablePromise(toolPromiseSafe), tx);
      return [toolPromise];
    }, "updateTools");
    store.add(handler.onDidChangeToolList(() => {
      handler.logger.info("Tool list changed, refreshing tools...");
      updateTools(void 0);
    }));
    let promises;
    transaction((tx) => {
      promises = updateTools(tx);
    });
    Promise.all(promises).then(([tools]) => {
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
          if (state.state === McpConnectionState.Kind.Error) {
            reject(new McpConnectionFailedError(`MCP server could not be started: ${state.message}`));
            return;
          } else if (state.state === McpConnectionState.Kind.Stopped) {
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
McpServer = __decorateClass([
  __decorateParam(5, IMcpRegistry),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, ILoggerService),
  __decorateParam(9, IOutputService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, ICommandService),
  __decorateParam(12, IInstantiationService)
], McpServer);
class McpTool {
  constructor(_server, idPrefix, _definition) {
    this._server = _server;
    this._definition = _definition;
    this.id = (idPrefix + _definition.name).replaceAll(".", "_");
  }
  static {
    __name(this, "McpTool");
  }
  id;
  get definition() {
    return this._definition;
  }
  call(params, token) {
    const name = this._definition.serverToolName ?? this._definition.name;
    return this._server.callOn((h) => h.callTool({ name, arguments: params }), token);
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
