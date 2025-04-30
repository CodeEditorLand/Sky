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
import { TreeSitterTokenizationRegistry } from "../languages.js";
import { LineTokens } from "../tokens/lineTokens.js";
import { AbstractTokens } from "./tokens.js";
import { MutableDisposable } from "../../../base/common/lifecycle.js";
import { ITreeSitterTokenizationStoreService } from "./treeSitterTokenStoreService.js";
import { Range } from "../core/range.js";
import { Emitter } from "../../../base/common/event.js";
let TreeSitterTokens = class TreeSitterTokens2 extends AbstractTokens {
  static {
    __name(this, "TreeSitterTokens");
  }
  constructor(languageIdCodec, textModel, languageId, _tokenStore) {
    super(languageIdCodec, textModel, languageId);
    this._tokenStore = _tokenStore;
    this._tokenizationSupport = null;
    this._backgroundTokenizationState = 1;
    this._onDidChangeBackgroundTokenizationState = this._register(new Emitter());
    this.onDidChangeBackgroundTokenizationState = this._onDidChangeBackgroundTokenizationState.event;
    this._tokensChangedListener = this._register(new MutableDisposable());
    this._onDidChangeBackgroundTokenization = this._register(new MutableDisposable());
    this._initialize();
  }
  _initialize() {
    const newLanguage = this.getLanguageId();
    if (!this._tokenizationSupport || this._lastLanguageId !== newLanguage) {
      this._lastLanguageId = newLanguage;
      this._tokenizationSupport = TreeSitterTokenizationRegistry.get(newLanguage);
      this._tokensChangedListener.value = this._tokenizationSupport?.onDidChangeTokens((e) => {
        if (e.textModel === this._textModel) {
          this._onDidChangeTokens.fire(e.changes);
        }
      });
      this._onDidChangeBackgroundTokenization.value = this._tokenizationSupport?.onDidChangeBackgroundTokenization((e) => {
        if (e.textModel === this._textModel) {
          this._backgroundTokenizationState = 2;
          this._onDidChangeBackgroundTokenizationState.fire();
        }
      });
    }
  }
  getLineTokens(lineNumber) {
    const content = this._textModel.getLineContent(lineNumber);
    if (this._tokenizationSupport && content.length > 0) {
      const rawTokens = this._tokenStore.getTokens(this._textModel, lineNumber);
      if (rawTokens && rawTokens.length > 0) {
        return new LineTokens(rawTokens, content, this._languageIdCodec);
      }
    }
    return LineTokens.createEmpty(content, this._languageIdCodec);
  }
  resetTokenization(fireTokenChangeEvent = true) {
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
    this._initialize();
  }
  handleDidChangeAttached() {
  }
  handleDidChangeContent(e) {
    if (e.isFlush) {
      this.resetTokenization(false);
    } else {
      this._tokenStore.handleContentChanged(this._textModel, e);
    }
  }
  forceTokenization(lineNumber) {
    if (this._tokenizationSupport && !this.hasAccurateTokensForLine(lineNumber)) {
      this._tokenizationSupport.tokenizeEncoded(lineNumber, this._textModel);
    }
  }
  hasAccurateTokensForLine(lineNumber) {
    return this._tokenStore.hasTokens(this._textModel, new Range(lineNumber, 1, lineNumber, this._textModel.getLineMaxColumn(lineNumber)));
  }
  isCheapToTokenize(lineNumber) {
    return true;
  }
  getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
    return 0;
  }
  tokenizeLinesAt(lineNumber, lines) {
    if (this._tokenizationSupport) {
      const rawLineTokens = this._tokenizationSupport.guessTokensForLinesContent(lineNumber, this._textModel, lines);
      const lineTokens = [];
      if (rawLineTokens) {
        for (let i = 0; i < rawLineTokens.length; i++) {
          lineTokens.push(new LineTokens(rawLineTokens[i], lines[i], this._languageIdCodec));
        }
        return lineTokens;
      }
    }
    return null;
  }
  get hasTokens() {
    return this._tokenStore.hasTokens(this._textModel);
  }
};
TreeSitterTokens = __decorate([
  __param(3, ITreeSitterTokenizationStoreService)
], TreeSitterTokens);
export {
  TreeSitterTokens
};
//# sourceMappingURL=treeSitterTokens.js.map
