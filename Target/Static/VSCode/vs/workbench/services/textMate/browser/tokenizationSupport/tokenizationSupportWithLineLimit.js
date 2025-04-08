var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { LanguageId } from "../../../../../editor/common/encodedTokenAttributes.js";
import { EncodedTokenizationResult, IBackgroundTokenizationStore, IBackgroundTokenizer, IState, ITokenizationSupport, TokenizationResult } from "../../../../../editor/common/languages.js";
import { nullTokenizeEncoded } from "../../../../../editor/common/languages/nullTokenize.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { Disposable, IDisposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, keepObserved } from "../../../../../base/common/observable.js";
class TokenizationSupportWithLineLimit extends Disposable {
  constructor(_encodedLanguageId, _actual, disposable, _maxTokenizationLineLength) {
    super();
    this._encodedLanguageId = _encodedLanguageId;
    this._actual = _actual;
    this._maxTokenizationLineLength = _maxTokenizationLineLength;
    this._register(keepObserved(this._maxTokenizationLineLength));
    this._register(disposable);
  }
  static {
    __name(this, "TokenizationSupportWithLineLimit");
  }
  get backgroundTokenizerShouldOnlyVerifyTokens() {
    return this._actual.backgroundTokenizerShouldOnlyVerifyTokens;
  }
  getInitialState() {
    return this._actual.getInitialState();
  }
  tokenize(line, hasEOL, state) {
    throw new Error("Not supported!");
  }
  tokenizeEncoded(line, hasEOL, state) {
    if (line.length >= this._maxTokenizationLineLength.get()) {
      return nullTokenizeEncoded(this._encodedLanguageId, state);
    }
    return this._actual.tokenizeEncoded(line, hasEOL, state);
  }
  createBackgroundTokenizer(textModel, store) {
    if (this._actual.createBackgroundTokenizer) {
      return this._actual.createBackgroundTokenizer(textModel, store);
    } else {
      return void 0;
    }
  }
}
export {
  TokenizationSupportWithLineLimit
};
//# sourceMappingURL=tokenizationSupportWithLineLimit.js.map
