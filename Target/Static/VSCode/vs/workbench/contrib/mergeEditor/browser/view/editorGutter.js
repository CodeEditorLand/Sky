var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { h, reset } from "../../../../../base/browser/dom.js";
import { Disposable, IDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { autorun, IReader, observableFromEvent, observableSignal, observableSignalFromEvent, transaction } from "../../../../../base/common/observable.js";
import { CodeEditorWidget } from "../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { LineRange } from "../model/lineRange.js";
class EditorGutter extends Disposable {
  constructor(_editor, _domNode, itemProvider) {
    super();
    this._editor = _editor;
    this._domNode = _domNode;
    this.itemProvider = itemProvider;
    this._domNode.className = "gutter monaco-editor";
    const scrollDecoration = this._domNode.appendChild(
      h("div.scroll-decoration", { role: "presentation", ariaHidden: "true", style: { width: "100%" } }).root
    );
    const o = new ResizeObserver(() => {
      transaction((tx) => {
        this.domNodeSizeChanged.trigger(tx);
      });
    });
    o.observe(this._domNode);
    this._register(toDisposable(() => o.disconnect()));
    this._register(autorun((reader) => {
      scrollDecoration.className = this.isScrollTopZero.read(reader) ? "" : "scroll-decoration";
    }));
    this._register(autorun((reader) => (
      /** @description EditorGutter.Render */
      this.render(reader)
    )));
  }
  static {
    __name(this, "EditorGutter");
  }
  scrollTop = observableFromEvent(
    this,
    this._editor.onDidScrollChange,
    (e) => (
      /** @description editor.onDidScrollChange */
      this._editor.getScrollTop()
    )
  );
  isScrollTopZero = this.scrollTop.map((scrollTop) => (
    /** @description isScrollTopZero */
    scrollTop === 0
  ));
  modelAttached = observableFromEvent(
    this,
    this._editor.onDidChangeModel,
    (e) => (
      /** @description editor.onDidChangeModel */
      this._editor.hasModel()
    )
  );
  editorOnDidChangeViewZones = observableSignalFromEvent("onDidChangeViewZones", this._editor.onDidChangeViewZones);
  editorOnDidContentSizeChange = observableSignalFromEvent("onDidContentSizeChange", this._editor.onDidContentSizeChange);
  domNodeSizeChanged = observableSignal("domNodeSizeChanged");
  dispose() {
    super.dispose();
    reset(this._domNode);
  }
  views = /* @__PURE__ */ new Map();
  render(reader) {
    if (!this.modelAttached.read(reader)) {
      return;
    }
    this.domNodeSizeChanged.read(reader);
    this.editorOnDidChangeViewZones.read(reader);
    this.editorOnDidContentSizeChange.read(reader);
    const scrollTop = this.scrollTop.read(reader);
    const visibleRanges = this._editor.getVisibleRanges();
    const unusedIds = new Set(this.views.keys());
    if (visibleRanges.length > 0) {
      const visibleRange = visibleRanges[0];
      const visibleRange2 = new LineRange(
        visibleRange.startLineNumber,
        visibleRange.endLineNumber - visibleRange.startLineNumber
      ).deltaEnd(1);
      const gutterItems = this.itemProvider.getIntersectingGutterItems(
        visibleRange2,
        reader
      );
      for (const gutterItem of gutterItems) {
        if (!gutterItem.range.touches(visibleRange2)) {
          continue;
        }
        unusedIds.delete(gutterItem.id);
        let view = this.views.get(gutterItem.id);
        if (!view) {
          const viewDomNode = document.createElement("div");
          this._domNode.appendChild(viewDomNode);
          const itemView = this.itemProvider.createView(
            gutterItem,
            viewDomNode
          );
          view = new ManagedGutterItemView(itemView, viewDomNode);
          this.views.set(gutterItem.id, view);
        } else {
          view.gutterItemView.update(gutterItem);
        }
        const top = gutterItem.range.startLineNumber <= this._editor.getModel().getLineCount() ? this._editor.getTopForLineNumber(gutterItem.range.startLineNumber, true) - scrollTop : this._editor.getBottomForLineNumber(gutterItem.range.startLineNumber - 1, false) - scrollTop;
        const bottom = this._editor.getBottomForLineNumber(gutterItem.range.endLineNumberExclusive - 1, true) - scrollTop;
        const height = bottom - top;
        view.domNode.style.top = `${top}px`;
        view.domNode.style.height = `${height}px`;
        view.gutterItemView.layout(top, height, 0, this._domNode.clientHeight);
      }
    }
    for (const id of unusedIds) {
      const view = this.views.get(id);
      view.gutterItemView.dispose();
      view.domNode.remove();
      this.views.delete(id);
    }
  }
}
class ManagedGutterItemView {
  constructor(gutterItemView, domNode) {
    this.gutterItemView = gutterItemView;
    this.domNode = domNode;
  }
  static {
    __name(this, "ManagedGutterItemView");
  }
}
export {
  EditorGutter
};
//# sourceMappingURL=editorGutter.js.map
