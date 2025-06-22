var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IAuthenticationService } from "../../authentication/common/authentication.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { localize } from "../../../../nls.js";
import { Barrier } from "../../../../base/common/async.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { getErrorMessage } from "../../../../base/common/errors.js";
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
const IDefaultAccountService = createDecorator("defaultAccountService");
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
class NullDefaultAccountService extends Disposable {
  static {
    __name(this, "NullDefaultAccountService");
  }
  constructor() {
    super(...arguments);
    this.onDidChangeDefaultAccount = Event.None;
  }
  async getDefaultAccount() {
    return null;
  }
  setDefaultAccount(account) {
  }
}
let DefaultAccountManagementContribution = class DefaultAccountManagementContribution2 extends Disposable {
  static {
    __name(this, "DefaultAccountManagementContribution");
  }
  static {
    this.ID = "workbench.contributions.defaultAccountManagement";
  }
  constructor(defaultAccountService, configurationService, authenticationService, extensionService, productService, requestService, logService, contextKeyService) {
    super();
    this.defaultAccountService = defaultAccountService;
    this.configurationService = configurationService;
    this.authenticationService = authenticationService;
    this.extensionService = extensionService;
    this.productService = productService;
    this.requestService = requestService;
    this.logService = logService;
    this.defaultAccount = null;
    this.accountStatusContext = CONTEXT_DEFAULT_ACCOUNT_STATE.bindTo(contextKeyService);
    this.initialize();
  }
  async initialize() {
    if (!this.productService.defaultAccount) {
      return;
    }
    const { authenticationProvider, tokenEntitlementUrl, chatEntitlementUrl } = this.productService.defaultAccount;
    await this.extensionService.whenInstalledExtensionsRegistered();
    const declaredProvider = this.authenticationService.declaredProviders.find((provider) => provider.id === authenticationProvider.id);
    if (!declaredProvider) {
      this.logService.info(`Default account authentication provider ${authenticationProvider} is not declared.`);
      return;
    }
    this.registerSignInAction(authenticationProvider.id, declaredProvider.label, authenticationProvider.enterpriseProviderId, authenticationProvider.enterpriseProviderConfig, authenticationProvider.scopes);
    this.setDefaultAccount(await this.getDefaultAccountFromAuthenticatedSessions(authenticationProvider.id, authenticationProvider.enterpriseProviderId, authenticationProvider.enterpriseProviderConfig, authenticationProvider.scopes, tokenEntitlementUrl, chatEntitlementUrl));
    this._register(this.authenticationService.onDidChangeSessions(async (e) => {
      if (e.providerId !== authenticationProvider.id && e.providerId !== authenticationProvider.enterpriseProviderId) {
        return;
      }
      if (this.defaultAccount && e.event.removed?.some((session) => session.id === this.defaultAccount?.sessionId)) {
        this.setDefaultAccount(null);
        return;
      }
      this.setDefaultAccount(await this.getDefaultAccountFromAuthenticatedSessions(authenticationProvider.id, authenticationProvider.enterpriseProviderId, authenticationProvider.enterpriseProviderConfig, authenticationProvider.scopes, tokenEntitlementUrl, chatEntitlementUrl));
    }));
  }
  setDefaultAccount(account) {
    this.defaultAccount = account;
    this.defaultAccountService.setDefaultAccount(this.defaultAccount);
    if (this.defaultAccount) {
      this.accountStatusContext.set(
        "available"
        /* DefaultAccountStatus.Available */
      );
    } else {
      this.accountStatusContext.set(
        "unavailable"
        /* DefaultAccountStatus.Unavailable */
      );
    }
  }
  extractFromToken(token, key) {
    const result = /* @__PURE__ */ new Map();
    const firstPart = token?.split(":")[0];
    const fields = firstPart?.split(";");
    for (const field of fields) {
      const [key2, value] = field.split("=");
      result.set(key2, value);
    }
    return result.get(key);
  }
  async getDefaultAccountFromAuthenticatedSessions(authProviderId, enterpriseAuthProviderId, enterpriseAuthProviderConfig, scopes, tokenEntitlementUrl, chatEntitlementUrl) {
    const id = this.configurationService.getValue(enterpriseAuthProviderConfig) === enterpriseAuthProviderId ? enterpriseAuthProviderId : authProviderId;
    const sessions = await this.authenticationService.getSessions(id, void 0, void 0, true);
    const session = sessions.find((s) => this.scopesMatch(s.scopes, scopes));
    if (!session) {
      return null;
    }
    const [chatEntitlements, tokenEntitlements] = await Promise.all([
      this.getChatEntitlements(session.accessToken, chatEntitlementUrl),
      this.getTokenEntitlements(session.accessToken, tokenEntitlementUrl)
    ]);
    return {
      sessionId: session.id,
      enterprise: id === enterpriseAuthProviderId || session.account.label.includes("_"),
      ...chatEntitlements,
      ...tokenEntitlements
    };
  }
  scopesMatch(scopes, expectedScopes) {
    return scopes.length === expectedScopes.length && expectedScopes.every((scope) => scopes.includes(scope));
  }
  async getTokenEntitlements(accessToken, tokenEntitlementsUrl) {
    if (!tokenEntitlementsUrl) {
      return {};
    }
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
        return {
          // Editor preview features are disabled if the flag is present and set to 0
          chat_preview_features_enabled: this.extractFromToken(chatData.token, "editor_preview_features") !== "0"
        };
      }
      this.logService.error("Failed to fetch token entitlements", "No data returned");
    } catch (error) {
      this.logService.error("Failed to fetch token entitlements", getErrorMessage(error));
    }
    return {};
  }
  async getChatEntitlements(accessToken, chatEntitlementsUrl) {
    if (!chatEntitlementsUrl) {
      return {};
    }
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
  registerSignInAction(authProviderId, authProviderLabel, enterpriseAuthProviderId, enterpriseAuthProviderConfig, scopes) {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.accounts.actions.signin",
          title: localize("sign in", "Sign in to {0}", authProviderLabel),
          menu: {
            id: MenuId.AccountsContext,
            when: ContextKeyExpr.and(CONTEXT_DEFAULT_ACCOUNT_STATE.isEqualTo(
              "unavailable"
              /* DefaultAccountStatus.Unavailable */
            ), ContextKeyExpr.has("config.extensions.gallery.serviceUrl")),
            group: "0_signin"
          }
        });
      }
      run() {
        const id = that.configurationService.getValue(enterpriseAuthProviderConfig) === enterpriseAuthProviderId ? enterpriseAuthProviderId : authProviderId;
        return that.authenticationService.createSession(id, scopes);
      }
    }));
  }
};
DefaultAccountManagementContribution = __decorate([
  __param(0, IDefaultAccountService),
  __param(1, IConfigurationService),
  __param(2, IAuthenticationService),
  __param(3, IExtensionService),
  __param(4, IProductService),
  __param(5, IRequestService),
  __param(6, ILogService),
  __param(7, IContextKeyService)
], DefaultAccountManagementContribution);
export {
  DefaultAccountManagementContribution,
  DefaultAccountService,
  IDefaultAccountService,
  NullDefaultAccountService
};
//# sourceMappingURL=defaultAccount.js.map
