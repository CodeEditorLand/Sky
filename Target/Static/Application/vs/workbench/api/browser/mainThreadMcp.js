var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { disposableTimeout } from "../../../base/common/async.js";
import { CancellationError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { observableValue } from "../../../base/common/observable.js";
import Severity from "../../../base/common/severity.js";
import { URI } from "../../../base/common/uri.js";
import * as nls from "../../../nls.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import { LogLevel } from "../../../platform/log/common/log.js";
import { IMcpRegistry } from "../../contrib/mcp/common/mcpRegistryTypes.js";
import { McpConnectionState, McpServerDefinition, McpServerLaunch } from "../../contrib/mcp/common/mcpTypes.js";
import { IAuthenticationMcpAccessService } from "../../services/authentication/browser/authenticationMcpAccessService.js";
import { IAuthenticationMcpService } from "../../services/authentication/browser/authenticationMcpService.js";
import { IAuthenticationMcpUsageService } from "../../services/authentication/browser/authenticationMcpUsageService.js";
import { IAuthenticationService } from "../../services/authentication/common/authentication.js";
import { extensionHostKindToString } from "../../services/extensions/common/extensionHostKind.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
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
let MainThreadMcp = class MainThreadMcp2 extends Disposable {
  static {
    __name(this, "MainThreadMcp");
  }
  constructor(_extHostContext, _mcpRegistry, dialogService, _authenticationService, authenticationMcpServersService, authenticationMCPServerAccessService, authenticationMCPServerUsageService) {
    super();
    this._extHostContext = _extHostContext;
    this._mcpRegistry = _mcpRegistry;
    this.dialogService = dialogService;
    this._authenticationService = _authenticationService;
    this.authenticationMcpServersService = authenticationMcpServersService;
    this.authenticationMCPServerAccessService = authenticationMCPServerAccessService;
    this.authenticationMCPServerUsageService = authenticationMCPServerUsageService;
    this._serverIdCounter = 0;
    this._servers = /* @__PURE__ */ new Map();
    this._serverDefinitions = /* @__PURE__ */ new Map();
    this._collectionDefinitions = this._register(new DisposableMap());
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
      start: /* @__PURE__ */ __name((_collection, serverDefiniton, resolveLaunch) => {
        const id = ++this._serverIdCounter;
        const launch = new ExtHostMcpServerLaunch(_extHostContext.extensionHostKind, () => proxy.$stopMcp(id), (msg) => proxy.$sendMessage(id, JSON.stringify(msg)));
        this._servers.set(id, launch);
        this._serverDefinitions.set(id, serverDefiniton);
        proxy.$startMcp(id, resolveLaunch);
        return launch;
      }, "start")
    }));
  }
  $upsertMcpCollection(collection, serversDto) {
    const servers = serversDto.map(McpServerDefinition.fromSerialized);
    const existing = this._collectionDefinitions.get(collection.id);
    if (existing) {
      existing.servers.set(servers, void 0);
    } else {
      const serverDefinitions = observableValue("mcpServers", servers);
      const handle = this._mcpRegistry.registerCollection({
        ...collection,
        resolveServerLanch: collection.canResolveLaunch ? async (def) => {
          const r = await this._proxy.$resolveMcpLaunch(collection.id, def.label);
          return r ? McpServerLaunch.fromSerialized(r) : void 0;
        } : void 0,
        remoteAuthority: this._extHostContext.remoteAuthority,
        serverDefinitions
      });
      this._collectionDefinitions.set(collection.id, {
        fromExtHost: collection,
        servers: serverDefinitions,
        dispose: /* @__PURE__ */ __name(() => handle.dispose(), "dispose")
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
  async $getTokenFromServerMetadata(id, authServerComponents, serverMetadata, resourceMetadata) {
    const server = this._serverDefinitions.get(id);
    if (!server) {
      return void 0;
    }
    const authorizationServer = URI.revive(authServerComponents);
    const scopesSupported = resourceMetadata?.scopes_supported || serverMetadata.scopes_supported || [];
    let providerId = await this._authenticationService.getOrActivateProviderIdForServer(authorizationServer);
    if (!providerId) {
      const provider2 = await this._authenticationService.createDynamicAuthenticationProvider(authorizationServer, serverMetadata, resourceMetadata);
      if (!provider2) {
        return void 0;
      }
      providerId = provider2.id;
    }
    const sessions = await this._authenticationService.getSessions(providerId, scopesSupported, { authorizationServer }, true);
    const accountNamePreference = this.authenticationMcpServersService.getAccountPreference(server.id, providerId);
    let matchingAccountPreferenceSession;
    if (accountNamePreference) {
      matchingAccountPreferenceSession = sessions.find((session2) => session2.account.label === accountNamePreference);
    }
    const provider = this._authenticationService.getProvider(providerId);
    let session;
    if (sessions.length) {
      if (matchingAccountPreferenceSession && this.authenticationMCPServerAccessService.isAccessAllowed(providerId, matchingAccountPreferenceSession.account.label, server.id)) {
        this._mcpRegistry.setAuthenticationUsage(server.id, providerId);
        return matchingAccountPreferenceSession.accessToken;
      }
      if (!provider.supportsMultipleAccounts && this.authenticationMCPServerAccessService.isAccessAllowed(providerId, sessions[0].account.label, server.id)) {
        this._mcpRegistry.setAuthenticationUsage(server.id, providerId);
        return sessions[0].accessToken;
      }
    }
    const isAllowed = await this.loginPrompt(server.label, provider.label, false);
    if (!isAllowed) {
      throw new Error("User did not consent to login.");
    }
    if (sessions.length) {
      session = provider.supportsMultipleAccounts ? await this.authenticationMcpServersService.selectSession(providerId, server.id, server.label, scopesSupported, sessions) : sessions[0];
    } else {
      const accountToCreate = matchingAccountPreferenceSession?.account;
      do {
        session = await this._authenticationService.createSession(providerId, scopesSupported, {
          activateImmediate: true,
          account: accountToCreate,
          authorizationServer
        });
      } while (accountToCreate && accountToCreate.label !== session.account.label && !await this.continueWithIncorrectAccountPrompt(session.account.label, accountToCreate.label));
    }
    this._mcpRegistry.setAuthenticationUsage(server.id, providerId);
    this.authenticationMCPServerAccessService.updateAllowedMcpServers(providerId, session.account.label, [{ id: server.id, name: server.label, allowed: true }]);
    this.authenticationMcpServersService.updateAccountPreference(server.id, providerId, session.account);
    this.authenticationMCPServerUsageService.addAccountUsage(providerId, session.account.label, scopesSupported, server.id, server.label);
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
  __param(6, IAuthenticationMcpUsageService)
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
export {
  MainThreadMcp
};
//# sourceMappingURL=mainThreadMcp.js.map
