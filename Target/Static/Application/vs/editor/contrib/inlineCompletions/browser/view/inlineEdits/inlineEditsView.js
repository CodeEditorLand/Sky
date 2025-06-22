var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equalsIfDefined, itemEquals } from "../../../../../../base/common/equals.js";
import { BugIndicatingError } from "../../../../../../base/common/errors.js";
import { Event } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorunWithStore, derived, derivedOpts, mapObservableArrayCached, observableValue } from "../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { observableCodeEditor } from "../../../../../browser/observableCodeEditor.js";
import { LineRange } from "../../../../../common/core/ranges/lineRange.js";
import { Range } from "../../../../../common/core/range.js";
import { TextReplacement } from "../../../../../common/core/edits/textEdit.js";
import { StringText } from "../../../../../common/core/text/abstractText.js";
import { TextLength } from "../../../../../common/core/text/textLength.js";
import { lineRangeMappingFromRangeMappings, RangeMapping } from "../../../../../common/diff/rangeMapping.js";
import { TextModel } from "../../../../../common/model/textModel.js";
import { InlineEditsGutterIndicator } from "./components/gutterIndicatorView.js";
import { InlineEditsOnboardingExperience } from "./inlineEditsNewUsers.js";
import { InlineCompletionViewKind, InlineEditTabAction } from "./inlineEditsViewInterface.js";
import { InlineEditsCollapsedView } from "./inlineEditsViews/inlineEditsCollapsedView.js";
import { InlineEditsCustomView } from "./inlineEditsViews/inlineEditsCustomView.js";
import { InlineEditsDeletionView } from "./inlineEditsViews/inlineEditsDeletionView.js";
import { InlineEditsInsertionView } from "./inlineEditsViews/inlineEditsInsertionView.js";
import { InlineEditsLineReplacementView } from "./inlineEditsViews/inlineEditsLineReplacementView.js";
import { InlineEditsSideBySideView } from "./inlineEditsViews/inlineEditsSideBySideView.js";
import { InlineEditsWordReplacementView } from "./inlineEditsViews/inlineEditsWordReplacementView.js";
import { OriginalEditorInlineDiffView } from "./inlineEditsViews/originalEditorInlineDiffView.js";
import { applyEditToModifiedRangeMappings, createReindentEdit } from "./utils/utils.js";
import "./view.css";
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
var InlineEditsView_1;
let InlineEditsView = InlineEditsView_1 = class InlineEditsView2 extends Disposable {
  static {
    __name(this, "InlineEditsView");
  }
  constructor(_editor, _host, _model, _ghostTextIndicator, _focusIsInMenu, _instantiationService) {
    super();
    this._editor = _editor;
    this._host = _host;
    this._model = _model;
    this._ghostTextIndicator = _ghostTextIndicator;
    this._focusIsInMenu = _focusIsInMenu;
    this._instantiationService = _instantiationService;
    this._editorObs = observableCodeEditor(this._editor);
    this._tabAction = derived((reader) => this._model.read(reader)?.tabAction.read(reader) ?? InlineEditTabAction.Inactive);
    this._constructorDone = observableValue(this, false);
    this._uiState = derived(this, (reader) => {
      const model = this._model.read(reader);
      if (!model || !this._constructorDone.read(reader)) {
        return void 0;
      }
      const inlineEdit = model.inlineEdit;
      let mappings = RangeMapping.fromEdit(inlineEdit.edit);
      let newText = inlineEdit.edit.apply(inlineEdit.originalText);
      let diff = lineRangeMappingFromRangeMappings(mappings, inlineEdit.originalText, new StringText(newText));
      let state = this.determineRenderState(model, reader, diff, new StringText(newText));
      if (!state) {
        model.abort(`unable to determine view: tried to render ${this._previousView?.view}`);
        return void 0;
      }
      if (state.kind === InlineCompletionViewKind.SideBySide) {
        const indentationAdjustmentEdit = createReindentEdit(newText, inlineEdit.modifiedLineRange);
        newText = indentationAdjustmentEdit.applyToString(newText);
        mappings = applyEditToModifiedRangeMappings(mappings, indentationAdjustmentEdit);
        diff = lineRangeMappingFromRangeMappings(mappings, inlineEdit.originalText, new StringText(newText));
      }
      this._previewTextModel.setLanguage(this._editor.getModel().getLanguageId());
      const previousNewText = this._previewTextModel.getValue();
      if (previousNewText !== newText) {
        this._previewTextModel.setValue(newText);
      }
      if (model.showCollapsed.read(reader) && !this._indicator.read(reader)?.isHoverVisible.read(reader)) {
        state = { kind: InlineCompletionViewKind.Collapsed };
      }
      model.handleInlineEditShown(state.kind);
      return {
        state,
        diff,
        edit: inlineEdit,
        newText,
        newTextLineCount: inlineEdit.modifiedLineRange.length,
        isInDiffEditor: model.isInDiffEditor
      };
    });
    this._previewTextModel = this._register(this._instantiationService.createInstance(TextModel, "", this._editor.getModel().getLanguageId(), { ...TextModel.DEFAULT_CREATION_OPTIONS, bracketPairColorizationOptions: { enabled: true, independentColorPoolPerBracketType: false } }, null));
    this._indicatorCyclicDependencyCircuitBreaker = observableValue(this, false);
    this._indicator = derived(this, (reader) => {
      if (!this._indicatorCyclicDependencyCircuitBreaker.read(reader)) {
        return void 0;
      }
      const indicatorDisplayRange = derivedOpts({ owner: this, equalsFn: equalsIfDefined(itemEquals()) }, (reader2) => {
        const ghostTextIndicator = this._ghostTextIndicator.read(reader2);
        if (ghostTextIndicator) {
          return ghostTextIndicator.lineRange;
        }
        const state = this._uiState.read(reader2);
        if (!state) {
          return void 0;
        }
        if (state.state?.kind === "custom") {
          const range = state.state.displayLocation?.range;
          if (!range) {
            throw new BugIndicatingError("custom view should have a range");
          }
          return new LineRange(range.startLineNumber, range.endLineNumber);
        }
        if (state.state?.kind === "insertionMultiLine") {
          return this._insertion.originalLines.read(reader2);
        }
        return state.edit.displayRange;
      });
      const modelWithGhostTextSupport = derived(this, (reader2) => {
        const model = this._model.read(reader2);
        if (model) {
          return model;
        }
        const ghostTextIndicator = this._ghostTextIndicator.read(reader2);
        if (ghostTextIndicator) {
          return ghostTextIndicator.model;
        }
        return model;
      });
      return reader.store.add(this._instantiationService.createInstance(InlineEditsGutterIndicator, this._editorObs, indicatorDisplayRange, this._gutterIndicatorOffset, modelWithGhostTextSupport, this._inlineEditsIsHovered, this._focusIsInMenu));
    });
    this._inlineEditsIsHovered = derived(this, (reader) => {
      return this._sideBySide.isHovered.read(reader) || this._wordReplacementViews.read(reader).some((v) => v.isHovered.read(reader)) || this._deletion.isHovered.read(reader) || this._inlineDiffView.isHovered.read(reader) || this._lineReplacementView.isHovered.read(reader) || this._insertion.isHovered.read(reader) || this._customView.isHovered.read(reader);
    });
    this._gutterIndicatorOffset = derived(this, (reader) => {
      if (this._uiState.read(reader)?.state?.kind === "insertionMultiLine") {
        return this._insertion.startLineOffset.read(reader);
      }
      const ghostTextIndicator = this._ghostTextIndicator.read(reader);
      if (ghostTextIndicator) {
        return getGhostTextTopOffset(ghostTextIndicator, this._editor);
      }
      return 0;
    });
    this._sideBySide = this._register(this._instantiationService.createInstance(InlineEditsSideBySideView, this._editor, this._model.map((m) => m?.inlineEdit), this._previewTextModel, this._uiState.map((s) => s && s.state?.kind === InlineCompletionViewKind.SideBySide ? {
      newTextLineCount: s.newTextLineCount,
      isInDiffEditor: s.isInDiffEditor
    } : void 0), this._tabAction));
    this._deletion = this._register(this._instantiationService.createInstance(InlineEditsDeletionView, this._editor, this._model.map((m) => m?.inlineEdit), this._uiState.map((s) => s && s.state?.kind === InlineCompletionViewKind.Deletion ? {
      originalRange: s.state.originalRange,
      deletions: s.state.deletions,
      inDiffEditor: s.isInDiffEditor
    } : void 0), this._tabAction));
    this._insertion = this._register(this._instantiationService.createInstance(InlineEditsInsertionView, this._editor, this._uiState.map((s) => s && s.state?.kind === InlineCompletionViewKind.InsertionMultiLine ? {
      lineNumber: s.state.lineNumber,
      startColumn: s.state.column,
      text: s.state.text,
      inDiffEditor: s.isInDiffEditor
    } : void 0), this._tabAction));
    this._inlineDiffViewState = derived(this, (reader) => {
      const e = this._uiState.read(reader);
      if (!e || !e.state) {
        return void 0;
      }
      if (e.state.kind === "wordReplacements" || e.state.kind === "insertionMultiLine" || e.state.kind === "collapsed" || e.state.kind === "custom") {
        return void 0;
      }
      return {
        modifiedText: new StringText(e.newText),
        diff: e.diff,
        mode: e.state.kind,
        modifiedCodeEditor: this._sideBySide.previewEditor,
        isInDiffEditor: e.isInDiffEditor
      };
    });
    this._inlineCollapsedView = this._register(this._instantiationService.createInstance(InlineEditsCollapsedView, this._editor, this._model.map((m, reader) => this._uiState.read(reader)?.state?.kind === "collapsed" ? m?.inlineEdit : void 0)));
    this._customView = this._register(this._instantiationService.createInstance(InlineEditsCustomView, this._editor, this._model.map((m, reader) => this._uiState.read(reader)?.state?.kind === "custom" ? m?.displayLocation : void 0), this._tabAction));
    this._inlineDiffView = this._register(new OriginalEditorInlineDiffView(this._editor, this._inlineDiffViewState, this._previewTextModel));
    this._wordReplacementViews = mapObservableArrayCached(this, this._uiState.map((s) => s?.state?.kind === "wordReplacements" ? s.state.replacements : []), (e, store) => {
      return store.add(this._instantiationService.createInstance(InlineEditsWordReplacementView, this._editorObs, e, this._tabAction));
    });
    this._lineReplacementView = this._register(this._instantiationService.createInstance(InlineEditsLineReplacementView, this._editorObs, this._uiState.map((s) => s?.state?.kind === InlineCompletionViewKind.LineReplacement ? {
      originalRange: s.state.originalRange,
      modifiedRange: s.state.modifiedRange,
      modifiedLines: s.state.modifiedLines,
      replacements: s.state.replacements
    } : void 0), this._uiState.map((s) => s?.isInDiffEditor ?? false), this._tabAction));
    this._useCodeShifting = this._editorObs.getOption(
      67
      /* EditorOption.inlineSuggest */
    ).map((s) => s.edits.allowCodeShifting);
    this._renderSideBySide = this._editorObs.getOption(
      67
      /* EditorOption.inlineSuggest */
    ).map((s) => s.edits.renderSideBySide);
    this._register(autorunWithStore((reader, store) => {
      const model = this._model.read(reader);
      if (!model) {
        return;
      }
      store.add(Event.any(this._sideBySide.onDidClick, this._deletion.onDidClick, this._lineReplacementView.onDidClick, this._insertion.onDidClick, ...this._wordReplacementViews.read(reader).map((w) => w.onDidClick), this._inlineDiffView.onDidClick, this._customView.onDidClick)((e) => {
        if (this._viewHasBeenShownLongerThan(350)) {
          e.preventDefault();
          model.accept();
        }
      }));
    }));
    this._indicator.recomputeInitiallyAndOnChange(this._store);
    this._wordReplacementViews.recomputeInitiallyAndOnChange(this._store);
    this._indicatorCyclicDependencyCircuitBreaker.set(true, void 0);
    this._register(this._instantiationService.createInstance(InlineEditsOnboardingExperience, this._host, this._model, this._indicator, this._inlineCollapsedView));
    this._constructorDone.set(true, void 0);
  }
  getCacheId(model) {
    return model.inlineEdit.inlineCompletion.identity.id;
  }
  determineView(model, reader, diff, newText) {
    const inlineEdit = model.inlineEdit;
    const canUseCache = this._previousView?.id === this.getCacheId(model);
    const reconsiderViewEditorWidthChange = this._previousView?.editorWidth !== this._editorObs.layoutInfoWidth.read(reader) && (this._previousView?.view === InlineCompletionViewKind.SideBySide || this._previousView?.view === InlineCompletionViewKind.LineReplacement);
    if (canUseCache && !reconsiderViewEditorWidthChange) {
      return this._previousView.view;
    }
    if (model.displayLocation) {
      return InlineCompletionViewKind.Custom;
    }
    const numOriginalLines = inlineEdit.originalLineRange.length;
    const numModifiedLines = inlineEdit.modifiedLineRange.length;
    const inner = diff.flatMap((d) => d.innerChanges ?? []);
    const isSingleInnerEdit = inner.length === 1;
    if (!model.isInDiffEditor) {
      if (isSingleInnerEdit && this._useCodeShifting.read(reader) !== "never" && isSingleLineInsertion(diff)) {
        if (isSingleLineInsertionAfterPosition(diff, inlineEdit.cursorPosition)) {
          return InlineCompletionViewKind.InsertionInline;
        }
        return InlineCompletionViewKind.LineReplacement;
      }
      if (isDeletion(inner, inlineEdit, newText)) {
        return InlineCompletionViewKind.Deletion;
      }
      if (isSingleMultiLineInsertion(diff) && this._useCodeShifting.read(reader) === "always") {
        return InlineCompletionViewKind.InsertionMultiLine;
      }
      const allInnerChangesNotTooLong = inner.every((m) => TextLength.ofRange(m.originalRange).columnCount < InlineEditsWordReplacementView.MAX_LENGTH && TextLength.ofRange(m.modifiedRange).columnCount < InlineEditsWordReplacementView.MAX_LENGTH);
      if (allInnerChangesNotTooLong && isSingleInnerEdit && numOriginalLines === 1 && numModifiedLines === 1) {
        if (!inner.some((m) => m.originalRange.isEmpty()) || !growEditsUntilWhitespace(inner.map((m) => new TextReplacement(m.originalRange, "")), inlineEdit.originalText).some((e) => e.range.isEmpty() && TextLength.ofRange(e.range).columnCount < InlineEditsWordReplacementView.MAX_LENGTH)) {
          return InlineCompletionViewKind.WordReplacements;
        }
      }
    }
    if (numOriginalLines > 0 && numModifiedLines > 0) {
      if (numOriginalLines === 1 && numModifiedLines === 1 && !model.isInDiffEditor) {
        return InlineCompletionViewKind.LineReplacement;
      }
      if (this._renderSideBySide.read(reader) !== "never" && InlineEditsSideBySideView.fitsInsideViewport(this._editor, this._previewTextModel, inlineEdit, reader)) {
        return InlineCompletionViewKind.SideBySide;
      }
      return InlineCompletionViewKind.LineReplacement;
    }
    if (model.isInDiffEditor) {
      if (isDeletion(inner, inlineEdit, newText)) {
        return InlineCompletionViewKind.Deletion;
      }
      if (isSingleMultiLineInsertion(diff) && this._useCodeShifting.read(reader) === "always") {
        return InlineCompletionViewKind.InsertionMultiLine;
      }
    }
    return InlineCompletionViewKind.SideBySide;
  }
  determineRenderState(model, reader, diff, newText) {
    const inlineEdit = model.inlineEdit;
    const view = this.determineView(model, reader, diff, newText);
    this._previousView = { id: this.getCacheId(model), view, editorWidth: this._editor.getLayoutInfo().width, timestamp: Date.now() };
    switch (view) {
      case InlineCompletionViewKind.InsertionInline:
        return { kind: InlineCompletionViewKind.InsertionInline };
      case InlineCompletionViewKind.SideBySide:
        return { kind: InlineCompletionViewKind.SideBySide };
      case InlineCompletionViewKind.Collapsed:
        return { kind: InlineCompletionViewKind.Collapsed };
      case InlineCompletionViewKind.Custom:
        return { kind: InlineCompletionViewKind.Custom, displayLocation: model.displayLocation };
    }
    const inner = diff.flatMap((d) => d.innerChanges ?? []);
    if (view === InlineCompletionViewKind.Deletion) {
      return {
        kind: InlineCompletionViewKind.Deletion,
        originalRange: inlineEdit.originalLineRange,
        deletions: inner.map((m) => m.originalRange)
      };
    }
    if (view === InlineCompletionViewKind.InsertionMultiLine) {
      const change = inner[0];
      return {
        kind: InlineCompletionViewKind.InsertionMultiLine,
        lineNumber: change.originalRange.startLineNumber,
        column: change.originalRange.startColumn,
        text: newText.getValueOfRange(change.modifiedRange)
      };
    }
    const replacements = inner.map((m) => new TextReplacement(m.originalRange, newText.getValueOfRange(m.modifiedRange)));
    if (replacements.length === 0) {
      return void 0;
    }
    if (view === InlineCompletionViewKind.WordReplacements) {
      let grownEdits = growEditsToEntireWord(replacements, inlineEdit.originalText);
      if (grownEdits.some((e) => e.range.isEmpty())) {
        grownEdits = growEditsUntilWhitespace(replacements, inlineEdit.originalText);
      }
      return {
        kind: InlineCompletionViewKind.WordReplacements,
        replacements: grownEdits
      };
    }
    if (view === InlineCompletionViewKind.LineReplacement) {
      return {
        kind: InlineCompletionViewKind.LineReplacement,
        originalRange: inlineEdit.originalLineRange,
        modifiedRange: inlineEdit.modifiedLineRange,
        modifiedLines: inlineEdit.modifiedLineRange.mapToLineArray((line) => newText.getLineAt(line)),
        replacements: inner.map((m) => ({ originalRange: m.originalRange, modifiedRange: m.modifiedRange }))
      };
    }
    return void 0;
  }
  _viewHasBeenShownLongerThan(durationMs) {
    const viewCreationTime = this._previousView?.timestamp;
    if (!viewCreationTime) {
      throw new BugIndicatingError("viewHasBeenShownLongThan called before a view has been shown");
    }
    const currentTime = Date.now();
    return currentTime - viewCreationTime >= durationMs;
  }
};
InlineEditsView = InlineEditsView_1 = __decorate([
  __param(5, IInstantiationService)
], InlineEditsView);
function isSingleLineInsertion(diff) {
  return diff.every((m) => m.innerChanges.every((r) => isWordInsertion(r)));
  function isWordInsertion(r) {
    if (!r.originalRange.isEmpty()) {
      return false;
    }
    const isInsertionWithinLine = r.modifiedRange.startLineNumber === r.modifiedRange.endLineNumber;
    if (!isInsertionWithinLine) {
      return false;
    }
    return true;
  }
  __name(isWordInsertion, "isWordInsertion");
}
__name(isSingleLineInsertion, "isSingleLineInsertion");
function isSingleLineInsertionAfterPosition(diff, position) {
  if (!position) {
    return false;
  }
  if (!isSingleLineInsertion(diff)) {
    return false;
  }
  const pos = position;
  return diff.every((m) => m.innerChanges.every((r) => isStableWordInsertion(r)));
  function isStableWordInsertion(r) {
    const insertPosition = r.originalRange.getStartPosition();
    if (pos.isBeforeOrEqual(insertPosition)) {
      return true;
    }
    if (insertPosition.lineNumber < pos.lineNumber) {
      return true;
    }
    return false;
  }
  __name(isStableWordInsertion, "isStableWordInsertion");
}
__name(isSingleLineInsertionAfterPosition, "isSingleLineInsertionAfterPosition");
function isSingleMultiLineInsertion(diff) {
  const inner = diff.flatMap((d) => d.innerChanges ?? []);
  if (inner.length !== 1) {
    return false;
  }
  const change = inner[0];
  if (!change.originalRange.isEmpty()) {
    return false;
  }
  if (change.modifiedRange.startLineNumber === change.modifiedRange.endLineNumber) {
    return false;
  }
  return true;
}
__name(isSingleMultiLineInsertion, "isSingleMultiLineInsertion");
function isDeletion(inner, inlineEdit, newText) {
  const innerValues = inner.map((m) => ({ original: inlineEdit.originalText.getValueOfRange(m.originalRange), modified: newText.getValueOfRange(m.modifiedRange) }));
  return innerValues.every(({ original, modified }) => modified.trim() === "" && original.length > 0 && (original.length > modified.length || original.trim() !== ""));
}
__name(isDeletion, "isDeletion");
function growEditsToEntireWord(replacements, originalText) {
  return _growEdits(replacements, originalText, (char) => /^[a-zA-Z]$/.test(char));
}
__name(growEditsToEntireWord, "growEditsToEntireWord");
function growEditsUntilWhitespace(replacements, originalText) {
  return _growEdits(replacements, originalText, (char) => !/^\s$/.test(char));
}
__name(growEditsUntilWhitespace, "growEditsUntilWhitespace");
function _growEdits(replacements, originalText, fn) {
  const result = [];
  replacements.sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range));
  for (const edit of replacements) {
    let startIndex = edit.range.startColumn - 1;
    let endIndex = edit.range.endColumn - 2;
    let prefix = "";
    let suffix = "";
    const startLineContent = originalText.getLineAt(edit.range.startLineNumber);
    const endLineContent = originalText.getLineAt(edit.range.endLineNumber);
    if (isIncluded(startLineContent[startIndex])) {
      while (isIncluded(startLineContent[startIndex - 1])) {
        prefix = startLineContent[startIndex - 1] + prefix;
        startIndex--;
      }
    }
    if (isIncluded(endLineContent[endIndex]) || endIndex < startIndex) {
      while (isIncluded(endLineContent[endIndex + 1])) {
        suffix += endLineContent[endIndex + 1];
        endIndex++;
      }
    }
    let newEdit = new TextReplacement(new Range(edit.range.startLineNumber, startIndex + 1, edit.range.endLineNumber, endIndex + 2), prefix + edit.text + suffix);
    if (result.length > 0 && Range.areIntersectingOrTouching(result[result.length - 1].range, newEdit.range)) {
      newEdit = TextReplacement.joinReplacements([result.pop(), newEdit], originalText);
    }
    result.push(newEdit);
  }
  function isIncluded(c) {
    if (c === void 0) {
      return false;
    }
    return fn(c);
  }
  __name(isIncluded, "isIncluded");
  return result;
}
__name(_growEdits, "_growEdits");
function getGhostTextTopOffset(ghostTextIndicator, editor) {
  const replacements = ghostTextIndicator.model.inlineEdit.edit.replacements;
  if (replacements.length !== 1) {
    return 0;
  }
  const textModel = editor.getModel();
  if (!textModel) {
    return 0;
  }
  const EOL = textModel.getEOL();
  const replacement = replacements[0];
  if (replacement.range.isEmpty() && replacement.text.startsWith(EOL)) {
    const lineHeight = editor.getLineHeightForPosition(replacement.range.getStartPosition());
    return countPrefixRepeats(replacement.text, EOL) * lineHeight;
  }
  return 0;
}
__name(getGhostTextTopOffset, "getGhostTextTopOffset");
function countPrefixRepeats(str, prefix) {
  if (!prefix.length) {
    return 0;
  }
  let count = 0;
  let i = 0;
  while (str.startsWith(prefix, i)) {
    count++;
    i += prefix.length;
  }
  return count;
}
__name(countPrefixRepeats, "countPrefixRepeats");
export {
  InlineEditsView
};
//# sourceMappingURL=inlineEditsView.js.map
