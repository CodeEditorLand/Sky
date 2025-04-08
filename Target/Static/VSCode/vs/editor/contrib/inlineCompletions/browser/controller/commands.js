var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { asyncTransaction, transaction } from "../../../../../base/common/observable.js";
import { splitLines } from "../../../../../base/common/strings.js";
import * as nls from "../../../../../nls.js";
import { Action2, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingsRegistry, KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { INotificationService, Severity } from "../../../../../platform/notification/common/notification.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { EditorAction, EditorCommand, ServicesAccessor } from "../../../../browser/editorExtensions.js";
import { EditorContextKeys } from "../../../../common/editorContextKeys.js";
import { Context as SuggestContext } from "../../../suggest/browser/suggest.js";
import { hideInlineCompletionId, inlineSuggestCommitId, jumpToNextInlineEditId, showNextInlineSuggestionActionId, showPreviousInlineSuggestionActionId, toggleShowCollapsedId } from "./commandIds.js";
import { InlineCompletionContextKeys } from "./inlineCompletionContextKeys.js";
import { InlineCompletionsController } from "./inlineCompletionsController.js";
class ShowNextInlineSuggestionAction extends EditorAction {
  static {
    __name(this, "ShowNextInlineSuggestionAction");
  }
  static ID = showNextInlineSuggestionActionId;
  constructor() {
    super({
      id: ShowNextInlineSuggestionAction.ID,
      label: nls.localize2("action.inlineSuggest.showNext", "Show Next Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100,
        primary: KeyMod.Alt | KeyCode.BracketRight
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    controller?.model.get()?.next();
  }
}
class ShowPreviousInlineSuggestionAction extends EditorAction {
  static {
    __name(this, "ShowPreviousInlineSuggestionAction");
  }
  static ID = showPreviousInlineSuggestionActionId;
  constructor() {
    super({
      id: ShowPreviousInlineSuggestionAction.ID,
      label: nls.localize2("action.inlineSuggest.showPrevious", "Show Previous Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100,
        primary: KeyMod.Alt | KeyCode.BracketLeft
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    controller?.model.get()?.previous();
  }
}
class TriggerInlineSuggestionAction extends EditorAction {
  static {
    __name(this, "TriggerInlineSuggestionAction");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.trigger",
      label: nls.localize2("action.inlineSuggest.trigger", "Trigger Inline Suggestion"),
      precondition: EditorContextKeys.writable
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    await asyncTransaction(async (tx) => {
      await controller?.model.get()?.triggerExplicitly(tx);
      controller?.playAccessibilitySignal(tx);
    });
  }
}
class ExplicitTriggerInlineEditAction extends EditorAction {
  static {
    __name(this, "ExplicitTriggerInlineEditAction");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.triggerInlineEditExplicit",
      label: nls.localize2("action.inlineSuggest.trigger.explicitInlineEdit", "Trigger Next Edit Suggestion"),
      precondition: EditorContextKeys.writable
    });
  }
  async run(accessor, editor) {
    const notificationService = accessor.get(INotificationService);
    const controller = InlineCompletionsController.get(editor);
    await controller?.model.get()?.triggerExplicitly(void 0, true);
    if (!controller?.model.get()?.inlineEditAvailable.get()) {
      notificationService.notify({
        severity: Severity.Info,
        message: nls.localize("noInlineEditAvailable", "No inline edit is available.")
      });
    }
  }
}
class TriggerInlineEditAction extends EditorCommand {
  static {
    __name(this, "TriggerInlineEditAction");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.triggerInlineEdit",
      precondition: EditorContextKeys.writable
    });
  }
  async runEditorCommand(accessor, editor, args) {
    const controller = InlineCompletionsController.get(editor);
    await controller?.model.get()?.trigger(void 0, { onlyFetchInlineEdits: true });
  }
}
class AcceptNextWordOfInlineCompletion extends EditorAction {
  static {
    __name(this, "AcceptNextWordOfInlineCompletion");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.acceptNextWord",
      label: nls.localize2("action.inlineSuggest.acceptNextWord", "Accept Next Word Of Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: KeybindingWeight.EditorContrib + 1,
        primary: KeyMod.CtrlCmd | KeyCode.RightArrow,
        kbExpr: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible)
      },
      menuOpts: [{
        menuId: MenuId.InlineSuggestionToolbar,
        title: nls.localize("acceptWord", "Accept Word"),
        group: "primary",
        order: 2
      }]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    await controller?.model.get()?.acceptNextWord();
  }
}
class AcceptNextLineOfInlineCompletion extends EditorAction {
  static {
    __name(this, "AcceptNextLineOfInlineCompletion");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.acceptNextLine",
      label: nls.localize2("action.inlineSuggest.acceptNextLine", "Accept Next Line Of Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: KeybindingWeight.EditorContrib + 1
      },
      menuOpts: [{
        menuId: MenuId.InlineSuggestionToolbar,
        title: nls.localize("acceptLine", "Accept Line"),
        group: "secondary",
        order: 2
      }]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    await controller?.model.get()?.acceptNextLine();
  }
}
class AcceptInlineCompletion extends EditorAction {
  static {
    __name(this, "AcceptInlineCompletion");
  }
  constructor() {
    super({
      id: inlineSuggestCommitId,
      label: nls.localize2("action.inlineSuggest.accept", "Accept Inline Suggestion"),
      precondition: ContextKeyExpr.or(InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.inlineEditVisible),
      menuOpts: [{
        menuId: MenuId.InlineSuggestionToolbar,
        title: nls.localize("accept", "Accept"),
        group: "primary",
        order: 2
      }, {
        menuId: MenuId.InlineEditsActions,
        title: nls.localize("accept", "Accept"),
        group: "primary",
        order: 2
      }],
      kbOpts: [
        {
          primary: KeyCode.Tab,
          weight: 200,
          kbExpr: ContextKeyExpr.or(
            ContextKeyExpr.and(
              InlineCompletionContextKeys.inlineSuggestionVisible,
              EditorContextKeys.tabMovesFocus.toNegated(),
              SuggestContext.Visible.toNegated(),
              EditorContextKeys.hoverFocused.toNegated(),
              InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize
            ),
            ContextKeyExpr.and(
              InlineCompletionContextKeys.inlineEditVisible,
              EditorContextKeys.tabMovesFocus.toNegated(),
              SuggestContext.Visible.toNegated(),
              EditorContextKeys.hoverFocused.toNegated(),
              InlineCompletionContextKeys.tabShouldAcceptInlineEdit
            )
          )
        }
      ]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.getInFocusedEditorOrParent(accessor);
    if (controller) {
      controller.model.get()?.accept(controller.editor);
      controller.editor.focus();
    }
  }
}
KeybindingsRegistry.registerKeybindingRule({
  id: inlineSuggestCommitId,
  weight: 202,
  // greater than jump
  primary: KeyCode.Tab,
  when: ContextKeyExpr.and(InlineCompletionContextKeys.inInlineEditsPreviewEditor)
});
class JumpToNextInlineEdit extends EditorAction {
  static {
    __name(this, "JumpToNextInlineEdit");
  }
  constructor() {
    super({
      id: jumpToNextInlineEditId,
      label: nls.localize2("action.inlineSuggest.jump", "Jump to next inline edit"),
      precondition: InlineCompletionContextKeys.inlineEditVisible,
      menuOpts: [{
        menuId: MenuId.InlineEditsActions,
        title: nls.localize("jump", "Jump"),
        group: "primary",
        order: 1,
        when: InlineCompletionContextKeys.cursorAtInlineEdit.toNegated()
      }],
      kbOpts: {
        primary: KeyCode.Tab,
        weight: 201,
        kbExpr: ContextKeyExpr.and(
          InlineCompletionContextKeys.inlineEditVisible,
          EditorContextKeys.tabMovesFocus.toNegated(),
          SuggestContext.Visible.toNegated(),
          EditorContextKeys.hoverFocused.toNegated(),
          InlineCompletionContextKeys.tabShouldJumpToInlineEdit
        )
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    if (controller) {
      controller.jump();
    }
  }
}
class HideInlineCompletion extends EditorAction {
  static {
    __name(this, "HideInlineCompletion");
  }
  static ID = hideInlineCompletionId;
  constructor() {
    super({
      id: HideInlineCompletion.ID,
      label: nls.localize2("action.inlineSuggest.hide", "Hide Inline Suggestion"),
      precondition: ContextKeyExpr.or(InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.inlineEditVisible),
      kbOpts: {
        weight: KeybindingWeight.EditorContrib + 90,
        // same as hiding the suggest widget
        primary: KeyCode.Escape
      },
      menuOpts: [{
        menuId: MenuId.InlineEditsActions,
        title: nls.localize("reject", "Reject"),
        group: "primary",
        order: 3
      }]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.getInFocusedEditorOrParent(accessor);
    transaction((tx) => {
      controller?.model.get()?.stop("explicitCancel", tx);
    });
    controller?.editor.focus();
  }
}
class ToggleInlineCompletionShowCollapsed extends EditorAction {
  static {
    __name(this, "ToggleInlineCompletionShowCollapsed");
  }
  static ID = toggleShowCollapsedId;
  constructor() {
    super({
      id: ToggleInlineCompletionShowCollapsed.ID,
      label: nls.localize2("action.inlineSuggest.toggleShowCollapsed", "Toggle Inline Suggestions Show Collapsed"),
      precondition: ContextKeyExpr.true()
    });
  }
  async run(accessor, editor) {
    const configurationService = accessor.get(IConfigurationService);
    const showCollapsed = configurationService.getValue("editor.inlineSuggest.edits.showCollapsed");
    configurationService.updateValue("editor.inlineSuggest.edits.showCollapsed", !showCollapsed);
  }
}
KeybindingsRegistry.registerKeybindingRule({
  id: HideInlineCompletion.ID,
  weight: -1,
  // very weak
  primary: KeyCode.Escape,
  secondary: [KeyMod.Shift | KeyCode.Escape],
  when: ContextKeyExpr.and(InlineCompletionContextKeys.inInlineEditsPreviewEditor)
});
class ToggleAlwaysShowInlineSuggestionToolbar extends Action2 {
  static {
    __name(this, "ToggleAlwaysShowInlineSuggestionToolbar");
  }
  static ID = "editor.action.inlineSuggest.toggleAlwaysShowToolbar";
  constructor() {
    super({
      id: ToggleAlwaysShowInlineSuggestionToolbar.ID,
      title: nls.localize("action.inlineSuggest.alwaysShowToolbar", "Always Show Toolbar"),
      f1: false,
      precondition: void 0,
      menu: [{
        id: MenuId.InlineSuggestionToolbar,
        group: "secondary",
        order: 10
      }],
      toggled: ContextKeyExpr.equals("config.editor.inlineSuggest.showToolbar", "always")
    });
  }
  async run(accessor) {
    const configService = accessor.get(IConfigurationService);
    const currentValue = configService.getValue("editor.inlineSuggest.showToolbar");
    const newValue = currentValue === "always" ? "onHover" : "always";
    configService.updateValue("editor.inlineSuggest.showToolbar", newValue);
  }
}
class DevExtractReproSample extends EditorAction {
  static {
    __name(this, "DevExtractReproSample");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.dev.extractRepro",
      label: nls.localize("action.inlineSuggest.dev.extractRepro", "Developer: Extract Inline Suggest State"),
      alias: "Developer: Inline Suggest Extract Repro",
      precondition: InlineCompletionContextKeys.inlineEditVisible
    });
  }
  async run(accessor, editor) {
    const clipboardService = accessor.get(IClipboardService);
    const controller = InlineCompletionsController.get(editor);
    const m = controller?.model.get();
    if (!m) {
      return;
    }
    const repro = m.extractReproSample();
    const inlineCompletionLines = splitLines(JSON.stringify({ inlineCompletion: repro.inlineCompletion }, null, 4));
    const json = inlineCompletionLines.map((l) => "// " + l).join("\n");
    const reproStr = `${repro.documentValue}

// <json>
${json}
// </json>
`;
    await clipboardService.writeText(reproStr);
    return { reproCase: reproStr };
  }
}
export {
  AcceptInlineCompletion,
  AcceptNextLineOfInlineCompletion,
  AcceptNextWordOfInlineCompletion,
  DevExtractReproSample,
  ExplicitTriggerInlineEditAction,
  HideInlineCompletion,
  JumpToNextInlineEdit,
  ShowNextInlineSuggestionAction,
  ShowPreviousInlineSuggestionAction,
  ToggleAlwaysShowInlineSuggestionToolbar,
  ToggleInlineCompletionShowCollapsed,
  TriggerInlineEditAction,
  TriggerInlineSuggestionAction
};
//# sourceMappingURL=commands.js.map
