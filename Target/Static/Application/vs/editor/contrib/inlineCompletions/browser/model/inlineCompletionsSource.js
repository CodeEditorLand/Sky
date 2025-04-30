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
var InlineCompletionsSource_1;
import { compareUndefinedSmallest, numberComparator } from "../../../../../base/common/arrays.js";
import { findLastMax } from "../../../../../base/common/arraysFind.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { equalsIfDefined, itemEquals } from "../../../../../base/common/equals.js";
import { Disposable, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { derived, observableValue, recordChanges, transaction } from "../../../../../base/common/observable.js";
import { observableReducerSettable } from "../../../../../base/common/observableInternal/reducer.js";
import { isDefined } from "../../../../../base/common/types.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { OffsetEdit } from "../../../../common/core/offsetEdit.js";
import { InlineCompletionEndOfLifeReasonKind, InlineCompletionTriggerKind } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { OffsetEdits } from "../../../../common/model/textModelOffsetEdit.js";
import { formatRecordableLogEntry, StructuredLogger } from "../structuredLogger.js";
import { wait } from "../utils.js";
import { InlineSuggestionItem } from "./inlineSuggestionItem.js";
import { provideInlineCompletions } from "./provideInlineCompletions.js";
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
  constructor(_textModel, _versionId, _debounceValue, _languageConfigurationService, _logService, _configurationService, _instantiationService) {
    super();
    this._textModel = _textModel;
    this._versionId = _versionId;
    this._debounceValue = _debounceValue;
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
        const edit = OffsetEdit.join(changes.changes.map((c) => c.change ? OffsetEdits.fromContentChanges(c.change.changes) : OffsetEdit.empty).filter(isDefined));
        if (edit.isEmpty) {
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
  fetch(providers, position, context, activeInlineCompletion, withDebounce, userJumpedToActiveCompletion, providerhasChangedCompletion) {
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
          this._log({ sourceId: "InlineCompletions.fetch", kind: "start", requestId, modelUri: this._textModel.uri.toString(), modelVersion: this._textModel.getVersionId(), context: { triggerKind: context.triggerKind }, time: Date.now() });
        }
        const startTime = /* @__PURE__ */ new Date();
        let providerResult = void 0;
        let error = void 0;
        try {
          providerResult = await provideInlineCompletions(providers, position, this._textModel, context, source.token, this._languageConfigurationService);
        } catch (e) {
          error = e;
          throw e;
        } finally {
          if (this._loggingEnabled.get() || this._structuredFetchLogger.isEnabled.get()) {
            if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request.versionId) {
              error = "canceled";
            }
            const result = providerResult?.completions.map((c) => ({
              range: c.range.toString(),
              text: c.insertText,
              isInlineEdit: !!c.isInlineEdit,
              source: c.source.provider.groupId
            }));
            this._log({ sourceId: "InlineCompletions.fetch", kind: "end", requestId, durationMs: Date.now() - startTime.getTime(), error, result, time: Date.now() });
          }
        }
        if (source.token.isCancellationRequested || this._store.isDisposed || this._textModel.getVersionId() !== request.versionId || userJumpedToActiveCompletion.get()) {
          providerResult.dispose();
          return false;
        }
        const endTime = /* @__PURE__ */ new Date();
        this._debounceValue.update(this._textModel, endTime.getTime() - startTime.getTime());
        this._updateOperation.clear();
        transaction((tx) => {
          const v = this._state.get();
          if (context.selectedSuggestionInfo) {
            this._state.set({
              inlineCompletions: InlineCompletionsState.createEmpty(),
              suggestWidgetInlineCompletions: v.suggestWidgetInlineCompletions.createStateWithAppliedResults(providerResult, request, this._textModel, activeInlineCompletion)
            }, tx);
          } else {
            this._state.set({
              inlineCompletions: v.inlineCompletions.createStateWithAppliedResults(providerResult, request, this._textModel, activeInlineCompletion),
              suggestWidgetInlineCompletions: InlineCompletionsState.createEmpty()
            }, tx);
          }
          providerResult.dispose();
          v.inlineCompletions.dispose();
          v.suggestWidgetInlineCompletions.dispose();
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
  __param(3, ILanguageConfigurationService),
  __param(4, ILogService),
  __param(5, IConfigurationService),
  __param(6, IInstantiationService)
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
  createStateWithAppliedResults(update, request, textModel, itemToPreserve) {
    const items = [];
    for (const item of update.completions) {
      const i = InlineSuggestionItem.create(item, textModel);
      const oldItem = this._findByHash(i.hash);
      if (oldItem) {
        items.push(i.withIdentity(oldItem.identity));
        oldItem.setEndOfLifeReason({ kind: InlineCompletionEndOfLifeReasonKind.Ignored, userTypingDisagreed: false, supersededBy: i.getSourceCompletion() });
      } else {
        items.push(i);
      }
    }
    if (itemToPreserve) {
      const item = this._findById(itemToPreserve);
      if (item && !update.has(item.getSingleTextEdit()) && item.canBeReused(textModel, request.position)) {
        items.unshift(item);
      }
    }
    return new InlineCompletionsState(items, request);
  }
  clone() {
    return new InlineCompletionsState(this.inlineCompletions, this.request);
  }
}
export {
  InlineCompletionsSource
};
//# sourceMappingURL=inlineCompletionsSource.js.map
