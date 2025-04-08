var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equalsIfDefined, itemsEquals } from "../../base/common/equals.js";
import { Disposable, DisposableStore, IDisposable, toDisposable } from "../../base/common/lifecycle.js";
import { IObservable, IObservableWithChange, ITransaction, TransactionImpl, autorun, autorunOpts, derived, derivedOpts, derivedWithSetter, observableFromEvent, observableSignal, observableValue, observableValueOpts } from "../../base/common/observable.js";
import { EditorOption, FindComputedEditorOptionValueById } from "../common/config/editorOptions.js";
import { LineRange } from "../common/core/lineRange.js";
import { OffsetRange } from "../common/core/offsetRange.js";
import { Position } from "../common/core/position.js";
import { Selection } from "../common/core/selection.js";
import { ICursorSelectionChangedEvent } from "../common/cursorEvents.js";
import { IModelDeltaDecoration, ITextModel } from "../common/model.js";
import { IModelContentChangedEvent } from "../common/textModelEvents.js";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition, IEditorMouseEvent, IOverlayWidget, IOverlayWidgetPosition, IPasteEvent } from "./editorBrowser.js";
import { Point } from "./point.js";
function observableCodeEditor(editor) {
  return ObservableCodeEditor.get(editor);
}
__name(observableCodeEditor, "observableCodeEditor");
class ObservableCodeEditor extends Disposable {
  constructor(editor) {
    super();
    this.editor = editor;
    this._register(this.editor.onBeginUpdate(() => this._beginUpdate()));
    this._register(this.editor.onEndUpdate(() => this._endUpdate()));
    this._register(this.editor.onDidChangeModel(() => {
      this._beginUpdate();
      try {
        this._model.set(this.editor.getModel(), this._currentTransaction);
        this._forceUpdate();
      } finally {
        this._endUpdate();
      }
    }));
    this._register(this.editor.onDidType((e) => {
      this._beginUpdate();
      try {
        this._forceUpdate();
        this.onDidType.trigger(this._currentTransaction, e);
      } finally {
        this._endUpdate();
      }
    }));
    this._register(this.editor.onDidPaste((e) => {
      this._beginUpdate();
      try {
        this._forceUpdate();
        this.onDidPaste.trigger(this._currentTransaction, e);
      } finally {
        this._endUpdate();
      }
    }));
    this._register(this.editor.onDidChangeModelContent((e) => {
      this._beginUpdate();
      try {
        this._versionId.set(this.editor.getModel()?.getVersionId() ?? null, this._currentTransaction, e);
        this._forceUpdate();
      } finally {
        this._endUpdate();
      }
    }));
    this._register(this.editor.onDidChangeCursorSelection((e) => {
      this._beginUpdate();
      try {
        this._selections.set(this.editor.getSelections(), this._currentTransaction, e);
        this._forceUpdate();
      } finally {
        this._endUpdate();
      }
    }));
  }
  static {
    __name(this, "ObservableCodeEditor");
  }
  static _map = /* @__PURE__ */ new Map();
  /**
   * Make sure that editor is not disposed yet!
  */
  static get(editor) {
    let result = ObservableCodeEditor._map.get(editor);
    if (!result) {
      result = new ObservableCodeEditor(editor);
      ObservableCodeEditor._map.set(editor, result);
      const d = editor.onDidDispose(() => {
        const item = ObservableCodeEditor._map.get(editor);
        if (item) {
          ObservableCodeEditor._map.delete(editor);
          item.dispose();
          d.dispose();
        }
      });
    }
    return result;
  }
  _updateCounter = 0;
  _currentTransaction = void 0;
  _beginUpdate() {
    this._updateCounter++;
    if (this._updateCounter === 1) {
      this._currentTransaction = new TransactionImpl(() => {
      });
    }
  }
  _endUpdate() {
    this._updateCounter--;
    if (this._updateCounter === 0) {
      const t = this._currentTransaction;
      this._currentTransaction = void 0;
      t.finish();
    }
  }
  forceUpdate(cb) {
    this._beginUpdate();
    try {
      this._forceUpdate();
      if (!cb) {
        return void 0;
      }
      return cb(this._currentTransaction);
    } finally {
      this._endUpdate();
    }
  }
  _forceUpdate() {
    this._beginUpdate();
    try {
      this._model.set(this.editor.getModel(), this._currentTransaction);
      this._versionId.set(this.editor.getModel()?.getVersionId() ?? null, this._currentTransaction, void 0);
      this._selections.set(this.editor.getSelections(), this._currentTransaction, void 0);
    } finally {
      this._endUpdate();
    }
  }
  _model = observableValue(this, this.editor.getModel());
  model = this._model;
  isReadonly = observableFromEvent(this, this.editor.onDidChangeConfiguration, () => this.editor.getOption(EditorOption.readOnly));
  _versionId = observableValueOpts({ owner: this, lazy: true }, this.editor.getModel()?.getVersionId() ?? null);
  versionId = this._versionId;
  _selections = observableValueOpts(
    { owner: this, equalsFn: equalsIfDefined(itemsEquals(Selection.selectionsEqual)), lazy: true },
    this.editor.getSelections() ?? null
  );
  selections = this._selections;
  positions = derivedOpts(
    { owner: this, equalsFn: equalsIfDefined(itemsEquals(Position.equals)) },
    (reader) => this.selections.read(reader)?.map((s) => s.getStartPosition()) ?? null
  );
  isFocused = observableFromEvent(this, (e) => {
    const d1 = this.editor.onDidFocusEditorWidget(e);
    const d2 = this.editor.onDidBlurEditorWidget(e);
    return {
      dispose() {
        d1.dispose();
        d2.dispose();
      }
    };
  }, () => this.editor.hasWidgetFocus());
  isTextFocused = observableFromEvent(this, (e) => {
    const d1 = this.editor.onDidFocusEditorText(e);
    const d2 = this.editor.onDidBlurEditorText(e);
    return {
      dispose() {
        d1.dispose();
        d2.dispose();
      }
    };
  }, () => this.editor.hasTextFocus());
  inComposition = observableFromEvent(this, (e) => {
    const d1 = this.editor.onDidCompositionStart(() => {
      e(void 0);
    });
    const d2 = this.editor.onDidCompositionEnd(() => {
      e(void 0);
    });
    return {
      dispose() {
        d1.dispose();
        d2.dispose();
      }
    };
  }, () => this.editor.inComposition);
  value = derivedWithSetter(
    this,
    (reader) => {
      this.versionId.read(reader);
      return this.model.read(reader)?.getValue() ?? "";
    },
    (value, tx) => {
      const model = this.model.get();
      if (model !== null) {
        if (value !== model.getValue()) {
          model.setValue(value);
        }
      }
    }
  );
  valueIsEmpty = derived(this, (reader) => {
    this.versionId.read(reader);
    return this.editor.getModel()?.getValueLength() === 0;
  });
  cursorSelection = derivedOpts({ owner: this, equalsFn: equalsIfDefined(Selection.selectionsEqual) }, (reader) => this.selections.read(reader)?.[0] ?? null);
  cursorPosition = derivedOpts({ owner: this, equalsFn: Position.equals }, (reader) => this.selections.read(reader)?.[0]?.getPosition() ?? null);
  cursorLineNumber = derived(this, (reader) => this.cursorPosition.read(reader)?.lineNumber ?? null);
  onDidType = observableSignal(this);
  onDidPaste = observableSignal(this);
  scrollTop = observableFromEvent(this.editor.onDidScrollChange, () => this.editor.getScrollTop());
  scrollLeft = observableFromEvent(this.editor.onDidScrollChange, () => this.editor.getScrollLeft());
  layoutInfo = observableFromEvent(this.editor.onDidLayoutChange, () => this.editor.getLayoutInfo());
  layoutInfoContentLeft = this.layoutInfo.map((l) => l.contentLeft);
  layoutInfoDecorationsLeft = this.layoutInfo.map((l) => l.decorationsLeft);
  layoutInfoWidth = this.layoutInfo.map((l) => l.width);
  layoutInfoMinimap = this.layoutInfo.map((l) => l.minimap);
  layoutInfoVerticalScrollbarWidth = this.layoutInfo.map((l) => l.verticalScrollbarWidth);
  contentWidth = observableFromEvent(this.editor.onDidContentSizeChange, () => this.editor.getContentWidth());
  getOption(id) {
    return observableFromEvent(this, (cb) => this.editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(id)) {
        cb(void 0);
      }
    }), () => this.editor.getOption(id));
  }
  setDecorations(decorations) {
    const d = new DisposableStore();
    const decorationsCollection = this.editor.createDecorationsCollection();
    d.add(autorunOpts({ owner: this, debugName: /* @__PURE__ */ __name(() => `Apply decorations from ${decorations.debugName}`, "debugName") }, (reader) => {
      const d2 = decorations.read(reader);
      decorationsCollection.set(d2);
    }));
    d.add({
      dispose: /* @__PURE__ */ __name(() => {
        decorationsCollection.clear();
      }, "dispose")
    });
    return d;
  }
  _widgetCounter = 0;
  createOverlayWidget(widget) {
    const overlayWidgetId = "observableOverlayWidget" + this._widgetCounter++;
    const w = {
      getDomNode: /* @__PURE__ */ __name(() => widget.domNode, "getDomNode"),
      getPosition: /* @__PURE__ */ __name(() => widget.position.get(), "getPosition"),
      getId: /* @__PURE__ */ __name(() => overlayWidgetId, "getId"),
      allowEditorOverflow: widget.allowEditorOverflow,
      getMinContentWidthInPx: /* @__PURE__ */ __name(() => widget.minContentWidthInPx.get(), "getMinContentWidthInPx")
    };
    this.editor.addOverlayWidget(w);
    const d = autorun((reader) => {
      widget.position.read(reader);
      widget.minContentWidthInPx.read(reader);
      this.editor.layoutOverlayWidget(w);
    });
    return toDisposable(() => {
      d.dispose();
      this.editor.removeOverlayWidget(w);
    });
  }
  createContentWidget(widget) {
    const contentWidgetId = "observableContentWidget" + this._widgetCounter++;
    const w = {
      getDomNode: /* @__PURE__ */ __name(() => widget.domNode, "getDomNode"),
      getPosition: /* @__PURE__ */ __name(() => widget.position.get(), "getPosition"),
      getId: /* @__PURE__ */ __name(() => contentWidgetId, "getId"),
      allowEditorOverflow: widget.allowEditorOverflow
    };
    this.editor.addContentWidget(w);
    const d = autorun((reader) => {
      widget.position.read(reader);
      this.editor.layoutContentWidget(w);
    });
    return toDisposable(() => {
      d.dispose();
      this.editor.removeContentWidget(w);
    });
  }
  observeLineOffsetRange(lineRange, store) {
    const start = this.observePosition(lineRange.map((r) => new Position(r.startLineNumber, 1)), store);
    const end = this.observePosition(lineRange.map((r) => new Position(r.endLineNumberExclusive + 1, 1)), store);
    return derived((reader) => {
      start.read(reader);
      end.read(reader);
      const range = lineRange.read(reader);
      const lineCount = this.model.read(reader)?.getLineCount();
      const s = (typeof lineCount !== "undefined" && range.startLineNumber > lineCount ? this.editor.getBottomForLineNumber(lineCount) : this.editor.getTopForLineNumber(range.startLineNumber)) - this.scrollTop.read(reader);
      const e = range.isEmpty ? s : this.editor.getBottomForLineNumber(range.endLineNumberExclusive - 1) - this.scrollTop.read(reader);
      return new OffsetRange(s, e);
    });
  }
  observePosition(position, store) {
    let pos = position.get();
    const result = observableValueOpts({ owner: this, debugName: /* @__PURE__ */ __name(() => `topLeftOfPosition${pos?.toString()}`, "debugName"), equalsFn: equalsIfDefined(Point.equals) }, new Point(0, 0));
    const contentWidgetId = `observablePositionWidget` + this._widgetCounter++;
    const domNode = document.createElement("div");
    const w = {
      getDomNode: /* @__PURE__ */ __name(() => domNode, "getDomNode"),
      getPosition: /* @__PURE__ */ __name(() => {
        return pos ? { preference: [ContentWidgetPositionPreference.EXACT], position: position.get() } : null;
      }, "getPosition"),
      getId: /* @__PURE__ */ __name(() => contentWidgetId, "getId"),
      allowEditorOverflow: false,
      afterRender: /* @__PURE__ */ __name((position2, coordinate) => {
        const model = this._model.get();
        if (model && pos && pos.lineNumber > model.getLineCount()) {
          result.set(new Point(0, this.editor.getBottomForLineNumber(model.getLineCount()) - this.scrollTop.get()), void 0);
        } else {
          result.set(coordinate ? new Point(coordinate.left, coordinate.top) : null, void 0);
        }
      }, "afterRender")
    };
    this.editor.addContentWidget(w);
    store.add(autorun((reader) => {
      pos = position.read(reader);
      this.editor.layoutContentWidget(w);
    }));
    store.add(toDisposable(() => {
      this.editor.removeContentWidget(w);
    }));
    return result;
  }
  openedPeekWidgets = observableValue(this, 0);
  isTargetHovered(predicate, store) {
    const isHovered = observableValue("isInjectedTextHovered", false);
    store.add(this.editor.onMouseMove((e) => {
      const val = predicate(e);
      isHovered.set(val, void 0);
    }));
    store.add(this.editor.onMouseLeave((E) => {
      isHovered.set(false, void 0);
    }));
    return isHovered;
  }
}
export {
  ObservableCodeEditor,
  observableCodeEditor
};
//# sourceMappingURL=observableCodeEditor.js.map
