var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AsyncIterableObject, raceCancellationError, Sequencer } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Iterable } from "../../../../base/common/iterator.js";
import * as json from "../../../../base/common/json.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../base/common/map.js";
import { mapValues } from "../../../../base/common/objects.js";
import { autorun, derived, disposableObservableValue, observableFromEvent, ObservablePromise, observableValue, transaction } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IRemoteAuthorityResolverService } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IOutputService } from "../../../services/output/common/output.js";
import { mcpActivationEvent } from "./mcpConfiguration.js";
import { McpDevModeServerAttache } from "./mcpDevMode.js";
import { IMcpRegistry } from "./mcpRegistryTypes.js";
import { extensionMcpCollectionPrefix, IMcpElicitationService, IMcpSamplingService, McpConnectionFailedError, McpConnectionState, mcpPromptReplaceSpecialChars, McpResourceURI } from "./mcpTypes.js";
import { UriTemplate } from "./uriTemplate.js";
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
var McpServer_1;
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
  /** Resets the cache for primitives and extension servers */
  reset() {
    this.cache.clear();
    this.extensionServers.clear();
    this.didChange = true;
  }
  /** Gets cached primitives for a server (used before a server is running) */
  get(definitionId) {
    return this.cache.get(definitionId);
  }
  /** Sets cached primitives for a server */
  store(definitionId, entry) {
    this.cache.set(definitionId, entry);
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
class CachedPrimitive {
  static {
    __name(this, "CachedPrimitive");
  }
  constructor(_definitionId, _cache, _fromCache, _toT) {
    this._definitionId = _definitionId;
    this._cache = _cache;
    this._fromCache = _fromCache;
    this._toT = _toT;
    this.fromServerPromise = observableValue(this, void 0);
    this.fromServer = derived((reader) => this.fromServerPromise.read(reader)?.promiseResult.read(reader)?.data);
    this.value = derived((reader) => {
      const serverTools = this.fromServer.read(reader);
      const definitions = serverTools?.data ?? this.fromCache?.data ?? [];
      return this._toT(definitions, reader);
    });
  }
  get fromCache() {
    const c = this._cache.get(this._definitionId);
    return c ? { data: this._fromCache(c), nonce: c.nonce } : void 0;
  }
}
let McpServer = McpServer_1 = class McpServer2 extends Disposable {
  static {
    __name(this, "McpServer");
  }
  /**
   * Helper function to call the function on the handler once it's online. The
   * connection started if it is not already.
   */
  static async callOn(server, fn, token = CancellationToken.None) {
    await server.start();
    let ranOnce = false;
    let d;
    const callPromise = new Promise((resolve, reject) => {
      d = autorun((reader) => {
        const connection = server.connection.read(reader);
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
  get capabilities() {
    return this._capabilities;
  }
  get tools() {
    return this._tools.value;
  }
  get prompts() {
    return this._prompts.value;
  }
  get trusted() {
    return this._mcpRegistry.getTrust(this.collection);
  }
  constructor(collection, definition, explicitRoots, _requiresExtensionActivation, _primitiveCache, toolPrefix, _mcpRegistry, workspacesService, _extensionService, _loggerService, _outputService, _telemetryService, _commandService, _instantiationService, _notificationService, _openerService, _samplingService, _elicitationService, _remoteAuthorityResolverService) {
    super();
    this.collection = collection;
    this.definition = definition;
    this._requiresExtensionActivation = _requiresExtensionActivation;
    this._primitiveCache = _primitiveCache;
    this._mcpRegistry = _mcpRegistry;
    this._extensionService = _extensionService;
    this._loggerService = _loggerService;
    this._outputService = _outputService;
    this._telemetryService = _telemetryService;
    this._commandService = _commandService;
    this._instantiationService = _instantiationService;
    this._notificationService = _notificationService;
    this._openerService = _openerService;
    this._samplingService = _samplingService;
    this._elicitationService = _elicitationService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._connectionSequencer = new Sequencer();
    this._connection = this._register(disposableObservableValue(this, void 0));
    this.connection = this._connection;
    this.connectionState = derived((reader) => this._connection.read(reader)?.state.read(reader) ?? {
      state: 0
      /* McpConnectionState.Kind.Stopped */
    });
    this._capabilities = observableValue("mcpserver.capabilities", void 0);
    this.cacheState = derived((reader) => {
      const currentNonce = /* @__PURE__ */ __name(() => this._fullDefinitions.read(reader)?.server?.cacheNonce, "currentNonce");
      const stateWhenServingFromCache = /* @__PURE__ */ __name(() => {
        if (!this._tools.fromCache) {
          return 0;
        }
        return currentNonce() === this._tools.fromCache.nonce ? 1 : 2;
      }, "stateWhenServingFromCache");
      const fromServer = this._tools.fromServerPromise.read(reader);
      const connectionState = this.connectionState.read(reader);
      const isIdle = McpConnectionState.canBeStarted(connectionState.state) || !fromServer;
      if (isIdle) {
        return stateWhenServingFromCache();
      }
      const fromServerResult = fromServer?.promiseResult.read(reader);
      if (!fromServerResult) {
        return this._tools.fromCache ? 4 : 3;
      }
      if (fromServerResult.error) {
        return stateWhenServingFromCache();
      }
      return fromServerResult.data?.nonce === currentNonce() ? 5 : 2;
    });
    this._lastModeDebugged = false;
    this.runningToolCalls = /* @__PURE__ */ new Set();
    this._fullDefinitions = this._mcpRegistry.getServerDefinition(this.collection, this.definition);
    this._loggerId = `mcpServer.${definition.id}`;
    this._logger = this._register(_loggerService.createLogger(this._loggerId, { hidden: true, name: `MCP: ${definition.label}` }));
    const that = this;
    this._register(this._instantiationService.createInstance(McpDevModeServerAttache, this, { get lastModeDebugged() {
      return that._lastModeDebugged;
    } }));
    this._register(toDisposable(() => _loggerService.deregisterLogger(this._loggerId)));
    const workspaces = explicitRoots ? observableValue(this, explicitRoots.map((uri) => ({ uri, name: basename(uri) }))) : observableFromEvent(this, workspacesService.onDidChangeWorkspaceFolders, () => workspacesService.getWorkspace().folders);
    const workspacesWithCanonicalURIs = derived((reader) => {
      const folders = workspaces.read(reader);
      return new ObservablePromise((async () => {
        let uris = folders.map((f) => f.uri);
        try {
          uris = await Promise.all(uris.map((u) => this._remoteAuthorityResolverService.getCanonicalURI(u)));
        } catch (error) {
          this._logger.error(`Failed to resolve workspace folder URIs: ${error}`);
        }
        return uris.map((uri, i) => ({ uri: uri.toString(), name: folders[i].name }));
      })());
    }).recomputeInitiallyAndOnChange(this._store);
    this._register(autorun((reader) => {
      const cnx = this._connection.read(reader)?.handler.read(reader);
      if (!cnx) {
        return;
      }
      const roots = workspacesWithCanonicalURIs.read(reader).promiseResult.read(reader);
      if (roots?.data) {
        cnx.roots = roots.data;
      }
    }));
    this._register(autorun((reader) => {
      const cnx = this._connection.read(reader);
      const handler = cnx?.handler.read(reader);
      if (handler) {
        this.populateLiveData(handler, cnx?.definition.cacheNonce, reader.store);
      } else if (this._tools) {
        this.resetLiveData();
      }
    }));
    this._tools = new CachedPrimitive(this.definition.id, this._primitiveCache, (entry) => entry.tools, (entry) => entry.map((def) => new McpTool(this, toolPrefix, def)).sort((a, b) => a.compare(b)));
    this._prompts = new CachedPrimitive(this.definition.id, this._primitiveCache, (entry) => entry.prompts || [], (entry) => entry.map((e) => new McpPrompt(this, e)));
    this._capabilities.set(this._primitiveCache.get(this.definition.id)?.capabilities, void 0);
  }
  readDefinitions() {
    return this._fullDefinitions;
  }
  showOutput() {
    this._loggerService.setVisibility(this._loggerId, true);
    this._outputService.showChannel(this._loggerId);
  }
  resources(token) {
    const cts = new CancellationTokenSource(token);
    return new AsyncIterableObject(async (emitter) => {
      await McpServer_1.callOn(this, async (handler) => {
        for await (const resource of handler.listResourcesIterable({}, cts.token)) {
          emitter.emitOne(resource.map((r) => new McpResource(this, r)));
          if (cts.token.isCancellationRequested) {
            return;
          }
        }
      });
    }, () => cts.dispose(true));
  }
  resourceTemplates(token) {
    return McpServer_1.callOn(this, async (handler) => {
      const templates = await handler.listResourceTemplates({}, token);
      return templates.map((t) => new McpResourceTemplate(this, t));
    }, token);
  }
  start({ isFromInteraction, debug } = {}) {
    return this._connectionSequencer.queue(async () => {
      const activationEvent = mcpActivationEvent(this.collection.id.slice(extensionMcpCollectionPrefix.length));
      if (this._requiresExtensionActivation && !this._extensionService.activationEventIsDone(activationEvent)) {
        await this._extensionService.activateByEvent(activationEvent);
        await Promise.all(this._mcpRegistry.delegates.get().map((r) => r.waitForInitialProviderPromises()));
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
        this._lastModeDebugged = !!debug;
        connection = await this._mcpRegistry.resolveConnection({
          logger: this._logger,
          collectionRef: this.collection,
          definitionRef: this.definition,
          forceTrust: isFromInteraction,
          debug
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
      if (isFromInteraction && connection.definition.devMode) {
        this.showOutput();
      }
      const start = Date.now();
      const state = await connection.start({
        createMessageRequestHandler: /* @__PURE__ */ __name((params) => this._samplingService.sample({
          isDuringToolCall: this.runningToolCalls.size > 0,
          server: this,
          params
        }).then((r) => r.sample), "createMessageRequestHandler"),
        elicitationRequestHandler: /* @__PURE__ */ __name((req) => this._elicitationService.elicit(this, Iterable.first(this.runningToolCalls), req, CancellationToken.None), "elicitationRequestHandler")
      });
      this._telemetryService.publicLog2("mcp/serverBootState", {
        state: McpConnectionState.toKindString(state.state),
        time: Date.now() - start
      });
      if (state.state === 3 && isFromInteraction) {
        this.showInteractiveError(connection, state, debug);
      }
      return state;
    });
  }
  showInteractiveError(cnx, error, debug) {
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
      if (cnx.definition.devMode?.debug?.type === "debugpy" && debug) {
        this._notificationService.prompt(Severity.Error, localize("mcpDebugPyHelp", 'The command "{0}" was not found. You can specify the path to debugpy in the `dev.debug.debugpyPath` option.', cnx.launchDefinition.command, cnx.definition.label), [...options, {
          label: localize("mcpViewDocs", "View Docs"),
          run: /* @__PURE__ */ __name(() => this._openerService.open(URI.parse("https://aka.ms/vscode-mcp-install/debugpy")), "run")
        }]);
        return;
      }
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
      this._tools.fromServerPromise.set(void 0, tx);
      this._prompts.fromServerPromise.set(void 0, tx);
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
        return { data: await this._getValidatedTools(handler, tools), nonce: cacheNonce };
      });
      this._tools.fromServerPromise.set(new ObservablePromise(toolPromiseSafe), tx);
      return toolPromiseSafe;
    }, "updateTools");
    const updatePrompts = /* @__PURE__ */ __name((tx) => {
      const promptsPromise = handler.capabilities.prompts ? handler.listPrompts({}, cts.token) : Promise.resolve([]);
      const promptsPromiseSafe = promptsPromise.then((data) => ({ data, nonce: cacheNonce }));
      this._prompts.fromServerPromise.set(new ObservablePromise(promptsPromiseSafe), tx);
      return promptsPromiseSafe;
    }, "updatePrompts");
    store.add(handler.onDidChangeToolList(() => {
      handler.logger.info("Tool list changed, refreshing tools...");
      updateTools(void 0);
    }));
    store.add(handler.onDidChangePromptList(() => {
      handler.logger.info("Prompts list changed, refreshing prompts...");
      updatePrompts(void 0);
    }));
    transaction((tx) => {
      const capabilities = encodeCapabilities(handler.capabilities);
      this._capabilities.set(capabilities, tx);
      Promise.all([updateTools(tx), updatePrompts(tx)]).then(([{ data: tools }, { data: prompts }]) => {
        this._primitiveCache.store(this.definition.id, {
          nonce: cacheNonce,
          tools,
          prompts,
          capabilities
        });
        this._telemetryService.publicLog2("mcp/serverBoot", {
          supportsLogging: !!handler.capabilities.logging,
          supportsPrompts: !!handler.capabilities.prompts,
          supportsResources: !!handler.capabilities.resources,
          toolCount: tools.length,
          serverName: handler.serverInfo.name,
          serverVersion: handler.serverInfo.version
        });
      });
    });
  }
};
McpServer = McpServer_1 = __decorate([
  __param(6, IMcpRegistry),
  __param(7, IWorkspaceContextService),
  __param(8, IExtensionService),
  __param(9, ILoggerService),
  __param(10, IOutputService),
  __param(11, ITelemetryService),
  __param(12, ICommandService),
  __param(13, IInstantiationService),
  __param(14, INotificationService),
  __param(15, IOpenerService),
  __param(16, IMcpSamplingService),
  __param(17, IMcpElicitationService),
  __param(18, IRemoteAuthorityResolverService)
], McpServer);
class McpPrompt {
  static {
    __name(this, "McpPrompt");
  }
  constructor(_server, _definition) {
    this._server = _server;
    this._definition = _definition;
    this.id = mcpPromptReplaceSpecialChars(this._server.definition.label + "." + _definition.name);
    this.name = _definition.name;
    this.description = _definition.description;
    this.arguments = _definition.arguments || [];
  }
  async resolve(args, token) {
    const result = await McpServer.callOn(this._server, (h) => h.getPrompt({ name: this._definition.name, arguments: args }, token), token);
    return result.messages;
  }
  async complete(argument, prefix, alreadyResolved, token) {
    const result = await McpServer.callOn(this._server, (h) => h.complete({
      ref: { type: "ref/prompt", name: this._definition.name },
      argument: { name: argument, value: prefix },
      context: { arguments: alreadyResolved }
    }, token), token);
    return result.completion.values;
  }
}
function encodeCapabilities(cap) {
  let out = 0;
  if (cap.logging) {
    out |= 1;
  }
  if (cap.completions) {
    out |= 2;
  }
  if (cap.prompts) {
    out |= 4;
    if (cap.prompts.listChanged) {
      out |= 8;
    }
  }
  if (cap.resources) {
    out |= 16;
    if (cap.resources.subscribe) {
      out |= 32;
    }
    if (cap.resources.listChanged) {
      out |= 64;
    }
  }
  if (cap.tools) {
    out |= 128;
    if (cap.tools.listChanged) {
      out |= 256;
    }
  }
  return out;
}
__name(encodeCapabilities, "encodeCapabilities");
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
    this.referenceName = _definition.name.replaceAll(".", "_");
    this.id = (idPrefix + _definition.name).replaceAll(".", "_").slice(
      0,
      64
      /* McpToolName.MaxLength */
    );
  }
  async call(params, context, token) {
    const name = this._definition.serverToolName ?? this._definition.name;
    if (context) {
      this._server.runningToolCalls.add(context);
    }
    try {
      return await McpServer.callOn(this._server, (h) => h.callTool({ name, arguments: params }, token), token);
    } finally {
      if (context) {
        this._server.runningToolCalls.delete(context);
      }
    }
  }
  async callWithProgress(params, progress, context, token) {
    if (context) {
      this._server.runningToolCalls.add(context);
    }
    try {
      return await this._callWithProgress(params, progress, token);
    } finally {
      if (context) {
        this._server.runningToolCalls.delete(context);
      }
    }
  }
  _callWithProgress(params, progress, token, allowRetry = true) {
    const name = this._definition.serverToolName ?? this._definition.name;
    const progressToken = generateUuid();
    return McpServer.callOn(this._server, (h) => {
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
class McpResource {
  static {
    __name(this, "McpResource");
  }
  constructor(server, original) {
    this.mcpUri = original.uri;
    this.uri = McpResourceURI.fromServer(server.definition, original.uri);
    this.name = original.name;
    this.description = original.description;
    this.mimeType = original.mimeType;
    this.sizeInBytes = original.size;
  }
}
class McpResourceTemplate {
  static {
    __name(this, "McpResourceTemplate");
  }
  constructor(_server, _definition) {
    this._server = _server;
    this._definition = _definition;
    this.name = _definition.name;
    this.description = _definition.description;
    this.mimeType = _definition.mimeType;
    this.template = UriTemplate.parse(_definition.uriTemplate);
  }
  resolveURI(vars) {
    const serverUri = this.template.resolve(vars);
    return McpResourceURI.fromServer(this._server.definition, serverUri);
  }
  async complete(templatePart, prefix, alreadyResolved, token) {
    const result = await McpServer.callOn(this._server, (h) => h.complete({
      ref: { type: "ref/resource", uri: this._definition.uriTemplate },
      argument: { name: templatePart, value: prefix },
      context: {
        arguments: mapValues(alreadyResolved, (v) => Array.isArray(v) ? v.join("/") : v)
      }
    }, token), token);
    return result.completion.values;
  }
}
export {
  McpServer,
  McpServerMetadataCache,
  McpTool
};
//# sourceMappingURL=mcpServer.js.map
