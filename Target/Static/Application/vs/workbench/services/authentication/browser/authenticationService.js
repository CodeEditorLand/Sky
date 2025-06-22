var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableMap, DisposableStore, isDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { isString } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IAuthenticationAccessService } from "./authenticationAccessService.js";
import { IAuthenticationService } from "../common/authentication.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ExtensionsRegistry } from "../../extensions/common/extensionsRegistry.js";
import { match } from "../../../../base/common/glob.js";
import { raceCancellation, raceTimeout } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
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
function getAuthenticationProviderActivationEvent(id) {
  return `onAuthenticationRequest:${id}`;
}
__name(getAuthenticationProviderActivationEvent, "getAuthenticationProviderActivationEvent");
async function getCurrentAuthenticationSessionInfo(secretStorageService, productService) {
  const authenticationSessionValue = await secretStorageService.get(`${productService.urlProtocol}.loginAccount`);
  if (authenticationSessionValue) {
    try {
      const authenticationSessionInfo = JSON.parse(authenticationSessionValue);
      if (authenticationSessionInfo && isString(authenticationSessionInfo.id) && isString(authenticationSessionInfo.accessToken) && isString(authenticationSessionInfo.providerId)) {
        return authenticationSessionInfo;
      }
    } catch (e) {
      console.error(`Failed parsing current auth session value: ${e}`);
    }
  }
  return void 0;
}
__name(getCurrentAuthenticationSessionInfo, "getCurrentAuthenticationSessionInfo");
const authenticationDefinitionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: {
      type: "string",
      description: localize("authentication.id", "The id of the authentication provider.")
    },
    label: {
      type: "string",
      description: localize("authentication.label", "The human readable name of the authentication provider.")
    },
    authorizationServerGlobs: {
      type: "array",
      items: {
        type: "string",
        description: localize("authentication.authorizationServerGlobs", "A list of globs that match the authorization servers that this provider supports.")
      },
      description: localize("authentication.authorizationServerGlobsDescription", "A list of globs that match the authorization servers that this provider supports.")
    }
  }
};
const authenticationExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "authentication",
  jsonSchema: {
    description: localize({ key: "authenticationExtensionPoint", comment: [`'Contributes' means adds here`] }, "Contributes authentication"),
    type: "array",
    items: authenticationDefinitionSchema
  },
  activationEventsGenerator: /* @__PURE__ */ __name((authenticationProviders, result) => {
    for (const authenticationProvider of authenticationProviders) {
      if (authenticationProvider.id) {
        result.push(`onAuthenticationRequest:${authenticationProvider.id}`);
      }
    }
  }, "activationEventsGenerator")
});
let AuthenticationService = class AuthenticationService2 extends Disposable {
  static {
    __name(this, "AuthenticationService");
  }
  constructor(_extensionService, authenticationAccessService, _environmentService, _logService) {
    super();
    this._extensionService = _extensionService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this._onDidRegisterAuthenticationProvider = this._register(new Emitter());
    this.onDidRegisterAuthenticationProvider = this._onDidRegisterAuthenticationProvider.event;
    this._onDidUnregisterAuthenticationProvider = this._register(new Emitter());
    this.onDidUnregisterAuthenticationProvider = this._onDidUnregisterAuthenticationProvider.event;
    this._onDidChangeSessions = this._register(new Emitter());
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    this._onDidChangeDeclaredProviders = this._register(new Emitter());
    this.onDidChangeDeclaredProviders = this._onDidChangeDeclaredProviders.event;
    this._authenticationProviders = /* @__PURE__ */ new Map();
    this._authenticationProviderDisposables = this._register(new DisposableMap());
    this._dynamicAuthenticationProviderIds = /* @__PURE__ */ new Set();
    this._delegates = [];
    this._disposedSource = new CancellationTokenSource();
    this._declaredProviders = [];
    this._register(toDisposable(() => this._disposedSource.dispose(true)));
    this._register(authenticationAccessService.onDidChangeExtensionSessionAccess((e) => {
      this._onDidChangeSessions.fire({
        providerId: e.providerId,
        label: e.accountName,
        event: {
          added: [],
          changed: [],
          removed: []
        }
      });
    }));
    this._registerEnvContributedAuthenticationProviders();
    this._registerAuthenticationExtentionPointHandler();
  }
  get declaredProviders() {
    return this._declaredProviders;
  }
  _registerEnvContributedAuthenticationProviders() {
    if (!this._environmentService.options?.authenticationProviders?.length) {
      return;
    }
    for (const provider of this._environmentService.options.authenticationProviders) {
      this.registerDeclaredAuthenticationProvider(provider);
      this.registerAuthenticationProvider(provider.id, provider);
    }
  }
  _registerAuthenticationExtentionPointHandler() {
    this._register(authenticationExtPoint.setHandler((_extensions, { added, removed }) => {
      this._logService.debug(`Found authentication providers. added: ${added.length}, removed: ${removed.length}`);
      added.forEach((point) => {
        for (const provider of point.value) {
          if (isFalsyOrWhitespace(provider.id)) {
            point.collector.error(localize("authentication.missingId", "An authentication contribution must specify an id."));
            continue;
          }
          if (isFalsyOrWhitespace(provider.label)) {
            point.collector.error(localize("authentication.missingLabel", "An authentication contribution must specify a label."));
            continue;
          }
          if (!this.declaredProviders.some((p) => p.id === provider.id)) {
            this.registerDeclaredAuthenticationProvider(provider);
            this._logService.debug(`Declared authentication provider: ${provider.id}`);
          } else {
            point.collector.error(localize("authentication.idConflict", "This authentication id '{0}' has already been registered", provider.id));
          }
        }
      });
      const removedExtPoints = removed.flatMap((r) => r.value);
      removedExtPoints.forEach((point) => {
        const provider = this.declaredProviders.find((provider2) => provider2.id === point.id);
        if (provider) {
          this.unregisterDeclaredAuthenticationProvider(provider.id);
          this._logService.debug(`Undeclared authentication provider: ${provider.id}`);
        }
      });
    }));
  }
  registerDeclaredAuthenticationProvider(provider) {
    if (isFalsyOrWhitespace(provider.id)) {
      throw new Error(localize("authentication.missingId", "An authentication contribution must specify an id."));
    }
    if (isFalsyOrWhitespace(provider.label)) {
      throw new Error(localize("authentication.missingLabel", "An authentication contribution must specify a label."));
    }
    if (this.declaredProviders.some((p) => p.id === provider.id)) {
      throw new Error(localize("authentication.idConflict", "This authentication id '{0}' has already been registered", provider.id));
    }
    this._declaredProviders.push(provider);
    this._onDidChangeDeclaredProviders.fire();
  }
  unregisterDeclaredAuthenticationProvider(id) {
    const index = this.declaredProviders.findIndex((provider) => provider.id === id);
    if (index > -1) {
      this.declaredProviders.splice(index, 1);
    }
    this._onDidChangeDeclaredProviders.fire();
  }
  isAuthenticationProviderRegistered(id) {
    return this._authenticationProviders.has(id);
  }
  isDynamicAuthenticationProvider(id) {
    return this._dynamicAuthenticationProviderIds.has(id);
  }
  registerAuthenticationProvider(id, authenticationProvider) {
    this._authenticationProviders.set(id, authenticationProvider);
    const disposableStore = new DisposableStore();
    disposableStore.add(authenticationProvider.onDidChangeSessions((e) => this._onDidChangeSessions.fire({
      providerId: id,
      label: authenticationProvider.label,
      event: e
    })));
    if (isDisposable(authenticationProvider)) {
      disposableStore.add(authenticationProvider);
    }
    this._authenticationProviderDisposables.set(id, disposableStore);
    this._onDidRegisterAuthenticationProvider.fire({ id, label: authenticationProvider.label });
  }
  unregisterAuthenticationProvider(id) {
    const provider = this._authenticationProviders.get(id);
    if (provider) {
      this._authenticationProviders.delete(id);
      if (this._dynamicAuthenticationProviderIds.has(id)) {
        this._dynamicAuthenticationProviderIds.delete(id);
      }
      this._onDidUnregisterAuthenticationProvider.fire({ id, label: provider.label });
    }
    this._authenticationProviderDisposables.deleteAndDispose(id);
  }
  getProviderIds() {
    const providerIds = [];
    this._authenticationProviders.forEach((provider) => {
      providerIds.push(provider.id);
    });
    return providerIds;
  }
  getProvider(id) {
    if (this._authenticationProviders.has(id)) {
      return this._authenticationProviders.get(id);
    }
    throw new Error(`No authentication provider '${id}' is currently registered.`);
  }
  async getAccounts(id) {
    const sessions = await this.getSessions(id);
    const accounts = new Array();
    const seenAccounts = /* @__PURE__ */ new Set();
    for (const session of sessions) {
      if (!seenAccounts.has(session.account.label)) {
        seenAccounts.add(session.account.label);
        accounts.push(session.account);
      }
    }
    return accounts;
  }
  async getSessions(id, scopes, options, activateImmediate = false) {
    if (this._disposedSource.token.isCancellationRequested) {
      return [];
    }
    const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, activateImmediate);
    if (authProvider) {
      if (options?.authorizationServer) {
        const authServerStr = options.authorizationServer.toString(true);
        if (!authProvider.authorizationServers?.some((i) => i.toString(true) === authServerStr || match(i.toString(true), authServerStr))) {
          throw new Error(`The authorization server '${authServerStr}' is not supported by the authentication provider '${id}'.`);
        }
      }
      return await authProvider.getSessions(scopes, { ...options });
    } else {
      throw new Error(`No authentication provider '${id}' is currently registered.`);
    }
  }
  async createSession(id, scopes, options) {
    if (this._disposedSource.token.isCancellationRequested) {
      throw new Error("Authentication service is disposed.");
    }
    const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, !!options?.activateImmediate);
    if (authProvider) {
      return await authProvider.createSession(scopes, { ...options });
    } else {
      throw new Error(`No authentication provider '${id}' is currently registered.`);
    }
  }
  async removeSession(id, sessionId) {
    if (this._disposedSource.token.isCancellationRequested) {
      throw new Error("Authentication service is disposed.");
    }
    const authProvider = this._authenticationProviders.get(id);
    if (authProvider) {
      return authProvider.removeSession(sessionId);
    } else {
      throw new Error(`No authentication provider '${id}' is currently registered.`);
    }
  }
  async getOrActivateProviderIdForServer(authorizationServer) {
    for (const provider of this._authenticationProviders.values()) {
      if (provider.authorizationServers?.some((i) => i.toString(true) === authorizationServer.toString(true) || match(i.toString(true), authorizationServer.toString(true)))) {
        return provider.id;
      }
    }
    const authServerStr = authorizationServer.toString(true);
    const providers = this._declaredProviders.filter((p) => !this._authenticationProviders.has(p.id)).filter((p) => !!p.authorizationServerGlobs?.some((i) => match(i, authServerStr)));
    for (const provider of providers) {
      const activeProvider = await this.tryActivateProvider(provider.id, true);
      if (activeProvider.authorizationServers?.some((i) => match(i.toString(true), authServerStr))) {
        return activeProvider.id;
      }
    }
    return void 0;
  }
  async createDynamicAuthenticationProvider(authorizationServer, serverMetadata, resource) {
    const delegate = this._delegates[0];
    if (!delegate) {
      this._logService.error("No authentication provider host delegate found");
      return void 0;
    }
    const providerId = await delegate.create(authorizationServer, serverMetadata, resource);
    const provider = this._authenticationProviders.get(providerId);
    if (provider) {
      this._logService.debug(`Created dynamic authentication provider: ${providerId}`);
      this._dynamicAuthenticationProviderIds.add(providerId);
      return provider;
    }
    this._logService.error(`Failed to create dynamic authentication provider: ${providerId}`);
    return void 0;
  }
  registerAuthenticationProviderHostDelegate(delegate) {
    this._delegates.push(delegate);
    this._delegates.sort((a, b) => b.priority - a.priority);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const index = this._delegates.indexOf(delegate);
        if (index !== -1) {
          this._delegates.splice(index, 1);
        }
      }, "dispose")
    };
  }
  async tryActivateProvider(providerId, activateImmediate) {
    await this._extensionService.activateByEvent(
      getAuthenticationProviderActivationEvent(providerId),
      activateImmediate ? 1 : 0
      /* ActivationKind.Normal */
    );
    let provider = this._authenticationProviders.get(providerId);
    if (provider) {
      return provider;
    }
    if (this._disposedSource.token.isCancellationRequested) {
      throw new Error("Authentication service is disposed.");
    }
    const store = new DisposableStore();
    try {
      const result = await raceTimeout(raceCancellation(Event.toPromise(Event.filter(this.onDidRegisterAuthenticationProvider, (e) => e.id === providerId, store), store), this._disposedSource.token), 5e3);
      if (!result) {
        throw new Error(`Timed out waiting for authentication provider '${providerId}' to register.`);
      }
      provider = this._authenticationProviders.get(result.id);
      if (provider) {
        return provider;
      }
      throw new Error(`No authentication provider '${providerId}' is currently registered.`);
    } finally {
      store.dispose();
    }
  }
};
AuthenticationService = __decorate([
  __param(0, IExtensionService),
  __param(1, IAuthenticationAccessService),
  __param(2, IBrowserWorkbenchEnvironmentService),
  __param(3, ILogService)
], AuthenticationService);
registerSingleton(
  IAuthenticationService,
  AuthenticationService,
  1
  /* InstantiationType.Delayed */
);
export {
  AuthenticationService,
  getAuthenticationProviderActivationEvent,
  getCurrentAuthenticationSessionInfo
};
//# sourceMappingURL=authenticationService.js.map
