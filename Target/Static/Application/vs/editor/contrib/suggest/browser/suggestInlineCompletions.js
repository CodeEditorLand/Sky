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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { FuzzyScore } from "../../../../base/common/filters.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable, RefCountedDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { Range } from "../../../common/core/range.js";
import { registerEditorFeature } from "../../../common/editorFeatures.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { CompletionModel, LineContext } from "./completionModel.js";
import { CompletionOptions, provideSuggestionItems, QuickSuggestionsOptions } from "./suggest.js";
import { ISuggestMemoryService } from "./suggestMemory.js";
import { SuggestModel } from "./suggestModel.js";
import { WordDistance } from "./wordDistance.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
class SuggestInlineCompletion {
  static {
    __name(this, "SuggestInlineCompletion");
  }
  constructor(range, insertText, filterText, additionalTextEdits, command, gutterMenuLinkAction, completion) {
    this.range = range;
    this.insertText = insertText;
    this.filterText = filterText;
    this.additionalTextEdits = additionalTextEdits;
    this.command = command;
    this.gutterMenuLinkAction = gutterMenuLinkAction;
    this.completion = completion;
    this.doNotLog = true;
  }
}
let InlineCompletionResults = class InlineCompletionResults2 extends RefCountedDisposable {
  static {
    __name(this, "InlineCompletionResults");
  }
  constructor(model, line, word, completionModel, completions, _suggestMemoryService) {
    super(completions.disposable);
    this.model = model;
    this.line = line;
    this.word = word;
    this.completionModel = completionModel;
    this._suggestMemoryService = _suggestMemoryService;
  }
  canBeReused(model, line, word) {
    return this.model === model && this.line === line && this.word.word.length > 0 && this.word.startColumn === word.startColumn && this.word.endColumn < word.endColumn && this.completionModel.getIncompleteProvider().size === 0;
  }
  get items() {
    const result = [];
    const { items } = this.completionModel;
    const selectedIndex = this._suggestMemoryService.select(this.model, { lineNumber: this.line, column: this.word.endColumn + this.completionModel.lineContext.characterCountDelta }, items);
    const first = Iterable.slice(items, selectedIndex);
    const second = Iterable.slice(items, 0, selectedIndex);
    let resolveCount = 5;
    for (const item of Iterable.concat(first, second)) {
      if (item.score === FuzzyScore.Default) {
        continue;
      }
      const range = new Range(
        item.editStart.lineNumber,
        item.editStart.column,
        item.editInsertEnd.lineNumber,
        item.editInsertEnd.column + this.completionModel.lineContext.characterCountDelta
        // end PLUS character delta
      );
      const insertText = item.completion.insertTextRules && item.completion.insertTextRules & 4 ? { snippet: item.completion.insertText } : item.completion.insertText;
      result.push(new SuggestInlineCompletion(range, insertText, item.filterTextLow ?? item.labelLow, item.completion.additionalTextEdits, item.completion.command, item.completion.action, item));
      if (resolveCount-- >= 0) {
        item.resolve(CancellationToken.None);
      }
    }
    return result;
  }
};
InlineCompletionResults = __decorate([
  __param(5, ISuggestMemoryService)
], InlineCompletionResults);
let SuggestInlineCompletions = class SuggestInlineCompletions2 extends Disposable {
  static {
    __name(this, "SuggestInlineCompletions");
  }
  constructor(_languageFeatureService, _clipboardService, _suggestMemoryService, _editorService) {
    super();
    this._languageFeatureService = _languageFeatureService;
    this._clipboardService = _clipboardService;
    this._suggestMemoryService = _suggestMemoryService;
    this._editorService = _editorService;
    this._store.add(_languageFeatureService.inlineCompletionsProvider.register("*", this));
  }
  async provideInlineCompletions(model, position, context, token) {
    if (context.selectedSuggestionInfo) {
      return;
    }
    let editor;
    for (const candidate of this._editorService.listCodeEditors()) {
      if (candidate.getModel() === model) {
        editor = candidate;
        break;
      }
    }
    if (!editor) {
      return;
    }
    const config = editor.getOption(
      102
      /* EditorOption.quickSuggestions */
    );
    if (QuickSuggestionsOptions.isAllOff(config)) {
      return;
    }
    model.tokenization.tokenizeIfCheap(position.lineNumber);
    const lineTokens = model.tokenization.getLineTokens(position.lineNumber);
    const tokenType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(Math.max(position.column - 1 - 1, 0)));
    if (QuickSuggestionsOptions.valueFor(config, tokenType) !== "inline") {
      return void 0;
    }
    let wordInfo = model.getWordAtPosition(position);
    let triggerCharacterInfo;
    if (!wordInfo?.word) {
      triggerCharacterInfo = this._getTriggerCharacterInfo(model, position);
    }
    if (!wordInfo?.word && !triggerCharacterInfo) {
      return;
    }
    if (!wordInfo) {
      wordInfo = model.getWordUntilPosition(position);
    }
    if (wordInfo.endColumn !== position.column) {
      return;
    }
    let result;
    const leadingLineContents = model.getValueInRange(new Range(position.lineNumber, 1, position.lineNumber, position.column));
    if (!triggerCharacterInfo && this._lastResult?.canBeReused(model, position.lineNumber, wordInfo)) {
      const newLineContext = new LineContext(leadingLineContents, position.column - this._lastResult.word.endColumn);
      this._lastResult.completionModel.lineContext = newLineContext;
      this._lastResult.acquire();
      result = this._lastResult;
    } else {
      const completions = await provideSuggestionItems(this._languageFeatureService.completionProvider, model, position, new CompletionOptions(void 0, SuggestModel.createSuggestFilter(editor).itemKind, triggerCharacterInfo?.providers), triggerCharacterInfo && { triggerKind: 1, triggerCharacter: triggerCharacterInfo.ch }, token);
      let clipboardText;
      if (completions.needsClipboard) {
        clipboardText = await this._clipboardService.readText();
      }
      const completionModel = new CompletionModel(completions.items, position.column, new LineContext(leadingLineContents, 0), WordDistance.None, editor.getOption(
        134
        /* EditorOption.suggest */
      ), editor.getOption(
        128
        /* EditorOption.snippetSuggestions */
      ), { boostFullMatch: false, firstMatchCanBeWeak: false }, clipboardText);
      result = new InlineCompletionResults(model, position.lineNumber, wordInfo, completionModel, completions, this._suggestMemoryService);
    }
    this._lastResult = result;
    return result;
  }
  handleItemDidShow(_completions, item) {
    item.completion.resolve(CancellationToken.None);
  }
  disposeInlineCompletions(result) {
    result.release();
  }
  _getTriggerCharacterInfo(model, position) {
    const ch = model.getValueInRange(Range.fromPositions({ lineNumber: position.lineNumber, column: position.column - 1 }, position));
    const providers = /* @__PURE__ */ new Set();
    for (const provider of this._languageFeatureService.completionProvider.all(model)) {
      if (provider.triggerCharacters?.includes(ch)) {
        providers.add(provider);
      }
    }
    if (providers.size === 0) {
      return void 0;
    }
    return { providers, ch };
  }
};
SuggestInlineCompletions = __decorate([
  __param(0, ILanguageFeaturesService),
  __param(1, IClipboardService),
  __param(2, ISuggestMemoryService),
  __param(3, ICodeEditorService)
], SuggestInlineCompletions);
registerEditorFeature(SuggestInlineCompletions);
export {
  SuggestInlineCompletions
};
//# sourceMappingURL=suggestInlineCompletions.js.map
