var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
var BrowserViewUri;
(function(BrowserViewUri2) {
  BrowserViewUri2.scheme = Schemas.vscodeBrowser;
  function forUrl(url, id) {
    const viewId = id ?? generateUuid();
    return URI.from({
      scheme: BrowserViewUri2.scheme,
      path: `/${viewId}`,
      query: url ? `url=${encodeURIComponent(url)}` : void 0
    });
  }
  __name(forUrl, "forUrl");
  BrowserViewUri2.forUrl = forUrl;
  function parse(resource) {
    if (resource.scheme !== BrowserViewUri2.scheme) {
      return void 0;
    }
    const id = resource.path.startsWith("/") ? resource.path.substring(1) : resource.path;
    if (!id) {
      return void 0;
    }
    const url = resource.query ? new URLSearchParams(resource.query).get("url") ?? "" : "";
    return { id, url };
  }
  __name(parse, "parse");
  BrowserViewUri2.parse = parse;
  function getId(resource) {
    return parse(resource)?.id;
  }
  __name(getId, "getId");
  BrowserViewUri2.getId = getId;
  function getUrl(resource) {
    return parse(resource)?.url;
  }
  __name(getUrl, "getUrl");
  BrowserViewUri2.getUrl = getUrl;
})(BrowserViewUri || (BrowserViewUri = {}));
export {
  BrowserViewUri
};
//# sourceMappingURL=browserViewUri.js.map
