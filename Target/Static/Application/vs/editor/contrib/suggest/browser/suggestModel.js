var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { TimeoutTimer } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { DisposableStore, dispose } from "../../../../base/common/lifecycle.js";
import { getLeadingWhitespace, isHighSurrogate, isLowSurrogate } from "../../../../base/common/strings.js";
import { Selection } from "../../../common/core/selection.js";
import { IEditorWorkerService } from "../../../common/services/editorWorker.js";
import { WordDistance } from "./wordDistance.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { CompletionModel } from "./completionModel.js";
import { CompletionOptions, getSnippetSuggestSupport, provideSuggestionItems, QuickSuggestionsOptions } from "./suggest.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { FuzzyScoreOptions } from "../../../../base/common/filters.js";
import { assertType } from "../../../../base/common/types.js";
import { InlineCompletionContextKeys } from "../../inlineCompletions/browser/controller/inlineCompletionContextKeys.js";
import { SnippetController2 } from "../../snippet/browser/snippetController2.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
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
var SuggestModel_1;
class LineContext {
  static {
    __name(this, "LineContext");
  }
  static shouldAutoTrigger(editor) {
    if (!editor.hasModel()) {
      return false;
    }
    const model = editor.getModel();
    const pos = editor.getPosition();
    model.tokenization.tokenizeIfCheap(pos.lineNumber);
    const word = model.getWordAtPosition(pos);
    if (!word) {
      return false;
    }
    if (word.endColumn !== pos.column && word.startColumn + 1 !== pos.column) {
      return false;
    }
    if (!isNaN(Number(word.word))) {
      return false;
    }
    return true;
  }
  constructor(model, position, triggerOptions) {
    this.leadingLineContent = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
    this.leadingWord = model.getWordUntilPosition(position);
    this.lineNumber = position.lineNumber;
    this.column = position.column;
    this.triggerOptions = triggerOptions;
  }
}
var State;
(function(State2) {
  State2[State2["Idle"] = 0] = "Idle";
  State2[State2["Manual"] = 1] = "Manual";
  State2[State2["Auto"] = 2] = "Auto";
})(State || (State = {}));
function canShowQuickSuggest(editor, contextKeyService, configurationService) {
  if (!Boolean(contextKeyService.getContextKeyValue(InlineCompletionContextKeys.inlineSuggestionVisible.key))) {
    return true;
  }
  const suppressSuggestions = contextKeyService.getContextKeyValue(InlineCompletionContextKeys.suppressSuggestions.key);
  if (suppressSuggestions !== void 0) {
    return !suppressSuggestions;
  }
  return !editor.getOption(
    67
    /* EditorOption.inlineSuggest */
  ).suppressSuggestions;
}
__name(canShowQuickSuggest, "canShowQuickSuggest");
function canShowSuggestOnTriggerCharacters(editor, contextKeyService, configurationService) {
  if (!Boolean(contextKeyService.getContextKeyValue("inlineSuggestionVisible"))) {
    return true;
  }
  const suppressSuggestions = contextKeyService.getContextKeyValue(InlineCompletionContextKeys.suppressSuggestions.key);
  if (suppressSuggestions !== void 0) {
    return !suppressSuggestions;
  }
  return !editor.getOption(
    67
    /* EditorOption.inlineSuggest */
  ).suppressSuggestions;
}
__name(canShowSuggestOnTriggerCharacters, "canShowSuggestOnTriggerCharacters");
let SuggestModel = SuggestModel_1 = class SuggestModel2 {
  static {
    __name(this, "SuggestModel");
  }
  constructor(_editor, _editorWorkerService, _clipboardService, _telemetryService, _logService, _contextKeyService, _configurationService, _languageFeaturesService, _envService) {
    this._editor = _editor;
    this._editorWorkerService = _editorWorkerService;
    this._clipboardService = _clipboardService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._languageFeaturesService = _languageFeaturesService;
    this._envService = _envService;
    this._toDispose = new DisposableStore();
    this._triggerCharacterListener = new DisposableStore();
    this._triggerQuickSuggest = new TimeoutTimer();
    this._triggerState = void 0;
    this._completionDisposables = new DisposableStore();
    this._onDidCancel = new Emitter();
    this._onDidTrigger = new Emitter();
    this._onDidSuggest = new Emitter();
    this.onDidCancel = this._onDidCancel.event;
    this.onDidTrigger = this._onDidTrigger.event;
    this.onDidSuggest = this._onDidSuggest.event;
    this._currentSelection = this._editor.getSelection() || new Selection(1, 1, 1, 1);
    this._toDispose.add(this._editor.onDidChangeModel(() => {
      this._updateTriggerCharacters();
      this.cancel();
    }));
    this._toDispose.add(this._editor.onDidChangeModelLanguage(() => {
      this._updateTriggerCharacters();
      this.cancel();
    }));
    this._toDispose.add(this._editor.onDidChangeConfiguration(() => {
      this._updateTriggerCharacters();
    }));
    this._toDispose.add(this._languageFeaturesService.completionProvider.onDidChange(() => {
      this._updateTriggerCharacters();
      this._updateActiveSuggestSession();
    }));
    let editorIsComposing = false;
    this._toDispose.add(this._editor.onDidCompositionStart(() => {
      editorIsComposing = true;
    }));
    this._toDispose.add(this._editor.onDidCompositionEnd(() => {
      editorIsComposing = false;
      this._onCompositionEnd();
    }));
    this._toDispose.add(this._editor.onDidChangeCursorSelection((e) => {
      if (!editorIsComposing) {
        this._onCursorChange(e);
      }
    }));
    this._toDispose.add(this._editor.onDidChangeModelContent(() => {
      if (!editorIsComposing && this._triggerState !== void 0) {
        this._refilterCompletionItems();
      }
    }));
    this._updateTriggerCharacters();
  }
  dispose() {
    dispose(this._triggerCharacterListener);
    dispose([this._onDidCancel, this._onDidSuggest, this._onDidTrigger, this._triggerQuickSuggest]);
    this._toDispose.dispose();
    this._completionDisposables.dispose();
    this.cancel();
  }
  _updateTriggerCharacters() {
    this._triggerCharacterListener.clear();
    if (this._editor.getOption(
      99
      /* EditorOption.readOnly */
    ) || !this._editor.hasModel() || !this._editor.getOption(
      129
      /* EditorOption.suggestOnTriggerCharacters */
    )) {
      return;
    }
    const supportsByTriggerCharacter = /* @__PURE__ */ new Map();
    for (const support of this._languageFeaturesService.completionProvider.all(this._editor.getModel())) {
      for (const ch of support.triggerCharacters || []) {
        let set = supportsByTriggerCharacter.get(ch);
        if (!set) {
          set = /* @__PURE__ */ new Set();
          const suggestSupport = getSnippetSuggestSupport();
          if (suggestSupport) {
            set.add(suggestSupport);
          }
          supportsByTriggerCharacter.set(ch, set);
        }
        set.add(support);
      }
    }
    const checkTriggerCharacter = /* @__PURE__ */ __name((text) => {
      if (!canShowSuggestOnTriggerCharacters(this._editor, this._contextKeyService, this._configurationService)) {
        return;
      }
      if (LineContext.shouldAutoTrigger(this._editor)) {
        return;
      }
      if (!text) {
        const position = this._editor.getPosition();
        const model = this._editor.getModel();
        text = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
      }
      let lastChar = "";
      if (isLowSurrogate(text.charCodeAt(text.length - 1))) {
        if (isHighSurrogate(text.charCodeAt(text.length - 2))) {
          lastChar = text.substr(text.length - 2);
        }
      } else {
        lastChar = text.charAt(text.length - 1);
      }
      const supports = supportsByTriggerCharacter.get(lastChar);
      if (supports) {
        const providerItemsToReuse = /* @__PURE__ */ new Map();
        if (this._completionModel) {
          for (const [provider, items] of this._completionModel.getItemsByProvider()) {
            if (!supports.has(provider)) {
              providerItemsToReuse.set(provider, items);
            }
          }
        }
        this.trigger({
          auto: true,
          triggerKind: 1,
          triggerCharacter: lastChar,
          retrigger: Boolean(this._completionModel),
          clipboardText: this._completionModel?.clipboardText,
          completionOptions: { providerFilter: supports, providerItemsToReuse }
        });
      }
    }, "checkTriggerCharacter");
    this._triggerCharacterListener.add(this._editor.onDidType(checkTriggerCharacter));
    this._triggerCharacterListener.add(this._editor.onDidCompositionEnd(() => checkTriggerCharacter()));
  }
  // --- trigger/retrigger/cancel suggest
  get state() {
    if (!this._triggerState) {
      return 0;
    } else if (!this._triggerState.auto) {
      return 1;
    } else {
      return 2;
    }
  }
  cancel(retrigger = false) {
    if (this._triggerState !== void 0) {
      this._triggerQuickSuggest.cancel();
      this._requestToken?.cancel();
      this._requestToken = void 0;
      this._triggerState = void 0;
      this._completionModel = void 0;
      this._context = void 0;
      this._onDidCancel.fire({ retrigger });
    }
  }
  clear() {
    this._completionDisposables.clear();
  }
  _updateActiveSuggestSession() {
    if (this._triggerState !== void 0) {
      if (!this._editor.hasModel() || !this._languageFeaturesService.completionProvider.has(this._editor.getModel())) {
        this.cancel();
      } else {
        this.trigger({ auto: this._triggerState.auto, retrigger: true });
      }
    }
  }
  _onCursorChange(e) {
    if (!this._editor.hasModel()) {
      return;
    }
    const prevSelection = this._currentSelection;
    this._currentSelection = this._editor.getSelection();
    if (!e.selection.isEmpty() || e.reason !== 0 && e.reason !== 3 || e.source !== "keyboard" && e.source !== "deleteLeft") {
      this.cancel();
      return;
    }
    if (this._triggerState === void 0 && e.reason === 0) {
      if (prevSelection.containsRange(this._currentSelection) || prevSelection.getEndPosition().isBeforeOrEqual(this._currentSelection.getPosition())) {
        this._doTriggerQuickSuggest();
      }
    } else if (this._triggerState !== void 0 && e.reason === 3) {
      this._refilterCompletionItems();
    }
  }
  _onCompositionEnd() {
    if (this._triggerState === void 0) {
      this._doTriggerQuickSuggest();
    } else {
      this._refilterCompletionItems();
    }
  }
  _doTriggerQuickSuggest() {
    if (QuickSuggestionsOptions.isAllOff(this._editor.getOption(
      97
      /* EditorOption.quickSuggestions */
    ))) {
      return;
    }
    if (this._editor.getOption(
      126
      /* EditorOption.suggest */
    ).snippetsPreventQuickSuggestions && SnippetController2.get(this._editor)?.isInSnippet()) {
      return;
    }
    this.cancel();
    this._triggerQuickSuggest.cancelAndSet(() => {
      if (this._triggerState !== void 0) {
        return;
      }
      if (!LineContext.shouldAutoTrigger(this._editor)) {
        return;
      }
      if (!this._editor.hasModel() || !this._editor.hasWidgetFocus()) {
        return;
      }
      const model = this._editor.getModel();
      const pos = this._editor.getPosition();
      const config = this._editor.getOption(
        97
        /* EditorOption.quickSuggestions */
      );
      if (QuickSuggestionsOptions.isAllOff(config)) {
        return;
      }
      if (!QuickSuggestionsOptions.isAllOn(config)) {
        model.tokenization.tokenizeIfCheap(pos.lineNumber);
        const lineTokens = model.tokenization.getLineTokens(pos.lineNumber);
        const tokenType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(Math.max(pos.column - 1 - 1, 0)));
        if (QuickSuggestionsOptions.valueFor(config, tokenType) !== "on") {
          return;
        }
      }
      if (!canShowQuickSuggest(this._editor, this._contextKeyService, this._configurationService)) {
        return;
      }
      if (!this._languageFeaturesService.completionProvider.has(model)) {
        return;
      }
      this.trigger({ auto: true });
    }, this._editor.getOption(
      98
      /* EditorOption.quickSuggestionsDelay */
    ));
  }
  _refilterCompletionItems() {
    assertType(this._editor.hasModel());
    assertType(this._triggerState !== void 0);
    const model = this._editor.getModel();
    const position = this._editor.getPosition();
    const ctx = new LineContext(model, position, { ...this._triggerState, refilter: true });
    this._onNewContext(ctx);
  }
  trigger(options) {
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    const ctx = new LineContext(model, this._editor.getPosition(), options);
    this.cancel(options.retrigger);
    this._triggerState = options;
    this._onDidTrigger.fire({ auto: options.auto, shy: options.shy ?? false, position: this._editor.getPosition() });
    this._context = ctx;
    let suggestCtx = {
      triggerKind: options.triggerKind ?? 0
      /* CompletionTriggerKind.Invoke */
    };
    if (options.triggerCharacter) {
      suggestCtx = {
        triggerKind: 1,
        triggerCharacter: options.triggerCharacter
      };
    }
    this._requestToken = new CancellationTokenSource();
    const snippetSuggestions = this._editor.getOption(
      120
      /* EditorOption.snippetSuggestions */
    );
    let snippetSortOrder = 1;
    switch (snippetSuggestions) {
      case "top":
        snippetSortOrder = 0;
        break;
      // 	↓ that's the default anyways...
      // case 'inline':
      // 	snippetSortOrder = SnippetSortOrder.Inline;
      // 	break;
      case "bottom":
        snippetSortOrder = 2;
        break;
    }
    const { itemKind: itemKindFilter, showDeprecated } = SuggestModel_1.createSuggestFilter(this._editor);
    const completionOptions = new CompletionOptions(snippetSortOrder, options.completionOptions?.kindFilter ?? itemKindFilter, options.completionOptions?.providerFilter, options.completionOptions?.providerItemsToReuse, showDeprecated);
    const wordDistance = WordDistance.create(this._editorWorkerService, this._editor);
    const completions = provideSuggestionItems(this._languageFeaturesService.completionProvider, model, this._editor.getPosition(), completionOptions, suggestCtx, this._requestToken.token);
    Promise.all([completions, wordDistance]).then(async ([completions2, wordDistance2]) => {
      this._requestToken?.dispose();
      if (!this._editor.hasModel()) {
        completions2.disposable.dispose();
        return;
      }
      let clipboardText = options?.clipboardText;
      if (!clipboardText && completions2.needsClipboard) {
        clipboardText = await this._clipboardService.readText();
      }
      if (this._triggerState === void 0) {
        completions2.disposable.dispose();
        return;
      }
      const model2 = this._editor.getModel();
      const ctx2 = new LineContext(model2, this._editor.getPosition(), options);
      const fuzzySearchOptions = {
        ...FuzzyScoreOptions.default,
        firstMatchCanBeWeak: !this._editor.getOption(
          126
          /* EditorOption.suggest */
        ).matchOnWordStartOnly
      };
      this._completionModel = new CompletionModel(completions2.items, this._context.column, {
        leadingLineContent: ctx2.leadingLineContent,
        characterCountDelta: ctx2.column - this._context.column
      }, wordDistance2, this._editor.getOption(
        126
        /* EditorOption.suggest */
      ), this._editor.getOption(
        120
        /* EditorOption.snippetSuggestions */
      ), fuzzySearchOptions, clipboardText);
      this._completionDisposables.add(completions2.disposable);
      this._onNewContext(ctx2);
      this._reportDurationsTelemetry(completions2.durations);
      if (!this._envService.isBuilt || this._envService.isExtensionDevelopment) {
        for (const item of completions2.items) {
          if (item.isInvalid) {
            this._logService.warn(`[suggest] did IGNORE invalid completion item from ${item.provider._debugDisplayName}`, item.completion);
          }
        }
      }
    }).catch(onUnexpectedError);
  }
  /**
   * Report durations telemetry with a 1% sampling rate.
   * The telemetry is reported only if a random number between 0 and 100 is less than or equal to 1.
   */
  _reportDurationsTelemetry(durations) {
    if (Math.random() > 1e-4) {
      return;
    }
    setTimeout(() => {
      this._telemetryService.publicLog2("suggest.durations.json", { data: JSON.stringify(durations) });
      this._logService.debug("suggest.durations.json", durations);
    });
  }
  static createSuggestFilter(editor) {
    const result = /* @__PURE__ */ new Set();
    const snippetSuggestions = editor.getOption(
      120
      /* EditorOption.snippetSuggestions */
    );
    if (snippetSuggestions === "none") {
      result.add(
        28
        /* CompletionItemKind.Snippet */
      );
    }
    const suggestOptions = editor.getOption(
      126
      /* EditorOption.suggest */
    );
    if (!suggestOptions.showMethods) {
      result.add(
        0
        /* CompletionItemKind.Method */
      );
    }
    if (!suggestOptions.showFunctions) {
      result.add(
        1
        /* CompletionItemKind.Function */
      );
    }
    if (!suggestOptions.showConstructors) {
      result.add(
        2
        /* CompletionItemKind.Constructor */
      );
    }
    if (!suggestOptions.showFields) {
      result.add(
        3
        /* CompletionItemKind.Field */
      );
    }
    if (!suggestOptions.showVariables) {
      result.add(
        4
        /* CompletionItemKind.Variable */
      );
    }
    if (!suggestOptions.showClasses) {
      result.add(
        5
        /* CompletionItemKind.Class */
      );
    }
    if (!suggestOptions.showStructs) {
      result.add(
        6
        /* CompletionItemKind.Struct */
      );
    }
    if (!suggestOptions.showInterfaces) {
      result.add(
        7
        /* CompletionItemKind.Interface */
      );
    }
    if (!suggestOptions.showModules) {
      result.add(
        8
        /* CompletionItemKind.Module */
      );
    }
    if (!suggestOptions.showProperties) {
      result.add(
        9
        /* CompletionItemKind.Property */
      );
    }
    if (!suggestOptions.showEvents) {
      result.add(
        10
        /* CompletionItemKind.Event */
      );
    }
    if (!suggestOptions.showOperators) {
      result.add(
        11
        /* CompletionItemKind.Operator */
      );
    }
    if (!suggestOptions.showUnits) {
      result.add(
        12
        /* CompletionItemKind.Unit */
      );
    }
    if (!suggestOptions.showValues) {
      result.add(
        13
        /* CompletionItemKind.Value */
      );
    }
    if (!suggestOptions.showConstants) {
      result.add(
        14
        /* CompletionItemKind.Constant */
      );
    }
    if (!suggestOptions.showEnums) {
      result.add(
        15
        /* CompletionItemKind.Enum */
      );
    }
    if (!suggestOptions.showEnumMembers) {
      result.add(
        16
        /* CompletionItemKind.EnumMember */
      );
    }
    if (!suggestOptions.showKeywords) {
      result.add(
        17
        /* CompletionItemKind.Keyword */
      );
    }
    if (!suggestOptions.showWords) {
      result.add(
        18
        /* CompletionItemKind.Text */
      );
    }
    if (!suggestOptions.showColors) {
      result.add(
        19
        /* CompletionItemKind.Color */
      );
    }
    if (!suggestOptions.showFiles) {
      result.add(
        20
        /* CompletionItemKind.File */
      );
    }
    if (!suggestOptions.showReferences) {
      result.add(
        21
        /* CompletionItemKind.Reference */
      );
    }
    if (!suggestOptions.showColors) {
      result.add(
        22
        /* CompletionItemKind.Customcolor */
      );
    }
    if (!suggestOptions.showFolders) {
      result.add(
        23
        /* CompletionItemKind.Folder */
      );
    }
    if (!suggestOptions.showTypeParameters) {
      result.add(
        24
        /* CompletionItemKind.TypeParameter */
      );
    }
    if (!suggestOptions.showSnippets) {
      result.add(
        28
        /* CompletionItemKind.Snippet */
      );
    }
    if (!suggestOptions.showUsers) {
      result.add(
        25
        /* CompletionItemKind.User */
      );
    }
    if (!suggestOptions.showIssues) {
      result.add(
        26
        /* CompletionItemKind.Issue */
      );
    }
    return { itemKind: result, showDeprecated: suggestOptions.showDeprecated };
  }
  _onNewContext(ctx) {
    if (!this._context) {
      return;
    }
    if (ctx.lineNumber !== this._context.lineNumber) {
      this.cancel();
      return;
    }
    if (getLeadingWhitespace(ctx.leadingLineContent) !== getLeadingWhitespace(this._context.leadingLineContent)) {
      this.cancel();
      return;
    }
    if (ctx.column < this._context.column) {
      if (ctx.leadingWord.word) {
        this.trigger({ auto: this._context.triggerOptions.auto, retrigger: true });
      } else {
        this.cancel();
      }
      return;
    }
    if (!this._completionModel) {
      return;
    }
    if (ctx.leadingWord.word.length !== 0 && ctx.leadingWord.startColumn > this._context.leadingWord.startColumn) {
      const shouldAutoTrigger = LineContext.shouldAutoTrigger(this._editor);
      if (shouldAutoTrigger && this._context) {
        const map = this._completionModel.getItemsByProvider();
        this.trigger({
          auto: this._context.triggerOptions.auto,
          retrigger: true,
          clipboardText: this._completionModel.clipboardText,
          completionOptions: { providerItemsToReuse: map }
        });
      }
      return;
    }
    if (ctx.column > this._context.column && this._completionModel.getIncompleteProvider().size > 0 && ctx.leadingWord.word.length !== 0) {
      const providerItemsToReuse = /* @__PURE__ */ new Map();
      const providerFilter = /* @__PURE__ */ new Set();
      for (const [provider, items] of this._completionModel.getItemsByProvider()) {
        if (items.length > 0 && items[0].container.incomplete) {
          providerFilter.add(provider);
        } else {
          providerItemsToReuse.set(provider, items);
        }
      }
      this.trigger({
        auto: this._context.triggerOptions.auto,
        triggerKind: 2,
        retrigger: true,
        clipboardText: this._completionModel.clipboardText,
        completionOptions: { providerFilter, providerItemsToReuse }
      });
    } else {
      const oldLineContext = this._completionModel.lineContext;
      let isFrozen = false;
      this._completionModel.lineContext = {
        leadingLineContent: ctx.leadingLineContent,
        characterCountDelta: ctx.column - this._context.column
      };
      if (this._completionModel.items.length === 0) {
        const shouldAutoTrigger = LineContext.shouldAutoTrigger(this._editor);
        if (!this._context) {
          this.cancel();
          return;
        }
        if (shouldAutoTrigger && this._context.leadingWord.endColumn < ctx.leadingWord.startColumn) {
          this.trigger({ auto: this._context.triggerOptions.auto, retrigger: true });
          return;
        }
        if (!this._context.triggerOptions.auto) {
          this._completionModel.lineContext = oldLineContext;
          isFrozen = this._completionModel.items.length > 0;
          if (isFrozen && ctx.leadingWord.word.length === 0) {
            this.cancel();
            return;
          }
        } else {
          this.cancel();
          return;
        }
      }
      this._onDidSuggest.fire({
        completionModel: this._completionModel,
        triggerOptions: ctx.triggerOptions,
        isFrozen
      });
    }
  }
};
SuggestModel = SuggestModel_1 = __decorate([
  __param(1, IEditorWorkerService),
  __param(2, IClipboardService),
  __param(3, ITelemetryService),
  __param(4, ILogService),
  __param(5, IContextKeyService),
  __param(6, IConfigurationService),
  __param(7, ILanguageFeaturesService),
  __param(8, IEnvironmentService)
], SuggestModel);
export {
  LineContext,
  State,
  SuggestModel
};
//# sourceMappingURL=suggestModel.js.map
