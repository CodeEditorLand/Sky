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
var ChatSetup_1;
import "./media/chatSetup.css";
import { $ } from "../../../../../base/browser/dom.js";
import { Dialog, DialogContentsAlignment } from "../../../../../base/browser/ui/dialog/dialog.js";
import { coalesce } from "../../../../../base/common/arrays.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IMarkdownRendererService } from "../../../../../platform/markdown/browser/markdownRenderer.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { createWorkbenchDialogOptions } from "../../../../../platform/dialogs/browser/dialog.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import product from "../../../../../platform/product/common/product.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceTrustRequestService } from "../../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkbenchLayoutService } from "../../../../services/layout/browser/layoutService.js";
import { ChatEntitlement, ChatEntitlementRequests, IChatEntitlementService, isProUser } from "../../../../services/chat/common/chatEntitlementService.js";
import { IChatWidgetService } from "../chat.js";
import { ChatSetupAnonymous, ChatSetupStrategy } from "./chatSetup.js";
const defaultChat = {
  publicCodeMatchesUrl: product.defaultChatAgent?.publicCodeMatchesUrl ?? "",
  provider: product.defaultChatAgent?.provider ?? { default: { id: "", name: "" }, enterprise: { id: "", name: "" }, apple: { id: "", name: "" }, google: { id: "", name: "" } },
  manageSettingsUrl: product.defaultChatAgent?.manageSettingsUrl ?? "",
  completionsRefreshTokenCommand: product.defaultChatAgent?.completionsRefreshTokenCommand ?? "",
  chatRefreshTokenCommand: product.defaultChatAgent?.chatRefreshTokenCommand ?? "",
  termsStatementUrl: product.defaultChatAgent?.termsStatementUrl ?? "",
  privacyStatementUrl: product.defaultChatAgent?.privacyStatementUrl ?? ""
};
let ChatSetup = class ChatSetup2 {
  static {
    __name(this, "ChatSetup");
  }
  static {
    ChatSetup_1 = this;
  }
  static {
    this.instance = void 0;
  }
  static getInstance(instantiationService, context, controller) {
    let instance = ChatSetup_1.instance;
    if (!instance) {
      instance = ChatSetup_1.instance = instantiationService.invokeFunction((accessor) => {
        return new ChatSetup_1(context, controller, accessor.get(ITelemetryService), accessor.get(IWorkbenchLayoutService), accessor.get(IKeybindingService), accessor.get(IChatEntitlementService), accessor.get(ILogService), accessor.get(IConfigurationService), accessor.get(IChatWidgetService), accessor.get(IWorkspaceTrustRequestService), accessor.get(IMarkdownRendererService));
      });
    }
    return instance;
  }
  constructor(context, controller, telemetryService, layoutService, keybindingService, chatEntitlementService, logService, configurationService, widgetService, workspaceTrustRequestService, markdownRendererService) {
    this.context = context;
    this.controller = controller;
    this.telemetryService = telemetryService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.chatEntitlementService = chatEntitlementService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.widgetService = widgetService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.markdownRendererService = markdownRendererService;
    this.pendingRun = void 0;
    this.skipDialogOnce = false;
  }
  skipDialog() {
    this.skipDialogOnce = true;
  }
  async run(options) {
    if (this.pendingRun) {
      return this.pendingRun;
    }
    this.pendingRun = this.doRun(options);
    try {
      return await this.pendingRun;
    } finally {
      this.pendingRun = void 0;
    }
  }
  async doRun(options) {
    this.context.update({ later: false });
    const dialogSkipped = this.skipDialogOnce;
    this.skipDialogOnce = false;
    const trusted = await this.workspaceTrustRequestService.requestWorkspaceTrust({
      message: localize("chatWorkspaceTrust", "AI features are currently only supported in trusted workspaces.")
    });
    if (!trusted) {
      this.context.update({ later: true });
      this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedNotTrusted", installDuration: 0, signUpErrorCode: void 0, provider: void 0 });
      return {
        dialogSkipped,
        success: void 0
        /* canceled */
      };
    }
    let setupStrategy;
    if (!options?.forceSignInDialog && (dialogSkipped || isProUser(this.chatEntitlementService.entitlement) || this.chatEntitlementService.entitlement === ChatEntitlement.Free)) {
      setupStrategy = ChatSetupStrategy.DefaultSetup;
    } else if (options?.forceAnonymous === ChatSetupAnonymous.EnabledWithoutDialog) {
      setupStrategy = ChatSetupStrategy.DefaultSetup;
    } else {
      setupStrategy = await this.showDialog(options);
    }
    if (setupStrategy === ChatSetupStrategy.DefaultSetup && ChatEntitlementRequests.providerId(this.configurationService) === defaultChat.provider.enterprise.id) {
      setupStrategy = ChatSetupStrategy.SetupWithEnterpriseProvider;
    }
    if (setupStrategy !== ChatSetupStrategy.Canceled && !options?.disableChatViewReveal) {
      this.widgetService.revealWidget();
    }
    let success = void 0;
    try {
      switch (setupStrategy) {
        case ChatSetupStrategy.SetupWithEnterpriseProvider:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: true, useSocialProvider: void 0, additionalScopes: options?.additionalScopes, forceAnonymous: options?.forceAnonymous });
          break;
        case ChatSetupStrategy.SetupWithoutEnterpriseProvider:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: false, useSocialProvider: void 0, additionalScopes: options?.additionalScopes, forceAnonymous: options?.forceAnonymous });
          break;
        case ChatSetupStrategy.SetupWithAppleProvider:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: false, useSocialProvider: "apple", additionalScopes: options?.additionalScopes, forceAnonymous: options?.forceAnonymous });
          break;
        case ChatSetupStrategy.SetupWithGoogleProvider:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: false, useSocialProvider: "google", additionalScopes: options?.additionalScopes, forceAnonymous: options?.forceAnonymous });
          break;
        case ChatSetupStrategy.DefaultSetup:
          success = await this.controller.value.setup({ ...options, forceAnonymous: options?.forceAnonymous });
          break;
        case ChatSetupStrategy.Canceled:
          this.context.update({ later: true });
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedMaybeLater", installDuration: 0, signUpErrorCode: void 0, provider: void 0 });
          break;
      }
    } catch (error) {
      this.logService.error(`[chat setup] Error during setup: ${toErrorMessage(error)}`);
      success = false;
    }
    return { success, dialogSkipped };
  }
  async showDialog(options) {
    const disposables = new DisposableStore();
    const buttons = this.getButtons(options);
    const dialog = disposables.add(new Dialog(this.layoutService.activeContainer, this.getDialogTitle(options), buttons.map((button2) => button2[0]), createWorkbenchDialogOptions({
      type: "none",
      extraClasses: ["chat-setup-dialog"],
      detail: " ",
      // workaround allowing us to render the message in large
      icon: Codicon.copilotLarge,
      alignment: DialogContentsAlignment.Vertical,
      cancelId: buttons.length - 1,
      disableCloseButton: true,
      renderFooter: /* @__PURE__ */ __name((footer) => footer.appendChild(this.createDialogFooter(disposables, options)), "renderFooter"),
      buttonOptions: buttons.map((button2) => button2[2])
    }, this.keybindingService, this.layoutService)));
    const { button } = await dialog.show();
    disposables.dispose();
    return buttons[button]?.[1] ?? ChatSetupStrategy.Canceled;
  }
  getButtons(options) {
    const styleButton = /* @__PURE__ */ __name((...classes) => ({ styleButton: /* @__PURE__ */ __name((button) => button.element.classList.add(...classes), "styleButton") }), "styleButton");
    let buttons;
    if (!options?.forceAnonymous && (this.context.state.entitlement === ChatEntitlement.Unknown || options?.forceSignInDialog)) {
      const defaultProviderButton = [localize("continueWith", "Continue with {0}", defaultChat.provider.default.name), ChatSetupStrategy.SetupWithoutEnterpriseProvider, styleButton("continue-button", "default")];
      const defaultProviderLink = [defaultProviderButton[0], defaultProviderButton[1], styleButton("link-button")];
      const enterpriseProviderButton = [localize("continueWith", "Continue with {0}", defaultChat.provider.enterprise.name), ChatSetupStrategy.SetupWithEnterpriseProvider, styleButton("continue-button", "default")];
      const enterpriseProviderLink = [enterpriseProviderButton[0], enterpriseProviderButton[1], styleButton("link-button")];
      const googleProviderButton = [localize("continueWith", "Continue with {0}", defaultChat.provider.google.name), ChatSetupStrategy.SetupWithGoogleProvider, styleButton("continue-button", "google")];
      const appleProviderButton = [localize("continueWith", "Continue with {0}", defaultChat.provider.apple.name), ChatSetupStrategy.SetupWithAppleProvider, styleButton("continue-button", "apple")];
      if (ChatEntitlementRequests.providerId(this.configurationService) !== defaultChat.provider.enterprise.id) {
        buttons = coalesce([
          defaultProviderButton,
          googleProviderButton,
          appleProviderButton,
          enterpriseProviderLink
        ]);
      } else {
        buttons = coalesce([
          enterpriseProviderButton,
          googleProviderButton,
          appleProviderButton,
          defaultProviderLink
        ]);
      }
    } else {
      buttons = [[localize("setupAIButton", "Use AI Features"), ChatSetupStrategy.DefaultSetup, void 0]];
    }
    buttons.push([localize("skipForNow", "Skip for now"), ChatSetupStrategy.Canceled, styleButton("link-button", "skip-button")]);
    return buttons;
  }
  getDialogTitle(options) {
    if (this.chatEntitlementService.anonymous) {
      if (options?.forceAnonymous) {
        return localize("startUsing", "Start using AI Features");
      } else {
        return localize("enableMore", "Enable more AI features");
      }
    }
    if (this.context.state.entitlement === ChatEntitlement.Unknown || options?.forceSignInDialog) {
      return localize("signIn", "Sign in to use AI Features");
    }
    return localize("startUsing", "Start using AI Features");
  }
  createDialogFooter(disposables, options) {
    const element = $(".chat-setup-dialog-footer");
    let footer;
    if (options?.forceAnonymous || this.telemetryService.telemetryLevel === 0) {
      footer = localize({ key: "settingsAnonymous", comment: ['{Locked="["}', '{Locked="]({1})"}', '{Locked="]({2})"}'] }, "By continuing, you agree to {0}'s [Terms]({1}) and [Privacy Statement]({2}).", defaultChat.provider.default.name, defaultChat.termsStatementUrl, defaultChat.privacyStatementUrl);
    } else {
      footer = localize({ key: "settings", comment: ['{Locked="["}', '{Locked="]({1})"}', '{Locked="]({2})"}', '{Locked="]({4})"}', '{Locked="]({5})"}'] }, "By continuing, you agree to {0}'s [Terms]({1}) and [Privacy Statement]({2}). {3} Copilot may show [public code]({4}) suggestions and use your data to improve the product. You can change these [settings]({5}) anytime.", defaultChat.provider.default.name, defaultChat.termsStatementUrl, defaultChat.privacyStatementUrl, defaultChat.provider.default.name, defaultChat.publicCodeMatchesUrl, defaultChat.manageSettingsUrl);
    }
    element.appendChild($("p", void 0, disposables.add(this.markdownRendererService.render(new MarkdownString(footer, { isTrusted: true }))).element));
    return element;
  }
};
ChatSetup = ChatSetup_1 = __decorate([
  __param(2, ITelemetryService),
  __param(3, ILayoutService),
  __param(4, IKeybindingService),
  __param(5, IChatEntitlementService),
  __param(6, ILogService),
  __param(7, IConfigurationService),
  __param(8, IChatWidgetService),
  __param(9, IWorkspaceTrustRequestService),
  __param(10, IMarkdownRendererService)
], ChatSetup);
function refreshTokens(commandService) {
  commandService.executeCommand(defaultChat.completionsRefreshTokenCommand);
  commandService.executeCommand(defaultChat.chatRefreshTokenCommand);
}
__name(refreshTokens, "refreshTokens");
export {
  ChatSetup,
  refreshTokens
};
//# sourceMappingURL=chatSetupRunner.js.map
