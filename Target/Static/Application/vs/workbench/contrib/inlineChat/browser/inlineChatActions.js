var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { isCodeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { EditorAction2 } from "../../../../editor/browser/editorExtensions.js";
import { EmbeddedDiffEditorWidget } from "../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";
import { EmbeddedCodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { InlineChatController, InlineChatRunOptions } from "./inlineChatController.js";
import { ACTION_ACCEPT_CHANGES, CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_VISIBLE, CTX_INLINE_CHAT_OUTER_CURSOR_POSITION, CTX_INLINE_CHAT_POSSIBLE, ACTION_START, CTX_INLINE_CHAT_V2_ENABLED, CTX_INLINE_CHAT_V1_ENABLED, CTX_HOVER_MODE } from "../common/inlineChat.js";
import { ctxHasEditorModification, ctxHasRequestInProgress } from "../../chat/browser/chatEditing/chatEditingEditorContextKeys.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../platform/accessibility/common/accessibility.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
CommandsRegistry.registerCommandAlias("interactiveEditor.start", "inlineChat.start");
CommandsRegistry.registerCommandAlias("interactive.acceptChanges", ACTION_ACCEPT_CHANGES);
const START_INLINE_CHAT = registerIcon("start-inline-chat", Codicon.sparkle, localize("startInlineChat", "Icon which spawns the inline chat from the editor toolbar."));
let _holdForSpeech = void 0;
function setHoldForSpeech(holdForSpeech) {
  _holdForSpeech = holdForSpeech;
}
__name(setHoldForSpeech, "setHoldForSpeech");
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
      precondition: inlineChatContextKey,
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
      }, {
        id: MenuId.ChatEditorInlineGutter,
        group: "1_chat",
        order: 1
      }, {
        id: MenuId.InlineChatEditorAffordance,
        group: "1_chat",
        order: 1,
        when: EditorContextKeys.hasNonEmptySelection
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
    const ctrl = InlineChatController.get(editor);
    if (!ctrl) {
      return;
    }
    if (_holdForSpeech) {
      accessor.get(IInstantiationService).invokeFunction(_holdForSpeech, ctrl, this);
    }
    let options;
    const arg = args[0];
    if (arg && InlineChatRunOptions.isInlineChatRunOptions(arg)) {
      options = arg;
    }
    await InlineChatController.get(editor)?.run({ ...options });
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
      precondition: ContextKeyExpr.and(CTX_INLINE_CHAT_VISIBLE, CTX_HOVER_MODE.negate()),
      keybinding: [{
        when: ContextKeyExpr.or(ContextKeyExpr.and(EditorContextKeys.focus, ctxHasEditorModification.negate()), ChatContextKeys.inputHasFocus),
        weight: 200 + 1,
        primary: 9
      }],
      menu: [{
        id: MenuId.ChatEditorInlineExecute,
        group: "navigation",
        order: 100,
        when: ContextKeyExpr.or(CTX_HOVER_MODE.negate(), ContextKeyExpr.and(CTX_HOVER_MODE, ctxHasEditorModification.negate(), ctxHasRequestInProgress.negate()))
      }]
    });
  }
}
export {
  AbstractInlineChatAction,
  FocusInlineChat,
  KeepSessionAction2,
  START_INLINE_CHAT,
  StartSessionAction,
  UndoAndCloseSessionAction2,
  UndoSessionAction2,
  setHoldForSpeech
};
//# sourceMappingURL=inlineChatActions.js.map
