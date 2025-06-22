var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { testUrlMatchesGlob } from "./urlGlob.js";
function isURLDomainTrusted(url, trustedDomains) {
  url = URI.parse(normalizeURL(url));
  trustedDomains = trustedDomains.map(normalizeURL);
  if (isLocalhostAuthority(url.authority)) {
    return true;
  }
  for (let i = 0; i < trustedDomains.length; i++) {
    if (trustedDomains[i] === "*") {
      return true;
    }
    if (testUrlMatchesGlob(url, trustedDomains[i])) {
      return true;
    }
  }
  return false;
}
__name(isURLDomainTrusted, "isURLDomainTrusted");
function normalizeURL(url) {
  const caseInsensitiveAuthorities = ["github.com"];
  try {
    const parsed = typeof url === "string" ? URI.parse(url, true) : url;
    if (caseInsensitiveAuthorities.includes(parsed.authority)) {
      return parsed.with({ path: parsed.path.toLowerCase() }).toString(true);
    } else {
      return parsed.toString(true);
    }
  } catch {
    return url.toString();
  }
}
__name(normalizeURL, "normalizeURL");
const rLocalhost = /^localhost(:\d+)?$/i;
const r127 = /^127.0.0.1(:\d+)?$/;
function isLocalhostAuthority(authority) {
  return rLocalhost.test(authority) || r127.test(authority);
}
__name(isLocalhostAuthority, "isLocalhostAuthority");
export {
  isLocalhostAuthority,
  isURLDomainTrusted,
  normalizeURL
};
//# sourceMappingURL=trustedDomains.js.map
