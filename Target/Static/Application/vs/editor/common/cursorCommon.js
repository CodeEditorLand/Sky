var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Position } from "./core/position.js";
import { Range } from "./core/range.js";
import { Selection } from "./core/selection.js";
import { createScopedLineTokens } from "./languages/supports.js";
import { CursorColumns } from "./core/cursorColumns.js";
import { normalizeIndentation } from "./core/misc/indentation.js";
import { InputMode } from "./inputMode.js";
var EditOperationType;
(function(EditOperationType2) {
  EditOperationType2[EditOperationType2["Other"] = 0] = "Other";
  EditOperationType2[EditOperationType2["DeletingLeft"] = 2] = "DeletingLeft";
  EditOperationType2[EditOperationType2["DeletingRight"] = 3] = "DeletingRight";
  EditOperationType2[EditOperationType2["TypingOther"] = 4] = "TypingOther";
  EditOperationType2[EditOperationType2["TypingFirstSpace"] = 5] = "TypingFirstSpace";
  EditOperationType2[EditOperationType2["TypingConsecutiveSpace"] = 6] = "TypingConsecutiveSpace";
})(EditOperationType || (EditOperationType = {}));
const autoCloseAlways = /* @__PURE__ */ __name(() => true, "autoCloseAlways");
const autoCloseNever = /* @__PURE__ */ __name(() => false, "autoCloseNever");
const autoCloseBeforeWhitespace = /* @__PURE__ */ __name((chr) => chr === " " || chr === "	", "autoCloseBeforeWhitespace");
class CursorConfiguration {
  static {
    __name(this, "CursorConfiguration");
  }
  static shouldRecreate(e) {
    return e.hasChanged(
      154
      /* EditorOption.layoutInfo */
    ) || e.hasChanged(
      139
      /* EditorOption.wordSeparators */
    ) || e.hasChanged(
      41
      /* EditorOption.emptySelectionClipboard */
    ) || e.hasChanged(
      81
      /* EditorOption.multiCursorMergeOverlapping */
    ) || e.hasChanged(
      83
      /* EditorOption.multiCursorPaste */
    ) || e.hasChanged(
      84
      /* EditorOption.multiCursorLimit */
    ) || e.hasChanged(
      7
      /* EditorOption.autoClosingBrackets */
    ) || e.hasChanged(
      8
      /* EditorOption.autoClosingComments */
    ) || e.hasChanged(
      12
      /* EditorOption.autoClosingQuotes */
    ) || e.hasChanged(
      10
      /* EditorOption.autoClosingDelete */
    ) || e.hasChanged(
      11
      /* EditorOption.autoClosingOvertype */
    ) || e.hasChanged(
      17
      /* EditorOption.autoSurround */
    ) || e.hasChanged(
      136
      /* EditorOption.useTabStops */
    ) || e.hasChanged(
      55
      /* EditorOption.fontInfo */
    ) || e.hasChanged(
      99
      /* EditorOption.readOnly */
    ) || e.hasChanged(
      138
      /* EditorOption.wordSegmenterLocales */
    ) || e.hasChanged(
      88
      /* EditorOption.overtypeOnPaste */
    );
  }
  constructor(languageId, modelOptions, configuration, languageConfigurationService) {
    this.languageConfigurationService = languageConfigurationService;
    this._cursorMoveConfigurationBrand = void 0;
    this._languageId = languageId;
    const options = configuration.options;
    const layoutInfo = options.get(
      154
      /* EditorOption.layoutInfo */
    );
    const fontInfo = options.get(
      55
      /* EditorOption.fontInfo */
    );
    this.readOnly = options.get(
      99
      /* EditorOption.readOnly */
    );
    this.tabSize = modelOptions.tabSize;
    this.indentSize = modelOptions.indentSize;
    this.insertSpaces = modelOptions.insertSpaces;
    this.stickyTabStops = options.get(
      124
      /* EditorOption.stickyTabStops */
    );
    this.lineHeight = fontInfo.lineHeight;
    this.typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
    this.pageSize = Math.max(1, Math.floor(layoutInfo.height / this.lineHeight) - 2);
    this.useTabStops = options.get(
      136
      /* EditorOption.useTabStops */
    );
    this.wordSeparators = options.get(
      139
      /* EditorOption.wordSeparators */
    );
    this.emptySelectionClipboard = options.get(
      41
      /* EditorOption.emptySelectionClipboard */
    );
    this.copyWithSyntaxHighlighting = options.get(
      28
      /* EditorOption.copyWithSyntaxHighlighting */
    );
    this.multiCursorMergeOverlapping = options.get(
      81
      /* EditorOption.multiCursorMergeOverlapping */
    );
    this.multiCursorPaste = options.get(
      83
      /* EditorOption.multiCursorPaste */
    );
    this.multiCursorLimit = options.get(
      84
      /* EditorOption.multiCursorLimit */
    );
    this.autoClosingBrackets = options.get(
      7
      /* EditorOption.autoClosingBrackets */
    );
    this.autoClosingComments = options.get(
      8
      /* EditorOption.autoClosingComments */
    );
    this.autoClosingQuotes = options.get(
      12
      /* EditorOption.autoClosingQuotes */
    );
    this.autoClosingDelete = options.get(
      10
      /* EditorOption.autoClosingDelete */
    );
    this.autoClosingOvertype = options.get(
      11
      /* EditorOption.autoClosingOvertype */
    );
    this.autoSurround = options.get(
      17
      /* EditorOption.autoSurround */
    );
    this.autoIndent = options.get(
      13
      /* EditorOption.autoIndent */
    );
    this.wordSegmenterLocales = options.get(
      138
      /* EditorOption.wordSegmenterLocales */
    );
    this.overtypeOnPaste = options.get(
      88
      /* EditorOption.overtypeOnPaste */
    );
    this.surroundingPairs = {};
    this._electricChars = null;
    this.shouldAutoCloseBefore = {
      quote: this._getShouldAutoClose(languageId, this.autoClosingQuotes, true),
      comment: this._getShouldAutoClose(languageId, this.autoClosingComments, false),
      bracket: this._getShouldAutoClose(languageId, this.autoClosingBrackets, false)
    };
    this.autoClosingPairs = this.languageConfigurationService.getLanguageConfiguration(languageId).getAutoClosingPairs();
    const surroundingPairs = this.languageConfigurationService.getLanguageConfiguration(languageId).getSurroundingPairs();
    if (surroundingPairs) {
      for (const pair of surroundingPairs) {
        this.surroundingPairs[pair.open] = pair.close;
      }
    }
    const commentsConfiguration = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
    this.blockCommentStartToken = commentsConfiguration?.blockCommentStartToken ?? null;
  }
  get electricChars() {
    if (!this._electricChars) {
      this._electricChars = {};
      const electricChars = this.languageConfigurationService.getLanguageConfiguration(this._languageId).electricCharacter?.getElectricCharacters();
      if (electricChars) {
        for (const char of electricChars) {
          this._electricChars[char] = true;
        }
      }
    }
    return this._electricChars;
  }
  get inputMode() {
    return InputMode.getInputMode();
  }
  /**
   * Should return opening bracket type to match indentation with
   */
  onElectricCharacter(character, context, column) {
    const scopedLineTokens = createScopedLineTokens(context, column - 1);
    const electricCharacterSupport = this.languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId).electricCharacter;
    if (!electricCharacterSupport) {
      return null;
    }
    return electricCharacterSupport.onElectricCharacter(character, scopedLineTokens, column - scopedLineTokens.firstCharOffset);
  }
  normalizeIndentation(str) {
    return normalizeIndentation(str, this.indentSize, this.insertSpaces);
  }
  _getShouldAutoClose(languageId, autoCloseConfig, forQuotes) {
    switch (autoCloseConfig) {
      case "beforeWhitespace":
        return autoCloseBeforeWhitespace;
      case "languageDefined":
        return this._getLanguageDefinedShouldAutoClose(languageId, forQuotes);
      case "always":
        return autoCloseAlways;
      case "never":
        return autoCloseNever;
    }
  }
  _getLanguageDefinedShouldAutoClose(languageId, forQuotes) {
    const autoCloseBeforeSet = this.languageConfigurationService.getLanguageConfiguration(languageId).getAutoCloseBeforeSet(forQuotes);
    return (c) => autoCloseBeforeSet.indexOf(c) !== -1;
  }
  /**
   * Returns a visible column from a column.
   * @see {@link CursorColumns}
   */
  visibleColumnFromColumn(model, position) {
    return CursorColumns.visibleColumnFromColumn(model.getLineContent(position.lineNumber), position.column, this.tabSize);
  }
  /**
   * Returns a visible column from a column.
   * @see {@link CursorColumns}
   */
  columnFromVisibleColumn(model, lineNumber, visibleColumn) {
    const result = CursorColumns.columnFromVisibleColumn(model.getLineContent(lineNumber), visibleColumn, this.tabSize);
    const minColumn = model.getLineMinColumn(lineNumber);
    if (result < minColumn) {
      return minColumn;
    }
    const maxColumn = model.getLineMaxColumn(lineNumber);
    if (result > maxColumn) {
      return maxColumn;
    }
    return result;
  }
}
class CursorState {
  static {
    __name(this, "CursorState");
  }
  static fromModelState(modelState) {
    return new PartialModelCursorState(modelState);
  }
  static fromViewState(viewState) {
    return new PartialViewCursorState(viewState);
  }
  static fromModelSelection(modelSelection) {
    const selection = Selection.liftSelection(modelSelection);
    const modelState = new SingleCursorState(Range.fromPositions(selection.getSelectionStart()), 0, 0, selection.getPosition(), 0);
    return CursorState.fromModelState(modelState);
  }
  static fromModelSelections(modelSelections) {
    const states = [];
    for (let i = 0, len = modelSelections.length; i < len; i++) {
      states[i] = this.fromModelSelection(modelSelections[i]);
    }
    return states;
  }
  constructor(modelState, viewState) {
    this._cursorStateBrand = void 0;
    this.modelState = modelState;
    this.viewState = viewState;
  }
  equals(other) {
    return this.viewState.equals(other.viewState) && this.modelState.equals(other.modelState);
  }
}
class PartialModelCursorState {
  static {
    __name(this, "PartialModelCursorState");
  }
  constructor(modelState) {
    this.modelState = modelState;
    this.viewState = null;
  }
}
class PartialViewCursorState {
  static {
    __name(this, "PartialViewCursorState");
  }
  constructor(viewState) {
    this.modelState = null;
    this.viewState = viewState;
  }
}
var SelectionStartKind;
(function(SelectionStartKind2) {
  SelectionStartKind2[SelectionStartKind2["Simple"] = 0] = "Simple";
  SelectionStartKind2[SelectionStartKind2["Word"] = 1] = "Word";
  SelectionStartKind2[SelectionStartKind2["Line"] = 2] = "Line";
})(SelectionStartKind || (SelectionStartKind = {}));
class SingleCursorState {
  static {
    __name(this, "SingleCursorState");
  }
  constructor(selectionStart, selectionStartKind, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns) {
    this.selectionStart = selectionStart;
    this.selectionStartKind = selectionStartKind;
    this.selectionStartLeftoverVisibleColumns = selectionStartLeftoverVisibleColumns;
    this.position = position;
    this.leftoverVisibleColumns = leftoverVisibleColumns;
    this._singleCursorStateBrand = void 0;
    this.selection = SingleCursorState._computeSelection(this.selectionStart, this.position);
  }
  equals(other) {
    return this.selectionStartLeftoverVisibleColumns === other.selectionStartLeftoverVisibleColumns && this.leftoverVisibleColumns === other.leftoverVisibleColumns && this.selectionStartKind === other.selectionStartKind && this.position.equals(other.position) && this.selectionStart.equalsRange(other.selectionStart);
  }
  hasSelection() {
    return !this.selection.isEmpty() || !this.selectionStart.isEmpty();
  }
  move(inSelectionMode, lineNumber, column, leftoverVisibleColumns) {
    if (inSelectionMode) {
      return new SingleCursorState(this.selectionStart, this.selectionStartKind, this.selectionStartLeftoverVisibleColumns, new Position(lineNumber, column), leftoverVisibleColumns);
    } else {
      return new SingleCursorState(new Range(lineNumber, column, lineNumber, column), 0, leftoverVisibleColumns, new Position(lineNumber, column), leftoverVisibleColumns);
    }
  }
  static _computeSelection(selectionStart, position) {
    if (selectionStart.isEmpty() || !position.isBeforeOrEqual(selectionStart.getStartPosition())) {
      return Selection.fromPositions(selectionStart.getStartPosition(), position);
    } else {
      return Selection.fromPositions(selectionStart.getEndPosition(), position);
    }
  }
}
class EditOperationResult {
  static {
    __name(this, "EditOperationResult");
  }
  constructor(type, commands, opts) {
    this._editOperationResultBrand = void 0;
    this.type = type;
    this.commands = commands;
    this.shouldPushStackElementBefore = opts.shouldPushStackElementBefore;
    this.shouldPushStackElementAfter = opts.shouldPushStackElementAfter;
  }
}
function isQuote(ch) {
  return ch === "'" || ch === '"' || ch === "`";
}
__name(isQuote, "isQuote");
export {
  CursorConfiguration,
  CursorState,
  EditOperationResult,
  EditOperationType,
  PartialModelCursorState,
  PartialViewCursorState,
  SelectionStartKind,
  SingleCursorState,
  isQuote
};
//# sourceMappingURL=cursorCommon.js.map
