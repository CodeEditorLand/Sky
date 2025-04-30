var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { assertType } from "../../../../../base/common/types.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { chatVariableLeader } from "../../common/chatParserTypes.js";
import { IChatService } from "../../common/chatService.js";
import { ChatAgentLocation, ChatConfiguration, ChatMode, validateChatMode } from "../../common/constants.js";
import { ILanguageModelToolsService } from "../../common/languageModelToolsService.js";
import { IChatWidgetService, showChatView } from "../chat.js";
import { getEditingSessionContext } from "../chatEditing/chatEditingActions.js";
import { CHAT_CATEGORY, handleCurrentEditingSession } from "./chatActions.js";
import { ACTION_ID_NEW_CHAT } from "./chatClearActions.js";
class SubmitAction extends Action2 {
  static {
    __name(this, "SubmitAction");
  }
  run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    widget?.acceptInput(context?.inputValue);
  }
}
const whenNotInProgressOrPaused = ContextKeyExpr.or(ChatContextKeys.isRequestPaused, ChatContextKeys.requestInProgress.negate());
class ChatSubmitAction extends SubmitAction {
  static {
    __name(this, "ChatSubmitAction");
  }
  static {
    this.ID = "workbench.action.chat.submit";
  }
  constructor() {
    const precondition = ChatContextKeys.chatMode.isEqualTo(ChatMode.Ask);
    super({
      id: ChatSubmitAction.ID,
      title: localize2("interactive.submit.label", "Send and Dispatch"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.send,
      precondition,
      keybinding: {
        when: ChatContextKeys.inChatInput,
        primary: 3,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      menu: [
        {
          id: MenuId.ChatExecuteSecondary,
          group: "group_1",
          order: 1,
          when: precondition
        },
        {
          id: MenuId.ChatExecute,
          order: 4,
          when: ContextKeyExpr.and(whenNotInProgressOrPaused, precondition),
          group: "navigation"
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
      title: localize2("interactive.toggleAgent.label", "Set Chat Mode"),
      f1: true,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.requestInProgress.negate()),
      tooltip: localize("setChatMode", "Set Mode"),
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatInput, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Panel)),
        primary: 2048 | 89,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      menu: [
        {
          id: MenuId.ChatExecute,
          order: 1,
          when: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Panel), ChatContextKeys.inQuickChat.negate()),
          group: "navigation"
        }
      ]
    });
  }
  async run(accessor, ...args) {
    const commandService = accessor.get(ICommandService);
    const configurationService = accessor.get(IConfigurationService);
    const dialogService = accessor.get(IDialogService);
    const context = getEditingSessionContext(accessor, args);
    if (!context?.chatWidget) {
      return;
    }
    const arg = args.at(0);
    const chatSession = context.chatWidget.viewModel?.model;
    const requestCount = chatSession?.getRequests().length ?? 0;
    const switchToMode = validateChatMode(arg?.mode) ?? this.getNextMode(context.chatWidget, requestCount, configurationService);
    const needToClearEdits = !configurationService.getValue(ChatConfiguration.Edits2Enabled) && (context.chatWidget.input.currentMode === ChatMode.Edit || switchToMode === ChatMode.Edit) && requestCount > 0;
    if (switchToMode === context.chatWidget.input.currentMode) {
      return;
    }
    if (needToClearEdits) {
      const phrase = localize("switchMode.confirmPhrase", "Switching chat modes will end your current edit session.");
      if (!context.editingSession) {
        return;
      }
      const currentEdits = context.editingSession.entries.get();
      const undecidedEdits = currentEdits.filter(
        (edit) => edit.state.get() === 0
        /* ModifiedFileEntryState.Modified */
      );
      if (undecidedEdits.length > 0) {
        if (!await handleCurrentEditingSession(context.editingSession, phrase, dialogService)) {
          return;
        }
      } else {
        const confirmation = await dialogService.confirm({
          title: localize("agent.newSession", "Start new session?"),
          message: localize("agent.newSessionMessage", "Changing the chat mode will end your current edit session. Would you like to change the chat mode?"),
          primaryButton: localize("agent.newSession.confirm", "Yes"),
          type: "info"
        });
        if (!confirmation.confirmed) {
          return;
        }
      }
    }
    context.chatWidget.input.setChatMode(switchToMode);
    if (needToClearEdits) {
      await commandService.executeCommand(ACTION_ID_NEW_CHAT);
    }
  }
  getNextMode(chatWidget, requestCount, configurationService) {
    const modes = [ChatMode.Ask];
    if (configurationService.getValue(ChatConfiguration.Edits2Enabled) || requestCount === 0) {
      modes.push(ChatMode.Edit);
    }
    modes.push(ChatMode.Agent);
    const modeIndex = modes.indexOf(chatWidget.input.currentMode);
    const newMode = modes[(modeIndex + 1) % modes.length];
    return newMode;
  }
}
const ToggleRequestPausedActionId = "workbench.action.chat.toggleRequestPaused";
class ToggleRequestPausedAction extends Action2 {
  static {
    __name(this, "ToggleRequestPausedAction");
  }
  static {
    this.ID = ToggleRequestPausedActionId;
  }
  constructor() {
    super({
      id: ToggleRequestPausedAction.ID,
      title: localize2("interactive.toggleRequestPausd.label", "Toggle Request Paused"),
      category: CHAT_CATEGORY,
      icon: Codicon.debugPause,
      toggled: {
        condition: ChatContextKeys.isRequestPaused,
        icon: Codicon.play,
        tooltip: localize("requestIsPaused", "Resume Request")
      },
      tooltip: localize("requestNotPaused", "Pause Request"),
      menu: [
        {
          id: MenuId.ChatExecute,
          order: 3.5,
          when: ContextKeyExpr.and(ChatContextKeys.canRequestBePaused, ChatContextKeys.chatMode.isEqualTo(ChatMode.Agent), ChatContextKeys.location.isEqualTo(ChatAgentLocation.Panel), ContextKeyExpr.or(ChatContextKeys.isRequestPaused.negate(), ChatContextKeys.inputHasText.negate())),
          group: "navigation"
        }
      ]
    });
  }
  run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    widget?.togglePaused();
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
const ChatOpenModelPickerActionId = "workbench.action.chat.openModelPicker";
class OpenModelPickerAction extends Action2 {
  static {
    __name(this, "OpenModelPickerAction");
  }
  static {
    this.ID = ChatOpenModelPickerActionId;
  }
  constructor() {
    super({
      id: OpenModelPickerAction.ID,
      title: localize2("interactive.openModelPicker.label", "Open Model Picker"),
      category: CHAT_CATEGORY,
      f1: true,
      keybinding: {
        primary: 2048 | 512 | 89,
        weight: 200,
        when: ChatContextKeys.inChatInput
      },
      precondition: ChatContextKeys.enabled,
      menu: {
        id: MenuId.ChatExecute,
        order: 3,
        group: "navigation",
        when: ContextKeyExpr.and(ChatContextKeys.languageModelsAreUserSelectable, ContextKeyExpr.or(ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.Panel), ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.Editor), ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.Notebook), ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.Terminal)))
      }
    });
  }
  async run(accessor, ...args) {
    const widgetService = accessor.get(IChatWidgetService);
    let widget = widgetService.lastFocusedWidget;
    if (widget?.location !== ChatAgentLocation.Notebook && widget?.location !== ChatAgentLocation.Terminal) {
      widget = await showChatView(accessor.get(IViewsService));
    }
    if (widget) {
      widget.input.openModelPicker();
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
    const precondition = ChatContextKeys.chatMode.notEqualsTo(ChatMode.Ask);
    super({
      id: ChatEditingSessionSubmitAction.ID,
      title: localize2("edits.submit.label", "Send"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.send,
      precondition,
      keybinding: {
        when: ChatContextKeys.inChatInput,
        primary: 3,
        weight: 100
        /* KeybindingWeight.EditorContrib */
      },
      menu: [
        {
          id: MenuId.ChatExecuteSecondary,
          group: "group_1",
          when: ContextKeyExpr.and(whenNotInProgressOrPaused, precondition),
          order: 1
        },
        {
          id: MenuId.ChatExecute,
          order: 4,
          when: ContextKeyExpr.and(ContextKeyExpr.or(ContextKeyExpr.and(ChatContextKeys.isRequestPaused, ChatContextKeys.inputHasText), ChatContextKeys.requestInProgress.negate()), precondition),
          group: "navigation"
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
    const precondition = ContextKeyExpr.and(
      // if the input has prompt instructions attached, allow submitting requests even
      // without text present - having instructions is enough context for a request
      ContextKeyExpr.or(ChatContextKeys.inputHasText, ChatContextKeys.hasPromptFile),
      whenNotInProgressOrPaused,
      ChatContextKeys.chatMode.isEqualTo(ChatMode.Ask)
    );
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
      },
      menu: [
        {
          id: MenuId.ChatExecuteSecondary,
          group: "group_1",
          order: 2,
          when: ChatContextKeys.chatMode.isEqualTo(ChatMode.Ask)
        }
      ]
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
    const precondition = ContextKeyExpr.and(
      // if the input has prompt instructions attached, allow submitting requests even
      // without text present - having instructions is enough context for a request
      ContextKeyExpr.or(ChatContextKeys.inputHasText, ChatContextKeys.hasPromptFile),
      whenNotInProgressOrPaused
    );
    super({
      id: ChatSubmitWithCodebaseAction.ID,
      title: localize2("actions.chat.submitWithCodebase", "Send with {0}", `${chatVariableLeader}codebase`),
      precondition,
      menu: {
        id: MenuId.ChatExecuteSecondary,
        group: "group_1",
        order: 3,
        when: ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.Panel)
      },
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
    const precondition = ContextKeyExpr.and(
      // if the input has prompt instructions attached, allow submitting requests even
      // without text present - having instructions is enough context for a request
      ContextKeyExpr.or(ChatContextKeys.inputHasText, ChatContextKeys.hasPromptFile),
      whenNotInProgressOrPaused
    );
    super({
      id: "workbench.action.chat.sendToNewChat",
      title: localize2("chat.newChat.label", "Send to New Chat"),
      precondition,
      category: CHAT_CATEGORY,
      f1: false,
      menu: {
        id: MenuId.ChatExecuteSecondary,
        group: "group_2",
        when: ContextKeyExpr.equals(ChatContextKeys.location.key, ChatAgentLocation.Panel)
      },
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
    const dialogService = accessor.get(IDialogService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const editingSession = widget.viewModel?.model.editingSession;
    if (editingSession) {
      if (!await handleCurrentEditingSession(editingSession, void 0, dialogService)) {
        return;
      }
    }
    widget.clear();
    await widget.waitForReady();
    widget.acceptInput(context?.inputValue);
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
      menu: {
        id: MenuId.ChatExecute,
        when: ContextKeyExpr.and(ChatContextKeys.isRequestPaused.negate(), ChatContextKeys.requestInProgress),
        order: 4,
        group: "navigation"
      },
      keybinding: {
        weight: 200,
        primary: 2048 | 9,
        win: {
          primary: 512 | 1
          /* KeyCode.Backspace */
        }
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
    const chatService = accessor.get(IChatService);
    if (widget.viewModel) {
      chatService.cancelCurrentRequestForSession(widget.viewModel.sessionId);
    }
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
  registerAction2(ToggleRequestPausedAction);
  registerAction2(SwitchToNextModelAction);
  registerAction2(OpenModelPickerAction);
  registerAction2(ChangeChatModelAction);
}
__name(registerChatExecuteActions, "registerChatExecuteActions");
export {
  CancelAction,
  CancelChatActionId,
  ChangeChatModelActionId,
  ChatEditingSessionSubmitAction,
  ChatOpenModelPickerActionId,
  ChatSubmitAction,
  ChatSubmitWithCodebaseAction,
  ToggleAgentModeActionId,
  ToggleRequestPausedAction,
  ToggleRequestPausedActionId,
  registerChatExecuteActions
};
//# sourceMappingURL=chatExecuteActions.js.map
