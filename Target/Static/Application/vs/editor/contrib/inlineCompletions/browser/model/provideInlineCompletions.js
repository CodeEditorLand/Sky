var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../../base/common/assert.js";
import { AsyncIterableObject } from "../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../../base/common/errors.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import { StringReplacement } from "../../../../common/core/edits/stringEdit.js";
import { OffsetRange } from "../../../../common/core/ranges/offsetRange.js";
import { Range } from "../../../../common/core/range.js";
import { TextReplacement } from "../../../../common/core/edits/textEdit.js";
import { InlineCompletionEndOfLifeReasonKind } from "../../../../common/languages.js";
import { fixBracketsInLine } from "../../../../common/model/bracketPairsTextModelPart/fixBrackets.js";
import { SnippetParser, Text } from "../../../snippet/browser/snippetParser.js";
import { getReadonlyEmptyArray } from "../utils.js";
import { groupByMap } from "../../../../../base/common/collections.js";
import { DirectedGraph } from "./graph.js";
import { CachedFunction } from "../../../../../base/common/cache.js";
import { InlineCompletionViewKind } from "../view/inlineEdits/inlineEditsViewInterface.js";
import { isDefined } from "../../../../../base/common/types.js";
function provideInlineCompletions(providers, position, model, context, editorType, languageConfigurationService) {
  const requestUuid = generateUuid();
  const cancellationTokenSource = new CancellationTokenSource();
  let cancelReason = void 0;
  const contextWithUuid = { ...context, requestUuid };
  const defaultReplaceRange = getDefaultRange(position, model);
  const providersByGroupId = groupByMap(providers, (p) => p.groupId);
  const yieldsToGraph = DirectedGraph.from(providers, (p) => {
    return p.yieldsToGroupIds?.flatMap((groupId) => providersByGroupId.get(groupId) ?? []) ?? [];
  });
  const { foundCycles } = yieldsToGraph.removeCycles();
  if (foundCycles.length > 0) {
    onUnexpectedExternalError(new Error(`Inline completions: cyclic yield-to dependency detected. Path: ${foundCycles.map((s) => s.toString ? s.toString() : "" + s).join(" -> ")}`));
  }
  let runningCount = 0;
  const queryProvider = new CachedFunction(async (provider) => {
    try {
      runningCount++;
      if (cancellationTokenSource.token.isCancellationRequested) {
        return void 0;
      }
      const yieldsTo = yieldsToGraph.getOutgoing(provider);
      for (const p of yieldsTo) {
        const result2 = await queryProvider.get(p);
        if (result2 && result2.inlineSuggestions.items.length > 0) {
          return void 0;
        }
      }
      let result;
      try {
        result = await provider.provideInlineCompletions(model, position, contextWithUuid, cancellationTokenSource.token);
      } catch (e) {
        onUnexpectedExternalError(e);
        return void 0;
      }
      if (!result) {
        return void 0;
      }
      const data = [];
      const list = new InlineSuggestionList(result, data, provider);
      list.addRef();
      runWhenCancelled(cancellationTokenSource.token, () => {
        return list.removeRef(cancelReason);
      });
      for (const item of result.items) {
        data.push(createInlineCompletionItem(item, list, defaultReplaceRange, model, languageConfigurationService, contextWithUuid, editorType));
      }
      return list;
    } finally {
      runningCount--;
    }
  });
  const inlineCompletionLists = AsyncIterableObject.fromPromisesResolveOrder(providers.map((p) => queryProvider.get(p))).filter(isDefined);
  return {
    get didAllProvidersReturn() {
      return runningCount === 0;
    },
    lists: inlineCompletionLists,
    cancelAndDispose: /* @__PURE__ */ __name((reason) => {
      if (cancelReason !== void 0) {
        return;
      }
      cancelReason = reason;
      cancellationTokenSource.dispose(true);
    }, "cancelAndDispose")
  };
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
function createInlineCompletionItem(inlineCompletion, source, defaultReplaceRange, textModel, languageConfigurationService, context, editorType) {
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
  return new InlineSuggestData(range, insertText, snippetInfo, displayLocation, inlineCompletion.additionalTextEdits || getReadonlyEmptyArray(), inlineCompletion, source, context, inlineCompletion.isInlineEdit ?? false, editorType);
}
__name(createInlineCompletionItem, "createInlineCompletionItem");
class InlineSuggestData {
  static {
    __name(this, "InlineSuggestData");
  }
  constructor(range, insertText, snippetInfo, displayLocation, additionalTextEdits, sourceInlineCompletion, source, context, isInlineEdit, editorType) {
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
    this._showStartTime = void 0;
    this._shownDuration = 0;
    this._showUncollapsedStartTime = void 0;
    this._showUncollapsedDuration = 0;
    this._didReportEndOfLife = false;
    this._lastSetEndOfLifeReason = void 0;
    this._viewData = { editorType };
  }
  get showInlineEditMenu() {
    return this.sourceInlineCompletion.showInlineEditMenu ?? false;
  }
  getSingleTextEdit() {
    return new TextReplacement(this.range, this.insertText);
  }
  async reportInlineEditShown(commandService, updatedInsertText, viewKind) {
    this.updateShownDuration(viewKind);
    if (this._didShow) {
      return;
    }
    this._didShow = true;
    this._viewData.viewKind = viewKind;
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
    this.reportInlineEditHidden();
    if (!reason) {
      reason = this._lastSetEndOfLifeReason ?? { kind: InlineCompletionEndOfLifeReasonKind.Ignored, userTypingDisagreed: false, supersededBy: void 0 };
    }
    if (reason.kind === InlineCompletionEndOfLifeReasonKind.Rejected && this.source.provider.handleRejection) {
      this.source.provider.handleRejection(this.source.inlineSuggestions, this.sourceInlineCompletion);
    }
    if (this.source.provider.handleEndOfLifetime) {
      const summary = {
        requestUuid: this.context.requestUuid,
        shown: this._didShow,
        shownDuration: this._shownDuration,
        shownDurationUncollapsed: this._showUncollapsedDuration,
        editorType: this._viewData.editorType,
        viewKind: this._viewData.viewKind,
        error: this._viewData.error
      };
      this.source.provider.handleEndOfLifetime(this.source.inlineSuggestions, this.sourceInlineCompletion, reason, summary);
    }
  }
  reportInlineEditError(message) {
    if (this._viewData.error) {
      this._viewData.error += `; ${message}`;
    } else {
      this._viewData.error = message;
    }
  }
  /**
   * Sets the end of life reason, but does not send the event to the provider yet.
  */
  setEndOfLifeReason(reason) {
    this.reportInlineEditHidden();
    this._lastSetEndOfLifeReason = reason;
  }
  updateShownDuration(viewKind) {
    const timeNow = Date.now();
    if (!this._showStartTime) {
      this._showStartTime = timeNow;
    }
    const isCollapsed = viewKind === InlineCompletionViewKind.Collapsed;
    if (!isCollapsed && this._showUncollapsedStartTime === void 0) {
      this._showUncollapsedStartTime = timeNow;
    }
    if (isCollapsed && this._showUncollapsedStartTime !== void 0) {
      this._showUncollapsedDuration += timeNow - this._showUncollapsedStartTime;
    }
  }
  reportInlineEditHidden() {
    if (this._showStartTime === void 0) {
      return;
    }
    const timeNow = Date.now();
    this._shownDuration += timeNow - this._showStartTime;
    this._showStartTime = void 0;
    if (this._showUncollapsedStartTime === void 0) {
      return;
    }
    this._showUncollapsedDuration += timeNow - this._showUncollapsedStartTime;
    this._showUncollapsedStartTime = void 0;
  }
}
var InlineCompletionEditorType;
(function(InlineCompletionEditorType2) {
  InlineCompletionEditorType2["TextEditor"] = "textEditor";
  InlineCompletionEditorType2["DiffEditor"] = "diffEditor";
})(InlineCompletionEditorType || (InlineCompletionEditorType = {}));
class InlineSuggestionList {
  static {
    __name(this, "InlineSuggestionList");
  }
  constructor(inlineSuggestions, inlineSuggestionsData, provider) {
    this.inlineSuggestions = inlineSuggestions;
    this.inlineSuggestionsData = inlineSuggestionsData;
    this.provider = provider;
    this.refCount = 0;
  }
  addRef() {
    this.refCount++;
  }
  removeRef(reason = { kind: "other" }) {
    this.refCount--;
    if (this.refCount === 0) {
      for (const item of this.inlineSuggestionsData) {
        item.reportEndOfLife();
      }
      this.provider.disposeInlineCompletions(this.inlineSuggestions, reason);
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
  const edit = StringReplacement.replace(new OffsetRange(position.column - 1, currentLine.length), text);
  const proposedLineTokens = model.tokenization.tokenizeLinesAt(position.lineNumber, [edit.replace(currentLine)]);
  const textTokens = proposedLineTokens?.[0].sliceZeroCopy(edit.getRangeAfterReplace());
  if (!textTokens) {
    return text;
  }
  const fixedText = fixBracketsInLine(textTokens, languageConfigurationService);
  return fixedText;
}
__name(closeBrackets, "closeBrackets");
export {
  InlineCompletionEditorType,
  InlineSuggestData,
  InlineSuggestionList,
  provideInlineCompletions,
  runWhenCancelled
};
//# sourceMappingURL=provideInlineCompletions.js.map
