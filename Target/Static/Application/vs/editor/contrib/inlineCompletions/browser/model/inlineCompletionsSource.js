var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { compareUndefinedSmallest, numberComparator } from "../../../../../base/common/arrays.js";
import { findLastMax } from "../../../../../base/common/arraysFind.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { equalsIfDefined, itemEquals } from "../../../../../base/common/equals.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { derived, observableValue, recordChanges, transaction } from "../../../../../base/common/observable.js";
import { observableReducerSettable } from "../../../../../base/common/observableInternal/experimental/reducer.js";
import { isDefined } from "../../../../../base/common/types.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { StringEdit } from "../../../../common/core/edits/stringEdit.js";
import { InlineCompletionEndOfLifeReasonKind, InlineCompletionTriggerKind } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { offsetEditFromContentChanges } from "../../../../common/model/textModelStringEdit.js";
import { formatRecordableLogEntry, StructuredLogger } from "../structuredLogger.js";
import { wait } from "../utils.js";
import { InlineSuggestionItem } from "./inlineSuggestionItem.js";
import { provideInlineCompletions, runWhenCancelled } from "./provideInlineCompletions.js";
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
var InlineCompletionsSource_1;
let InlineCompletionsSource = class InlineCompletionsSource2 extends Disposable {
  static {
    __name(this, "InlineCompletionsSource");
  }
  static {
    InlineCompletionsSource_1 = this;
  }
  static {
    this._requestId = 0;
  }
  constructor(_textModel, _versionId, _debounceValue, _cursorPosition, _languageConfigurationService, _logService, _configurationService, _instantiationService) {
    super();
    this._textModel = _textModel;
    this._versionId = _versionId;
    this._debounceValue = _debounceValue;
    this._cursorPosition = _cursorPosition;
    this._languageConfigurationService = _languageConfigurationService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._updateOperation = this._register(new MutableDisposable());
    this._loggingEnabled = observableConfigValue("editor.inlineSuggest.logFetch", false, this._configurationService).recomputeInitiallyAndOnChange(this._store);
    this._structuredFetchLogger = this._register(this._instantiationService.createInstance(StructuredLogger.cast(), "editor.inlineSuggest.logFetch.commandId"));
    this._state = observableReducerSettable(this, {
      initial: /* @__PURE__ */ __name(() => ({
        inlineCompletions: InlineCompletionsState.createEmpty(),
        suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
      }), "initial"),
      disposeFinal: /* @__PURE__ */ __name((values) => {
        values.inlineCompletions.dispose();
        values.suggestWidgetInlineCompletions.dispose();
      }, "disposeFinal"),
      changeTracker: recordChanges({ versionId: this._versionId }),
      update: /* @__PURE__ */ __name((reader, previousValue, changes) => {
        const edit = StringEdit.compose(changes.changes.map((c) => c.change ? offsetEditFromContentChanges(c.change.changes) : StringEdit.empty).filter(isDefined));
        if (edit.isEmpty()) {
          return previousValue;
        }
        try {
          return {
            inlineCompletions: previousValue.inlineCompletions.createStateWithAppliedEdit(edit, this._textModel),
            suggestWidgetInlineCompletions: previousValue.suggestWidgetInlineCompletions.createStateWithAppliedEdit(edit, this._textModel)
          };
        } finally {
          previousValue.inlineCompletions.dispose();
          previousValue.suggestWidgetInlineCompletions.dispose();
        }
      }, "update")
    });
    this.inlineCompletions = this._state.map(this, (v) => v.inlineCompletions);
    this.suggestWidgetInlineCompletions = this._state.map(this, (v) => v.suggestWidgetInlineCompletions);
    this.clearOperationOnTextModelChange = derived(this, (reader) => {
      this._versionId.read(reader);
      this._updateOperation.clear();
      return void 0;
    });
    this._loadingCount = observableValue(this, 0);
    this.loading = this._loadingCount.map(this, (v) => v > 0);
    this.clearOperationOnTextModelChange.recomputeInitiallyAndOnChange(this._store);
  }
  _log(entry) {
    if (this._loggingEnabled.get()) {
      this._logService.info(formatRecordableLogEntry(entry));
    }
    this._structuredFetchLogger.log(entry);
  }
  fetch(providers, context, activeInlineCompletion, withDebounce, userJumpedToActiveCompletion, providerhasChangedCompletion, editorType) {
    const position = this._cursorPosition.get();
    const request = new UpdateRequest(position, context, this._textModel.getVersionId());
    const target = context.selectedSuggestionInfo ? this.suggestWidgetInlineCompletions.get() : this.inlineCompletions.get();
    if (!providerhasChangedCompletion && this._updateOperation.value?.request.satisfies(request)) {
      return this._updateOperation.value.promise;
    } else if (target?.request?.satisfies(request)) {
      return Promise.resolve(true);
    }
    const updateOngoing = !!this._updateOperation.value;
    this._updateOperation.clear();
    const source = new CancellationTokenSource();
    const promise = (async () => {
      this._loadingCount.set(this._loadingCount.get() + 1, void 0);
      const store = new DisposableStore();
      try {
        const recommendedDebounceValue = this._debounceValue.get(this._textModel);
        const debounceValue = findLastMax(providers.map((p) => p.debounceDelayMs), compareUndefinedSmallest(numberComparator)) ?? recommendedDebounceValue;
        const shouldDebounce = updateOngoing || withDebounce && context.triggerKind === InlineCompletionTriggerKind.Automatic;
        if (shouldDebounce) {
          await wait(debounceValue, source.token);
        }
        if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request.versionId) {
          return false;
        }
        const requestId = InlineCompletionsSource_1._requestId++;
        if (this._loggingEnabled.get() || this._structuredFetchLogger.isEnabled.get()) {
          this._log({ sourceId: "InlineCompletions.fetch", kind: "start", requestId, modelUri: this._textModel.uri, modelVersion: this._textModel.getVersionId(), context: { triggerKind: context.triggerKind }, time: Date.now() });
        }
        const startTime = /* @__PURE__ */ new Date();
        const providerResult = provideInlineCompletions(providers, this._cursorPosition.get(), this._textModel, context, editorType, this._languageConfigurationService);
        runWhenCancelled(source.token, () => providerResult.cancelAndDispose({ kind: "tokenCancellation" }));
        let shouldStopEarly = false;
        const suggestions = [];
        for await (const list of providerResult.lists) {
          if (!list) {
            continue;
          }
          list.addRef();
          store.add(toDisposable(() => list.removeRef(list.inlineSuggestionsData.length === 0 ? { kind: "empty" } : { kind: "notTaken" })));
          for (const item of list.inlineSuggestionsData) {
            if (!context.includeInlineEdits && (item.isInlineEdit || item.showInlineEditMenu)) {
              continue;
            }
            if (!context.includeInlineCompletions && !(item.isInlineEdit || item.showInlineEditMenu)) {
              continue;
            }
            const i = InlineSuggestionItem.create(item, this._textModel);
            suggestions.push(i);
            if (!i.isInlineEdit && !i.showInlineEditMenu && context.triggerKind === InlineCompletionTriggerKind.Automatic) {
              if (i.isVisible(this._textModel, this._cursorPosition.get())) {
                shouldStopEarly = true;
              }
            }
          }
          if (shouldStopEarly) {
            break;
          }
        }
        providerResult.cancelAndDispose({ kind: "lostRace" });
        if (this._loggingEnabled.get() || this._structuredFetchLogger.isEnabled.get()) {
          const didAllProvidersReturn = providerResult.didAllProvidersReturn;
          let error = void 0;
          if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request.versionId) {
            error = "canceled";
          }
          const result = suggestions.map((c) => ({
            range: c.editRange.toString(),
            text: c.insertText,
            isInlineEdit: !!c.isInlineEdit,
            source: c.source.provider.groupId
          }));
          this._log({ sourceId: "InlineCompletions.fetch", kind: "end", requestId, durationMs: Date.now() - startTime.getTime(), error, result, time: Date.now(), didAllProvidersReturn });
        }
        if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request.versionId || userJumpedToActiveCompletion.get()) {
          return false;
        }
        const endTime = /* @__PURE__ */ new Date();
        this._debounceValue.update(this._textModel, endTime.getTime() - startTime.getTime());
        const cursorPosition = this._cursorPosition.get();
        this._updateOperation.clear();
        transaction((tx) => {
          const v = this._state.get();
          if (context.selectedSuggestionInfo) {
            this._state.set({
              inlineCompletions: InlineCompletionsState.createEmpty(),
              suggestWidgetInlineCompletions: v.suggestWidgetInlineCompletions.createStateWithAppliedResults(suggestions, request, this._textModel, cursorPosition, activeInlineCompletion)
            }, tx);
          } else {
            this._state.set({
              inlineCompletions: v.inlineCompletions.createStateWithAppliedResults(suggestions, request, this._textModel, cursorPosition, activeInlineCompletion),
              suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
            }, tx);
          }
          v.inlineCompletions.dispose();
          v.suggestWidgetInlineCompletions.dispose();
        });
      } finally {
        this._loadingCount.set(this._loadingCount.get() - 1, void 0);
        store.dispose();
      }
      return true;
    })();
    const updateOperation = new UpdateOperation(request, source, promise);
    this._updateOperation.value = updateOperation;
    return promise;
  }
  clear(tx) {
    this._updateOperation.clear();
    const v = this._state.get();
    this._state.set({
      inlineCompletions: InlineCompletionsState.createEmpty(),
      suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
    }, tx);
    v.inlineCompletions.dispose();
    v.suggestWidgetInlineCompletions.dispose();
  }
  seedInlineCompletionsWithSuggestWidget() {
    const inlineCompletions = this.inlineCompletions.get();
    const suggestWidgetInlineCompletions = this.suggestWidgetInlineCompletions.get();
    if (!suggestWidgetInlineCompletions) {
      return;
    }
    transaction((tx) => {
      if (!inlineCompletions || (suggestWidgetInlineCompletions.request?.versionId ?? -1) > (inlineCompletions.request?.versionId ?? -1)) {
        inlineCompletions?.dispose();
        const s = this._state.get();
        this._state.set({
          inlineCompletions: suggestWidgetInlineCompletions.clone(),
          suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
        }, tx);
        s.inlineCompletions.dispose();
        s.suggestWidgetInlineCompletions.dispose();
      }
      this.clearSuggestWidgetInlineCompletions(tx);
    });
  }
  clearSuggestWidgetInlineCompletions(tx) {
    if (this._updateOperation.value?.request.context.selectedSuggestionInfo) {
      this._updateOperation.clear();
    }
  }
  cancelUpdate() {
    this._updateOperation.clear();
  }
};
InlineCompletionsSource = InlineCompletionsSource_1 = __decorate([
  __param(4, ILanguageConfigurationService),
  __param(5, ILogService),
  __param(6, IConfigurationService),
  __param(7, IInstantiationService)
], InlineCompletionsSource);
class UpdateRequest {
  static {
    __name(this, "UpdateRequest");
  }
  constructor(position, context, versionId) {
    this.position = position;
    this.context = context;
    this.versionId = versionId;
  }
  satisfies(other) {
    return this.position.equals(other.position) && equalsIfDefined(this.context.selectedSuggestionInfo, other.context.selectedSuggestionInfo, itemEquals()) && (other.context.triggerKind === InlineCompletionTriggerKind.Automatic || this.context.triggerKind === InlineCompletionTriggerKind.Explicit) && this.versionId === other.versionId;
  }
  get isExplicitRequest() {
    return this.context.triggerKind === InlineCompletionTriggerKind.Explicit;
  }
}
class UpdateOperation {
  static {
    __name(this, "UpdateOperation");
  }
  constructor(request, cancellationTokenSource, promise) {
    this.request = request;
    this.cancellationTokenSource = cancellationTokenSource;
    this.promise = promise;
  }
  dispose() {
    this.cancellationTokenSource.cancel();
  }
}
class InlineCompletionsState extends Disposable {
  static {
    __name(this, "InlineCompletionsState");
  }
  static createEmpty() {
    return new InlineCompletionsState([], void 0);
  }
  constructor(inlineCompletions, request) {
    for (const inlineCompletion of inlineCompletions) {
      inlineCompletion.addRef();
    }
    super();
    this.inlineCompletions = inlineCompletions;
    this.request = request;
    this._register({
      dispose: /* @__PURE__ */ __name(() => {
        for (const inlineCompletion of this.inlineCompletions) {
          inlineCompletion.removeRef();
        }
      }, "dispose")
    });
  }
  _findById(id) {
    return this.inlineCompletions.find((i) => i.identity === id);
  }
  _findByHash(hash) {
    return this.inlineCompletions.find((i) => i.hash === hash);
  }
  /**
   * Applies the edit on the state.
  */
  createStateWithAppliedEdit(edit, textModel) {
    const newInlineCompletions = this.inlineCompletions.map((i) => i.withEdit(edit, textModel)).filter(isDefined);
    return new InlineCompletionsState(newInlineCompletions, this.request);
  }
  createStateWithAppliedResults(updatedSuggestions, request, textModel, cursorPosition, itemIdToPreserve) {
    let updatedItems = [];
    let itemToPreserve = void 0;
    if (itemIdToPreserve) {
      const preserveCandidate = this._findById(itemIdToPreserve);
      if (preserveCandidate) {
        const updatedSuggestionsHasItemToPreserve = updatedSuggestions.some((i) => i.hash === preserveCandidate.hash);
        if (!updatedSuggestionsHasItemToPreserve && preserveCandidate.canBeReused(textModel, request.position)) {
          itemToPreserve = preserveCandidate;
        }
      }
    }
    const preferInlineCompletions = itemToPreserve ? !itemToPreserve.isInlineEdit : updatedSuggestions.some((i) => !i.isInlineEdit && i.isVisible(textModel, cursorPosition));
    for (const i of updatedSuggestions) {
      const oldItem = this._findByHash(i.hash);
      if (oldItem) {
        updatedItems.push(i.withIdentity(oldItem.identity));
        oldItem.setEndOfLifeReason({ kind: InlineCompletionEndOfLifeReasonKind.Ignored, userTypingDisagreed: false, supersededBy: i.getSourceCompletion() });
      } else {
        updatedItems.push(i);
      }
    }
    if (itemToPreserve) {
      updatedItems.unshift(itemToPreserve);
    }
    updatedItems = preferInlineCompletions ? updatedItems.filter((i) => !i.isInlineEdit) : updatedItems.filter((i) => i.isInlineEdit);
    return new InlineCompletionsState(updatedItems, request);
  }
  clone() {
    return new InlineCompletionsState(this.inlineCompletions, this.request);
  }
}
export {
  InlineCompletionsSource
};
//# sourceMappingURL=inlineCompletionsSource.js.map
