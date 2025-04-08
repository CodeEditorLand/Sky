var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { OffsetRange } from "../core/offsetRange.js";
import { ILanguageIdCodec } from "../languages.js";
import { LineTokens } from "./lineTokens.js";
class TokenArray {
  constructor(_tokenInfo) {
    this._tokenInfo = _tokenInfo;
  }
  static {
    __name(this, "TokenArray");
  }
  static fromLineTokens(lineTokens) {
    const tokenInfo = [];
    for (let i = 0; i < lineTokens.getCount(); i++) {
      tokenInfo.push(new TokenInfo(lineTokens.getEndOffset(i) - lineTokens.getStartOffset(i), lineTokens.getMetadata(i)));
    }
    return TokenArray.create(tokenInfo);
  }
  static create(tokenInfo) {
    return new TokenArray(tokenInfo);
  }
  toLineTokens(lineContent, decoder) {
    return LineTokens.createFromTextAndMetadata(this.map((r, t) => ({ text: r.substring(lineContent), metadata: t.metadata })), decoder);
  }
  forEach(cb) {
    let lengthSum = 0;
    for (const tokenInfo of this._tokenInfo) {
      const range = new OffsetRange(lengthSum, lengthSum + tokenInfo.length);
      cb(range, tokenInfo);
      lengthSum += tokenInfo.length;
    }
  }
  map(cb) {
    const result = [];
    let lengthSum = 0;
    for (const tokenInfo of this._tokenInfo) {
      const range = new OffsetRange(lengthSum, lengthSum + tokenInfo.length);
      result.push(cb(range, tokenInfo));
      lengthSum += tokenInfo.length;
    }
    return result;
  }
  slice(range) {
    const result = [];
    let lengthSum = 0;
    for (const tokenInfo of this._tokenInfo) {
      const tokenStart = lengthSum;
      const tokenEndEx = tokenStart + tokenInfo.length;
      if (tokenEndEx > range.start) {
        if (tokenStart >= range.endExclusive) {
          break;
        }
        const deltaBefore = Math.max(0, range.start - tokenStart);
        const deltaAfter = Math.max(0, tokenEndEx - range.endExclusive);
        result.push(new TokenInfo(tokenInfo.length - deltaBefore - deltaAfter, tokenInfo.metadata));
      }
      lengthSum += tokenInfo.length;
    }
    return TokenArray.create(result);
  }
  append(other) {
    const result = this._tokenInfo.concat(other._tokenInfo);
    return TokenArray.create(result);
  }
}
class TokenInfo {
  constructor(length, metadata) {
    this.length = length;
    this.metadata = metadata;
  }
  static {
    __name(this, "TokenInfo");
  }
}
class TokenArrayBuilder {
  static {
    __name(this, "TokenArrayBuilder");
  }
  _tokens = [];
  add(length, metadata) {
    this._tokens.push(new TokenInfo(length, metadata));
  }
  build() {
    return TokenArray.create(this._tokens);
  }
}
export {
  TokenArray,
  TokenArrayBuilder,
  TokenInfo
};
//# sourceMappingURL=tokenArray.js.map
