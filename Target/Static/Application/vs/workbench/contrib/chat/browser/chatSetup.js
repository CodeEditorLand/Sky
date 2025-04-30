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
var SetupAgent_1, ChatSetup_1;
import "./media/chatSetup.css";
import { $ } from "../../../../base/browser/dom.js";
import { Dialog } from "../../../../base/browser/ui/dialog/dialog.js";
import { toAction } from "../../../../base/common/actions.js";
import { timeout } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable, DisposableStore, markAsSingleton, MutableDisposable } from "../../../../base/common/lifecycle.js";
import Severity from "../../../../base/common/severity.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { equalsIgnoreCase } from "../../../../base/common/strings.js";
import { isObject } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { MarkdownRenderer } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { Extensions as ConfigurationExtensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { createWorkbenchDialogOptions } from "../../../../platform/dialogs/browser/dialog.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import product from "../../../../platform/product/common/product.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceTrustRequestService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IActivityService, ProgressBadge } from "../../../services/activity/common/activity.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { ExtensionUrlHandlerOverrideRegistry } from "../../../services/extensions/browser/extensionUrlHandler.js";
import { nullExtensionDescription } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { ILanguageModelToolsService } from "../../chat/common/languageModelToolsService.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { IChatAgentService } from "../common/chatAgents.js";
import { ChatContextKeys } from "../common/chatContextKeys.js";
import { ChatEntitlement, ChatEntitlementRequests, IChatEntitlementService } from "../common/chatEntitlementService.js";
import { ChatRequestModel } from "../common/chatModel.js";
import { ChatRequestAgentPart, ChatRequestToolPart } from "../common/chatParserTypes.js";
import { IChatService } from "../common/chatService.js";
import { ChatAgentLocation, ChatConfiguration, ChatMode, validateChatMode } from "../common/constants.js";
import { ILanguageModelsService } from "../common/languageModels.js";
import { CHAT_CATEGORY, CHAT_OPEN_ACTION_ID, CHAT_SETUP_ACTION_ID } from "./actions/chatActions.js";
import { ChatViewId, IChatWidgetService, showCopilotView } from "./chat.js";
import { CHAT_SIDEBAR_PANEL_ID } from "./chatViewPane.js";
const defaultChat = {
  extensionId: product.defaultChatAgent?.extensionId ?? "",
  chatExtensionId: product.defaultChatAgent?.chatExtensionId ?? "",
  documentationUrl: product.defaultChatAgent?.documentationUrl ?? "",
  termsStatementUrl: product.defaultChatAgent?.termsStatementUrl ?? "",
  privacyStatementUrl: product.defaultChatAgent?.privacyStatementUrl ?? "",
  skusDocumentationUrl: product.defaultChatAgent?.skusDocumentationUrl ?? "",
  publicCodeMatchesUrl: product.defaultChatAgent?.publicCodeMatchesUrl ?? "",
  upgradePlanUrl: product.defaultChatAgent?.upgradePlanUrl ?? "",
  providerName: product.defaultChatAgent?.providerName ?? "",
  enterpriseProviderId: product.defaultChatAgent?.enterpriseProviderId ?? "",
  enterpriseProviderName: product.defaultChatAgent?.enterpriseProviderName ?? "",
  providerUriSetting: product.defaultChatAgent?.providerUriSetting ?? "",
  providerScopes: product.defaultChatAgent?.providerScopes ?? [[]],
  manageSettingsUrl: product.defaultChatAgent?.manageSettingsUrl ?? "",
  completionsAdvancedSetting: product.defaultChatAgent?.completionsAdvancedSetting ?? "",
  walkthroughCommand: product.defaultChatAgent?.walkthroughCommand ?? "",
  completionsRefreshTokenCommand: product.defaultChatAgent?.completionsRefreshTokenCommand ?? "",
  chatRefreshTokenCommand: product.defaultChatAgent?.chatRefreshTokenCommand ?? ""
};
const copilotSettingsMessage = localize({ key: "settings", comment: ['{Locked="["}', '{Locked="]({0})"}', '{Locked="]({1})"}'] }, "Copilot Free and Pro may show [public code]({0}) suggestions and we may use your data for product improvement. You can change these [settings]({1}) at any time.", defaultChat.publicCodeMatchesUrl, defaultChat.manageSettingsUrl);
const ToolsAgentContextKey = ContextKeyExpr.and(
  ContextKeyExpr.equals(`config.${ChatConfiguration.AgentEnabled}`, true),
  ChatContextKeys.Editing.agentModeDisallowed.negate(),
  ContextKeyExpr.not(`previewFeaturesDisabled`)
  // Set by extension
);
let SetupAgent = class SetupAgent2 extends Disposable {
  static {
    __name(this, "SetupAgent");
  }
  static {
    SetupAgent_1 = this;
  }
  static registerDefaultAgents(instantiationService, location, mode, context, controller) {
    return instantiationService.invokeFunction((accessor) => {
      const chatAgentService = accessor.get(IChatAgentService);
      let id;
      let description = localize("chatDescription", "Ask Copilot");
      switch (location) {
        case ChatAgentLocation.Panel:
          if (mode === ChatMode.Ask) {
            id = "setup.chat";
          } else if (mode === ChatMode.Edit) {
            id = "setup.edits";
            description = localize("editsDescription", "Edit files in your workspace");
          } else {
            id = "setup.agent";
            description = localize("agentDescription", "Edit files in your workspace in agent mode");
          }
          break;
        case ChatAgentLocation.Terminal:
          id = "setup.terminal";
          break;
        case ChatAgentLocation.Editor:
          id = "setup.editor";
          break;
        case ChatAgentLocation.Notebook:
          id = "setup.notebook";
          break;
      }
      return SetupAgent_1.doRegisterAgent(instantiationService, chatAgentService, id, `${defaultChat.providerName} Copilot`, true, description, location, mode, context, controller);
    });
  }
  static registerVSCodeAgent(instantiationService, context, controller) {
    return instantiationService.invokeFunction((accessor) => {
      const chatAgentService = accessor.get(IChatAgentService);
      const disposables = new DisposableStore();
      const { agent, disposable } = SetupAgent_1.doRegisterAgent(instantiationService, chatAgentService, "setup.vscode", "vscode", false, localize2("vscodeAgentDescription", "Ask questions about VS Code").value, ChatAgentLocation.Panel, void 0, context, controller);
      disposables.add(disposable);
      disposables.add(SetupTool.registerTool(instantiationService, {
        id: "setup.tools.createNewWorkspace",
        source: {
          type: "internal"
        },
        icon: Codicon.newFolder,
        displayName: localize("setupToolDisplayName", "New Workspace"),
        modelDescription: localize("setupToolsDescription", "Scaffold a new workspace in VS Code"),
        userDescription: localize("setupToolsDescription", "Scaffold a new workspace in VS Code"),
        canBeReferencedInPrompt: true,
        toolReferenceName: "new",
        when: ContextKeyExpr.true(),
        supportsToolPicker: true
      }).disposable);
      return { agent, disposable: disposables };
    });
  }
  static doRegisterAgent(instantiationService, chatAgentService, id, name, isDefault, description, location, mode, context, controller) {
    const disposables = new DisposableStore();
    disposables.add(chatAgentService.registerAgent(id, {
      id,
      name,
      isDefault,
      isCore: true,
      modes: mode ? [mode] : [ChatMode.Ask],
      when: mode === ChatMode.Agent ? ToolsAgentContextKey?.serialize() : void 0,
      slashCommands: [],
      disambiguation: [],
      locations: [location],
      metadata: { helpTextPrefix: SetupAgent_1.SETUP_NEEDED_MESSAGE },
      description,
      extensionId: nullExtensionDescription.identifier,
      extensionDisplayName: nullExtensionDescription.name,
      extensionPublisherId: nullExtensionDescription.publisher
    }));
    const agent = disposables.add(instantiationService.createInstance(SetupAgent_1, context, controller, location));
    disposables.add(chatAgentService.registerAgentImplementation(id, agent));
    return { agent, disposable: disposables };
  }
  static {
    this.SETUP_NEEDED_MESSAGE = new MarkdownString(localize("settingUpCopilotNeeded", "You need to set up Copilot to use Chat."));
  }
  constructor(context, controller, location, instantiationService, logService, configurationService, telemetryService) {
    super();
    this.context = context;
    this.controller = controller;
    this.location = location;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.telemetryService = telemetryService;
    this._onUnresolvableError = this._register(new Emitter());
    this.onUnresolvableError = this._onUnresolvableError.event;
    this.pendingForwardedRequests = /* @__PURE__ */ new Map();
  }
  async invoke(request, progress) {
    return this.instantiationService.invokeFunction(async (accessor) => {
      const chatService = accessor.get(IChatService);
      const languageModelsService = accessor.get(ILanguageModelsService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const chatAgentService = accessor.get(IChatAgentService);
      const languageModelToolsService = accessor.get(ILanguageModelToolsService);
      return this.doInvoke(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService);
    });
  }
  async doInvoke(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService) {
    if (!this.context.state.installed || this.context.state.entitlement === ChatEntitlement.Available || this.context.state.entitlement === ChatEntitlement.Unknown) {
      return this.doInvokeWithSetup(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService);
    }
    return this.doInvokeWithoutSetup(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService);
  }
  async doInvokeWithoutSetup(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService) {
    const requestModel = chatWidgetService.getWidgetBySessionId(request.sessionId)?.viewModel?.model.getRequests().at(-1);
    if (!requestModel) {
      this.logService.error("[chat setup] Request model not found, cannot redispatch request.");
      return {};
    }
    progress({
      kind: "progressMessage",
      content: new MarkdownString(localize("waitingCopilot", "Getting Copilot ready."))
    });
    await this.forwardRequestToCopilot(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
    return {};
  }
  async forwardRequestToCopilot(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService) {
    try {
      await this.doForwardRequestToCopilot(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
    } catch (error) {
      progress({
        kind: "warning",
        content: new MarkdownString(localize("copilotUnavailableWarning", "Copilot failed to get a response. Please try again."))
      });
    }
  }
  async doForwardRequestToCopilot(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService) {
    if (this.pendingForwardedRequests.has(requestModel.session.sessionId)) {
      throw new Error("Request already in progress");
    }
    const forwardRequest = this.doForwardRequestToCopilotWhenReady(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
    this.pendingForwardedRequests.set(requestModel.session.sessionId, forwardRequest);
    try {
      await forwardRequest;
    } finally {
      this.pendingForwardedRequests.delete(requestModel.session.sessionId);
    }
  }
  async doForwardRequestToCopilotWhenReady(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService) {
    const widget = chatWidgetService.getWidgetBySessionId(requestModel.session.sessionId);
    const mode = widget?.input.currentMode;
    const languageModel = widget?.input.currentLanguageModel;
    const whenAgentReady = this.whenAgentReady(chatAgentService, mode);
    const whenLanguageModelReady = this.whenLanguageModelReady(languageModelsService);
    const whenToolsModelReady = this.whenToolsModelReady(languageModelToolsService, requestModel);
    if (whenLanguageModelReady instanceof Promise || whenAgentReady instanceof Promise || whenToolsModelReady instanceof Promise) {
      const timeoutHandle = setTimeout(() => {
        progress({
          kind: "progressMessage",
          content: new MarkdownString(localize("waitingCopilot2", "Copilot is almost ready."))
        });
      }, 1e4);
      try {
        const ready = await Promise.race([
          timeout(2e4).then(() => "timedout"),
          this.whenDefaultAgentFailed(chatService).then(() => "error"),
          Promise.allSettled([whenLanguageModelReady, whenAgentReady, whenToolsModelReady])
        ]);
        if (ready === "error" || ready === "timedout") {
          progress({
            kind: "warning",
            content: new MarkdownString(ready === "timedout" ? localize("copilotTookLongWarning", "Copilot took too long to get ready. Please review the guidance in the Chat view.") : localize("copilotFailedWarning", "Copilot failed to get ready. Please review the guidance in the Chat view."))
          });
          this._onUnresolvableError.fire();
          return;
        }
      } finally {
        clearTimeout(timeoutHandle);
      }
    }
    await chatService.resendRequest(requestModel, { mode, userSelectedModelId: languageModel });
  }
  whenLanguageModelReady(languageModelsService) {
    for (const id of languageModelsService.getLanguageModelIds()) {
      const model = languageModelsService.lookupLanguageModel(id);
      if (model && model.isDefault) {
        return;
      }
    }
    return Event.toPromise(Event.filter(languageModelsService.onDidChangeLanguageModels, (e) => e.added?.some((added) => added.metadata.isDefault) ?? false));
  }
  whenToolsModelReady(languageModelToolsService, requestModel) {
    const needsToolsModel = requestModel.message.parts.some((part) => part instanceof ChatRequestToolPart);
    if (!needsToolsModel) {
      return;
    }
    for (const tool of languageModelToolsService.getTools()) {
      if (tool.source.type !== "internal") {
        return;
      }
    }
    return Event.toPromise(Event.filter(languageModelToolsService.onDidChangeTools, () => {
      for (const tool of languageModelToolsService.getTools()) {
        if (tool.source.type !== "internal") {
          return true;
        }
      }
      return false;
    }));
  }
  whenAgentReady(chatAgentService, mode) {
    const defaultAgent = chatAgentService.getDefaultAgent(this.location, mode);
    if (defaultAgent && !defaultAgent.isCore) {
      return;
    }
    return Event.toPromise(Event.filter(chatAgentService.onDidChangeAgents, () => {
      const defaultAgent2 = chatAgentService.getDefaultAgent(this.location, mode);
      return Boolean(defaultAgent2 && !defaultAgent2.isCore);
    }));
  }
  async whenDefaultAgentFailed(chatService) {
    return new Promise((resolve) => {
      chatService.activateDefaultAgent(this.location).catch(() => resolve());
    });
  }
  async doInvokeWithSetup(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService) {
    this.telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "chat" });
    const requestModel = chatWidgetService.getWidgetBySessionId(request.sessionId)?.viewModel?.model.getRequests().at(-1);
    const setupListener = Event.runAndSubscribe(this.controller.value.onDidChange, () => {
      switch (this.controller.value.step) {
        case ChatSetupStep.SigningIn:
          progress({
            kind: "progressMessage",
            content: new MarkdownString(localize("setupChatSignIn2", "Signing in to {0}.", ChatEntitlementRequests.providerId(this.configurationService) === defaultChat.enterpriseProviderId ? defaultChat.enterpriseProviderName : defaultChat.providerName))
          });
          break;
        case ChatSetupStep.Installing:
          progress({
            kind: "progressMessage",
            content: new MarkdownString(localize("installingCopilot", "Getting Copilot ready."))
          });
          break;
      }
    });
    let result = void 0;
    try {
      result = await ChatSetup.getInstance(this.instantiationService, this.context, this.controller).run();
    } catch (error) {
      this.logService.error(`[chat setup] Error during setup: ${toErrorMessage(error)}`);
    } finally {
      setupListener.dispose();
    }
    if (typeof result?.success === "boolean") {
      if (result.success) {
        if (result.dialogSkipped) {
          progress({
            kind: "markdownContent",
            content: new MarkdownString([localize("copilotSetupSuccess", "Copilot setup finished successfully."), copilotSettingsMessage].join("\n\n"))
          });
        } else if (requestModel) {
          let newRequest = this.replaceAgentInRequestModel(requestModel, chatAgentService);
          newRequest = this.replaceToolInRequestModel(newRequest);
          await this.forwardRequestToCopilot(newRequest, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
        }
      } else {
        progress({
          kind: "warning",
          content: new MarkdownString(localize("copilotSetupError", "Copilot setup failed."))
        });
      }
    } else {
      progress({
        kind: "markdownContent",
        content: SetupAgent_1.SETUP_NEEDED_MESSAGE
      });
    }
    return {};
  }
  replaceAgentInRequestModel(requestModel, chatAgentService) {
    const agentPart = requestModel.message.parts.find((r) => r instanceof ChatRequestAgentPart);
    if (!agentPart) {
      return requestModel;
    }
    const agentId = agentPart.agent.id.replace(/setup\./, `${defaultChat.extensionId}.`.toLowerCase());
    const githubAgent = chatAgentService.getAgent(agentId);
    if (!githubAgent) {
      return requestModel;
    }
    const newAgentPart = new ChatRequestAgentPart(agentPart.range, agentPart.editorRange, githubAgent);
    return new ChatRequestModel({
      session: requestModel.session,
      message: {
        parts: requestModel.message.parts.map((part) => {
          if (part instanceof ChatRequestAgentPart) {
            return newAgentPart;
          }
          return part;
        }),
        text: requestModel.message.text
      },
      variableData: requestModel.variableData,
      timestamp: Date.now(),
      attempt: requestModel.attempt,
      confirmation: requestModel.confirmation,
      locationData: requestModel.locationData,
      attachedContext: requestModel.attachedContext,
      isCompleteAddedRequest: requestModel.isCompleteAddedRequest
    });
  }
  replaceToolInRequestModel(requestModel) {
    const toolPart = requestModel.message.parts.find((r) => r instanceof ChatRequestToolPart);
    if (!toolPart) {
      return requestModel;
    }
    const toolId = toolPart.toolId.replace(/setup.tools\./, `copilot_`.toLowerCase());
    const newToolPart = new ChatRequestToolPart(toolPart.range, toolPart.editorRange, toolPart.toolName, toolId, toolPart.displayName, toolPart.icon);
    const chatRequestToolEntry = {
      id: toolId,
      name: "new",
      range: toolPart.range,
      kind: "tool",
      value: void 0
    };
    const variableData = {
      variables: [chatRequestToolEntry]
    };
    return new ChatRequestModel({
      session: requestModel.session,
      message: {
        parts: requestModel.message.parts.map((part) => {
          if (part instanceof ChatRequestToolPart) {
            return newToolPart;
          }
          return part;
        }),
        text: requestModel.message.text
      },
      variableData,
      timestamp: Date.now(),
      attempt: requestModel.attempt,
      confirmation: requestModel.confirmation,
      locationData: requestModel.locationData,
      attachedContext: [chatRequestToolEntry],
      isCompleteAddedRequest: requestModel.isCompleteAddedRequest
    });
  }
};
SetupAgent = SetupAgent_1 = __decorate([
  __param(3, IInstantiationService),
  __param(4, ILogService),
  __param(5, IConfigurationService),
  __param(6, ITelemetryService)
], SetupAgent);
class SetupTool extends Disposable {
  static {
    __name(this, "SetupTool");
  }
  static registerTool(instantiationService, toolData) {
    return instantiationService.invokeFunction((accessor) => {
      const toolService = accessor.get(ILanguageModelToolsService);
      const disposables = new DisposableStore();
      disposables.add(toolService.registerToolData(toolData));
      const tool = instantiationService.createInstance(SetupTool);
      disposables.add(toolService.registerToolImplementation(toolData.id, tool));
      return { tool, disposable: disposables };
    });
  }
  async invoke(invocation, countTokens, progress, token) {
    const result = {
      content: [
        {
          kind: "text",
          value: ""
        }
      ]
    };
    return result;
  }
  async prepareToolInvocation(parameters, token) {
    return void 0;
  }
}
var ChatSetupStrategy;
(function(ChatSetupStrategy2) {
  ChatSetupStrategy2[ChatSetupStrategy2["Canceled"] = 0] = "Canceled";
  ChatSetupStrategy2[ChatSetupStrategy2["DefaultSetup"] = 1] = "DefaultSetup";
  ChatSetupStrategy2[ChatSetupStrategy2["SetupWithoutEnterpriseProvider"] = 2] = "SetupWithoutEnterpriseProvider";
  ChatSetupStrategy2[ChatSetupStrategy2["SetupWithEnterpriseProvider"] = 3] = "SetupWithEnterpriseProvider";
})(ChatSetupStrategy || (ChatSetupStrategy = {}));
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
        return new ChatSetup_1(context, controller, instantiationService, accessor.get(ITelemetryService), accessor.get(IContextMenuService), accessor.get(IWorkbenchLayoutService), accessor.get(IKeybindingService), accessor.get(IChatEntitlementService), accessor.get(ILogService), accessor.get(IConfigurationService));
      });
    }
    return instance;
  }
  constructor(context, controller, instantiationService, telemetryService, contextMenuService, layoutService, keybindingService, chatEntitlementService, logService, configurationService) {
    this.context = context;
    this.controller = controller;
    this.instantiationService = instantiationService;
    this.telemetryService = telemetryService;
    this.contextMenuService = contextMenuService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.chatEntitlementService = chatEntitlementService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.pendingRun = void 0;
    this.skipDialogOnce = false;
  }
  skipDialog() {
    this.skipDialogOnce = true;
  }
  async run() {
    if (this.pendingRun) {
      return this.pendingRun;
    }
    this.pendingRun = this.doRun();
    try {
      return await this.pendingRun;
    } finally {
      this.pendingRun = void 0;
    }
  }
  async doRun() {
    const dialogSkipped = this.skipDialogOnce;
    this.skipDialogOnce = false;
    let setupStrategy;
    if (dialogSkipped || this.chatEntitlementService.entitlement === ChatEntitlement.Pro || this.chatEntitlementService.entitlement === ChatEntitlement.Limited) {
      setupStrategy = ChatSetupStrategy.DefaultSetup;
    } else {
      setupStrategy = await this.showDialog();
    }
    if (setupStrategy === ChatSetupStrategy.DefaultSetup && ChatEntitlementRequests.providerId(this.configurationService) === defaultChat.enterpriseProviderId) {
      setupStrategy = ChatSetupStrategy.SetupWithEnterpriseProvider;
    }
    let success = void 0;
    try {
      switch (setupStrategy) {
        case ChatSetupStrategy.SetupWithEnterpriseProvider:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: true });
          break;
        case ChatSetupStrategy.SetupWithoutEnterpriseProvider:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: false });
          break;
        case ChatSetupStrategy.DefaultSetup:
          success = await this.controller.value.setup();
          break;
      }
    } catch (error) {
      this.logService.error(`[chat setup] Error during setup: ${toErrorMessage(error)}`);
      success = false;
    }
    return { success, dialogSkipped };
  }
  async showDialog() {
    const disposables = new DisposableStore();
    let result = void 0;
    const buttons = [this.getPrimaryButton(), localize("maybeLater", "Maybe Later")];
    const dialog = disposables.add(new Dialog(this.layoutService.activeContainer, this.getDialogTitle(), buttons, createWorkbenchDialogOptions({
      type: "none",
      icon: Codicon.copilotLarge,
      cancelId: buttons.length - 1,
      renderBody: /* @__PURE__ */ __name((body) => body.appendChild(this.createDialog(disposables)), "renderBody"),
      primaryButtonDropdown: {
        contextMenuProvider: this.contextMenuService,
        addPrimaryActionToDropdown: false,
        actions: [
          toAction({ id: "setupWithProvider", label: localize("setupWithProvider", "Sign in with a {0} Account", defaultChat.providerName), run: /* @__PURE__ */ __name(() => result = ChatSetupStrategy.SetupWithoutEnterpriseProvider, "run") }),
          toAction({ id: "setupWithEnterpriseProvider", label: localize("setupWithEnterpriseProvider", "Sign in with a {0} Account", defaultChat.enterpriseProviderName), run: /* @__PURE__ */ __name(() => result = ChatSetupStrategy.SetupWithEnterpriseProvider, "run") })
        ]
      }
    }, this.keybindingService, this.layoutService)));
    const { button } = await dialog.show();
    disposables.dispose();
    return button === 0 ? result ?? ChatSetupStrategy.DefaultSetup : ChatSetupStrategy.Canceled;
  }
  getPrimaryButton() {
    if (this.context.state.entitlement === ChatEntitlement.Unknown) {
      return localize("signInButton", "Sign in");
    }
    return localize("useCopilotButton", "Use Copilot");
  }
  getDialogTitle() {
    if (this.context.state.entitlement === ChatEntitlement.Unknown) {
      return this.context.state.registered ? localize("signUp", "Sign in to use Copilot") : localize("signUpFree", "Sign in to use Copilot for free");
    }
    if (this.context.state.entitlement === ChatEntitlement.Pro) {
      return localize("copilotProTitle", "Start using Copilot Pro");
    }
    return this.context.state.registered ? localize("copilotTitle", "Start using Copilot") : localize("copilotFreeTitle", "Start using Copilot for free");
  }
  createDialog(disposables) {
    const element = $(".chat-setup-dialog");
    const markdown = this.instantiationService.createInstance(MarkdownRenderer, {});
    const header = localize({ key: "headerDialog", comment: ['{Locked="[Copilot]({0})"}'] }, "[Copilot]({0}) is your AI pair programmer. Write code faster with completions, fix bugs and build new features across multiple files, and learn about your codebase through chat.", defaultChat.documentationUrl);
    element.appendChild($("p.setup-header", void 0, disposables.add(markdown.render(new MarkdownString(header, { isTrusted: true }))).element));
    const terms = localize({ key: "terms", comment: ['{Locked="["}', '{Locked="]({0})"}', '{Locked="]({1})"}'] }, "By continuing, you agree to the [Terms]({0}) and [Privacy Policy]({1}).", defaultChat.termsStatementUrl, defaultChat.privacyStatementUrl);
    element.appendChild($("p.setup-legal", void 0, disposables.add(markdown.render(new MarkdownString(terms, { isTrusted: true }))).element));
    if (this.telemetryService.telemetryLevel !== 0) {
      const settings = copilotSettingsMessage;
      element.appendChild($("p.setup-settings", void 0, disposables.add(markdown.render(new MarkdownString(settings, { isTrusted: true }))).element));
    }
    return element;
  }
};
ChatSetup = ChatSetup_1 = __decorate([
  __param(2, IInstantiationService),
  __param(3, ITelemetryService),
  __param(4, IContextMenuService),
  __param(5, ILayoutService),
  __param(6, IKeybindingService),
  __param(7, IChatEntitlementService),
  __param(8, ILogService),
  __param(9, IConfigurationService)
], ChatSetup);
let ChatSetupContribution = class ChatSetupContribution2 extends Disposable {
  static {
    __name(this, "ChatSetupContribution");
  }
  static {
    this.ID = "workbench.contrib.chatSetup";
  }
  constructor(productService, instantiationService, commandService, telemetryService, chatEntitlementService, logService) {
    super();
    this.productService = productService;
    this.instantiationService = instantiationService;
    this.commandService = commandService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    const context = chatEntitlementService.context?.value;
    const requests = chatEntitlementService.requests?.value;
    if (!context || !requests) {
      return;
    }
    const controller = new Lazy(() => this._register(this.instantiationService.createInstance(ChatSetupController, context, requests)));
    this.registerSetupAgents(context, controller);
    this.registerActions(context, requests, controller);
    this.registerUrlLinkHandler();
  }
  registerSetupAgents(context, controller) {
    const defaultAgentDisposables = markAsSingleton(new MutableDisposable());
    const vscodeAgentDisposables = markAsSingleton(new MutableDisposable());
    const updateRegistration = /* @__PURE__ */ __name(() => {
      const disabled = context.state.hidden || context.state.disabled;
      if (!disabled) {
        if (!defaultAgentDisposables.value) {
          const disposables = defaultAgentDisposables.value = new DisposableStore();
          const panelAgentDisposables = disposables.add(new DisposableStore());
          for (const mode of [ChatMode.Ask, ChatMode.Edit, ChatMode.Agent]) {
            const { agent, disposable } = SetupAgent.registerDefaultAgents(this.instantiationService, ChatAgentLocation.Panel, mode, context, controller);
            panelAgentDisposables.add(disposable);
            panelAgentDisposables.add(agent.onUnresolvableError(() => {
              this.logService.error("[chat setup] Unresolvable error from Copilot agent registration, clearing registration.");
              panelAgentDisposables.dispose();
            }));
          }
          disposables.add(SetupAgent.registerDefaultAgents(this.instantiationService, ChatAgentLocation.Terminal, void 0, context, controller).disposable);
          disposables.add(SetupAgent.registerDefaultAgents(this.instantiationService, ChatAgentLocation.Notebook, void 0, context, controller).disposable);
          disposables.add(SetupAgent.registerDefaultAgents(this.instantiationService, ChatAgentLocation.Editor, void 0, context, controller).disposable);
        }
        if (!context.state.installed && !vscodeAgentDisposables.value) {
          const disposables = vscodeAgentDisposables.value = new DisposableStore();
          disposables.add(SetupAgent.registerVSCodeAgent(this.instantiationService, context, controller).disposable);
        }
      } else {
        defaultAgentDisposables.clear();
        vscodeAgentDisposables.clear();
      }
      if (context.state.installed) {
        vscodeAgentDisposables.clear();
      }
    }, "updateRegistration");
    this._register(Event.runAndSubscribe(context.onDidChange, () => updateRegistration()));
  }
  registerActions(context, requests, controller) {
    const chatSetupTriggerContext = ContextKeyExpr.or(ChatContextKeys.Setup.installed.negate(), ChatContextKeys.Entitlement.canSignUp);
    const CHAT_SETUP_ACTION_LABEL = localize2("triggerChatSetup", "Use AI Features with Copilot for free...");
    class ChatSetupTriggerAction extends Action2 {
      static {
        __name(this, "ChatSetupTriggerAction");
      }
      constructor() {
        super({
          id: CHAT_SETUP_ACTION_ID,
          title: CHAT_SETUP_ACTION_LABEL,
          category: CHAT_CATEGORY,
          f1: true,
          precondition: chatSetupTriggerContext
        });
      }
      async run(accessor, mode) {
        const viewsService = accessor.get(IViewsService);
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const instantiationService = accessor.get(IInstantiationService);
        const dialogService = accessor.get(IDialogService);
        const commandService = accessor.get(ICommandService);
        const lifecycleService = accessor.get(ILifecycleService);
        await context.update({ hidden: false });
        const chatWidgetPromise = showCopilotView(viewsService, layoutService);
        if (mode) {
          const chatWidget = await chatWidgetPromise;
          chatWidget?.input.setChatMode(mode);
        }
        const setup = ChatSetup.getInstance(instantiationService, context, controller);
        const { success } = await setup.run();
        if (success === false && !lifecycleService.willShutdown) {
          const { confirmed } = await dialogService.confirm({
            type: Severity.Error,
            message: localize("setupErrorDialog", "Copilot setup failed. Would you like to try again?"),
            primaryButton: localize("retry", "Retry")
          });
          if (confirmed) {
            commandService.executeCommand(CHAT_SETUP_ACTION_ID);
          }
        }
      }
    }
    class ChatSetupTriggerWithoutDialogAction extends Action2 {
      static {
        __name(this, "ChatSetupTriggerWithoutDialogAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.triggerSetupWithoutDialog",
          title: CHAT_SETUP_ACTION_LABEL,
          precondition: chatSetupTriggerContext
        });
      }
      async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const instantiationService = accessor.get(IInstantiationService);
        await context.update({ hidden: false });
        const chatWidget = await showCopilotView(viewsService, layoutService);
        ChatSetup.getInstance(instantiationService, context, controller).skipDialog();
        chatWidget?.acceptInput(localize("setupCopilot", "Set up Copilot."));
      }
    }
    class ChatSetupFromAccountsAction extends Action2 {
      static {
        __name(this, "ChatSetupFromAccountsAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.triggerSetupFromAccounts",
          title: localize2("triggerChatSetupFromAccounts", "Sign in to use Copilot..."),
          menu: {
            id: MenuId.AccountsContext,
            group: "2_copilot",
            when: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.installed.negate(), ChatContextKeys.Entitlement.signedOut)
          }
        });
      }
      async run(accessor) {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID);
      }
    }
    class ChatSetupHideAction extends Action2 {
      static {
        __name(this, "ChatSetupHideAction");
      }
      static {
        this.ID = "workbench.action.chat.hideSetup";
      }
      static {
        this.TITLE = localize2("hideChatSetup", "Hide Copilot");
      }
      constructor() {
        super({
          id: ChatSetupHideAction.ID,
          title: ChatSetupHideAction.TITLE,
          f1: true,
          category: CHAT_CATEGORY,
          precondition: ContextKeyExpr.and(ChatContextKeys.Setup.installed.negate(), ChatContextKeys.Setup.hidden.negate()),
          menu: {
            id: MenuId.ChatTitleBarMenu,
            group: "z_hide",
            order: 1,
            when: ChatContextKeys.Setup.installed.negate()
          }
        });
      }
      async run(accessor) {
        const viewsDescriptorService = accessor.get(IViewDescriptorService);
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const dialogService = accessor.get(IDialogService);
        const { confirmed } = await dialogService.confirm({
          message: localize("hideChatSetupConfirm", "Are you sure you want to hide Copilot?"),
          detail: localize("hideChatSetupDetail", "You can restore Copilot by running the '{0}' command.", CHAT_SETUP_ACTION_LABEL.value),
          primaryButton: localize("hideChatSetupButton", "Hide Copilot")
        });
        if (!confirmed) {
          return;
        }
        const location = viewsDescriptorService.getViewLocationById(ChatViewId);
        await context.update({ hidden: true });
        if (location === 2) {
          const activeContainers = viewsDescriptorService.getViewContainersByLocation(location).filter((container) => viewsDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0);
          if (activeContainers.length === 0) {
            layoutService.setPartHidden(
              true,
              "workbench.parts.auxiliarybar"
              /* Parts.AUXILIARYBAR_PART */
            );
          }
        }
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
          title: localize2("managePlan", "Upgrade to Copilot Pro"),
          category: localize2("chat.category", "Chat"),
          f1: true,
          precondition: ContextKeyExpr.or(ChatContextKeys.Entitlement.canSignUp, ChatContextKeys.Entitlement.limited),
          menu: {
            id: MenuId.ChatTitleBarMenu,
            group: "a_first",
            order: 1,
            when: ContextKeyExpr.and(ChatContextKeys.Entitlement.limited, ContextKeyExpr.or(ChatContextKeys.chatQuotaExceeded, ChatContextKeys.completionsQuotaExceeded))
          }
        });
      }
      async run(accessor, from) {
        const openerService = accessor.get(IOpenerService);
        const hostService = accessor.get(IHostService);
        const commandService = accessor.get(ICommandService);
        openerService.open(URI.parse(defaultChat.upgradePlanUrl));
        const entitlement = context.state.entitlement;
        if (entitlement !== ChatEntitlement.Pro) {
          windowFocusListener.value = hostService.onDidChangeFocus((focus) => this.onWindowFocus(focus, commandService));
        }
      }
      async onWindowFocus(focus, commandService) {
        if (focus) {
          windowFocusListener.clear();
          const entitlements = await requests.forceResolveEntitlement(void 0);
          if (entitlements?.entitlement === ChatEntitlement.Pro) {
            refreshTokens(commandService);
          }
        }
      }
    }
    registerAction2(ChatSetupTriggerAction);
    registerAction2(ChatSetupFromAccountsAction);
    registerAction2(ChatSetupTriggerWithoutDialogAction);
    registerAction2(ChatSetupHideAction);
    registerAction2(UpgradePlanAction);
  }
  registerUrlLinkHandler() {
    this._register(ExtensionUrlHandlerOverrideRegistry.registerHandler({
      canHandleURL: /* @__PURE__ */ __name((url) => {
        return url.scheme === this.productService.urlProtocol && equalsIgnoreCase(url.authority, defaultChat.chatExtensionId);
      }, "canHandleURL"),
      handleURL: /* @__PURE__ */ __name(async (url) => {
        const params = new URLSearchParams(url.query);
        this.telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "url", detail: params.get("referrer") ?? void 0 });
        await this.commandService.executeCommand(CHAT_SETUP_ACTION_ID, validateChatMode(params.get("mode")));
        return true;
      }, "handleURL")
    }));
  }
};
ChatSetupContribution = __decorate([
  __param(0, IProductService),
  __param(1, IInstantiationService),
  __param(2, ICommandService),
  __param(3, ITelemetryService),
  __param(4, IChatEntitlementService),
  __param(5, ILogService)
], ChatSetupContribution);
var ChatSetupStep;
(function(ChatSetupStep2) {
  ChatSetupStep2[ChatSetupStep2["Initial"] = 1] = "Initial";
  ChatSetupStep2[ChatSetupStep2["SigningIn"] = 2] = "SigningIn";
  ChatSetupStep2[ChatSetupStep2["Installing"] = 3] = "Installing";
})(ChatSetupStep || (ChatSetupStep = {}));
let ChatSetupController = class ChatSetupController2 extends Disposable {
  static {
    __name(this, "ChatSetupController");
  }
  get step() {
    return this._step;
  }
  constructor(context, requests, telemetryService, authenticationService, extensionsWorkbenchService, productService, logService, progressService, activityService, commandService, workspaceTrustRequestService, dialogService, configurationService, lifecycleService, quickInputService) {
    super();
    this.context = context;
    this.requests = requests;
    this.telemetryService = telemetryService;
    this.authenticationService = authenticationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.productService = productService;
    this.logService = logService;
    this.progressService = progressService;
    this.activityService = activityService;
    this.commandService = commandService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.dialogService = dialogService;
    this.configurationService = configurationService;
    this.lifecycleService = lifecycleService;
    this.quickInputService = quickInputService;
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
  async setup(options) {
    const watch = new StopWatch(false);
    const title = localize("setupChatProgress", "Getting Copilot ready...");
    const badge = this.activityService.showViewContainerActivity(CHAT_SIDEBAR_PANEL_ID, {
      badge: new ProgressBadge(() => title)
    });
    try {
      return await this.progressService.withProgress({
        location: 10,
        command: CHAT_OPEN_ACTION_ID,
        title
      }, () => this.doSetup(options ?? {}, watch));
    } finally {
      badge.dispose();
    }
  }
  async doSetup(options, watch) {
    this.context.suspend();
    let success = false;
    try {
      const providerId = ChatEntitlementRequests.providerId(this.configurationService);
      let session;
      let entitlement;
      if (this.context.state.entitlement === ChatEntitlement.Unknown || options.forceSignIn) {
        this.setStep(ChatSetupStep.SigningIn);
        const result = await this.signIn(providerId);
        if (!result.session) {
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedNotSignedIn", installDuration: watch.elapsed(), signUpErrorCode: void 0 });
          return false;
        }
        session = result.session;
        entitlement = result.entitlement;
      }
      const trusted = await this.workspaceTrustRequestService.requestWorkspaceTrust({
        message: localize("copilotWorkspaceTrust", "Copilot is currently only supported in trusted workspaces.")
      });
      if (!trusted) {
        this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedNotTrusted", installDuration: watch.elapsed(), signUpErrorCode: void 0 });
        return false;
      }
      this.setStep(ChatSetupStep.Installing);
      success = await this.install(session, entitlement ?? this.context.state.entitlement, providerId, watch);
    } finally {
      this.setStep(ChatSetupStep.Initial);
      this.context.resume();
    }
    return success;
  }
  async signIn(providerId) {
    let session;
    let entitlements;
    try {
      ({ session, entitlements } = await this.requests.signIn());
    } catch (e) {
      this.logService.error(`[chat setup] signIn: error ${e}`);
    }
    if (!session && !this.lifecycleService.willShutdown) {
      const { confirmed } = await this.dialogService.confirm({
        type: Severity.Error,
        message: localize("unknownSignInError", "Failed to sign in to {0}. Would you like to try again?", ChatEntitlementRequests.providerId(this.configurationService) === defaultChat.enterpriseProviderId ? defaultChat.enterpriseProviderName : defaultChat.providerName),
        detail: localize("unknownSignInErrorDetail", "You must be signed in to use Copilot."),
        primaryButton: localize("retry", "Retry")
      });
      if (confirmed) {
        return this.signIn(providerId);
      }
    }
    return { session, entitlement: entitlements?.entitlement };
  }
  async install(session, entitlement, providerId, watch) {
    const wasInstalled = this.context.state.installed;
    let signUpResult = void 0;
    try {
      if (entitlement !== ChatEntitlement.Limited && // User is not signed up to Copilot Free
      entitlement !== ChatEntitlement.Pro && // User is not signed up to Copilot Pro
      entitlement !== ChatEntitlement.Unavailable) {
        if (!session) {
          try {
            session = (await this.authenticationService.getSessions(providerId)).at(0);
          } catch (error) {
          }
          if (!session) {
            this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedNoSession", installDuration: watch.elapsed(), signUpErrorCode: void 0 });
            return false;
          }
        }
        signUpResult = await this.requests.signUpLimited(session);
        if (typeof signUpResult !== "boolean") {
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedSignUp", installDuration: watch.elapsed(), signUpErrorCode: signUpResult.errorCode });
        }
      }
      await this.doInstall();
    } catch (error) {
      this.logService.error(`[chat setup] install: error ${error}`);
      this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: isCancellationError(error) ? "cancelled" : "failedInstall", installDuration: watch.elapsed(), signUpErrorCode: void 0 });
      return false;
    }
    if (typeof signUpResult === "boolean") {
      this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: wasInstalled && !signUpResult ? "alreadyInstalled" : "installed", installDuration: watch.elapsed(), signUpErrorCode: void 0 });
    }
    if (wasInstalled && signUpResult === true) {
      refreshTokens(this.commandService);
    }
    return true;
  }
  async doInstall() {
    let error;
    try {
      await this.extensionsWorkbenchService.install(defaultChat.extensionId, {
        enable: true,
        isApplicationScoped: true,
        // install into all profiles
        isMachineScoped: false,
        // do not ask to sync
        installEverywhere: true,
        // install in local and remote
        installPreReleaseVersion: this.productService.quality !== "stable"
      }, ChatViewId);
    } catch (e) {
      this.logService.error(`[chat setup] install: error ${error}`);
      error = e;
    }
    if (error) {
      if (!this.lifecycleService.willShutdown) {
        const { confirmed } = await this.dialogService.confirm({
          type: Severity.Error,
          message: localize("unknownSetupError", "An error occurred while setting up Copilot. Would you like to try again?"),
          detail: error && !isCancellationError(error) ? toErrorMessage(error) : void 0,
          primaryButton: localize("retry", "Retry")
        });
        if (confirmed) {
          return this.doInstall();
        }
      }
      throw error;
    }
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
        return false;
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
          "authProvider": defaultChat.enterpriseProviderId
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
      await this.configurationService.updateValue(
        defaultChat.providerUriSetting,
        void 0,
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
      prompt: localize("enterpriseInstance", "What is your {0} instance?", defaultChat.enterpriseProviderName),
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
            content: localize("invalidEnterpriseInstance", 'You must enter a valid {0} instance (i.e. "octocat" or "https://octocat.ghe.com")', defaultChat.enterpriseProviderName),
            severity: Severity.Error
          };
        }
        return void 0;
      }, "validateInput")
    });
    if (!result) {
      const { confirmed } = await this.dialogService.confirm({
        type: Severity.Error,
        message: localize("enterpriseSetupError", "The provided {0} instance is invalid. Would you like to enter it again?", defaultChat.enterpriseProviderName),
        primaryButton: localize("retry", "Retry")
      });
      if (confirmed) {
        return this.handleEnterpriseInstance();
      }
      return false;
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
  __param(3, IAuthenticationService),
  __param(4, IExtensionsWorkbenchService),
  __param(5, IProductService),
  __param(6, ILogService),
  __param(7, IProgressService),
  __param(8, IActivityService),
  __param(9, ICommandService),
  __param(10, IWorkspaceTrustRequestService),
  __param(11, IDialogService),
  __param(12, IConfigurationService),
  __param(13, ILifecycleService),
  __param(14, IQuickInputService)
], ChatSetupController);
function refreshTokens(commandService) {
  commandService.executeCommand(defaultChat.completionsRefreshTokenCommand);
  commandService.executeCommand(defaultChat.chatRefreshTokenCommand);
}
__name(refreshTokens, "refreshTokens");
export {
  ChatSetupContribution
};
//# sourceMappingURL=chatSetup.js.map
