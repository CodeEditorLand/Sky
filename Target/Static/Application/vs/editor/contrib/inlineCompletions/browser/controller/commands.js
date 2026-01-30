var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { asyncTransaction, transaction } from "../../../../../base/common/observable.js";
import { splitLines } from "../../../../../base/common/strings.js";
import { vBoolean, vObj, vOptionalProp, vString, vUnchecked, vUndefined, vUnion, vWithJsonSchemaRef } from "../../../../../base/common/validation.js";
import * as nls from "../../../../../nls.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../../platform/accessibility/common/accessibility.js";
import { Action2, MenuId } from "../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingsRegistry } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { INotificationService, Severity } from "../../../../../platform/notification/common/notification.js";
import { EditorAction } from "../../../../browser/editorExtensions.js";
import { EditorContextKeys } from "../../../../common/editorContextKeys.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { Context as SuggestContext } from "../../../suggest/browser/suggest.js";
import { hideInlineCompletionId, inlineSuggestCommitAlternativeActionId, inlineSuggestCommitId, jumpToNextInlineEditId, showNextInlineSuggestionActionId, showPreviousInlineSuggestionActionId, toggleShowCollapsedId } from "./commandIds.js";
import { InlineCompletionContextKeys } from "./inlineCompletionContextKeys.js";
import { InlineCompletionsController } from "./inlineCompletionsController.js";
class ShowNextInlineSuggestionAction extends EditorAction {
  static {
    __name(this, "ShowNextInlineSuggestionAction");
  }
  static {
    this.ID = showNextInlineSuggestionActionId;
  }
  constructor() {
    super({
      id: ShowNextInlineSuggestionAction.ID,
      label: nls.localize2("action.inlineSuggest.showNext", "Show Next Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100,
        primary: 512 | 94
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
  static {
    this.ID = showPreviousInlineSuggestionActionId;
  }
  constructor() {
    super({
      id: ShowPreviousInlineSuggestionAction.ID,
      label: nls.localize2("action.inlineSuggest.showPrevious", "Show Previous Inline Suggestion"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
      kbOpts: {
        weight: 100,
        primary: 512 | 92
      }
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.get(editor);
    controller?.model.get()?.previous();
  }
}
const providerIdSchemaUri = "vscode://schemas/inlineCompletionProviderIdArgs";
function inlineCompletionProviderGetMatcher(provider) {
  const result = [];
  if (provider.providerId) {
    result.push(provider.providerId.toStringWithoutVersion());
    result.push(provider.providerId.extensionId + ":*");
  }
  return result;
}
__name(inlineCompletionProviderGetMatcher, "inlineCompletionProviderGetMatcher");
const argsValidator = vUnion(vObj({
  showNoResultNotification: vOptionalProp(vBoolean()),
  providerId: vOptionalProp(vWithJsonSchemaRef(providerIdSchemaUri, vString())),
  explicit: vOptionalProp(vBoolean()),
  changeHintData: vOptionalProp(vUnchecked())
}), vUndefined());
class TriggerInlineSuggestionAction extends EditorAction {
  static {
    __name(this, "TriggerInlineSuggestionAction");
  }
  constructor() {
    super({
      id: "editor.action.inlineSuggest.trigger",
      label: nls.localize2("action.inlineSuggest.trigger", "Trigger Inline Suggestion"),
      precondition: EditorContextKeys.writable,
      metadata: {
        description: nls.localize("inlineSuggest.trigger.description", "Triggers an inline suggestion in the editor."),
        args: [{
          name: "args",
          description: nls.localize("inlineSuggest.trigger.args", "Options for triggering inline suggestions."),
          isOptional: true,
          schema: argsValidator.getJSONSchema()
        }]
      }
    });
  }
  async run(accessor, editor, args) {
    const notificationService = accessor.get(INotificationService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const controller = InlineCompletionsController.get(editor);
    const validatedArgs = argsValidator.validateOrThrow(args);
    const provider = validatedArgs?.providerId ? languageFeaturesService.inlineCompletionsProvider.all(editor.getModel()).find((p) => inlineCompletionProviderGetMatcher(p).some((m) => m === validatedArgs.providerId)) : void 0;
    await asyncTransaction(async (tx) => {
      await controller?.model.get()?.trigger(tx, {
        provider,
        explicit: validatedArgs?.explicit ?? true,
        changeHint: validatedArgs?.changeHintData ? { data: validatedArgs.changeHintData } : void 0
      });
      controller?.playAccessibilitySignal(tx);
    });
    if (validatedArgs?.showNoResultNotification) {
      if (!controller?.model.get()?.state.get()) {
        notificationService.notify({
          severity: Severity.Info,
          message: nls.localize("noInlineSuggestionAvailable", "No inline suggestion is available.")
        });
      }
    }
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
        weight: 100 + 1,
        primary: 2048 | 17,
        kbExpr: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.cursorBeforeGhostText, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate())
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
        weight: 100 + 1
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
          primary: 2,
          weight: 200,
          kbExpr: ContextKeyExpr.or(ContextKeyExpr.and(InlineCompletionContextKeys.inlineSuggestionVisible, EditorContextKeys.tabMovesFocus.toNegated(), SuggestContext.Visible.toNegated(), EditorContextKeys.hoverFocused.toNegated(), InlineCompletionContextKeys.hasSelection.toNegated(), InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize), ContextKeyExpr.and(InlineCompletionContextKeys.inlineEditVisible, EditorContextKeys.tabMovesFocus.toNegated(), SuggestContext.Visible.toNegated(), EditorContextKeys.hoverFocused.toNegated(), InlineCompletionContextKeys.tabShouldAcceptInlineEdit))
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
  primary: 2,
  when: ContextKeyExpr.and(InlineCompletionContextKeys.inInlineEditsPreviewEditor)
});
class AcceptInlineCompletionAlternativeAction extends EditorAction {
  static {
    __name(this, "AcceptInlineCompletionAlternativeAction");
  }
  constructor() {
    super({
      id: inlineSuggestCommitAlternativeActionId,
      label: nls.localize2("action.inlineSuggest.acceptAlternativeAction", "Accept Inline Suggestion Alternative Action"),
      precondition: ContextKeyExpr.and(InlineCompletionContextKeys.inlineSuggestionAlternativeActionVisible, InlineCompletionContextKeys.inlineEditVisible),
      menuOpts: [],
      kbOpts: [
        {
          primary: 1024 | 2,
          weight: 203
        }
      ]
    });
  }
  async run(accessor, editor) {
    const controller = InlineCompletionsController.getInFocusedEditorOrParent(accessor);
    if (controller) {
      controller.model.get()?.accept(controller.editor, true);
      controller.editor.focus();
    }
  }
}
KeybindingsRegistry.registerKeybindingRule({
  id: inlineSuggestCommitAlternativeActionId,
  weight: 203,
  primary: 1024 | 2,
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
        primary: 2,
        weight: 201,
        kbExpr: ContextKeyExpr.and(InlineCompletionContextKeys.inlineEditVisible, EditorContextKeys.tabMovesFocus.toNegated(), SuggestContext.Visible.toNegated(), EditorContextKeys.hoverFocused.toNegated(), InlineCompletionContextKeys.tabShouldJumpToInlineEdit)
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
  static {
    this.ID = hideInlineCompletionId;
  }
  constructor() {
    super({
      id: HideInlineCompletion.ID,
      label: nls.localize2("action.inlineSuggest.hide", "Hide Inline Suggestion"),
      precondition: ContextKeyExpr.or(InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.inlineEditVisible),
      kbOpts: {
        weight: 100 + 90,
        // same as hiding the suggest widget
        primary: 9
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
  static {
    this.ID = toggleShowCollapsedId;
  }
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
  primary: 9,
  secondary: [
    1024 | 9
    /* KeyCode.Escape */
  ],
  when: ContextKeyExpr.and(InlineCompletionContextKeys.inInlineEditsPreviewEditor)
});
class ToggleAlwaysShowInlineSuggestionToolbar extends Action2 {
  static {
    __name(this, "ToggleAlwaysShowInlineSuggestionToolbar");
  }
  static {
    this.ID = "editor.action.inlineSuggest.toggleAlwaysShowToolbar";
  }
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
      precondition: ContextKeyExpr.or(InlineCompletionContextKeys.inlineEditVisible, InlineCompletionContextKeys.inlineSuggestionVisible)
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
  AcceptInlineCompletionAlternativeAction,
  AcceptNextLineOfInlineCompletion,
  AcceptNextWordOfInlineCompletion,
  DevExtractReproSample,
  HideInlineCompletion,
  JumpToNextInlineEdit,
  ShowNextInlineSuggestionAction,
  ShowPreviousInlineSuggestionAction,
  ToggleAlwaysShowInlineSuggestionToolbar,
  ToggleInlineCompletionShowCollapsed,
  TriggerInlineSuggestionAction,
  inlineCompletionProviderGetMatcher,
  providerIdSchemaUri
};
//# sourceMappingURL=commands.js.map
