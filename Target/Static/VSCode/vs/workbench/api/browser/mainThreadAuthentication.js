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
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import * as nls from "../../../nls.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IAuthenticationCreateSessionOptions, AuthenticationSession, AuthenticationSessionsChangeEvent, IAuthenticationProvider, IAuthenticationService, IAuthenticationExtensionsService, INTERNAL_AUTH_PROVIDER_PREFIX as INTERNAL_MODEL_AUTH_PROVIDER_PREFIX, AuthenticationSessionAccount, IAuthenticationProviderSessionOptions } from "../../services/authentication/common/authentication.js";
import { ExtHostAuthenticationShape, ExtHostContext, MainContext, MainThreadAuthenticationShape } from "../common/extHost.protocol.js";
import { IDialogService, IPromptButton } from "../../../platform/dialogs/common/dialogs.js";
import Severity from "../../../base/common/severity.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { ActivationKind, IExtensionService } from "../../services/extensions/common/extensions.js";
import { ITelemetryService } from "../../../platform/telemetry/common/telemetry.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { IAuthenticationAccessService } from "../../services/authentication/browser/authenticationAccessService.js";
import { IAuthenticationUsageService } from "../../services/authentication/browser/authenticationUsageService.js";
import { getAuthenticationProviderActivationEvent } from "../../services/authentication/browser/authenticationService.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { CancellationError } from "../../../base/common/errors.js";
import { ILogService } from "../../../platform/log/common/log.js";
class MainThreadAuthenticationProvider extends Disposable {
  constructor(_proxy, id, label, supportsMultipleAccounts, notificationService, onDidChangeSessionsEmitter) {
    super();
    this._proxy = _proxy;
    this.id = id;
    this.label = label;
    this.supportsMultipleAccounts = supportsMultipleAccounts;
    this.notificationService = notificationService;
    this.onDidChangeSessions = onDidChangeSessionsEmitter.event;
  }
  static {
    __name(this, "MainThreadAuthenticationProvider");
  }
  onDidChangeSessions;
  async getSessions(scopes, options) {
    return this._proxy.$getSessions(this.id, scopes, options);
  }
  createSession(scopes, options) {
    return this._proxy.$createSession(this.id, scopes, options);
  }
  async removeSession(sessionId) {
    await this._proxy.$removeSession(this.id, sessionId);
    this.notificationService.info(nls.localize("signedOut", "Successfully signed out."));
  }
}
let MainThreadAuthentication = class extends Disposable {
  constructor(extHostContext, authenticationService, authenticationExtensionsService, authenticationAccessService, authenticationUsageService, dialogService, notificationService, extensionService, telemetryService, openerService, logService) {
    super();
    this.authenticationService = authenticationService;
    this.authenticationExtensionsService = authenticationExtensionsService;
    this.authenticationAccessService = authenticationAccessService;
    this.authenticationUsageService = authenticationUsageService;
    this.dialogService = dialogService;
    this.notificationService = notificationService;
    this.extensionService = extensionService;
    this.telemetryService = telemetryService;
    this.openerService = openerService;
    this.logService = logService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostAuthentication);
    this._register(this.authenticationService.onDidChangeSessions((e) => {
      this._proxy.$onDidChangeAuthenticationSessions(e.providerId, e.label);
    }));
    this._register(this.authenticationExtensionsService.onDidChangeAccountPreference((e) => {
      const providerInfo = this.authenticationService.getProvider(e.providerId);
      this._proxy.$onDidChangeAuthenticationSessions(providerInfo.id, providerInfo.label, e.extensionIds);
    }));
  }
  _proxy;
  _registrations = this._register(new DisposableMap());
  _sentProviderUsageEvents = /* @__PURE__ */ new Set();
  async $registerAuthenticationProvider(id, label, supportsMultipleAccounts) {
    if (!this.authenticationService.declaredProviders.find((p) => p.id === id)) {
      this.logService.warn(`Authentication provider ${id} was not declared in the Extension Manifest.`);
      this.telemetryService.publicLog2("authentication.providerNotDeclared", { id });
    }
    const emitter = new Emitter();
    this._registrations.set(id, emitter);
    const provider = new MainThreadAuthenticationProvider(this._proxy, id, label, supportsMultipleAccounts, this.notificationService, emitter);
    this.authenticationService.registerAuthenticationProvider(id, provider);
  }
  $unregisterAuthenticationProvider(id) {
    this._registrations.deleteAndDispose(id);
    this.authenticationService.unregisterAuthenticationProvider(id);
  }
  async $ensureProvider(id) {
    if (!this.authenticationService.isAuthenticationProviderRegistered(id)) {
      return await this.extensionService.activateByEvent(getAuthenticationProviderActivationEvent(id), ActivationKind.Immediate);
    }
  }
  $sendDidChangeSessions(providerId, event) {
    const obj = this._registrations.get(providerId);
    if (obj instanceof Emitter) {
      obj.fire(event);
    }
  }
  $removeSession(providerId, sessionId) {
    return this.authenticationService.removeSession(providerId, sessionId);
  }
  async loginPrompt(provider, extensionName, recreatingSession, options) {
    let message;
    if (provider.id.startsWith(INTERNAL_MODEL_AUTH_PROVIDER_PREFIX)) {
      message = nls.localize("confirmModelAccess", "The extension '{0}' wants to access the language models provided by {1}.", extensionName, provider.label);
    } else {
      message = recreatingSession ? nls.localize("confirmRelogin", "The extension '{0}' wants you to sign in again using {1}.", extensionName, provider.label) : nls.localize("confirmLogin", "The extension '{0}' wants to sign in using {1}.", extensionName, provider.label);
    }
    const buttons = [
      {
        label: nls.localize({ key: "allow", comment: ["&& denotes a mnemonic"] }, "&&Allow"),
        run() {
          return true;
        }
      }
    ];
    if (options?.learnMore) {
      buttons.push({
        label: nls.localize("learnMore", "Learn more"),
        run: /* @__PURE__ */ __name(async () => {
          const result2 = this.loginPrompt(provider, extensionName, recreatingSession, options);
          await this.openerService.open(URI.revive(options.learnMore), { allowCommands: true });
          return await result2;
        }, "run")
      });
    }
    const { result } = await this.dialogService.prompt({
      type: Severity.Info,
      message,
      buttons,
      detail: options?.detail,
      cancelButton: true
    });
    return result ?? false;
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
  async doGetSession(providerId, scopes, extensionId, extensionName, options) {
    const sessions = await this.authenticationService.getSessions(providerId, scopes, options.account, true);
    const provider = this.authenticationService.getProvider(providerId);
    if (options.forceNewSession && options.createIfNone) {
      throw new Error("Invalid combination of options. Please remove one of the following: forceNewSession, createIfNone");
    }
    if (options.forceNewSession && options.silent) {
      throw new Error("Invalid combination of options. Please remove one of the following: forceNewSession, silent");
    }
    if (options.createIfNone && options.silent) {
      throw new Error("Invalid combination of options. Please remove one of the following: createIfNone, silent");
    }
    if (options.clearSessionPreference) {
      this._removeAccountPreference(extensionId, providerId, scopes);
    }
    const matchingAccountPreferenceSession = (
      // If an account was passed in, that takes precedence over the account preference
      options.account ? sessions[0] : this._getAccountPreference(extensionId, providerId, scopes, sessions)
    );
    if (!options.forceNewSession && sessions.length) {
      if (matchingAccountPreferenceSession && this.authenticationAccessService.isAccessAllowed(providerId, matchingAccountPreferenceSession.account.label, extensionId)) {
        return matchingAccountPreferenceSession;
      }
      if (!provider.supportsMultipleAccounts && this.authenticationAccessService.isAccessAllowed(providerId, sessions[0].account.label, extensionId)) {
        return sessions[0];
      }
    }
    if (options.createIfNone || options.forceNewSession) {
      let uiOptions;
      if (typeof options.forceNewSession === "object") {
        uiOptions = options.forceNewSession;
      } else if (typeof options.createIfNone === "object") {
        uiOptions = options.createIfNone;
      }
      const recreatingSession = !!(options.forceNewSession && sessions.length);
      const isAllowed = await this.loginPrompt(provider, extensionName, recreatingSession, uiOptions);
      if (!isAllowed) {
        throw new Error("User did not consent to login.");
      }
      let session;
      if (sessions?.length && !options.forceNewSession) {
        session = provider.supportsMultipleAccounts && !options.account ? await this.authenticationExtensionsService.selectSession(providerId, extensionId, extensionName, scopes, sessions) : sessions[0];
      } else {
        const accountToCreate = options.account ?? matchingAccountPreferenceSession?.account;
        do {
          session = await this.authenticationService.createSession(providerId, scopes, { activateImmediate: true, account: accountToCreate });
        } while (accountToCreate && accountToCreate.label !== session.account.label && !await this.continueWithIncorrectAccountPrompt(session.account.label, accountToCreate.label));
      }
      this.authenticationAccessService.updateAllowedExtensions(providerId, session.account.label, [{ id: extensionId, name: extensionName, allowed: true }]);
      this._updateAccountPreference(extensionId, providerId, session);
      return session;
    }
    if (!matchingAccountPreferenceSession && !this.authenticationExtensionsService.getAccountPreference(extensionId, providerId)) {
      const validSession = sessions.find((session) => this.authenticationAccessService.isAccessAllowed(providerId, session.account.label, extensionId));
      if (validSession) {
        return validSession;
      }
    }
    if (!options.silent) {
      sessions.length ? this.authenticationExtensionsService.requestSessionAccess(providerId, extensionId, extensionName, scopes, sessions) : await this.authenticationExtensionsService.requestNewSession(providerId, scopes, extensionId, extensionName);
    }
    return void 0;
  }
  async $getSession(providerId, scopes, extensionId, extensionName, options) {
    this.sendClientIdUsageTelemetry(extensionId, providerId, scopes);
    const session = await this.doGetSession(providerId, scopes, extensionId, extensionName, options);
    if (session) {
      this.sendProviderUsageTelemetry(extensionId, providerId);
      this.authenticationUsageService.addAccountUsage(providerId, session.account.label, scopes, extensionId, extensionName);
    }
    return session;
  }
  async $getAccounts(providerId) {
    const accounts = await this.authenticationService.getAccounts(providerId);
    return accounts;
  }
  // TODO@TylerLeonhardt this is a temporary addition to telemetry to understand what extensions are overriding the client id.
  // We can use this telemetry to reach out to these extension authors and let them know that they many need configuration changes
  // due to the adoption of the Microsoft broker.
  // Remove this in a few iterations.
  _sentClientIdUsageEvents = /* @__PURE__ */ new Set();
  sendClientIdUsageTelemetry(extensionId, providerId, scopes) {
    const containsVSCodeClientIdScope = scopes.some((scope) => scope.startsWith("VSCODE_CLIENT_ID:"));
    const key = `${extensionId}|${providerId}|${containsVSCodeClientIdScope}`;
    if (this._sentClientIdUsageEvents.has(key)) {
      return;
    }
    this._sentClientIdUsageEvents.add(key);
    if (containsVSCodeClientIdScope) {
      this.telemetryService.publicLog2("authentication.clientIdUsage", { extensionId });
    }
  }
  sendProviderUsageTelemetry(extensionId, providerId) {
    const key = `${extensionId}|${providerId}`;
    if (this._sentProviderUsageEvents.has(key)) {
      return;
    }
    this._sentProviderUsageEvents.add(key);
    this.telemetryService.publicLog2("authentication.providerUsage", { providerId, extensionId });
  }
  //#region Account Preferences
  // TODO@TylerLeonhardt: Update this after a few iterations to no longer fallback to the session preference
  _getAccountPreference(extensionId, providerId, scopes, sessions) {
    if (sessions.length === 0) {
      return void 0;
    }
    const accountNamePreference = this.authenticationExtensionsService.getAccountPreference(extensionId, providerId);
    if (accountNamePreference) {
      const session = sessions.find((session2) => session2.account.label === accountNamePreference);
      return session;
    }
    const sessionIdPreference = this.authenticationExtensionsService.getSessionPreference(providerId, extensionId, scopes);
    if (sessionIdPreference) {
      const session = sessions.find((session2) => session2.id === sessionIdPreference);
      if (session) {
        this.authenticationExtensionsService.updateAccountPreference(extensionId, providerId, session.account);
        return session;
      }
    }
    return void 0;
  }
  _updateAccountPreference(extensionId, providerId, session) {
    this.authenticationExtensionsService.updateAccountPreference(extensionId, providerId, session.account);
    this.authenticationExtensionsService.updateSessionPreference(providerId, extensionId, session);
  }
  _removeAccountPreference(extensionId, providerId, scopes) {
    this.authenticationExtensionsService.removeAccountPreference(extensionId, providerId);
    this.authenticationExtensionsService.removeSessionPreference(providerId, extensionId, scopes);
  }
  //#endregion
};
__name(MainThreadAuthentication, "MainThreadAuthentication");
MainThreadAuthentication = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadAuthentication),
  __decorateParam(1, IAuthenticationService),
  __decorateParam(2, IAuthenticationExtensionsService),
  __decorateParam(3, IAuthenticationAccessService),
  __decorateParam(4, IAuthenticationUsageService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, ILogService)
], MainThreadAuthentication);
export {
  MainThreadAuthentication,
  MainThreadAuthenticationProvider
};
//# sourceMappingURL=mainThreadAuthentication.js.map
