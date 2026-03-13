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
import { mapFindFirst } from "../../../base/common/arraysFind.js";
import { disposableTimeout, RunOnceScheduler } from "../../../base/common/async.js";
import { CancellationError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "../../../base/common/lifecycle.js";
import { autorun, observableValue } from "../../../base/common/observable.js";
import Severity from "../../../base/common/severity.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import * as nls from "../../../nls.js";
import { ContextKeyExpr, IContextKeyService } from "../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { LogLevel } from "../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../platform/telemetry/common/telemetry.js";
import { IWorkbenchMcpGatewayService } from "../../contrib/mcp/common/mcpGatewayService.js";
import { IMcpRegistry } from "../../contrib/mcp/common/mcpRegistryTypes.js";
import { extensionPrefixedIdentifier, McpConnectionState, McpServerDefinition, McpServerLaunch, UserInteractionRequiredError } from "../../contrib/mcp/common/mcpTypes.js";
import { IAuthenticationMcpAccessService } from "../../services/authentication/browser/authenticationMcpAccessService.js";
import { IAuthenticationMcpService } from "../../services/authentication/browser/authenticationMcpService.js";
import { IAuthenticationMcpUsageService } from "../../services/authentication/browser/authenticationMcpUsageService.js";
import { IAuthenticationService } from "../../services/authentication/common/authentication.js";
import { IDynamicAuthenticationProviderStorageService } from "../../services/authentication/common/dynamicAuthenticationProviderStorage.js";
import { extensionHostKindToString } from "../../services/extensions/common/extensionHostKind.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadMcp = class MainThreadMcp2 extends Disposable {
  static {
    __name(this, "MainThreadMcp");
  }
  constructor(_extHostContext, _mcpRegistry, dialogService, _authenticationService, authenticationMcpServersService, authenticationMCPServerAccessService, authenticationMCPServerUsageService, _dynamicAuthenticationProviderStorageService, _extensionService, _contextKeyService, _telemetryService, _mcpGatewayService) {
    super();
    this._extHostContext = _extHostContext;
    this._mcpRegistry = _mcpRegistry;
    this.dialogService = dialogService;
    this._authenticationService = _authenticationService;
    this.authenticationMcpServersService = authenticationMcpServersService;
    this.authenticationMCPServerAccessService = authenticationMCPServerAccessService;
    this.authenticationMCPServerUsageService = authenticationMCPServerUsageService;
    this._dynamicAuthenticationProviderStorageService = _dynamicAuthenticationProviderStorageService;
    this._extensionService = _extensionService;
    this._contextKeyService = _contextKeyService;
    this._telemetryService = _telemetryService;
    this._mcpGatewayService = _mcpGatewayService;
    this._serverIdCounter = 0;
    this._servers = /* @__PURE__ */ new Map();
    this._serverDefinitions = /* @__PURE__ */ new Map();
    this._serverAuthTracking = new McpServerAuthTracker();
    this._collectionDefinitions = this._register(new DisposableMap());
    this._gateways = this._register(new DisposableMap());
    this._register(_authenticationService.onDidChangeSessions((e) => this._onDidChangeAuthSessions(e.providerId, e.label)));
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
      async substituteVariables(serverDefinition, launch) {
        const ser = await proxy.$substituteVariables(serverDefinition.variableReplacement?.folder?.uri, McpServerLaunch.toSerialized(launch));
        return McpServerLaunch.fromSerialized(ser);
      },
      start: /* @__PURE__ */ __name((_collection, serverDefiniton, resolveLaunch, options) => {
        const id = ++this._serverIdCounter;
        const launch = new ExtHostMcpServerLaunch(_extHostContext.extensionHostKind, () => proxy.$stopMcp(id), (msg) => proxy.$sendMessage(id, JSON.stringify(msg)));
        this._servers.set(id, launch);
        this._serverDefinitions.set(id, serverDefiniton);
        proxy.$startMcp(id, {
          launch: resolveLaunch,
          defaultCwd: serverDefiniton.variableReplacement?.folder?.uri,
          errorOnUserInteraction: options?.errorOnUserInteraction
        });
        return launch;
      }, "start")
    }));
    const onDidChangeMcpServerDefinitionsTrigger = this._register(new RunOnceScheduler(() => this._publishServerDefinitions(), 500));
    this._register(autorun((reader) => {
      const collections = this._mcpRegistry.collections.read(reader);
      for (const collection of collections) {
        collection.serverDefinitions.read(reader);
      }
      if (!onDidChangeMcpServerDefinitionsTrigger.isScheduled()) {
        onDidChangeMcpServerDefinitionsTrigger.schedule();
      }
    }));
    onDidChangeMcpServerDefinitionsTrigger.schedule();
  }
  _publishServerDefinitions() {
    const collections = this._mcpRegistry.collections.get();
    const allServers = [];
    for (const collection of collections) {
      const servers = collection.serverDefinitions.get();
      for (const server of servers) {
        allServers.push(McpServerDefinition.toSerialized(server));
      }
    }
    this._proxy.$onDidChangeMcpServerDefinitions(allServers);
  }
  $upsertMcpCollection(collection, serversDto) {
    const servers = serversDto.map(McpServerDefinition.fromSerialized);
    const existing = this._collectionDefinitions.get(collection.id);
    if (existing) {
      existing.servers.set(servers, void 0);
    } else {
      const serverDefinitions = observableValue("mcpServers", servers);
      const extensionId = new ExtensionIdentifier(collection.extensionId);
      const store = new DisposableStore();
      const handle = store.add(new MutableDisposable());
      const register = /* @__PURE__ */ __name(() => {
        handle.value ??= this._mcpRegistry.registerCollection({
          ...collection,
          source: extensionId,
          resolveServerLanch: collection.canResolveLaunch ? (async (def) => {
            const r = await this._proxy.$resolveMcpLaunch(collection.id, def.label);
            return r ? McpServerLaunch.fromSerialized(r) : void 0;
          }) : void 0,
          trustBehavior: collection.isTrustedByDefault ? 0 : 1,
          remoteAuthority: this._extHostContext.remoteAuthority,
          serverDefinitions
        });
      }, "register");
      const whenClauseStr = mapFindFirst(this._extensionService.extensions, (e) => ExtensionIdentifier.equals(extensionId, e.identifier) ? e.contributes?.mcpServerDefinitionProviders?.find((p) => extensionPrefixedIdentifier(extensionId, p.id) === collection.id)?.when : void 0);
      const whenClause = whenClauseStr && ContextKeyExpr.deserialize(whenClauseStr);
      if (!whenClause) {
        register();
      } else {
        const evaluate = /* @__PURE__ */ __name(() => {
          if (this._contextKeyService.contextMatchesRules(whenClause)) {
            register();
          } else {
            handle.clear();
          }
        }, "evaluate");
        store.add(this._contextKeyService.onDidChangeContext(evaluate));
        evaluate();
      }
      this._collectionDefinitions.set(collection.id, {
        servers: serverDefinitions,
        dispose: /* @__PURE__ */ __name(() => store.dispose(), "dispose")
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
      this._serverDefinitions.delete(id);
      this._serverAuthTracking.untrack(id);
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
  async $getTokenForProviderId(id, providerId, scopes, options = {}) {
    const server = this._serverDefinitions.get(id);
    if (!server) {
      return void 0;
    }
    return this._getSessionForProvider(id, server, providerId, scopes, void 0, options.errorOnUserInteraction);
  }
  async $getTokenFromServerMetadata(id, authDetails, { errorOnUserInteraction, forceNewRegistration } = {}) {
    const server = this._serverDefinitions.get(id);
    if (!server) {
      return void 0;
    }
    const authorizationServer = URI.revive(authDetails.authorizationServer);
    const resourceServer = authDetails.resourceMetadata?.resource ? URI.parse(authDetails.resourceMetadata.resource) : void 0;
    const resolvedScopes = authDetails.scopes ?? authDetails.resourceMetadata?.scopes_supported ?? authDetails.authorizationServerMetadata.scopes_supported ?? [];
    let providerId = await this._authenticationService.getOrActivateProviderIdForServer(authorizationServer, resourceServer);
    if (forceNewRegistration && providerId) {
      if (!this._authenticationService.isDynamicAuthenticationProvider(providerId)) {
        throw new Error("Cannot force new registration for a non-dynamic authentication provider.");
      }
      this._authenticationService.unregisterAuthenticationProvider(providerId);
      await this._dynamicAuthenticationProviderStorageService.removeDynamicProvider(providerId);
      providerId = void 0;
    }
    if (!providerId) {
      const provider = await this._authenticationService.createDynamicAuthenticationProvider(authorizationServer, authDetails.authorizationServerMetadata, authDetails.resourceMetadata);
      if (!provider) {
        return void 0;
      }
      providerId = provider.id;
    }
    return this._getSessionForProvider(id, server, providerId, resolvedScopes, authorizationServer, errorOnUserInteraction);
  }
  async _getSessionForProvider(serverId, server, providerId, scopes, authorizationServer, errorOnUserInteraction = false) {
    const sessions = await this._authenticationService.getSessions(providerId, scopes, { authorizationServer }, true);
    const accountNamePreference = this.authenticationMcpServersService.getAccountPreference(server.id, providerId);
    let matchingAccountPreferenceSession;
    if (accountNamePreference) {
      matchingAccountPreferenceSession = sessions.find((session2) => session2.account.label === accountNamePreference);
    }
    const provider = this._authenticationService.getProvider(providerId);
    let session;
    if (sessions.length) {
      if (matchingAccountPreferenceSession && this.authenticationMCPServerAccessService.isAccessAllowed(providerId, matchingAccountPreferenceSession.account.label, server.id)) {
        this.authenticationMCPServerUsageService.addAccountUsage(providerId, matchingAccountPreferenceSession.account.label, scopes, server.id, server.label);
        this._serverAuthTracking.track(providerId, serverId, scopes);
        return matchingAccountPreferenceSession.accessToken;
      }
      if (!provider.supportsMultipleAccounts && this.authenticationMCPServerAccessService.isAccessAllowed(providerId, sessions[0].account.label, server.id)) {
        this.authenticationMCPServerUsageService.addAccountUsage(providerId, sessions[0].account.label, scopes, server.id, server.label);
        this._serverAuthTracking.track(providerId, serverId, scopes);
        return sessions[0].accessToken;
      }
    }
    if (errorOnUserInteraction) {
      throw new UserInteractionRequiredError("authentication");
    }
    const isAllowed = await this.loginPrompt(server.label, provider.label, false);
    if (!isAllowed) {
      throw new Error("User did not consent to login.");
    }
    if (sessions.length) {
      if (provider.supportsMultipleAccounts && errorOnUserInteraction) {
        throw new UserInteractionRequiredError("authentication");
      }
      session = provider.supportsMultipleAccounts ? await this.authenticationMcpServersService.selectSession(providerId, server.id, server.label, scopes, sessions) : sessions[0];
    } else {
      if (errorOnUserInteraction) {
        throw new UserInteractionRequiredError("authentication");
      }
      const accountToCreate = matchingAccountPreferenceSession?.account;
      do {
        session = await this._authenticationService.createSession(providerId, scopes, {
          activateImmediate: true,
          account: accountToCreate,
          authorizationServer
        });
      } while (accountToCreate && accountToCreate.label !== session.account.label && !await this.continueWithIncorrectAccountPrompt(session.account.label, accountToCreate.label));
    }
    this.authenticationMCPServerAccessService.updateAllowedMcpServers(providerId, session.account.label, [{ id: server.id, name: server.label, allowed: true }]);
    this.authenticationMcpServersService.updateAccountPreference(server.id, providerId, session.account);
    this.authenticationMCPServerUsageService.addAccountUsage(providerId, session.account.label, scopes, server.id, server.label);
    this._serverAuthTracking.track(providerId, serverId, scopes);
    return session.accessToken;
  }
  async continueWithIncorrectAccountPrompt(chosenAccountLabel, requestedAccountLabel) {
    const result = await this.dialogService.prompt({
      message: nls.localize("incorrectAccount", "Incorrect account detected"),
      detail: nls.localize("incorrectAccountDetail", "The chosen account, {0}, does not match the requested account, {1}.", chosenAccountLabel, requestedAccountLabel),
      type: Severity.Warning,
      cancelButton: true,
      buttons: [
        {
          label: nls.localize("keep", "Keep {0}", chosenAccountLabel),
          run: /* @__PURE__ */ __name(() => chosenAccountLabel, "run")
        },
        {
          label: nls.localize("loginWith", "Login with {0}", requestedAccountLabel),
          run: /* @__PURE__ */ __name(() => requestedAccountLabel, "run")
        }
      ]
    });
    if (!result.result) {
      throw new CancellationError();
    }
    return result.result === chosenAccountLabel;
  }
  async _onDidChangeAuthSessions(providerId, providerLabel) {
    const serversUsingProvider = this._serverAuthTracking.get(providerId);
    if (!serversUsingProvider) {
      return;
    }
    for (const { serverId, scopes } of serversUsingProvider) {
      const server = this._servers.get(serverId);
      const serverDefinition = this._serverDefinitions.get(serverId);
      if (!server || !serverDefinition) {
        continue;
      }
      const state = server.state.get();
      if (state.state !== 2) {
        continue;
      }
      try {
        await this._getSessionForProvider(serverId, serverDefinition, providerId, scopes, void 0, true);
      } catch (e) {
        if (UserInteractionRequiredError.is(e)) {
          server.pushLog(LogLevel.Warning, nls.localize("mcpAuthSessionRemoved", "Authentication session for {0} removed, stopping server", providerLabel));
          server.stop();
        }
      }
    }
  }
  $logMcpAuthSetup(data) {
    this._telemetryService.publicLog2("mcp/authSetup", data);
  }
  async $startMcpGateway() {
    const result = await this._mcpGatewayService.createGateway(
      this._extHostContext.extensionHostKind === 3
      /* ExtensionHostKind.Remote */
    );
    if (!result) {
      return void 0;
    }
    if (this._store.isDisposed) {
      result.dispose();
      return void 0;
    }
    const gatewayId = generateUuid();
    this._gateways.set(gatewayId, result);
    return {
      address: result.address,
      gatewayId
    };
  }
  $disposeMcpGateway(gatewayId) {
    this._gateways.deleteAndDispose(gatewayId);
  }
  async loginPrompt(mcpLabel, providerLabel, recreatingSession) {
    const message = recreatingSession ? nls.localize("confirmRelogin", "The MCP Server Definition '{0}' wants you to authenticate to {1}.", mcpLabel, providerLabel) : nls.localize("confirmLogin", "The MCP Server Definition '{0}' wants to authenticate to {1}.", mcpLabel, providerLabel);
    const buttons = [
      {
        label: nls.localize({ key: "allow", comment: ["&& denotes a mnemonic"] }, "&&Allow"),
        run() {
          return true;
        }
      }
    ];
    const { result } = await this.dialogService.prompt({
      type: Severity.Info,
      message,
      buttons,
      cancelButton: true
    });
    return result ?? false;
  }
  dispose() {
    for (const server of this._servers.values()) {
      server.extHostDispose();
    }
    this._servers.clear();
    this._serverDefinitions.clear();
    this._serverAuthTracking.clear();
    super.dispose();
  }
};
MainThreadMcp = __decorate([
  extHostNamedCustomer(MainContext.MainThreadMcp),
  __param(1, IMcpRegistry),
  __param(2, IDialogService),
  __param(3, IAuthenticationService),
  __param(4, IAuthenticationMcpService),
  __param(5, IAuthenticationMcpAccessService),
  __param(6, IAuthenticationMcpUsageService),
  __param(7, IDynamicAuthenticationProviderStorageService),
  __param(8, IExtensionService),
  __param(9, IContextKeyService),
  __param(10, ITelemetryService),
  __param(11, IWorkbenchMcpGatewayService)
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
class McpServerAuthTracker {
  static {
    __name(this, "McpServerAuthTracker");
  }
  constructor() {
    this._tracking = /* @__PURE__ */ new Map();
  }
  /**
   * Track authentication for a server with a specific provider.
   * Replaces any existing tracking for this server/provider combination.
   */
  track(providerId, serverId, scopes) {
    const servers = this._tracking.get(providerId) || [];
    const filtered = servers.filter((s) => s.serverId !== serverId);
    filtered.push({ serverId, scopes });
    this._tracking.set(providerId, filtered);
  }
  /**
   * Remove all authentication tracking for a server across all providers.
   */
  untrack(serverId) {
    for (const [providerId, servers] of this._tracking.entries()) {
      const filtered = servers.filter((s) => s.serverId !== serverId);
      if (filtered.length === 0) {
        this._tracking.delete(providerId);
      } else {
        this._tracking.set(providerId, filtered);
      }
    }
  }
  /**
   * Get all servers using a specific authentication provider.
   */
  get(providerId) {
    return this._tracking.get(providerId);
  }
  /**
   * Clear all tracking data.
   */
  clear() {
    this._tracking.clear();
  }
}
export {
  MainThreadMcp
};
//# sourceMappingURL=mainThreadMcp.js.map
