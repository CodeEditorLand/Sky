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
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { compare, compareSubstring } from "../../../../base/common/strings.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { SnippetParser } from "../../../../editor/contrib/snippet/browser/snippetParser.js";
import { localize } from "../../../../nls.js";
import { ISnippetsService } from "./snippets.js";
import { Snippet } from "./snippetsFile.js";
import { isPatternInWord } from "../../../../base/common/filters.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { ILanguageConfigurationService } from "../../../../editor/common/languages/languageConfigurationRegistry.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
const markSnippetAsUsed = "_snippet.markAsUsed";
CommandsRegistry.registerCommand(markSnippetAsUsed, (accessor, ...args) => {
  const snippetsService = accessor.get(ISnippetsService);
  const [first] = args;
  if (first instanceof Snippet) {
    snippetsService.updateUsageTimestamp(first);
  }
});
class SnippetCompletion {
  static {
    __name(this, "SnippetCompletion");
  }
  constructor(snippet, range) {
    this.snippet = snippet;
    this.label = { label: snippet.prefix, description: snippet.name };
    this.detail = localize("detail.snippet", "{0} ({1})", snippet.description || snippet.name, snippet.source);
    this.insertText = snippet.codeSnippet;
    this.extensionId = snippet.extensionId;
    this.range = range;
    this.sortText = `${snippet.snippetSource === 3 ? "z" : "a"}-${snippet.prefix}`;
    this.kind = 28;
    this.insertTextRules = 4;
    this.command = { id: markSnippetAsUsed, title: "", arguments: [snippet] };
  }
  resolve() {
    this.documentation = new MarkdownString().appendCodeblock("", SnippetParser.asInsertText(this.snippet.codeSnippet));
    return this;
  }
  static compareByLabel(a, b) {
    return compare(a.label.label, b.label.label);
  }
}
let SnippetCompletionProvider = class SnippetCompletionProvider2 {
  static {
    __name(this, "SnippetCompletionProvider");
  }
  constructor(_languageService, _snippets, _languageConfigurationService) {
    this._languageService = _languageService;
    this._snippets = _snippets;
    this._languageConfigurationService = _languageConfigurationService;
    this._debugDisplayName = "snippetCompletions";
  }
  async provideCompletionItems(model, position, context) {
    const sw = new StopWatch();
    const line = position.lineNumber;
    const word = model.getWordAtPosition(position) ?? { startColumn: position.column, endColumn: position.column, word: "" };
    const lineContentLow = model.getLineContent(position.lineNumber).toLowerCase();
    const lineContentWithWordLow = lineContentLow.substring(0, word.startColumn + word.word.length - 1);
    const anchors = this._computeSnippetPositions(model, line, word, lineContentWithWordLow);
    const columnOffset = position.column - 1;
    const triggerCharacterLow = context.triggerCharacter?.toLowerCase() ?? "";
    const languageId = this._getLanguageIdAtPosition(model, position);
    const languageConfig = this._languageConfigurationService.getLanguageConfiguration(languageId);
    const snippets = new Set(await this._snippets.getSnippets(languageId, model.uri));
    const suggestions = [];
    for (const snippet of snippets) {
      if (context.triggerKind === 1 && !snippet.prefixLow.startsWith(triggerCharacterLow)) {
        continue;
      }
      let candidate;
      for (const anchor of anchors) {
        if (anchor.prefixLow.match(/^\s/) && !snippet.prefixLow.match(/^\s/)) {
          continue;
        }
        if (isPatternInWord(anchor.prefixLow, 0, anchor.prefixLow.length, snippet.prefixLow, 0, snippet.prefixLow.length)) {
          candidate = anchor;
          break;
        }
      }
      if (!candidate) {
        continue;
      }
      const pos = candidate.startColumn - 1;
      const prefixRestLen = snippet.prefixLow.length - (columnOffset - pos);
      const endsWithPrefixRest = compareSubstring(lineContentLow, snippet.prefixLow, columnOffset, columnOffset + prefixRestLen, columnOffset - pos);
      const startPosition = position.with(void 0, pos + 1);
      let endColumn = endsWithPrefixRest === 0 ? position.column + prefixRestLen : position.column;
      if (columnOffset < lineContentLow.length) {
        const autoClosingPairs = languageConfig.getAutoClosingPairs();
        const standardAutoClosingPairConditionals = autoClosingPairs.autoClosingPairsCloseSingleChar.get(lineContentLow[columnOffset]);
        if (standardAutoClosingPairConditionals?.some((p) => (
          // and the start position is the opening character of an autoclosing pair
          p.open === lineContentLow[startPosition.column - 1] && // and the snippet prefix contains the opening and closing pair at its edges
          snippet.prefix.startsWith(p.open) && snippet.prefix[snippet.prefix.length - 1] === p.close
        ))) {
          endColumn++;
        }
      }
      const replace = Range.fromPositions({ lineNumber: line, column: candidate.startColumn }, { lineNumber: line, column: endColumn });
      const insert = replace.setEndPosition(line, position.column);
      suggestions.push(new SnippetCompletion(snippet, { replace, insert }));
      snippets.delete(snippet);
    }
    if (!triggerCharacterLow && (/\s/.test(lineContentLow[position.column - 2]) || !lineContentLow)) {
      for (const snippet of snippets) {
        const insert = Range.fromPositions(position);
        const replace = lineContentLow.indexOf(snippet.prefixLow, columnOffset) === columnOffset ? insert.setEndPosition(position.lineNumber, position.column + snippet.prefixLow.length) : insert;
        suggestions.push(new SnippetCompletion(snippet, { replace, insert }));
      }
    }
    this._disambiguateSnippets(suggestions);
    return {
      suggestions,
      duration: sw.elapsed()
    };
  }
  _disambiguateSnippets(suggestions) {
    suggestions.sort(SnippetCompletion.compareByLabel);
    for (let i = 0; i < suggestions.length; i++) {
      const item = suggestions[i];
      let to = i + 1;
      for (; to < suggestions.length && item.label === suggestions[to].label; to++) {
        suggestions[to].label.label = localize("snippetSuggest.longLabel", "{0}, {1}", suggestions[to].label.label, suggestions[to].snippet.name);
      }
      if (to > i + 1) {
        suggestions[i].label.label = localize("snippetSuggest.longLabel", "{0}, {1}", suggestions[i].label.label, suggestions[i].snippet.name);
        i = to;
      }
    }
  }
  resolveCompletionItem(item) {
    return item instanceof SnippetCompletion ? item.resolve() : item;
  }
  _computeSnippetPositions(model, line, word, lineContentWithWordLow) {
    const result = [];
    for (let column = 1; column < word.startColumn; column++) {
      const wordInfo = model.getWordAtPosition(new Position(line, column));
      result.push({
        startColumn: column,
        prefixLow: lineContentWithWordLow.substring(column - 1),
        isWord: Boolean(wordInfo)
      });
      if (wordInfo) {
        column = wordInfo.endColumn;
        result.push({
          startColumn: wordInfo.endColumn,
          prefixLow: lineContentWithWordLow.substring(wordInfo.endColumn - 1),
          isWord: false
        });
      }
    }
    if (word.word.length > 0 || result.length === 0) {
      result.push({
        startColumn: word.startColumn,
        prefixLow: lineContentWithWordLow.substring(word.startColumn - 1),
        isWord: true
      });
    }
    return result;
  }
  _getLanguageIdAtPosition(model, position) {
    model.tokenization.tokenizeIfCheap(position.lineNumber);
    let languageId = model.getLanguageIdAtPosition(position.lineNumber, position.column);
    if (!this._languageService.getLanguageName(languageId)) {
      languageId = model.getLanguageId();
    }
    return languageId;
  }
};
SnippetCompletionProvider = __decorate([
  __param(0, ILanguageService),
  __param(1, ISnippetsService),
  __param(2, ILanguageConfigurationService)
], SnippetCompletionProvider);
export {
  SnippetCompletion,
  SnippetCompletionProvider
};
//# sourceMappingURL=snippetCompletionProvider.js.map
