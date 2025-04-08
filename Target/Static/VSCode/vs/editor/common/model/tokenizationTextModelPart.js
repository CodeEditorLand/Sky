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
import { CharCode } from "../../../base/common/charCode.js";
import { BugIndicatingError, onUnexpectedError } from "../../../base/common/errors.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { DisposableMap, DisposableStore, MutableDisposable } from "../../../base/common/lifecycle.js";
import { countEOL } from "../core/eolCounter.js";
import { LineRange } from "../core/lineRange.js";
import { IPosition, Position } from "../core/position.js";
import { Range } from "../core/range.js";
import { IWordAtPosition, getWordAtText } from "../core/wordHelper.js";
import { StandardTokenType } from "../encodedTokenAttributes.js";
import { IBackgroundTokenizationStore, IBackgroundTokenizer, ILanguageIdCodec, IState, ITokenizationSupport, TokenizationRegistry, TreeSitterTokenizationRegistry } from "../languages.js";
import { ILanguageService } from "../languages/language.js";
import { ILanguageConfigurationService, LanguageConfigurationServiceChangeEvent, ResolvedLanguageConfiguration } from "../languages/languageConfigurationRegistry.js";
import { IAttachedView } from "../model.js";
import { BracketPairsTextModelPart } from "./bracketPairsTextModelPart/bracketPairsImpl.js";
import { TextModel } from "./textModel.js";
import { TextModelPart } from "./textModelPart.js";
import { DefaultBackgroundTokenizer, TokenizerWithStateStoreAndTextModel, TrackingTokenizationStateStore } from "./textModelTokens.js";
import { AbstractTokens, AttachedViewHandler, AttachedViews } from "./tokens.js";
import { TreeSitterTokens } from "./treeSitterTokens.js";
import { IModelContentChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelTokensChangedEvent } from "../textModelEvents.js";
import { BackgroundTokenizationState, ITokenizationTextModelPart } from "../tokenizationTextModelPart.js";
import { ContiguousMultilineTokens } from "../tokens/contiguousMultilineTokens.js";
import { ContiguousMultilineTokensBuilder } from "../tokens/contiguousMultilineTokensBuilder.js";
import { ContiguousTokensStore } from "../tokens/contiguousTokensStore.js";
import { LineTokens } from "../tokens/lineTokens.js";
import { SparseMultilineTokens } from "../tokens/sparseMultilineTokens.js";
import { SparseTokensStore } from "../tokens/sparseTokensStore.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
let TokenizationTextModelPart = class extends TextModelPart {
  constructor(_textModel, _bracketPairsTextModelPart, _languageId, _attachedViews, _languageService, _languageConfigurationService, _instantiationService) {
    super();
    this._textModel = _textModel;
    this._bracketPairsTextModelPart = _bracketPairsTextModelPart;
    this._languageId = _languageId;
    this._attachedViews = _attachedViews;
    this._languageService = _languageService;
    this._languageConfigurationService = _languageConfigurationService;
    this._instantiationService = _instantiationService;
    this._register(Event.filter(TreeSitterTokenizationRegistry.onDidChange, (e) => e.changedLanguages.includes(this._languageId))(() => {
      this.createPreferredTokenProvider();
    }));
    this.createPreferredTokenProvider();
  }
  static {
    __name(this, "TokenizationTextModelPart");
  }
  _semanticTokens = new SparseTokensStore(this._languageService.languageIdCodec);
  _onDidChangeLanguage = this._register(new Emitter());
  onDidChangeLanguage = this._onDidChangeLanguage.event;
  _onDidChangeLanguageConfiguration = this._register(new Emitter());
  onDidChangeLanguageConfiguration = this._onDidChangeLanguageConfiguration.event;
  _onDidChangeTokens = this._register(new Emitter());
  onDidChangeTokens = this._onDidChangeTokens.event;
  _tokens;
  _tokensDisposables = this._register(new DisposableStore());
  createGrammarTokens() {
    return this._register(new GrammarTokens(this._languageService.languageIdCodec, this._textModel, () => this._languageId, this._attachedViews));
  }
  createTreeSitterTokens() {
    return this._register(this._instantiationService.createInstance(TreeSitterTokens, this._languageService.languageIdCodec, this._textModel, () => this._languageId));
  }
  createTokens(useTreeSitter) {
    const needsReset = this._tokens !== void 0;
    this._tokens?.dispose();
    this._tokens = useTreeSitter ? this.createTreeSitterTokens() : this.createGrammarTokens();
    this._tokensDisposables.clear();
    this._tokensDisposables.add(this._tokens.onDidChangeTokens((e) => {
      this._emitModelTokensChangedEvent(e);
    }));
    this._tokensDisposables.add(this._tokens.onDidChangeBackgroundTokenizationState((e) => {
      this._bracketPairsTextModelPart.handleDidChangeBackgroundTokenizationState();
    }));
    if (needsReset) {
      this._tokens.resetTokenization();
    }
  }
  createPreferredTokenProvider() {
    if (TreeSitterTokenizationRegistry.get(this._languageId)) {
      if (!(this._tokens instanceof TreeSitterTokens)) {
        this.createTokens(true);
      }
    } else {
      if (!(this._tokens instanceof GrammarTokens)) {
        this.createTokens(false);
      }
    }
  }
  _hasListeners() {
    return this._onDidChangeLanguage.hasListeners() || this._onDidChangeLanguageConfiguration.hasListeners() || this._onDidChangeTokens.hasListeners();
  }
  handleLanguageConfigurationServiceChange(e) {
    if (e.affects(this._languageId)) {
      this._onDidChangeLanguageConfiguration.fire({});
    }
  }
  handleDidChangeContent(e) {
    if (e.isFlush) {
      this._semanticTokens.flush();
    } else if (!e.isEolChange) {
      for (const c of e.changes) {
        const [eolCount, firstLineLength, lastLineLength] = countEOL(c.text);
        this._semanticTokens.acceptEdit(
          c.range,
          eolCount,
          firstLineLength,
          lastLineLength,
          c.text.length > 0 ? c.text.charCodeAt(0) : CharCode.Null
        );
      }
    }
    this._tokens.handleDidChangeContent(e);
  }
  handleDidChangeAttached() {
    this._tokens.handleDidChangeAttached();
  }
  /**
   * Includes grammar and semantic tokens.
   */
  getLineTokens(lineNumber) {
    this.validateLineNumber(lineNumber);
    const syntacticTokens = this._tokens.getLineTokens(lineNumber);
    return this._semanticTokens.addSparseTokens(lineNumber, syntacticTokens);
  }
  _emitModelTokensChangedEvent(e) {
    if (!this._textModel._isDisposing()) {
      this._bracketPairsTextModelPart.handleDidChangeTokens(e);
      this._onDidChangeTokens.fire(e);
    }
  }
  // #region Grammar Tokens
  validateLineNumber(lineNumber) {
    if (lineNumber < 1 || lineNumber > this._textModel.getLineCount()) {
      throw new BugIndicatingError("Illegal value for lineNumber");
    }
  }
  get hasTokens() {
    return this._tokens.hasTokens;
  }
  resetTokenization() {
    this._tokens.resetTokenization();
  }
  get backgroundTokenizationState() {
    return this._tokens.backgroundTokenizationState;
  }
  forceTokenization(lineNumber) {
    this.validateLineNumber(lineNumber);
    this._tokens.forceTokenization(lineNumber);
  }
  hasAccurateTokensForLine(lineNumber) {
    this.validateLineNumber(lineNumber);
    return this._tokens.hasAccurateTokensForLine(lineNumber);
  }
  isCheapToTokenize(lineNumber) {
    this.validateLineNumber(lineNumber);
    return this._tokens.isCheapToTokenize(lineNumber);
  }
  tokenizeIfCheap(lineNumber) {
    this.validateLineNumber(lineNumber);
    this._tokens.tokenizeIfCheap(lineNumber);
  }
  getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
    return this._tokens.getTokenTypeIfInsertingCharacter(lineNumber, column, character);
  }
  tokenizeLinesAt(lineNumber, lines) {
    return this._tokens.tokenizeLinesAt(lineNumber, lines);
  }
  // #endregion
  // #region Semantic Tokens
  setSemanticTokens(tokens, isComplete) {
    this._semanticTokens.set(tokens, isComplete);
    this._emitModelTokensChangedEvent({
      semanticTokensApplied: tokens !== null,
      ranges: [{ fromLineNumber: 1, toLineNumber: this._textModel.getLineCount() }]
    });
  }
  hasCompleteSemanticTokens() {
    return this._semanticTokens.isComplete();
  }
  hasSomeSemanticTokens() {
    return !this._semanticTokens.isEmpty();
  }
  setPartialSemanticTokens(range, tokens) {
    if (this.hasCompleteSemanticTokens()) {
      return;
    }
    const changedRange = this._textModel.validateRange(
      this._semanticTokens.setPartial(range, tokens)
    );
    this._emitModelTokensChangedEvent({
      semanticTokensApplied: true,
      ranges: [
        {
          fromLineNumber: changedRange.startLineNumber,
          toLineNumber: changedRange.endLineNumber
        }
      ]
    });
  }
  // #endregion
  // #region Utility Methods
  getWordAtPosition(_position) {
    this.assertNotDisposed();
    const position = this._textModel.validatePosition(_position);
    const lineContent = this._textModel.getLineContent(position.lineNumber);
    const lineTokens = this.getLineTokens(position.lineNumber);
    const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
    const [rbStartOffset, rbEndOffset] = TokenizationTextModelPart._findLanguageBoundaries(lineTokens, tokenIndex);
    const rightBiasedWord = getWordAtText(
      position.column,
      this.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex)).getWordDefinition(),
      lineContent.substring(rbStartOffset, rbEndOffset),
      rbStartOffset
    );
    if (rightBiasedWord && rightBiasedWord.startColumn <= _position.column && _position.column <= rightBiasedWord.endColumn) {
      return rightBiasedWord;
    }
    if (tokenIndex > 0 && rbStartOffset === position.column - 1) {
      const [lbStartOffset, lbEndOffset] = TokenizationTextModelPart._findLanguageBoundaries(
        lineTokens,
        tokenIndex - 1
      );
      const leftBiasedWord = getWordAtText(
        position.column,
        this.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex - 1)).getWordDefinition(),
        lineContent.substring(lbStartOffset, lbEndOffset),
        lbStartOffset
      );
      if (leftBiasedWord && leftBiasedWord.startColumn <= _position.column && _position.column <= leftBiasedWord.endColumn) {
        return leftBiasedWord;
      }
    }
    return null;
  }
  getLanguageConfiguration(languageId) {
    return this._languageConfigurationService.getLanguageConfiguration(languageId);
  }
  static _findLanguageBoundaries(lineTokens, tokenIndex) {
    const languageId = lineTokens.getLanguageId(tokenIndex);
    let startOffset = 0;
    for (let i = tokenIndex; i >= 0 && lineTokens.getLanguageId(i) === languageId; i--) {
      startOffset = lineTokens.getStartOffset(i);
    }
    let endOffset = lineTokens.getLineContent().length;
    for (let i = tokenIndex, tokenCount = lineTokens.getCount(); i < tokenCount && lineTokens.getLanguageId(i) === languageId; i++) {
      endOffset = lineTokens.getEndOffset(i);
    }
    return [startOffset, endOffset];
  }
  getWordUntilPosition(position) {
    const wordAtPosition = this.getWordAtPosition(position);
    if (!wordAtPosition) {
      return { word: "", startColumn: position.column, endColumn: position.column };
    }
    return {
      word: wordAtPosition.word.substr(0, position.column - wordAtPosition.startColumn),
      startColumn: wordAtPosition.startColumn,
      endColumn: position.column
    };
  }
  // #endregion
  // #region Language Id handling
  getLanguageId() {
    return this._languageId;
  }
  getLanguageIdAtPosition(lineNumber, column) {
    const position = this._textModel.validatePosition(new Position(lineNumber, column));
    const lineTokens = this.getLineTokens(position.lineNumber);
    return lineTokens.getLanguageId(lineTokens.findTokenIndexAtOffset(position.column - 1));
  }
  setLanguageId(languageId, source = "api") {
    if (this._languageId === languageId) {
      return;
    }
    const e = {
      oldLanguage: this._languageId,
      newLanguage: languageId,
      source
    };
    this._languageId = languageId;
    this._bracketPairsTextModelPart.handleDidChangeLanguage(e);
    this._tokens.resetTokenization();
    this.createPreferredTokenProvider();
    this._onDidChangeLanguage.fire(e);
    this._onDidChangeLanguageConfiguration.fire({});
  }
  // #endregion
};
TokenizationTextModelPart = __decorateClass([
  __decorateParam(4, ILanguageService),
  __decorateParam(5, ILanguageConfigurationService),
  __decorateParam(6, IInstantiationService)
], TokenizationTextModelPart);
class GrammarTokens extends AbstractTokens {
  static {
    __name(this, "GrammarTokens");
  }
  _tokenizer = null;
  _backgroundTokenizationState = BackgroundTokenizationState.InProgress;
  _onDidChangeBackgroundTokenizationState = this._register(new Emitter());
  onDidChangeBackgroundTokenizationState = this._onDidChangeBackgroundTokenizationState.event;
  _defaultBackgroundTokenizer = null;
  _backgroundTokenizer = this._register(new MutableDisposable());
  _tokens = new ContiguousTokensStore(this._languageIdCodec);
  _debugBackgroundTokens;
  _debugBackgroundStates;
  _debugBackgroundTokenizer = this._register(new MutableDisposable());
  _attachedViewStates = this._register(new DisposableMap());
  constructor(languageIdCodec, textModel, getLanguageId, attachedViews) {
    super(languageIdCodec, textModel, getLanguageId);
    this._register(TokenizationRegistry.onDidChange((e) => {
      const languageId = this.getLanguageId();
      if (e.changedLanguages.indexOf(languageId) === -1) {
        return;
      }
      this.resetTokenization();
    }));
    this.resetTokenization();
    this._register(attachedViews.onDidChangeVisibleRanges(({ view, state }) => {
      if (state) {
        let existing = this._attachedViewStates.get(view);
        if (!existing) {
          existing = new AttachedViewHandler(() => this.refreshRanges(existing.lineRanges));
          this._attachedViewStates.set(view, existing);
        }
        existing.handleStateChange(state);
      } else {
        this._attachedViewStates.deleteAndDispose(view);
      }
    }));
  }
  resetTokenization(fireTokenChangeEvent = true) {
    this._tokens.flush();
    this._debugBackgroundTokens?.flush();
    if (this._debugBackgroundStates) {
      this._debugBackgroundStates = new TrackingTokenizationStateStore(this._textModel.getLineCount());
    }
    if (fireTokenChangeEvent) {
      this._onDidChangeTokens.fire({
        semanticTokensApplied: false,
        ranges: [
          {
            fromLineNumber: 1,
            toLineNumber: this._textModel.getLineCount()
          }
        ]
      });
    }
    const initializeTokenization = /* @__PURE__ */ __name(() => {
      if (this._textModel.isTooLargeForTokenization()) {
        return [null, null];
      }
      const tokenizationSupport2 = TokenizationRegistry.get(this.getLanguageId());
      if (!tokenizationSupport2) {
        return [null, null];
      }
      let initialState2;
      try {
        initialState2 = tokenizationSupport2.getInitialState();
      } catch (e) {
        onUnexpectedError(e);
        return [null, null];
      }
      return [tokenizationSupport2, initialState2];
    }, "initializeTokenization");
    const [tokenizationSupport, initialState] = initializeTokenization();
    if (tokenizationSupport && initialState) {
      this._tokenizer = new TokenizerWithStateStoreAndTextModel(this._textModel.getLineCount(), tokenizationSupport, this._textModel, this._languageIdCodec);
    } else {
      this._tokenizer = null;
    }
    this._backgroundTokenizer.clear();
    this._defaultBackgroundTokenizer = null;
    if (this._tokenizer) {
      const b = {
        setTokens: /* @__PURE__ */ __name((tokens) => {
          this.setTokens(tokens);
        }, "setTokens"),
        backgroundTokenizationFinished: /* @__PURE__ */ __name(() => {
          if (this._backgroundTokenizationState === BackgroundTokenizationState.Completed) {
            return;
          }
          const newState = BackgroundTokenizationState.Completed;
          this._backgroundTokenizationState = newState;
          this._onDidChangeBackgroundTokenizationState.fire();
        }, "backgroundTokenizationFinished"),
        setEndState: /* @__PURE__ */ __name((lineNumber, state) => {
          if (!this._tokenizer) {
            return;
          }
          const firstInvalidEndStateLineNumber = this._tokenizer.store.getFirstInvalidEndStateLineNumber();
          if (firstInvalidEndStateLineNumber !== null && lineNumber >= firstInvalidEndStateLineNumber) {
            this._tokenizer?.store.setEndState(lineNumber, state);
          }
        }, "setEndState")
      };
      if (tokenizationSupport && tokenizationSupport.createBackgroundTokenizer && !tokenizationSupport.backgroundTokenizerShouldOnlyVerifyTokens) {
        this._backgroundTokenizer.value = tokenizationSupport.createBackgroundTokenizer(this._textModel, b);
      }
      if (!this._backgroundTokenizer.value && !this._textModel.isTooLargeForTokenization()) {
        this._backgroundTokenizer.value = this._defaultBackgroundTokenizer = new DefaultBackgroundTokenizer(this._tokenizer, b);
        this._defaultBackgroundTokenizer.handleChanges();
      }
      if (tokenizationSupport?.backgroundTokenizerShouldOnlyVerifyTokens && tokenizationSupport.createBackgroundTokenizer) {
        this._debugBackgroundTokens = new ContiguousTokensStore(this._languageIdCodec);
        this._debugBackgroundStates = new TrackingTokenizationStateStore(this._textModel.getLineCount());
        this._debugBackgroundTokenizer.clear();
        this._debugBackgroundTokenizer.value = tokenizationSupport.createBackgroundTokenizer(this._textModel, {
          setTokens: /* @__PURE__ */ __name((tokens) => {
            this._debugBackgroundTokens?.setMultilineTokens(tokens, this._textModel);
          }, "setTokens"),
          backgroundTokenizationFinished() {
          },
          setEndState: /* @__PURE__ */ __name((lineNumber, state) => {
            this._debugBackgroundStates?.setEndState(lineNumber, state);
          }, "setEndState")
        });
      } else {
        this._debugBackgroundTokens = void 0;
        this._debugBackgroundStates = void 0;
        this._debugBackgroundTokenizer.value = void 0;
      }
    }
    this.refreshAllVisibleLineTokens();
  }
  handleDidChangeAttached() {
    this._defaultBackgroundTokenizer?.handleChanges();
  }
  handleDidChangeContent(e) {
    if (e.isFlush) {
      this.resetTokenization(false);
    } else if (!e.isEolChange) {
      for (const c of e.changes) {
        const [eolCount, firstLineLength] = countEOL(c.text);
        this._tokens.acceptEdit(c.range, eolCount, firstLineLength);
        this._debugBackgroundTokens?.acceptEdit(c.range, eolCount, firstLineLength);
      }
      this._debugBackgroundStates?.acceptChanges(e.changes);
      if (this._tokenizer) {
        this._tokenizer.store.acceptChanges(e.changes);
      }
      this._defaultBackgroundTokenizer?.handleChanges();
    }
  }
  setTokens(tokens) {
    const { changes } = this._tokens.setMultilineTokens(tokens, this._textModel);
    if (changes.length > 0) {
      this._onDidChangeTokens.fire({ semanticTokensApplied: false, ranges: changes });
    }
    return { changes };
  }
  refreshAllVisibleLineTokens() {
    const ranges = LineRange.joinMany([...this._attachedViewStates].map(([_, s]) => s.lineRanges));
    this.refreshRanges(ranges);
  }
  refreshRanges(ranges) {
    for (const range of ranges) {
      this.refreshRange(range.startLineNumber, range.endLineNumberExclusive - 1);
    }
  }
  refreshRange(startLineNumber, endLineNumber) {
    if (!this._tokenizer) {
      return;
    }
    startLineNumber = Math.max(1, Math.min(this._textModel.getLineCount(), startLineNumber));
    endLineNumber = Math.min(this._textModel.getLineCount(), endLineNumber);
    const builder = new ContiguousMultilineTokensBuilder();
    const { heuristicTokens } = this._tokenizer.tokenizeHeuristically(builder, startLineNumber, endLineNumber);
    const changedTokens = this.setTokens(builder.finalize());
    if (heuristicTokens) {
      for (const c of changedTokens.changes) {
        this._backgroundTokenizer.value?.requestTokens(c.fromLineNumber, c.toLineNumber + 1);
      }
    }
    this._defaultBackgroundTokenizer?.checkFinished();
  }
  forceTokenization(lineNumber) {
    const builder = new ContiguousMultilineTokensBuilder();
    this._tokenizer?.updateTokensUntilLine(builder, lineNumber);
    this.setTokens(builder.finalize());
    this._defaultBackgroundTokenizer?.checkFinished();
  }
  hasAccurateTokensForLine(lineNumber) {
    if (!this._tokenizer) {
      return true;
    }
    return this._tokenizer.hasAccurateTokensForLine(lineNumber);
  }
  isCheapToTokenize(lineNumber) {
    if (!this._tokenizer) {
      return true;
    }
    return this._tokenizer.isCheapToTokenize(lineNumber);
  }
  getLineTokens(lineNumber) {
    const lineText = this._textModel.getLineContent(lineNumber);
    const result = this._tokens.getTokens(
      this._textModel.getLanguageId(),
      lineNumber - 1,
      lineText
    );
    if (this._debugBackgroundTokens && this._debugBackgroundStates && this._tokenizer) {
      if (this._debugBackgroundStates.getFirstInvalidEndStateLineNumberOrMax() > lineNumber && this._tokenizer.store.getFirstInvalidEndStateLineNumberOrMax() > lineNumber) {
        const backgroundResult = this._debugBackgroundTokens.getTokens(
          this._textModel.getLanguageId(),
          lineNumber - 1,
          lineText
        );
        if (!result.equals(backgroundResult) && this._debugBackgroundTokenizer.value?.reportMismatchingTokens) {
          this._debugBackgroundTokenizer.value.reportMismatchingTokens(lineNumber);
        }
      }
    }
    return result;
  }
  getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
    if (!this._tokenizer) {
      return StandardTokenType.Other;
    }
    const position = this._textModel.validatePosition(new Position(lineNumber, column));
    this.forceTokenization(position.lineNumber);
    return this._tokenizer.getTokenTypeIfInsertingCharacter(position, character);
  }
  tokenizeLinesAt(lineNumber, lines) {
    if (!this._tokenizer) {
      return null;
    }
    this.forceTokenization(lineNumber);
    return this._tokenizer.tokenizeLinesAt(lineNumber, lines);
  }
  get hasTokens() {
    return this._tokens.hasTokens;
  }
}
export {
  TokenizationTextModelPart
};
//# sourceMappingURL=tokenizationTextModelPart.js.map
