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
import { ILanguageIdCodec, ITreeSitterTokenizationSupport, TreeSitterTokenizationRegistry } from "../languages.js";
import { LineTokens } from "../tokens/lineTokens.js";
import { StandardTokenType } from "../encodedTokenAttributes.js";
import { TextModel } from "./textModel.js";
import { IModelContentChangedEvent } from "../textModelEvents.js";
import { AbstractTokens } from "./tokens.js";
import { IDisposable, MutableDisposable } from "../../../base/common/lifecycle.js";
import { ITreeSitterTokenizationStoreService } from "./treeSitterTokenStoreService.js";
import { Range } from "../core/range.js";
import { BackgroundTokenizationState } from "../tokenizationTextModelPart.js";
import { Emitter, Event } from "../../../base/common/event.js";
let TreeSitterTokens = class extends AbstractTokens {
  constructor(languageIdCodec, textModel, languageId, _tokenStore) {
    super(languageIdCodec, textModel, languageId);
    this._tokenStore = _tokenStore;
    this._initialize();
  }
  static {
    __name(this, "TreeSitterTokens");
  }
  _tokenizationSupport = null;
  _backgroundTokenizationState = BackgroundTokenizationState.InProgress;
  _onDidChangeBackgroundTokenizationState = this._register(new Emitter());
  onDidChangeBackgroundTokenizationState = this._onDidChangeBackgroundTokenizationState.event;
  _lastLanguageId;
  _tokensChangedListener = this._register(new MutableDisposable());
  _onDidChangeBackgroundTokenization = this._register(new MutableDisposable());
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
          this._backgroundTokenizationState = BackgroundTokenizationState.Completed;
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
    return StandardTokenType.Other;
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
TreeSitterTokens = __decorateClass([
  __decorateParam(3, ITreeSitterTokenizationStoreService)
], TreeSitterTokens);
export {
  TreeSitterTokens
};
//# sourceMappingURL=treeSitterTokens.js.map
