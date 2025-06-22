var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize2 } from "../../../../../nls.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { ActiveEditorContext } from "../../../../common/contextkeys.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { ChatMode } from "../../common/constants.js";
import { ChatViewId } from "../chat.js";
import { EditingSessionAction } from "../chatEditing/chatEditingActions.js";
import { ChatEditorInput } from "../chatEditorInput.js";
import { ACTION_ID_NEW_CHAT, ACTION_ID_NEW_EDIT_SESSION, CHAT_CATEGORY, handleCurrentEditingSession } from "./chatActions.js";
import { clearChatEditor } from "./chatClear.js";
function registerNewChatActions() {
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
        precondition: ChatContextKeys.enabled,
        menu: [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id) => ({
          id,
          group: "navigation",
          when: ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID),
          order: 1
        }))
      });
    }
    async run(accessor, ...args) {
      announceChatCleared(accessor.get(IAccessibilitySignalService));
      await clearChatEditor(accessor);
    }
  });
  registerAction2(class NewChatAction extends EditingSessionAction {
    static {
      __name(this, "NewChatAction");
    }
    constructor() {
      super({
        id: ACTION_ID_NEW_CHAT,
        title: localize2("chat.newEdits.label", "New Chat"),
        category: CHAT_CATEGORY,
        icon: Codicon.plus,
        precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.editingParticipantRegistered),
        f1: true,
        menu: [
          {
            id: MenuId.ChatContext,
            group: "z_clear"
          },
          {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", ChatViewId),
            group: "navigation",
            order: -1
          }
        ],
        keybinding: {
          weight: 200,
          primary: 2048 | 42,
          mac: {
            primary: 256 | 42
            /* KeyCode.KeyL */
          },
          when: ChatContextKeys.inChatSession
        }
      });
    }
    async runEditingSessionAction(accessor, editingSession, widget, ...args) {
      const context = args[0];
      const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
      const dialogService = accessor.get(IDialogService);
      if (!await handleCurrentEditingSession(editingSession, void 0, dialogService)) {
        return;
      }
      announceChatCleared(accessibilitySignalService);
      await editingSession.stop();
      widget.clear();
      await widget.waitForReady();
      widget.attachmentModel.clear(true);
      widget.input.relatedFiles?.clear();
      widget.focusInput();
      if (!context) {
        return;
      }
      if (typeof context.agentMode === "boolean") {
        widget.input.setChatMode(context.agentMode ? ChatMode.Agent : ChatMode.Edit);
      }
      if (context.inputValue) {
        if (context.isPartialQuery) {
          widget.setInput(context.inputValue);
        } else {
          widget.acceptInput(context.inputValue);
        }
      }
    }
  });
  CommandsRegistry.registerCommandAlias(ACTION_ID_NEW_EDIT_SESSION, ACTION_ID_NEW_CHAT);
  registerAction2(class UndoChatEditInteractionAction extends EditingSessionAction {
    static {
      __name(this, "UndoChatEditInteractionAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.undoEdit",
        title: localize2("chat.undoEdit.label", "Undo Last Request"),
        category: CHAT_CATEGORY,
        icon: Codicon.discard,
        precondition: ContextKeyExpr.and(ChatContextKeys.chatEditingCanUndo, ChatContextKeys.enabled, ChatContextKeys.editingParticipantRegistered),
        f1: true,
        menu: [{
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", ChatViewId),
          group: "navigation",
          order: -3
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
        title: localize2("chat.redoEdit.label", "Redo Last Request"),
        category: CHAT_CATEGORY,
        icon: Codicon.redo,
        precondition: ContextKeyExpr.and(ChatContextKeys.chatEditingCanRedo, ChatContextKeys.enabled, ChatContextKeys.editingParticipantRegistered),
        f1: true,
        menu: [{
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", ChatViewId),
          group: "navigation",
          order: -2
        }]
      });
    }
    async runEditingSessionAction(accessor, editingSession) {
      await editingSession.redoInteraction();
    }
  });
}
__name(registerNewChatActions, "registerNewChatActions");
function announceChatCleared(accessibilitySignalService) {
  accessibilitySignalService.playSignal(AccessibilitySignal.clear);
}
__name(announceChatCleared, "announceChatCleared");
export {
  registerNewChatActions
};
//# sourceMappingURL=chatClearActions.js.map
