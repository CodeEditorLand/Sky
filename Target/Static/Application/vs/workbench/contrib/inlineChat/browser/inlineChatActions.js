var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { isCodeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { EditorAction2 } from "../../../../editor/browser/editorExtensions.js";
import { EmbeddedDiffEditorWidget } from "../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";
import { EmbeddedCodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { InlineChatController, InlineChatController1, InlineChatController2, InlineChatRunOptions } from "./inlineChatController.js";
import { ACTION_ACCEPT_CHANGES, CTX_INLINE_CHAT_HAS_AGENT, CTX_INLINE_CHAT_HAS_STASHED_SESSION, CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_INNER_CURSOR_FIRST, CTX_INLINE_CHAT_INNER_CURSOR_LAST, CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_OUTER_CURSOR_POSITION, MENU_INLINE_CHAT_WIDGET_STATUS, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS, CTX_INLINE_CHAT_RESPONSE_TYPE, ACTION_REGENERATE_RESPONSE, ACTION_VIEW_IN_CHAT, ACTION_TOGGLE_DIFF, CTX_INLINE_CHAT_CHANGE_HAS_DIFF, CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF, MENU_INLINE_CHAT_ZONE, ACTION_DISCARD_CHANGES, CTX_INLINE_CHAT_POSSIBLE, ACTION_START, CTX_INLINE_CHAT_HAS_AGENT2, MENU_INLINE_CHAT_SIDE } from "../common/inlineChat.js";
import { ctxHasEditorModification, ctxHasRequestInProgress, ctxIsGlobalEditingSession, ctxRequestCount } from "../../chat/browser/chatEditing/chatEditingEditorContextKeys.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../platform/accessibility/common/accessibility.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IChatService } from "../../chat/common/chatService.js";
import { ChatContextKeys } from "../../chat/common/chatContextKeys.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
CommandsRegistry.registerCommandAlias("interactiveEditor.start", "inlineChat.start");
CommandsRegistry.registerCommandAlias("interactive.acceptChanges", ACTION_ACCEPT_CHANGES);
const START_INLINE_CHAT = registerIcon("start-inline-chat", Codicon.sparkle, localize("startInlineChat", "Icon which spawns the inline chat from the editor toolbar."));
let _holdForSpeech = void 0;
function setHoldForSpeech(holdForSpeech) {
  _holdForSpeech = holdForSpeech;
}
__name(setHoldForSpeech, "setHoldForSpeech");
class StartSessionAction extends Action2 {
  static {
    __name(this, "StartSessionAction");
  }
  constructor() {
    super({
      id: ACTION_START,
      title: localize2("run", "Editor Inline Chat"),
      category: AbstractInline1ChatAction.category,
      f1: true,
      precondition: ContextKeyExpr.and(ContextKeyExpr.or(CTX_INLINE_CHAT_HAS_AGENT, CTX_INLINE_CHAT_HAS_AGENT2), CTX_INLINE_CHAT_POSSIBLE, EditorContextKeys.writable, EditorContextKeys.editorSimpleInput.negate()),
      keybinding: {
        when: EditorContextKeys.focus,
        weight: 200,
        primary: 2048 | 39
        /* KeyCode.KeyI */
      },
      icon: START_INLINE_CHAT,
      menu: {
        id: MenuId.ChatTitleBarMenu,
        group: "a_open",
        order: 3
      }
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
  _runEditorCommand(accessor, editor, ..._args) {
    const ctrl = InlineChatController.get(editor);
    if (!ctrl) {
      return;
    }
    if (_holdForSpeech) {
      accessor.get(IInstantiationService).invokeFunction(_holdForSpeech, ctrl, this);
    }
    let options;
    const arg = _args[0];
    if (arg && InlineChatRunOptions.isInlineChatRunOptions(arg)) {
      options = arg;
    }
    InlineChatController.get(editor)?.run({ ...options });
  }
}
class FocusInlineChat extends EditorAction2 {
  static {
    __name(this, "FocusInlineChat");
  }
  constructor() {
    super({
      id: "inlineChat.focus",
      title: localize2("focus", "Focus Input"),
      f1: true,
      category: AbstractInline1ChatAction.category,
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
class UnstashSessionAction extends EditorAction2 {
  static {
    __name(this, "UnstashSessionAction");
  }
  constructor() {
    super({
      id: "inlineChat.unstash",
      title: localize2("unstash", "Resume Last Dismissed Inline Chat"),
      category: AbstractInline1ChatAction.category,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_STASHED_SESSION, EditorContextKeys.writable),
      keybinding: {
        weight: 200,
        primary: 2048 | 56
      }
    });
  }
  async runEditorCommand(_accessor, editor, ..._args) {
    const ctrl = InlineChatController1.get(editor);
    if (ctrl) {
      const session = ctrl.unstashLastSession();
      if (session) {
        ctrl.run({
          existingSession: session
        });
      }
    }
  }
}
class AbstractInline1ChatAction extends EditorAction2 {
  static {
    __name(this, "AbstractInline1ChatAction");
  }
  static {
    this.category = localize2("cat", "Inline Chat");
  }
  constructor(desc) {
    const massageMenu = /* @__PURE__ */ __name((menu) => {
      if (Array.isArray(menu)) {
        for (const entry of menu) {
          entry.when = ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT, entry.when);
        }
      } else if (menu) {
        menu.when = ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT, menu.when);
      }
    }, "massageMenu");
    if (Array.isArray(desc.menu)) {
      massageMenu(desc.menu);
    } else {
      massageMenu(desc.menu);
    }
    super({
      ...desc,
      category: AbstractInline1ChatAction.category,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT, desc.precondition)
    });
  }
  runEditorCommand(accessor, editor, ..._args) {
    const editorService = accessor.get(IEditorService);
    const logService = accessor.get(ILogService);
    let ctrl = InlineChatController1.get(editor);
    if (!ctrl) {
      const { activeTextEditorControl } = editorService;
      if (isCodeEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl;
      } else if (isDiffEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl.getModifiedEditor();
      }
      ctrl = InlineChatController1.get(editor);
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
class ArrowOutUpAction extends AbstractInline1ChatAction {
  static {
    __name(this, "ArrowOutUpAction");
  }
  constructor() {
    super({
      id: "inlineChat.arrowOutUp",
      title: localize("arrowUp", "Cursor Up"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_INNER_CURSOR_FIRST, EditorContextKeys.isEmbeddedDiffEditor.negate(), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      keybinding: {
        weight: 0,
        primary: 2048 | 16
        /* KeyCode.UpArrow */
      }
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    ctrl.arrowOut(true);
  }
}
class ArrowOutDownAction extends AbstractInline1ChatAction {
  static {
    __name(this, "ArrowOutDownAction");
  }
  constructor() {
    super({
      id: "inlineChat.arrowOutDown",
      title: localize("arrowDown", "Cursor Down"),
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_INNER_CURSOR_LAST, EditorContextKeys.isEmbeddedDiffEditor.negate(), CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      keybinding: {
        weight: 0,
        primary: 2048 | 18
        /* KeyCode.DownArrow */
      }
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    ctrl.arrowOut(false);
  }
}
class AcceptChanges extends AbstractInline1ChatAction {
  static {
    __name(this, "AcceptChanges");
  }
  constructor() {
    super({
      id: ACTION_ACCEPT_CHANGES,
      title: localize2("apply1", "Accept Changes"),
      shortTitle: localize("apply2", "Accept"),
      icon: Codicon.check,
      f1: true,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE),
      keybinding: [{
        weight: 200 + 10,
        primary: 2048 | 3
      }],
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.inputHasText.toNegated(), CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.toNegated(), CTX_INLINE_CHAT_RESPONSE_TYPE.isEqualTo(
          "messagesAndEdits"
          /* InlineChatResponseType.MessagesAndEdits */
        ))
      }, {
        id: MENU_INLINE_CHAT_ZONE,
        group: "navigation",
        order: 1
      }]
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor, hunk) {
    ctrl.acceptHunk(hunk);
  }
}
class DiscardHunkAction extends AbstractInline1ChatAction {
  static {
    __name(this, "DiscardHunkAction");
  }
  constructor() {
    super({
      id: ACTION_DISCARD_CHANGES,
      title: localize("discard", "Discard"),
      icon: Codicon.chromeClose,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      menu: [{
        id: MENU_INLINE_CHAT_ZONE,
        group: "navigation",
        order: 2
      }],
      keybinding: {
        weight: 100,
        primary: 9,
        when: CTX_INLINE_CHAT_RESPONSE_TYPE.isEqualTo(
          "messagesAndEdits"
          /* InlineChatResponseType.MessagesAndEdits */
        )
      }
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor, hunk) {
    return ctrl.discardHunk(hunk);
  }
}
class RerunAction extends AbstractInline1ChatAction {
  static {
    __name(this, "RerunAction");
  }
  constructor() {
    super({
      id: ACTION_REGENERATE_RESPONSE,
      title: localize2("chat.rerun.label", "Rerun Request"),
      shortTitle: localize("rerun", "Rerun"),
      f1: false,
      icon: Codicon.refresh,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      menu: {
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 5,
        when: ContextKeyExpr.and(ChatContextKeys.inputHasText.toNegated(), CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.negate(), CTX_INLINE_CHAT_RESPONSE_TYPE.notEqualsTo(
          "none"
          /* InlineChatResponseType.None */
        ))
      },
      keybinding: {
        weight: 200,
        primary: 2048 | 48
        /* KeyCode.KeyR */
      }
    });
  }
  async runInlineChatCommand(accessor, ctrl, _editor, ..._args) {
    const chatService = accessor.get(IChatService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const model = ctrl.chatWidget.viewModel?.model;
    if (!model) {
      return;
    }
    const lastRequest = model.getRequests().at(-1);
    if (lastRequest) {
      const widget = chatWidgetService.getWidgetBySessionId(model.sessionId);
      await chatService.resendRequest(lastRequest, {
        noCommandDetection: false,
        attempt: lastRequest.attempt + 1,
        location: ctrl.chatWidget.location,
        userSelectedModelId: widget?.input.currentLanguageModel
      });
    }
  }
}
class CloseAction extends AbstractInline1ChatAction {
  static {
    __name(this, "CloseAction");
  }
  constructor() {
    super({
      id: "inlineChat.close",
      title: localize("close", "Close"),
      icon: Codicon.close,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      keybinding: {
        weight: 100 + 1,
        primary: 9
      },
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 1,
        when: CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.negate()
      }, {
        id: MENU_INLINE_CHAT_SIDE,
        group: "navigation",
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_RESPONSE_TYPE.isEqualTo(
          "none"
          /* InlineChatResponseType.None */
        ), CTX_INLINE_CHAT_HAS_AGENT2.negate())
      }]
    });
  }
  async runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    ctrl.cancelSession();
  }
}
class ConfigureInlineChatAction extends AbstractInline1ChatAction {
  static {
    __name(this, "ConfigureInlineChatAction");
  }
  constructor() {
    super({
      id: "inlineChat.configure",
      title: localize2("configure", "Configure Inline Chat"),
      icon: Codicon.settingsGear,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      f1: true,
      menu: {
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "zzz",
        order: 5
      }
    });
  }
  async runInlineChatCommand(accessor, ctrl, _editor, ..._args) {
    accessor.get(IPreferencesService).openSettings({ query: "inlineChat" });
  }
}
class MoveToNextHunk extends AbstractInline1ChatAction {
  static {
    __name(this, "MoveToNextHunk");
  }
  constructor() {
    super({
      id: "inlineChat.moveToNextHunk",
      title: localize2("moveToNextHunk", "Move to Next Change"),
      precondition: CTX_INLINE_CHAT_VISIBLE,
      f1: true,
      keybinding: {
        weight: 200,
        primary: 65
        /* KeyCode.F7 */
      }
    });
  }
  runInlineChatCommand(accessor, ctrl, editor, ...args) {
    ctrl.moveHunk(true);
  }
}
class MoveToPreviousHunk extends AbstractInline1ChatAction {
  static {
    __name(this, "MoveToPreviousHunk");
  }
  constructor() {
    super({
      id: "inlineChat.moveToPreviousHunk",
      title: localize2("moveToPreviousHunk", "Move to Previous Change"),
      f1: true,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      keybinding: {
        weight: 200,
        primary: 1024 | 65
        /* KeyCode.F7 */
      }
    });
  }
  runInlineChatCommand(accessor, ctrl, editor, ...args) {
    ctrl.moveHunk(false);
  }
}
class ViewInChatAction extends AbstractInline1ChatAction {
  static {
    __name(this, "ViewInChatAction");
  }
  constructor() {
    super({
      id: ACTION_VIEW_IN_CHAT,
      title: localize("viewInChat", "View in Chat"),
      icon: Codicon.commentDiscussion,
      precondition: CTX_INLINE_CHAT_VISIBLE,
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "more",
        order: 1,
        when: CTX_INLINE_CHAT_RESPONSE_TYPE.notEqualsTo(
          "messages"
          /* InlineChatResponseType.Messages */
        )
      }, {
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.inputHasText.toNegated(), CTX_INLINE_CHAT_RESPONSE_TYPE.isEqualTo(
          "messages"
          /* InlineChatResponseType.Messages */
        ), CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.negate())
      }],
      keybinding: {
        weight: 200,
        primary: 2048 | 18,
        when: ChatContextKeys.inChatInput
      }
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, ..._args) {
    return ctrl.viewInChat();
  }
}
class ToggleDiffForChange extends AbstractInline1ChatAction {
  static {
    __name(this, "ToggleDiffForChange");
  }
  constructor() {
    super({
      id: ACTION_TOGGLE_DIFF,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_CHANGE_HAS_DIFF),
      title: localize2("showChanges", "Toggle Changes"),
      icon: Codicon.diffSingle,
      toggled: {
        condition: CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF
      },
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "zzz",
        order: 1
      }, {
        id: MENU_INLINE_CHAT_ZONE,
        group: "navigation",
        when: CTX_INLINE_CHAT_CHANGE_HAS_DIFF,
        order: 2
      }]
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor, hunkInfo) {
    ctrl.toggleDiff(hunkInfo);
  }
}
class AbstractInline2ChatAction extends EditorAction2 {
  static {
    __name(this, "AbstractInline2ChatAction");
  }
  static {
    this.category = localize2("cat", "Inline Chat");
  }
  constructor(desc) {
    const massageMenu = /* @__PURE__ */ __name((menu) => {
      if (Array.isArray(menu)) {
        for (const entry of menu) {
          entry.when = ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT2, entry.when);
        }
      } else if (menu) {
        menu.when = ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT2, menu.when);
      }
    }, "massageMenu");
    if (Array.isArray(desc.menu)) {
      massageMenu(desc.menu);
    } else {
      massageMenu(desc.menu);
    }
    super({
      ...desc,
      category: AbstractInline2ChatAction.category,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT2, desc.precondition)
    });
  }
  runEditorCommand(accessor, editor, ..._args) {
    const editorService = accessor.get(IEditorService);
    const logService = accessor.get(ILogService);
    let ctrl = InlineChatController2.get(editor);
    if (!ctrl) {
      const { activeTextEditorControl } = editorService;
      if (isCodeEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl;
      } else if (isDiffEditor(activeTextEditorControl)) {
        editor = activeTextEditorControl.getModifiedEditor();
      }
      ctrl = InlineChatController2.get(editor);
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
class KeepOrUndoSessionAction extends AbstractInline2ChatAction {
  static {
    __name(this, "KeepOrUndoSessionAction");
  }
  constructor(id, _keep) {
    super({
      id,
      title: _keep ? localize2("Keep", "Keep") : localize2("Undo", "Undo"),
      f1: true,
      icon: _keep ? Codicon.check : Codicon.discard,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, ctxHasRequestInProgress.negate()),
      keybinding: [{
        weight: 200,
        primary: _keep ? 2048 | 3 : 2048 | 1
        /* KeyCode.Backspace */
      }],
      menu: [{
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 1,
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT2, ContextKeyExpr.greater(ctxRequestCount.key, 0), ctxHasEditorModification)
      }]
    });
    this._keep = _keep;
  }
  async runInlineChatCommand(accessor, _ctrl, editor, ..._args) {
    const inlineChatSessions = accessor.get(IInlineChatSessionService);
    if (!editor.hasModel()) {
      return;
    }
    const textModel = editor.getModel();
    const session = inlineChatSessions.getSession2(textModel.uri);
    if (session) {
      if (this._keep) {
        await session.editingSession.accept();
      } else {
        await session.editingSession.reject();
      }
      session.dispose();
    }
  }
}
class KeepSessionAction2 extends KeepOrUndoSessionAction {
  static {
    __name(this, "KeepSessionAction2");
  }
  constructor() {
    super("inlineChat2.keep", true);
  }
}
class UndoSessionAction2 extends KeepOrUndoSessionAction {
  static {
    __name(this, "UndoSessionAction2");
  }
  constructor() {
    super("inlineChat2.undo", false);
  }
}
class CloseSessionAction2 extends AbstractInline2ChatAction {
  static {
    __name(this, "CloseSessionAction2");
  }
  constructor() {
    super({
      id: "inlineChat2.close",
      title: localize2("close2", "Close"),
      f1: true,
      icon: Codicon.close,
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, ctxHasRequestInProgress.negate(), ContextKeyExpr.or(ctxRequestCount.isEqualTo(0), ctxHasEditorModification.negate())),
      keybinding: [{
        when: ctxRequestCount.isEqualTo(0),
        weight: 200,
        primary: 2048 | 39
      }, {
        weight: 200,
        primary: 9
      }],
      menu: [{
        id: MENU_INLINE_CHAT_SIDE,
        group: "navigation",
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT2, ctxRequestCount.isEqualTo(0))
      }, {
        id: MENU_INLINE_CHAT_WIDGET_STATUS,
        group: "0_main",
        order: 1,
        when: ContextKeyExpr.and(CTX_INLINE_CHAT_HAS_AGENT2, ctxHasEditorModification.negate())
      }]
    });
  }
  runInlineChatCommand(accessor, _ctrl, editor, ...args) {
    const inlineChatSessions = accessor.get(IInlineChatSessionService);
    if (editor.hasModel()) {
      const textModel = editor.getModel();
      inlineChatSessions.getSession2(textModel.uri)?.dispose();
    }
  }
}
class RevealWidget extends AbstractInline2ChatAction {
  static {
    __name(this, "RevealWidget");
  }
  constructor() {
    super({
      id: "inlineChat2.reveal",
      title: localize2("reveal", "Toggle Inline Chat"),
      f1: true,
      icon: Codicon.copilot,
      precondition: ContextKeyExpr.and(ctxIsGlobalEditingSession.negate(), ContextKeyExpr.greaterEquals(ctxRequestCount.key, 1)),
      toggled: {
        condition: CTX_INLINE_CHAT_VISIBLE
      },
      keybinding: {
        weight: 200,
        primary: 2048 | 39
        /* KeyCode.KeyI */
      },
      menu: {
        id: MenuId.ChatEditingEditorContent,
        when: ContextKeyExpr.and(ContextKeyExpr.greaterEquals(ctxRequestCount.key, 1), ctxIsGlobalEditingSession.negate()),
        group: "navigate",
        order: 4
      }
    });
  }
  runInlineChatCommand(_accessor, ctrl, _editor) {
    ctrl.toggleWidgetUntilNextRequest();
    ctrl.markActiveController();
  }
}
class CancelRequestAction extends AbstractInline2ChatAction {
  static {
    __name(this, "CancelRequestAction");
  }
  constructor() {
    super({
      id: "inlineChat2.cancelRequest",
      title: localize2("cancel", "Cancel Request"),
      f1: true,
      icon: Codicon.stopCircle,
      precondition: ContextKeyExpr.and(ctxIsGlobalEditingSession.negate(), ctxHasRequestInProgress),
      toggled: CTX_INLINE_CHAT_VISIBLE,
      menu: {
        id: MenuId.ChatEditingEditorContent,
        when: ContextKeyExpr.and(ctxIsGlobalEditingSession.negate(), ctxHasRequestInProgress),
        group: "a_request",
        order: 1
      }
    });
  }
  runInlineChatCommand(accessor, ctrl, _editor) {
    const chatService = accessor.get(IChatService);
    const { viewModel } = ctrl.widget.chatWidget;
    if (viewModel) {
      ctrl.toggleWidgetUntilNextRequest();
      ctrl.markActiveController();
      chatService.cancelCurrentRequestForSession(viewModel.sessionId);
    }
  }
}
export {
  AbstractInline1ChatAction,
  AcceptChanges,
  ArrowOutDownAction,
  ArrowOutUpAction,
  CancelRequestAction,
  CloseAction,
  CloseSessionAction2,
  ConfigureInlineChatAction,
  DiscardHunkAction,
  FocusInlineChat,
  KeepSessionAction2,
  MoveToNextHunk,
  MoveToPreviousHunk,
  RerunAction,
  RevealWidget,
  START_INLINE_CHAT,
  StartSessionAction,
  ToggleDiffForChange,
  UndoSessionAction2,
  UnstashSessionAction,
  ViewInChatAction,
  setHoldForSpeech
};
//# sourceMappingURL=inlineChatActions.js.map
