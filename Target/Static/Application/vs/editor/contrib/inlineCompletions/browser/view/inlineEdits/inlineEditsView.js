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
var InlineEditsView_1;
import { equalsIfDefined, itemEquals } from "../../../../../../base/common/equals.js";
import { BugIndicatingError } from "../../../../../../base/common/errors.js";
import { Event } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorunWithStore, derived, derivedOpts, derivedWithStore, mapObservableArrayCached, observableValue } from "../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { observableCodeEditor } from "../../../../../browser/observableCodeEditor.js";
import { LineRange } from "../../../../../common/core/lineRange.js";
import { Range } from "../../../../../common/core/range.js";
import { SingleTextEdit, StringText } from "../../../../../common/core/textEdit.js";
import { TextLength } from "../../../../../common/core/textLength.js";
import { lineRangeMappingFromRangeMappings, RangeMapping } from "../../../../../common/diff/rangeMapping.js";
import { TextModel } from "../../../../../common/model/textModel.js";
import { InlineEditsGutterIndicator } from "./components/gutterIndicatorView.js";
import { InlineEditsOnboardingExperience } from "./inlineEditsNewUsers.js";
import { InlineEditTabAction } from "./inlineEditsViewInterface.js";
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
      model.handleInlineEditShown();
      const inlineEdit = model.inlineEdit;
      let mappings = RangeMapping.fromEdit(inlineEdit.edit);
      let newText = inlineEdit.edit.apply(inlineEdit.originalText);
      let diff = lineRangeMappingFromRangeMappings(mappings, inlineEdit.originalText, new StringText(newText));
      let state = this.determineRenderState(model, reader, diff, new StringText(newText));
      if (!state) {
        model.abort(`unable to determine view: tried to render ${this._previousView?.view}`);
        return void 0;
      }
      if (state.kind === "sideBySide") {
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
        state = { kind: "collapsed" };
      }
      return {
        state,
        diff,
        edit: inlineEdit,
        newText,
        newTextLineCount: inlineEdit.modifiedLineRange.length
      };
    });
    this._previewTextModel = this._register(this._instantiationService.createInstance(TextModel, "", this._editor.getModel().getLanguageId(), { ...TextModel.DEFAULT_CREATION_OPTIONS, bracketPairColorizationOptions: { enabled: true, independentColorPoolPerBracketType: false } }, null));
    this._indicatorCyclicDependencyCircuitBreaker = observableValue(this, false);
    this._indicator = derivedWithStore(this, (reader, store) => {
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
      return store.add(this._instantiationService.createInstance(InlineEditsGutterIndicator, this._editorObs, indicatorDisplayRange, this._gutterIndicatorOffset, modelWithGhostTextSupport, this._inlineEditsIsHovered, this._focusIsInMenu));
    });
    this._inlineEditsIsHovered = derived(this, (reader) => {
      return this._sideBySide.isHovered.read(reader) || this._wordReplacementViews.read(reader).some((v) => v.isHovered.read(reader)) || this._deletion.isHovered.read(reader) || this._inlineDiffView.isHovered.read(reader) || this._lineReplacementView.isHovered.read(reader) || this._insertion.isHovered.read(reader) || this._customView.isHovered.read(reader);
    });
    this._gutterIndicatorOffset = derived(this, (reader) => {
      if (this._uiState.read(reader)?.state?.kind === "insertionMultiLine") {
        return this._insertion.startLineOffset.read(reader);
      }
      return 0;
    });
    this._sideBySide = this._register(this._instantiationService.createInstance(InlineEditsSideBySideView, this._editor, this._model.map((m) => m?.inlineEdit), this._previewTextModel, this._uiState.map((s) => s && s.state?.kind === "sideBySide" ? {
      newTextLineCount: s.newTextLineCount
    } : void 0), this._tabAction));
    this._deletion = this._register(this._instantiationService.createInstance(InlineEditsDeletionView, this._editor, this._model.map((m) => m?.inlineEdit), this._uiState.map((s) => s && s.state?.kind === "deletion" ? {
      originalRange: s.state.originalRange,
      deletions: s.state.deletions
    } : void 0), this._tabAction));
    this._insertion = this._register(this._instantiationService.createInstance(InlineEditsInsertionView, this._editor, this._uiState.map((s) => s && s.state?.kind === "insertionMultiLine" ? {
      lineNumber: s.state.lineNumber,
      startColumn: s.state.column,
      text: s.state.text
    } : void 0), this._tabAction));
    this._inlineDiffViewState = derived(this, (reader) => {
      const e = this._uiState.read(reader);
      if (!e || !e.state) {
        return void 0;
      }
      if (e.state.kind === "wordReplacements" || e.state.kind === "lineReplacement" || e.state.kind === "insertionMultiLine" || e.state.kind === "collapsed" || e.state.kind === "custom") {
        return void 0;
      }
      return {
        modifiedText: new StringText(e.newText),
        diff: e.diff,
        mode: e.state.kind,
        modifiedCodeEditor: this._sideBySide.previewEditor
      };
    });
    this._inlineCollapsedView = this._register(this._instantiationService.createInstance(InlineEditsCollapsedView, this._editor, this._model.map((m, reader) => this._uiState.read(reader)?.state?.kind === "collapsed" ? m?.inlineEdit : void 0)));
    this._customView = this._register(this._instantiationService.createInstance(InlineEditsCustomView, this._editor, this._model.map((m, reader) => this._uiState.read(reader)?.state?.kind === "custom" ? m?.displayLocation : void 0), this._tabAction));
    this._inlineDiffView = this._register(new OriginalEditorInlineDiffView(this._editor, this._inlineDiffViewState, this._previewTextModel));
    this._wordReplacementViews = mapObservableArrayCached(this, this._uiState.map((s) => s?.state?.kind === "wordReplacements" ? s.state.replacements : []), (e, store) => {
      return store.add(this._instantiationService.createInstance(InlineEditsWordReplacementView, this._editorObs, e, this._tabAction));
    });
    this._lineReplacementView = this._register(this._instantiationService.createInstance(InlineEditsLineReplacementView, this._editorObs, this._uiState.map((s) => s?.state?.kind === "lineReplacement" ? {
      originalRange: s.state.originalRange,
      modifiedRange: s.state.modifiedRange,
      modifiedLines: s.state.modifiedLines,
      replacements: s.state.replacements
    } : void 0), this._tabAction));
    this._useCodeShifting = this._editorObs.getOption(
      64
      /* EditorOption.inlineSuggest */
    ).map((s) => s.edits.allowCodeShifting);
    this._renderSideBySide = this._editorObs.getOption(
      64
      /* EditorOption.inlineSuggest */
    ).map((s) => s.edits.renderSideBySide);
    this._useMultiLineGhostText = this._editorObs.getOption(
      64
      /* EditorOption.inlineSuggest */
    ).map((s) => s.edits.useMultiLineGhostText);
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
    const reconsiderViewEditorWidthChange = this._previousView?.editorWidth !== this._editorObs.layoutInfoWidth.read(reader) && (this._previousView?.view === "sideBySide" || this._previousView?.view === "lineReplacement");
    if (canUseCache && !reconsiderViewEditorWidthChange) {
      return this._previousView.view;
    }
    if (model.displayLocation) {
      return "custom";
    }
    const inner = diff.flatMap((d) => d.innerChanges ?? []);
    const isSingleInnerEdit = inner.length === 1;
    if (isSingleInnerEdit && this._useCodeShifting.read(reader) !== "never" && isSingleLineInsertionAfterPosition(diff, inlineEdit.cursorPosition)) {
      return "insertionInline";
    }
    const innerValues = inner.map((m) => ({ original: inlineEdit.originalText.getValueOfRange(m.originalRange), modified: newText.getValueOfRange(m.modifiedRange) }));
    if (innerValues.every(({ original, modified }) => modified.trim() === "" && original.length > 0 && (original.length > modified.length || original.trim() !== ""))) {
      return "deletion";
    }
    if (isSingleMultiLineInsertion(diff) && this._useMultiLineGhostText.read(reader) && this._useCodeShifting.read(reader) === "always") {
      return "insertionMultiLine";
    }
    const numOriginalLines = inlineEdit.originalLineRange.length;
    const numModifiedLines = inlineEdit.modifiedLineRange.length;
    const allInnerChangesNotTooLong = inner.every((m) => TextLength.ofRange(m.originalRange).columnCount < InlineEditsWordReplacementView.MAX_LENGTH && TextLength.ofRange(m.modifiedRange).columnCount < InlineEditsWordReplacementView.MAX_LENGTH);
    if (allInnerChangesNotTooLong && isSingleInnerEdit && numOriginalLines === 1 && numModifiedLines === 1) {
      if (!inner.some((m) => m.originalRange.isEmpty()) || !growEditsUntilWhitespace(inner.map((m) => new SingleTextEdit(m.originalRange, "")), inlineEdit.originalText).some((e) => e.range.isEmpty() && TextLength.ofRange(e.range).columnCount < InlineEditsWordReplacementView.MAX_LENGTH)) {
        return "wordReplacements";
      }
    }
    if (numOriginalLines > 0 && numModifiedLines > 0) {
      if (numOriginalLines === 1 && numModifiedLines === 1) {
        return "lineReplacement";
      }
      if (this._renderSideBySide.read(reader) !== "never" && InlineEditsSideBySideView.fitsInsideViewport(this._editor, this._previewTextModel, inlineEdit, reader)) {
        return "sideBySide";
      }
      return "lineReplacement";
    }
    return "sideBySide";
  }
  determineRenderState(model, reader, diff, newText) {
    const inlineEdit = model.inlineEdit;
    const view = this.determineView(model, reader, diff, newText);
    this._previousView = { id: this.getCacheId(model), view, editorWidth: this._editor.getLayoutInfo().width, timestamp: Date.now() };
    switch (view) {
      case "custom":
        return { kind: "custom", displayLocation: model.displayLocation };
      case "insertionInline":
        return { kind: "insertionInline" };
      case "sideBySide":
        return { kind: "sideBySide" };
      case "collapsed":
        return { kind: "collapsed" };
    }
    const inner = diff.flatMap((d) => d.innerChanges ?? []);
    if (view === "deletion") {
      return {
        kind: "deletion",
        originalRange: inlineEdit.originalLineRange,
        deletions: inner.map((m) => m.originalRange)
      };
    }
    if (view === "insertionMultiLine") {
      const change = inner[0];
      return {
        kind: "insertionMultiLine",
        lineNumber: change.originalRange.startLineNumber,
        column: change.originalRange.startColumn,
        text: newText.getValueOfRange(change.modifiedRange)
      };
    }
    const replacements = inner.map((m) => new SingleTextEdit(m.originalRange, newText.getValueOfRange(m.modifiedRange)));
    if (replacements.length === 0) {
      return void 0;
    }
    if (view === "wordReplacements") {
      let grownEdits = growEditsToEntireWord(replacements, inlineEdit.originalText);
      if (grownEdits.some((e) => e.range.isEmpty())) {
        grownEdits = growEditsUntilWhitespace(replacements, inlineEdit.originalText);
      }
      return {
        kind: "wordReplacements",
        replacements: grownEdits
      };
    }
    if (view === "lineReplacement") {
      return {
        kind: "lineReplacement",
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
function isSingleLineInsertionAfterPosition(diff, position) {
  if (!position) {
    return false;
  }
  const pos = position;
  return diff.every((m) => m.innerChanges.every((r) => isStableWordInsertion(r)));
  function isStableWordInsertion(r) {
    if (!r.originalRange.isEmpty()) {
      return false;
    }
    const isInsertionWithinLine = r.modifiedRange.startLineNumber === r.modifiedRange.endLineNumber;
    if (!isInsertionWithinLine) {
      return false;
    }
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
    let newEdit = new SingleTextEdit(new Range(edit.range.startLineNumber, startIndex + 1, edit.range.endLineNumber, endIndex + 2), prefix + edit.text + suffix);
    if (result.length > 0 && Range.areIntersectingOrTouching(result[result.length - 1].range, newEdit.range)) {
      newEdit = SingleTextEdit.joinEdits([result.pop(), newEdit], originalText);
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
export {
  InlineEditsView
};
//# sourceMappingURL=inlineEditsView.js.map
