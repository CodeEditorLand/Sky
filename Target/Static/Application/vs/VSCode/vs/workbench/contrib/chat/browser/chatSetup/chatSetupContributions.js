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
import { Event } from "../../../../../base/common/event.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import { Disposable, DisposableStore, markAsSingleton, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import Severity from "../../../../../base/common/severity.js";
import { equalsIgnoreCase } from "../../../../../base/common/strings.js";
import { URI } from "../../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { CommandsRegistry, ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IMarkerService } from "../../../../../platform/markers/common/markers.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import product from "../../../../../platform/product/common/product.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IViewDescriptorService } from "../../../../common/views.js";
import { ChatEntitlement, IChatEntitlementService, isProUser } from "../../../../services/chat/common/chatEntitlementService.js";
import { IWorkbenchExtensionEnablementService } from "../../../../services/extensionManagement/common/extensionManagement.js";
import { ExtensionUrlHandlerOverrideRegistry } from "../../../../services/extensions/browser/extensionUrlHandler.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { IWorkbenchLayoutService } from "../../../../services/layout/browser/layoutService.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { IPreferencesService } from "../../../../services/preferences/common/preferences.js";
import { IExtensionsWorkbenchService } from "../../../extensions/common/extensions.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IChatModeService } from "../../common/chatModes.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind } from "../../common/constants.js";
import { CHAT_CATEGORY, CHAT_SETUP_ACTION_ID, CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID } from "../actions/chatActions.js";
import { ChatViewContainerId, IChatWidgetService } from "../chat.js";
import { chatViewsWelcomeRegistry } from "../viewsWelcome/chatViewsWelcome.js";
import { ChatSetupAnonymous } from "./chatSetup.js";
import { ChatSetupController } from "./chatSetupController.js";
import { GrowthSessionController, registerGrowthSession } from "./chatSetupGrowthSession.js";
import { AICodeActionsHelper, AINewSymbolNamesProvider, ChatCodeActionsProvider, SetupAgent } from "./chatSetupProviders.js";
import { ChatSetup } from "./chatSetupRunner.js";
const defaultChat = {
  chatExtensionId: product.defaultChatAgent?.chatExtensionId ?? "",
  manageOveragesUrl: product.defaultChatAgent?.manageOverageUrl ?? "",
  upgradePlanUrl: product.defaultChatAgent?.upgradePlanUrl ?? "",
  completionsRefreshTokenCommand: product.defaultChatAgent?.completionsRefreshTokenCommand ?? "",
  chatRefreshTokenCommand: product.defaultChatAgent?.chatRefreshTokenCommand ?? ""
};
let ChatSetupContribution = class ChatSetupContribution2 extends Disposable {
  static {
    __name(this, "ChatSetupContribution");
  }
  static {
    this.ID = "workbench.contrib.chatSetup";
  }
  constructor(instantiationService, chatEntitlementService, logService, contextKeyService, extensionEnablementService, extensionsWorkbenchService, extensionService, environmentService, chatSessionsService, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.contextKeyService = contextKeyService;
    this.extensionEnablementService = extensionEnablementService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionService = extensionService;
    this.environmentService = environmentService;
    this.chatSessionsService = chatSessionsService;
    this.configurationService = configurationService;
    const context = chatEntitlementService.context?.value;
    const requests = chatEntitlementService.requests?.value;
    if (!context || !requests) {
      return;
    }
    const controller = new Lazy(() => this._register(this.instantiationService.createInstance(ChatSetupController, context, requests)));
    this.registerSetupAgents(context, controller);
    this.registerGrowthSession(chatEntitlementService);
    this.registerActions(context, requests, controller);
    this.registerUrlLinkHandler();
    this.checkExtensionInstallation(context);
  }
  registerSetupAgents(context, controller) {
    const defaultAgentDisposables = markAsSingleton(new MutableDisposable());
    const vscodeAgentDisposables = markAsSingleton(new MutableDisposable());
    const renameProviderDisposables = markAsSingleton(new MutableDisposable());
    const codeActionsProviderDisposables = markAsSingleton(new MutableDisposable());
    const updateRegistration = /* @__PURE__ */ __name(() => {
      {
        if (!context.state.hidden && !context.state.disabled) {
          if (!defaultAgentDisposables.value) {
            const disposables = defaultAgentDisposables.value = new DisposableStore();
            const panelAgentDisposables = disposables.add(new DisposableStore());
            for (const mode of [ChatModeKind.Ask, ChatModeKind.Edit, ChatModeKind.Agent]) {
              const { agent, disposable } = SetupAgent.registerDefaultAgents(this.instantiationService, ChatAgentLocation.Chat, mode, context, controller);
              panelAgentDisposables.add(disposable);
              panelAgentDisposables.add(agent.onUnresolvableError(() => {
                const panelAgentHasGuidance = chatViewsWelcomeRegistry.get().some((descriptor) => this.contextKeyService.contextMatchesRules(descriptor.when));
                if (panelAgentHasGuidance) {
                  this.logService.error("[chat setup] Unresolvable error from Chat agent registration, clearing registration.");
                  panelAgentDisposables.dispose();
                }
              }));
            }
            disposables.add(SetupAgent.registerDefaultAgents(this.instantiationService, ChatAgentLocation.Terminal, ChatModeKind.Ask, context, controller).disposable);
            disposables.add(SetupAgent.registerDefaultAgents(this.instantiationService, ChatAgentLocation.Notebook, ChatModeKind.Ask, context, controller).disposable);
            disposables.add(SetupAgent.registerDefaultAgents(this.instantiationService, ChatAgentLocation.EditorInline, ChatModeKind.Ask, context, controller).disposable);
          }
          if ((!context.state.installed || context.state.entitlement === ChatEntitlement.Unknown || context.state.entitlement === ChatEntitlement.Unresolved) && !vscodeAgentDisposables.value) {
            const disposables = vscodeAgentDisposables.value = new DisposableStore();
            disposables.add(SetupAgent.registerBuiltInAgents(this.instantiationService, context, controller));
          }
        } else {
          defaultAgentDisposables.clear();
          vscodeAgentDisposables.clear();
        }
        if (context.state.installed && !context.state.disabled) {
          vscodeAgentDisposables.clear();
        }
      }
      {
        if (!context.state.installed && !context.state.hidden && !context.state.disabled) {
          if (!renameProviderDisposables.value) {
            renameProviderDisposables.value = AINewSymbolNamesProvider.registerProvider(this.instantiationService, context, controller);
          }
        } else {
          renameProviderDisposables.clear();
        }
      }
      {
        if (!context.state.installed && !context.state.hidden && !context.state.disabled) {
          if (!codeActionsProviderDisposables.value) {
            codeActionsProviderDisposables.value = ChatCodeActionsProvider.registerProvider(this.instantiationService);
          }
        } else {
          codeActionsProviderDisposables.clear();
        }
      }
    }, "updateRegistration");
    this._register(Event.runAndSubscribe(context.onDidChange, () => updateRegistration()));
  }
  registerGrowthSession(chatEntitlementService) {
    const growthSessionDisposables = markAsSingleton(new MutableDisposable());
    const updateGrowthSession = /* @__PURE__ */ __name(() => {
      const experimentEnabled = this.configurationService.getValue(ChatConfiguration.GrowthNotificationEnabled) === true;
      const shouldShow = experimentEnabled && !chatEntitlementService.sentiment.installed;
      if (shouldShow && !growthSessionDisposables.value) {
        const disposables = new DisposableStore();
        const controller = disposables.add(this.instantiationService.createInstance(GrowthSessionController));
        if (!controller.isDismissed) {
          disposables.add(registerGrowthSession(this.chatSessionsService, controller));
          disposables.add(controller.onDidDismiss(() => {
            growthSessionDisposables.clear();
          }));
          growthSessionDisposables.value = disposables;
        } else {
          disposables.dispose();
        }
      } else if (!shouldShow) {
        growthSessionDisposables.clear();
      }
    }, "updateGrowthSession");
    this._register(chatEntitlementService.onDidChangeSentiment(() => updateGrowthSession()));
    updateGrowthSession();
  }
  registerActions(context, requests, controller) {
    class ChatSetupTriggerAction extends Action2 {
      static {
        __name(this, "ChatSetupTriggerAction");
      }
      static {
        this.CHAT_SETUP_ACTION_LABEL = localize2("triggerChatSetup", "Use AI Features with Copilot for free...");
      }
      constructor() {
        super({
          id: CHAT_SETUP_ACTION_ID,
          title: ChatSetupTriggerAction.CHAT_SETUP_ACTION_LABEL,
          category: CHAT_CATEGORY,
          f1: true,
          precondition: ContextKeyExpr.or(ChatContextKeys.Setup.hidden, ChatContextKeys.Setup.disabled, ChatContextKeys.Setup.untrusted, ChatContextKeys.Setup.installed.negate(), ChatContextKeys.Entitlement.canSignUp)
        });
      }
      async run(accessor, mode, options) {
        const widgetService = accessor.get(IChatWidgetService);
        const instantiationService = accessor.get(IInstantiationService);
        const dialogService = accessor.get(IDialogService);
        const commandService = accessor.get(ICommandService);
        const lifecycleService = accessor.get(ILifecycleService);
        const configurationService = accessor.get(IConfigurationService);
        await context.update({ hidden: false });
        configurationService.updateValue(ChatConfiguration.AIDisabled, false);
        if (mode) {
          const chatWidget = await widgetService.revealWidget();
          chatWidget?.input.setChatMode(mode);
        }
        if (options?.inputValue) {
          const chatWidget = await widgetService.revealWidget();
          chatWidget?.input.showScrollbarUntilAccept();
          chatWidget?.setInput(options.inputValue);
        }
        const setup = ChatSetup.getInstance(instantiationService, context, controller);
        const { success } = await setup.run(options);
        if (success === false && !lifecycleService.willShutdown) {
          const { confirmed } = await dialogService.confirm({
            type: Severity.Error,
            message: localize("setupErrorDialog", "Chat setup failed. Would you like to try again?"),
            primaryButton: localize("retry", "Retry")
          });
          if (confirmed) {
            return Boolean(await commandService.executeCommand(CHAT_SETUP_ACTION_ID, mode, options));
          }
        }
        return Boolean(success);
      }
    }
    class ChatSetupTriggerSupportAnonymousAction extends Action2 {
      static {
        __name(this, "ChatSetupTriggerSupportAnonymousAction");
      }
      constructor() {
        super({
          id: CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID,
          title: ChatSetupTriggerAction.CHAT_SETUP_ACTION_LABEL
        });
      }
      async run(accessor, options) {
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        const chatEntitlementService = accessor.get(IChatEntitlementService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "api" });
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID, void 0, {
          forceAnonymous: chatEntitlementService.anonymous ? ChatSetupAnonymous.EnabledWithDialog : void 0,
          ...options
        });
      }
    }
    class ChatSetupTriggerForceSignInDialogAction extends Action2 {
      static {
        __name(this, "ChatSetupTriggerForceSignInDialogAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.triggerSetupForceSignIn",
          title: localize2("forceSignIn", "Sign in to use AI features")
        });
      }
      async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "api" });
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID, void 0, { forceSignInDialog: true });
      }
    }
    class ChatSetupTriggerAnonymousWithoutDialogAction extends Action2 {
      static {
        __name(this, "ChatSetupTriggerAnonymousWithoutDialogAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.triggerSetupAnonymousWithoutDialog",
          title: ChatSetupTriggerAction.CHAT_SETUP_ACTION_LABEL
        });
      }
      async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "api" });
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID, void 0, { forceAnonymous: ChatSetupAnonymous.EnabledWithoutDialog });
      }
    }
    class ChatSetupFromAccountsAction extends Action2 {
      static {
        __name(this, "ChatSetupFromAccountsAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.triggerSetupFromAccounts",
          title: localize2("triggerChatSetupFromAccounts", "Sign in to use AI features..."),
          menu: {
            id: MenuId.AccountsContext,
            group: "2_copilot",
            when: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.installed.negate(), ChatContextKeys.Entitlement.signedOut)
          }
        });
      }
      async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "accounts" });
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID);
      }
    }
    const windowFocusListener = this._register(new MutableDisposable());
    class UpgradePlanAction extends Action2 {
      static {
        __name(this, "UpgradePlanAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.upgradePlan",
          title: localize2("managePlan", "Upgrade to GitHub Copilot Pro"),
          category: localize2("chat.category", "Chat"),
          f1: true,
          precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ContextKeyExpr.or(ChatContextKeys.Entitlement.canSignUp, ChatContextKeys.Entitlement.planFree)),
          menu: {
            id: MenuId.ChatTitleBarMenu,
            group: "a_first",
            order: 1,
            when: ContextKeyExpr.and(ChatContextKeys.Entitlement.planFree, ContextKeyExpr.or(ChatContextKeys.chatQuotaExceeded, ChatContextKeys.completionsQuotaExceeded))
          }
        });
      }
      async run(accessor) {
        const openerService = accessor.get(IOpenerService);
        const hostService = accessor.get(IHostService);
        const commandService = accessor.get(ICommandService);
        openerService.open(URI.parse(defaultChat.upgradePlanUrl));
        const entitlement = context.state.entitlement;
        if (!isProUser(entitlement)) {
          windowFocusListener.value = hostService.onDidChangeFocus((focus) => this.onWindowFocus(focus, commandService));
        }
      }
      async onWindowFocus(focus, commandService) {
        if (focus) {
          windowFocusListener.clear();
          const entitlements = await requests.forceResolveEntitlement();
          if (entitlements?.entitlement && isProUser(entitlements?.entitlement)) {
            refreshTokens(commandService);
          }
        }
      }
    }
    class EnableOveragesAction extends Action2 {
      static {
        __name(this, "EnableOveragesAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.manageOverages",
          title: localize2("manageOverages", "Manage GitHub Copilot Overages"),
          category: localize2("chat.category", "Chat"),
          f1: true,
          precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ContextKeyExpr.or(ChatContextKeys.Entitlement.planPro, ChatContextKeys.Entitlement.planProPlus)),
          menu: {
            id: MenuId.ChatTitleBarMenu,
            group: "a_first",
            order: 1,
            when: ContextKeyExpr.and(ContextKeyExpr.or(ChatContextKeys.Entitlement.planPro, ChatContextKeys.Entitlement.planProPlus), ContextKeyExpr.or(ChatContextKeys.chatQuotaExceeded, ChatContextKeys.completionsQuotaExceeded))
          }
        });
      }
      async run(accessor) {
        const openerService = accessor.get(IOpenerService);
        openerService.open(URI.parse(defaultChat.manageOveragesUrl));
      }
    }
    registerAction2(ChatSetupTriggerAction);
    registerAction2(ChatSetupTriggerForceSignInDialogAction);
    registerAction2(ChatSetupFromAccountsAction);
    registerAction2(ChatSetupTriggerAnonymousWithoutDialogAction);
    registerAction2(ChatSetupTriggerSupportAnonymousAction);
    registerAction2(UpgradePlanAction);
    registerAction2(EnableOveragesAction);
    function registerGenerateCodeCommand(coreCommand, actualCommand) {
      CommandsRegistry.registerCommand(coreCommand, async (accessor, ...args) => {
        const commandService = accessor.get(ICommandService);
        const codeEditorService = accessor.get(ICodeEditorService);
        const markerService = accessor.get(IMarkerService);
        switch (coreCommand) {
          case "chat.internal.explain":
          case "chat.internal.fix": {
            const textEditor = codeEditorService.getActiveCodeEditor();
            const uri = textEditor?.getModel()?.uri;
            const range = textEditor?.getSelection();
            if (!uri || !range) {
              return;
            }
            const markers = AICodeActionsHelper.warningOrErrorMarkersAtRange(markerService, uri, range);
            const actualCommand2 = coreCommand === "chat.internal.explain" ? AICodeActionsHelper.explainMarkers(markers) : AICodeActionsHelper.fixMarkers(markers, range);
            await commandService.executeCommand(actualCommand2.id, ...actualCommand2.arguments ?? []);
            break;
          }
          case "chat.internal.review": {
            const result = await commandService.executeCommand(CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID);
            if (result) {
              await commandService.executeCommand(actualCommand);
            }
            break;
          }
          case "chat.internal.codeReview.run": {
            return commandService.executeCommand(actualCommand, ...args);
          }
        }
      });
    }
    __name(registerGenerateCodeCommand, "registerGenerateCodeCommand");
    registerGenerateCodeCommand("chat.internal.explain", "github.copilot.chat.explain");
    registerGenerateCodeCommand("chat.internal.fix", "github.copilot.chat.fix");
    registerGenerateCodeCommand("chat.internal.review", "github.copilot.chat.review");
    registerGenerateCodeCommand("chat.internal.codeReview.run", "github.copilot.chat.codeReview.run");
    const internalGenerateCodeContext = ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabled.negate(), ChatContextKeys.Setup.installed.negate());
    MenuRegistry.appendMenuItem(MenuId.EditorContext, {
      command: {
        id: "chat.internal.explain",
        title: localize("explain", "Explain")
      },
      group: "1_chat",
      order: 4,
      when: internalGenerateCodeContext
    });
    MenuRegistry.appendMenuItem(MenuId.EditorContext, {
      command: {
        id: "chat.internal.fix",
        title: localize("fix", "Fix")
      },
      group: "1_chat",
      order: 5,
      when: ContextKeyExpr.and(internalGenerateCodeContext, EditorContextKeys.readOnly.negate())
    });
    MenuRegistry.appendMenuItem(MenuId.EditorContext, {
      command: {
        id: "chat.internal.review",
        title: localize("review", "Code Review")
      },
      group: "1_chat",
      order: 6,
      when: internalGenerateCodeContext
    });
  }
  registerUrlLinkHandler() {
    this._register(ExtensionUrlHandlerOverrideRegistry.registerHandler(this.instantiationService.createInstance(ChatSetupExtensionUrlHandler)));
  }
  async checkExtensionInstallation(context) {
    if (this.environmentService.isExtensionDevelopment) {
      await this.extensionService.whenInstalledExtensionsRegistered();
      if (this.extensionService.extensions.find((ext) => ExtensionIdentifier.equals(ext.identifier, defaultChat.chatExtensionId))) {
        context.update({ installed: true, disabled: false, untrusted: false });
        return;
      }
    }
    await this.extensionsWorkbenchService.queryLocal();
    this._register(Event.runAndSubscribe(this.extensionsWorkbenchService.onChange, (e) => {
      if (e && !ExtensionIdentifier.equals(e.identifier.id, defaultChat.chatExtensionId)) {
        return;
      }
      const defaultChatExtension = this.extensionsWorkbenchService.local.find((value) => ExtensionIdentifier.equals(value.identifier.id, defaultChat.chatExtensionId));
      const installed = !!defaultChatExtension?.local;
      let disabled;
      let untrusted = false;
      if (installed) {
        disabled = !this.extensionEnablementService.isEnabled(defaultChatExtension.local);
        if (disabled) {
          const state = this.extensionEnablementService.getEnablementState(defaultChatExtension.local);
          if (state === 0) {
            disabled = false;
            untrusted = true;
          }
        }
      } else {
        disabled = false;
      }
      context.update({ installed, disabled, untrusted });
    }));
  }
};
ChatSetupContribution = __decorate([
  __param(0, IInstantiationService),
  __param(1, IChatEntitlementService),
  __param(2, ILogService),
  __param(3, IContextKeyService),
  __param(4, IWorkbenchExtensionEnablementService),
  __param(5, IExtensionsWorkbenchService),
  __param(6, IExtensionService),
  __param(7, IEnvironmentService),
  __param(8, IChatSessionsService),
  __param(9, IConfigurationService)
], ChatSetupContribution);
let ChatSetupExtensionUrlHandler = class ChatSetupExtensionUrlHandler2 {
  static {
    __name(this, "ChatSetupExtensionUrlHandler");
  }
  constructor(productService, commandService, telemetryService, chatModeService) {
    this.productService = productService;
    this.commandService = commandService;
    this.telemetryService = telemetryService;
    this.chatModeService = chatModeService;
  }
  canHandleURL(url) {
    return url.scheme === this.productService.urlProtocol && equalsIgnoreCase(url.authority, defaultChat.chatExtensionId);
  }
  async handleURL(url) {
    const params = new URLSearchParams(url.query);
    this.telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "url", detail: params.get("referrer") ?? void 0 });
    const agentParam = params.get("agent") ?? params.get("mode");
    const inputParam = params.get("prompt");
    if (!agentParam && !inputParam) {
      return false;
    }
    const agentId = agentParam ? this.resolveAgentId(agentParam) : void 0;
    await this.commandService.executeCommand(CHAT_SETUP_ACTION_ID, agentId, inputParam ? { inputValue: inputParam } : void 0);
    return true;
  }
  resolveAgentId(agentParam) {
    const agents = this.chatModeService.getModes();
    const allAgents = [...agents.builtin, ...agents.custom];
    const foundAgent = allAgents.find((agent) => agent.id === agentParam);
    if (foundAgent) {
      return foundAgent.id;
    }
    const nameLower = agentParam.toLowerCase();
    const agentByName = allAgents.find((agent) => agent.name.get().toLowerCase() === nameLower);
    return agentByName?.id;
  }
};
ChatSetupExtensionUrlHandler = __decorate([
  __param(0, IProductService),
  __param(1, ICommandService),
  __param(2, ITelemetryService),
  __param(3, IChatModeService)
], ChatSetupExtensionUrlHandler);
let ChatTeardownContribution = class ChatTeardownContribution2 extends Disposable {
  static {
    __name(this, "ChatTeardownContribution");
  }
  static {
    this.ID = "workbench.contrib.chatTeardown";
  }
  constructor(chatEntitlementService, configurationService, extensionsWorkbenchService, extensionEnablementService, viewDescriptorService, layoutService) {
    super();
    this.configurationService = configurationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.viewDescriptorService = viewDescriptorService;
    this.layoutService = layoutService;
    const context = chatEntitlementService.context?.value;
    if (!context) {
      return;
    }
    this.registerListeners();
    this.registerActions();
    this.handleChatDisabled(false);
  }
  handleChatDisabled(fromEvent) {
    const chatDisabled = this.configurationService.inspect(ChatConfiguration.AIDisabled);
    if (chatDisabled.value === true) {
      this.maybeEnableOrDisableExtension(
        typeof chatDisabled.workspaceValue === "boolean" ? 11 : 10
        /* EnablementState.DisabledGlobally */
      );
      if (fromEvent) {
        this.maybeHideAuxiliaryBar();
      }
    } else if (chatDisabled.value === false && fromEvent) {
      this.maybeEnableOrDisableExtension(
        typeof chatDisabled.workspaceValue === "boolean" ? 13 : 12
        /* EnablementState.EnabledGlobally */
      );
    }
  }
  async registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration(ChatConfiguration.AIDisabled)) {
        return;
      }
      this.handleChatDisabled(true);
    }));
    await this.extensionsWorkbenchService.queryLocal();
    this._register(this.extensionsWorkbenchService.onChange((e) => {
      if (e && !ExtensionIdentifier.equals(e.identifier.id, defaultChat.chatExtensionId)) {
        return;
      }
      const defaultChatExtension = this.extensionsWorkbenchService.local.find((value) => ExtensionIdentifier.equals(value.identifier.id, defaultChat.chatExtensionId));
      if (defaultChatExtension?.local && this.extensionEnablementService.isEnabled(defaultChatExtension.local)) {
        this.configurationService.updateValue(ChatConfiguration.AIDisabled, false);
      }
    }));
  }
  async maybeEnableOrDisableExtension(state) {
    const defaultChatExtension = this.extensionsWorkbenchService.local.find((value) => ExtensionIdentifier.equals(value.identifier.id, defaultChat.chatExtensionId));
    if (!defaultChatExtension) {
      return;
    }
    await this.extensionsWorkbenchService.setEnablement([defaultChatExtension], state);
    await this.extensionsWorkbenchService.updateRunningExtensions(state === 12 || state === 13 ? localize("restartExtensionHost.reason.enable", "Enabling AI features") : localize("restartExtensionHost.reason.disable", "Disabling AI features"));
  }
  maybeHideAuxiliaryBar() {
    const activeContainers = this.viewDescriptorService.getViewContainersByLocation(
      2
      /* ViewContainerLocation.AuxiliaryBar */
    ).filter((container) => this.viewDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0);
    if (activeContainers.length === 0 || // chat view is already gone but we know it was there before
    activeContainers.length === 1 && activeContainers.at(0)?.id === ChatViewContainerId) {
      this.layoutService.setPartHidden(
        true,
        "workbench.parts.auxiliarybar"
        /* Parts.AUXILIARYBAR_PART */
      );
    }
  }
  registerActions() {
    class ChatSetupHideAction extends Action2 {
      static {
        __name(this, "ChatSetupHideAction");
      }
      static {
        this.ID = "workbench.action.chat.hideSetup";
      }
      static {
        this.TITLE = localize2("hideChatSetup", "Learn How to Hide AI Features");
      }
      constructor() {
        super({
          id: ChatSetupHideAction.ID,
          title: ChatSetupHideAction.TITLE,
          f1: true,
          category: CHAT_CATEGORY,
          precondition: ChatContextKeys.Setup.hidden.negate(),
          menu: {
            id: MenuId.ChatTitleBarMenu,
            group: "z_hide",
            order: 1,
            when: ChatContextKeys.Setup.installed.negate()
          }
        });
      }
      async run(accessor) {
        const preferencesService = accessor.get(IPreferencesService);
        preferencesService.openSettings({ jsonEditor: false, query: `@id:${ChatConfiguration.AIDisabled}` });
      }
    }
    registerAction2(ChatSetupHideAction);
  }
};
ChatTeardownContribution = __decorate([
  __param(0, IChatEntitlementService),
  __param(1, IConfigurationService),
  __param(2, IExtensionsWorkbenchService),
  __param(3, IWorkbenchExtensionEnablementService),
  __param(4, IViewDescriptorService),
  __param(5, IWorkbenchLayoutService)
], ChatTeardownContribution);
function refreshTokens(commandService) {
  commandService.executeCommand(defaultChat.completionsRefreshTokenCommand);
  commandService.executeCommand(defaultChat.chatRefreshTokenCommand);
}
__name(refreshTokens, "refreshTokens");
export {
  ChatSetupContribution,
  ChatTeardownContribution,
  refreshTokens
};
//# sourceMappingURL=chatSetupContributions.js.map
