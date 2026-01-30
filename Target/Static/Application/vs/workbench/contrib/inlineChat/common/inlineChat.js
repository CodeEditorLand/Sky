import { localize } from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { Extensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { ContextKeyExpr, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { diffInserted, diffRemoved, editorWidgetBackground, editorWidgetBorder, editorWidgetForeground, focusBorder, inputBackground, inputPlaceholderForeground, registerColor, transparent, widgetShadow } from "../../../../platform/theme/common/colorRegistry.js";
import { NOTEBOOK_IS_ACTIVE_EDITOR } from "../../notebook/common/notebookContextKeys.js";
var InlineChatConfigKeys;
(function(InlineChatConfigKeys2) {
  InlineChatConfigKeys2["FinishOnType"] = "inlineChat.finishOnType";
  InlineChatConfigKeys2["StartWithOverlayWidget"] = "inlineChat.startWithOverlayWidget";
  InlineChatConfigKeys2["HoldToSpeech"] = "inlineChat.holdToSpeech";
  InlineChatConfigKeys2["EnableV2"] = "inlineChat.enableV2";
  InlineChatConfigKeys2["notebookAgent"] = "inlineChat.notebookAgent";
  InlineChatConfigKeys2["PersistModelChoice"] = "inlineChat.persistModelChoice";
})(InlineChatConfigKeys || (InlineChatConfigKeys = {}));
Registry.as(Extensions.Configuration).registerConfiguration({
  id: "editor",
  properties: {
    [
      "inlineChat.finishOnType"
      /* InlineChatConfigKeys.FinishOnType */
    ]: {
      description: localize("finishOnType", "Whether to finish an inline chat session when typing outside of changed regions."),
      default: false,
      type: "boolean"
    },
    [
      "inlineChat.holdToSpeech"
      /* InlineChatConfigKeys.HoldToSpeech */
    ]: {
      description: localize("holdToSpeech", "Whether holding the inline chat keybinding will automatically enable speech recognition."),
      default: true,
      type: "boolean"
    },
    [
      "inlineChat.enableV2"
      /* InlineChatConfigKeys.EnableV2 */
    ]: {
      description: localize("enableV2", "Whether to use the next version of inline chat."),
      default: false,
      type: "boolean",
      tags: ["preview"],
      experiment: {
        mode: "auto"
      }
    },
    [
      "inlineChat.notebookAgent"
      /* InlineChatConfigKeys.notebookAgent */
    ]: {
      markdownDescription: localize("notebookAgent", "Enable agent-like behavior for inline chat widget in notebooks."),
      default: false,
      type: "boolean",
      tags: ["experimental"],
      experiment: {
        mode: "startup"
      }
    },
    [
      "inlineChat.persistModelChoice"
      /* InlineChatConfigKeys.PersistModelChoice */
    ]: {
      description: localize("persistModelChoice", "Whether to persist the selected language model choice across inline chat sessions. The default is not to persist and to use the vendor's default model for inline chat because that yields the best experience."),
      default: false,
      type: "boolean",
      experiment: {
        mode: "auto"
      }
    }
  }
});
const INLINE_CHAT_ID = "interactiveEditor";
const INTERACTIVE_EDITOR_ACCESSIBILITY_HELP_ID = "interactiveEditorAccessiblityHelp";
var InlineChatResponseType;
(function(InlineChatResponseType2) {
  InlineChatResponseType2["None"] = "none";
  InlineChatResponseType2["Messages"] = "messages";
  InlineChatResponseType2["MessagesAndEdits"] = "messagesAndEdits";
})(InlineChatResponseType || (InlineChatResponseType = {}));
const CTX_INLINE_CHAT_POSSIBLE = new RawContextKey("inlineChatPossible", false, localize("inlineChatHasPossible", "Whether a provider for inline chat exists and whether an editor for inline chat is open"));
const CTX_INLINE_CHAT_HAS_AGENT2 = new RawContextKey("inlineChatHasEditsAgent", false, localize("inlineChatHasEditsAgent", "Whether an agent for inline for interactive editors exists"));
const CTX_INLINE_CHAT_HAS_NOTEBOOK_INLINE = new RawContextKey("inlineChatHasNotebookInline", false, localize("inlineChatHasNotebookInline", "Whether an agent for notebook cells exists"));
const CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT = new RawContextKey("inlineChatHasNotebookAgent", false, localize("inlineChatHasNotebookAgent", "Whether an agent for notebook cells exists"));
const CTX_INLINE_CHAT_VISIBLE = new RawContextKey("inlineChatVisible", false, localize("inlineChatVisible", "Whether the interactive editor input is visible"));
const CTX_INLINE_CHAT_FOCUSED = new RawContextKey("inlineChatFocused", false, localize("inlineChatFocused", "Whether the interactive editor input is focused"));
const CTX_INLINE_CHAT_EDITING = new RawContextKey("inlineChatEditing", true, localize("inlineChatEditing", "Whether the user is currently editing or generating code in the inline chat"));
const CTX_INLINE_CHAT_RESPONSE_FOCUSED = new RawContextKey("inlineChatResponseFocused", false, localize("inlineChatResponseFocused", "Whether the interactive widget's response is focused"));
const CTX_INLINE_CHAT_EMPTY = new RawContextKey("inlineChatEmpty", false, localize("inlineChatEmpty", "Whether the interactive editor input is empty"));
const CTX_INLINE_CHAT_INNER_CURSOR_FIRST = new RawContextKey("inlineChatInnerCursorFirst", false, localize("inlineChatInnerCursorFirst", "Whether the cursor of the iteractive editor input is on the first line"));
const CTX_INLINE_CHAT_INNER_CURSOR_LAST = new RawContextKey("inlineChatInnerCursorLast", false, localize("inlineChatInnerCursorLast", "Whether the cursor of the iteractive editor input is on the last line"));
const CTX_INLINE_CHAT_OUTER_CURSOR_POSITION = new RawContextKey("inlineChatOuterCursorPosition", "", localize("inlineChatOuterCursorPosition", "Whether the cursor of the outer editor is above or below the interactive editor input"));
const CTX_INLINE_CHAT_HAS_STASHED_SESSION = new RawContextKey("inlineChatHasStashedSession", false, localize("inlineChatHasStashedSession", "Whether interactive editor has kept a session for quick restore"));
const CTX_INLINE_CHAT_CHANGE_HAS_DIFF = new RawContextKey("inlineChatChangeHasDiff", false, localize("inlineChatChangeHasDiff", "Whether the current change supports showing a diff"));
const CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF = new RawContextKey("inlineChatChangeShowsDiff", false, localize("inlineChatChangeShowsDiff", "Whether the current change showing a diff"));
const CTX_INLINE_CHAT_REQUEST_IN_PROGRESS = new RawContextKey("inlineChatRequestInProgress", false, localize("inlineChatRequestInProgress", "Whether an inline chat request is currently in progress"));
const CTX_INLINE_CHAT_RESPONSE_TYPE = new RawContextKey("inlineChatResponseType", "none", localize("inlineChatResponseTypes", "What type was the responses have been receieved, nothing yet, just messages, or messaged and local edits"));
const CTX_INLINE_CHAT_V1_ENABLED = ContextKeyExpr.or(ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, CTX_INLINE_CHAT_HAS_NOTEBOOK_INLINE));
const CTX_INLINE_CHAT_V2_ENABLED = ContextKeyExpr.or(CTX_INLINE_CHAT_HAS_AGENT2, ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT));
const ACTION_START = "inlineChat.start";
const ACTION_ACCEPT_CHANGES = "inlineChat.acceptChanges";
const ACTION_DISCARD_CHANGES = "inlineChat.discardHunkChange";
const ACTION_REGENERATE_RESPONSE = "inlineChat.regenerate";
const ACTION_VIEW_IN_CHAT = "inlineChat.viewInChat";
const ACTION_TOGGLE_DIFF = "inlineChat.toggleDiff";
const ACTION_REPORT_ISSUE = "inlineChat.reportIssue";
const MENU_INLINE_CHAT_WIDGET_STATUS = MenuId.for("inlineChatWidget.status");
const MENU_INLINE_CHAT_WIDGET_SECONDARY = MenuId.for("inlineChatWidget.secondary");
const MENU_INLINE_CHAT_ZONE = MenuId.for("inlineChatWidget.changesZone");
const MENU_INLINE_CHAT_SIDE = MenuId.for("inlineChatWidget.side");
const inlineChatForeground = registerColor("inlineChat.foreground", editorWidgetForeground, localize("inlineChat.foreground", "Foreground color of the interactive editor widget"));
const inlineChatBackground = registerColor("inlineChat.background", editorWidgetBackground, localize("inlineChat.background", "Background color of the interactive editor widget"));
const inlineChatBorder = registerColor("inlineChat.border", editorWidgetBorder, localize("inlineChat.border", "Border color of the interactive editor widget"));
const inlineChatShadow = registerColor("inlineChat.shadow", widgetShadow, localize("inlineChat.shadow", "Shadow color of the interactive editor widget"));
const inlineChatInputBorder = registerColor("inlineChatInput.border", editorWidgetBorder, localize("inlineChatInput.border", "Border color of the interactive editor input"));
const inlineChatInputFocusBorder = registerColor("inlineChatInput.focusBorder", focusBorder, localize("inlineChatInput.focusBorder", "Border color of the interactive editor input when focused"));
const inlineChatInputPlaceholderForeground = registerColor("inlineChatInput.placeholderForeground", inputPlaceholderForeground, localize("inlineChatInput.placeholderForeground", "Foreground color of the interactive editor input placeholder"));
const inlineChatInputBackground = registerColor("inlineChatInput.background", inputBackground, localize("inlineChatInput.background", "Background color of the interactive editor input"));
const inlineChatDiffInserted = registerColor("inlineChatDiff.inserted", transparent(diffInserted, 0.5), localize("inlineChatDiff.inserted", "Background color of inserted text in the interactive editor input"));
const overviewRulerInlineChatDiffInserted = registerColor("editorOverviewRuler.inlineChatInserted", { dark: transparent(diffInserted, 0.6), light: transparent(diffInserted, 0.8), hcDark: transparent(diffInserted, 0.6), hcLight: transparent(diffInserted, 0.8) }, localize("editorOverviewRuler.inlineChatInserted", "Overview ruler marker color for inline chat inserted content."));
const minimapInlineChatDiffInserted = registerColor("editorMinimap.inlineChatInserted", { dark: transparent(diffInserted, 0.6), light: transparent(diffInserted, 0.8), hcDark: transparent(diffInserted, 0.6), hcLight: transparent(diffInserted, 0.8) }, localize("editorMinimap.inlineChatInserted", "Minimap marker color for inline chat inserted content."));
const inlineChatDiffRemoved = registerColor("inlineChatDiff.removed", transparent(diffRemoved, 0.5), localize("inlineChatDiff.removed", "Background color of removed text in the interactive editor input"));
const overviewRulerInlineChatDiffRemoved = registerColor("editorOverviewRuler.inlineChatRemoved", { dark: transparent(diffRemoved, 0.6), light: transparent(diffRemoved, 0.8), hcDark: transparent(diffRemoved, 0.6), hcLight: transparent(diffRemoved, 0.8) }, localize("editorOverviewRuler.inlineChatRemoved", "Overview ruler marker color for inline chat removed content."));
export {
  ACTION_ACCEPT_CHANGES,
  ACTION_DISCARD_CHANGES,
  ACTION_REGENERATE_RESPONSE,
  ACTION_REPORT_ISSUE,
  ACTION_START,
  ACTION_TOGGLE_DIFF,
  ACTION_VIEW_IN_CHAT,
  CTX_INLINE_CHAT_CHANGE_HAS_DIFF,
  CTX_INLINE_CHAT_CHANGE_SHOWS_DIFF,
  CTX_INLINE_CHAT_EDITING,
  CTX_INLINE_CHAT_EMPTY,
  CTX_INLINE_CHAT_FOCUSED,
  CTX_INLINE_CHAT_HAS_AGENT2,
  CTX_INLINE_CHAT_HAS_NOTEBOOK_AGENT,
  CTX_INLINE_CHAT_HAS_NOTEBOOK_INLINE,
  CTX_INLINE_CHAT_HAS_STASHED_SESSION,
  CTX_INLINE_CHAT_INNER_CURSOR_FIRST,
  CTX_INLINE_CHAT_INNER_CURSOR_LAST,
  CTX_INLINE_CHAT_OUTER_CURSOR_POSITION,
  CTX_INLINE_CHAT_POSSIBLE,
  CTX_INLINE_CHAT_REQUEST_IN_PROGRESS,
  CTX_INLINE_CHAT_RESPONSE_FOCUSED,
  CTX_INLINE_CHAT_RESPONSE_TYPE,
  CTX_INLINE_CHAT_V1_ENABLED,
  CTX_INLINE_CHAT_V2_ENABLED,
  CTX_INLINE_CHAT_VISIBLE,
  INLINE_CHAT_ID,
  INTERACTIVE_EDITOR_ACCESSIBILITY_HELP_ID,
  InlineChatConfigKeys,
  InlineChatResponseType,
  MENU_INLINE_CHAT_SIDE,
  MENU_INLINE_CHAT_WIDGET_SECONDARY,
  MENU_INLINE_CHAT_WIDGET_STATUS,
  MENU_INLINE_CHAT_ZONE,
  inlineChatBackground,
  inlineChatBorder,
  inlineChatDiffInserted,
  inlineChatDiffRemoved,
  inlineChatForeground,
  inlineChatInputBackground,
  inlineChatInputBorder,
  inlineChatInputFocusBorder,
  inlineChatInputPlaceholderForeground,
  inlineChatShadow,
  minimapInlineChatDiffInserted,
  overviewRulerInlineChatDiffInserted,
  overviewRulerInlineChatDiffRemoved
};
//# sourceMappingURL=inlineChat.js.map
