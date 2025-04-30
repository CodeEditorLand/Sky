var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../../base/common/assert.js";
import { AsyncIterableObject, DeferredPromise } from "../../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../../base/common/errors.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { SetMap } from "../../../../../base/common/map.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { SingleOffsetEdit } from "../../../../common/core/offsetEdit.js";
import { OffsetRange } from "../../../../common/core/offsetRange.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { InlineCompletionEndOfLifeReasonKind, InlineCompletionTriggerKind } from "../../../../common/languages.js";
import { fixBracketsInLine } from "../../../../common/model/bracketPairsTextModelPart/fixBrackets.js";
import { TextModelText } from "../../../../common/model/textModelText.js";
import { SnippetParser, Text } from "../../../snippet/browser/snippetParser.js";
import { getReadonlyEmptyArray } from "../utils.js";
async function provideInlineCompletions(providers, positionOrRange, model, context, baseToken = CancellationToken.None, languageConfigurationService) {
  const requestUuid = generateUuid();
  const tokenSource = new CancellationTokenSource(baseToken);
  const token = tokenSource.token;
  const contextWithUuid = { ...context, requestUuid };
  const defaultReplaceRange = positionOrRange instanceof Position ? getDefaultRange(positionOrRange, model) : positionOrRange;
  const multiMap = new SetMap();
  for (const provider of providers) {
    if (provider.groupId) {
      multiMap.add(provider.groupId, provider);
    }
  }
  function getPreferredProviders(provider) {
    if (!provider.yieldsToGroupIds) {
      return [];
    }
    const result2 = [];
    for (const groupId of provider.yieldsToGroupIds || []) {
      const providers2 = multiMap.get(groupId);
      for (const p of providers2) {
        result2.push(p);
      }
    }
    return result2;
  }
  __name(getPreferredProviders, "getPreferredProviders");
  function findPreferredProviderCircle(provider, stack, seen) {
    stack = [...stack, provider];
    if (seen.has(provider)) {
      return stack;
    }
    seen.add(provider);
    try {
      const preferred = getPreferredProviders(provider);
      for (const p of preferred) {
        const c = findPreferredProviderCircle(p, stack, seen);
        if (c) {
          return c;
        }
      }
    } finally {
      seen.delete(provider);
    }
    return void 0;
  }
  __name(findPreferredProviderCircle, "findPreferredProviderCircle");
  function queryProviderOrPreferredProvider(provider, states2) {
    const state = states2.get(provider);
    if (state) {
      return state;
    }
    const circle = findPreferredProviderCircle(provider, [], /* @__PURE__ */ new Set());
    if (circle) {
      onUnexpectedExternalError(new Error(`Inline completions: cyclic yield-to dependency detected. Path: ${circle.map((s) => s.toString ? s.toString() : "" + s).join(" -> ")}`));
    }
    const deferredPromise = new DeferredPromise();
    states2.set(provider, deferredPromise.p);
    (async () => {
      if (!circle) {
        const preferred = getPreferredProviders(provider);
        for (const p of preferred) {
          const result2 = await queryProviderOrPreferredProvider(p, states2);
          if (result2 && result2.inlineSuggestions.items.length > 0) {
            return void 0;
          }
        }
      }
      return query(provider);
    })().then((c) => deferredPromise.complete(c), (e) => deferredPromise.error(e));
    return deferredPromise.p;
  }
  __name(queryProviderOrPreferredProvider, "queryProviderOrPreferredProvider");
  async function query(provider) {
    let result2;
    try {
      if (positionOrRange instanceof Position) {
        result2 = await provider.provideInlineCompletions(model, positionOrRange, contextWithUuid, token);
      } else {
        result2 = await provider.provideInlineEditsForRange?.(model, positionOrRange, contextWithUuid, token);
      }
    } catch (e) {
      onUnexpectedExternalError(e);
      return void 0;
    }
    if (!result2) {
      return void 0;
    }
    const data = [];
    const list = new InlineSuggestionList(result2, data, provider);
    for (const item of result2.items) {
      data.push(createInlineCompletionItem(item, list, defaultReplaceRange, model, languageConfigurationService, contextWithUuid));
    }
    runWhenCancelled(token, () => list.removeRef());
    return list;
  }
  __name(query, "query");
  const states = /* @__PURE__ */ new Map();
  const inlineCompletionLists = AsyncIterableObject.fromPromisesResolveOrder(providers.map((p) => queryProviderOrPreferredProvider(p, states)));
  if (token.isCancellationRequested) {
    tokenSource.dispose(true);
    return new InlineCompletionProviderResult([], /* @__PURE__ */ new Set(), []);
  }
  const result = await addRefAndCreateResult(contextWithUuid, inlineCompletionLists, model);
  tokenSource.dispose(true);
  return result;
}
__name(provideInlineCompletions, "provideInlineCompletions");
function runWhenCancelled(token, callback) {
  if (token.isCancellationRequested) {
    callback();
    return Disposable.None;
  } else {
    const listener = token.onCancellationRequested(() => {
      listener.dispose();
      callback();
    });
    return { dispose: /* @__PURE__ */ __name(() => listener.dispose(), "dispose") };
  }
}
__name(runWhenCancelled, "runWhenCancelled");
async function addRefAndCreateResult(context, inlineCompletionLists, model) {
  const itemsByHash = /* @__PURE__ */ new Map();
  let shouldStop = false;
  const lists = [];
  for await (const completions of inlineCompletionLists) {
    if (!completions) {
      continue;
    }
    completions.addRef();
    lists.push(completions);
    for (const item of completions.inlineSuggestionsData) {
      if (!context.includeInlineEdits && (item.isInlineEdit || item.showInlineEditMenu)) {
        continue;
      }
      if (!context.includeInlineCompletions && !(item.isInlineEdit || item.showInlineEditMenu)) {
        continue;
      }
      itemsByHash.set(createHashFromSingleTextEdit(item.getSingleTextEdit()), item);
      if (!(item.isInlineEdit || item.showInlineEditMenu) && context.triggerKind === InlineCompletionTriggerKind.Automatic) {
        const minifiedEdit = item.getSingleTextEdit().removeCommonPrefix(new TextModelText(model));
        if (!minifiedEdit.isEmpty) {
          shouldStop = true;
        }
      }
    }
    if (shouldStop) {
      break;
    }
  }
  return new InlineCompletionProviderResult(Array.from(itemsByHash.values()), new Set(itemsByHash.keys()), lists);
}
__name(addRefAndCreateResult, "addRefAndCreateResult");
class InlineCompletionProviderResult {
  static {
    __name(this, "InlineCompletionProviderResult");
  }
  constructor(completions, hashs, providerResults) {
    this.completions = completions;
    this.hashs = hashs;
    this.providerResults = providerResults;
  }
  has(edit) {
    return this.hashs.has(createHashFromSingleTextEdit(edit));
  }
  // TODO: This is not complete as it does not take the textmodel into account
  isEmpty() {
    return this.completions.length === 0 || this.completions.every((c) => c.range.isEmpty() && c.insertText.length === 0);
  }
  dispose() {
    for (const result of this.providerResults) {
      result.removeRef();
    }
  }
}
function createHashFromSingleTextEdit(edit) {
  return JSON.stringify([edit.text, edit.range.getStartPosition().toString()]);
}
__name(createHashFromSingleTextEdit, "createHashFromSingleTextEdit");
function createInlineCompletionItem(inlineCompletion, source, defaultReplaceRange, textModel, languageConfigurationService, context) {
  let insertText;
  let snippetInfo;
  let range = inlineCompletion.range ? Range.lift(inlineCompletion.range) : defaultReplaceRange;
  if (typeof inlineCompletion.insertText === "string") {
    insertText = inlineCompletion.insertText;
    if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
      insertText = closeBrackets(insertText, range.getStartPosition(), textModel, languageConfigurationService);
      const diff = insertText.length - inlineCompletion.insertText.length;
      if (diff !== 0) {
        range = new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
      }
    }
    snippetInfo = void 0;
  } else if ("snippet" in inlineCompletion.insertText) {
    const preBracketCompletionLength = inlineCompletion.insertText.snippet.length;
    if (languageConfigurationService && inlineCompletion.completeBracketPairs) {
      inlineCompletion.insertText.snippet = closeBrackets(inlineCompletion.insertText.snippet, range.getStartPosition(), textModel, languageConfigurationService);
      const diff = inlineCompletion.insertText.snippet.length - preBracketCompletionLength;
      if (diff !== 0) {
        range = new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + diff);
      }
    }
    const snippet = new SnippetParser().parse(inlineCompletion.insertText.snippet);
    if (snippet.children.length === 1 && snippet.children[0] instanceof Text) {
      insertText = snippet.children[0].value;
      snippetInfo = void 0;
    } else {
      insertText = snippet.toString();
      snippetInfo = {
        snippet: inlineCompletion.insertText.snippet,
        range
      };
    }
  } else {
    assertNever(inlineCompletion.insertText);
  }
  const displayLocation = inlineCompletion.displayLocation ? {
    range: Range.lift(inlineCompletion.displayLocation.range),
    label: inlineCompletion.displayLocation.label
  } : void 0;
  return new InlineSuggestData(range, insertText, snippetInfo, displayLocation, inlineCompletion.additionalTextEdits || getReadonlyEmptyArray(), inlineCompletion, source, context, inlineCompletion.isInlineEdit ?? false);
}
__name(createInlineCompletionItem, "createInlineCompletionItem");
class InlineSuggestData {
  static {
    __name(this, "InlineSuggestData");
  }
  constructor(range, insertText, snippetInfo, displayLocation, additionalTextEdits, sourceInlineCompletion, source, context, isInlineEdit) {
    this.range = range;
    this.insertText = insertText;
    this.snippetInfo = snippetInfo;
    this.displayLocation = displayLocation;
    this.additionalTextEdits = additionalTextEdits;
    this.sourceInlineCompletion = sourceInlineCompletion;
    this.source = source;
    this.context = context;
    this.isInlineEdit = isInlineEdit;
    this._didShow = false;
    this._didReportEndOfLife = false;
    this._lastSetEndOfLifeReason = void 0;
  }
  get showInlineEditMenu() {
    return this.sourceInlineCompletion.showInlineEditMenu ?? false;
  }
  getSingleTextEdit() {
    return new SingleTextEdit(this.range, this.insertText);
  }
  async reportInlineEditShown(commandService, updatedInsertText) {
    if (this._didShow) {
      return;
    }
    this._didShow = true;
    this.source.provider.handleItemDidShow?.(this.source.inlineSuggestions, this.sourceInlineCompletion, updatedInsertText);
    if (this.sourceInlineCompletion.shownCommand) {
      await commandService.executeCommand(this.sourceInlineCompletion.shownCommand.id, ...this.sourceInlineCompletion.shownCommand.arguments || []);
    }
  }
  reportPartialAccept(acceptedCharacters, info) {
    this.source.provider.handlePartialAccept?.(this.source.inlineSuggestions, this.sourceInlineCompletion, acceptedCharacters, info);
  }
  /**
   * Sends the end of life event to the provider.
   * If no reason is provided, the last set reason is used.
   * If no reason was set, the default reason is used.
  */
  reportEndOfLife(reason) {
    if (this._didReportEndOfLife) {
      return;
    }
    this._didReportEndOfLife = true;
    if (!reason) {
      reason = this._lastSetEndOfLifeReason ?? { kind: InlineCompletionEndOfLifeReasonKind.Ignored, userTypingDisagreed: false, supersededBy: void 0 };
    }
    if (reason.kind === InlineCompletionEndOfLifeReasonKind.Rejected && this.source.provider.handleRejection) {
      this.source.provider.handleRejection(this.source.inlineSuggestions, this.sourceInlineCompletion);
    }
    if (this.source.provider.handleEndOfLifetime) {
      this.source.provider.handleEndOfLifetime(this.source.inlineSuggestions, this.sourceInlineCompletion, reason);
    }
  }
  /**
   * Sets the end of life reason, but does not send the event to the provider yet.
  */
  setEndOfLifeReason(reason) {
    this._lastSetEndOfLifeReason = reason;
  }
}
class InlineSuggestionList {
  static {
    __name(this, "InlineSuggestionList");
  }
  constructor(inlineSuggestions, inlineSuggestionsData, provider) {
    this.inlineSuggestions = inlineSuggestions;
    this.inlineSuggestionsData = inlineSuggestionsData;
    this.provider = provider;
    this.refCount = 1;
  }
  addRef() {
    this.refCount++;
  }
  removeRef() {
    this.refCount--;
    if (this.refCount === 0) {
      for (const item of this.inlineSuggestionsData) {
        item.reportEndOfLife();
      }
      this.provider.freeInlineCompletions(this.inlineSuggestions);
    }
  }
}
function getDefaultRange(position, model) {
  const word = model.getWordAtPosition(position);
  const maxColumn = model.getLineMaxColumn(position.lineNumber);
  return word ? new Range(position.lineNumber, word.startColumn, position.lineNumber, maxColumn) : Range.fromPositions(position, position.with(void 0, maxColumn));
}
__name(getDefaultRange, "getDefaultRange");
function closeBrackets(text, position, model, languageConfigurationService) {
  const currentLine = model.getLineContent(position.lineNumber);
  const edit = SingleOffsetEdit.replace(new OffsetRange(position.column - 1, currentLine.length), text);
  const proposedLineTokens = model.tokenization.tokenizeLinesAt(position.lineNumber, [edit.apply(currentLine)]);
  const textTokens = proposedLineTokens?.[0].sliceZeroCopy(edit.getRangeAfterApply());
  if (!textTokens) {
    return text;
  }
  const fixedText = fixBracketsInLine(textTokens, languageConfigurationService);
  return fixedText;
}
__name(closeBrackets, "closeBrackets");
export {
  InlineCompletionProviderResult,
  InlineSuggestData,
  InlineSuggestionList,
  provideInlineCompletions
};
//# sourceMappingURL=provideInlineCompletions.js.map
