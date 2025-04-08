var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { StopWatch } from "../../../../../base/common/stopwatch.js";
import { LanguageId, TokenMetadata } from "../../../../../editor/common/encodedTokenAttributes.js";
import { EncodedTokenizationResult, IBackgroundTokenizationStore, IBackgroundTokenizer, IState, ITokenizationSupport, TokenizationResult } from "../../../../../editor/common/languages.js";
import { ITextModel } from "../../../../../editor/common/model.js";
class TextMateTokenizationSupport extends Disposable {
  constructor(_grammar, _initialState, _containsEmbeddedLanguages, _createBackgroundTokenizer, _backgroundTokenizerShouldOnlyVerifyTokens, _reportTokenizationTime, _reportSlowTokenization) {
    super();
    this._grammar = _grammar;
    this._initialState = _initialState;
    this._containsEmbeddedLanguages = _containsEmbeddedLanguages;
    this._createBackgroundTokenizer = _createBackgroundTokenizer;
    this._backgroundTokenizerShouldOnlyVerifyTokens = _backgroundTokenizerShouldOnlyVerifyTokens;
    this._reportTokenizationTime = _reportTokenizationTime;
    this._reportSlowTokenization = _reportSlowTokenization;
  }
  static {
    __name(this, "TextMateTokenizationSupport");
  }
  _seenLanguages = [];
  _onDidEncounterLanguage = this._register(new Emitter());
  onDidEncounterLanguage = this._onDidEncounterLanguage.event;
  get backgroundTokenizerShouldOnlyVerifyTokens() {
    return this._backgroundTokenizerShouldOnlyVerifyTokens();
  }
  getInitialState() {
    return this._initialState;
  }
  tokenize(line, hasEOL, state) {
    throw new Error("Not supported!");
  }
  createBackgroundTokenizer(textModel, store) {
    if (this._createBackgroundTokenizer) {
      return this._createBackgroundTokenizer(textModel, store);
    }
    return void 0;
  }
  tokenizeEncoded(line, hasEOL, state) {
    const isRandomSample = Math.random() * 1e4 < 1;
    const shouldMeasure = this._reportSlowTokenization || isRandomSample;
    const sw = shouldMeasure ? new StopWatch(true) : void 0;
    const textMateResult = this._grammar.tokenizeLine2(line, state, 500);
    if (shouldMeasure) {
      const timeMS = sw.elapsed();
      if (isRandomSample || timeMS > 32) {
        this._reportTokenizationTime(timeMS, line.length, isRandomSample);
      }
    }
    if (textMateResult.stoppedEarly) {
      console.warn(`Time limit reached when tokenizing line: ${line.substring(0, 100)}`);
      return new EncodedTokenizationResult(textMateResult.tokens, state);
    }
    if (this._containsEmbeddedLanguages) {
      const seenLanguages = this._seenLanguages;
      const tokens = textMateResult.tokens;
      for (let i = 0, len = tokens.length >>> 1; i < len; i++) {
        const metadata = tokens[(i << 1) + 1];
        const languageId = TokenMetadata.getLanguageId(metadata);
        if (!seenLanguages[languageId]) {
          seenLanguages[languageId] = true;
          this._onDidEncounterLanguage.fire(languageId);
        }
      }
    }
    let endState;
    if (state.equals(textMateResult.ruleStack)) {
      endState = state;
    } else {
      endState = textMateResult.ruleStack;
    }
    return new EncodedTokenizationResult(textMateResult.tokens, endState);
  }
}
export {
  TextMateTokenizationSupport
};
//# sourceMappingURL=textMateTokenizationSupport.js.map
