var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ctxCommentEditorFocused } from "./simpleCommentEditor.js";
import { CommentContextKeys } from "../common/commentContextKeys.js";
import * as nls from "../../../../nls.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { CommentCommandId } from "../common/commentCommandIds.js";
import { ToggleTabFocusModeAction } from "../../../../editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js";
import { IAccessibleViewContentProvider, AccessibleViewProviderId, IAccessibleViewOptions, AccessibleViewType } from "../../../../platform/accessibility/browser/accessibleView.js";
import { IAccessibleViewImplementation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
var CommentAccessibilityHelpNLS;
((CommentAccessibilityHelpNLS2) => {
  CommentAccessibilityHelpNLS2.intro = nls.localize("intro", "The editor contains commentable range(s). Some useful commands include:");
  CommentAccessibilityHelpNLS2.tabFocus = nls.localize("introWidget", "This widget contains a text area, for composition of new comments, and actions, that can be tabbed to once tab moves focus mode has been enabled with the command Toggle Tab Key Moves Focus{0}.", `<keybinding:${ToggleTabFocusModeAction.ID}>`);
  CommentAccessibilityHelpNLS2.commentCommands = nls.localize("commentCommands", "Some useful comment commands include:");
  CommentAccessibilityHelpNLS2.escape = nls.localize("escape", "- Dismiss Comment (Escape)");
  CommentAccessibilityHelpNLS2.nextRange = nls.localize("next", "- Go to Next Commenting Range{0}.", `<keybinding:${CommentCommandId.NextRange}>`);
  CommentAccessibilityHelpNLS2.previousRange = nls.localize("previous", "- Go to Previous Commenting Range{0}.", `<keybinding:${CommentCommandId.PreviousRange}>`);
  CommentAccessibilityHelpNLS2.nextCommentThread = nls.localize("nextCommentThreadKb", "- Go to Next Comment Thread{0}.", `<keybinding:${CommentCommandId.NextThread}>`);
  CommentAccessibilityHelpNLS2.previousCommentThread = nls.localize("previousCommentThreadKb", "- Go to Previous Comment Thread{0}.", `<keybinding:${CommentCommandId.PreviousThread}>`);
  CommentAccessibilityHelpNLS2.nextCommentedRange = nls.localize("nextCommentedRangeKb", "- Go to Next Commented Range{0}.", `<keybinding:${CommentCommandId.NextCommentedRange}>`);
  CommentAccessibilityHelpNLS2.previousCommentedRange = nls.localize("previousCommentedRangeKb", "- Go to Previous Commented Range{0}.", `<keybinding:${CommentCommandId.PreviousCommentedRange}>`);
  CommentAccessibilityHelpNLS2.addComment = nls.localize("addCommentNoKb", "- Add Comment on Current Selection{0}.", `<keybinding:${CommentCommandId.Add}>`);
  CommentAccessibilityHelpNLS2.submitComment = nls.localize("submitComment", "- Submit Comment{0}.", `<keybinding:${CommentCommandId.Submit}>`);
})(CommentAccessibilityHelpNLS || (CommentAccessibilityHelpNLS = {}));
class CommentsAccessibilityHelpProvider extends Disposable {
  static {
    __name(this, "CommentsAccessibilityHelpProvider");
  }
  id = AccessibleViewProviderId.Comments;
  verbositySettingKey = AccessibilityVerbositySettingId.Comments;
  options = { type: AccessibleViewType.Help };
  _element;
  provideContent() {
    return [CommentAccessibilityHelpNLS.tabFocus, CommentAccessibilityHelpNLS.commentCommands, CommentAccessibilityHelpNLS.escape, CommentAccessibilityHelpNLS.addComment, CommentAccessibilityHelpNLS.submitComment, CommentAccessibilityHelpNLS.nextRange, CommentAccessibilityHelpNLS.previousRange].join("\n");
  }
  onClose() {
    this._element?.focus();
  }
}
class CommentsAccessibilityHelp {
  static {
    __name(this, "CommentsAccessibilityHelp");
  }
  priority = 110;
  name = "comments";
  type = AccessibleViewType.Help;
  when = ContextKeyExpr.or(ctxCommentEditorFocused, CommentContextKeys.commentFocused);
  getProvider(accessor) {
    return accessor.get(IInstantiationService).createInstance(CommentsAccessibilityHelpProvider);
  }
}
export {
  CommentAccessibilityHelpNLS,
  CommentsAccessibilityHelp,
  CommentsAccessibilityHelpProvider
};
//# sourceMappingURL=commentsAccessibility.js.map
