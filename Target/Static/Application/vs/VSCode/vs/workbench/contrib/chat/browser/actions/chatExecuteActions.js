var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { basename } from "../../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { assertType } from "../../../../../base/common/types.js";
import { EditorContextKeys } from "../../../../../editor/common/editorContextKeys.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { IsSessionsWindowContext } from "../../../../common/contextkeys.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { getModeNameForTelemetry, IChatModeService } from "../../common/chatModes.js";
import { chatVariableLeader } from "../../common/requestParser/chatParserTypes.js";
import { ChatStopCancellationNoopEventName, IChatService } from "../../common/chatService/chatService.js";
import { ChatAgentLocation, ChatConfiguration, ChatModeKind } from "../../common/constants.js";
import { ILanguageModelToolsService } from "../../common/tools/languageModelToolsService.js";
import { isInClaudeAgentsFolder } from "../../common/promptSyntax/config/promptFileLocations.js";
import { IChatSessionsService, localChatSessionType } from "../../common/chatSessionsService.js";
import { IChatWidgetService } from "../chat.js";
import { getAgentSessionProvider, AgentSessionProviders } from "../agentSessions/agentSessions.js";
import { getEditingSessionContext } from "../chatEditing/chatEditingActions.js";
import { ctxHasEditorModification, ctxHasRequestInProgress, ctxIsGlobalEditingSession } from "../chatEditing/chatEditingEditorContextKeys.js";
import { ACTION_ID_NEW_CHAT, CHAT_CATEGORY, clearChatSessionPreservingType, handleCurrentEditingSession, handleModeSwitch } from "./chatActions.js";
import { CreateRemoteAgentJobAction } from "./chatContinueInAction.js";
import { CTX_HOVER_MODE } from "../../../inlineChat/common/inlineChat.js";
class SubmitAction extends Action2 {
  static {
    __name(this, "SubmitAction");
  }
  async run(accessor, ...args) {
    const context = args[0];
    const telemetryService = accessor.get(ITelemetryService);
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    const pendingDelegationTarget = widget?.input.pendingDelegationTarget;
    if (pendingDelegationTarget && pendingDelegationTarget !== AgentSessionProviders.Local) {
      return await this.handleDelegation(accessor, widget, pendingDelegationTarget);
    }
    if (widget?.viewModel?.editing) {
      const configurationService = accessor.get(IConfigurationService);
      const dialogService = accessor.get(IDialogService);
      const chatService = accessor.get(IChatService);
      const chatModel = chatService.getSession(widget.viewModel.sessionResource);
      if (!chatModel) {
        return;
      }
      const session = chatModel.editingSession;
      if (!session) {
        return;
      }
      const requestId = widget.viewModel?.editing.id;
      if (requestId) {
        const chatRequests = chatModel.getRequests();
        const itemIndex = chatRequests.findIndex((request) => request.id === requestId);
        const editsToUndo = chatRequests.length - itemIndex;
        const requestsToRemove = chatRequests.slice(itemIndex);
        const requestIdsToRemove = new Set(requestsToRemove.map((request) => request.id));
        const entriesModifiedInRequestsToRemove = session.entries.get().filter((entry) => requestIdsToRemove.has(entry.lastModifyingRequestId)) ?? [];
        const shouldPrompt = entriesModifiedInRequestsToRemove.length > 0 && configurationService.getValue("chat.editing.confirmEditRequestRemoval") === true;
        let message;
        if (editsToUndo === 1) {
          if (entriesModifiedInRequestsToRemove.length === 1) {
            message = localize("chat.removeLast.confirmation.message2", "This will remove your last request and undo the edits made to {0}. Do you want to proceed?", basename(entriesModifiedInRequestsToRemove[0].modifiedURI));
          } else {
            message = localize("chat.removeLast.confirmation.multipleEdits.message", "This will remove your last request and undo edits made to {0} files in your working set. Do you want to proceed?", entriesModifiedInRequestsToRemove.length);
          }
        } else {
          if (entriesModifiedInRequestsToRemove.length === 1) {
            message = localize("chat.remove.confirmation.message2", "This will remove all subsequent requests and undo edits made to {0}. Do you want to proceed?", basename(entriesModifiedInRequestsToRemove[0].modifiedURI));
          } else {
            message = localize("chat.remove.confirmation.multipleEdits.message", "This will remove all subsequent requests and undo edits made to {0} files in your working set. Do you want to proceed?", entriesModifiedInRequestsToRemove.length);
          }
        }
        const confirmation = shouldPrompt ? await dialogService.confirm({
          title: editsToUndo === 1 ? localize("chat.removeLast.confirmation.title", "Do you want to undo your last edit?") : localize("chat.remove.confirmation.title", "Do you want to undo {0} edits?", editsToUndo),
          message,
          primaryButton: localize("chat.remove.confirmation.primaryButton", "Yes"),
          checkbox: { label: localize("chat.remove.confirmation.checkbox", "Don't ask again"), checked: false },
          type: "info"
        }) : { confirmed: true };
        if (!confirmation.confirmed) {
          telemetryService.publicLog2("chat.undoEditsConfirmation", {
            editRequestType: configurationService.getValue("chat.editRequests"),
            outcome: "cancelled",
            editsUndoCount: editsToUndo
          });
          return;
        } else if (editsToUndo > 0) {
          telemetryService.publicLog2("chat.undoEditsConfirmation", {
            editRequestType: configurationService.getValue("chat.editRequests"),
            outcome: "applied",
            editsUndoCount: editsToUndo
          });
        }
        if (confirmation.checkboxChecked) {
          await configurationService.updateValue("chat.editing.confirmEditRequestRemoval", false);
        }
        const snapshotRequestId = chatRequests[itemIndex].id;
        await session.restoreSnapshot(snapshotRequestId, void 0);
      }
    } else if (widget?.viewModel?.model.checkpoint) {
      widget.viewModel.model.setCheckpoint(void 0);
    }
    widget?.acceptInput(context?.inputValue);
  }
  async handleDelegation(accessor, widget, delegationTarget) {
    const chatSessionsService = accessor.get(IChatSessionsService);
    const contributions = chatSessionsService.getAllChatSessionContributions();
    const targetContribution = contributions.find((contrib) => {
      const providerType = getAgentSessionProvider(contrib.type);
      return providerType === delegationTarget;
    });
    if (!targetContribution) {
      throw new Error(`No contribution found for delegation target: ${delegationTarget}`);
    }
    if (targetContribution.canDelegate === false) {
      throw new Error(`The contribution for delegation target: ${delegationTarget} does not support delegation.`);
    }
    return new CreateRemoteAgentJobAction().run(accessor, targetContribution, widget);
  }
}
const requestInProgressOrPendingToolCall = ContextKeyExpr.or(ChatContextKeys.requestInProgress, ChatContextKeys.Editing.hasToolConfirmation, ChatContextKeys.Editing.hasQuestionCarousel);
const requestInProgressWithoutInput = ContextKeyExpr.and(ChatContextKeys.requestInProgress, ChatContextKeys.inputHasText.negate());
const pendingToolCall = ContextKeyExpr.or(ChatContextKeys.Editing.hasToolConfirmation, ContextKeyExpr.and(ChatContextKeys.Editing.hasQuestionCarousel, ChatContextKeys.inputHasText.negate()));
const noQuestionCarouselOrHasInput = ContextKeyExpr.or(ChatContextKeys.Editing.hasQuestionCarousel.negate(), ChatContextKeys.inputHasText);
const whenNotInProgress = ChatContextKeys.requestInProgress.negate();
class ChatSubmitAction extends SubmitAction {
  static {
    __name(this, "ChatSubmitAction");
  }
  static {
    this.ID = "workbench.action.chat.submit";
  }
  constructor() {
    const menuCondition = ChatContextKeys.chatModeKind.isEqualTo(ChatModeKind.Ask);
    const precondition = ContextKeyExpr.and(ChatContextKeys.inputHasText, whenNotInProgress, ChatContextKeys.chatSessionOptionsValid);
    super({
      id: ChatSubmitAction.ID,
      title: localize2("interactive.submit.label", "Send"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.arrowUp,
      precondition,
      toggled: {
        condition: ChatContextKeys.lockedToCodingAgent,
        icon: Codicon.arrowUp,
        tooltip: localize("sendToAgent", "Send to Agent")
      },
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, ChatContextKeys.withinEditSessionDiff.negate()),
        primary: 3,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      menu: [
        {
          id: MenuId.ChatExecute,
          order: 4,
          when: ContextKeyExpr.and(whenNotInProgress, menuCondition, ChatContextKeys.withinEditSessionDiff.negate(), noQuestionCarouselOrHasInput),
          group: "navigation",
          alt: {
            id: "workbench.action.chat.sendToNewChat",
            title: localize2("chat.newChat.label", "Send to New Chat"),
            icon: Codicon.plus
          }
        },
        {
          id: MenuId.ChatEditorInlineExecute,
          group: "navigation",
          order: 4,
          when: ContextKeyExpr.and(ContextKeyExpr.or(ctxHasEditorModification.negate(), ChatContextKeys.inputHasText), whenNotInProgress, ChatContextKeys.requestInProgress.negate(), menuCondition)
        }
      ]
    });
  }
}
const ToggleAgentModeActionId = "workbench.action.chat.toggleAgentMode";
class ToggleChatModeAction extends Action2 {
  static {
    __name(this, "ToggleChatModeAction");
  }
  static {
    this.ID = ToggleAgentModeActionId;
  }
  constructor() {
    super({
      id: ToggleChatModeAction.ID,
      title: localize2("interactive.toggleAgent.label", "Switch to Next Agent"),
      f1: true,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.requestInProgress.negate())
    });
  }
  async run(accessor, ...args) {
    const commandService = accessor.get(ICommandService);
    const instaService = accessor.get(IInstantiationService);
    const modeService = accessor.get(IChatModeService);
    const telemetryService = accessor.get(ITelemetryService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const arg = args.at(0);
    let widget;
    if (arg?.sessionResource) {
      widget = chatWidgetService.getWidgetBySessionResource(arg.sessionResource);
    } else {
      widget = getEditingSessionContext(accessor, args)?.chatWidget;
    }
    if (!widget) {
      return;
    }
    const chatSession = widget.viewModel?.model;
    const requestCount = chatSession?.getRequests().length ?? 0;
    const switchToMode = (arg && (modeService.findModeById(arg.modeId) || modeService.findModeByName(arg.modeId))) ?? this.getNextMode(widget, requestCount, modeService);
    const currentMode = widget.input.currentModeObs.get();
    if (switchToMode.id === currentMode.id) {
      return;
    }
    const chatModeCheck = await instaService.invokeFunction(handleModeSwitch, widget.input.currentModeKind, switchToMode.kind, requestCount, widget.viewModel?.model);
    if (!chatModeCheck) {
      return;
    }
    const storage = switchToMode.source?.storage ?? "builtin";
    const extensionId = switchToMode.source?.storage === "extension" ? switchToMode.source.extensionId.value : void 0;
    const toolsCount = switchToMode.customTools?.get()?.length ?? 0;
    const handoffsCount = switchToMode.handOffs?.get()?.length ?? 0;
    const modeUri = switchToMode.uri?.get();
    const isClaudeAgent = modeUri ? isInClaudeAgentsFolder(modeUri) : void 0;
    telemetryService.publicLog2("chat.modeChange", {
      fromMode: getModeNameForTelemetry(currentMode),
      mode: getModeNameForTelemetry(switchToMode),
      requestCount,
      storage,
      extensionId,
      toolsCount,
      handoffsCount,
      isClaudeAgent
    });
    widget.input.setChatMode(switchToMode.id);
    if (chatModeCheck.needToClearSession) {
      await commandService.executeCommand(ACTION_ID_NEW_CHAT);
    }
  }
  getNextMode(chatWidget, requestCount, modeService) {
    const modes = modeService.getModes();
    const flat = [
      ...modes.builtin.filter((mode) => {
        return mode.kind !== ChatModeKind.Edit || requestCount === 0;
      }),
      ...modes.custom ?? []
    ];
    const curModeIndex = flat.findIndex((mode) => mode.id === chatWidget.input.currentModeObs.get().id);
    const newMode = flat[(curModeIndex + 1) % flat.length];
    return newMode;
  }
}
class SwitchToNextModelAction extends Action2 {
  static {
    __name(this, "SwitchToNextModelAction");
  }
  static {
    this.ID = "workbench.action.chat.switchToNextModel";
  }
  constructor() {
    super({
      id: SwitchToNextModelAction.ID,
      title: localize2("interactive.switchToNextModel.label", "Switch to Next Model"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  run(accessor, ...args) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    widget?.input.switchToNextModel();
  }
}
class OpenModelPickerAction extends Action2 {
  static {
    __name(this, "OpenModelPickerAction");
  }
  static {
    this.ID = "workbench.action.chat.openModelPicker";
  }
  constructor() {
    super({
      id: OpenModelPickerAction.ID,
      title: localize2("interactive.openModelPicker.label", "Open Model Picker"),
      category: CHAT_CATEGORY,
      f1: false,
      keybinding: {
        primary: 2048 | 512 | 89,
        weight: 200,
        when: ChatContextKeys.inChatInput
      },
      precondition: ChatContextKeys.enabled,
      menu: {
        id: MenuId.ChatInput,
        order: 3,
        group: "navigation",
        when: ContextKeyExpr.and(
          ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeys.chatSessionHasTargetedModels),
          ContextKeyExpr.or(ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.Chat), ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.EditorInline), ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.Notebook), ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.Terminal)),
          // Hide in welcome view when session type is not local
          ContextKeyExpr.or(ChatContextKeys.inAgentSessionsWelcome.negate(), ChatContextKeys.chatSessionHasTargetedModels, ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.Local))
        )
      }
    });
  }
  async run(accessor, ...args) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      await widgetService.reveal(widget);
      widget.input.openModelPicker();
    }
  }
}
class OpenPermissionPickerAction extends Action2 {
  static {
    __name(this, "OpenPermissionPickerAction");
  }
  static {
    this.ID = "workbench.action.chat.openPermissionPicker";
  }
  constructor() {
    super({
      id: OpenPermissionPickerAction.ID,
      title: localize2("interactive.openPermissionPicker.label", "Open Permission Picker"),
      tooltip: localize("setPermissionLevel", "Set Permissions"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: {
        id: MenuId.ChatInputSecondary,
        order: 10,
        group: "navigation",
        when: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Chat), ChatContextKeys.chatModeKind.notEqualsTo(ChatModeKind.Ask), ChatContextKeys.inQuickChat.negate(), ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeys.lockedCodingAgentId.isEqualTo(AgentSessionProviders.Background)))
      }
    });
  }
  async run(accessor) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openPermissionPicker();
    }
  }
}
class OpenModePickerAction extends Action2 {
  static {
    __name(this, "OpenModePickerAction");
  }
  static {
    this.ID = "workbench.action.chat.openModePicker";
  }
  constructor() {
    super({
      id: OpenModePickerAction.ID,
      title: localize2("interactive.openModePicker.label", "Open Agent Picker"),
      tooltip: localize("setChatMode", "Set Agent"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ChatContextKeys.enabled,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Chat)),
        primary: 2048 | 89,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      menu: [
        {
          id: MenuId.ChatInput,
          order: 1,
          when: ContextKeyExpr.and(
            ChatContextKeys.enabled,
            ChatContextKeys.location.isEqualTo(ChatAgentLocation.Chat),
            ChatContextKeys.inQuickChat.negate(),
            ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeys.chatSessionHasCustomAgentTarget),
            // Show in welcome view for local sessions or sessions with custom agent target
            ContextKeyExpr.or(ChatContextKeys.inAgentSessionsWelcome.negate(), ChatContextKeys.chatSessionHasCustomAgentTarget, ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.Local))
          ),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openModePicker();
    }
  }
}
class OpenSessionTargetPickerAction extends Action2 {
  static {
    __name(this, "OpenSessionTargetPickerAction");
  }
  static {
    this.ID = "workbench.action.chat.openSessionTargetPicker";
  }
  constructor() {
    super({
      id: OpenSessionTargetPickerAction.ID,
      title: localize2("interactive.openSessionTargetPicker.label", "Open Session Target Picker"),
      tooltip: localize("setSessionTarget", "Set Session Target"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.or(ChatContextKeys.chatSessionIsEmpty, ChatContextKeys.inAgentSessionsWelcome), ChatContextKeys.currentlyEditingInput.negate(), ChatContextKeys.currentlyEditing.negate()),
      menu: [
        {
          id: MenuId.ChatInput,
          order: 0,
          when: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Chat), ChatContextKeys.inQuickChat.negate(), ChatContextKeys.chatSessionIsEmpty, IsSessionsWindowContext),
          group: "navigation"
        },
        {
          id: MenuId.ChatInputSecondary,
          order: 0,
          when: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Chat), ChatContextKeys.inQuickChat.negate(), IsSessionsWindowContext.negate(), ChatContextKeys.chatSessionIsEmpty),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openSessionTargetPicker();
    }
  }
}
class OpenDelegationPickerAction extends Action2 {
  static {
    __name(this, "OpenDelegationPickerAction");
  }
  static {
    this.ID = "workbench.action.chat.openDelegationPicker";
  }
  constructor() {
    super({
      id: OpenDelegationPickerAction.ID,
      title: localize2("interactive.openDelegationPicker.label", "Open Delegation Picker"),
      tooltip: localize("delegateSession", "Delegate Session"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.chatSessionIsEmpty.negate(), ChatContextKeys.currentlyEditingInput.negate(), ChatContextKeys.currentlyEditing.negate()),
      menu: [
        {
          id: MenuId.ChatInputSecondary,
          order: 0.5,
          when: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Chat), ChatContextKeys.inQuickChat.negate(), ChatContextKeys.chatSessionIsEmpty.negate()),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openDelegationPicker();
    }
  }
}
class OpenWorkspacePickerAction extends Action2 {
  static {
    __name(this, "OpenWorkspacePickerAction");
  }
  static {
    this.ID = "workbench.action.chat.openWorkspacePicker";
  }
  constructor() {
    super({
      id: OpenWorkspacePickerAction.ID,
      title: localize2("interactive.openWorkspacePicker.label", "Open Workspace Picker"),
      tooltip: localize("selectWorkspace", "Select Target Workspace"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.inAgentSessionsWelcome),
      menu: [
        {
          id: MenuId.ChatInput,
          order: 0.6,
          when: ContextKeyExpr.and(ChatContextKeys.inAgentSessionsWelcome, ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType), IsSessionsWindowContext),
          group: "navigation"
        },
        {
          id: MenuId.ChatInputSecondary,
          order: 0.6,
          when: ContextKeyExpr.and(ChatContextKeys.inAgentSessionsWelcome, ChatContextKeys.chatSessionType.isEqualTo(localChatSessionType), IsSessionsWindowContext.negate()),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args) {
  }
}
class ChatSessionPrimaryPickerAction extends Action2 {
  static {
    __name(this, "ChatSessionPrimaryPickerAction");
  }
  static {
    this.ID = "workbench.action.chat.chatSessionPrimaryPicker";
  }
  constructor() {
    super({
      id: ChatSessionPrimaryPickerAction.ID,
      title: localize2("interactive.openChatSessionPrimaryPicker.label", "Open Primary Session Picker"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ChatContextKeys.enabled,
      menu: {
        id: MenuId.ChatInput,
        order: 4,
        group: "navigation",
        when: ContextKeyExpr.and(ChatContextKeys.chatSessionHasModels, ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent, ContextKeyExpr.and(ChatContextKeys.inAgentSessionsWelcome, ChatContextKeys.chatSessionType.notEqualsTo("local"))))
      }
    });
  }
  async run(accessor, ...args) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (widget) {
      widget.input.openChatSessionPicker();
    }
  }
}
const ChangeChatModelActionId = "workbench.action.chat.changeModel";
class ChangeChatModelAction extends Action2 {
  static {
    __name(this, "ChangeChatModelAction");
  }
  static {
    this.ID = ChangeChatModelActionId;
  }
  constructor() {
    super({
      id: ChangeChatModelAction.ID,
      title: localize2("interactive.changeModel.label", "Change Model"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ChatContextKeys.enabled
    });
  }
  run(accessor, ...args) {
    const modelInfo = args[0];
    assertType(typeof modelInfo.vendor === "string" && typeof modelInfo.id === "string" && typeof modelInfo.family === "string");
    const widgetService = accessor.get(IChatWidgetService);
    const widgets = widgetService.getAllWidgets();
    for (const widget of widgets) {
      widget.input.switchModel(modelInfo);
    }
  }
}
class ChatEditingSessionSubmitAction extends SubmitAction {
  static {
    __name(this, "ChatEditingSessionSubmitAction");
  }
  static {
    this.ID = "workbench.action.edits.submit";
  }
  constructor() {
    const notInProgressOrEditing = ContextKeyExpr.and(ContextKeyExpr.or(whenNotInProgress, ChatContextKeys.editingRequestType.isEqualTo(
      "s"
      /* ChatContextKeys.EditingRequestType.Sent */
    )), ChatContextKeys.editingRequestType.notEqualsTo(
      "q"
      /* ChatContextKeys.EditingRequestType.Queue */
    ), ChatContextKeys.editingRequestType.notEqualsTo(
      "st"
      /* ChatContextKeys.EditingRequestType.Steer */
    ));
    const menuCondition = ChatContextKeys.chatModeKind.notEqualsTo(ChatModeKind.Ask);
    const precondition = ContextKeyExpr.and(ChatContextKeys.inputHasText, notInProgressOrEditing, ChatContextKeys.chatSessionOptionsValid);
    super({
      id: ChatEditingSessionSubmitAction.ID,
      title: localize2("edits.submit.label", "Send"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.arrowUp,
      precondition,
      menu: [
        {
          id: MenuId.ChatExecute,
          order: 4,
          when: ContextKeyExpr.and(notInProgressOrEditing, menuCondition, noQuestionCarouselOrHasInput),
          group: "navigation",
          alt: {
            id: "workbench.action.chat.sendToNewChat",
            title: localize2("chat.newChat.label", "Send to New Chat"),
            icon: Codicon.plus
          }
        }
      ]
    });
  }
}
class SubmitWithoutDispatchingAction extends Action2 {
  static {
    __name(this, "SubmitWithoutDispatchingAction");
  }
  static {
    this.ID = "workbench.action.chat.submitWithoutDispatching";
  }
  constructor() {
    const precondition = ContextKeyExpr.and(ChatContextKeys.inputHasText, whenNotInProgress, ChatContextKeys.chatModeKind.isEqualTo(ChatModeKind.Ask));
    super({
      id: SubmitWithoutDispatchingAction.ID,
      title: localize2("interactive.submitWithoutDispatch.label", "Send"),
      f1: false,
      category: CHAT_CATEGORY,
      precondition,
      keybinding: {
        when: ChatContextKeys.inChatInput,
        primary: 512 | 1024 | 3,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
  run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    widget?.acceptInput(context?.inputValue, { noCommandDetection: true });
  }
}
class ChatSubmitWithCodebaseAction extends Action2 {
  static {
    __name(this, "ChatSubmitWithCodebaseAction");
  }
  static {
    this.ID = "workbench.action.chat.submitWithCodebase";
  }
  constructor() {
    const precondition = ContextKeyExpr.and(ChatContextKeys.inputHasText, whenNotInProgress);
    super({
      id: ChatSubmitWithCodebaseAction.ID,
      title: localize2("actions.chat.submitWithCodebase", "Send with {0}", `${chatVariableLeader}codebase`),
      precondition,
      keybinding: {
        when: ChatContextKeys.inChatInput,
        primary: 2048 | 3,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
  run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const languageModelToolsService = accessor.get(ILanguageModelToolsService);
    const codebaseTool = languageModelToolsService.getToolByName("codebase");
    if (!codebaseTool) {
      return;
    }
    widget.input.attachmentModel.addContext({
      id: codebaseTool.id,
      name: codebaseTool.displayName ?? "",
      fullName: codebaseTool.displayName ?? "",
      value: void 0,
      icon: ThemeIcon.isThemeIcon(codebaseTool.icon) ? codebaseTool.icon : void 0,
      kind: "tool"
    });
    widget.acceptInput();
  }
}
class SendToNewChatAction extends Action2 {
  static {
    __name(this, "SendToNewChatAction");
  }
  constructor() {
    const precondition = ChatContextKeys.inputHasText;
    super({
      id: "workbench.action.chat.sendToNewChat",
      title: localize2("chat.newChat.label", "Send to New Chat"),
      precondition,
      category: CHAT_CATEGORY,
      f1: false,
      keybinding: {
        weight: 200,
        primary: 2048 | 1024 | 3,
        when: ChatContextKeys.inChatInput
      }
    });
  }
  async run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const viewsService = accessor.get(IViewsService);
    const dialogService = accessor.get(IDialogService);
    const chatService = accessor.get(IChatService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const inputBeforeClear = widget.getInput();
    if (widget.viewModel) {
      await chatService.cancelCurrentRequestForSession(widget.viewModel.sessionResource, "newSessionAction");
    }
    if (widget.viewModel?.model) {
      if (!await handleCurrentEditingSession(widget.viewModel.model, void 0, dialogService)) {
        return;
      }
    }
    widget.setInput("");
    await clearChatSessionPreservingType(widget, viewsService);
    widget.acceptInput(inputBeforeClear, { storeToHistory: true });
  }
}
const CancelChatActionId = "workbench.action.chat.cancel";
class CancelAction extends Action2 {
  static {
    __name(this, "CancelAction");
  }
  static {
    this.ID = CancelChatActionId;
  }
  constructor() {
    super({
      id: CancelAction.ID,
      title: localize2("interactive.cancel.label", "Cancel"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.stopCircle,
      menu: [
        {
          id: MenuId.ChatExecute,
          when: ContextKeyExpr.and(ContextKeyExpr.or(requestInProgressWithoutInput, pendingToolCall), ChatContextKeys.remoteJobCreating.negate(), ChatContextKeys.currentlyEditing.negate()),
          order: 4,
          group: "navigation"
        },
        {
          id: MenuId.ChatEditorInlineExecute,
          when: ContextKeyExpr.and(ctxIsGlobalEditingSession.negate(), ctxHasRequestInProgress, CTX_HOVER_MODE.negate()),
          order: 4,
          group: "navigation"
        }
      ],
      keybinding: {
        weight: 200,
        primary: 2048 | 9,
        when: ContextKeyExpr.and(requestInProgressOrPendingToolCall, ChatContextKeys.remoteJobCreating.negate()),
        win: {
          primary: 512 | 1
          /* KeyCode.Backspace */
        }
      }
    });
  }
  async run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const logService = accessor.get(ILogService);
    const telemetryService = accessor.get(ITelemetryService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      telemetryService.publicLog2(ChatStopCancellationNoopEventName, {
        source: "cancelAction",
        reason: "noWidget",
        requestInProgress: "unknown",
        pendingRequests: 0
      });
      logService.info("ChatCancelAction#run: No focused chat widget was found");
      return;
    }
    const chatService = accessor.get(IChatService);
    if (widget.viewModel) {
      await chatService.cancelCurrentRequestForSession(widget.viewModel.sessionResource, "cancelAction");
    } else {
      telemetryService.publicLog2(ChatStopCancellationNoopEventName, {
        source: "cancelAction",
        reason: "noViewModel",
        requestInProgress: "unknown",
        pendingRequests: 0
      });
      logService.info("ChatCancelAction#run: Canceled chat widget has no view model");
    }
  }
}
const CancelChatEditId = "workbench.edit.chat.cancel";
class CancelEdit extends Action2 {
  static {
    __name(this, "CancelEdit");
  }
  static {
    this.ID = CancelChatEditId;
  }
  constructor() {
    super({
      id: CancelEdit.ID,
      title: localize2("interactive.cancelEdit.label", "Cancel Edit"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.x,
      menu: [
        {
          id: MenuId.ChatMessageTitle,
          group: "navigation",
          order: 1,
          when: ContextKeyExpr.and(ChatContextKeys.isRequest, ChatContextKeys.currentlyEditing, ContextKeyExpr.equals(`config.${ChatConfiguration.EditRequests}`, "input"))
        }
      ],
      keybinding: {
        primary: 9,
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, EditorContextKeys.hoverVisible.toNegated(), EditorContextKeys.hasNonEmptySelection.toNegated(), EditorContextKeys.hasMultipleSelections.toNegated(), ContextKeyExpr.or(ChatContextKeys.currentlyEditing, ChatContextKeys.currentlyEditingInput)),
        weight: 100 - 5
      }
    });
  }
  run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    widget.finishedEditing();
  }
}
function registerChatExecuteActions() {
  registerAction2(ChatSubmitAction);
  registerAction2(ChatEditingSessionSubmitAction);
  registerAction2(SubmitWithoutDispatchingAction);
  registerAction2(CancelAction);
  registerAction2(SendToNewChatAction);
  registerAction2(ChatSubmitWithCodebaseAction);
  registerAction2(ToggleChatModeAction);
  registerAction2(SwitchToNextModelAction);
  registerAction2(OpenModelPickerAction);
  registerAction2(OpenPermissionPickerAction);
  registerAction2(OpenModePickerAction);
  registerAction2(OpenSessionTargetPickerAction);
  registerAction2(OpenDelegationPickerAction);
  registerAction2(OpenWorkspacePickerAction);
  registerAction2(ChatSessionPrimaryPickerAction);
  registerAction2(ChangeChatModelAction);
  registerAction2(CancelEdit);
}
__name(registerChatExecuteActions, "registerChatExecuteActions");
export {
  CancelAction,
  CancelChatActionId,
  CancelChatEditId,
  CancelEdit,
  ChangeChatModelActionId,
  ChatEditingSessionSubmitAction,
  ChatSessionPrimaryPickerAction,
  ChatSubmitAction,
  ChatSubmitWithCodebaseAction,
  OpenDelegationPickerAction,
  OpenModePickerAction,
  OpenModelPickerAction,
  OpenPermissionPickerAction,
  OpenSessionTargetPickerAction,
  OpenWorkspacePickerAction,
  ToggleAgentModeActionId,
  registerChatExecuteActions
};
//# sourceMappingURL=chatExecuteActions.js.map
