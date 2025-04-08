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
import product from "../../../../platform/product/common/product.js";
import { Barrier } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IRequestContext } from "../../../../base/parts/request/common/request.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { asText, IRequestService } from "../../../../platform/request/common/request.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService, TelemetryLevel } from "../../../../platform/telemetry/common/telemetry.js";
import { AuthenticationSession, IAuthenticationExtensionsService, IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtension, IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { ChatContextKeys } from "./chatContextKeys.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { URI } from "../../../../base/common/uri.js";
import Severity from "../../../../base/common/severity.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { isWeb } from "../../../../base/common/platform.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
const IChatEntitlementService = createDecorator("chatEntitlementService");
var ChatEntitlement = /* @__PURE__ */ ((ChatEntitlement2) => {
  ChatEntitlement2[ChatEntitlement2["Unknown"] = 1] = "Unknown";
  ChatEntitlement2[ChatEntitlement2["Unresolved"] = 2] = "Unresolved";
  ChatEntitlement2[ChatEntitlement2["Available"] = 3] = "Available";
  ChatEntitlement2[ChatEntitlement2["Unavailable"] = 4] = "Unavailable";
  ChatEntitlement2[ChatEntitlement2["Limited"] = 5] = "Limited";
  ChatEntitlement2[ChatEntitlement2["Pro"] = 6] = "Pro";
  return ChatEntitlement2;
})(ChatEntitlement || {});
var ChatSentiment = /* @__PURE__ */ ((ChatSentiment2) => {
  ChatSentiment2[ChatSentiment2["Standard"] = 1] = "Standard";
  ChatSentiment2[ChatSentiment2["Disabled"] = 2] = "Disabled";
  ChatSentiment2[ChatSentiment2["Installed"] = 3] = "Installed";
  return ChatSentiment2;
})(ChatSentiment || {});
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
let ChatEntitlementService = class extends Disposable {
  constructor(instantiationService, productService, environmentService, contextKeyService) {
    super();
    this.contextKeyService = contextKeyService;
    this.chatQuotaExceededContextKey = ChatContextKeys.chatQuotaExceeded.bindTo(this.contextKeyService);
    this.completionsQuotaExceededContextKey = ChatContextKeys.completionsQuotaExceeded.bindTo(this.contextKeyService);
    this.onDidChangeEntitlement = Event.map(
      Event.filter(
        this.contextKeyService.onDidChangeContext,
        (e) => e.affectsSome(/* @__PURE__ */ new Set([
          ChatContextKeys.Entitlement.pro.key,
          ChatContextKeys.Entitlement.limited.key,
          ChatContextKeys.Entitlement.canSignUp.key,
          ChatContextKeys.Entitlement.signedOut.key
        ])),
        this._store
      ),
      () => {
      },
      this._store
    );
    this.onDidChangeSentiment = Event.map(
      Event.filter(
        this.contextKeyService.onDidChangeContext,
        (e) => e.affectsSome(/* @__PURE__ */ new Set([
          ChatContextKeys.Setup.hidden.key,
          ChatContextKeys.Setup.installed.key
        ])),
        this._store
      ),
      () => {
      },
      this._store
    );
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
  static {
    __name(this, "ChatEntitlementService");
  }
  context;
  requests;
  //#region --- Entitlements
  onDidChangeEntitlement;
  get entitlement() {
    if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Entitlement.pro.key) === true) {
      return 6 /* Pro */;
    } else if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Entitlement.limited.key) === true) {
      return 5 /* Limited */;
    } else if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Entitlement.canSignUp.key) === true) {
      return 3 /* Available */;
    } else if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Entitlement.signedOut.key) === true) {
      return 1 /* Unknown */;
    }
    return 2 /* Unresolved */;
  }
  //#endregion
  //#region --- Quotas
  _onDidChangeQuotaExceeded = this._register(new Emitter());
  onDidChangeQuotaExceeded = this._onDidChangeQuotaExceeded.event;
  _onDidChangeQuotaRemaining = this._register(new Emitter());
  onDidChangeQuotaRemaining = this._onDidChangeQuotaRemaining.event;
  _quotas = { chatQuotaExceeded: false, completionsQuotaExceeded: false, quotaResetDate: void 0 };
  get quotas() {
    return this._quotas;
  }
  chatQuotaExceededContextKey;
  completionsQuotaExceededContextKey;
  ExtensionQuotaContextKeys = {
    chatQuotaExceeded: defaultChat.chatQuotaExceededContext,
    completionsQuotaExceeded: defaultChat.completionsQuotaExceededContext
  };
  registerListeners() {
    const chatQuotaExceededSet = /* @__PURE__ */ new Set([this.ExtensionQuotaContextKeys.chatQuotaExceeded]);
    const completionsQuotaExceededSet = /* @__PURE__ */ new Set([this.ExtensionQuotaContextKeys.completionsQuotaExceeded]);
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      let changed = false;
      if (e.affectsSome(chatQuotaExceededSet)) {
        const newChatQuotaExceeded = this.contextKeyService.getContextKeyValue(this.ExtensionQuotaContextKeys.chatQuotaExceeded);
        if (typeof newChatQuotaExceeded === "boolean" && newChatQuotaExceeded !== this._quotas.chatQuotaExceeded) {
          this._quotas = {
            ...this._quotas,
            chatQuotaExceeded: newChatQuotaExceeded
          };
          changed = true;
        }
      }
      if (e.affectsSome(completionsQuotaExceededSet)) {
        const newCompletionsQuotaExceeded = this.contextKeyService.getContextKeyValue(this.ExtensionQuotaContextKeys.completionsQuotaExceeded);
        if (typeof newCompletionsQuotaExceeded === "boolean" && newCompletionsQuotaExceeded !== this._quotas.completionsQuotaExceeded) {
          this._quotas = {
            ...this._quotas,
            completionsQuotaExceeded: newCompletionsQuotaExceeded
          };
          changed = true;
        }
      }
      if (changed) {
        this.updateContextKeys();
        this._onDidChangeQuotaExceeded.fire();
      }
    }));
  }
  acceptQuotas(quotas) {
    const oldQuota = this._quotas;
    this._quotas = quotas;
    this.updateContextKeys();
    if (oldQuota.chatQuotaExceeded !== this._quotas.chatQuotaExceeded || oldQuota.completionsQuotaExceeded !== this._quotas.completionsQuotaExceeded) {
      this._onDidChangeQuotaExceeded.fire();
    }
    if (oldQuota.chatRemaining !== this._quotas.chatRemaining || oldQuota.completionsRemaining !== this._quotas.completionsRemaining) {
      this._onDidChangeQuotaRemaining.fire();
    }
  }
  clearQuotas() {
    if (this.quotas.chatQuotaExceeded || this.quotas.completionsQuotaExceeded) {
      this.acceptQuotas({ chatQuotaExceeded: false, completionsQuotaExceeded: false, quotaResetDate: void 0 });
    }
  }
  updateContextKeys() {
    this.chatQuotaExceededContextKey.set(this._quotas.chatQuotaExceeded);
    this.completionsQuotaExceededContextKey.set(this._quotas.completionsQuotaExceeded);
  }
  //#endregion
  //#region --- Sentiment
  onDidChangeSentiment;
  get sentiment() {
    if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Setup.installed.key) === true) {
      return 3 /* Installed */;
    } else if (this.contextKeyService.getContextKeyValue(ChatContextKeys.Setup.hidden.key) === true) {
      return 2 /* Disabled */;
    }
    return 1 /* Standard */;
  }
  //#endregion
  async update(token) {
    await this.requests?.value.forceResolveEntitlement(void 0, token);
  }
};
ChatEntitlementService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IProductService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IContextKeyService)
], ChatEntitlementService);
let ChatEntitlementRequests = class extends Disposable {
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
    this.state = { entitlement: this.context.state.entitlement };
    this.registerListeners();
    this.resolve();
  }
  static {
    __name(this, "ChatEntitlementRequests");
  }
  static providerId(configurationService) {
    if (configurationService.getValue(`${defaultChat.completionsAdvancedSetting}.authProvider`) === defaultChat.enterpriseProviderId) {
      return defaultChat.enterpriseProviderId;
    }
    return defaultChat.providerId;
  }
  state;
  pendingResolveCts = new CancellationTokenSource();
  didResolveEntitlements = false;
  registerListeners() {
    this._register(this.authenticationService.onDidChangeDeclaredProviders(() => this.resolve()));
    this._register(this.authenticationService.onDidChangeSessions((e) => {
      if (e.providerId === ChatEntitlementRequests.providerId(this.configurationService)) {
        this.resolve();
      }
    }));
    this._register(this.authenticationService.onDidRegisterAuthenticationProvider((e) => {
      if (e.id === ChatEntitlementRequests.providerId(this.configurationService)) {
        this.resolve();
      }
    }));
    this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e) => {
      if (e.id === ChatEntitlementRequests.providerId(this.configurationService)) {
        this.resolve();
      }
    }));
    this._register(this.context.onDidChange(() => {
      if (!this.context.state.installed || this.context.state.entitlement === 1 /* Unknown */) {
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
      if (this.state.entitlement === 1 /* Unknown */) {
        state = { entitlement: 2 /* Unresolved */ };
      }
    } else {
      this.didResolveEntitlements = false;
      state = { entitlement: 1 /* Unknown */ };
    }
    if (state) {
      this.update(state);
    }
    if (session && !this.didResolveEntitlements) {
      await this.resolveEntitlement(session, cts.token);
    }
  }
  async findMatchingProviderSession(token) {
    const sessions = await this.doGetSessions(ChatEntitlementRequests.providerId(this.configurationService));
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
    try {
      return await this.authenticationService.getSessions(providerId);
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
    if (ChatEntitlementRequests.providerId(this.configurationService) === defaultChat.enterpriseProviderId) {
      this.logService.trace("[chat entitlement]: enterprise provider, assuming Pro");
      return { entitlement: 6 /* Pro */ };
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
      return { entitlement: 2 /* Unresolved */ };
    }
    if (response.res.statusCode && response.res.statusCode !== 200) {
      this.logService.trace(`[chat entitlement]: unexpected status code ${response.res.statusCode}`);
      return response.res.statusCode === 401 || // oauth token being unavailable (expired/revoked)
      response.res.statusCode === 404 ? {
        entitlement: 1 /* Unknown */
        /* treat as signed out */
      } : { entitlement: 2 /* Unresolved */ };
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
      return { entitlement: 2 /* Unresolved */ };
    }
    let entitlementsResponse;
    try {
      entitlementsResponse = JSON.parse(responseText);
      this.logService.trace(`[chat entitlement]: parsed result is ${JSON.stringify(entitlementsResponse)}`);
    } catch (err) {
      this.logService.trace(`[chat entitlement]: error parsing response (${err})`);
      return { entitlement: 2 /* Unresolved */ };
    }
    let entitlement;
    if (entitlementsResponse.access_type_sku === "free_limited_copilot") {
      entitlement = 5 /* Limited */;
    } else if (entitlementsResponse.can_signup_for_limited) {
      entitlement = 3 /* Available */;
    } else if (entitlementsResponse.chat_enabled) {
      entitlement = 6 /* Pro */;
    } else {
      entitlement = 4 /* Unavailable */;
    }
    const chatRemaining = entitlementsResponse.limited_user_quotas?.chat;
    const completionsRemaining = entitlementsResponse.limited_user_quotas?.completions;
    const entitlements = {
      entitlement,
      quotas: {
        chatTotal: entitlementsResponse.monthly_quotas?.chat,
        completionsTotal: entitlementsResponse.monthly_quotas?.completions,
        chatRemaining: typeof chatRemaining === "number" ? Math.max(0, chatRemaining) : void 0,
        completionsRemaining: typeof completionsRemaining === "number" ? Math.max(0, completionsRemaining) : void 0,
        resetDate: entitlementsResponse.limited_user_reset_date
      }
    };
    this.logService.trace(`[chat entitlement]: resolved to ${entitlements.entitlement}, quotas: ${JSON.stringify(entitlements.quotas)}`);
    this.telemetryService.publicLog2("chatInstallEntitlement", {
      entitlement: entitlements.entitlement,
      tid: entitlementsResponse.analytics_tracking_id,
      quotaChat: entitlementsResponse.limited_user_quotas?.chat,
      quotaCompletions: entitlementsResponse.limited_user_quotas?.completions,
      quotaResetDate: entitlementsResponse.limited_user_reset_date
    });
    return entitlements;
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
      this.chatQuotasAccessor.acceptQuotas({
        chatQuotaExceeded: typeof state.quotas.chatRemaining === "number" ? state.quotas.chatRemaining <= 0 : false,
        completionsQuotaExceeded: typeof state.quotas.completionsRemaining === "number" ? state.quotas.completionsRemaining <= 0 : false,
        quotaResetDate: state.quotas.resetDate ? new Date(state.quotas.resetDate) : void 0,
        chatTotal: state.quotas.chatTotal,
        completionsTotal: state.quotas.completionsTotal,
        chatRemaining: state.quotas.chatRemaining,
        completionsRemaining: state.quotas.completionsRemaining
      });
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
      restricted_telemetry: this.telemetryService.telemetryLevel === TelemetryLevel.NONE ? "disabled" : "enabled",
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
    this.update({ entitlement: 5 /* Limited */ });
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
    const providerId = ChatEntitlementRequests.providerId(this.configurationService);
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
ChatEntitlementRequests = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IAuthenticationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IRequestService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IAuthenticationExtensionsService),
  __decorateParam(10, ILifecycleService)
], ChatEntitlementRequests);
let ChatEntitlementContext = class extends Disposable {
  constructor(contextKeyService, storageService, extensionEnablementService, logService, extensionsWorkbenchService) {
    super();
    this.storageService = storageService;
    this.extensionEnablementService = extensionEnablementService;
    this.logService = logService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.canSignUpContextKey = ChatContextKeys.Entitlement.canSignUp.bindTo(contextKeyService);
    this.signedOutContextKey = ChatContextKeys.Entitlement.signedOut.bindTo(contextKeyService);
    this.limitedContextKey = ChatContextKeys.Entitlement.limited.bindTo(contextKeyService);
    this.proContextKey = ChatContextKeys.Entitlement.pro.bindTo(contextKeyService);
    this.hiddenContext = ChatContextKeys.Setup.hidden.bindTo(contextKeyService);
    this.installedContext = ChatContextKeys.Setup.installed.bindTo(contextKeyService);
    this._state = this.storageService.getObject(ChatEntitlementContext.CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY, StorageScope.PROFILE) ?? { entitlement: 1 /* Unknown */ };
    this.checkExtensionInstallation();
    this.updateContextSync();
  }
  static {
    __name(this, "ChatEntitlementContext");
  }
  static CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY = "chat.setupContext";
  canSignUpContextKey;
  signedOutContextKey;
  limitedContextKey;
  proContextKey;
  hiddenContext;
  installedContext;
  _state;
  suspendedState = void 0;
  get state() {
    return this.suspendedState ?? this._state;
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  updateBarrier = void 0;
  async checkExtensionInstallation() {
    await this.extensionsWorkbenchService.queryLocal();
    this._register(Event.runAndSubscribe(this.extensionsWorkbenchService.onChange, (e) => {
      if (e && !ExtensionIdentifier.equals(e.identifier.id, defaultChat.extensionId)) {
        return;
      }
      const defaultChatExtension = this.extensionsWorkbenchService.local.find((value) => ExtensionIdentifier.equals(value.identifier.id, defaultChat.extensionId));
      this.update({ installed: !!defaultChatExtension?.local && this.extensionEnablementService.isEnabled(defaultChatExtension.local) });
    }));
  }
  update(context) {
    this.logService.trace(`[chat entitlement context] update(): ${JSON.stringify(context)}`);
    if (typeof context.installed === "boolean") {
      this._state.installed = context.installed;
      if (context.installed) {
        context.hidden = false;
      }
    }
    if (typeof context.hidden === "boolean") {
      this._state.hidden = context.hidden;
    }
    if (typeof context.entitlement === "number") {
      this._state.entitlement = context.entitlement;
      if (this._state.entitlement === 5 /* Limited */ || this._state.entitlement === 6 /* Pro */) {
        this._state.registered = true;
      } else if (this._state.entitlement === 3 /* Available */) {
        this._state.registered = false;
      }
    }
    this.storageService.store(ChatEntitlementContext.CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY, this._state, StorageScope.PROFILE, StorageTarget.MACHINE);
    return this.updateContext();
  }
  async updateContext() {
    await this.updateBarrier?.wait();
    this.updateContextSync();
  }
  updateContextSync() {
    this.logService.trace(`[chat entitlement context] updateContext(): ${JSON.stringify(this._state)}`);
    this.signedOutContextKey.set(this._state.entitlement === 1 /* Unknown */);
    this.canSignUpContextKey.set(this._state.entitlement === 3 /* Available */);
    this.limitedContextKey.set(this._state.entitlement === 5 /* Limited */);
    this.proContextKey.set(this._state.entitlement === 6 /* Pro */);
    this.hiddenContext.set(!!this._state.hidden);
    this.installedContext.set(!!this._state.installed);
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
ChatEntitlementContext = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IWorkbenchExtensionEnablementService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IExtensionsWorkbenchService)
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
