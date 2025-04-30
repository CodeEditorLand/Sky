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
var ChatEntitlementRequests_1, ChatEntitlementContext_1;
import product from "../../../../platform/product/common/product.js";
import { Barrier } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { asText, IRequestService } from "../../../../platform/request/common/request.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IAuthenticationExtensionsService, IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { ChatContextKeys } from "./chatContextKeys.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { URI } from "../../../../base/common/uri.js";
import Severity from "../../../../base/common/severity.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { isWeb } from "../../../../base/common/platform.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
const IChatEntitlementService = createDecorator("chatEntitlementService");
var ChatEntitlement;
(function(ChatEntitlement2) {
  ChatEntitlement2[ChatEntitlement2["Unknown"] = 1] = "Unknown";
  ChatEntitlement2[ChatEntitlement2["Unresolved"] = 2] = "Unresolved";
  ChatEntitlement2[ChatEntitlement2["Available"] = 3] = "Available";
  ChatEntitlement2[ChatEntitlement2["Unavailable"] = 4] = "Unavailable";
  ChatEntitlement2[ChatEntitlement2["Limited"] = 5] = "Limited";
  ChatEntitlement2[ChatEntitlement2["Pro"] = 6] = "Pro";
})(ChatEntitlement || (ChatEntitlement = {}));
var ChatSentiment;
(function(ChatSentiment2) {
  ChatSentiment2[ChatSentiment2["Standard"] = 1] = "Standard";
  ChatSentiment2[ChatSentiment2["Disabled"] = 2] = "Disabled";
  ChatSentiment2[ChatSentiment2["Installed"] = 3] = "Installed";
})(ChatSentiment || (ChatSentiment = {}));
const defaultChat = {
  extensionId: product.defaultChatAgent?.extensionId ?? "",
  chatExtensionId: product.defaultChatAgent?.chatExtensionId ?? "",
  upgradePlanUrl: product.defaultChatAgent?.upgradePlanUrl ?? "",
  providerId: product.defaultChatAgent?.providerId ?? "",
  enterpriseProviderId: product.defaultChatAgent?.enterpriseProviderId ?? "",
  providerScopes: product.defaultChatAgent?.providerScopes ?? [[]],
  entitlementUrl: product.defaultChatAgent?.entitlementUrl ?? "",
  entitlementSignupLimitedUrl: product.defaultChatAgent?.entitlementSignupLimitedUrl ?? "",
  completionsAdvancedSetting: product.defaultChatAgent?.completionsAdvancedSetting ?? "",
  chatQuotaExceededContext: product.defaultChatAgent?.chatQuotaExceededContext ?? "",
  completionsQuotaExceededContext: product.defaultChatAgent?.completionsQuotaExceededContext ?? ""
};
let ChatEntitlementService = class ChatEntitlementService2 extends Disposable {
  static {
    __name(this, "ChatEntitlementService");
  }
  constructor(instantiationService, productService, environmentService, contextKeyService) {
    super();
    this.contextKeyService = contextKeyService;
    this._onDidChangeQuotaExceeded = this._register(new Emitter());
    this.onDidChangeQuotaExceeded = this._onDidChangeQuotaExceeded.event;
    this._onDidChangeQuotaRemaining = this._register(new Emitter());
    this.onDidChangeQuotaRemaining = this._onDidChangeQuotaRemaining.event;
    this._quotas = {};
    this.ExtensionQuotaContextKeys = {
      chatQuotaExceeded: defaultChat.chatQuotaExceededContext,
      completionsQuotaExceeded: defaultChat.completionsQuotaExceededContext
    };
    this.chatQuotaExceededContextKey = ChatContextKeys.chatQuotaExceeded.bindTo(this.contextKeyService);
    this.completionsQuotaExceededContextKey = ChatContextKeys.completionsQuotaExceeded.bindTo(this.contextKeyService);
    this.onDidChangeEntitlement = Event.map(Event.filter(this.contextKeyService.onDidChangeContext, (e) => e.affectsSome(/* @__PURE__ */ new Set([
      ChatContextKeys.Entitlement.pro.key,
      ChatContextKeys.Entitlement.limited.key,
      ChatContextKeys.Entitlement.canSignUp.key,
      ChatContextKeys.Entitlement.signedOut.key
    ])), this._store), () => {
    }, this._store);
    this.onDidChangeSentiment = Event.map(Event.filter(this.contextKeyService.onDidChangeContext, (e) => e.affectsSome(/* @__PURE__ */ new Set([
      ChatContextKeys.Setup.hidden.key,
      ChatContextKeys.Setup.installed.key
    ])), this._store), () => {
    }, this._store);
    if (!productService.defaultChatAgent || // needs product config
    isWeb && !environmentService.remoteAuthority) {
      ChatContextKeys.Setup.hidden.bindTo(this.contextKeyService).set(true);
      return;
    }
    const context = this.context = new Lazy(() => this._register(instantiationService.createInstance(ChatEntitlementContext)));
    this.requests = new Lazy(() => this._register(instantiationService.createInstance(ChatEntitlementRequests, context.value, {
      clearQuotas: /* @__PURE__ */ __name(() => this.clearQuotas(), "clearQuotas"),
      acceptQuotas: /* @__PURE__ */ __name((quotas) => this.acceptQuotas(quotas), "acceptQuotas")
    })));
    this.registerListeners();
  }
  get entitlement() {
    if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Entitlement.pro.key) === true) {
      return ChatEntitlement.Pro;
    } else if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Entitlement.limited.key) === true) {
      return ChatEntitlement.Limited;
    } else if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Entitlement.canSignUp.key) === true) {
      return ChatEntitlement.Available;
    } else if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Entitlement.signedOut.key) === true) {
      return ChatEntitlement.Unknown;
    }
    return ChatEntitlement.Unresolved;
  }
  get quotas() {
    return this._quotas;
  }
  registerListeners() {
    const quotaExceededSet = /* @__PURE__ */ new Set([this.ExtensionQuotaContextKeys.chatQuotaExceeded, this.ExtensionQuotaContextKeys.completionsQuotaExceeded]);
    const cts = this._register(new MutableDisposable());
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(quotaExceededSet)) {
        if (cts.value) {
          cts.value.cancel();
        }
        cts.value = new CancellationTokenSource();
        this.update(cts.value.token);
      }
    }));
  }
  acceptQuotas(quotas) {
    const oldQuota = this._quotas;
    this._quotas = quotas;
    this.updateContextKeys();
    const { changed: chatChanged } = this.compareQuotas(oldQuota.chat, quotas.chat);
    const { changed: completionsChanged } = this.compareQuotas(oldQuota.completions, quotas.completions);
    const { changed: premiumChatChanged } = this.compareQuotas(oldQuota.premiumChat, quotas.premiumChat);
    if (chatChanged.exceeded || completionsChanged.exceeded || premiumChatChanged.exceeded) {
      this._onDidChangeQuotaExceeded.fire();
    }
    if (chatChanged.remaining || completionsChanged.remaining || premiumChatChanged.remaining) {
      this._onDidChangeQuotaRemaining.fire();
    }
  }
  compareQuotas(oldQuota, newQuota) {
    return {
      changed: {
        exceeded: oldQuota?.percentRemaining === 0 !== (newQuota?.percentRemaining === 0),
        remaining: oldQuota?.percentRemaining !== newQuota?.percentRemaining
      }
    };
  }
  clearQuotas() {
    this.acceptQuotas({});
  }
  updateContextKeys() {
    this.chatQuotaExceededContextKey.set(this._quotas.chat?.percentRemaining === 0);
    this.completionsQuotaExceededContextKey.set(this._quotas.completions?.percentRemaining === 0);
  }
  get sentiment() {
    if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Setup.installed.key) === true) {
      return ChatSentiment.Installed;
    } else if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Setup.hidden.key) === true) {
      return ChatSentiment.Disabled;
    }
    return ChatSentiment.Standard;
  }
  //#endregion
  async update(token) {
    await this.requests?.value.forceResolveEntitlement(void 0, token);
  }
};
ChatEntitlementService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IProductService),
  __param(2, IWorkbenchEnvironmentService),
  __param(3, IContextKeyService)
], ChatEntitlementService);
let ChatEntitlementRequests = ChatEntitlementRequests_1 = class ChatEntitlementRequests2 extends Disposable {
  static {
    __name(this, "ChatEntitlementRequests");
  }
  static providerId(configurationService) {
    if (configurationService.getValue(`${defaultChat.completionsAdvancedSetting}.authProvider`) === defaultChat.enterpriseProviderId) {
      return defaultChat.enterpriseProviderId;
    }
    return defaultChat.providerId;
  }
  constructor(context, chatQuotasAccessor, telemetryService, authenticationService, logService, requestService, dialogService, openerService, configurationService, authenticationExtensionsService, lifecycleService) {
    super();
    this.context = context;
    this.chatQuotasAccessor = chatQuotasAccessor;
    this.telemetryService = telemetryService;
    this.authenticationService = authenticationService;
    this.logService = logService;
    this.requestService = requestService;
    this.dialogService = dialogService;
    this.openerService = openerService;
    this.configurationService = configurationService;
    this.authenticationExtensionsService = authenticationExtensionsService;
    this.lifecycleService = lifecycleService;
    this.pendingResolveCts = new CancellationTokenSource();
    this.didResolveEntitlements = false;
    this.state = { entitlement: this.context.state.entitlement };
    this.registerListeners();
    this.resolve();
  }
  registerListeners() {
    this._register(this.authenticationService.onDidChangeDeclaredProviders(() => this.resolve()));
    this._register(this.authenticationService.onDidChangeSessions((e) => {
      if (e.providerId === ChatEntitlementRequests_1.providerId(this.configurationService)) {
        this.resolve();
      }
    }));
    this._register(this.authenticationService.onDidRegisterAuthenticationProvider((e) => {
      if (e.id === ChatEntitlementRequests_1.providerId(this.configurationService)) {
        this.resolve();
      }
    }));
    this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e) => {
      if (e.id === ChatEntitlementRequests_1.providerId(this.configurationService)) {
        this.resolve();
      }
    }));
    this._register(this.context.onDidChange(() => {
      if (!this.context.state.installed || this.context.state.entitlement === ChatEntitlement.Unknown) {
        this.state = { entitlement: this.state.entitlement, quotas: void 0 };
        this.chatQuotasAccessor.clearQuotas();
      }
    }));
  }
  async resolve() {
    this.pendingResolveCts.dispose(true);
    const cts = this.pendingResolveCts = new CancellationTokenSource();
    const session = await this.findMatchingProviderSession(cts.token);
    if (cts.token.isCancellationRequested) {
      return;
    }
    let state = void 0;
    if (session) {
      if (this.state.entitlement === ChatEntitlement.Unknown) {
        state = { entitlement: ChatEntitlement.Unresolved };
      }
    } else {
      this.didResolveEntitlements = false;
      state = { entitlement: ChatEntitlement.Unknown };
    }
    if (state) {
      this.update(state);
    }
    if (session && !this.didResolveEntitlements) {
      await this.resolveEntitlement(session, cts.token);
    }
  }
  async findMatchingProviderSession(token) {
    const sessions = await this.doGetSessions(ChatEntitlementRequests_1.providerId(this.configurationService));
    if (token.isCancellationRequested) {
      return void 0;
    }
    for (const session of sessions) {
      for (const scopes of defaultChat.providerScopes) {
        if (this.scopesMatch(session.scopes, scopes)) {
          return session;
        }
      }
    }
    return void 0;
  }
  async doGetSessions(providerId) {
    const preferredAccountName = this.authenticationExtensionsService.getAccountPreference(defaultChat.chatExtensionId, providerId) ?? this.authenticationExtensionsService.getAccountPreference(defaultChat.extensionId, providerId);
    let preferredAccount;
    for (const account of await this.authenticationService.getAccounts(providerId)) {
      if (account.label === preferredAccountName) {
        preferredAccount = account;
        break;
      }
    }
    try {
      return await this.authenticationService.getSessions(providerId, void 0, preferredAccount);
    } catch (error) {
    }
    return [];
  }
  scopesMatch(scopes, expectedScopes) {
    return scopes.length === expectedScopes.length && expectedScopes.every((scope) => scopes.includes(scope));
  }
  async resolveEntitlement(session, token) {
    const entitlements = await this.doResolveEntitlement(session, token);
    if (typeof entitlements?.entitlement === "number" && !token.isCancellationRequested) {
      this.didResolveEntitlements = true;
      this.update(entitlements);
    }
    return entitlements;
  }
  async doResolveEntitlement(session, token) {
    if (ChatEntitlementRequests_1.providerId(this.configurationService) === defaultChat.enterpriseProviderId) {
      this.logService.trace("[chat entitlement]: enterprise provider, assuming Pro");
      return { entitlement: ChatEntitlement.Pro };
    }
    if (token.isCancellationRequested) {
      return void 0;
    }
    const response = await this.request(defaultChat.entitlementUrl, "GET", void 0, session, token);
    if (token.isCancellationRequested) {
      return void 0;
    }
    if (!response) {
      this.logService.trace("[chat entitlement]: no response");
      return { entitlement: ChatEntitlement.Unresolved };
    }
    if (response.res.statusCode && response.res.statusCode !== 200) {
      this.logService.trace(`[chat entitlement]: unexpected status code ${response.res.statusCode}`);
      return response.res.statusCode === 401 || // oauth token being unavailable (expired/revoked)
      response.res.statusCode === 404 ? {
        entitlement: ChatEntitlement.Unknown
        /* treat as signed out */
      } : { entitlement: ChatEntitlement.Unresolved };
    }
    let responseText = null;
    try {
      responseText = await asText(response);
    } catch (error) {
    }
    if (token.isCancellationRequested) {
      return void 0;
    }
    if (!responseText) {
      this.logService.trace("[chat entitlement]: response has no content");
      return { entitlement: ChatEntitlement.Unresolved };
    }
    let entitlementsResponse;
    try {
      entitlementsResponse = JSON.parse(responseText);
      this.logService.trace(`[chat entitlement]: parsed result is ${JSON.stringify(entitlementsResponse)}`);
    } catch (err) {
      this.logService.trace(`[chat entitlement]: error parsing response (${err})`);
      return { entitlement: ChatEntitlement.Unresolved };
    }
    let entitlement;
    if (entitlementsResponse.access_type_sku === "free_limited_copilot") {
      entitlement = ChatEntitlement.Limited;
    } else if (entitlementsResponse.can_signup_for_limited) {
      entitlement = ChatEntitlement.Available;
    } else if (entitlementsResponse.chat_enabled) {
      entitlement = ChatEntitlement.Pro;
    } else {
      entitlement = ChatEntitlement.Unavailable;
    }
    const entitlements = {
      entitlement,
      quotas: this.toQuotas(entitlementsResponse)
    };
    this.logService.trace(`[chat entitlement]: resolved to ${entitlements.entitlement}, quotas: ${JSON.stringify(entitlements.quotas)}`);
    this.telemetryService.publicLog2("chatInstallEntitlement", {
      entitlement: entitlements.entitlement,
      tid: entitlementsResponse.analytics_tracking_id,
      quotaChat: entitlementsResponse?.quota_snapshots?.chat?.remaining,
      quotaPremiumChat: entitlementsResponse?.quota_snapshots?.premium_interactions?.remaining,
      quotaCompletions: entitlementsResponse?.quota_snapshots?.completions?.remaining,
      quotaResetDate: entitlementsResponse.quota_reset_date ?? entitlementsResponse.limited_user_reset_date
    });
    return entitlements;
  }
  toQuotas(response) {
    const quotas = {
      resetDate: response.quota_reset_date ?? response.limited_user_reset_date
    };
    if (response.monthly_quotas?.chat && typeof response.limited_user_quotas?.chat === "number") {
      quotas.chat = {
        total: response.monthly_quotas.chat,
        percentRemaining: Math.round(response.limited_user_quotas.chat / response.monthly_quotas.chat * 100),
        overageEnabled: false,
        overageCount: 0,
        unlimited: false
      };
    }
    if (response.monthly_quotas?.completions && typeof response.limited_user_quotas?.completions === "number") {
      quotas.completions = {
        total: response.monthly_quotas.completions,
        percentRemaining: Math.round(response.limited_user_quotas.completions / response.monthly_quotas.completions * 100),
        overageEnabled: false,
        overageCount: 0,
        unlimited: false
      };
    }
    if (response.quota_snapshots) {
      for (const quotaType of ["chat", "completions", "premium_interactions"]) {
        const rawQuotaSnapshot = response.quota_snapshots[quotaType];
        if (!rawQuotaSnapshot) {
          continue;
        }
        const quotaSnapshot = {
          total: rawQuotaSnapshot.entitlement,
          percentRemaining: rawQuotaSnapshot.percent_remaining,
          overageEnabled: rawQuotaSnapshot.overage_permitted,
          overageCount: rawQuotaSnapshot.overage_count,
          unlimited: rawQuotaSnapshot.unlimited
        };
        switch (quotaType) {
          case "chat":
            quotas.chat = quotaSnapshot;
            break;
          case "completions":
            quotas.completions = quotaSnapshot;
            break;
          case "premium_interactions":
            quotas.premiumChat = quotaSnapshot;
            break;
        }
      }
    }
    return quotas;
  }
  async request(url, type, body, session, token) {
    try {
      return await this.requestService.request({
        type,
        url,
        data: type === "POST" ? JSON.stringify(body) : void 0,
        disableCache: true,
        headers: {
          "Authorization": `Bearer ${session.accessToken}`
        }
      }, token);
    } catch (error) {
      if (!token.isCancellationRequested) {
        this.logService.error(`[chat entitlement] request: error ${error}`);
      }
      return void 0;
    }
  }
  update(state) {
    this.state = state;
    this.context.update({ entitlement: this.state.entitlement });
    if (state.quotas) {
      this.chatQuotasAccessor.acceptQuotas(state.quotas);
    }
  }
  async forceResolveEntitlement(session, token = CancellationToken.None) {
    if (!session) {
      session = await this.findMatchingProviderSession(token);
    }
    if (!session) {
      return void 0;
    }
    return this.resolveEntitlement(session, token);
  }
  async signUpLimited(session) {
    const body = {
      restricted_telemetry: this.telemetryService.telemetryLevel === 0 ? "disabled" : "enabled",
      public_code_suggestions: "enabled"
    };
    const response = await this.request(defaultChat.entitlementSignupLimitedUrl, "POST", body, session, CancellationToken.None);
    if (!response) {
      const retry = await this.onUnknownSignUpError(localize("signUpNoResponseError", "No response received."), "[chat entitlement] sign-up: no response");
      return retry ? this.signUpLimited(session) : { errorCode: 1 };
    }
    if (response.res.statusCode && response.res.statusCode !== 200) {
      if (response.res.statusCode === 422) {
        try {
          const responseText2 = await asText(response);
          if (responseText2) {
            const responseError = JSON.parse(responseText2);
            if (typeof responseError.message === "string" && responseError.message) {
              this.onUnprocessableSignUpError(`[chat entitlement] sign-up: unprocessable entity (${responseError.message})`, responseError.message);
              return { errorCode: response.res.statusCode };
            }
          }
        } catch (error) {
        }
      }
      const retry = await this.onUnknownSignUpError(localize("signUpUnexpectedStatusError", "Unexpected status code {0}.", response.res.statusCode), `[chat entitlement] sign-up: unexpected status code ${response.res.statusCode}`);
      return retry ? this.signUpLimited(session) : { errorCode: response.res.statusCode };
    }
    let responseText = null;
    try {
      responseText = await asText(response);
    } catch (error) {
    }
    if (!responseText) {
      const retry = await this.onUnknownSignUpError(localize("signUpNoResponseContentsError", "Response has no contents."), "[chat entitlement] sign-up: response has no content");
      return retry ? this.signUpLimited(session) : { errorCode: 2 };
    }
    let parsedResult = void 0;
    try {
      parsedResult = JSON.parse(responseText);
      this.logService.trace(`[chat entitlement] sign-up: response is ${responseText}`);
    } catch (err) {
      const retry = await this.onUnknownSignUpError(localize("signUpInvalidResponseError", "Invalid response contents."), `[chat entitlement] sign-up: error parsing response (${err})`);
      return retry ? this.signUpLimited(session) : { errorCode: 3 };
    }
    this.update({ entitlement: ChatEntitlement.Limited });
    return Boolean(parsedResult?.subscribed);
  }
  async onUnknownSignUpError(detail, logMessage) {
    this.logService.error(logMessage);
    if (!this.lifecycleService.willShutdown) {
      const { confirmed } = await this.dialogService.confirm({
        type: Severity.Error,
        message: localize("unknownSignUpError", "An error occurred while signing up for the Copilot Free plan. Would you like to try again?"),
        detail,
        primaryButton: localize("retry", "Retry")
      });
      return confirmed;
    }
    return false;
  }
  onUnprocessableSignUpError(logMessage, logDetails) {
    this.logService.error(logMessage);
    if (!this.lifecycleService.willShutdown) {
      this.dialogService.prompt({
        type: Severity.Error,
        message: localize("unprocessableSignUpError", "An error occurred while signing up for the Copilot Free plan."),
        detail: logDetails,
        buttons: [
          {
            label: localize("ok", "OK"),
            run: /* @__PURE__ */ __name(() => {
            }, "run")
          },
          {
            label: localize("learnMore", "Learn More"),
            run: /* @__PURE__ */ __name(() => this.openerService.open(URI.parse(defaultChat.upgradePlanUrl)), "run")
          }
        ]
      });
    }
  }
  async signIn() {
    const providerId = ChatEntitlementRequests_1.providerId(this.configurationService);
    const session = await this.authenticationService.createSession(providerId, defaultChat.providerScopes[0]);
    this.authenticationExtensionsService.updateAccountPreference(defaultChat.extensionId, providerId, session.account);
    this.authenticationExtensionsService.updateAccountPreference(defaultChat.chatExtensionId, providerId, session.account);
    const entitlements = await this.forceResolveEntitlement(session);
    return { session, entitlements };
  }
  dispose() {
    this.pendingResolveCts.dispose(true);
    super.dispose();
  }
};
ChatEntitlementRequests = ChatEntitlementRequests_1 = __decorate([
  __param(2, ITelemetryService),
  __param(3, IAuthenticationService),
  __param(4, ILogService),
  __param(5, IRequestService),
  __param(6, IDialogService),
  __param(7, IOpenerService),
  __param(8, IConfigurationService),
  __param(9, IAuthenticationExtensionsService),
  __param(10, ILifecycleService)
], ChatEntitlementRequests);
let ChatEntitlementContext = class ChatEntitlementContext2 extends Disposable {
  static {
    __name(this, "ChatEntitlementContext");
  }
  static {
    ChatEntitlementContext_1 = this;
  }
  static {
    this.CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY = "chat.setupContext";
  }
  get state() {
    return this.suspendedState ?? this._state;
  }
  constructor(contextKeyService, storageService, extensionEnablementService, logService, extensionsWorkbenchService) {
    super();
    this.storageService = storageService;
    this.extensionEnablementService = extensionEnablementService;
    this.logService = logService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.suspendedState = void 0;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.updateBarrier = void 0;
    this.canSignUpContextKey = ChatContextKeys.Entitlement.canSignUp.bindTo(contextKeyService);
    this.signedOutContextKey = ChatContextKeys.Entitlement.signedOut.bindTo(contextKeyService);
    this.limitedContextKey = ChatContextKeys.Entitlement.limited.bindTo(contextKeyService);
    this.proContextKey = ChatContextKeys.Entitlement.pro.bindTo(contextKeyService);
    this.hiddenContext = ChatContextKeys.Setup.hidden.bindTo(contextKeyService);
    this.installedContext = ChatContextKeys.Setup.installed.bindTo(contextKeyService);
    this.disabledContext = ChatContextKeys.Setup.disabled.bindTo(contextKeyService);
    this._state = this.storageService.getObject(
      ChatEntitlementContext_1.CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    ) ?? { entitlement: ChatEntitlement.Unknown };
    this.checkExtensionInstallation();
    this.updateContextSync();
  }
  async checkExtensionInstallation() {
    await this.extensionsWorkbenchService.queryLocal();
    this._register(Event.runAndSubscribe(this.extensionsWorkbenchService.onChange, (e) => {
      if (e && !ExtensionIdentifier.equals(e.identifier.id, defaultChat.extensionId)) {
        return;
      }
      const defaultChatExtension = this.extensionsWorkbenchService.local.find((value) => ExtensionIdentifier.equals(value.identifier.id, defaultChat.extensionId));
      this.update({
        // TODO@bpasero considering enablement state here as well for historic reasons, should revisit when Copilot can be enabled/disabled more generally
        installed: !!defaultChatExtension?.local && this.extensionEnablementService.isEnabled(defaultChatExtension.local),
        disabled: !!defaultChatExtension?.local && !this.extensionEnablementService.isEnabled(defaultChatExtension.local)
      });
    }));
  }
  update(context) {
    this.logService.trace(`[chat entitlement context] update(): ${JSON.stringify(context)}`);
    if (typeof context.installed === "boolean" && typeof context.disabled === "boolean") {
      this._state.installed = context.installed;
      this._state.disabled = context.disabled;
      if (context.installed) {
        context.hidden = false;
      }
    }
    if (typeof context.hidden === "boolean") {
      this._state.hidden = context.hidden;
    }
    if (typeof context.entitlement === "number") {
      this._state.entitlement = context.entitlement;
      if (this._state.entitlement === ChatEntitlement.Limited || this._state.entitlement === ChatEntitlement.Pro) {
        this._state.registered = true;
      } else if (this._state.entitlement === ChatEntitlement.Available) {
        this._state.registered = false;
      }
    }
    this.storageService.store(
      ChatEntitlementContext_1.CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY,
      this._state,
      0,
      1
      /* StorageTarget.MACHINE */
    );
    return this.updateContext();
  }
  async updateContext() {
    await this.updateBarrier?.wait();
    this.updateContextSync();
  }
  updateContextSync() {
    this.logService.trace(`[chat entitlement context] updateContext(): ${JSON.stringify(this._state)}`);
    this.signedOutContextKey.set(this._state.entitlement === ChatEntitlement.Unknown);
    this.canSignUpContextKey.set(this._state.entitlement === ChatEntitlement.Available);
    this.limitedContextKey.set(this._state.entitlement === ChatEntitlement.Limited);
    this.proContextKey.set(this._state.entitlement === ChatEntitlement.Pro);
    this.hiddenContext.set(!!this._state.hidden);
    this.installedContext.set(!!this._state.installed);
    this.disabledContext.set(!!this._state.disabled);
    this._onDidChange.fire();
  }
  suspend() {
    this.suspendedState = { ...this._state };
    this.updateBarrier = new Barrier();
  }
  resume() {
    this.suspendedState = void 0;
    this.updateBarrier?.open();
    this.updateBarrier = void 0;
  }
};
ChatEntitlementContext = ChatEntitlementContext_1 = __decorate([
  __param(0, IContextKeyService),
  __param(1, IStorageService),
  __param(2, IWorkbenchExtensionEnablementService),
  __param(3, ILogService),
  __param(4, IExtensionsWorkbenchService)
], ChatEntitlementContext);
export {
  ChatEntitlement,
  ChatEntitlementContext,
  ChatEntitlementRequests,
  ChatEntitlementService,
  ChatSentiment,
  IChatEntitlementService
};
//# sourceMappingURL=chatEntitlementService.js.map
