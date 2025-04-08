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
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IAuthenticationService } from "../../authentication/common/authentication.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { localize } from "../../../../nls.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { Barrier } from "../../../../base/common/async.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { getErrorMessage } from "../../../../base/common/errors.js";
var DefaultAccountStatus = /* @__PURE__ */ ((DefaultAccountStatus2) => {
  DefaultAccountStatus2["Uninitialized"] = "uninitialized";
  DefaultAccountStatus2["Unavailable"] = "unavailable";
  DefaultAccountStatus2["Available"] = "available";
  return DefaultAccountStatus2;
})(DefaultAccountStatus || {});
const CONTEXT_DEFAULT_ACCOUNT_STATE = new RawContextKey("defaultAccountStatus", "uninitialized" /* Uninitialized */);
const IDefaultAccountService = createDecorator("defaultAccountService");
class DefaultAccountService extends Disposable {
  static {
    __name(this, "DefaultAccountService");
  }
  _defaultAccount = void 0;
  get defaultAccount() {
    return this._defaultAccount ?? null;
  }
  initBarrier = new Barrier();
  _onDidChangeDefaultAccount = this._register(new Emitter());
  onDidChangeDefaultAccount = this._onDidChangeDefaultAccount.event;
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
  onDidChangeDefaultAccount = Event.None;
  async getDefaultAccount() {
    return null;
  }
  setDefaultAccount(account) {
  }
}
let DefaultAccountManagementContribution = class extends Disposable {
  constructor(defaultAccountService, configurationService, authenticationService, extensionService, productService, requestService, logService, contextKeyService) {
    super();
    this.defaultAccountService = defaultAccountService;
    this.configurationService = configurationService;
    this.authenticationService = authenticationService;
    this.extensionService = extensionService;
    this.productService = productService;
    this.requestService = requestService;
    this.logService = logService;
    this.accountStatusContext = CONTEXT_DEFAULT_ACCOUNT_STATE.bindTo(contextKeyService);
    this.initialize();
  }
  static {
    __name(this, "DefaultAccountManagementContribution");
  }
  static ID = "workbench.contributions.defaultAccountManagement";
  defaultAccount = null;
  accountStatusContext;
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
      this.accountStatusContext.set("available" /* Available */);
    } else {
      this.accountStatusContext.set("unavailable" /* Unavailable */);
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
    const id = this.configurationService.getValue(enterpriseAuthProviderConfig) ? enterpriseAuthProviderId : authProviderId;
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
            when: CONTEXT_DEFAULT_ACCOUNT_STATE.isEqualTo("unavailable" /* Unavailable */),
            group: "0_signin"
          }
        });
      }
      run() {
        const id = that.configurationService.getValue(enterpriseAuthProviderConfig) ? enterpriseAuthProviderId : authProviderId;
        return that.authenticationService.createSession(id, scopes);
      }
    }));
  }
};
DefaultAccountManagementContribution = __decorateClass([
  __decorateParam(0, IDefaultAccountService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IAuthenticationService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IRequestService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IContextKeyService)
], DefaultAccountManagementContribution);
export {
  DefaultAccountManagementContribution,
  DefaultAccountService,
  IDefaultAccountService,
  NullDefaultAccountService
};
//# sourceMappingURL=defaultAccount.js.map
