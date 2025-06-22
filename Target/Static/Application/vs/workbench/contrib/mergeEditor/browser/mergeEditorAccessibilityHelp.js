var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { localize } from "../../../../nls.js";
import { AccessibleContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import { ContextKeyEqualsExpr } from "../../../../platform/contextkey/common/contextkey.js";
class MergeEditorAccessibilityHelpProvider {
  static {
    __name(this, "MergeEditorAccessibilityHelpProvider");
  }
  constructor() {
    this.name = "mergeEditor";
    this.type = "help";
    this.priority = 125;
    this.when = ContextKeyEqualsExpr.create("isMergeEditor", true);
  }
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!codeEditor) {
      return;
    }
    const content = [
      localize("msg1", "You are in a merge editor."),
      localize("msg2", "Navigate between merge conflicts using the commands Go to Next Unhandled Conflict{0} and Go to Previous Unhandled Conflict{1}.", "<keybinding:merge.goToNextUnhandledConflict>", "<keybinding:merge.goToPreviousUnhandledConflict>"),
      localize("msg3", "Run the command Merge Editor: Accept All Incoming Changes from the Left{0} and Merge Editor: Accept All Current Changes from the Right{1}", "<keybinding:merge.acceptAllInput1>", "<keybinding:merge.acceptAllInput2>"),
      localize("msg4", "Complete the Merge{0}.", "<keybinding:mergeEditor.acceptMerge>"),
      localize("msg5", "Toggle between merge editor inputs, incoming and current changes {0}.", "<keybinding:mergeEditor.toggleBetweenInputs>")
    ];
    return new AccessibleContentProvider(
      "mergeEditor",
      {
        type: "help"
        /* AccessibleViewType.Help */
      },
      () => content.join("\n"),
      () => codeEditor.focus(),
      "accessibility.verbosity.mergeEditor"
      /* AccessibilityVerbositySettingId.MergeEditor */
    );
  }
}
export {
  MergeEditorAccessibilityHelpProvider
};
//# sourceMappingURL=mergeEditorAccessibilityHelp.js.map
