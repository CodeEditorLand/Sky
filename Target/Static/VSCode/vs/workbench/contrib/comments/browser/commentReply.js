var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../base/browser/dom.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from "../../../../base/browser/ui/mouseCursor/mouseCursor.js";
import { IAction } from "../../../../base/common/actions.js";
import { Disposable, IDisposable, dispose } from "../../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IRange } from "../../../../editor/common/core/range.js";
import * as languages from "../../../../editor/common/languages.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { CommentFormActions } from "./commentFormActions.js";
import { CommentMenus } from "./commentMenus.js";
import { ICommentService } from "./commentService.js";
import { CommentContextKeys } from "../common/commentContextKeys.js";
import { ICommentThreadWidget } from "../common/commentThreadWidget.js";
import { ICellRange } from "../../notebook/common/notebookRange.js";
import { LayoutableEditor, MIN_EDITOR_HEIGHT, SimpleCommentEditor, calculateEditorHeight } from "./simpleCommentEditor.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { Position } from "../../../../editor/common/core/position.js";
let INMEM_MODEL_ID = 0;
const COMMENTEDITOR_DECORATION_KEY = "commenteditordecoration";
let CommentReply = class extends Disposable {
  constructor(owner, container, _parentEditor, _commentThread, _scopedInstatiationService, _contextKeyService, _commentMenus, _commentOptions, _pendingComment, _parentThread, focus, _actionRunDelegate, commentService, configurationService, keybindingService, contextMenuService, hoverService, textModelService) {
    super();
    this.owner = owner;
    this._parentEditor = _parentEditor;
    this._commentThread = _commentThread;
    this._scopedInstatiationService = _scopedInstatiationService;
    this._contextKeyService = _contextKeyService;
    this._commentMenus = _commentMenus;
    this._commentOptions = _commentOptions;
    this._pendingComment = _pendingComment;
    this._parentThread = _parentThread;
    this._actionRunDelegate = _actionRunDelegate;
    this.commentService = commentService;
    this.keybindingService = keybindingService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this.textModelService = textModelService;
    this.form = dom.append(container, dom.$(".comment-form"));
    this.commentEditor = this._register(this._scopedInstatiationService.createInstance(SimpleCommentEditor, this.form, SimpleCommentEditor.getEditorOptions(configurationService), _contextKeyService, this._parentThread));
    this.commentEditorIsEmpty = CommentContextKeys.commentIsEmpty.bindTo(this._contextKeyService);
    this.commentEditorIsEmpty.set(!this._pendingComment);
    this.initialize(focus);
  }
  static {
    __name(this, "CommentReply");
  }
  commentEditor;
  form;
  commentEditorIsEmpty;
  _error;
  _formActions;
  _editorActions;
  _commentThreadDisposables = [];
  _commentFormActions;
  _commentEditorActions;
  _reviewThreadReplyButton;
  _editorHeight = MIN_EDITOR_HEIGHT;
  async initialize(focus) {
    const hasExistingComments = this._commentThread.comments && this._commentThread.comments.length > 0;
    const modeId = generateUuid() + "-" + (hasExistingComments ? this._commentThread.threadId : ++INMEM_MODEL_ID);
    const params = JSON.stringify({
      extensionId: this._commentThread.extensionId,
      commentThreadId: this._commentThread.threadId
    });
    let resource = URI.from({
      scheme: Schemas.commentsInput,
      path: `/${this._commentThread.extensionId}/commentinput-${modeId}.md?${params}`
      // TODO. Remove params once extensions adopt authority.
    });
    const commentController = this.commentService.getCommentController(this.owner);
    if (commentController) {
      resource = resource.with({ authority: commentController.id });
    }
    const model = await this.textModelService.createModelReference(resource);
    model.object.textEditorModel.setValue(this._pendingComment?.body || "");
    this._register(model);
    this.commentEditor.setModel(model.object.textEditorModel);
    if (this._pendingComment) {
      this.commentEditor.setPosition(this._pendingComment.cursor);
    }
    this.calculateEditorHeight();
    this._register(model.object.textEditorModel.onDidChangeContent(() => {
      this.setCommentEditorDecorations();
      this.commentEditorIsEmpty?.set(!this.commentEditor.getValue());
      if (this.calculateEditorHeight()) {
        this.commentEditor.layout({ height: this._editorHeight, width: this.commentEditor.getLayoutInfo().width });
        this.commentEditor.render(true);
      }
    }));
    this.createTextModelListener(this.commentEditor, this.form);
    this.setCommentEditorDecorations();
    if (this._pendingComment) {
      this.expandReplyArea();
    } else if (hasExistingComments) {
      this.createReplyButton(this.commentEditor, this.form);
    } else if (focus && (this._commentThread.comments && this._commentThread.comments.length === 0)) {
      this.expandReplyArea();
    }
    this._error = dom.append(this.form, dom.$(".validation-error.hidden"));
    const formActions = dom.append(this.form, dom.$(".form-actions"));
    this._formActions = dom.append(formActions, dom.$(".other-actions"));
    this.createCommentWidgetFormActions(this._formActions, model.object.textEditorModel);
    this._editorActions = dom.append(formActions, dom.$(".editor-actions"));
    this.createCommentWidgetEditorActions(this._editorActions, model.object.textEditorModel);
  }
  calculateEditorHeight() {
    const newEditorHeight = calculateEditorHeight(this._parentEditor, this.commentEditor, this._editorHeight);
    if (newEditorHeight !== this._editorHeight) {
      this._editorHeight = newEditorHeight;
      return true;
    }
    return false;
  }
  updateCommentThread(commentThread) {
    const isReplying = this.commentEditor.hasTextFocus();
    const oldAndNewBothEmpty = !this._commentThread.comments?.length && !commentThread.comments?.length;
    if (!this._reviewThreadReplyButton) {
      this.createReplyButton(this.commentEditor, this.form);
    }
    if (this._commentThread.comments && this._commentThread.comments.length === 0 && !oldAndNewBothEmpty) {
      this.expandReplyArea();
    }
    if (isReplying) {
      this.commentEditor.focus();
    }
  }
  getPendingComment() {
    const model = this.commentEditor.getModel();
    if (model && model.getValueLength() > 0) {
      return { body: model.getValue(), cursor: this.commentEditor.getPosition() ?? new Position(1, 1) };
    }
    return void 0;
  }
  setPendingComment(pending) {
    this._pendingComment = pending;
    this.expandReplyArea();
    this.commentEditor.setValue(pending.body);
    this.commentEditor.setPosition(pending.cursor);
  }
  layout(widthInPixel) {
    this.commentEditor.layout({
      height: this._editorHeight,
      width: widthInPixel - 54
      /* margin 20px * 10 + scrollbar 14px*/
    });
  }
  focusIfNeeded() {
    if (!this._commentThread.comments || !this._commentThread.comments.length) {
      this.commentEditor.focus();
    } else if ((this.commentEditor.getModel()?.getValueLength() ?? 0) > 0) {
      this.expandReplyArea();
    }
  }
  focusCommentEditor() {
    this.commentEditor.focus();
  }
  expandReplyAreaAndFocusCommentEditor() {
    this.expandReplyArea();
    this.commentEditor.focus();
  }
  isCommentEditorFocused() {
    return this.commentEditor.hasWidgetFocus();
  }
  updateCanReply() {
    if (!this._commentThread.canReply) {
      this.form.style.display = "none";
    } else {
      this.form.style.display = "block";
    }
  }
  async submitComment() {
    await this._commentFormActions?.triggerDefaultAction();
    this._pendingComment = void 0;
  }
  setCommentEditorDecorations() {
    const hasExistingComments = this._commentThread.comments && this._commentThread.comments.length > 0;
    const placeholder = hasExistingComments ? this._commentOptions?.placeHolder || nls.localize("reply", "Reply...") : this._commentOptions?.placeHolder || nls.localize("newComment", "Type a new comment");
    this.commentEditor.updateOptions({ placeholder });
  }
  createTextModelListener(commentEditor, commentForm) {
    this._commentThreadDisposables.push(commentEditor.onDidFocusEditorWidget(() => {
      this._commentThread.input = {
        uri: commentEditor.getModel().uri,
        value: commentEditor.getValue()
      };
      this.commentService.setActiveEditingCommentThread(this._commentThread);
      this.commentService.setActiveCommentAndThread(this.owner, { thread: this._commentThread });
    }));
    this._commentThreadDisposables.push(commentEditor.getModel().onDidChangeContent(() => {
      const modelContent = commentEditor.getValue();
      if (this._commentThread.input && this._commentThread.input.uri === commentEditor.getModel().uri && this._commentThread.input.value !== modelContent) {
        const newInput = this._commentThread.input;
        newInput.value = modelContent;
        this._commentThread.input = newInput;
      }
      this.commentService.setActiveEditingCommentThread(this._commentThread);
    }));
    this._commentThreadDisposables.push(this._commentThread.onDidChangeInput((input) => {
      const thread = this._commentThread;
      const model = commentEditor.getModel();
      if (thread.input && model && thread.input.uri !== model.uri) {
        return;
      }
      if (!input) {
        return;
      }
      if (commentEditor.getValue() !== input.value) {
        commentEditor.setValue(input.value);
        if (input.value === "") {
          this._pendingComment = { body: "", cursor: new Position(1, 1) };
          commentForm.classList.remove("expand");
          commentEditor.getDomNode().style.outline = "";
          this._error.textContent = "";
          this._error.classList.add("hidden");
        }
      }
    }));
  }
  /**
   * Command based actions.
   */
  createCommentWidgetFormActions(container, model) {
    const menu = this._commentMenus.getCommentThreadActions(this._contextKeyService);
    this._register(menu);
    this._register(menu.onDidChange(() => {
      this._commentFormActions.setActions(menu);
    }));
    this._commentFormActions = new CommentFormActions(this.keybindingService, this._contextKeyService, this.contextMenuService, container, async (action) => {
      await this._actionRunDelegate?.();
      await action.run({
        thread: this._commentThread,
        text: this.commentEditor.getValue(),
        $mid: MarshalledId.CommentThreadReply
      });
      this.hideReplyArea();
    });
    this._register(this._commentFormActions);
    this._commentFormActions.setActions(menu);
  }
  createCommentWidgetEditorActions(container, model) {
    const editorMenu = this._commentMenus.getCommentEditorActions(this._contextKeyService);
    this._register(editorMenu);
    this._register(editorMenu.onDidChange(() => {
      this._commentEditorActions.setActions(editorMenu, true);
    }));
    this._commentEditorActions = new CommentFormActions(this.keybindingService, this._contextKeyService, this.contextMenuService, container, async (action) => {
      this._actionRunDelegate?.();
      action.run({
        thread: this._commentThread,
        text: this.commentEditor.getValue(),
        $mid: MarshalledId.CommentThreadReply
      });
      this.focusCommentEditor();
    });
    this._register(this._commentEditorActions);
    this._commentEditorActions.setActions(editorMenu, true);
  }
  get isReplyExpanded() {
    return this.form.classList.contains("expand");
  }
  expandReplyArea() {
    if (!this.isReplyExpanded) {
      this.form.classList.add("expand");
      this.commentEditor.focus();
      this.commentEditor.layout();
    }
  }
  clearAndExpandReplyArea() {
    if (!this.isReplyExpanded) {
      this.commentEditor.setValue("");
      this.expandReplyArea();
    }
  }
  hideReplyArea() {
    const domNode = this.commentEditor.getDomNode();
    if (domNode) {
      domNode.style.outline = "";
    }
    this.commentEditor.setValue("");
    this._pendingComment = { body: "", cursor: new Position(1, 1) };
    this.form.classList.remove("expand");
    this._error.textContent = "";
    this._error.classList.add("hidden");
  }
  createReplyButton(commentEditor, commentForm) {
    this._reviewThreadReplyButton = dom.append(commentForm, dom.$(`button.review-thread-reply-button.${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`));
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this._reviewThreadReplyButton, this._commentOptions?.prompt || nls.localize("reply", "Reply...")));
    this._reviewThreadReplyButton.textContent = this._commentOptions?.prompt || nls.localize("reply", "Reply...");
    this._register(dom.addDisposableListener(this._reviewThreadReplyButton, "click", (_) => this.clearAndExpandReplyArea()));
    this._register(dom.addDisposableListener(this._reviewThreadReplyButton, "focus", (_) => this.clearAndExpandReplyArea()));
    this._register(commentEditor.onDidBlurEditorWidget(() => {
      if (commentEditor.getModel().getValueLength() === 0 && commentForm.classList.contains("expand")) {
        commentForm.classList.remove("expand");
      }
    }));
  }
  dispose() {
    super.dispose();
    dispose(this._commentThreadDisposables);
  }
};
CommentReply = __decorateClass([
  __decorateParam(12, ICommentService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IKeybindingService),
  __decorateParam(15, IContextMenuService),
  __decorateParam(16, IHoverService),
  __decorateParam(17, ITextModelService)
], CommentReply);
export {
  COMMENTEDITOR_DECORATION_KEY,
  CommentReply
};
//# sourceMappingURL=commentReply.js.map
