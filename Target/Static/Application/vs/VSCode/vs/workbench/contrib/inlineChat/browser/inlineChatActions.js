var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { isCodeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { EditorAction2 } from "../../../../editor/browser/editorExtensions.js";
import { EmbeddedDiffEditorWidget } from "../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";
import { EmbeddedCodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { InlineChatController, InlineChatRunOptions } from "./inlineChatController.js";
import { ACTION_ACCEPT_CHANGES, ACTION_ASK_IN_CHAT, CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_OUTER_CURSOR_POSITION, CTX_INLINE_CHAT_POSSIBLE, ACTION_START, CTX_INLINE_CHAT_V2_ENABLED, CTX_INLINE_CHAT_V1_ENABLED, CTX_HOVER_MODE, CTX_INLINE_CHAT_INPUT_HAS_TEXT, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT, CTX_INLINE_CHAT_INPUT_WIDGET_FOCUSED, CTX_INLINE_CHAT_PENDING_CONFIRMATION, CTX_INLINE_CHAT_TERMINATED, CTX_FIX_DIAGNOSTICS_ENABLED, CTX_INLINE_CHAT_AFFORDANCE_VISIBLE } from "../common/inlineChat.js";
import { ctxHasEditorModification, ctxHasRequestInProgress } from "../../chat/browser/chatEditing/chatEditingEditorContextKeys.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../platform/accessibility/common/accessibility.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IChatEditingService } from "../../chat/common/editing/chatEditingService.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { ChatEntitlementContextKeys } from "../../../services/chat/common/chatEntitlementService.js";
CommandsRegistry.registerCommandAlias("interactiveEditor.start", "inlineChat.start");
CommandsRegistry.registerCommandAlias("interactive.acceptChanges", ACTION_ACCEPT_CHANGES);
const START_INLINE_CHAT = registerIcon("start-inline-chat", Codicon.sparkle, localize("startInlineChat", "Icon which spawns the inline chat from the editor toolbar."));
const inlineChatContextKey = ContextKeyExpr.and(ContextKeyExpr.or(CTX_INLINE_CHAT_V1_ENABLED, CTX_INLINE_CHAT_V2_ENABLED), CTX_INLINE_CHAT_POSSIBLE, EditorContextKeys.writable, EditorContextKeys.editorSimpleInput.negate());
class StartSessionAction extends Action2 {
  static {
    __name(this, "StartSessionAction");
  }
  constructor() {
    super({
      id: ACTION_START,
      title: localize2("run", "Open Inline Chat"),
      shortTitle: localize2("runShort", "Inline Chat"),
      category: AbstractInlineChatAction.category,
      f1: true,
      precondition: ContextKeyExpr.and(inlineChatContextKey, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate()),
      keybinding: {
        when: EditorContextKeys.focus,
        weight: 200,
        primary: 2048 | 39
        /* KeyCode.KeyI */
      },
      icon: START_INLINE_CHAT,
      menu: [{
        id: MenuId.EditorContext,
        group: "1_chat",
        order: 3,
        when: inlineChatContextKey
      }, {
        id: MenuId.ChatTitleBarMenu,
        group: "a_open",
        order: 3
      }]
    });
  }
  run(accessor, ...args) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getActiveCodeEditor();
    if (!editor || editor.isSimpleWidget) {
      return;
    }
    return editor.invokeWithinContext((editorAccessor) => {
      const kbService = editorAccessor.get(IContextKeyService);
      const logService = editorAccessor.get(ILogService);
      const enabled = kbService.contextMatchesRules(this.desc.precondition ?? void 0);
      if (!enabled) {
        logService.debug(`[EditorAction2] NOT running command because its precondition is FALSE`, this.desc.id, this.desc.precondition?.serialize());
        return;
      }
      return this._runEditorCommand(editorAccessor, editor, ...args);
    });
  }
  async _runEditorCommand(accessor, editor, ...args) {
    const configServce = accessor.get(IConfigurationService);
    const ctrl = InlineChatController.get(editor);
    if (!ctrl) {
      return;
    }
    let options;
    const arg = args[0];
    if (arg && InlineChatRunOptions.isInlineChatRunOptions(arg)) {
      options = arg;
    }
    if (!options?.message && configServce.getValue(
      "inlineChat.renderMode"
      /* InlineChatConfigKeys.RenderMode */
    ) === "hover") {
      const selection = editor.getSelection();
      const placeholder = selection && !selection.isEmpty() ? localize("placeholderWithSelection", "Describe how to change this") : localize("placeholderNoSelection", "Describe what to generate");
      await ctrl.inputOverlayWidget.showMenuAtSelection(placeholder);
      return;
    }
    await ctrl?.run({ ...options });
  }
}
MenuRegistry.appendMenuItem(MenuId.InlineChatEditorAffordance, {
  group: "0_chat",
  order: 1,
  when: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasNonEmptySelection, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate(), ChatEntitlementContextKeys.Setup.hidden.negate()),
  command: {
    id: ACTION_START,
    title: localize("editCode", "Ask for Edits"),
    shortTitle: localize("editCodeShort", "Ask for Edits"),
    icon: Codicon.sparkle
  }
});
class FocusInlineChat extends EditorAction2 {
  static {
    __name(this, "FocusInlineChat");
  }
  constructor() {
    super({
      id: "inlineChat.focus",
      title: localize2("focus", "Focus Input"),
      f1: true,
      category: AbstractInlineChatAction.category,
      precondition: ContextKeyExpr.and(EditorContextKeys.editorTextFocus, CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_FOCUSED.negate(), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      keybinding: [{
        weight: 0 + 10,
        // win against core_command
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo("above"), EditorContextKeys.isEmbeddedDiffEditor.negate()),
        primary: 2048 | 18
      }, {
        weight: 0 + 10,
        // win against core_command
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.isEqualTo("below"), EditorContextKeys.isEmbeddedDiffEditor.negate()),
        primary: 2048 | 16
      }]
    });
  }
  runEditorCommand(_accessor, editor, ..._args) {
    InlineChatController.get(editor)?.focus();
  }
}
class AbstractInlineChatAction extends EditorAction2 {
  static {
    __name(this, "AbstractInlineChatAction");
  }
  static {
    this.category = localize2("cat", "Inline Chat");
  }
  constructor(desc) {
    const massageMenu = /* @__PURE__ */ __name((menu) => {
      if (Array.isArray(menu)) {
        for (const entry of menu) {
          entry.when = ContextKeyExpr.and(CTX_INLINE_CHAT_V2_ENABLED, entry.when);
        }
      } else if (menu) {
        menu.when = ContextKeyExpr.and(CTX_INLINE_CHAT_V2_ENABLED, menu.when);
      }
    }, "massageMenu");
    if (Array.isArray(desc.menu)) {
      massageMenu(desc.menu);
    } else {
      massageMenu(desc.menu);
    }
    super({
      ...desc,
      category: AbstractInlineChatAction.category,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_V2_ENABLED, desc.precondition)
    });
  }
  runEditorCommand(accessor, editor, ..._args) {
    const editorService = accessor.get(IEditorService);
    const logService = accessor.get(ILogService);
    let ctrl = InlineChatController.get(editor);
    if (!ctrl) {
      const { activeTextEditorControl } = editorService;
      if (isCodeEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl;
      } else if (isDiffEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl.getModifiedEditor();
      }
      ctrl = InlineChatController.get(editor);
    }
    if (!ctrl) {
      logService.warn("[IE] NO controller found for action", this.desc.id, editor.getModel()?.uri);
      return;
    }
    if (editor instanceof EmbeddedCodeEditorWidget) {
      editor = editor.getParentEditor();
    }
    if (!ctrl) {
      for (const diffEditor of accessor.get(ICodeEditorService).listDiffEditors()) {
        if (diffEditor.getOriginalEditor() === editor || diffEditor.getModifiedEditor() === editor) {
          if (diffEditor instanceof EmbeddedDiffEditorWidget) {
            this.runEditorCommand(accessor, diffEditor.getParentEditor(), ..._args);
          }
        }
      }
      return;
    }
    this.runInlineChatCommand(accessor, ctrl, editor, ..._args);
  }
}
class FixDiagnosticsAction extends AbstractInlineChatAction {
  static {
    __name(this, "FixDiagnosticsAction");
  }
  constructor() {
    super({
      id: "inlineChat.fixDiagnostics",
      title: localize2("fix", "Fix"),
      icon: Codicon.editSparkle,
      precondition: ContextKeyExpr.and(CTX_FIX_DIAGNOSTICS_ENABLED, EditorContextKeys.selectionHasDiagnostics, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate()),
      menu: [{
        id: MenuId.InlineChatEditorAffordance,
        group: "1_quickfix",
        order: 100,
        when: ContextKeyExpr.and(CTX_FIX_DIAGNOSTICS_ENABLED, EditorContextKeys.selectionHasDiagnostics, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate())
      }, {
        id: MenuId.ChatEditorInlineMenu,
        group: "2_chat",
        order: 1,
        when: ContextKeyExpr.and(CTX_FIX_DIAGNOSTICS_ENABLED, EditorContextKeys.selectionHasDiagnostics, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate())
      }]
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    ctrl.inputWidget.hide();
    ctrl.run({ autoSend: true, attachDiagnostics: true });
  }
}
class KeepOrUndoSessionAction extends AbstractInlineChatAction {
  static {
    __name(this, "KeepOrUndoSessionAction");
  }
  constructor(_keep, desc) {
    super(desc);
    this._keep = _keep;
  }
  async runInlineChatCommand(_accessor, ctrl, editor, ..._args) {
    if (this._keep) {
      await ctrl.acceptSession();
    } else {
      await ctrl.rejectSession();
    }
    if (editor.hasModel()) {
      editor.setSelection(editor.getSelection().collapseToStart());
    }
  }
}
class KeepSessionAction2 extends KeepOrUndoSessionAction {
  static {
    __name(this, "KeepSessionAction2");
  }
  constructor() {
    super(true, {
      id: "inlineChat2.keep",
      title: localize2("Keep", "Keep"),
      f1: true,
      icon: Codicon.check,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, ctxHasRequestInProgress.negate(), ctxHasEditorModification),
      keybinding: [{
        when: ContextKeyExpr.and(ChatContextKeys.inputHasFocus, ChatContextKeys.inputHasText.negate()),
        weight: 200,
        primary: 3
        /* KeyCode.Enter */
      }, {
        weight: 200 + 10,
        primary: 2048 | 3
        /* KeyCode.Enter */
      }],
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.and(ctxHasRequestInProgress.negate(), ctxHasEditorModification, ChatContextKeys.inputHasText.toNegated())
      }]
    });
  }
}
class UndoSessionAction2 extends KeepOrUndoSessionAction {
  static {
    __name(this, "UndoSessionAction2");
  }
  constructor() {
    super(false, {
      id: "inlineChat2.undo",
      title: localize2("undo", "Undo"),
      f1: true,
      icon: Codicon.discard,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, CTX_HOVER_MODE),
      keybinding: [{
        when: ContextKeyExpr.or(ContextKeyExpr.and(EditorContextKeys.focus, ctxHasEditorModification.negate()), ChatContextKeys.inputHasFocus),
        weight: 200 + 1,
        primary: 9
      }],
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 100,
        when: ContextKeyExpr.and(CTX_HOVER_MODE, ctxHasRequestInProgress.negate(), ctxHasEditorModification)
      }]
    });
  }
}
class UndoAndCloseSessionAction2 extends KeepOrUndoSessionAction {
  static {
    __name(this, "UndoAndCloseSessionAction2");
  }
  constructor() {
    super(false, {
      id: "inlineChat2.close",
      title: localize2("close2", "Close"),
      f1: true,
      icon: Codicon.close,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE),
      keybinding: [{
        when: ContextKeyExpr.or(ContextKeyExpr.and(EditorContextKeys.focus, ctxHasEditorModification.negate()), ChatContextKeys.inputHasFocus),
        weight: 200 + 1,
        primary: 9
      }],
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 100,
        when: ContextKeyExpr.or(CTX_HOVER_MODE.negate(), ContextKeyExpr.and(CTX_HOVER_MODE, ctxHasEditorModification.negate(), ctxHasRequestInProgress.negate()), ContextKeyExpr.and(CTX_HOVER_MODE, CTX_INLINE_CHAT_PENDING_CONFIRMATION))
      }]
    });
  }
}
class CancelSessionAction extends KeepOrUndoSessionAction {
  static {
    __name(this, "CancelSessionAction");
  }
  constructor() {
    super(false, {
      id: "inlineChat2.cancel",
      title: localize2("cancel", "Cancel"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, ctxHasRequestInProgress),
      keybinding: [{
        when: ContextKeyExpr.or(EditorContextKeys.focus, ChatContextKeys.inputHasFocus),
        weight: 200 + 1,
        primary: 9
      }],
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 100,
        when: ContextKeyExpr.and(CTX_HOVER_MODE, ctxHasRequestInProgress)
      }]
    });
  }
}
class ContinueInlineChatInChatViewAction extends AbstractInlineChatAction {
  static {
    __name(this, "ContinueInlineChatInChatViewAction");
  }
  constructor() {
    super({
      id: "inlineChat2.continueInChat",
      title: localize2("continueInChat", "Ask in Chat"),
      icon: Codicon.chatSparkle,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, CTX_HOVER_MODE, CTX_INLINE_CHAT_TERMINATED),
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(CTX_HOVER_MODE, CTX_INLINE_CHAT_TERMINATED)
      }]
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor) {
    await ctrl.continueSessionInChat();
  }
}
class RephraseInlineChatSessionAction extends AbstractInlineChatAction {
  static {
    __name(this, "RephraseInlineChatSessionAction");
  }
  constructor() {
    super({
      id: "inlineChat2.rephrase",
      title: localize2("rephrase", "Rephrase"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, CTX_HOVER_MODE, CTX_INLINE_CHAT_TERMINATED),
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.and(CTX_HOVER_MODE, CTX_INLINE_CHAT_TERMINATED)
      }]
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor) {
    await ctrl.rephraseSession();
  }
}
class SubmitInlineChatInputAction extends AbstractInlineChatAction {
  static {
    __name(this, "SubmitInlineChatInputAction");
  }
  constructor() {
    super({
      id: "inlineChat.submitInput",
      title: localize2("submitInput", "Send"),
      icon: Codicon.send,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_INPUT_WIDGET_FOCUSED, CTX_INLINE_CHAT_INPUT_HAS_TEXT, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate()),
      keybinding: {
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_INPUT_WIDGET_FOCUSED, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate()),
        weight: 0 + 10,
        primary: 3
        /* KeyCode.Enter */
      },
      menu: [{
        id: MenuId.InlineChatInput,
        group: "0_main",
        order: 1,
        when: CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT.negate()
      }]
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    const value = ctrl.inputWidget.value;
    if (value) {
      ctrl.inputWidget.hide();
      ctrl.run({ message: value, autoSend: true });
    }
  }
}
class HideInlineChatInputAction extends AbstractInlineChatAction {
  static {
    __name(this, "HideInlineChatInputAction");
  }
  constructor() {
    super({
      id: "inlineChat.hideInput",
      title: localize2("hideInput", "Hide Input"),
      precondition: CTX_INLINE_CHAT_INPUT_WIDGET_FOCUSED,
      keybinding: {
        when: CTX_INLINE_CHAT_INPUT_WIDGET_FOCUSED,
        weight: 0 + 10,
        primary: 9
        /* KeyCode.Escape */
      }
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    ctrl.inputWidget.hide();
  }
}
class AskInChatAction extends EditorAction2 {
  static {
    __name(this, "AskInChatAction");
  }
  constructor() {
    super({
      id: ACTION_ASK_IN_CHAT,
      title: localize2("askInChat", "Ask in Chat"),
      category: AbstractInlineChatAction.category,
      f1: true,
      precondition: ContextKeyExpr.and(inlineChatContextKey, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT),
      keybinding: {
        when: EditorContextKeys.focus,
        weight: 200,
        primary: 2048 | 39
        /* KeyCode.KeyI */
      },
      icon: Codicon.chatSparkle,
      menu: [{
        id: MenuId.EditorContext,
        group: "1_chat",
        order: 3,
        when: ContextKeyExpr.and(inlineChatContextKey, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT)
      }, {
        id: MenuId.InlineChatEditorAffordance,
        group: "0_chat",
        order: 1,
        when: ContextKeyExpr.and(EditorContextKeys.hasNonEmptySelection, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT)
      }]
    });
  }
  async runEditorCommand(accessor, editor) {
    const chatEditingService = accessor.get(IChatEditingService);
    const ctrl = InlineChatController.get(editor);
    if (!ctrl || !editor.hasModel()) {
      return;
    }
    const entry = chatEditingService.editingSessionsObs.get().find((value) => value.getEntry(editor.getModel().uri));
    if (entry) {
      ctrl.inputOverlayWidget.showMenuAtSelection(localize("placeholderAskInChat", "Describe how to proceed in Chat"));
    }
  }
}
class DismissEditorAffordanceAction extends EditorAction2 {
  static {
    __name(this, "DismissEditorAffordanceAction");
  }
  constructor() {
    super({
      id: "inlineChat.dismissEditorAffordance",
      title: localize2("dismissAffordance", "Dismiss Editor Affordance"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_AFFORDANCE_VISIBLE, ContextKeyExpr.equals("config.inlineChat.affordance", "editor")),
      keybinding: {
        when: EditorContextKeys.editorTextFocus,
        weight: 100,
        primary: 9
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    InlineChatController.get(editor)?.inputOverlayWidget.dismiss();
  }
}
class QueueInChatAction extends AbstractInlineChatAction {
  static {
    __name(this, "QueueInChatAction");
  }
  constructor() {
    super({
      id: "inlineChat.queueInChat",
      title: localize2("queueInChat", "Queue in Chat"),
      icon: Codicon.arrowUp,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_INPUT_WIDGET_FOCUSED, CTX_INLINE_CHAT_INPUT_HAS_TEXT, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT),
      keybinding: {
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_INPUT_WIDGET_FOCUSED, CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT),
        weight: 0 + 10,
        primary: 3
        /* KeyCode.Enter */
      },
      menu: [{
        id: MenuId.InlineChatInput,
        group: "0_main",
        order: 1,
        when: CTX_INLINE_CHAT_FILE_BELONGS_TO_CHAT
      }]
    });
  }
  async runInlineChatCommand(accessor, ctrl, editor) {
    const chatEditingService = accessor.get(IChatEditingService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    if (!editor.hasModel()) {
      return;
    }
    const value = ctrl.inputWidget.value;
    ctrl.inputWidget.hide();
    if (!value) {
      return;
    }
    const session = chatEditingService.editingSessionsObs.get().find((s) => s.getEntry(editor.getModel().uri));
    if (!session) {
      return;
    }
    const widget = await chatWidgetService.openSession(session.chatSessionResource);
    if (!widget) {
      return;
    }
    const selection = editor.getSelection();
    if (selection && !selection.isEmpty()) {
      await widget.attachmentModel.addFile(editor.getModel().uri, selection);
    }
    await widget.acceptInput(value, {
      alwaysQueue: true,
      queue: "queued"
      /* ChatRequestQueueKind.Queued */
    });
  }
}
export {
  AbstractInlineChatAction,
  AskInChatAction,
  CancelSessionAction,
  ContinueInlineChatInChatViewAction,
  DismissEditorAffordanceAction,
  FixDiagnosticsAction,
  FocusInlineChat,
  HideInlineChatInputAction,
  KeepSessionAction2,
  QueueInChatAction,
  RephraseInlineChatSessionAction,
  START_INLINE_CHAT,
  StartSessionAction,
  SubmitInlineChatInputAction,
  UndoAndCloseSessionAction2,
  UndoSessionAction2
};
//# sourceMappingURL=inlineChatActions.js.map
