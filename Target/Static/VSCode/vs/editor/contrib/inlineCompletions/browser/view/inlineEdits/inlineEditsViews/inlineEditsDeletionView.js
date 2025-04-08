var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { n } from "../../../../../../../base/browser/dom.js";
import { IMouseEvent } from "../../../../../../../base/browser/mouseEvent.js";
import { Emitter } from "../../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { constObservable, derived, derivedObservableWithCache, IObservable } from "../../../../../../../base/common/observable.js";
import { editorBackground } from "../../../../../../../platform/theme/common/colorRegistry.js";
import { asCssVariable } from "../../../../../../../platform/theme/common/colorUtils.js";
import { ICodeEditor } from "../../../../../../browser/editorBrowser.js";
import { ObservableCodeEditor, observableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { Rect } from "../../../../../../browser/rect.js";
import { EditorOption } from "../../../../../../common/config/editorOptions.js";
import { LineRange } from "../../../../../../common/core/lineRange.js";
import { OffsetRange } from "../../../../../../common/core/offsetRange.js";
import { Position } from "../../../../../../common/core/position.js";
import { Range } from "../../../../../../common/core/range.js";
import { IInlineEditsView, InlineEditTabAction } from "../inlineEditsViewInterface.js";
import { InlineEditWithChanges } from "../inlineEditWithChanges.js";
import { getOriginalBorderColor, originalBackgroundColor } from "../theme.js";
import { getPrefixTrim, mapOutFalsy, maxContentWidthInRange } from "../utils/utils.js";
const HORIZONTAL_PADDING = 0;
const VERTICAL_PADDING = 0;
const BORDER_WIDTH = 1;
const WIDGET_SEPARATOR_WIDTH = 1;
const BORDER_RADIUS = 4;
class InlineEditsDeletionView extends Disposable {
  constructor(_editor, _edit, _uiState, _tabAction) {
    super();
    this._editor = _editor;
    this._edit = _edit;
    this._uiState = _uiState;
    this._tabAction = _tabAction;
    this._editorObs = observableCodeEditor(this._editor);
    const originalStartPosition = derived(this, (reader) => {
      const inlineEdit = this._edit.read(reader);
      return inlineEdit ? new Position(inlineEdit.originalLineRange.startLineNumber, 1) : null;
    });
    const originalEndPosition = derived(this, (reader) => {
      const inlineEdit = this._edit.read(reader);
      return inlineEdit ? new Position(inlineEdit.originalLineRange.endLineNumberExclusive, 1) : null;
    });
    this._originalDisplayRange = this._uiState.map((s) => s?.originalRange);
    this._originalVerticalStartPosition = this._editorObs.observePosition(originalStartPosition, this._store).map((p) => p?.y);
    this._originalVerticalEndPosition = this._editorObs.observePosition(originalEndPosition, this._store).map((p) => p?.y);
    this._register(this._editorObs.createOverlayWidget({
      domNode: this._nonOverflowView.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: derived((reader) => {
        const info = this._editorLayoutInfo.read(reader);
        if (info === null) {
          return 0;
        }
        return info.codeRect.width;
      })
    }));
  }
  static {
    __name(this, "InlineEditsDeletionView");
  }
  _onDidClick = this._register(new Emitter());
  onDidClick = this._onDidClick.event;
  _editorObs;
  _originalVerticalStartPosition;
  _originalVerticalEndPosition;
  _originalDisplayRange;
  _display = derived(this, (reader) => !!this._uiState.read(reader) ? "block" : "none");
  _editorMaxContentWidthInRange = derived(this, (reader) => {
    const originalDisplayRange = this._originalDisplayRange.read(reader);
    if (!originalDisplayRange) {
      return constObservable(0);
    }
    this._editorObs.versionId.read(reader);
    return derivedObservableWithCache(this, (reader2, lastValue) => {
      const maxWidth = maxContentWidthInRange(this._editorObs, originalDisplayRange, reader2);
      return Math.max(maxWidth, lastValue ?? 0);
    });
  }).map((v, r) => v.read(r));
  _maxPrefixTrim = derived((reader) => {
    const state = this._uiState.read(reader);
    if (!state) {
      return { prefixTrim: 0, prefixLeftOffset: 0 };
    }
    return getPrefixTrim(state.deletions, state.originalRange, [], this._editor);
  });
  _editorLayoutInfo = derived(this, (reader) => {
    const inlineEdit = this._edit.read(reader);
    if (!inlineEdit) {
      return null;
    }
    const state = this._uiState.read(reader);
    if (!state) {
      return null;
    }
    const editorLayout = this._editorObs.layoutInfo.read(reader);
    const horizontalScrollOffset = this._editorObs.scrollLeft.read(reader);
    const w = this._editorObs.getOption(EditorOption.fontInfo).map((f) => f.typicalHalfwidthCharacterWidth).read(reader);
    const right = editorLayout.contentLeft + Math.max(this._editorMaxContentWidthInRange.read(reader), w) - horizontalScrollOffset;
    const range = inlineEdit.originalLineRange;
    const selectionTop = this._originalVerticalStartPosition.read(reader) ?? this._editor.getTopForLineNumber(range.startLineNumber) - this._editorObs.scrollTop.read(reader);
    const selectionBottom = this._originalVerticalEndPosition.read(reader) ?? this._editor.getTopForLineNumber(range.endLineNumberExclusive) - this._editorObs.scrollTop.read(reader);
    const left = editorLayout.contentLeft + this._maxPrefixTrim.read(reader).prefixLeftOffset - horizontalScrollOffset;
    if (right <= left) {
      return null;
    }
    const codeRect = Rect.fromLeftTopRightBottom(left, selectionTop, right, selectionBottom).withMargin(VERTICAL_PADDING, HORIZONTAL_PADDING);
    return {
      codeRect,
      contentLeft: editorLayout.contentLeft
    };
  }).recomputeInitiallyAndOnChange(this._store);
  _originalOverlay = n.div({
    style: { pointerEvents: "none" }
  }, derived((reader) => {
    const layoutInfoObs = mapOutFalsy(this._editorLayoutInfo).read(reader);
    if (!layoutInfoObs) {
      return void 0;
    }
    const overlayhider = layoutInfoObs.map((layoutInfo) => Rect.fromLeftTopRightBottom(
      layoutInfo.contentLeft - BORDER_RADIUS - BORDER_WIDTH,
      layoutInfo.codeRect.top,
      layoutInfo.contentLeft,
      layoutInfo.codeRect.bottom
    ));
    const overlayRect = derived((reader2) => {
      const rect = layoutInfoObs.read(reader2).codeRect;
      const overlayHider = overlayhider.read(reader2);
      return rect.intersectHorizontal(new OffsetRange(overlayHider.left, Number.MAX_SAFE_INTEGER));
    });
    const separatorRect = overlayRect.map((rect) => rect.withMargin(WIDGET_SEPARATOR_WIDTH, WIDGET_SEPARATOR_WIDTH));
    return [
      n.div({
        class: "originalSeparatorDeletion",
        style: {
          ...separatorRect.read(reader).toStyles(),
          borderRadius: `${BORDER_RADIUS}px`,
          border: `${BORDER_WIDTH + WIDGET_SEPARATOR_WIDTH}px solid ${asCssVariable(editorBackground)}`,
          boxSizing: "border-box"
        }
      }),
      n.div({
        class: "originalOverlayDeletion",
        style: {
          ...overlayRect.read(reader).toStyles(),
          borderRadius: `${BORDER_RADIUS}px`,
          border: getOriginalBorderColor(this._tabAction).map((bc) => `${BORDER_WIDTH}px solid ${asCssVariable(bc)}`),
          boxSizing: "border-box",
          backgroundColor: asCssVariable(originalBackgroundColor)
        }
      }),
      n.div({
        class: "originalOverlayHiderDeletion",
        style: {
          ...overlayhider.read(reader).toStyles(),
          backgroundColor: asCssVariable(editorBackground)
        }
      })
    ];
  })).keepUpdated(this._store);
  _nonOverflowView = n.div({
    class: "inline-edits-view",
    style: {
      position: "absolute",
      overflow: "visible",
      top: "0px",
      left: "0px",
      zIndex: "0",
      display: this._display
    }
  }, [
    [this._originalOverlay]
  ]).keepUpdated(this._store);
  isHovered = constObservable(false);
}
export {
  InlineEditsDeletionView
};
//# sourceMappingURL=inlineEditsDeletionView.js.map
