var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
const testUrlMatchesGlob = /* @__PURE__ */ __name((uri, globUrl) => {
  let url = uri.with({ query: null, fragment: null }).toString(true);
  const normalize = /* @__PURE__ */ __name((url2) => url2.replace(/\/+$/, ""), "normalize");
  globUrl = normalize(globUrl);
  url = normalize(url);
  const memo = Array.from({ length: url.length + 1 }).map(
    () => Array.from({ length: globUrl.length + 1 }).map(() => void 0)
  );
  if (/^[^./:]*:\/\//.test(globUrl)) {
    return doUrlMatch(memo, url, globUrl, 0, 0);
  }
  const scheme = /^(https?):\/\//.exec(url)?.[1];
  if (scheme) {
    return doUrlMatch(memo, url, `${scheme}://${globUrl}`, 0, 0);
  }
  return false;
}, "testUrlMatchesGlob");
const doUrlMatch = /* @__PURE__ */ __name((memo, url, globUrl, urlOffset, globUrlOffset) => {
  if (memo[urlOffset]?.[globUrlOffset] !== void 0) {
    return memo[urlOffset][globUrlOffset];
  }
  const options = [];
  if (urlOffset === url.length) {
    return globUrlOffset === globUrl.length;
  }
  if (globUrlOffset === globUrl.length) {
    const remaining = url.slice(urlOffset);
    return remaining[0] === "/";
  }
  if (url[urlOffset] === globUrl[globUrlOffset]) {
    options.push(doUrlMatch(memo, url, globUrl, urlOffset + 1, globUrlOffset + 1));
  }
  if (globUrl[globUrlOffset] + globUrl[globUrlOffset + 1] === "*.") {
    if (!["/", ":"].includes(url[urlOffset])) {
      options.push(doUrlMatch(memo, url, globUrl, urlOffset + 1, globUrlOffset));
    }
    options.push(doUrlMatch(memo, url, globUrl, urlOffset, globUrlOffset + 2));
  }
  if (globUrl[globUrlOffset] === "*") {
    if (urlOffset + 1 === url.length) {
      options.push(doUrlMatch(memo, url, globUrl, urlOffset + 1, globUrlOffset + 1));
    } else {
      options.push(doUrlMatch(memo, url, globUrl, urlOffset + 1, globUrlOffset));
    }
    options.push(doUrlMatch(memo, url, globUrl, urlOffset, globUrlOffset + 1));
  }
  if (globUrl[globUrlOffset] + globUrl[globUrlOffset + 1] === ":*") {
    if (url[urlOffset] === ":") {
      let endPortIndex = urlOffset + 1;
      do {
        endPortIndex++;
      } while (/[0-9]/.test(url[endPortIndex]));
      options.push(doUrlMatch(memo, url, globUrl, endPortIndex, globUrlOffset + 2));
    } else {
      options.push(doUrlMatch(memo, url, globUrl, urlOffset, globUrlOffset + 2));
    }
  }
  return memo[urlOffset][globUrlOffset] = options.some((a) => a === true);
}, "doUrlMatch");
export {
  testUrlMatchesGlob
};
//# sourceMappingURL=urlGlob.js.map
