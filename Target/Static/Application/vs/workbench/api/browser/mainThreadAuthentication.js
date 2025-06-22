var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import * as nls from "../../../nls.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IAuthenticationService, IAuthenticationExtensionsService } from "../../services/authentication/common/authentication.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import Severity from "../../../base/common/severity.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { ITelemetryService } from "../../../platform/telemetry/common/telemetry.js";
import { Emitter } from "../../../base/common/event.js";
import { IAuthenticationAccessService } from "../../services/authentication/browser/authenticationAccessService.js";
import { IAuthenticationUsageService } from "../../services/authentication/browser/authenticationUsageService.js";
import { getAuthenticationProviderActivationEvent } from "../../services/authentication/browser/authenticationService.js";
import { URI } from "../../../base/common/uri.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { CancellationError } from "../../../base/common/errors.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IURLService } from "../../../platform/url/common/url.js";
import { DeferredPromise, raceTimeout } from "../../../base/common/async.js";
import { IDynamicAuthenticationProviderStorageService } from "../../services/authentication/common/dynamicAuthenticationProviderStorage.js";
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
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
class MainThreadAuthenticationProvider extends Disposable {
  static {
    __name(this, "MainThreadAuthenticationProvider");
  }
  constructor(_proxy, id, label, supportsMultipleAccounts, authorizationServers, onDidChangeSessionsEmitter) {
    super();
    this._proxy = _proxy;
    this.id = id;
    this.label = label;
    this.supportsMultipleAccounts = supportsMultipleAccounts;
    this.authorizationServers = authorizationServers;
    this.onDidChangeSessions = onDidChangeSessionsEmitter.event;
  }
  async getSessions(scopes, options) {
    return this._proxy.$getSessions(this.id, scopes, options);
  }
  createSession(scopes, options) {
    return this._proxy.$createSession(this.id, scopes, options);
  }
  async removeSession(sessionId) {
    await this._proxy.$removeSession(this.id, sessionId);
  }
}
let MainThreadAuthentication = class MainThreadAuthentication2 extends Disposable {
  static {
    __name(this, "MainThreadAuthentication");
  }
  constructor(extHostContext, authenticationService, authenticationExtensionsService, authenticationAccessService, authenticationUsageService, dialogService, notificationService, extensionService, telemetryService, openerService, logService, urlService, dynamicAuthProviderStorageService, clipboardService) {
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
    this.urlService = urlService;
    this.dynamicAuthProviderStorageService = dynamicAuthProviderStorageService;
    this.clipboardService = clipboardService;
    this._registrations = this._register(new DisposableMap());
    this._sentProviderUsageEvents = /* @__PURE__ */ new Set();
    this._suppressUnregisterEvent = false;
    this._sentClientIdUsageEvents = /* @__PURE__ */ new Set();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostAuthentication);
    this._register(this.authenticationService.onDidChangeSessions((e) => this._proxy.$onDidChangeAuthenticationSessions(e.providerId, e.label)));
    this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e) => {
      if (!this._suppressUnregisterEvent) {
        this._proxy.$onDidUnregisterAuthenticationProvider(e.id);
      }
    }));
    this._register(this.authenticationExtensionsService.onDidChangeAccountPreference((e) => {
      const providerInfo = this.authenticationService.getProvider(e.providerId);
      this._proxy.$onDidChangeAuthenticationSessions(providerInfo.id, providerInfo.label, e.extensionIds);
    }));
    this._register(this.dynamicAuthProviderStorageService.onDidChangeTokens((e) => {
      this._proxy.$onDidChangeDynamicAuthProviderTokens(e.authProviderId, e.clientId, e.tokens);
    }));
    this._register(authenticationService.registerAuthenticationProviderHostDelegate({
      // Prefer Node.js extension hosts when they're available. No CORS issues etc.
      priority: extHostContext.extensionHostKind === 2 ? 0 : 1,
      create: /* @__PURE__ */ __name(async (authorizationServer, serverMetadata, resource) => {
        const authProviderId = resource ? `${authorizationServer.toString(true)} ${resource.resource}` : authorizationServer.toString(true);
        const clientId = this.dynamicAuthProviderStorageService.getClientId(authProviderId);
        let initialTokens = void 0;
        if (clientId) {
          initialTokens = await this.dynamicAuthProviderStorageService.getSessionsForDynamicAuthProvider(authProviderId, clientId);
        }
        return await this._proxy.$registerDynamicAuthProvider(authorizationServer, serverMetadata, resource, clientId, initialTokens);
      }, "create")
    }));
  }
  async $registerAuthenticationProvider(id, label, supportsMultipleAccounts, supportedAuthorizationServer = []) {
    if (!this.authenticationService.declaredProviders.find((p) => p.id === id)) {
      this.logService.warn(`Authentication provider ${id} was not declared in the Extension Manifest.`);
      this.telemetryService.publicLog2("authentication.providerNotDeclared", { id });
    }
    const emitter = new Emitter();
    this._registrations.set(id, emitter);
    const supportedAuthorizationServerUris = supportedAuthorizationServer.map((i) => URI.revive(i));
    const provider = new MainThreadAuthenticationProvider(this._proxy, id, label, supportsMultipleAccounts, supportedAuthorizationServerUris, emitter);
    this.authenticationService.registerAuthenticationProvider(id, provider);
  }
  async $unregisterAuthenticationProvider(id) {
    this._registrations.deleteAndDispose(id);
    this._suppressUnregisterEvent = true;
    try {
      this.authenticationService.unregisterAuthenticationProvider(id);
    } finally {
      this._suppressUnregisterEvent = false;
    }
  }
  async $ensureProvider(id) {
    if (!this.authenticationService.isAuthenticationProviderRegistered(id)) {
      return await this.extensionService.activateByEvent(
        getAuthenticationProviderActivationEvent(id),
        1
        /* ActivationKind.Immediate */
      );
    }
  }
  async $sendDidChangeSessions(providerId, event) {
    const obj = this._registrations.get(providerId);
    if (obj instanceof Emitter) {
      obj.fire(event);
    }
  }
  $removeSession(providerId, sessionId) {
    return this.authenticationService.removeSession(providerId, sessionId);
  }
  async $waitForUriHandler(expectedUri) {
    const deferredPromise = new DeferredPromise();
    const disposable = this.urlService.registerHandler({
      handleURL: /* @__PURE__ */ __name(async (uri) => {
        if (uri.scheme !== expectedUri.scheme || uri.authority !== expectedUri.authority || uri.path !== expectedUri.path) {
          return false;
        }
        deferredPromise.complete(uri);
        disposable.dispose();
        return true;
      }, "handleURL")
    });
    const result = await raceTimeout(deferredPromise.p, 5 * 60 * 1e3);
    if (!result) {
      throw new Error("Timed out waiting for URI handler");
    }
    return await deferredPromise.p;
  }
  $showContinueNotification(message) {
    const yes = nls.localize("yes", "Yes");
    const no = nls.localize("no", "No");
    const deferredPromise = new DeferredPromise();
    let result = false;
    const handle = this.notificationService.prompt(Severity.Warning, message, [{
      label: yes,
      run: /* @__PURE__ */ __name(() => result = true, "run")
    }, {
      label: no,
      run: /* @__PURE__ */ __name(() => result = false, "run")
    }]);
    const disposable = handle.onDidClose(() => {
      deferredPromise.complete(result);
      disposable.dispose();
    });
    return deferredPromise.p;
  }
  async $registerDynamicAuthenticationProvider(id, label, authorizationServer, clientId) {
    await this.$registerAuthenticationProvider(id, label, true, [authorizationServer]);
    this.dynamicAuthProviderStorageService.storeClientId(id, URI.revive(authorizationServer).toString(true), clientId, label);
  }
  async $setSessionsForDynamicAuthProvider(authProviderId, clientId, sessions) {
    await this.dynamicAuthProviderStorageService.setSessionsForDynamicAuthProvider(authProviderId, clientId, sessions);
  }
  async loginPrompt(provider, extensionName, recreatingSession, options) {
    let message;
    const customMessage = provider.confirmation?.(extensionName, recreatingSession);
    if (customMessage) {
      message = customMessage;
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
    const authorizationServer = URI.revive(options.authorizationServer);
    const sessions = await this.authenticationService.getSessions(providerId, scopes, { account: options.account, authorizationServer }, true);
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
          session = await this.authenticationService.createSession(providerId, scopes, {
            activateImmediate: true,
            account: accountToCreate,
            authorizationServer
          });
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
  async $showDeviceCodeModal(userCode, verificationUri) {
    const { result } = await this.dialogService.prompt({
      type: Severity.Info,
      message: nls.localize("deviceCodeTitle", "Device Code Authentication"),
      detail: nls.localize("deviceCodeDetail", "Your code: {0}\n\nTo complete authentication, navigate to {1} and enter the code above.", userCode, verificationUri),
      buttons: [
        {
          label: nls.localize("copyAndContinue", "Copy & Continue"),
          run: /* @__PURE__ */ __name(() => true, "run")
        }
      ],
      cancelButton: true
    });
    if (result) {
      try {
        await this.clipboardService.writeText(userCode);
        return await this.openerService.open(URI.parse(verificationUri));
      } catch (error) {
        this.notificationService.error(nls.localize("failedToOpenUri", "Failed to open {0}", verificationUri));
      }
    }
    return false;
  }
};
MainThreadAuthentication = __decorate([
  extHostNamedCustomer(MainContext.MainThreadAuthentication),
  __param(1, IAuthenticationService),
  __param(2, IAuthenticationExtensionsService),
  __param(3, IAuthenticationAccessService),
  __param(4, IAuthenticationUsageService),
  __param(5, IDialogService),
  __param(6, INotificationService),
  __param(7, IExtensionService),
  __param(8, ITelemetryService),
  __param(9, IOpenerService),
  __param(10, ILogService),
  __param(11, IURLService),
  __param(12, IDynamicAuthenticationProviderStorageService),
  __param(13, IClipboardService)
], MainThreadAuthentication);
export {
  MainThreadAuthentication,
  MainThreadAuthenticationProvider
};
//# sourceMappingURL=mainThreadAuthentication.js.map
