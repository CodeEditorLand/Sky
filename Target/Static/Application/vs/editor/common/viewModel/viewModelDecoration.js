var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ViewModelDecoration {
  static {
    __name(this, "ViewModelDecoration");
  }
  constructor(range, options) {
    this._viewModelDecorationBrand = void 0;
    this.range = range;
    this.options = options;
  }
}
function isModelDecorationVisible(model, decoration) {
  if (decoration.options.hideInCommentTokens && isModelDecorationInComment(model, decoration)) {
    return false;
  }
  if (decoration.options.hideInStringTokens && isModelDecorationInString(model, decoration)) {
    return false;
  }
  return true;
}
__name(isModelDecorationVisible, "isModelDecorationVisible");
function isModelDecorationInComment(model, decoration) {
  return testTokensInRange(
    model,
    decoration.range,
    (tokenType) => tokenType === 1
    /* StandardTokenType.Comment */
  );
}
__name(isModelDecorationInComment, "isModelDecorationInComment");
function isModelDecorationInString(model, decoration) {
  return testTokensInRange(
    model,
    decoration.range,
    (tokenType) => tokenType === 2
    /* StandardTokenType.String */
  );
}
__name(isModelDecorationInString, "isModelDecorationInString");
function testTokensInRange(model, range, callback) {
  for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
    const lineTokens = model.tokenization.getLineTokens(lineNumber);
    const isFirstLine = lineNumber === range.startLineNumber;
    const isEndLine = lineNumber === range.endLineNumber;
    let tokenIdx = isFirstLine ? lineTokens.findTokenIndexAtOffset(range.startColumn - 1) : 0;
    while (tokenIdx < lineTokens.getCount()) {
      if (isEndLine) {
        const startOffset = lineTokens.getStartOffset(tokenIdx);
        if (startOffset > range.endColumn - 1) {
          break;
        }
      }
      const callbackResult = callback(lineTokens.getStandardTokenType(tokenIdx));
      if (!callbackResult) {
        return false;
      }
      tokenIdx++;
    }
  }
  return true;
}
__name(testTokensInRange, "testTokensInRange");
export {
  ViewModelDecoration,
  isModelDecorationInComment,
  isModelDecorationInString,
  isModelDecorationVisible
};
//# sourceMappingURL=viewModelDecoration.js.map
