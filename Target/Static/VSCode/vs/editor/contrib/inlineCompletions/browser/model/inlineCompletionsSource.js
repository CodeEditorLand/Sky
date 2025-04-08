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
import { compareUndefinedSmallest, numberComparator } from "../../../../../base/common/arrays.js";
import { findLastMax } from "../../../../../base/common/arraysFind.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { equalsIfDefined, itemEquals } from "../../../../../base/common/equals.js";
import { BugIndicatingError } from "../../../../../base/common/errors.js";
import { matchesSubString } from "../../../../../base/common/filters.js";
import { Disposable, IDisposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, IObservableWithChange, IReader, ITransaction, derived, derivedHandleChanges, disposableObservableValue, observableValue, recordChanges, transaction } from "../../../../../base/common/observable.js";
import { commonPrefixLength, commonSuffixLength, splitLines } from "../../../../../base/common/strings.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { OffsetEdit, SingleOffsetEdit, applyEditsToRanges } from "../../../../common/core/offsetEdit.js";
import { OffsetRange } from "../../../../common/core/offsetRange.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { SingleTextEdit, StringText } from "../../../../common/core/textEdit.js";
import { TextLength } from "../../../../common/core/textLength.js";
import { linesDiffComputers } from "../../../../common/diff/linesDiffComputers.js";
import { InlineCompletionContext, InlineCompletionTriggerKind } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { EndOfLinePreference, ITextModel } from "../../../../common/model.js";
import { OffsetEdits } from "../../../../common/model/textModelOffsetEdit.js";
import { IFeatureDebounceInformation } from "../../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { IModelContentChangedEvent } from "../../../../common/textModelEvents.js";
import { IRecordableEditorLogEntry, IRecordableLogEntry, StructuredLogger, formatRecordableLogEntry } from "../structuredLogger.js";
import { InlineCompletionItem, InlineCompletionProviderResult, provideInlineCompletions } from "./provideInlineCompletions.js";
import { singleTextRemoveCommonPrefix } from "./singleTextEditHelpers.js";
let InlineCompletionsSource = class extends Disposable {
  constructor(_textModel, _versionId, _debounceValue, _languageFeaturesService, _languageConfigurationService, _logService, _configurationService, _instantiationService) {
    super();
    this._textModel = _textModel;
    this._versionId = _versionId;
    this._debounceValue = _debounceValue;
    this._languageFeaturesService = _languageFeaturesService;
    this._languageConfigurationService = _languageConfigurationService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this.clearOperationOnTextModelChange.recomputeInitiallyAndOnChange(this._store);
  }
  static {
    __name(this, "InlineCompletionsSource");
  }
  static _requestId = 0;
  _updateOperation = this._register(new MutableDisposable());
  inlineCompletions = this._register(disposableObservableValue("inlineCompletions", void 0));
  suggestWidgetInlineCompletions = this._register(disposableObservableValue("suggestWidgetInlineCompletions", void 0));
  _loggingEnabled = observableConfigValue("editor.inlineSuggest.logFetch", false, this._configurationService).recomputeInitiallyAndOnChange(this._store);
  _structuredFetchLogger = this._register(this._instantiationService.createInstance(
    StructuredLogger.cast(),
    "editor.inlineSuggest.logFetch.commandId"
  ));
  clearOperationOnTextModelChange = derived(this, (reader) => {
    this._versionId.read(reader);
    this._updateOperation.clear();
    return void 0;
  });
  _log(entry) {
    if (this._loggingEnabled.get()) {
      this._logService.info(formatRecordableLogEntry(entry));
    }
    this._structuredFetchLogger.log(entry);
  }
  _loadingCount = observableValue(this, 0);
  loading = this._loadingCount.map(this, (v) => v > 0);
  fetch(position, context, activeInlineCompletion, withDebounce, userJumpedToActiveCompletion) {
    const request = new UpdateRequest(position, context, this._textModel.getVersionId());
    const target = context.selectedSuggestionInfo ? this.suggestWidgetInlineCompletions : this.inlineCompletions;
    if (this._updateOperation.value?.request.satisfies(request)) {
      return this._updateOperation.value.promise;
    } else if (target.get()?.request.satisfies(request)) {
      return Promise.resolve(true);
    }
    const updateOngoing = !!this._updateOperation.value;
    this._updateOperation.clear();
    const source = new CancellationTokenSource();
    const promise = (async () => {
      this._loadingCount.set(this._loadingCount.get() + 1, void 0);
      try {
        const recommendedDebounceValue = this._debounceValue.get(this._textModel);
        const debounceValue = findLastMax(
          this._languageFeaturesService.inlineCompletionsProvider.all(this._textModel).map((p) => p.debounceDelayMs),
          compareUndefinedSmallest(numberComparator)
        ) ?? recommendedDebounceValue;
        const shouldDebounce = updateOngoing || withDebounce && context.triggerKind === InlineCompletionTriggerKind.Automatic;
        if (shouldDebounce) {
          await wait(debounceValue, source.token);
        }
        if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request.versionId) {
          return false;
        }
        const requestId = InlineCompletionsSource._requestId++;
        if (this._loggingEnabled.get() || this._structuredFetchLogger.isEnabled.get()) {
          this._log({ sourceId: "InlineCompletions.fetch", kind: "start", requestId, modelUri: this._textModel.uri.toString(), modelVersion: this._textModel.getVersionId(), context: { triggerKind: context.triggerKind }, time: Date.now() });
        }
        const startTime = /* @__PURE__ */ new Date();
        let updatedCompletions = void 0;
        let error = void 0;
        try {
          updatedCompletions = await provideInlineCompletions(
            this._languageFeaturesService.inlineCompletionsProvider,
            position,
            this._textModel,
            context,
            source.token,
            this._languageConfigurationService
          );
        } catch (e) {
          error = e;
          throw e;
        } finally {
          if (this._loggingEnabled.get() || this._structuredFetchLogger.isEnabled.get()) {
            if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request.versionId) {
              error = "canceled";
            }
            const result = updatedCompletions?.completions.map((c) => ({
              range: c.range.toString(),
              text: c.insertText,
              isInlineEdit: !!c.isInlineEdit,
              source: c.source.provider.groupId
            }));
            this._log({ sourceId: "InlineCompletions.fetch", kind: "end", requestId, durationMs: Date.now() - startTime.getTime(), error, result, time: Date.now() });
          }
        }
        if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request.versionId || userJumpedToActiveCompletion.get()) {
          updatedCompletions.dispose();
          return false;
        }
        if (activeInlineCompletion && activeInlineCompletion.isInlineEdit && activeInlineCompletion.updatedEditModelVersion === this._textModel.getVersionId() && (activeInlineCompletion.canBeReused(this._textModel, position) || updatedCompletions.has(activeInlineCompletion.inlineCompletion) || updatedCompletions.isEmpty())) {
          activeInlineCompletion.reuse();
          updatedCompletions.dispose();
          return false;
        }
        const endTime = /* @__PURE__ */ new Date();
        this._debounceValue.update(this._textModel, endTime.getTime() - startTime.getTime());
        const completions = new UpToDateInlineCompletions(updatedCompletions, request, this._textModel, this._versionId);
        if (activeInlineCompletion && !activeInlineCompletion.isInlineEdit && activeInlineCompletion.canBeReused(this._textModel, position)) {
          const asInlineCompletion = activeInlineCompletion.toInlineCompletion(void 0);
          if (!updatedCompletions.has(asInlineCompletion)) {
            completions.prepend(activeInlineCompletion.inlineCompletion, asInlineCompletion.range, true);
          }
        }
        this._updateOperation.clear();
        transaction((tx) => {
          target.set(completions, tx);
        });
      } finally {
        this._loadingCount.set(this._loadingCount.get() - 1, void 0);
      }
      return true;
    })();
    const updateOperation = new UpdateOperation(request, source, promise);
    this._updateOperation.value = updateOperation;
    return promise;
  }
  clear(tx) {
    this._updateOperation.clear();
    this.inlineCompletions.set(void 0, tx);
    this.suggestWidgetInlineCompletions.set(void 0, tx);
  }
  clearSuggestWidgetInlineCompletions(tx) {
    if (this._updateOperation.value?.request.context.selectedSuggestionInfo) {
      this._updateOperation.clear();
    }
    this.suggestWidgetInlineCompletions.set(void 0, tx);
  }
  cancelUpdate() {
    this._updateOperation.clear();
  }
};
InlineCompletionsSource = __decorateClass([
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, ILanguageConfigurationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IInstantiationService)
], InlineCompletionsSource);
function wait(ms, cancellationToken) {
  return new Promise((resolve) => {
    let d = void 0;
    const handle = setTimeout(() => {
      if (d) {
        d.dispose();
      }
      resolve();
    }, ms);
    if (cancellationToken) {
      d = cancellationToken.onCancellationRequested(() => {
        clearTimeout(handle);
        if (d) {
          d.dispose();
        }
        resolve();
      });
    }
  });
}
__name(wait, "wait");
class UpdateRequest {
  constructor(position, context, versionId) {
    this.position = position;
    this.context = context;
    this.versionId = versionId;
  }
  static {
    __name(this, "UpdateRequest");
  }
  satisfies(other) {
    return this.position.equals(other.position) && equalsIfDefined(this.context.selectedSuggestionInfo, other.context.selectedSuggestionInfo, itemEquals()) && (other.context.triggerKind === InlineCompletionTriggerKind.Automatic || this.context.triggerKind === InlineCompletionTriggerKind.Explicit) && this.versionId === other.versionId;
  }
  get isExplicitRequest() {
    return this.context.triggerKind === InlineCompletionTriggerKind.Explicit;
  }
}
class UpdateOperation {
  constructor(request, cancellationTokenSource, promise) {
    this.request = request;
    this.cancellationTokenSource = cancellationTokenSource;
    this.promise = promise;
  }
  static {
    __name(this, "UpdateOperation");
  }
  dispose() {
    this.cancellationTokenSource.cancel();
  }
}
class UpToDateInlineCompletions {
  constructor(inlineCompletionProviderResult, request, _textModel, _versionId) {
    this.inlineCompletionProviderResult = inlineCompletionProviderResult;
    this.request = request;
    this._textModel = _textModel;
    this._versionId = _versionId;
    this._inlineCompletions = inlineCompletionProviderResult.completions.map(
      (completion) => new InlineCompletionWithUpdatedRange(completion, void 0, this._textModel, this._versionId, this.request)
    );
  }
  static {
    __name(this, "UpToDateInlineCompletions");
  }
  _inlineCompletions;
  get inlineCompletions() {
    return this._inlineCompletions;
  }
  _refCount = 1;
  _prependedInlineCompletionItems = [];
  clone() {
    this._refCount++;
    return this;
  }
  dispose() {
    this._refCount--;
    if (this._refCount === 0) {
      this.inlineCompletionProviderResult.dispose();
      for (const i of this._prependedInlineCompletionItems) {
        i.source.removeRef();
      }
      this._inlineCompletions.forEach((i) => i.dispose());
    }
  }
  prepend(inlineCompletion, range, addRefToSource) {
    if (addRefToSource) {
      inlineCompletion.source.addRef();
    }
    this._inlineCompletions.unshift(new InlineCompletionWithUpdatedRange(inlineCompletion, range, this._textModel, this._versionId, this.request));
    this._prependedInlineCompletionItems.push(inlineCompletion);
  }
}
class InlineCompletionWithUpdatedRange extends Disposable {
  constructor(inlineCompletion, updatedRange, _textModel, _modelVersion, request) {
    super();
    this.inlineCompletion = inlineCompletion;
    this._textModel = _textModel;
    this._modelVersion = _modelVersion;
    this.request = request;
    this._updatedEditObj = this._register(this._toUpdatedEdit(updatedRange ?? this.inlineCompletion.range, this.inlineCompletion.insertText));
  }
  static {
    __name(this, "InlineCompletionWithUpdatedRange");
  }
  semanticId = JSON.stringify([
    this.inlineCompletion.filterText,
    this.inlineCompletion.insertText,
    this.inlineCompletion.range.getStartPosition().toString()
  ]);
  get forwardStable() {
    return this.source.inlineCompletions.enableForwardStability ?? false;
  }
  _updatedEditObj;
  // helper as derivedHandleChanges can not access previous value
  get updatedEdit() {
    return this._updatedEditObj.offsetEdit;
  }
  get updatedEditModelVersion() {
    return this._updatedEditObj.modelVersion;
  }
  get source() {
    return this.inlineCompletion.source;
  }
  get sourceInlineCompletion() {
    return this.inlineCompletion.sourceInlineCompletion;
  }
  get isInlineEdit() {
    return this.inlineCompletion.isInlineEdit;
  }
  toInlineCompletion(reader) {
    const singleTextEdit = this.toSingleTextEdit(reader);
    return this.inlineCompletion.withRangeInsertTextAndFilterText(singleTextEdit.range, singleTextEdit.text, singleTextEdit.text);
  }
  toSingleTextEdit(reader) {
    this._modelVersion.read(reader);
    const offsetEdit = this.updatedEdit.read(reader);
    if (!offsetEdit) {
      return new SingleTextEdit(this._updatedRange.read(reader) ?? emptyRange, this.inlineCompletion.insertText);
    }
    const startOffset = offsetEdit.edits[0].replaceRange.start;
    const endOffset = offsetEdit.edits[offsetEdit.edits.length - 1].replaceRange.endExclusive;
    const overallOffsetRange = new OffsetRange(startOffset, endOffset);
    const overallLnColRange = Range.fromPositions(
      this._textModel.getPositionAt(overallOffsetRange.start),
      this._textModel.getPositionAt(overallOffsetRange.endExclusive)
    );
    let text = this._textModel.getValueInRange(overallLnColRange);
    for (let i = offsetEdit.edits.length - 1; i >= 0; i--) {
      const edit = offsetEdit.edits[i];
      const relativeStartOffset = edit.replaceRange.start - startOffset;
      const relativeEndOffset = edit.replaceRange.endExclusive - startOffset;
      text = text.substring(0, relativeStartOffset) + edit.newText + text.substring(relativeEndOffset);
    }
    return new SingleTextEdit(overallLnColRange, text);
  }
  isVisible(model, cursorPosition, reader) {
    const minimizedReplacement = singleTextRemoveCommonPrefix(this.toSingleTextEdit(reader), model);
    const updatedRange = this._updatedRange.read(reader);
    if (!updatedRange || !this.inlineCompletion.range.getStartPosition().equals(updatedRange.getStartPosition()) || cursorPosition.lineNumber !== minimizedReplacement.range.startLineNumber || minimizedReplacement.isEmpty) {
      return false;
    }
    const originalValue = model.getValueInRange(minimizedReplacement.range, EndOfLinePreference.LF);
    const filterText = minimizedReplacement.text;
    const cursorPosIndex = Math.max(0, cursorPosition.column - minimizedReplacement.range.startColumn);
    let filterTextBefore = filterText.substring(0, cursorPosIndex);
    let filterTextAfter = filterText.substring(cursorPosIndex);
    let originalValueBefore = originalValue.substring(0, cursorPosIndex);
    let originalValueAfter = originalValue.substring(cursorPosIndex);
    const originalValueIndent = model.getLineIndentColumn(minimizedReplacement.range.startLineNumber);
    if (minimizedReplacement.range.startColumn <= originalValueIndent) {
      originalValueBefore = originalValueBefore.trimStart();
      if (originalValueBefore.length === 0) {
        originalValueAfter = originalValueAfter.trimStart();
      }
      filterTextBefore = filterTextBefore.trimStart();
      if (filterTextBefore.length === 0) {
        filterTextAfter = filterTextAfter.trimStart();
      }
    }
    return filterTextBefore.startsWith(originalValueBefore) && !!matchesSubString(originalValueAfter, filterTextAfter);
  }
  reuse() {
    this._updatedEditObj.reuse();
  }
  canBeReused(model, position) {
    if (!this.updatedEdit.get()) {
      return false;
    }
    if (this.sourceInlineCompletion.isInlineEdit) {
      return this._updatedEditObj.lastChangePartOfInlineEdit;
    }
    const updatedRange = this._updatedRange.read(void 0);
    const result = !!updatedRange && updatedRange.containsPosition(position) && this.isVisible(model, position, void 0) && TextLength.ofRange(updatedRange).isGreaterThanOrEqualTo(TextLength.ofRange(this.inlineCompletion.range));
    return result;
  }
  _updatedRange = derived((reader) => {
    const edit = this.updatedEdit.read(reader);
    if (!edit || edit.edits.length === 0) {
      return void 0;
    }
    return Range.fromPositions(
      this._textModel.getPositionAt(edit.edits[0].replaceRange.start),
      this._textModel.getPositionAt(edit.edits[edit.edits.length - 1].replaceRange.endExclusive)
    );
  });
  _toUpdatedEdit(editRange, replaceText) {
    return this.isInlineEdit ? this._toInlineEditEdit(editRange, replaceText) : this._toInlineCompletionEdit(editRange, replaceText);
  }
  _toInlineCompletionEdit(editRange, replaceText) {
    const startOffset = this._textModel.getOffsetAt(editRange.getStartPosition());
    const endOffset = this._textModel.getOffsetAt(editRange.getEndPosition());
    const originalRange = OffsetRange.ofStartAndLength(startOffset, endOffset - startOffset);
    const offsetEdit = new OffsetEdit([new SingleOffsetEdit(originalRange, replaceText)]);
    return new UpdatedEdit(offsetEdit, this._textModel, this._modelVersion, false);
  }
  _toInlineEditEdit(editRange, replaceText) {
    const eol = this._textModel.getEOL();
    const editOriginalText = this._textModel.getValueInRange(editRange);
    const editReplaceText = replaceText.replace(/\r\n|\r|\n/g, eol);
    const diffAlgorithm = linesDiffComputers.getDefault();
    const lineDiffs = diffAlgorithm.computeDiff(
      splitLines(editOriginalText),
      splitLines(editReplaceText),
      {
        ignoreTrimWhitespace: false,
        computeMoves: false,
        extendToSubwords: true,
        maxComputationTimeMs: 500
      }
    );
    const innerChanges = lineDiffs.changes.flatMap((c) => c.innerChanges ?? []);
    function addRangeToPos(pos, range) {
      const start = TextLength.fromPosition(range.getStartPosition());
      return TextLength.ofRange(range).createRange(start.addToPosition(pos));
    }
    __name(addRangeToPos, "addRangeToPos");
    const modifiedText = new StringText(editReplaceText);
    const offsetEdit = new OffsetEdit(
      innerChanges.map((c) => {
        const range = addRangeToPos(editRange.getStartPosition(), c.originalRange);
        const startOffset = this._textModel.getOffsetAt(range.getStartPosition());
        const endOffset = this._textModel.getOffsetAt(range.getEndPosition());
        const originalRange = OffsetRange.ofStartAndLength(startOffset, endOffset - startOffset);
        const replaceText2 = modifiedText.getValueOfRange(c.modifiedRange);
        const originalText = this._textModel.getValueInRange(range);
        const edit = new SingleOffsetEdit(originalRange, replaceText2);
        return reshapeEdit(edit, originalText, innerChanges.length, this._textModel);
      })
    );
    return new UpdatedEdit(offsetEdit, this._textModel, this._modelVersion, true);
  }
}
class UpdatedEdit extends Disposable {
  constructor(offsetEdit, _textModel, _modelVersion, isInlineEdit) {
    super();
    this._textModel = _textModel;
    this._modelVersion = _modelVersion;
    this._inlineEditModelVersion = this._modelVersion.get() ?? -1;
    this._innerEdits = offsetEdit.edits.map((edit) => {
      if (isInlineEdit) {
        const replacedRange = Range.fromPositions(this._textModel.getPositionAt(edit.replaceRange.start), this._textModel.getPositionAt(edit.replaceRange.endExclusive));
        const replacedText = this._textModel.getValueInRange(replacedRange);
        return new SingleUpdatedNextEdit(edit, replacedText);
      }
      return new SingleUpdatedCompletion(edit);
    });
    this._updatedEdit.recomputeInitiallyAndOnChange(this._store);
  }
  static {
    __name(this, "UpdatedEdit");
  }
  _innerEdits;
  _inlineEditModelVersion;
  get modelVersion() {
    return this._inlineEditModelVersion;
  }
  _lastChangePartOfInlineEdit = false;
  get lastChangePartOfInlineEdit() {
    return this._lastChangePartOfInlineEdit;
  }
  _updatedEdit = derivedHandleChanges({
    owner: this,
    equalityComparer: equalsIfDefined((a, b) => a?.equals(b)),
    changeTracker: recordChanges({ edit: this._modelVersion })
  }, (reader, changeSummary) => {
    this._modelVersion.read(reader);
    for (const change of changeSummary.changes) {
      if (change.change) {
        this._innerEdits = this._applyTextModelChanges(OffsetEdits.fromContentChanges(change.change.changes), this._innerEdits);
      }
    }
    if (this._innerEdits.length === 0) {
      return void 0;
    }
    if (this._innerEdits.some((e) => e.edit === void 0)) {
      throw new BugIndicatingError("UpdatedEdit: Invalid state");
    }
    return new OffsetEdit(this._innerEdits.map((edit) => edit.edit));
  });
  get offsetEdit() {
    return this._updatedEdit.map((e) => e ?? void 0);
  }
  _applyTextModelChanges(textModelChanges, edits) {
    for (const innerEdit of edits) {
      innerEdit.applyTextModelChanges(textModelChanges);
    }
    if (edits.some((edit) => edit.edit === void 0)) {
      return [];
    }
    const currentModelVersion = this._modelVersion.get();
    this._lastChangePartOfInlineEdit = edits.some((edit) => edit.lastChangeUpdatedEdit);
    if (this._lastChangePartOfInlineEdit) {
      this._inlineEditModelVersion = currentModelVersion ?? -1;
    }
    if (currentModelVersion === null || this._inlineEditModelVersion + 20 < currentModelVersion) {
      return [];
    }
    edits = edits.filter((innerEdit) => !innerEdit.edit.isEmpty);
    if (edits.length === 0) {
      return [];
    }
    return edits;
  }
  reuse() {
    this._inlineEditModelVersion = this._modelVersion.get() ?? -1;
  }
}
class SingleUpdatedEdit {
  static {
    __name(this, "SingleUpdatedEdit");
  }
  _edit;
  get edit() {
    return this._edit;
  }
  _lastChangeUpdatedEdit = false;
  get lastChangeUpdatedEdit() {
    return this._lastChangeUpdatedEdit;
  }
  constructor(edit) {
    this._edit = edit;
  }
  applyTextModelChanges(textModelChanges) {
    this._lastChangeUpdatedEdit = false;
    if (!this._edit) {
      throw new BugIndicatingError("UpdatedInnerEdits: No edit to apply changes to");
    }
    const result = this.applyChanges(this._edit, textModelChanges);
    if (!result) {
      this._edit = void 0;
      return;
    }
    this._edit = result.edit;
    this._lastChangeUpdatedEdit = result.editHasChanged;
  }
}
class SingleUpdatedCompletion extends SingleUpdatedEdit {
  static {
    __name(this, "SingleUpdatedCompletion");
  }
  constructor(edit) {
    super(edit);
  }
  applyChanges(edit, textModelChanges) {
    const newEditRange = applyEditsToRanges([edit.replaceRange], textModelChanges)[0];
    return { edit: new SingleOffsetEdit(newEditRange, edit.newText), editHasChanged: !newEditRange.equals(edit.replaceRange) };
  }
}
class SingleUpdatedNextEdit extends SingleUpdatedEdit {
  static {
    __name(this, "SingleUpdatedNextEdit");
  }
  _trimmedNewText;
  _prefixLength;
  _suffixLength;
  constructor(edit, replacedText) {
    super(edit);
    this._prefixLength = commonPrefixLength(edit.newText, replacedText);
    this._suffixLength = commonSuffixLength(edit.newText, replacedText);
    this._trimmedNewText = edit.newText.substring(this._prefixLength, edit.newText.length - this._suffixLength);
  }
  applyChanges(edit, textModelChanges) {
    let editStart = edit.replaceRange.start;
    let editEnd = edit.replaceRange.endExclusive;
    let editReplaceText = edit.newText;
    let editHasChanged = false;
    const shouldPreserveEditShape = this._prefixLength > 0 || this._suffixLength > 0;
    for (let i = textModelChanges.edits.length - 1; i >= 0; i--) {
      const change = textModelChanges.edits[i];
      const isInsertion = change.newText.length > 0 && change.replaceRange.isEmpty;
      if (isInsertion && !shouldPreserveEditShape && change.replaceRange.start === editStart && editReplaceText.startsWith(change.newText)) {
        editStart += change.newText.length;
        editReplaceText = editReplaceText.substring(change.newText.length);
        editEnd = Math.max(editStart, editEnd);
        editHasChanged = true;
        continue;
      }
      if (isInsertion && shouldPreserveEditShape && change.replaceRange.start === editStart + this._prefixLength && this._trimmedNewText.startsWith(change.newText)) {
        editEnd += change.newText.length;
        editHasChanged = true;
        this._prefixLength += change.newText.length;
        this._trimmedNewText = this._trimmedNewText.substring(change.newText.length);
        continue;
      }
      const isDeletion = change.newText.length === 0 && change.replaceRange.length > 0;
      if (isDeletion && change.replaceRange.start >= editStart + this._prefixLength && change.replaceRange.endExclusive <= editEnd - this._suffixLength) {
        editEnd -= change.replaceRange.length;
        editHasChanged = true;
        continue;
      }
      if (change.equals(edit)) {
        editHasChanged = true;
        editStart = change.replaceRange.endExclusive;
        editReplaceText = "";
        continue;
      }
      if (change.replaceRange.start > editEnd) {
        continue;
      }
      if (change.replaceRange.endExclusive < editStart) {
        editStart += change.newText.length - change.replaceRange.length;
        editEnd += change.newText.length - change.replaceRange.length;
        continue;
      }
      return void 0;
    }
    if (this._trimmedNewText.length === 0 && editStart + this._prefixLength === editEnd - this._suffixLength) {
      return { edit: new SingleOffsetEdit(new OffsetRange(editStart + this._prefixLength, editStart + this._prefixLength), ""), editHasChanged: true };
    }
    return { edit: new SingleOffsetEdit(new OffsetRange(editStart, editEnd), editReplaceText), editHasChanged };
  }
}
const emptyRange = new Range(1, 1, 1, 1);
function reshapeEdit(edit, originalText, totalInnerEdits, textModel) {
  const eol = textModel.getEOL();
  if (edit.newText.endsWith(eol) && originalText.endsWith(eol)) {
    edit = new SingleOffsetEdit(edit.replaceRange.deltaEnd(-eol.length), edit.newText.slice(0, -eol.length));
  }
  if (totalInnerEdits === 1 && edit.replaceRange.isEmpty && edit.newText.includes(eol)) {
    edit = reshapeMultiLineInsertion(edit, textModel);
  }
  if (totalInnerEdits === 1) {
    const prefixLength = commonPrefixLength(originalText, edit.newText);
    const suffixLength = commonSuffixLength(originalText.slice(prefixLength), edit.newText.slice(prefixLength));
    if (prefixLength + suffixLength === originalText.length) {
      return new SingleOffsetEdit(edit.replaceRange.deltaStart(prefixLength).deltaEnd(-suffixLength), edit.newText.substring(prefixLength, edit.newText.length - suffixLength));
    }
    if (prefixLength + suffixLength === edit.newText.length) {
      return new SingleOffsetEdit(edit.replaceRange.deltaStart(prefixLength).deltaEnd(-suffixLength), "");
    }
  }
  return edit;
}
__name(reshapeEdit, "reshapeEdit");
function reshapeMultiLineInsertion(edit, textModel) {
  if (!edit.replaceRange.isEmpty) {
    throw new BugIndicatingError("Unexpected original range");
  }
  if (edit.replaceRange.start === 0) {
    return edit;
  }
  const eol = textModel.getEOL();
  const startPosition = textModel.getPositionAt(edit.replaceRange.start);
  const startColumn = startPosition.column;
  const startLineNumber = startPosition.lineNumber;
  if (startColumn === 1 && startLineNumber > 1 && textModel.getLineLength(startLineNumber) !== 0 && edit.newText.endsWith(eol) && !edit.newText.startsWith(eol)) {
    return new SingleOffsetEdit(edit.replaceRange.delta(-1), eol + edit.newText.slice(0, -eol.length));
  }
  return edit;
}
__name(reshapeMultiLineInsertion, "reshapeMultiLineInsertion");
export {
  InlineCompletionWithUpdatedRange,
  InlineCompletionsSource,
  UpToDateInlineCompletions
};
//# sourceMappingURL=inlineCompletionsSource.js.map
