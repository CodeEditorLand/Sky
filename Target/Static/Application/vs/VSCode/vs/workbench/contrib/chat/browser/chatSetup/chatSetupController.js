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
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { isCancellationError } from "../../../../../base/common/errors.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import Severity from "../../../../../base/common/severity.js";
import { StopWatch } from "../../../../../base/common/stopwatch.js";
import { isObject, isUndefined } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { Extensions as ConfigurationExtensions } from "../../../../../platform/configuration/common/configurationRegistry.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import product from "../../../../../platform/product/common/product.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IProgressService } from "../../../../../platform/progress/common/progress.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IActivityService, ProgressBadge } from "../../../../services/activity/common/activity.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { IExtensionsWorkbenchService } from "../../../extensions/common/extensions.js";
import { ChatEntitlement, isProUser } from "../../../../services/chat/common/chatEntitlementService.js";
import { CHAT_OPEN_ACTION_ID } from "../actions/chatActions.js";
import { ChatViewId, ChatViewContainerId } from "../chat.js";
import { ChatSetupStep, refreshTokens, maybeEnableAuthExtension } from "./chatSetup.js";
import { IDefaultAccountService } from "../../../../../platform/defaultAccount/common/defaultAccount.js";
const defaultChat = {
  chatExtensionId: product.defaultChatAgent?.chatExtensionId ?? "",
  provider: product.defaultChatAgent?.provider ?? { default: { id: "", name: "" }, enterprise: { id: "", name: "" }, apple: { id: "", name: "" }, google: { id: "", name: "" } },
  providerUriSetting: product.defaultChatAgent?.providerUriSetting ?? "",
  completionsAdvancedSetting: product.defaultChatAgent?.completionsAdvancedSetting ?? ""
};
let ChatSetupController = class ChatSetupController2 extends Disposable {
  static {
    __name(this, "ChatSetupController");
  }
  get step() {
    return this._step;
  }
  constructor(context, requests, telemetryService, extensionsWorkbenchService, productService, logService, progressService, activityService, commandService, dialogService, configurationService, lifecycleService, quickInputService, defaultAccountService) {
    super();
    this.context = context;
    this.requests = requests;
    this.telemetryService = telemetryService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.productService = productService;
    this.logService = logService;
    this.progressService = progressService;
    this.activityService = activityService;
    this.commandService = commandService;
    this.dialogService = dialogService;
    this.configurationService = configurationService;
    this.lifecycleService = lifecycleService;
    this.quickInputService = quickInputService;
    this.defaultAccountService = defaultAccountService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._step = ChatSetupStep.Initial;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.context.onDidChange(() => this._onDidChange.fire()));
  }
  setStep(step) {
    if (this._step === step) {
      return;
    }
    this._step = step;
    this._onDidChange.fire();
  }
  async setup(options = {}) {
    const watch = new StopWatch(false);
    const title = localize("setupChatProgress", "Getting chat ready...");
    const badge = this.activityService.showViewContainerActivity(ChatViewContainerId, {
      badge: new ProgressBadge(() => title)
    });
    try {
      return await this.progressService.withProgress({
        location: 10,
        command: CHAT_OPEN_ACTION_ID,
        title
      }, () => this.doSetup(options, watch));
    } finally {
      badge.dispose();
    }
  }
  async doSetup(options, watch) {
    this.context.suspend();
    let success = false;
    try {
      let entitlement;
      let signIn;
      if (options.forceSignIn) {
        signIn = true;
      } else if (this.context.state.entitlement === ChatEntitlement.Unknown) {
        if (options.forceAnonymous) {
          signIn = false;
        } else {
          signIn = true;
        }
      } else {
        signIn = false;
      }
      if (signIn) {
        this.setStep(ChatSetupStep.SigningIn);
        const result = await this.signIn(options);
        if (!result.defaultAccount) {
          this.doInstall();
          const provider = options.useSocialProvider ?? (options.useEnterpriseProvider ? defaultChat.provider.enterprise.id : defaultChat.provider.default.id);
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedNotSignedIn", installDuration: watch.elapsed(), signUpErrorCode: void 0, provider });
          return void 0;
        }
        entitlement = result.entitlement;
      }
      this.setStep(ChatSetupStep.Installing);
      success = await this.install(entitlement ?? this.context.state.entitlement, watch, options);
    } finally {
      this.setStep(ChatSetupStep.Initial);
      this.context.resume();
    }
    return success;
  }
  async signIn(options) {
    const authExtensionReEnabled = await maybeEnableAuthExtension(this.extensionsWorkbenchService, this.logService);
    if (authExtensionReEnabled) {
      refreshTokens(this.commandService);
    }
    let entitlements;
    let defaultAccount;
    try {
      ({ defaultAccount, entitlements } = await this.requests.signIn(options));
    } catch (e) {
      this.logService.error(`[chat setup] signIn: error ${e}`);
    }
    if (!defaultAccount && !this.lifecycleService.willShutdown) {
      const { confirmed } = await this.dialogService.confirm({
        type: Severity.Error,
        message: localize("unknownSignInError", "Failed to sign in to {0}. Would you like to try again?", this.defaultAccountService.getDefaultAccountAuthenticationProvider().name),
        detail: localize("unknownSignInErrorDetail", "You must be signed in to use AI features."),
        primaryButton: localize("retry", "Retry")
      });
      if (confirmed) {
        return this.signIn(options);
      }
    }
    return { defaultAccount, entitlement: entitlements?.entitlement };
  }
  async install(entitlement, watch, options) {
    const wasRunning = this.context.state.installed && !this.context.state.disabled;
    let signUpResult = void 0;
    let provider;
    if (options.forceAnonymous && entitlement === ChatEntitlement.Unknown) {
      provider = "anonymous";
    } else {
      provider = options.useSocialProvider ?? (options.useEnterpriseProvider ? defaultChat.provider.enterprise.id : defaultChat.provider.default.id);
    }
    try {
      if (!options.forceAnonymous && // User is not asking for anonymous access
      entitlement !== ChatEntitlement.Free && // User is not signed up to Copilot Free
      !isProUser(entitlement) && // User is not signed up for a Copilot subscription
      entitlement !== ChatEntitlement.Unavailable) {
        signUpResult = await this.requests.signUpFree();
        if (isUndefined(signUpResult)) {
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedNoSession", installDuration: watch.elapsed(), signUpErrorCode: void 0, provider });
          return false;
        }
        if (typeof signUpResult !== "boolean") {
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedSignUp", installDuration: watch.elapsed(), signUpErrorCode: signUpResult.errorCode, provider });
        }
      }
      await this.doInstallWithRetry();
    } catch (error) {
      this.logService.error(`[chat setup] install: error ${error}`);
      this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: isCancellationError(error) ? "cancelled" : "failedInstall", installDuration: watch.elapsed(), signUpErrorCode: void 0, provider });
      return false;
    }
    if (typeof signUpResult === "boolean" || typeof signUpResult === "undefined") {
      this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: wasRunning && !signUpResult ? "alreadyInstalled" : "installed", installDuration: watch.elapsed(), signUpErrorCode: void 0, provider });
    }
    if (wasRunning) {
      refreshTokens(this.commandService);
    }
    return true;
  }
  async doInstallWithRetry() {
    let error;
    try {
      await this.doInstall();
    } catch (e) {
      this.logService.error(`[chat setup] install: error ${error}`);
      error = e;
    }
    if (error) {
      if (!this.lifecycleService.willShutdown) {
        const { confirmed } = await this.dialogService.confirm({
          type: Severity.Error,
          message: localize("unknownSetupError", "An error occurred while setting up chat. Would you like to try again?"),
          detail: error && !isCancellationError(error) ? toErrorMessage(error) : void 0,
          primaryButton: localize("retry", "Retry")
        });
        if (confirmed) {
          return this.doInstallWithRetry();
        }
      }
      throw error;
    }
  }
  async doInstall() {
    await this.extensionsWorkbenchService.install(defaultChat.chatExtensionId, {
      enable: true,
      isApplicationScoped: true,
      // install into all profiles
      isMachineScoped: false,
      // do not ask to sync
      installEverywhere: true,
      // install in local and remote
      installPreReleaseVersion: this.productService.quality !== "stable"
    }, ChatViewId);
  }
  async setupWithProvider(options) {
    const registry = Registry.as(ConfigurationExtensions.Configuration);
    registry.registerConfiguration({
      "id": "copilot.setup",
      "type": "object",
      "properties": {
        [defaultChat.completionsAdvancedSetting]: {
          "type": "object",
          "properties": {
            "authProvider": {
              "type": "string"
            }
          }
        },
        [defaultChat.providerUriSetting]: {
          "type": "string"
        }
      }
    });
    if (options.useEnterpriseProvider) {
      const success = await this.handleEnterpriseInstance();
      if (!success) {
        this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedEnterpriseSetup", installDuration: 0, signUpErrorCode: void 0, provider: void 0 });
        return success;
      }
    }
    let existingAdvancedSetting = this.configurationService.inspect(defaultChat.completionsAdvancedSetting).user?.value;
    if (!isObject(existingAdvancedSetting)) {
      existingAdvancedSetting = {};
    }
    if (options.useEnterpriseProvider) {
      await this.configurationService.updateValue(
        `${defaultChat.completionsAdvancedSetting}`,
        {
          ...existingAdvancedSetting,
          "authProvider": defaultChat.provider.enterprise.id
        },
        2
        /* ConfigurationTarget.USER */
      );
    } else {
      await this.configurationService.updateValue(
        `${defaultChat.completionsAdvancedSetting}`,
        Object.keys(existingAdvancedSetting).length > 0 ? {
          ...existingAdvancedSetting,
          "authProvider": void 0
        } : void 0,
        2
        /* ConfigurationTarget.USER */
      );
    }
    return this.setup({ ...options, forceSignIn: true });
  }
  async handleEnterpriseInstance() {
    const domainRegEx = /^[a-zA-Z\-_]+$/;
    const fullUriRegEx = /^(https:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.ghe\.com\/?$/;
    const uri = this.configurationService.getValue(defaultChat.providerUriSetting);
    if (typeof uri === "string" && fullUriRegEx.test(uri)) {
      return true;
    }
    let isSingleWord = false;
    const result = await this.quickInputService.input({
      prompt: localize("enterpriseInstance", "What is your {0} instance?", defaultChat.provider.enterprise.name),
      placeHolder: localize("enterpriseInstancePlaceholder", 'i.e. "octocat" or "https://octocat.ghe.com"...'),
      ignoreFocusLost: true,
      value: uri,
      validateInput: /* @__PURE__ */ __name(async (value) => {
        isSingleWord = false;
        if (!value) {
          return void 0;
        }
        if (domainRegEx.test(value)) {
          isSingleWord = true;
          return {
            content: localize("willResolveTo", "Will resolve to {0}", `https://${value}.ghe.com`),
            severity: Severity.Info
          };
        }
        if (!fullUriRegEx.test(value)) {
          return {
            content: localize("invalidEnterpriseInstance", 'You must enter a valid {0} instance (i.e. "octocat" or "https://octocat.ghe.com")', defaultChat.provider.enterprise.name),
            severity: Severity.Error
          };
        }
        return void 0;
      }, "validateInput")
    });
    if (!result) {
      return void 0;
    }
    let resolvedUri = result;
    if (isSingleWord) {
      resolvedUri = `https://${resolvedUri}.ghe.com`;
    } else {
      const normalizedUri = result.toLowerCase();
      const hasHttps = normalizedUri.startsWith("https://");
      if (!hasHttps) {
        resolvedUri = `https://${result}`;
      }
    }
    await this.configurationService.updateValue(
      defaultChat.providerUriSetting,
      resolvedUri,
      2
      /* ConfigurationTarget.USER */
    );
    return true;
  }
};
ChatSetupController = __decorate([
  __param(2, ITelemetryService),
  __param(3, IExtensionsWorkbenchService),
  __param(4, IProductService),
  __param(5, ILogService),
  __param(6, IProgressService),
  __param(7, IActivityService),
  __param(8, ICommandService),
  __param(9, IDialogService),
  __param(10, IConfigurationService),
  __param(11, ILifecycleService),
  __param(12, IQuickInputService),
  __param(13, IDefaultAccountService)
], ChatSetupController);
export {
  ChatSetupController
};
//# sourceMappingURL=chatSetupController.js.map
