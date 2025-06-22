var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IDynamicAuthenticationProviderStorageService } from "../common/dynamicAuthenticationProviderStorage.js";
import { ISecretStorageService } from "../../../../platform/secrets/common/secrets.js";
import { isAuthorizationTokenResponse } from "../../../../base/common/oauth.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Queue } from "../../../../base/common/async.js";
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
var DynamicAuthenticationProviderStorageService_1;
let DynamicAuthenticationProviderStorageService = class DynamicAuthenticationProviderStorageService2 extends Disposable {
  static {
    __name(this, "DynamicAuthenticationProviderStorageService");
  }
  static {
    DynamicAuthenticationProviderStorageService_1 = this;
  }
  static {
    this.PROVIDERS_STORAGE_KEY = "dynamicAuthProviders";
  }
  constructor(storageService, secretStorageService, logService) {
    super();
    this.storageService = storageService;
    this.secretStorageService = secretStorageService;
    this.logService = logService;
    this._onDidChangeTokens = this._register(new Emitter());
    this.onDidChangeTokens = this._onDidChangeTokens.event;
    const queue = new Queue();
    this._register(this.secretStorageService.onDidChangeSecret(async (key) => {
      let payload;
      try {
        payload = JSON.parse(key);
      } catch (error) {
      }
      if (payload?.isDynamicAuthProvider) {
        void queue.queue(async () => {
          const tokens = await this.getSessionsForDynamicAuthProvider(payload.authProviderId, payload.clientId);
          this._onDidChangeTokens.fire({
            authProviderId: payload.authProviderId,
            clientId: payload.clientId,
            tokens
          });
        });
      }
    }));
  }
  getClientId(providerId) {
    const providers = this._getStoredProviders();
    const provider = providers.find((p) => p.providerId === providerId);
    return provider?.clientId;
  }
  storeClientId(providerId, authorizationServer, clientId, label) {
    this._trackProvider(providerId, authorizationServer, clientId, label);
  }
  _trackProvider(providerId, authorizationServer, clientId, label) {
    const providers = this._getStoredProviders();
    const existingProviderIndex = providers.findIndex((p) => p.providerId === providerId);
    if (existingProviderIndex === -1) {
      const newProvider = {
        providerId,
        label: label || providerId,
        // Use provided label or providerId as default
        authorizationServer,
        clientId
      };
      providers.push(newProvider);
      this._storeProviders(providers);
    } else {
      const existingProvider = providers[existingProviderIndex];
      const updatedProvider = {
        providerId,
        label: label || existingProvider.label,
        authorizationServer,
        clientId
      };
      providers[existingProviderIndex] = updatedProvider;
      this._storeProviders(providers);
    }
  }
  _getStoredProviders() {
    const stored = this.storageService.get(DynamicAuthenticationProviderStorageService_1.PROVIDERS_STORAGE_KEY, -1, "[]");
    try {
      const providerInfos = JSON.parse(stored);
      for (const providerInfo of providerInfos) {
        if (!providerInfo.authorizationServer) {
          providerInfo.authorizationServer = providerInfo.issuer;
        }
      }
      return providerInfos;
    } catch {
      return [];
    }
  }
  _storeProviders(providers) {
    this.storageService.store(
      DynamicAuthenticationProviderStorageService_1.PROVIDERS_STORAGE_KEY,
      JSON.stringify(providers),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  getInteractedProviders() {
    return this._getStoredProviders();
  }
  async removeDynamicProvider(providerId) {
    const providers = this._getStoredProviders();
    const providerInfo = providers.find((p) => p.providerId === providerId);
    const filteredProviders = providers.filter((p) => p.providerId !== providerId);
    this._storeProviders(filteredProviders);
    if (providerInfo) {
      const secretKey = JSON.stringify({ isDynamicAuthProvider: true, authProviderId: providerId, clientId: providerInfo.clientId });
      await this.secretStorageService.delete(secretKey);
    }
  }
  async getSessionsForDynamicAuthProvider(authProviderId, clientId) {
    const key = JSON.stringify({ isDynamicAuthProvider: true, authProviderId, clientId });
    const value = await this.secretStorageService.get(key);
    if (value) {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed) || !parsed.every((t) => typeof t.created_at === "number" && isAuthorizationTokenResponse(t))) {
        this.logService.error(`Invalid session data for ${authProviderId} (${clientId}) in secret storage:`, parsed);
        await this.secretStorageService.delete(key);
        return void 0;
      }
      return parsed;
    }
    return void 0;
  }
  async setSessionsForDynamicAuthProvider(authProviderId, clientId, sessions) {
    const key = JSON.stringify({ isDynamicAuthProvider: true, authProviderId, clientId });
    const value = JSON.stringify(sessions);
    await this.secretStorageService.set(key, value);
    this.logService.trace(`Set session data for ${authProviderId} (${clientId}) in secret storage:`, sessions);
  }
};
DynamicAuthenticationProviderStorageService = DynamicAuthenticationProviderStorageService_1 = __decorate([
  __param(0, IStorageService),
  __param(1, ISecretStorageService),
  __param(2, ILogService)
], DynamicAuthenticationProviderStorageService);
registerSingleton(
  IDynamicAuthenticationProviderStorageService,
  DynamicAuthenticationProviderStorageService,
  1
  /* InstantiationType.Delayed */
);
export {
  DynamicAuthenticationProviderStorageService
};
//# sourceMappingURL=dynamicAuthenticationProviderStorageService.js.map
