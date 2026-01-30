var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Token, TokenizationResult, EncodedTokenizationResult } from "../languages.js";
const NullState = new class {
  clone() {
    return this;
  }
  equals(other) {
    return this === other;
  }
}();
function nullTokenize(languageId, state) {
  return new TokenizationResult([new Token(0, "", languageId)], state);
}
__name(nullTokenize, "nullTokenize");
function nullTokenizeEncoded(languageId, state) {
  const tokens = new Uint32Array(2);
  tokens[0] = 0;
  tokens[1] = (languageId << 0 | 0 << 8 | 0 << 11 | 1 << 15 | 2 << 24) >>> 0;
  return new EncodedTokenizationResult(tokens, [], state === null ? NullState : state);
}
__name(nullTokenizeEncoded, "nullTokenizeEncoded");
export {
  NullState,
  nullTokenize,
  nullTokenizeEncoded
};
//# sourceMappingURL=nullTokenize.js.map
