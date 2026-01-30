var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { URI } from "../../../../../base/common/uri.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { localize, localize2 } from "../../../../../nls.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { ActiveEditorContext } from "../../../../common/contextkeys.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { localChatSessionType } from "../../common/chatSessionsService.js";
import { ChatAgentLocation, ChatModeKind } from "../../common/constants.js";
import { getChatSessionType, LocalChatSessionUri } from "../../common/model/chatUri.js";
import { ChatViewId, IChatWidgetService, isIChatViewViewContext } from "../chat.js";
import { EditingSessionAction, getEditingSessionContext } from "../chatEditing/chatEditingActions.js";
import { ChatEditorInput } from "../widgetHosts/editor/chatEditorInput.js";
import { ACTION_ID_NEW_CHAT, ACTION_ID_NEW_EDIT_SESSION, CHAT_CATEGORY, handleCurrentEditingSession } from "./chatActions.js";
import { clearChatEditor } from "./chatClear.js";
import { AgentSessionsViewerOrientation } from "../agentSessions/agentSessions.js";
import { IAgentSessionProjectionService } from "../agentSessions/agentSessionProjectionService.js";
function registerNewChatActions() {
  MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
    submenu: MenuId.ChatNewMenu,
    title: localize2("chat.newEdits.label", "New Chat"),
    icon: Codicon.plus,
    when: ContextKeyExpr.equals("view", ChatViewId),
    group: "navigation",
    order: -1,
    isSplitButton: true
  });
  registerAction2(class NewChatEditorAction extends Action2 {
    static {
      __name(this, "NewChatEditorAction");
    }
    constructor() {
      super({
        id: "workbench.action.chatEditor.newChat",
        title: localize2("chat.newChat.label", "New Chat"),
        icon: Codicon.plus,
        f1: false,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor, ...args) {
      await clearChatEditor(accessor);
    }
  });
  registerAction2(class NewChatAction extends Action2 {
    static {
      __name(this, "NewChatAction");
    }
    constructor() {
      super({
        id: ACTION_ID_NEW_CHAT,
        title: localize2("chat.newEdits.label", "New Chat"),
        category: CHAT_CATEGORY,
        icon: Codicon.plus,
        precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.location.isEqualTo(ChatAgentLocation.Chat)),
        f1: true,
        menu: [
          {
            id: MenuId.ChatContext,
            group: "z_clear"
          },
          {
            id: MenuId.ChatNewMenu,
            group: "1_open",
            order: 1
          },
          {
            id: MenuId.CompactWindowEditorTitle,
            group: "navigation",
            when: ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID),
            order: 1
          }
        ],
        keybinding: {
          weight: 200 + 1,
          primary: 2048 | 44,
          secondary: [
            2048 | 42
            /* KeyCode.KeyL */
          ],
          mac: {
            primary: 2048 | 44,
            secondary: [
              256 | 42
              /* KeyCode.KeyL */
            ]
          },
          when: ChatContextKeys.inChatSession
        }
      });
    }
    async run(accessor, ...args) {
      const accessibilityService = accessor.get(IAccessibilityService);
      const projectionService = accessor.get(IAgentSessionProjectionService);
      if (projectionService.isActive) {
        await projectionService.exitProjection();
        return;
      }
      const viewsService = accessor.get(IViewsService);
      const executeCommandContext = args[0];
      const context = getEditingSessionContext(accessor, args);
      const { editingSession, chatWidget: widget } = context ?? {};
      if (!widget) {
        return;
      }
      const dialogService = accessor.get(IDialogService);
      const model = widget.viewModel?.model;
      if (model && !await handleCurrentEditingSession(model, void 0, dialogService)) {
        return;
      }
      await editingSession?.stop();
      const currentResource = widget.viewModel?.model.sessionResource;
      const sessionType = currentResource ? getChatSessionType(currentResource) : localChatSessionType;
      if (isIChatViewViewContext(widget.viewContext) && sessionType !== localChatSessionType) {
        const newResource = getResourceForNewChatSession(sessionType);
        const view = await viewsService.openView(ChatViewId);
        await view.loadSession(newResource);
      } else {
        await widget.clear();
      }
      widget.attachmentModel.clear(true);
      widget.input.relatedFiles?.clear();
      widget.focusInput();
      accessibilityService.alert(localize("newChat", "New chat"));
      if (!executeCommandContext) {
        return;
      }
      if (typeof executeCommandContext.agentMode === "boolean") {
        widget.input.setChatMode(executeCommandContext.agentMode ? ChatModeKind.Agent : ChatModeKind.Edit);
      }
      if (executeCommandContext.inputValue) {
        if (executeCommandContext.isPartialQuery) {
          widget.setInput(executeCommandContext.inputValue);
        } else {
          widget.acceptInput(executeCommandContext.inputValue);
        }
      }
    }
  });
  CommandsRegistry.registerCommandAlias(ACTION_ID_NEW_EDIT_SESSION, ACTION_ID_NEW_CHAT);
  MenuRegistry.appendMenuItem(MenuId.ChatViewSessionTitleNavigationToolbar, {
    command: {
      id: ACTION_ID_NEW_CHAT,
      title: localize2("chat.goBack", "Go Back"),
      icon: Codicon.arrowLeft
    },
    when: ChatContextKeys.agentSessionsViewerOrientation.notEqualsTo(AgentSessionsViewerOrientation.SideBySide),
    // when sessions show side by side, no need for a back button
    group: "navigation",
    order: 1
  });
  registerAction2(class UndoChatEditInteractionAction extends EditingSessionAction {
    static {
      __name(this, "UndoChatEditInteractionAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.undoEdit",
        title: localize2("chat.undoEdit.label", "Undo Last Edit"),
        category: CHAT_CATEGORY,
        icon: Codicon.discard,
        precondition: ContextKeyExpr.and(ChatContextKeys.chatEditingCanUndo, ChatContextKeys.enabled),
        f1: true,
        menu: [{
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", ChatViewId),
          group: "navigation",
          order: -3,
          isHiddenByDefault: true
        }]
      });
    }
    async runEditingSessionAction(accessor, editingSession) {
      await editingSession.undoInteraction();
    }
  });
  registerAction2(class RedoChatEditInteractionAction extends EditingSessionAction {
    static {
      __name(this, "RedoChatEditInteractionAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.redoEdit",
        title: localize2("chat.redoEdit.label", "Redo Last Edit"),
        category: CHAT_CATEGORY,
        icon: Codicon.redo,
        precondition: ContextKeyExpr.and(ChatContextKeys.chatEditingCanRedo, ChatContextKeys.enabled),
        f1: true,
        menu: [
          {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", ChatViewId),
            group: "navigation",
            order: -2,
            isHiddenByDefault: true
          }
        ]
      });
    }
    async runEditingSessionAction(accessor, editingSession) {
      const chatService = accessor.get(IChatService);
      await editingSession.redoInteraction();
      chatService.getSession(editingSession.chatSessionResource)?.setCheckpoint(void 0);
    }
  });
  registerAction2(class RedoChatCheckpoints extends EditingSessionAction {
    static {
      __name(this, "RedoChatCheckpoints");
    }
    constructor() {
      super({
        id: "workbench.action.chat.redoEdit2",
        title: localize2("chat.redoEdit.label2", "Redo"),
        tooltip: localize2("chat.redoEdit.tooltip", "Reapply discarded workspace changes and chat"),
        category: CHAT_CATEGORY,
        precondition: ContextKeyExpr.and(ChatContextKeys.chatEditingCanRedo, ChatContextKeys.enabled),
        f1: true,
        menu: [{
          id: MenuId.ChatMessageRestoreCheckpoint,
          when: ChatContextKeys.lockedToCodingAgent.negate(),
          group: "navigation",
          order: -1
        }]
      });
    }
    async runEditingSessionAction(accessor, editingSession) {
      const widget = accessor.get(IChatWidgetService);
      while (editingSession.canRedo.get()) {
        await editingSession.redoInteraction();
      }
      const currentWidget = widget.getWidgetBySessionResource(editingSession.chatSessionResource);
      const requestText = currentWidget?.viewModel?.model.checkpoint?.message.text;
      if (currentWidget?.inputEditor.getValue() === requestText) {
        currentWidget?.input.setValue("", false);
      }
      currentWidget?.viewModel?.model.setCheckpoint(void 0);
      currentWidget?.focusInput();
    }
  });
}
__name(registerNewChatActions, "registerNewChatActions");
function getResourceForNewChatSession(sessionType) {
  const isRemoteSession = sessionType !== localChatSessionType;
  if (isRemoteSession) {
    return URI.from({
      scheme: sessionType,
      path: `/untitled-${generateUuid()}`
    });
  }
  return LocalChatSessionUri.forSession(generateUuid());
}
__name(getResourceForNewChatSession, "getResourceForNewChatSession");
export {
  registerNewChatActions
};
//# sourceMappingURL=chatNewActions.js.map
