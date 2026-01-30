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
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { localize } from "../../../../nls.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { Barrier, timeout } from "../../../../base/common/async.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { getErrorMessage } from "../../../../base/common/errors.js";
import { isString } from "../../../../base/common/types.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { isWeb } from "../../../../base/common/platform.js";
import { IDefaultAccountService } from "../../../../platform/defaultAccount/common/defaultAccount.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { distinct } from "../../../../base/common/arrays.js";
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
class DefaultAccountService extends Disposable {
  static {
    __name(this, "DefaultAccountService");
  }
  constructor() {
    super(...arguments);
    this._defaultAccount = void 0;
    this.initBarrier = new Barrier();
    this._onDidChangeDefaultAccount = this._register(new Emitter());
    this.onDidChangeDefaultAccount = this._onDidChangeDefaultAccount.event;
  }
  get defaultAccount() {
    return this._defaultAccount ?? null;
  }
  async getDefaultAccount() {
    await this.initBarrier.wait();
    return this.defaultAccount;
  }
  setDefaultAccount(account) {
    const oldAccount = this._defaultAccount;
    this._defaultAccount = account;
    if (oldAccount !== this._defaultAccount) {
      this._onDidChangeDefaultAccount.fire(this._defaultAccount);
    }
    this.initBarrier.open();
  }
}
let DefaultAccountSetup = class DefaultAccountSetup2 extends Disposable {
  static {
    __name(this, "DefaultAccountSetup");
  }
  constructor(defaultAccountConfig, defaultAccountService, configurationService, authenticationService, authenticationExtensionsService, telemetryService, extensionService, requestService, logService, environmentService, contextKeyService) {
    super();
    this.defaultAccountConfig = defaultAccountConfig;
    this.defaultAccountService = defaultAccountService;
    this.configurationService = configurationService;
    this.authenticationService = authenticationService;
    this.authenticationExtensionsService = authenticationExtensionsService;
    this.telemetryService = telemetryService;
    this.extensionService = extensionService;
    this.requestService = requestService;
    this.logService = logService;
    this.environmentService = environmentService;
    this.defaultAccount = null;
    this.accountStatusContext = CONTEXT_DEFAULT_ACCOUNT_STATE.bindTo(contextKeyService);
  }
  async setup() {
    this.logService.debug("[DefaultAccount] Starting initialization");
    let defaultAccount = null;
    try {
      defaultAccount = await this.fetchDefaultAccount();
    } catch (error) {
      this.logService.error("[DefaultAccount] Error during initialization", getErrorMessage(error));
    }
    this.setDefaultAccount(defaultAccount);
    this.logService.debug("[DefaultAccount] Initialization complete");
    this.telemetryService.publicLog2("defaultaccount:status", { status: this.defaultAccount ? "available" : "unavailable", initial: true });
    this._register(this.defaultAccountService.onDidChangeDefaultAccount((account) => {
      this.telemetryService.publicLog2("defaultaccount:status", { status: account ? "available" : "unavailable", initial: false });
    }));
    this._register(this.authenticationService.onDidChangeSessions(async (e) => {
      if (e.providerId !== this.getDefaultAccountProviderId()) {
        return;
      }
      if (this.defaultAccount && e.event.removed?.some((session) => session.id === this.defaultAccount?.sessionId)) {
        this.setDefaultAccount(null);
      } else {
        this.setDefaultAccount(await this.getDefaultAccountFromAuthenticatedSessions(e.providerId, this.defaultAccountConfig.authenticationProvider.scopes));
      }
    }));
    this._register(this.authenticationExtensionsService.onDidChangeAccountPreference(async (e) => {
      if (e.providerId !== this.getDefaultAccountProviderId()) {
        return;
      }
      this.setDefaultAccount(await this.getDefaultAccountFromAuthenticatedSessions(e.providerId, this.defaultAccountConfig.authenticationProvider.scopes));
    }));
  }
  async fetchDefaultAccount() {
    if (isWeb && !this.environmentService.remoteAuthority) {
      this.logService.debug("[DefaultAccount] Running in web without remote, skipping initialization");
      return null;
    }
    const defaultAccountProviderId = this.getDefaultAccountProviderId();
    this.logService.debug("[DefaultAccount] Default account provider ID:", defaultAccountProviderId);
    if (!defaultAccountProviderId) {
      return null;
    }
    await this.extensionService.whenInstalledExtensionsRegistered();
    this.logService.debug("[DefaultAccount] Installed extensions registered.");
    const declaredProvider = this.authenticationService.declaredProviders.find((provider) => provider.id === defaultAccountProviderId);
    if (!declaredProvider) {
      this.logService.info(`[DefaultAccount] Authentication provider is not declared.`, defaultAccountProviderId);
      return null;
    }
    this.registerSignInAction(this.defaultAccountConfig.authenticationProvider.scopes[0]);
    return await this.getDefaultAccountFromAuthenticatedSessions(defaultAccountProviderId, this.defaultAccountConfig.authenticationProvider.scopes);
  }
  setDefaultAccount(account) {
    this.defaultAccount = account;
    this.defaultAccountService.setDefaultAccount(this.defaultAccount);
    if (this.defaultAccount) {
      this.accountStatusContext.set(
        "available"
        /* DefaultAccountStatus.Available */
      );
      this.logService.debug("[DefaultAccount] Account status set to Available");
    } else {
      this.accountStatusContext.set(
        "unavailable"
        /* DefaultAccountStatus.Unavailable */
      );
      this.logService.debug("[DefaultAccount] Account status set to Unavailable");
    }
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
  async getDefaultAccountFromAuthenticatedSessions(authProviderId, scopes) {
    try {
      this.logService.debug("[DefaultAccount] Getting Default Account from authenticated sessions for provider:", authProviderId);
      const session = await this.findMatchingProviderSession(authProviderId, scopes);
      if (!session) {
        this.logService.debug("[DefaultAccount] No matching session found for provider:", authProviderId);
        return null;
      }
      const [chatEntitlements, tokenEntitlements] = await Promise.all([
        this.getChatEntitlements(session.accessToken),
        this.getTokenEntitlements(session.accessToken)
      ]);
      const mcpRegistryProvider = tokenEntitlements.mcp ? await this.getMcpRegistryProvider(session.accessToken) : void 0;
      const account = {
        sessionId: session.id,
        enterprise: this.isEnterpriseAuthenticationProvider(authProviderId) || session.account.label.includes("_"),
        ...chatEntitlements,
        ...tokenEntitlements,
        mcpRegistryUrl: mcpRegistryProvider?.url,
        mcpAccess: mcpRegistryProvider?.registry_access
      };
      this.logService.debug("[DefaultAccount] Successfully created default account for provider:", authProviderId);
      return account;
    } catch (error) {
      this.logService.error("[DefaultAccount] Failed to create default account for provider:", authProviderId, getErrorMessage(error));
      return null;
    }
  }
  async findMatchingProviderSession(authProviderId, allScopes) {
    const sessions = await this.getSessions(authProviderId);
    for (const session of sessions) {
      this.logService.debug("[DefaultAccount] Checking session with scopes", session.scopes);
      for (const scopes of allScopes) {
        if (this.scopesMatch(session.scopes, scopes)) {
          return session;
        }
      }
    }
    return void 0;
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
  async getTokenEntitlements(accessToken) {
    const tokenEntitlementsUrl = this.getTokenEntitlementUrl();
    if (!tokenEntitlementsUrl) {
      this.logService.debug("[DefaultAccount] No token entitlements URL found");
      return {};
    }
    this.logService.debug("[DefaultAccount] Fetching token entitlements from:", tokenEntitlementsUrl);
    try {
      const chatContext = await this.requestService.request({
        type: "GET",
        url: tokenEntitlementsUrl,
        disableCache: true,
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      }, CancellationToken.None);
      const chatData = await asJson(chatContext);
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
    return {};
  }
  async getChatEntitlements(accessToken) {
    const chatEntitlementsUrl = this.getChatEntitlementUrl();
    if (!chatEntitlementsUrl) {
      this.logService.debug("[DefaultAccount] No chat entitlements URL found");
      return {};
    }
    this.logService.debug("[DefaultAccount] Fetching chat entitlements from:", chatEntitlementsUrl);
    try {
      const context = await this.requestService.request({
        type: "GET",
        url: chatEntitlementsUrl,
        disableCache: true,
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      }, CancellationToken.None);
      const data = await asJson(context);
      if (data) {
        return data;
      }
      this.logService.error("Failed to fetch entitlements", "No data returned");
    } catch (error) {
      this.logService.error("Failed to fetch entitlements", getErrorMessage(error));
    }
    return {};
  }
  async getMcpRegistryProvider(accessToken) {
    const mcpRegistryDataUrl = this.getMcpRegistryDataUrl();
    if (!mcpRegistryDataUrl) {
      this.logService.debug("[DefaultAccount] No MCP registry data URL found");
      return void 0;
    }
    try {
      const context = await this.requestService.request({
        type: "GET",
        url: mcpRegistryDataUrl,
        disableCache: true,
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      }, CancellationToken.None);
      const data = await asJson(context);
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
  getChatEntitlementUrl() {
    if (this.isEnterpriseAuthenticationProvider(this.getDefaultAccountProviderId())) {
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
    return this.defaultAccountConfig.chatEntitlementUrl;
  }
  getTokenEntitlementUrl() {
    if (this.isEnterpriseAuthenticationProvider(this.getDefaultAccountProviderId())) {
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
    if (this.isEnterpriseAuthenticationProvider(this.getDefaultAccountProviderId())) {
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
  getDefaultAccountProviderId() {
    if (this.configurationService.getValue(this.defaultAccountConfig.authenticationProvider.enterpriseProviderConfig) === this.defaultAccountConfig?.authenticationProvider.enterpriseProviderId) {
      return this.defaultAccountConfig.authenticationProvider.enterpriseProviderId;
    }
    return this.defaultAccountConfig.authenticationProvider.id;
  }
  isEnterpriseAuthenticationProvider(providerId) {
    return providerId === this.defaultAccountConfig.authenticationProvider.enterpriseProviderId;
  }
  getEnterpriseUrl() {
    const value = this.configurationService.getValue(this.defaultAccountConfig.authenticationProvider.enterpriseProviderUriSetting);
    if (!isString(value)) {
      return void 0;
    }
    return new URL(value);
  }
  registerSignInAction(defaultAccountScopes) {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: DEFAULT_ACCOUNT_SIGN_IN_COMMAND,
          title: localize("sign in", "Sign in")
        });
      }
      async run(accessor, options) {
        const authProviderId = that.getDefaultAccountProviderId();
        if (!authProviderId) {
          throw new Error("No default account provider configured");
        }
        const { additionalScopes, ...sessionOptions } = options ?? {};
        const scopes = additionalScopes ? distinct([...defaultAccountScopes, ...additionalScopes]) : defaultAccountScopes;
        const session = await that.authenticationService.createSession(authProviderId, scopes, sessionOptions);
        for (const preferredExtension of that.defaultAccountConfig.preferredExtensions) {
          that.authenticationExtensionsService.updateAccountPreference(preferredExtension, authProviderId, session.account);
        }
      }
    }));
  }
};
DefaultAccountSetup = __decorate([
  __param(1, IDefaultAccountService),
  __param(2, IConfigurationService),
  __param(3, IAuthenticationService),
  __param(4, IAuthenticationExtensionsService),
  __param(5, ITelemetryService),
  __param(6, IExtensionService),
  __param(7, IRequestService),
  __param(8, ILogService),
  __param(9, IWorkbenchEnvironmentService),
  __param(10, IContextKeyService)
], DefaultAccountSetup);
let DefaultAccountSetupContribution = class DefaultAccountSetupContribution2 extends Disposable {
  static {
    __name(this, "DefaultAccountSetupContribution");
  }
  static {
    this.ID = "workbench.contributions.defaultAccountSetup";
  }
  constructor(productService, instantiationService, defaultAccountService, logService) {
    super();
    if (productService.defaultAccount) {
      this._register(instantiationService.createInstance(DefaultAccountSetup, productService.defaultAccount)).setup();
    } else {
      defaultAccountService.setDefaultAccount(null);
      logService.debug("[DefaultAccount] No default account configuration in product service, skipping initialization");
    }
  }
};
DefaultAccountSetupContribution = __decorate([
  __param(0, IProductService),
  __param(1, IInstantiationService),
  __param(2, IDefaultAccountService),
  __param(3, ILogService)
], DefaultAccountSetupContribution);
registerWorkbenchContribution2(
  "workbench.contributions.defaultAccountManagement",
  DefaultAccountSetupContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
export {
  DEFAULT_ACCOUNT_SIGN_IN_COMMAND,
  DefaultAccountService
};
//# sourceMappingURL=defaultAccount.js.map
