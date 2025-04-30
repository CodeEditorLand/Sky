var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { LRUCache } from "./map.js";
const nfcCache = new LRUCache(1e4);
function normalizeNFC(str) {
  return normalize(str, "NFC", nfcCache);
}
__name(normalizeNFC, "normalizeNFC");
const nfdCache = new LRUCache(1e4);
function normalizeNFD(str) {
  return normalize(str, "NFD", nfdCache);
}
__name(normalizeNFD, "normalizeNFD");
const nonAsciiCharactersPattern = /[^\u0000-\u0080]/;
function normalize(str, form, normalizedCache) {
  if (!str) {
    return str;
  }
  const cached = normalizedCache.get(str);
  if (cached) {
    return cached;
  }
  let res;
  if (nonAsciiCharactersPattern.test(str)) {
    res = str.normalize(form);
  } else {
    res = str;
  }
  normalizedCache.set(str, res);
  return res;
}
__name(normalize, "normalize");
const removeAccents = /* @__PURE__ */ function() {
  const regex = /[\u0300-\u036f]/g;
  return function(str) {
    return normalizeNFD(str).replace(regex, "");
  };
}();
export {
  normalizeNFC,
  normalizeNFD,
  removeAccents
};
//# sourceMappingURL=normalization.js.map
