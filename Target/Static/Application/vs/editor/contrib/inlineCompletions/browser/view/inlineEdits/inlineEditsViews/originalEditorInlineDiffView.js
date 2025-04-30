var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../../base/common/lifecycle.js";
import { autorunWithStore, derived, observableFromEvent } from "../../../../../../../base/common/observable.js";
import { observableCodeEditor } from "../../../../../../browser/observableCodeEditor.js";
import { rangeIsSingleLine } from "../../../../../../browser/widget/diffEditor/components/diffEditorViewZones/diffEditorViewZones.js";
import { OffsetRange } from "../../../../../../common/core/offsetRange.js";
import { Range } from "../../../../../../common/core/range.js";
import { InjectedTextCursorStops } from "../../../../../../common/model.js";
import { ModelDecorationOptions } from "../../../../../../common/model/textModel.js";
import { classNames } from "../utils/utils.js";
class OriginalEditorInlineDiffView extends Disposable {
  static {
    __name(this, "OriginalEditorInlineDiffView");
  }
  static supportsInlineDiffRendering(mapping) {
    return allowsTrueInlineDiffRendering(mapping);
  }
  constructor(_originalEditor, _state, _modifiedTextModel) {
    super();
    this._originalEditor = _originalEditor;
    this._state = _state;
    this._modifiedTextModel = _modifiedTextModel;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this.isHovered = observableCodeEditor(this._originalEditor).isTargetHovered((p) => p.target.type === 6 && p.target.detail.injectedText?.options.attachedData instanceof InlineEditAttachedData && p.target.detail.injectedText.options.attachedData.owner === this, this._store);
    this._tokenizationFinished = modelTokenizationFinished(this._modifiedTextModel);
    this._decorations = derived(this, (reader) => {
      const diff = this._state.read(reader);
      if (!diff) {
        return void 0;
      }
      const modified = diff.modifiedText;
      const showInline = diff.mode === "insertionInline";
      const hasOneInnerChange = diff.diff.length === 1 && diff.diff[0].innerChanges?.length === 1;
      const showEmptyDecorations = true;
      const originalDecorations = [];
      const modifiedDecorations = [];
      const diffLineAddDecorationBackground = ModelDecorationOptions.register({
        className: "inlineCompletions-line-insert",
        description: "line-insert",
        isWholeLine: true,
        marginClassName: "gutter-insert"
      });
      const diffLineDeleteDecorationBackground = ModelDecorationOptions.register({
        className: "inlineCompletions-line-delete",
        description: "line-delete",
        isWholeLine: true,
        marginClassName: "gutter-delete"
      });
      const diffWholeLineDeleteDecoration = ModelDecorationOptions.register({
        className: "inlineCompletions-char-delete",
        description: "char-delete",
        isWholeLine: false
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
      const diffAddDecorationEmpty = ModelDecorationOptions.register({
        className: "inlineCompletions-char-insert diff-range-empty",
        description: "char-insert diff-range-empty"
      });
      for (const m of diff.diff) {
        const showFullLineDecorations = diff.mode !== "sideBySide" && diff.mode !== "deletion" && diff.mode !== "insertionInline";
        if (showFullLineDecorations) {
          if (!m.original.isEmpty) {
            originalDecorations.push({
              range: m.original.toInclusiveRange(),
              options: diffLineDeleteDecorationBackground
            });
          }
          if (!m.modified.isEmpty) {
            modifiedDecorations.push({
              range: m.modified.toInclusiveRange(),
              options: diffLineAddDecorationBackground
            });
          }
        }
        if (m.modified.isEmpty || m.original.isEmpty) {
          if (!m.original.isEmpty) {
            originalDecorations.push({ range: m.original.toInclusiveRange(), options: diffWholeLineDeleteDecoration });
          }
          if (!m.modified.isEmpty) {
            modifiedDecorations.push({ range: m.modified.toInclusiveRange(), options: diffWholeLineAddDecoration });
          }
        } else {
          const useInlineDiff = showInline && allowsTrueInlineDiffRendering(m);
          for (const i2 of m.innerChanges || []) {
            if (m.original.contains(i2.originalRange.startLineNumber)) {
              const replacedText = this._originalEditor.getModel()?.getValueInRange(
                i2.originalRange,
                1
                /* EndOfLinePreference.LF */
              );
              originalDecorations.push({
                range: i2.originalRange,
                options: {
                  description: "char-delete",
                  shouldFillLineOnLineBreak: false,
                  className: classNames("inlineCompletions-char-delete", i2.originalRange.isSingleLine() && diff.mode === "insertionInline" && "single-line-inline", i2.originalRange.isEmpty() && "empty", (i2.originalRange.isEmpty() && hasOneInnerChange || diff.mode === "deletion" && replacedText === "\n") && showEmptyDecorations && !useInlineDiff && "diff-range-empty"),
                  inlineClassName: useInlineDiff ? classNames("strike-through", "inlineCompletions") : null,
                  zIndex: 1
                }
              });
            }
            if (m.modified.contains(i2.modifiedRange.startLineNumber)) {
              modifiedDecorations.push({
                range: i2.modifiedRange,
                options: i2.modifiedRange.isEmpty() && showEmptyDecorations && !useInlineDiff && hasOneInnerChange ? diffAddDecorationEmpty : diffAddDecoration
              });
            }
            if (useInlineDiff) {
              const insertedText = modified.getValueOfRange(i2.modifiedRange);
              const textSegments = insertedText.length > 3 ? [
                { text: insertedText.slice(0, 1), extraClasses: ["start"], offsetRange: new OffsetRange(i2.modifiedRange.startColumn - 1, i2.modifiedRange.startColumn) },
                { text: insertedText.slice(1, -1), extraClasses: [], offsetRange: new OffsetRange(i2.modifiedRange.startColumn, i2.modifiedRange.endColumn - 2) },
                { text: insertedText.slice(-1), extraClasses: ["end"], offsetRange: new OffsetRange(i2.modifiedRange.endColumn - 2, i2.modifiedRange.endColumn - 1) }
              ] : [
                { text: insertedText, extraClasses: ["start", "end"], offsetRange: new OffsetRange(i2.modifiedRange.startColumn - 1, i2.modifiedRange.endColumn) }
              ];
              this._tokenizationFinished.read(reader);
              const lineTokens = this._modifiedTextModel.tokenization.getLineTokens(i2.modifiedRange.startLineNumber);
              for (const { text, extraClasses, offsetRange } of textSegments) {
                originalDecorations.push({
                  range: Range.fromPositions(i2.originalRange.getEndPosition()),
                  options: {
                    description: "inserted-text",
                    before: {
                      tokens: lineTokens.getTokensInRange(offsetRange),
                      content: text,
                      inlineClassName: classNames(
                        "inlineCompletions-char-insert",
                        i2.modifiedRange.isSingleLine() && diff.mode === "insertionInline" && "single-line-inline",
                        ...extraClasses
                        // include extraClasses for additional styling if provided
                      ),
                      cursorStops: InjectedTextCursorStops.None,
                      attachedData: new InlineEditAttachedData(this)
                    },
                    zIndex: 2,
                    showIfCollapsed: true
                  }
                });
              }
            }
          }
        }
      }
      return { originalDecorations, modifiedDecorations };
    });
    this._register(observableCodeEditor(this._originalEditor).setDecorations(this._decorations.map((d) => d?.originalDecorations ?? [])));
    const modifiedCodeEditor = this._state.map((s) => s?.modifiedCodeEditor);
    this._register(autorunWithStore((reader, store) => {
      const e = modifiedCodeEditor.read(reader);
      if (e) {
        store.add(observableCodeEditor(e).setDecorations(this._decorations.map((d) => d?.modifiedDecorations ?? [])));
      }
    }));
    this._register(this._originalEditor.onMouseUp((e) => {
      if (e.target.type !== 6) {
        return;
      }
      const a = e.target.detail.injectedText?.options.attachedData;
      if (a instanceof InlineEditAttachedData && a.owner === this) {
        this._onDidClick.fire(e.event);
      }
    }));
  }
}
class InlineEditAttachedData {
  static {
    __name(this, "InlineEditAttachedData");
  }
  constructor(owner) {
    this.owner = owner;
  }
}
function allowsTrueInlineDiffRendering(mapping) {
  if (!mapping.innerChanges) {
    return false;
  }
  return mapping.innerChanges.every((c) => rangeIsSingleLine(c.modifiedRange) && rangeIsSingleLine(c.originalRange));
}
__name(allowsTrueInlineDiffRendering, "allowsTrueInlineDiffRendering");
let i = 0;
function modelTokenizationFinished(model) {
  return observableFromEvent(model.onDidChangeTokens, () => i++);
}
__name(modelTokenizationFinished, "modelTokenizationFinished");
export {
  OriginalEditorInlineDiffView
};
//# sourceMappingURL=originalEditorInlineDiffView.js.map
