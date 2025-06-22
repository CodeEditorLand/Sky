var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { COMMENTS_VIEW_ID, CommentsMenus } from "./commentsTreeViewer.js";
import { CONTEXT_KEY_COMMENT_FOCUSED } from "./commentsView.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { ICommentService } from "./commentService.js";
import { CommentContextKeys } from "../common/commentContextKeys.js";
import { moveToNextCommentInThread as findNextCommentInThread, revealCommentThread } from "./commentsController.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { isCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { URI } from "../../../../base/common/uri.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
class CommentsAccessibleView extends Disposable {
  static {
    __name(this, "CommentsAccessibleView");
  }
  getProvider(accessor) {
    const contextKeyService = accessor.get(IContextKeyService);
    const viewsService = accessor.get(IViewsService);
    const menuService = accessor.get(IMenuService);
    const commentsView = viewsService.getActiveViewWithId(COMMENTS_VIEW_ID);
    const focusedCommentNode = commentsView?.focusedCommentNode;
    if (!commentsView || !focusedCommentNode) {
      return;
    }
    const menus = this._register(new CommentsMenus(menuService));
    menus.setContextKeyService(contextKeyService);
    return new CommentsAccessibleContentProvider(commentsView, focusedCommentNode, menus);
  }
  constructor() {
    super();
    this.priority = 90;
    this.name = "comment";
    this.when = CONTEXT_KEY_COMMENT_FOCUSED;
    this.type = "view";
  }
}
class CommentThreadAccessibleView extends Disposable {
  static {
    __name(this, "CommentThreadAccessibleView");
  }
  getProvider(accessor) {
    const commentService = accessor.get(ICommentService);
    const editorService = accessor.get(IEditorService);
    const uriIdentityService = accessor.get(IUriIdentityService);
    const threads = commentService.commentsModel.hasCommentThreads();
    if (!threads) {
      return;
    }
    return new CommentsThreadWidgetAccessibleContentProvider(commentService, editorService, uriIdentityService);
  }
  constructor() {
    super();
    this.priority = 85;
    this.name = "commentThread";
    this.when = CommentContextKeys.commentFocused;
    this.type = "view";
  }
}
class CommentsAccessibleContentProvider extends Disposable {
  static {
    __name(this, "CommentsAccessibleContentProvider");
  }
  constructor(_commentsView, _focusedCommentNode, _menus) {
    super();
    this._commentsView = _commentsView;
    this._focusedCommentNode = _focusedCommentNode;
    this._menus = _menus;
    this.id = "comments";
    this.verbositySettingKey = "accessibility.verbosity.comments";
    this.options = {
      type: "view"
      /* AccessibleViewType.View */
    };
    this.actions = [...this._menus.getResourceContextActions(this._focusedCommentNode)].filter((i) => i.enabled).map((action) => {
      return {
        ...action,
        run: /* @__PURE__ */ __name(() => {
          this._commentsView.focus();
          action.run({
            thread: this._focusedCommentNode.thread,
            $mid: 7,
            commentControlHandle: this._focusedCommentNode.controllerHandle,
            commentThreadHandle: this._focusedCommentNode.threadHandle
          });
        }, "run")
      };
    });
  }
  provideContent() {
    const commentNode = this._commentsView.focusedCommentNode;
    const content = this._commentsView.focusedCommentInfo?.toString();
    if (!commentNode || !content) {
      throw new Error("Comment tree is focused but no comment is selected");
    }
    return content;
  }
  onClose() {
    this._commentsView.focus();
  }
  provideNextContent() {
    this._commentsView.focusNextNode();
    return this.provideContent();
  }
  providePreviousContent() {
    this._commentsView.focusPreviousNode();
    return this.provideContent();
  }
}
let CommentsThreadWidgetAccessibleContentProvider = class CommentsThreadWidgetAccessibleContentProvider2 extends Disposable {
  static {
    __name(this, "CommentsThreadWidgetAccessibleContentProvider");
  }
  constructor(_commentService, _editorService, _uriIdentityService) {
    super();
    this._commentService = _commentService;
    this._editorService = _editorService;
    this._uriIdentityService = _uriIdentityService;
    this.id = "commentThread";
    this.verbositySettingKey = "accessibility.verbosity.comments";
    this.options = {
      type: "view"
      /* AccessibleViewType.View */
    };
  }
  get activeCommentInfo() {
    if (!this._activeCommentInfo && this._commentService.lastActiveCommentcontroller) {
      this._activeCommentInfo = this._commentService.lastActiveCommentcontroller.activeComment;
    }
    return this._activeCommentInfo;
  }
  provideContent() {
    if (!this.activeCommentInfo) {
      throw new Error("No current comment thread");
    }
    const comment = this.activeCommentInfo.comment?.body;
    const commentLabel = typeof comment === "string" ? comment : comment?.value ?? "";
    const resource = this.activeCommentInfo.thread.resource;
    const range = this.activeCommentInfo.thread.range;
    let contentLabel = "";
    if (resource && range) {
      const editor = this._editorService.findEditors(URI.parse(resource)) || [];
      const codeEditor = this._editorService.activeEditorPane?.getControl();
      if (editor?.length && isCodeEditor(codeEditor)) {
        const content = codeEditor.getModel()?.getValueInRange(range);
        if (content) {
          contentLabel = "\nCorresponding code: \n" + content;
        }
      }
    }
    return commentLabel + contentLabel;
  }
  onClose() {
    const lastComment = this._activeCommentInfo;
    this._activeCommentInfo = void 0;
    if (lastComment) {
      revealCommentThread(this._commentService, this._editorService, this._uriIdentityService, lastComment.thread, lastComment.comment);
    }
  }
  provideNextContent() {
    const newCommentInfo = findNextCommentInThread(this._activeCommentInfo, "next");
    if (newCommentInfo) {
      this._activeCommentInfo = newCommentInfo;
      return this.provideContent();
    }
    return void 0;
  }
  providePreviousContent() {
    const newCommentInfo = findNextCommentInThread(this._activeCommentInfo, "previous");
    if (newCommentInfo) {
      this._activeCommentInfo = newCommentInfo;
      return this.provideContent();
    }
    return void 0;
  }
};
CommentsThreadWidgetAccessibleContentProvider = __decorate([
  __param(0, ICommentService),
  __param(1, IEditorService),
  __param(2, IUriIdentityService)
], CommentsThreadWidgetAccessibleContentProvider);
export {
  CommentThreadAccessibleView,
  CommentsAccessibleView
};
//# sourceMappingURL=commentsAccessibleView.js.map
