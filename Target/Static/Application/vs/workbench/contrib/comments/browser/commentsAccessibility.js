var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ctxCommentEditorFocused } from "./simpleCommentEditor.js";
import { CommentContextKeys } from "../common/commentContextKeys.js";
import * as nls from "../../../../nls.js";
import { ToggleTabFocusModeAction } from "../../../../editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
var CommentAccessibilityHelpNLS;
(function(CommentAccessibilityHelpNLS2) {
  CommentAccessibilityHelpNLS2.intro = nls.localize("intro", "The editor contains commentable range(s). Some useful commands include:");
  CommentAccessibilityHelpNLS2.tabFocus = nls.localize("introWidget", "This widget contains a text area, for composition of new comments, and actions, that can be tabbed to once tab moves focus mode has been enabled with the command Toggle Tab Key Moves Focus{0}.", `<keybinding:${ToggleTabFocusModeAction.ID}>`);
  CommentAccessibilityHelpNLS2.commentCommands = nls.localize("commentCommands", "Some useful comment commands include:");
  CommentAccessibilityHelpNLS2.escape = nls.localize("escape", "- Dismiss Comment{0}.", `<keybinding:${"workbench.action.hideComment"}>`);
  CommentAccessibilityHelpNLS2.nextRange = nls.localize("next", "- Go to Next Commenting Range{0}.", `<keybinding:${"editor.action.nextCommentingRange"}>`);
  CommentAccessibilityHelpNLS2.previousRange = nls.localize("previous", "- Go to Previous Commenting Range{0}.", `<keybinding:${"editor.action.previousCommentingRange"}>`);
  CommentAccessibilityHelpNLS2.nextCommentThread = nls.localize("nextCommentThreadKb", "- Go to Next Comment Thread{0}.", `<keybinding:${"editor.action.nextCommentThreadAction"}>`);
  CommentAccessibilityHelpNLS2.previousCommentThread = nls.localize("previousCommentThreadKb", "- Go to Previous Comment Thread{0}.", `<keybinding:${"editor.action.previousCommentThreadAction"}>`);
  CommentAccessibilityHelpNLS2.nextCommentedRange = nls.localize("nextCommentedRangeKb", "- Go to Next Commented Range{0}.", `<keybinding:${"editor.action.nextCommentedRangeAction"}>`);
  CommentAccessibilityHelpNLS2.previousCommentedRange = nls.localize("previousCommentedRangeKb", "- Go to Previous Commented Range{0}.", `<keybinding:${"editor.action.previousCommentedRangeAction"}>`);
  CommentAccessibilityHelpNLS2.addComment = nls.localize("addCommentNoKb", "- Add Comment on Current Selection{0}.", `<keybinding:${"workbench.action.addComment"}>`);
  CommentAccessibilityHelpNLS2.submitComment = nls.localize("submitComment", "- Submit Comment{0}.", `<keybinding:${"editor.action.submitComment"}>`);
})(CommentAccessibilityHelpNLS || (CommentAccessibilityHelpNLS = {}));
class CommentsAccessibilityHelpProvider extends Disposable {
  static {
    __name(this, "CommentsAccessibilityHelpProvider");
  }
  constructor() {
    super(...arguments);
    this.id = "comments";
    this.verbositySettingKey = "accessibility.verbosity.comments";
    this.options = {
      type: "help"
      /* AccessibleViewType.Help */
    };
  }
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
  constructor() {
    this.priority = 110;
    this.name = "comments";
    this.type = "help";
    this.when = ContextKeyExpr.or(ctxCommentEditorFocused, CommentContextKeys.commentFocused);
  }
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
