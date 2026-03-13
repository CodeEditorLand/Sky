var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { n } from "../../../../../../../../base/browser/dom.js";
import { Disposable } from "../../../../../../../../base/common/lifecycle.js";
import { clamp } from "../../../../../../../../base/common/numbers.js";
import { derived, constObservable, autorun, observableValue } from "../../../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../../../platform/instantiation/common/instantiation.js";
import { observableCodeEditor } from "../../../../../../../browser/observableCodeEditor.js";
import { EmbeddedCodeEditorWidget } from "../../../../../../../browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { Position } from "../../../../../../../common/core/position.js";
import { Range } from "../../../../../../../common/core/range.js";
import { LineRange } from "../../../../../../../common/core/ranges/lineRange.js";
import { OffsetRange } from "../../../../../../../common/core/ranges/offsetRange.js";
import { ModelDecorationOptions } from "../../../../../../../common/model/textModel.js";
import { InlineCompletionContextKeys } from "../../../../controller/inlineCompletionContextKeys.js";
import { InlineEditsGutterIndicator, InlineEditsGutterIndicatorData } from "../../components/gutterIndicatorView.js";
import { classNames, maxContentWidthInRange } from "../../utils/utils.js";
import { JumpToView } from "../jumpToView.js";
import { TextModelValueReference } from "../../../../model/textModelValueReference.js";
let LongDistancePreviewEditor = class LongDistancePreviewEditor2 extends Disposable {
  static {
    __name(this, "LongDistancePreviewEditor");
  }
  constructor(_previewTextModel, _properties, _parentEditor, _tabAction, _instantiationService) {
    super();
    this._previewTextModel = _previewTextModel;
    this._properties = _properties;
    this._parentEditor = _parentEditor;
    this._tabAction = _tabAction;
    this._instantiationService = _instantiationService;
    this._previewRef = n.ref();
    this.element = n.div({ class: "preview", style: {
      /*pointerEvents: 'none'*/
    }, ref: this._previewRef });
    this._state = derived(this, (reader) => {
      const props = this._properties.read(reader);
      if (!props) {
        return void 0;
      }
      let mode;
      let visibleRange;
      if (props.nextCursorPosition !== null) {
        mode = "original";
        visibleRange = LineRange.ofLength(props.nextCursorPosition.lineNumber, 1);
      } else {
        if (props.diff[0].innerChanges?.every((c) => c.modifiedRange.isEmpty())) {
          mode = "original";
          visibleRange = LineRange.ofLength(props.diff[0].original.startLineNumber, 1);
        } else {
          mode = "modified";
          visibleRange = LineRange.ofLength(props.diff[0].modified.startLineNumber, 1);
        }
      }
      const textModel = mode === "modified" ? TextModelValueReference.snapshot(this._previewTextModel) : props.target;
      return {
        mode,
        visibleLineRange: visibleRange,
        textModel,
        diff: props.diff
      };
    });
    this.updatePreviewEditorEffect = derived(this, (reader) => {
      this._previewEditorObs.model.read(reader);
      const range = this._state.read(reader)?.visibleLineRange;
      if (!range) {
        return;
      }
      const hiddenAreas = [];
      if (range.startLineNumber > 1) {
        hiddenAreas.push(new Range(1, 1, range.startLineNumber - 1, 1));
      }
      if (range.endLineNumberExclusive < this._previewTextModel.getLineCount() + 1) {
        hiddenAreas.push(new Range(range.endLineNumberExclusive, 1, this._previewTextModel.getLineCount() + 1, 1));
      }
      this.previewEditor.setHiddenAreas(hiddenAreas, void 0, true);
    });
    this.horizontalContentRangeInPreviewEditorToShow = derived(this, (reader) => {
      return this._getHorizontalContentRangeInPreviewEditorToShow(this.previewEditor, reader);
    });
    this.contentHeight = derived(this, (reader) => {
      const viewState = this._state.read(reader);
      if (!viewState) {
        return constObservable(null);
      }
      const previewEditorHeight = this._previewEditorObs.observeLineHeightForLine(viewState.visibleLineRange.startLineNumber);
      return previewEditorHeight;
    }).flatten();
    this._editorDecorations = derived(this, (reader) => {
      const state = this._state.read(reader);
      if (!state) {
        return void 0;
      }
      const diff = {
        mode: "insertionInline",
        diff: state.diff
      };
      const originalDecorations = [];
      const modifiedDecorations = [];
      const diffWholeLineDeleteDecoration = ModelDecorationOptions.register({
        className: "inlineCompletions-char-delete",
        description: "char-delete",
        isWholeLine: false,
        zIndex: 1
        // be on top of diff background decoration
      });
      const diffWholeLineAddDecoration = ModelDecorationOptions.register({
        className: "inlineCompletions-char-insert",
        description: "char-insert",
        isWholeLine: true
      });
      const diffAddDecoration = ModelDecorationOptions.register({
        className: "inlineCompletions-char-insert",
        description: "char-insert",
        shouldFillLineOnLineBreak: true
      });
      const hideEmptyInnerDecorations = true;
      for (const m of diff.diff) {
        if (m.modified.isEmpty || m.original.isEmpty) {
          if (!m.original.isEmpty) {
            originalDecorations.push({ range: m.original.toInclusiveRange(), options: diffWholeLineDeleteDecoration });
          }
          if (!m.modified.isEmpty) {
            modifiedDecorations.push({ range: m.modified.toInclusiveRange(), options: diffWholeLineAddDecoration });
          }
        } else {
          for (const i of m.innerChanges || []) {
            if (m.original.contains(i.originalRange.startLineNumber) && !(hideEmptyInnerDecorations && i.originalRange.isEmpty())) {
              originalDecorations.push({
                range: i.originalRange,
                options: {
                  description: "char-delete",
                  shouldFillLineOnLineBreak: false,
                  className: classNames(
                    "inlineCompletions-char-delete",
                    // i.originalRange.isSingleLine() && diff.mode === 'insertionInline' && 'single-line-inline',
                    i.originalRange.isEmpty() && "empty"
                  ),
                  zIndex: 1
                }
              });
            }
            if (m.modified.contains(i.modifiedRange.startLineNumber)) {
              modifiedDecorations.push({
                range: i.modifiedRange,
                options: diffAddDecoration
              });
            }
          }
        }
      }
      return { originalDecorations, modifiedDecorations };
    });
    this.previewEditor = this._register(this._createPreviewEditor());
    this._parentEditorObs = observableCodeEditor(this._parentEditor);
    this._register(autorun((reader) => {
      const tm = this._state.read(reader)?.textModel || null;
      if (tm) {
        this.previewEditor.setModel(tm.dangerouslyGetUnderlyingModel());
      }
    }));
    this._previewEditorObs = observableCodeEditor(this.previewEditor);
    this._register(this._previewEditorObs.setDecorations(derived((reader) => {
      const state = this._state.read(reader);
      const decorations = this._editorDecorations.read(reader);
      return (state?.mode === "original" ? decorations?.originalDecorations : decorations?.modifiedDecorations) ?? [];
    })));
    const showJumpToDecoration = false;
    if (showJumpToDecoration) {
      this._register(this._instantiationService.createInstance(JumpToView, this._previewEditorObs, { style: "cursor" }, derived((reader) => {
        const p = this._properties.read(reader);
        if (!p || !p.nextCursorPosition) {
          return void 0;
        }
        return {
          jumpToPosition: p.nextCursorPosition
        };
      })));
    }
    this._register(autorun((reader) => {
      if (!this._properties.read(reader)) {
        return;
      }
      const cursorPosition = this._parentEditorObs.cursorPosition.read(reader);
      if (cursorPosition) {
        this.previewEditor.setPosition(this._previewTextModel.validatePosition(cursorPosition), "longDistanceHintPreview");
      }
    }));
    this._register(autorun((reader) => {
      const state = this._state.read(reader);
      if (!state) {
        return;
      }
      const lineNumberDigets = state.visibleLineRange.startLineNumber.toString().length;
      this.previewEditor.updateOptions({ lineNumbersMinChars: lineNumberDigets + 1 });
    }));
    this._register(this._instantiationService.createInstance(InlineEditsGutterIndicator, this._previewEditorObs, derived((reader) => {
      const state = this._state.read(reader);
      if (!state) {
        return void 0;
      }
      const props = this._properties.read(reader);
      if (!props) {
        return void 0;
      }
      return new InlineEditsGutterIndicatorData(props.inlineSuggestInfo, LineRange.ofLength(state.visibleLineRange.startLineNumber, 1), props.model, void 0);
    }), this._tabAction, constObservable(0), constObservable(false), observableValue(this, false)));
    this.updatePreviewEditorEffect.recomputeInitiallyAndOnChange(this._store);
  }
  _createPreviewEditor() {
    return this._instantiationService.createInstance(EmbeddedCodeEditorWidget, this._previewRef.element, {
      glyphMargin: false,
      lineNumbers: "on",
      minimap: { enabled: false },
      guides: {
        indentation: false,
        bracketPairs: false,
        bracketPairsHorizontal: false,
        highlightActiveIndentation: false
      },
      editContext: false,
      // is a bit faster
      rulers: [],
      padding: { top: 0, bottom: 0 },
      //folding: false,
      selectOnLineNumbers: false,
      selectionHighlight: false,
      columnSelection: false,
      overviewRulerBorder: false,
      overviewRulerLanes: 0,
      //lineDecorationsWidth: 0,
      //lineNumbersMinChars: 0,
      revealHorizontalRightPadding: 0,
      bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: false },
      scrollBeyondLastLine: false,
      scrollbar: {
        vertical: "hidden",
        horizontal: "hidden",
        handleMouseWheel: false
      },
      readOnly: true,
      wordWrap: "off",
      wordWrapOverride1: "off",
      wordWrapOverride2: "off"
    }, {
      contextKeyValues: {
        [InlineCompletionContextKeys.inInlineEditsPreviewEditor.key]: true
      },
      contributions: []
    }, this._parentEditor);
  }
  _getHorizontalContentRangeInPreviewEditorToShow(editor, reader) {
    const state = this._state.read(reader);
    if (!state) {
      return void 0;
    }
    const diff = state.diff;
    const jumpToPos = this._properties.read(reader)?.nextCursorPosition;
    const visibleRange = state.visibleLineRange;
    const l = this._previewEditorObs.layoutInfo.read(reader);
    const trueContentWidth = maxContentWidthInRange(this._previewEditorObs, visibleRange, reader);
    let firstCharacterChange;
    if (jumpToPos) {
      firstCharacterChange = Range.fromPositions(jumpToPos);
    } else if (diff[0].innerChanges) {
      firstCharacterChange = state.mode === "modified" ? diff[0].innerChanges[0].modifiedRange : diff[0].innerChanges[0].originalRange;
    } else {
      return void 0;
    }
    const preferredRange = growUntilVariableBoundaries(editor.getModel(), firstCharacterChange, 5);
    const leftOffset = this._previewEditorObs.getLeftOfPosition(preferredRange.getStartPosition(), reader);
    const rightOffset = this._previewEditorObs.getLeftOfPosition(preferredRange.getEndPosition(), reader);
    const left = clamp(leftOffset, 0, trueContentWidth);
    const right = clamp(rightOffset, left, trueContentWidth);
    const indentCol = editor.getModel().getLineFirstNonWhitespaceColumn(preferredRange.startLineNumber);
    const indentationEnd = this._previewEditorObs.getLeftOfPosition(new Position(preferredRange.startLineNumber, indentCol), reader);
    const preferredRangeToReveal = new OffsetRange(left, right);
    return {
      indentationEnd,
      preferredRangeToReveal,
      maxEditorWidth: trueContentWidth + l.contentLeft,
      contentWidth: trueContentWidth,
      nonContentWidth: l.contentLeft
      // Width of area that is not content
    };
  }
  layout(dimension, desiredPreviewEditorScrollLeft) {
    this.previewEditor.layout(dimension);
    this._previewEditorObs.editor.setScrollLeft(desiredPreviewEditorScrollLeft);
  }
};
LongDistancePreviewEditor = __decorate([
  __param(4, IInstantiationService)
], LongDistancePreviewEditor);
function growUntilVariableBoundaries(textModel, range, maxGrow) {
  const startPosition = range.getStartPosition();
  const endPosition = range.getEndPosition();
  const line = textModel.getLineContent(startPosition.lineNumber);
  function isVariableNameCharacter(col) {
    const char = line.charAt(col - 1);
    return /[a-zA-Z0-9_]/.test(char);
  }
  __name(isVariableNameCharacter, "isVariableNameCharacter");
  function isWhitespace(col) {
    const char = line.charAt(col - 1);
    return char === " " || char === "	";
  }
  __name(isWhitespace, "isWhitespace");
  let startColumn = startPosition.column;
  while (startColumn > 1 && isVariableNameCharacter(startColumn) && !isWhitespace(startColumn - 1) && startPosition.column - startColumn < maxGrow) {
    startColumn--;
  }
  let endColumn = endPosition.column - 1;
  while (endColumn <= line.length && isVariableNameCharacter(endColumn) && !isWhitespace(endColumn + 1) && endColumn - endPosition.column < maxGrow) {
    endColumn++;
  }
  return new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endColumn + 1);
}
__name(growUntilVariableBoundaries, "growUntilVariableBoundaries");
export {
  LongDistancePreviewEditor
};
//# sourceMappingURL=longDistancePreviewEditor.js.map
