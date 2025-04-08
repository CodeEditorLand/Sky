var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ThemeIcon } from "./themables.js";
import { isString } from "./types.js";
const _codiconFontCharacters = /* @__PURE__ */ Object.create(null);
function register(id, fontCharacter) {
  if (isString(fontCharacter)) {
    const val = _codiconFontCharacters[fontCharacter];
    if (val === void 0) {
      throw new Error(`${id} references an unknown codicon: ${fontCharacter}`);
    }
    fontCharacter = val;
  }
  _codiconFontCharacters[id] = fontCharacter;
  return { id };
}
__name(register, "register");
function getCodiconFontCharacters() {
  return _codiconFontCharacters;
}
__name(getCodiconFontCharacters, "getCodiconFontCharacters");
export {
  getCodiconFontCharacters,
  register
};
//# sourceMappingURL=codiconsUtil.js.map
