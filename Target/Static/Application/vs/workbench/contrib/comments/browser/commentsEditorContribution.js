var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyChord } from "../../../../base/common/keyCodes.js";
import "./media/review.css";
import { isCodeEditor, isDiffEditor } from "../../../../editor/browser/editorBrowser.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import * as nls from "../../../../nls.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ICommentService } from "./commentService.js";
import { ctxCommentEditorFocused, SimpleCommentEditor } from "./simpleCommentEditor.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { CommentController, ID } from "./commentsController.js";
import { Range } from "../../../../editor/common/core/range.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { CommentContextKeys } from "../common/commentContextKeys.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../platform/accessibility/common/accessibility.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { accessibilityHelpIsShown, accessibleViewCurrentProviderId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { CommentsInputContentProvider } from "./commentsInputContentProvider.js";
import { CommentWidgetFocus } from "./commentThreadZoneWidget.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { CommentThreadCollapsibleState, CommentThreadState } from "../../../../editor/common/languages.js";
registerEditorContribution(
  ID,
  CommentController,
  1
  /* EditorContributionInstantiation.AfterFirstRender */
);
registerWorkbenchContribution2(
  CommentsInputContentProvider.ID,
  CommentsInputContentProvider,
  2
  /* WorkbenchPhase.BlockRestore */
);
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "editor.action.nextCommentThreadAction",
  handler: /* @__PURE__ */ __name(async (accessor, args) => {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return Promise.resolve();
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return Promise.resolve();
    }
    controller.nextCommentThread(true);
  }, "handler"),
  weight: 100,
  primary: 512 | 67
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "editor.action.previousCommentThreadAction",
  handler: /* @__PURE__ */ __name(async (accessor, args) => {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return Promise.resolve();
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return Promise.resolve();
    }
    controller.previousCommentThread(true);
  }, "handler"),
  weight: 100,
  primary: 1024 | 512 | 67
  /* KeyCode.F9 */
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "editor.action.nextCommentedRangeAction",
      title: {
        value: nls.localize("comments.NextCommentedRange", "Go to Next Commented Range"),
        original: "Go to Next Commented Range"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }],
      keybinding: {
        primary: 512 | 68,
        weight: 100,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }
    });
  }
  run(accessor, ...args) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    controller.nextCommentThread(false);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "editor.action.previousCommentedRangeAction",
      title: {
        value: nls.localize("comments.previousCommentedRange", "Go to Previous Commented Range"),
        original: "Go to Previous Commented Range"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }],
      keybinding: {
        primary: 1024 | 512 | 68,
        weight: 100,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }
    });
  }
  run(accessor, ...args) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    controller.previousCommentThread(false);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "editor.action.nextCommentingRange",
      title: {
        value: nls.localize("comments.nextCommentingRange", "Go to Next Commenting Range"),
        original: "Go to Next Commenting Range"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }],
      keybinding: {
        primary: KeyChord(
          2048 | 41,
          2048 | 512 | 18
          /* KeyCode.DownArrow */
        ),
        weight: 100,
        when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(EditorContextKeys.focus, CommentContextKeys.commentFocused, ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewCurrentProviderId.isEqualTo(
          "comments"
          /* AccessibleViewProviderId.Comments */
        ))))
      }
    });
  }
  run(accessor, args) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    controller.nextCommentingRange();
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "editor.action.previousCommentingRange",
      title: {
        value: nls.localize("comments.previousCommentingRange", "Go to Previous Commenting Range"),
        original: "Go to Previous Commenting Range"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeEditorHasCommentingRange
      }],
      keybinding: {
        primary: KeyChord(
          2048 | 41,
          2048 | 512 | 16
          /* KeyCode.UpArrow */
        ),
        weight: 100,
        when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(EditorContextKeys.focus, CommentContextKeys.commentFocused, ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewCurrentProviderId.isEqualTo(
          "comments"
          /* AccessibleViewProviderId.Comments */
        ))))
      }
    });
  }
  async run(accessor, ...args) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    controller.previousCommentingRange();
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleCommenting",
      title: {
        value: nls.localize("comments.toggleCommenting", "Toggle Editor Commenting"),
        original: "Toggle Editor Commenting"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.WorkspaceHasCommenting
      }]
    });
  }
  run(accessor, ...args) {
    const commentService = accessor.get(ICommentService);
    const enable = commentService.isCommentingEnabled;
    commentService.enableCommenting(!enable);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.addComment",
      title: {
        value: nls.localize("comments.addCommand", "Add Comment on Current Selection"),
        original: "Add Comment on Current Selection"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.activeCursorHasCommentingRange
      }],
      keybinding: {
        primary: KeyChord(
          2048 | 41,
          2048 | 512 | 33
          /* KeyCode.KeyC */
        ),
        weight: 100,
        when: CommentContextKeys.activeCursorHasCommentingRange
      }
    });
  }
  async run(accessor, args) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    const position = args?.range ? new Range(args.range.startLineNumber, args.range.startLineNumber, args.range.endLineNumber, args.range.endColumn) : args?.fileComment ? void 0 : activeEditor.getSelection();
    await controller.addOrToggleCommentAtLine(position, void 0);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.focusCommentOnCurrentLine",
      title: {
        value: nls.localize("comments.focusCommentOnCurrentLine", "Focus Comment on Current Line"),
        original: "Focus Comment on Current Line"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      f1: true,
      precondition: CommentContextKeys.activeCursorHasComment
    });
  }
  async run(accessor, ...args) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
      return;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
      return;
    }
    const position = activeEditor.getSelection();
    const notificationService = accessor.get(INotificationService);
    let error = false;
    try {
      const commentAtLine = controller.getCommentsAtLine(position);
      if (commentAtLine.length === 0) {
        error = true;
      } else {
        await controller.revealCommentThread(commentAtLine[0].commentThread.threadId, void 0, false, CommentWidgetFocus.Widget);
      }
    } catch (e) {
      error = true;
    }
    if (error) {
      notificationService.error(nls.localize("comments.focusCommand.error", "The cursor must be on a line with a comment to focus the comment"));
    }
  }
});
function changeAllCollapseState(commentService, newState) {
  for (const resource of commentService.commentsModel.resourceCommentThreads) {
    for (const thread of resource.commentThreads) {
      thread.thread.collapsibleState = newState(thread.thread);
    }
  }
}
__name(changeAllCollapseState, "changeAllCollapseState");
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.collapseAllComments",
      title: {
        value: nls.localize("comments.collapseAll", "Collapse All Comments"),
        original: "Collapse All Comments"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.WorkspaceHasCommenting
      }]
    });
  }
  run(accessor, ...args) {
    const commentService = accessor.get(ICommentService);
    changeAllCollapseState(commentService, () => CommentThreadCollapsibleState.Collapsed);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.expandAllComments",
      title: {
        value: nls.localize("comments.expandAll", "Expand All Comments"),
        original: "Expand All Comments"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.WorkspaceHasCommenting
      }]
    });
  }
  run(accessor, ...args) {
    const commentService = accessor.get(ICommentService);
    changeAllCollapseState(commentService, () => CommentThreadCollapsibleState.Expanded);
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.expandUnresolvedComments",
      title: {
        value: nls.localize("comments.expandUnresolved", "Expand Unresolved Comments"),
        original: "Expand Unresolved Comments"
      },
      category: {
        value: nls.localize("commentsCategory", "Comments"),
        original: "Comments"
      },
      menu: [{
        id: MenuId.CommandPalette,
        when: CommentContextKeys.WorkspaceHasCommenting
      }]
    });
  }
  run(accessor, ...args) {
    const commentService = accessor.get(ICommentService);
    changeAllCollapseState(commentService, (commentThread) => {
      return commentThread.state === CommentThreadState.Unresolved ? CommentThreadCollapsibleState.Expanded : CommentThreadCollapsibleState.Collapsed;
    });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "editor.action.submitComment",
  weight: 100,
  primary: 2048 | 3,
  when: ctxCommentEditorFocused,
  handler: /* @__PURE__ */ __name((accessor, args) => {
    const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (activeCodeEditor instanceof SimpleCommentEditor) {
      activeCodeEditor.getParentThread().submitComment();
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.hideComment",
  weight: 100,
  primary: 9,
  secondary: [
    1024 | 9
    /* KeyCode.Escape */
  ],
  when: ContextKeyExpr.or(ctxCommentEditorFocused, CommentContextKeys.commentFocused),
  handler: /* @__PURE__ */ __name(async (accessor, args) => {
    const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    const keybindingService = accessor.get(IKeybindingService);
    const notificationService = accessor.get(INotificationService);
    const commentService = accessor.get(ICommentService);
    await keybindingService.enableKeybindingHoldMode(
      "workbench.action.hideComment"
      /* CommentCommandId.Hide */
    );
    if (activeCodeEditor instanceof SimpleCommentEditor) {
      activeCodeEditor.getParentThread().collapse();
    } else if (activeCodeEditor) {
      const controller = CommentController.get(activeCodeEditor);
      if (!controller) {
        return;
      }
      let error = false;
      try {
        const activeComment = commentService.lastActiveCommentcontroller?.activeComment;
        if (!activeComment) {
          error = true;
        } else {
          controller.collapseAndFocusRange(activeComment.thread.threadId);
        }
      } catch (e) {
        error = true;
      }
      if (error) {
        notificationService.error(nls.localize("comments.focusCommand.error", "The cursor must be on a line with a comment to focus the comment"));
      }
    }
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.hideComment",
  weight: 100,
  primary: 2048 | 9,
  win: {
    primary: 512 | 1
    /* KeyCode.Backspace */
  },
  when: ContextKeyExpr.and(EditorContextKeys.focus, CommentContextKeys.commentWidgetVisible),
  handler: /* @__PURE__ */ __name(async (accessor, args) => {
    const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    const keybindingService = accessor.get(IKeybindingService);
    await keybindingService.enableKeybindingHoldMode(
      "workbench.action.hideComment"
      /* CommentCommandId.Hide */
    );
    if (activeCodeEditor) {
      const controller = CommentController.get(activeCodeEditor);
      if (controller) {
        await controller.collapseVisibleComments();
      }
    }
  }, "handler")
});
function getActiveEditor(accessor) {
  let activeTextEditorControl = accessor.get(IEditorService).activeTextEditorControl;
  if (isDiffEditor(activeTextEditorControl)) {
    if (activeTextEditorControl.getOriginalEditor().hasTextFocus()) {
      activeTextEditorControl = activeTextEditorControl.getOriginalEditor();
    } else {
      activeTextEditorControl = activeTextEditorControl.getModifiedEditor();
    }
  }
  if (!isCodeEditor(activeTextEditorControl) || !activeTextEditorControl.hasModel()) {
    return null;
  }
  return activeTextEditorControl;
}
__name(getActiveEditor, "getActiveEditor");
export {
  getActiveEditor
};
//# sourceMappingURL=commentsEditorContribution.js.map
