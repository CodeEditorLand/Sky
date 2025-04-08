var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Token, TokenizationResult, EncodedTokenizationResult, IState } from "../languages.js";
import { LanguageId, FontStyle, ColorId, StandardTokenType, MetadataConsts } from "../encodedTokenAttributes.js";
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
  tokens[1] = (languageId << MetadataConsts.LANGUAGEID_OFFSET | StandardTokenType.Other << MetadataConsts.TOKEN_TYPE_OFFSET | FontStyle.None << MetadataConsts.FONT_STYLE_OFFSET | ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET | ColorId.DefaultBackground << MetadataConsts.BACKGROUND_OFFSET) >>> 0;
  return new EncodedTokenizationResult(tokens, state === null ? NullState : state);
}
__name(nullTokenizeEncoded, "nullTokenizeEncoded");
export {
  NullState,
  nullTokenize,
  nullTokenizeEncoded
};
//# sourceMappingURL=nullTokenize.js.map
