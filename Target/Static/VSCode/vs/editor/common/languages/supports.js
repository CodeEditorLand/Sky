var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IViewLineTokens, LineTokens } from "../tokens/lineTokens.js";
import { StandardTokenType } from "../encodedTokenAttributes.js";
import { ILanguageIdCodec } from "../languages.js";
function createScopedLineTokens(context, offset) {
  const tokenCount = context.getCount();
  const tokenIndex = context.findTokenIndexAtOffset(offset);
  const desiredLanguageId = context.getLanguageId(tokenIndex);
  let lastTokenIndex = tokenIndex;
  while (lastTokenIndex + 1 < tokenCount && context.getLanguageId(lastTokenIndex + 1) === desiredLanguageId) {
    lastTokenIndex++;
  }
  let firstTokenIndex = tokenIndex;
  while (firstTokenIndex > 0 && context.getLanguageId(firstTokenIndex - 1) === desiredLanguageId) {
    firstTokenIndex--;
  }
  return new ScopedLineTokens(
    context,
    desiredLanguageId,
    firstTokenIndex,
    lastTokenIndex + 1,
    context.getStartOffset(firstTokenIndex),
    context.getEndOffset(lastTokenIndex)
  );
}
__name(createScopedLineTokens, "createScopedLineTokens");
class ScopedLineTokens {
  static {
    __name(this, "ScopedLineTokens");
  }
  _scopedLineTokensBrand = void 0;
  languageIdCodec;
  languageId;
  _actual;
  _firstTokenIndex;
  _lastTokenIndex;
  firstCharOffset;
  _lastCharOffset;
  constructor(actual, languageId, firstTokenIndex, lastTokenIndex, firstCharOffset, lastCharOffset) {
    this._actual = actual;
    this.languageId = languageId;
    this._firstTokenIndex = firstTokenIndex;
    this._lastTokenIndex = lastTokenIndex;
    this.firstCharOffset = firstCharOffset;
    this._lastCharOffset = lastCharOffset;
    this.languageIdCodec = actual.languageIdCodec;
  }
  getLineContent() {
    const actualLineContent = this._actual.getLineContent();
    return actualLineContent.substring(this.firstCharOffset, this._lastCharOffset);
  }
  getLineLength() {
    return this._lastCharOffset - this.firstCharOffset;
  }
  getActualLineContentBefore(offset) {
    const actualLineContent = this._actual.getLineContent();
    return actualLineContent.substring(0, this.firstCharOffset + offset);
  }
  getTokenCount() {
    return this._lastTokenIndex - this._firstTokenIndex;
  }
  findTokenIndexAtOffset(offset) {
    return this._actual.findTokenIndexAtOffset(offset + this.firstCharOffset) - this._firstTokenIndex;
  }
  getStandardTokenType(tokenIndex) {
    return this._actual.getStandardTokenType(tokenIndex + this._firstTokenIndex);
  }
  toIViewLineTokens() {
    return this._actual.sliceAndInflate(this.firstCharOffset, this._lastCharOffset, 0);
  }
}
var IgnoreBracketsInTokens = ((IgnoreBracketsInTokens2) => {
  IgnoreBracketsInTokens2[IgnoreBracketsInTokens2["value"] = StandardTokenType.Comment | StandardTokenType.String | StandardTokenType.RegEx] = "value";
  return IgnoreBracketsInTokens2;
})(IgnoreBracketsInTokens || {});
function ignoreBracketsInToken(standardTokenType) {
  return (standardTokenType & IgnoreBracketsInTokens.value) !== 0;
}
__name(ignoreBracketsInToken, "ignoreBracketsInToken");
export {
  ScopedLineTokens,
  createScopedLineTokens,
  ignoreBracketsInToken
};
//# sourceMappingURL=supports.js.map
