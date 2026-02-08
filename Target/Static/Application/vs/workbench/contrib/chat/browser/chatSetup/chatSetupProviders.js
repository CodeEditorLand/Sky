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
var SetupAgent_1, AINewSymbolNamesProvider_1, ChatCodeActionsProvider_1;
import { timeout } from "../../../../../base/common/async.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../../../nls.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import product from "../../../../../platform/product/common/product.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceTrustManagementService } from "../../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkbenchEnvironmentService } from "../../../../services/environment/common/environmentService.js";
import { nullExtensionDescription } from "../../../../services/extensions/common/extensions.js";
import { ILanguageModelToolsService, ToolDataSource } from "../../common/tools/languageModelToolsService.js";
import { IChatAgentService } from "../../common/participants/chatAgents.js";
import { ChatEntitlement, IChatEntitlementService } from "../../../../services/chat/common/chatEntitlementService.js";
import { ChatRequestModel } from "../../common/model/chatModel.js";
import { ChatMode } from "../../common/chatModes.js";
import { ChatRequestAgentPart, ChatRequestToolPart } from "../../common/requestParser/chatParserTypes.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind } from "../../common/constants.js";
import { ILanguageModelsService } from "../../common/languageModels.js";
import { CHAT_OPEN_ACTION_ID, CHAT_SETUP_ACTION_ID } from "../actions/chatActions.js";
import { ChatViewId, IChatWidgetService } from "../chat.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { ILanguageFeaturesService } from "../../../../../editor/common/services/languageFeatures.js";
import { Selection } from "../../../../../editor/common/core/selection.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { CodeActionKind } from "../../../../../editor/contrib/codeAction/common/types.js";
import { ACTION_START as INLINE_CHAT_START } from "../../../inlineChat/common/inlineChat.js";
import { IMarkerService, MarkerSeverity } from "../../../../../platform/markers/common/markers.js";
import { ChatSetupAnonymous, ChatSetupStep } from "./chatSetup.js";
import { ChatSetup } from "./chatSetupRunner.js";
import { CommandsRegistry } from "../../../../../platform/commands/common/commands.js";
import { IDefaultAccountService } from "../../../../../platform/defaultAccount/common/defaultAccount.js";
import { IHostService } from "../../../../services/host/browser/host.js";
const defaultChat = {
  extensionId: product.defaultChatAgent?.extensionId ?? "",
  chatExtensionId: product.defaultChatAgent?.chatExtensionId ?? "",
  provider: product.defaultChatAgent?.provider ?? { default: { id: "", name: "" }, enterprise: { id: "", name: "" }, apple: { id: "", name: "" }, google: { id: "", name: "" } },
  outputChannelId: product.defaultChatAgent?.chatExtensionOutputId ?? ""
};
const ToolsAgentContextKey = ContextKeyExpr.and(
  ContextKeyExpr.equals(`config.${ChatConfiguration.AgentEnabled}`, true),
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
      let description;
      if (mode === ChatModeKind.Ask) {
        description = ChatMode.Ask.description.get();
      } else if (mode === ChatModeKind.Edit) {
        description = ChatMode.Edit.description.get();
      } else {
        description = ChatMode.Agent.description.get();
      }
      let id;
      switch (location) {
        case ChatAgentLocation.Chat:
          if (mode === ChatModeKind.Ask) {
            id = "setup.chat";
          } else if (mode === ChatModeKind.Edit) {
            id = "setup.edits";
          } else {
            id = "setup.agent";
          }
          break;
        case ChatAgentLocation.Terminal:
          id = "setup.terminal";
          break;
        case ChatAgentLocation.EditorInline:
          id = "setup.editor";
          break;
        case ChatAgentLocation.Notebook:
          id = "setup.notebook";
          break;
      }
      return SetupAgent_1.doRegisterAgent(instantiationService, chatAgentService, id, `${defaultChat.provider.default.name} Copilot`, true, description, location, mode, context, controller);
    });
  }
  static registerBuiltInAgents(instantiationService, context, controller) {
    return instantiationService.invokeFunction((accessor) => {
      const chatAgentService = accessor.get(IChatAgentService);
      const disposables = new DisposableStore();
      const { disposable: vscodeDisposable } = SetupAgent_1.doRegisterAgent(instantiationService, chatAgentService, "setup.vscode", "vscode", false, localize2("vscodeAgentDescription", "Ask questions about VS Code").value, ChatAgentLocation.Chat, ChatModeKind.Agent, context, controller);
      disposables.add(vscodeDisposable);
      const { disposable: workspaceDisposable } = SetupAgent_1.doRegisterAgent(instantiationService, chatAgentService, "setup.workspace", "workspace", false, localize2("workspaceAgentDescription", "Ask about your workspace").value, ChatAgentLocation.Chat, ChatModeKind.Agent, context, controller);
      disposables.add(workspaceDisposable);
      const { disposable: terminalDisposable } = SetupAgent_1.doRegisterAgent(instantiationService, chatAgentService, "setup.terminal.agent", "terminal", false, localize2("terminalAgentDescription", "Ask how to do something in the terminal").value, ChatAgentLocation.Chat, ChatModeKind.Agent, context, controller);
      disposables.add(terminalDisposable);
      disposables.add(SetupTool.registerTool(instantiationService, {
        id: "setup_tools_createNewWorkspace",
        source: ToolDataSource.Internal,
        icon: Codicon.newFolder,
        displayName: localize("setupToolDisplayName", "New Workspace"),
        modelDescription: "Scaffold a new workspace in VS Code",
        userDescription: localize("setupToolsDescription", "Scaffold a new workspace in VS Code"),
        canBeReferencedInPrompt: true,
        toolReferenceName: "new",
        when: ContextKeyExpr.true()
      }));
      return disposables;
    });
  }
  static doRegisterAgent(instantiationService, chatAgentService, id, name, isDefault, description, location, mode, context, controller) {
    const disposables = new DisposableStore();
    disposables.add(chatAgentService.registerAgent(id, {
      id,
      name,
      isDefault,
      isCore: true,
      modes: [mode],
      when: mode === ChatModeKind.Agent ? ToolsAgentContextKey?.serialize() : void 0,
      slashCommands: [],
      disambiguation: [],
      locations: [location],
      metadata: { helpTextPrefix: SetupAgent_1.SETUP_NEEDED_MESSAGE },
      description,
      extensionId: nullExtensionDescription.identifier,
      extensionVersion: void 0,
      extensionDisplayName: nullExtensionDescription.name,
      extensionPublisherId: nullExtensionDescription.publisher
    }));
    const agent = disposables.add(instantiationService.createInstance(SetupAgent_1, context, controller, location));
    disposables.add(chatAgentService.registerAgentImplementation(id, agent));
    if (mode === ChatModeKind.Agent) {
      chatAgentService.updateAgent(id, { themeIcon: Codicon.tools });
    }
    return { agent, disposable: disposables };
  }
  static {
    this.SETUP_NEEDED_MESSAGE = new MarkdownString(localize("settingUpCopilotNeeded", "You need to set up GitHub Copilot and be signed in to use Chat."));
  }
  static {
    this.TRUST_NEEDED_MESSAGE = new MarkdownString(localize("trustNeeded", "You need to trust this workspace to use Chat."));
  }
  static {
    this.CHAT_RETRY_COMMAND_ID = "workbench.action.chat.retrySetup";
  }
  constructor(context, controller, location, instantiationService, logService, telemetryService, environmentService, workspaceTrustManagementService, chatEntitlementService, viewsService) {
    super();
    this.context = context;
    this.controller = controller;
    this.location = location;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.telemetryService = telemetryService;
    this.environmentService = environmentService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.chatEntitlementService = chatEntitlementService;
    this.viewsService = viewsService;
    this._onUnresolvableError = this._register(new Emitter());
    this.onUnresolvableError = this._onUnresolvableError.event;
    this.pendingForwardedRequests = new ResourceMap();
    this.registerCommands();
  }
  registerCommands() {
    this._register(CommandsRegistry.registerCommand(SetupAgent_1.CHAT_RETRY_COMMAND_ID, async (accessor, sessionResource) => {
      const hostService = accessor.get(IHostService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const widget = chatWidgetService.getWidgetBySessionResource(sessionResource);
      await widget?.clear();
      hostService.reload();
    }));
  }
  async invoke(request, progress) {
    return this.instantiationService.invokeFunction(async (accessor) => {
      const chatService = accessor.get(IChatService);
      const languageModelsService = accessor.get(ILanguageModelsService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const chatAgentService = accessor.get(IChatAgentService);
      const languageModelToolsService = accessor.get(ILanguageModelToolsService);
      const defaultAccountService = accessor.get(IDefaultAccountService);
      return this.doInvoke(request, (part) => progress([part]), chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService, defaultAccountService);
    });
  }
  async doInvoke(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService, defaultAccountService) {
    if (!this.context.state.installed || // Extension not installed: run setup to install
    this.context.state.disabled || // Extension disabled: run setup to enable
    this.context.state.untrusted || // Workspace untrusted: run setup to ask for trust
    this.context.state.entitlement === ChatEntitlement.Available || // Entitlement available: run setup to sign up
    this.context.state.entitlement === ChatEntitlement.Unknown && // Entitlement unknown: run setup to sign in / sign up
    !this.chatEntitlementService.anonymous) {
      return this.doInvokeWithSetup(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService, defaultAccountService);
    }
    return this.doInvokeWithoutSetup(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService);
  }
  async doInvokeWithoutSetup(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService) {
    const requestModel = chatWidgetService.getWidgetBySessionResource(request.sessionResource)?.viewModel?.model.getRequests().at(-1);
    if (!requestModel) {
      this.logService.error("[chat setup] Request model not found, cannot redispatch request.");
      return {};
    }
    progress({
      kind: "progressMessage",
      content: new MarkdownString(localize("waitingChat", "Getting chat ready..."))
    });
    await this.forwardRequestToChat(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
    return {};
  }
  async forwardRequestToChat(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService) {
    try {
      await this.doForwardRequestToChat(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
    } catch (error) {
      this.logService.error("[chat setup] Failed to forward request to chat", error);
      progress({
        kind: "warning",
        content: new MarkdownString(localize("copilotUnavailableWarning", "Failed to get a response. Please try again."))
      });
    }
  }
  async doForwardRequestToChat(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService) {
    if (this.pendingForwardedRequests.has(requestModel.session.sessionResource)) {
      throw new Error("Request already in progress");
    }
    const forwardRequest = this.doForwardRequestToChatWhenReady(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
    this.pendingForwardedRequests.set(requestModel.session.sessionResource, forwardRequest);
    try {
      await forwardRequest;
    } finally {
      this.pendingForwardedRequests.delete(requestModel.session.sessionResource);
    }
  }
  async doForwardRequestToChatWhenReady(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService) {
    const widget = chatWidgetService.getWidgetBySessionResource(requestModel.session.sessionResource);
    const modeInfo = widget?.input.currentModeInfo;
    let agentActivated = false;
    let agentReady = false;
    let languageModelReady = false;
    let toolsModelReady = false;
    const whenAgentActivated = this.whenAgentActivated(chatService).then(() => agentActivated = true);
    const whenAgentReady = this.whenAgentReady(chatAgentService, modeInfo?.kind)?.then(() => agentReady = true);
    if (!whenAgentReady) {
      agentReady = true;
    }
    const whenLanguageModelReady = this.whenLanguageModelReady(languageModelsService, requestModel.modelId)?.then(() => languageModelReady = true);
    if (!whenLanguageModelReady) {
      languageModelReady = true;
    }
    const whenToolsModelReady = this.whenToolsModelReady(languageModelToolsService, requestModel)?.then(() => toolsModelReady = true);
    if (!whenToolsModelReady) {
      toolsModelReady = true;
    }
    if (whenLanguageModelReady instanceof Promise || whenAgentReady instanceof Promise || whenToolsModelReady instanceof Promise) {
      const timeoutHandle = setTimeout(() => {
        progress({
          kind: "progressMessage",
          content: new MarkdownString(localize("waitingChat2", "Chat is almost ready..."))
        });
      }, 1e4);
      try {
        const ready = await Promise.race([
          timeout(this.environmentService.remoteAuthority ? 6e4 : 2e4).then(() => "timedout"),
          Promise.allSettled([
            whenAgentActivated,
            whenAgentReady,
            whenLanguageModelReady,
            whenToolsModelReady
          ])
        ]);
        if (ready === "timedout") {
          let warningMessage;
          if (this.chatEntitlementService.anonymous) {
            warningMessage = localize("chatTookLongWarningAnonymous", "Chat took too long to get ready. Please ensure that the extension `{0}` is installed and enabled. Click restart to try again if this issue persists.", defaultChat.chatExtensionId);
          } else {
            warningMessage = localize("chatTookLongWarning", "Chat took too long to get ready. Please ensure you are signed in to {0} and that the extension `{1}` is installed and enabled. Click restart to try again if this issue persists.", defaultChat.provider.default.name, defaultChat.chatExtensionId);
          }
          this.logService.warn(warningMessage, {
            agentActivated,
            agentReady,
            languageModelReady,
            toolsModelReady
          });
          const chatViewPane = this.viewsService.getActiveViewWithId(ChatViewId);
          const matchingWelcomeView = chatViewPane?.getMatchingWelcomeView();
          this.telemetryService.publicLog2("chatSetup.timeout", {
            agentActivated,
            agentReady,
            languageModelReady,
            toolsModelReady,
            isRemote: !!this.environmentService.remoteAuthority,
            isAnonymous: this.chatEntitlementService.anonymous,
            matchingWelcomeViewWhen: matchingWelcomeView?.when.serialize() ?? (chatViewPane ? "noWelcomeView" : "noChatViewPane")
          });
          progress({
            kind: "warning",
            content: new MarkdownString(warningMessage)
          });
          progress({
            kind: "command",
            command: {
              id: SetupAgent_1.CHAT_RETRY_COMMAND_ID,
              title: localize("retryChat", "Restart"),
              arguments: [requestModel.session.sessionResource]
            }
          });
          this._onUnresolvableError.fire();
          return;
        }
      } finally {
        clearTimeout(timeoutHandle);
      }
    }
    await chatService.resendRequest(requestModel, {
      ...widget?.getModeRequestOptions(),
      modeInfo,
      userSelectedModelId: widget?.input.currentLanguageModel
    });
  }
  whenLanguageModelReady(languageModelsService, modelId) {
    const hasModelForRequest = /* @__PURE__ */ __name(() => {
      if (modelId) {
        return !!languageModelsService.lookupLanguageModel(modelId);
      }
      for (const id of languageModelsService.getLanguageModelIds()) {
        const model = languageModelsService.lookupLanguageModel(id);
        if (model?.isDefaultForLocation[ChatAgentLocation.Chat]) {
          return true;
        }
      }
      return false;
    }, "hasModelForRequest");
    if (hasModelForRequest()) {
      return;
    }
    return Event.toPromise(Event.filter(languageModelsService.onDidChangeLanguageModels, () => hasModelForRequest()));
  }
  whenToolsModelReady(languageModelToolsService, requestModel) {
    const needsToolsModel = requestModel.message.parts.some((part) => part instanceof ChatRequestToolPart);
    if (!needsToolsModel) {
      return;
    }
    for (const tool of languageModelToolsService.getAllToolsIncludingDisabled()) {
      if (tool.id.startsWith("copilot_")) {
        return;
      }
    }
    return Event.toPromise(Event.filter(languageModelToolsService.onDidChangeTools, () => {
      for (const tool of languageModelToolsService.getAllToolsIncludingDisabled()) {
        if (tool.id.startsWith("copilot_")) {
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
  async whenAgentActivated(chatService) {
    try {
      await chatService.activateDefaultAgent(this.location);
    } catch (error) {
      this.logService.error(error);
    }
  }
  async doInvokeWithSetup(request, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService, defaultAccountService) {
    this.telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "chat" });
    const widget = chatWidgetService.getWidgetBySessionResource(request.sessionResource);
    const requestModel = widget?.viewModel?.model.getRequests().at(-1);
    const setupListener = Event.runAndSubscribe(this.controller.value.onDidChange, (() => {
      switch (this.controller.value.step) {
        case ChatSetupStep.SigningIn:
          progress({
            kind: "progressMessage",
            content: new MarkdownString(localize("setupChatSignIn2", "Signing in to {0}...", defaultAccountService.getDefaultAccountAuthenticationProvider().name))
          });
          break;
        case ChatSetupStep.Installing:
          progress({
            kind: "progressMessage",
            content: new MarkdownString(localize("installingChat", "Getting chat ready..."))
          });
          break;
      }
    }));
    let result = void 0;
    try {
      result = await ChatSetup.getInstance(this.instantiationService, this.context, this.controller).run({
        disableChatViewReveal: true,
        // we are already in a chat context
        forceAnonymous: this.chatEntitlementService.anonymous ? ChatSetupAnonymous.EnabledWithoutDialog : void 0
        // only enable anonymous selectively
      });
    } catch (error) {
      this.logService.error(`[chat setup] Error during setup: ${toErrorMessage(error)}`);
    } finally {
      setupListener.dispose();
    }
    if (typeof result?.success === "boolean") {
      if (result.success) {
        if (result.dialogSkipped) {
          await widget?.clear();
        } else if (requestModel) {
          let newRequest = this.replaceAgentInRequestModel(requestModel, chatAgentService);
          newRequest = this.replaceToolInRequestModel(newRequest);
          await this.forwardRequestToChat(newRequest, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
        }
      } else {
        progress({
          kind: "warning",
          content: new MarkdownString(localize("chatSetupError", "Chat setup failed."))
        });
      }
    } else {
      progress({
        kind: "markdownContent",
        content: this.workspaceTrustManagementService.isWorkspaceTrusted() ? SetupAgent_1.SETUP_NEEDED_MESSAGE : SetupAgent_1.TRUST_NEEDED_MESSAGE
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
      modeInfo: requestModel.modeInfo,
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
      modeInfo: requestModel.modeInfo,
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
  __param(5, ITelemetryService),
  __param(6, IWorkbenchEnvironmentService),
  __param(7, IWorkspaceTrustManagementService),
  __param(8, IChatEntitlementService),
  __param(9, IViewsService)
], SetupAgent);
class SetupTool {
  static {
    __name(this, "SetupTool");
  }
  static registerTool(instantiationService, toolData) {
    return instantiationService.invokeFunction((accessor) => {
      const toolService = accessor.get(ILanguageModelToolsService);
      const tool = instantiationService.createInstance(SetupTool);
      return toolService.registerTool(toolData, tool);
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
let AINewSymbolNamesProvider = AINewSymbolNamesProvider_1 = class AINewSymbolNamesProvider2 {
  static {
    __name(this, "AINewSymbolNamesProvider");
  }
  static registerProvider(instantiationService, context, controller) {
    return instantiationService.invokeFunction((accessor) => {
      const languageFeaturesService = accessor.get(ILanguageFeaturesService);
      const provider = instantiationService.createInstance(AINewSymbolNamesProvider_1, context, controller);
      return languageFeaturesService.newSymbolNamesProvider.register("*", provider);
    });
  }
  constructor(context, controller, instantiationService, chatEntitlementService) {
    this.context = context;
    this.controller = controller;
    this.instantiationService = instantiationService;
    this.chatEntitlementService = chatEntitlementService;
  }
  async provideNewSymbolNames(model, range, triggerKind, token) {
    await this.instantiationService.invokeFunction((accessor) => {
      return ChatSetup.getInstance(this.instantiationService, this.context, this.controller).run({
        forceAnonymous: this.chatEntitlementService.anonymous ? ChatSetupAnonymous.EnabledWithDialog : void 0
      });
    });
    return [];
  }
};
AINewSymbolNamesProvider = AINewSymbolNamesProvider_1 = __decorate([
  __param(2, IInstantiationService),
  __param(3, IChatEntitlementService)
], AINewSymbolNamesProvider);
let ChatCodeActionsProvider = ChatCodeActionsProvider_1 = class ChatCodeActionsProvider2 {
  static {
    __name(this, "ChatCodeActionsProvider");
  }
  static registerProvider(instantiationService) {
    return instantiationService.invokeFunction((accessor) => {
      const languageFeaturesService = accessor.get(ILanguageFeaturesService);
      const provider = instantiationService.createInstance(ChatCodeActionsProvider_1);
      return languageFeaturesService.codeActionProvider.register("*", provider);
    });
  }
  constructor(markerService) {
    this.markerService = markerService;
  }
  async provideCodeActions(model, range) {
    const actions = [];
    let generateOrModifyTitle;
    let generateOrModifyCommand;
    if (range.isEmpty()) {
      const textAtLine = model.getLineContent(range.startLineNumber);
      if (/^\s*$/.test(textAtLine)) {
        generateOrModifyTitle = localize("generate", "Generate");
        generateOrModifyCommand = AICodeActionsHelper.generate(range);
      }
    } else {
      const textInSelection = model.getValueInRange(range);
      if (!/^\s*$/.test(textInSelection)) {
        generateOrModifyTitle = localize("modify", "Modify");
        generateOrModifyCommand = AICodeActionsHelper.modify(range);
      }
    }
    if (generateOrModifyTitle && generateOrModifyCommand) {
      actions.push({
        kind: CodeActionKind.RefactorRewrite.append("copilot").value,
        isAI: true,
        title: generateOrModifyTitle,
        command: generateOrModifyCommand
      });
    }
    const markers = AICodeActionsHelper.warningOrErrorMarkersAtRange(this.markerService, model.uri, range);
    if (markers.length > 0) {
      actions.push({
        kind: CodeActionKind.QuickFix.append("copilot").value,
        isAI: true,
        diagnostics: markers,
        title: localize("fix", "Fix"),
        command: AICodeActionsHelper.fixMarkers(markers, range)
      });
      actions.push({
        kind: CodeActionKind.QuickFix.append("explain").append("copilot").value,
        isAI: true,
        diagnostics: markers,
        title: localize("explain", "Explain"),
        command: AICodeActionsHelper.explainMarkers(markers)
      });
    }
    return {
      actions,
      dispose() {
      }
    };
  }
};
ChatCodeActionsProvider = ChatCodeActionsProvider_1 = __decorate([
  __param(0, IMarkerService)
], ChatCodeActionsProvider);
class AICodeActionsHelper {
  static {
    __name(this, "AICodeActionsHelper");
  }
  static warningOrErrorMarkersAtRange(markerService, resource, range) {
    return markerService.read({ resource, severities: MarkerSeverity.Error | MarkerSeverity.Warning }).filter((marker) => range.startLineNumber <= marker.endLineNumber && range.endLineNumber >= marker.startLineNumber);
  }
  static modify(range) {
    return {
      id: INLINE_CHAT_START,
      title: localize("modify", "Modify"),
      arguments: [
        {
          initialSelection: this.rangeToSelection(range),
          initialRange: range,
          position: range.getStartPosition()
        }
      ]
    };
  }
  static generate(range) {
    return {
      id: INLINE_CHAT_START,
      title: localize("generate", "Generate"),
      arguments: [
        {
          initialSelection: this.rangeToSelection(range),
          initialRange: range,
          position: range.getStartPosition()
        }
      ]
    };
  }
  static rangeToSelection(range) {
    return new Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
  }
  static explainMarkers(markers) {
    return {
      id: CHAT_OPEN_ACTION_ID,
      title: localize("explain", "Explain"),
      arguments: [
        {
          query: `@workspace /explain ${markers.map((marker) => marker.message).join(", ")}`,
          isPartialQuery: true
        }
      ]
    };
  }
  static fixMarkers(markers, range) {
    return {
      id: INLINE_CHAT_START,
      title: localize("fix", "Fix"),
      arguments: [
        {
          message: `/fix ${markers.map((marker) => marker.message).join(", ")}`,
          initialSelection: this.rangeToSelection(range),
          initialRange: range,
          position: range.getStartPosition()
        }
      ]
    };
  }
}
export {
  AICodeActionsHelper,
  AINewSymbolNamesProvider,
  ChatCodeActionsProvider,
  SetupAgent,
  SetupTool
};
//# sourceMappingURL=chatSetupProviders.js.map
