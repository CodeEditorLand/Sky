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
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IAuthenticationExtensionsService, IAuthenticationService } from "../../authentication/common/authentication.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { Barrier, RunOnceScheduler, ThrottledDelayer, timeout } from "../../../../base/common/async.js";
import { IHostService } from "../../host/browser/host.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { getErrorMessage } from "../../../../base/common/errors.js";
import { isString } from "../../../../base/common/types.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { isWeb } from "../../../../base/common/platform.js";
import { IDefaultAccountService } from "../../../../platform/defaultAccount/common/defaultAccount.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { distinct } from "../../../../base/common/arrays.js";
import { equals } from "../../../../base/common/objects.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
const DEFAULT_ACCOUNT_SIGN_IN_COMMAND = "workbench.actions.accounts.signIn";
var DefaultAccountStatus;
(function(DefaultAccountStatus2) {
  DefaultAccountStatus2["Uninitialized"] = "uninitialized";
  DefaultAccountStatus2["Unavailable"] = "unavailable";
  DefaultAccountStatus2["Available"] = "available";
})(DefaultAccountStatus || (DefaultAccountStatus = {}));
const CONTEXT_DEFAULT_ACCOUNT_STATE = new RawContextKey(
  "defaultAccountStatus",
  "uninitialized"
  /* DefaultAccountStatus.Uninitialized */
);
const CACHED_POLICY_DATA_KEY = "defaultAccount.cachedPolicyData";
const ACCOUNT_DATA_POLL_INTERVAL_MS = 15 * 60 * 1e3;
function toDefaultAccountConfig(defaultChatAgent) {
  return {
    preferredExtensions: [
      defaultChatAgent.chatExtensionId,
      defaultChatAgent.extensionId
    ],
    authenticationProvider: {
      default: {
        id: defaultChatAgent.provider.default.id,
        name: defaultChatAgent.provider.default.name
      },
      enterprise: {
        id: defaultChatAgent.provider.enterprise.id,
        name: defaultChatAgent.provider.enterprise.name
      },
      enterpriseProviderConfig: `${defaultChatAgent.completionsAdvancedSetting}.authProvider`,
      enterpriseProviderUriSetting: defaultChatAgent.providerUriSetting,
      scopes: defaultChatAgent.providerScopes
    },
    entitlementUrl: defaultChatAgent.entitlementUrl,
    tokenEntitlementUrl: defaultChatAgent.tokenEntitlementUrl,
    mcpRegistryDataUrl: defaultChatAgent.mcpRegistryDataUrl
  };
}
__name(toDefaultAccountConfig, "toDefaultAccountConfig");
let DefaultAccountService = class DefaultAccountService2 extends Disposable {
  static {
    __name(this, "DefaultAccountService");
  }
  get policyData() {
    return this.defaultAccountProvider?.policyData ?? null;
  }
  constructor(productService) {
    super();
    this.defaultAccount = null;
    this.initBarrier = new Barrier();
    this._onDidChangeDefaultAccount = this._register(new Emitter());
    this.onDidChangeDefaultAccount = this._onDidChangeDefaultAccount.event;
    this._onDidChangePolicyData = this._register(new Emitter());
    this.onDidChangePolicyData = this._onDidChangePolicyData.event;
    this.defaultAccountProvider = null;
    this.defaultAccountConfig = toDefaultAccountConfig(productService.defaultChatAgent);
  }
  async getDefaultAccount() {
    await this.initBarrier.wait();
    return this.defaultAccount;
  }
  getDefaultAccountAuthenticationProvider() {
    if (this.defaultAccountProvider) {
      return this.defaultAccountProvider.getDefaultAccountAuthenticationProvider();
    }
    return {
      ...this.defaultAccountConfig.authenticationProvider.default,
      enterprise: false
    };
  }
  setDefaultAccountProvider(provider) {
    if (this.defaultAccountProvider) {
      throw new Error("Default account provider is already set");
    }
    this.defaultAccountProvider = provider;
    if (this.defaultAccountProvider.policyData) {
      this._onDidChangePolicyData.fire(this.defaultAccountProvider.policyData);
    }
    provider.refresh().then((account) => {
      this.defaultAccount = account;
    }).finally(() => {
      this.initBarrier.open();
      this._register(provider.onDidChangeDefaultAccount((account) => this.setDefaultAccount(account)));
      this._register(provider.onDidChangePolicyData((policyData) => this._onDidChangePolicyData.fire(policyData)));
    });
  }
  async refresh() {
    await this.initBarrier.wait();
    const account = await this.defaultAccountProvider?.refresh();
    this.setDefaultAccount(account ?? null);
    return this.defaultAccount;
  }
  async signIn(options) {
    await this.initBarrier.wait();
    return this.defaultAccountProvider?.signIn(options) ?? null;
  }
  setDefaultAccount(account) {
    if (equals(this.defaultAccount, account)) {
      return;
    }
    this.defaultAccount = account;
    this._onDidChangeDefaultAccount.fire(this.defaultAccount);
  }
};
DefaultAccountService = __decorate([
  __param(0, IProductService)
], DefaultAccountService);
let DefaultAccountProvider = class DefaultAccountProvider2 extends Disposable {
  static {
    __name(this, "DefaultAccountProvider");
  }
  get defaultAccount() {
    return this._defaultAccount?.defaultAccount ?? null;
  }
  get policyData() {
    return this._policyData?.policyData ?? null;
  }
  constructor(defaultAccountConfig, configurationService, authenticationService, authenticationExtensionsService, telemetryService, extensionService, requestService, logService, environmentService, contextKeyService, storageService, hostService) {
    super();
    this.defaultAccountConfig = defaultAccountConfig;
    this.configurationService = configurationService;
    this.authenticationService = authenticationService;
    this.authenticationExtensionsService = authenticationExtensionsService;
    this.telemetryService = telemetryService;
    this.extensionService = extensionService;
    this.requestService = requestService;
    this.logService = logService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.hostService = hostService;
    this._defaultAccount = null;
    this._policyData = null;
    this._onDidChangeDefaultAccount = this._register(new Emitter());
    this.onDidChangeDefaultAccount = this._onDidChangeDefaultAccount.event;
    this._onDidChangePolicyData = this._register(new Emitter());
    this.onDidChangePolicyData = this._onDidChangePolicyData.event;
    this.initialized = false;
    this.updateThrottler = this._register(new ThrottledDelayer(100));
    this.accountDataPollScheduler = this._register(new RunOnceScheduler(() => this.updateDefaultAccount(), ACCOUNT_DATA_POLL_INTERVAL_MS));
    this.accountStatusContext = CONTEXT_DEFAULT_ACCOUNT_STATE.bindTo(contextKeyService);
    this._policyData = this.getCachedPolicyData();
    this.initPromise = this.init().finally(() => {
      this.telemetryService.publicLog2("defaultaccount:status", { status: this.defaultAccount ? "available" : "unavailable", initial: true });
      this.initialized = true;
    });
  }
  getCachedPolicyData() {
    const cached = this.storageService.get(
      CACHED_POLICY_DATA_KEY,
      -1
      /* StorageScope.APPLICATION */
    );
    if (cached) {
      try {
        const { accountId, policyData } = JSON.parse(cached);
        if (accountId && policyData) {
          this.logService.debug("[DefaultAccount] Initializing with cached policy data");
          return { accountId, policyData };
        }
      } catch (error) {
        this.logService.error("[DefaultAccount] Failed to parse cached policy data", getErrorMessage(error));
      }
    }
    return null;
  }
  async init() {
    if (isWeb && !this.environmentService.remoteAuthority) {
      this.logService.debug("[DefaultAccount] Running in web without remote, skipping initialization");
      return;
    }
    try {
      await this.extensionService.whenInstalledExtensionsRegistered();
      this.logService.debug("[DefaultAccount] Installed extensions registered.");
    } catch (error) {
      this.logService.error("[DefaultAccount] Error while waiting for installed extensions to be registered", getErrorMessage(error));
    }
    this.logService.debug("[DefaultAccount] Starting initialization");
    await this.doUpdateDefaultAccount();
    this.logService.debug("[DefaultAccount] Initialization complete");
    this._register(this.onDidChangeDefaultAccount((account) => {
      this.telemetryService.publicLog2("defaultaccount:status", { status: account ? "available" : "unavailable", initial: false });
    }));
    this._register(this.authenticationService.onDidChangeSessions((e) => {
      const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
      if (e.providerId !== defaultAccountProvider.id) {
        return;
      }
      if (this.defaultAccount && e.event.removed?.some((session) => session.id === this.defaultAccount?.sessionId)) {
        this.setDefaultAccount(null);
      } else {
        this.logService.debug("[DefaultAccount] Sessions changed for default account provider, updating default account");
        this.updateDefaultAccount();
      }
    }));
    this._register(this.authenticationExtensionsService.onDidChangeAccountPreference(async (e) => {
      const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
      if (e.providerId !== defaultAccountProvider.id) {
        return;
      }
      this.logService.debug("[DefaultAccount] Account preference changed for default account provider, updating default account");
      this.updateDefaultAccount();
    }));
    this._register(this.authenticationService.onDidRegisterAuthenticationProvider((e) => {
      const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
      if (e.id !== defaultAccountProvider.id) {
        return;
      }
      this.logService.debug("[DefaultAccount] Default account provider registered, updating default account");
      this.updateDefaultAccount();
    }));
    this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e) => {
      const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
      if (e.id !== defaultAccountProvider.id) {
        return;
      }
      this.logService.debug("[DefaultAccount] Default account provider unregistered, updating default account");
      this.updateDefaultAccount();
    }));
    this._register(this.hostService.onDidChangeFocus((focused) => {
      if (focused && this._defaultAccount) {
        this.accountDataPollScheduler.cancel();
        this.logService.debug("[DefaultAccount] Window focused, updating default account");
        this.updateDefaultAccount();
      }
    }));
  }
  async refresh() {
    if (!this.initialized) {
      await this.initPromise;
      return this.defaultAccount;
    }
    this.logService.debug("[DefaultAccount] Refreshing default account");
    await this.updateDefaultAccount();
    return this.defaultAccount;
  }
  async updateDefaultAccount() {
    await this.updateThrottler.trigger(() => this.doUpdateDefaultAccount());
  }
  async doUpdateDefaultAccount() {
    try {
      const defaultAccount = await this.fetchDefaultAccount();
      this.setDefaultAccount(defaultAccount);
      this.scheduleAccountDataPoll();
    } catch (error) {
      this.logService.error("[DefaultAccount] Error while updating default account", getErrorMessage(error));
    }
  }
  async fetchDefaultAccount() {
    const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
    this.logService.debug("[DefaultAccount] Default account provider ID:", defaultAccountProvider.id);
    const declaredProvider = this.authenticationService.declaredProviders.find((provider) => provider.id === defaultAccountProvider.id);
    if (!declaredProvider) {
      this.logService.info(`[DefaultAccount] Authentication provider is not declared.`, defaultAccountProvider);
      return null;
    }
    return await this.getDefaultAccountForAuthenticationProvider(defaultAccountProvider);
  }
  setDefaultAccount(account) {
    if (equals(this._defaultAccount, account)) {
      return;
    }
    this.logService.trace("[DefaultAccount] Updating default account:", account);
    if (account) {
      this._defaultAccount = account;
      this.setPolicyData(account.policyData);
      this._onDidChangeDefaultAccount.fire(this._defaultAccount.defaultAccount);
      this.accountStatusContext.set(
        "available"
        /* DefaultAccountStatus.Available */
      );
      this.logService.debug("[DefaultAccount] Account status set to Available");
    } else {
      this._defaultAccount = null;
      this.setPolicyData(null);
      this._onDidChangeDefaultAccount.fire(null);
      this.accountDataPollScheduler.cancel();
      this.accountStatusContext.set(
        "unavailable"
        /* DefaultAccountStatus.Unavailable */
      );
      this.logService.debug("[DefaultAccount] Account status set to Unavailable");
    }
  }
  setPolicyData(accountPolicyData) {
    if (equals(this._policyData, accountPolicyData)) {
      return;
    }
    this._policyData = accountPolicyData;
    this.cachePolicyData(accountPolicyData);
    this._onDidChangePolicyData.fire(this._policyData?.policyData ?? null);
  }
  cachePolicyData(accountPolicyData) {
    if (accountPolicyData) {
      this.logService.debug("[DefaultAccount] Caching policy data for account:", accountPolicyData.accountId);
      this.storageService.store(
        CACHED_POLICY_DATA_KEY,
        JSON.stringify(accountPolicyData),
        -1,
        1
        /* StorageTarget.MACHINE */
      );
    } else {
      this.logService.debug("[DefaultAccount] Removing cached policy data");
      this.storageService.remove(
        CACHED_POLICY_DATA_KEY,
        -1
        /* StorageScope.APPLICATION */
      );
    }
  }
  scheduleAccountDataPoll() {
    if (!this._defaultAccount) {
      return;
    }
    this.accountDataPollScheduler.schedule(ACCOUNT_DATA_POLL_INTERVAL_MS);
  }
  extractFromToken(token) {
    const result = /* @__PURE__ */ new Map();
    const firstPart = token?.split(":")[0];
    const fields = firstPart?.split(";");
    for (const field of fields) {
      const [key, value] = field.split("=");
      result.set(key, value);
    }
    this.logService.debug(`[DefaultAccount] extractFromToken: ${JSON.stringify(Object.fromEntries(result))}`);
    return result;
  }
  async getDefaultAccountForAuthenticationProvider(authenticationProvider) {
    try {
      this.logService.debug("[DefaultAccount] Getting Default Account from authenticated sessions for provider:", authenticationProvider.id);
      const sessions = await this.findMatchingProviderSession(authenticationProvider.id, this.defaultAccountConfig.authenticationProvider.scopes);
      if (!sessions?.length) {
        this.logService.debug("[DefaultAccount] No matching session found for provider:", authenticationProvider.id);
        return null;
      }
      return this.getDefaultAccountFromAuthenticatedSessions(authenticationProvider, sessions);
    } catch (error) {
      this.logService.error("[DefaultAccount] Failed to get default account for provider:", authenticationProvider.id, getErrorMessage(error));
      return null;
    }
  }
  async getDefaultAccountFromAuthenticatedSessions(authenticationProvider, sessions) {
    try {
      const accountId = sessions[0].account.id;
      const [entitlementsData, tokenEntitlementsData] = await Promise.all([
        this.getEntitlements(sessions),
        this.getTokenEntitlements(sessions)
      ]);
      let policyData = this._policyData?.accountId === accountId ? { ...this._policyData.policyData } : void 0;
      if (tokenEntitlementsData) {
        policyData = policyData ?? {};
        policyData.chat_agent_enabled = tokenEntitlementsData.chat_agent_enabled;
        policyData.chat_preview_features_enabled = tokenEntitlementsData.chat_preview_features_enabled;
        policyData.mcp = tokenEntitlementsData.mcp;
        if (policyData.mcp) {
          const mcpRegistryProvider = await this.getMcpRegistryProvider(sessions);
          if (mcpRegistryProvider) {
            policyData.mcpRegistryUrl = mcpRegistryProvider.url;
            policyData.mcpAccess = mcpRegistryProvider.registry_access;
          }
        }
      }
      const defaultAccount = {
        authenticationProvider,
        sessionId: sessions[0].id,
        enterprise: authenticationProvider.enterprise || sessions[0].account.label.includes("_"),
        entitlementsData
      };
      this.logService.debug("[DefaultAccount] Successfully created default account for provider:", authenticationProvider.id);
      return { defaultAccount, policyData: policyData ? { accountId, policyData } : null };
    } catch (error) {
      this.logService.error("[DefaultAccount] Failed to create default account for provider:", authenticationProvider.id, getErrorMessage(error));
      return null;
    }
  }
  async findMatchingProviderSession(authProviderId, allScopes) {
    const sessions = await this.getSessions(authProviderId);
    const matchingSessions = [];
    for (const session of sessions) {
      this.logService.debug("[DefaultAccount] Checking session with scopes", session.scopes);
      for (const scopes of allScopes) {
        if (this.scopesMatch(session.scopes, scopes)) {
          matchingSessions.push(session);
        }
      }
    }
    return matchingSessions.length > 0 ? matchingSessions : void 0;
  }
  async getSessions(authProviderId) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        let preferredAccount;
        let preferredAccountName;
        for (const preferredExtension of this.defaultAccountConfig.preferredExtensions) {
          preferredAccountName = this.authenticationExtensionsService.getAccountPreference(preferredExtension, authProviderId);
          if (preferredAccountName) {
            break;
          }
        }
        for (const account of await this.authenticationService.getAccounts(authProviderId)) {
          if (account.label === preferredAccountName) {
            preferredAccount = account;
            break;
          }
        }
        return await this.authenticationService.getSessions(authProviderId, void 0, { account: preferredAccount }, true);
      } catch (error) {
        this.logService.warn(`[DefaultAccount] Attempt ${attempt} to get sessions failed:`, getErrorMessage(error));
        if (attempt === 3) {
          throw error;
        }
        await timeout(500);
      }
    }
    throw new Error("Unable to get sessions after multiple attempts");
  }
  scopesMatch(scopes, expectedScopes) {
    return expectedScopes.every((scope) => scopes.includes(scope));
  }
  async getTokenEntitlements(sessions) {
    const tokenEntitlementsUrl = this.getTokenEntitlementUrl();
    if (!tokenEntitlementsUrl) {
      this.logService.debug("[DefaultAccount] No token entitlements URL found");
      return void 0;
    }
    this.logService.debug("[DefaultAccount] Fetching token entitlements from:", tokenEntitlementsUrl);
    const response = await this.request(tokenEntitlementsUrl, "GET", void 0, sessions, CancellationToken.None);
    if (!response) {
      return void 0;
    }
    if (response.res.statusCode && response.res.statusCode !== 200) {
      this.logService.trace(`[DefaultAccount] unexpected status code ${response.res.statusCode} while fetching token entitlements`);
      return void 0;
    }
    try {
      const chatData = await asJson(response);
      if (chatData) {
        const tokenMap = this.extractFromToken(chatData.token);
        return {
          // Editor preview features are disabled if the flag is present and set to 0
          chat_preview_features_enabled: tokenMap.get("editor_preview_features") !== "0",
          chat_agent_enabled: tokenMap.get("agent_mode") !== "0",
          // MCP is disabled if the flag is present and set to 0
          mcp: tokenMap.get("mcp") !== "0"
        };
      }
      this.logService.error("Failed to fetch token entitlements", "No data returned");
    } catch (error) {
      this.logService.error("Failed to fetch token entitlements", getErrorMessage(error));
    }
    return void 0;
  }
  async getEntitlements(sessions) {
    const entitlementUrl = this.getEntitlementUrl();
    if (!entitlementUrl) {
      this.logService.debug("[DefaultAccount] No chat entitlements URL found");
      return void 0;
    }
    this.logService.debug("[DefaultAccount] Fetching entitlements from:", entitlementUrl);
    const response = await this.request(entitlementUrl, "GET", void 0, sessions, CancellationToken.None);
    if (!response) {
      return void 0;
    }
    if (response.res.statusCode && response.res.statusCode !== 200) {
      this.logService.trace(`[DefaultAccount] unexpected status code ${response.res.statusCode} while fetching entitlements`);
      return response.res.statusCode === 401 || // oauth token being unavailable (expired/revoked)
      response.res.statusCode === 404 ? null : void 0;
    }
    try {
      const data = await asJson(response);
      if (data) {
        return data;
      }
      this.logService.error("[DefaultAccount] Failed to fetch entitlements", "No data returned");
    } catch (error) {
      this.logService.error("[DefaultAccount] Failed to fetch entitlements", getErrorMessage(error));
    }
    return void 0;
  }
  async getMcpRegistryProvider(sessions) {
    const mcpRegistryDataUrl = this.getMcpRegistryDataUrl();
    if (!mcpRegistryDataUrl) {
      this.logService.debug("[DefaultAccount] No MCP registry data URL found");
      return void 0;
    }
    this.logService.debug("[DefaultAccount] Fetching MCP registry data from:", mcpRegistryDataUrl);
    const response = await this.request(mcpRegistryDataUrl, "GET", void 0, sessions, CancellationToken.None);
    if (!response) {
      return void 0;
    }
    if (response.res.statusCode && response.res.statusCode !== 200) {
      this.logService.trace(`[DefaultAccount] unexpected status code ${response.res.statusCode} while fetching MCP registry data`);
      return void 0;
    }
    try {
      const data = await asJson(response);
      if (data) {
        this.logService.debug("Fetched MCP registry providers", data.mcp_registries);
        return data.mcp_registries[0];
      }
      this.logService.debug("Failed to fetch MCP registry providers", "No data returned");
    } catch (error) {
      this.logService.error("Failed to fetch MCP registry providers", getErrorMessage(error));
    }
    return void 0;
  }
  async request(url, type, body, sessions, token) {
    let lastResponse;
    for (const session of sessions) {
      if (token.isCancellationRequested) {
        return lastResponse;
      }
      try {
        const response = await this.requestService.request({
          type,
          url,
          data: type === "POST" ? JSON.stringify(body) : void 0,
          disableCache: true,
          headers: {
            "Authorization": `Bearer ${session.accessToken}`
          }
        }, token);
        const status = response.res.statusCode;
        if (status && status !== 200) {
          lastResponse = response;
          continue;
        }
        return response;
      } catch (error) {
        if (!token.isCancellationRequested) {
          this.logService.error(`[chat entitlement] request: error ${error}`);
        }
      }
    }
    if (!lastResponse) {
      this.logService.trace("[DefaultAccount]: No response received for request", url);
      return void 0;
    }
    if (lastResponse.res.statusCode && lastResponse.res.statusCode !== 200) {
      this.logService.trace(`[DefaultAccount]: unexpected status code ${lastResponse.res.statusCode} for request`, url);
      return void 0;
    }
    return lastResponse;
  }
  getEntitlementUrl() {
    if (this.getDefaultAccountAuthenticationProvider().enterprise) {
      try {
        const enterpriseUrl = this.getEnterpriseUrl();
        if (!enterpriseUrl) {
          return void 0;
        }
        return `${enterpriseUrl.protocol}//api.${enterpriseUrl.hostname}${enterpriseUrl.port ? ":" + enterpriseUrl.port : ""}/copilot_internal/user`;
      } catch (error) {
        this.logService.error(error);
      }
    }
    return this.defaultAccountConfig.entitlementUrl;
  }
  getTokenEntitlementUrl() {
    if (this.getDefaultAccountAuthenticationProvider().enterprise) {
      try {
        const enterpriseUrl = this.getEnterpriseUrl();
        if (!enterpriseUrl) {
          return void 0;
        }
        return `${enterpriseUrl.protocol}//api.${enterpriseUrl.hostname}${enterpriseUrl.port ? ":" + enterpriseUrl.port : ""}/copilot_internal/v2/token`;
      } catch (error) {
        this.logService.error(error);
      }
    }
    return this.defaultAccountConfig.tokenEntitlementUrl;
  }
  getMcpRegistryDataUrl() {
    if (this.getDefaultAccountAuthenticationProvider().enterprise) {
      try {
        const enterpriseUrl = this.getEnterpriseUrl();
        if (!enterpriseUrl) {
          return void 0;
        }
        return `${enterpriseUrl.protocol}//api.${enterpriseUrl.hostname}${enterpriseUrl.port ? ":" + enterpriseUrl.port : ""}/copilot/mcp_registry`;
      } catch (error) {
        this.logService.error(error);
      }
    }
    return this.defaultAccountConfig.mcpRegistryDataUrl;
  }
  getDefaultAccountAuthenticationProvider() {
    if (this.configurationService.getValue(this.defaultAccountConfig.authenticationProvider.enterpriseProviderConfig) === this.defaultAccountConfig.authenticationProvider.enterprise.id) {
      return {
        ...this.defaultAccountConfig.authenticationProvider.enterprise,
        enterprise: true
      };
    }
    return {
      ...this.defaultAccountConfig.authenticationProvider.default,
      enterprise: false
    };
  }
  getEnterpriseUrl() {
    const value = this.configurationService.getValue(this.defaultAccountConfig.authenticationProvider.enterpriseProviderUriSetting);
    if (!isString(value)) {
      return void 0;
    }
    return new URL(value);
  }
  async signIn(options) {
    const authProvider = this.getDefaultAccountAuthenticationProvider();
    if (!authProvider) {
      throw new Error("No default account provider configured");
    }
    const { additionalScopes, ...sessionOptions } = options ?? {};
    const defaultAccountScopes = this.defaultAccountConfig.authenticationProvider.scopes[0];
    const scopes = additionalScopes ? distinct([...defaultAccountScopes, ...additionalScopes]) : defaultAccountScopes;
    const session = await this.authenticationService.createSession(authProvider.id, scopes, sessionOptions);
    for (const preferredExtension of this.defaultAccountConfig.preferredExtensions) {
      this.authenticationExtensionsService.updateAccountPreference(preferredExtension, authProvider.id, session.account);
    }
    await this.updateDefaultAccount();
    return this.defaultAccount;
  }
};
DefaultAccountProvider = __decorate([
  __param(1, IConfigurationService),
  __param(2, IAuthenticationService),
  __param(3, IAuthenticationExtensionsService),
  __param(4, ITelemetryService),
  __param(5, IExtensionService),
  __param(6, IRequestService),
  __param(7, ILogService),
  __param(8, IWorkbenchEnvironmentService),
  __param(9, IContextKeyService),
  __param(10, IStorageService),
  __param(11, IHostService)
], DefaultAccountProvider);
let DefaultAccountProviderContribution = class DefaultAccountProviderContribution2 extends Disposable {
  static {
    __name(this, "DefaultAccountProviderContribution");
  }
  static {
    this.ID = "workbench.contributions.defaultAccountProvider";
  }
  constructor(productService, instantiationService, defaultAccountService) {
    super();
    const defaultAccountProvider = this._register(instantiationService.createInstance(DefaultAccountProvider, toDefaultAccountConfig(productService.defaultChatAgent)));
    defaultAccountService.setDefaultAccountProvider(defaultAccountProvider);
  }
};
DefaultAccountProviderContribution = __decorate([
  __param(0, IProductService),
  __param(1, IInstantiationService),
  __param(2, IDefaultAccountService)
], DefaultAccountProviderContribution);
registerWorkbenchContribution2(
  DefaultAccountProviderContribution.ID,
  DefaultAccountProviderContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
export {
  DEFAULT_ACCOUNT_SIGN_IN_COMMAND,
  DefaultAccountService
};
//# sourceMappingURL=defaultAccount.js.map
