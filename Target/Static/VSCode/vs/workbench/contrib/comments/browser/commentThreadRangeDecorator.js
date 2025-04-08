var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, dispose, IDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { CommentThread, CommentThreadCollapsibleState } from "../../../../editor/common/languages.js";
import { IModelDecorationOptions, IModelDeltaDecoration } from "../../../../editor/common/model.js";
import { ModelDecorationOptions } from "../../../../editor/common/model/textModel.js";
import { ICommentInfo, ICommentService } from "./commentService.js";
class CommentThreadRangeDecoration {
  constructor(range, options) {
    this.range = range;
    this.options = options;
  }
  static {
    __name(this, "CommentThreadRangeDecoration");
  }
  _decorationId;
  get id() {
    return this._decorationId;
  }
  set id(id) {
    this._decorationId = id;
  }
}
class CommentThreadRangeDecorator extends Disposable {
  static {
    __name(this, "CommentThreadRangeDecorator");
  }
  static description = "comment-thread-range-decorator";
  decorationOptions;
  activeDecorationOptions;
  decorationIds = [];
  activeDecorationIds = [];
  editor;
  threadCollapseStateListeners = [];
  currentThreadCollapseStateListener;
  constructor(commentService) {
    super();
    const decorationOptions = {
      description: CommentThreadRangeDecorator.description,
      isWholeLine: false,
      zIndex: 20,
      className: "comment-thread-range",
      shouldFillLineOnLineBreak: true
    };
    this.decorationOptions = ModelDecorationOptions.createDynamic(decorationOptions);
    const activeDecorationOptions = {
      description: CommentThreadRangeDecorator.description,
      isWholeLine: false,
      zIndex: 20,
      className: "comment-thread-range-current",
      shouldFillLineOnLineBreak: true
    };
    this.activeDecorationOptions = ModelDecorationOptions.createDynamic(activeDecorationOptions);
    this._register(commentService.onDidChangeCurrentCommentThread((thread) => {
      this.updateCurrent(thread);
    }));
    this._register(commentService.onDidUpdateCommentThreads(() => {
      this.updateCurrent(void 0);
    }));
  }
  updateCurrent(thread) {
    if (!this.editor || thread?.resource && thread.resource?.toString() !== this.editor.getModel()?.uri.toString()) {
      return;
    }
    this.currentThreadCollapseStateListener?.dispose();
    const newDecoration = [];
    if (thread) {
      const range = thread.range;
      if (range && !(range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn)) {
        if (thread.collapsibleState === CommentThreadCollapsibleState.Expanded) {
          this.currentThreadCollapseStateListener = thread.onDidChangeCollapsibleState((state) => {
            if (state === CommentThreadCollapsibleState.Collapsed) {
              this.updateCurrent(void 0);
            }
          });
          newDecoration.push(new CommentThreadRangeDecoration(range, this.activeDecorationOptions));
        }
      }
    }
    this.editor.changeDecorations((changeAccessor) => {
      this.activeDecorationIds = changeAccessor.deltaDecorations(this.activeDecorationIds, newDecoration);
      newDecoration.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
    });
  }
  update(editor, commentInfos) {
    const model = editor?.getModel();
    if (!editor || !model) {
      return;
    }
    dispose(this.threadCollapseStateListeners);
    this.editor = editor;
    const commentThreadRangeDecorations = [];
    for (const info of commentInfos) {
      info.threads.forEach((thread) => {
        if (thread.isDisposed) {
          return;
        }
        const range = thread.range;
        if (!range || range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
          return;
        }
        this.threadCollapseStateListeners.push(thread.onDidChangeCollapsibleState(() => {
          this.update(editor, commentInfos);
        }));
        if (thread.collapsibleState === CommentThreadCollapsibleState.Collapsed) {
          return;
        }
        commentThreadRangeDecorations.push(new CommentThreadRangeDecoration(range, this.decorationOptions));
      });
    }
    editor.changeDecorations((changeAccessor) => {
      this.decorationIds = changeAccessor.deltaDecorations(this.decorationIds, commentThreadRangeDecorations);
      commentThreadRangeDecorations.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
    });
  }
  dispose() {
    dispose(this.threadCollapseStateListeners);
    this.currentThreadCollapseStateListener?.dispose();
    super.dispose();
  }
}
export {
  CommentThreadRangeDecorator
};
//# sourceMappingURL=commentThreadRangeDecorator.js.map
