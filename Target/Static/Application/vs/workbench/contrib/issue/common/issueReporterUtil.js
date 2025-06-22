var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { rtrim } from "../../../../base/common/strings.js";
function normalizeGitHubUrl(url) {
  if (url.endsWith(".git")) {
    url = url.substr(0, url.length - 4);
  }
  url = rtrim(url, "/");
  if (url.endsWith("/new")) {
    url = rtrim(url, "/new");
  }
  if (url.endsWith("/issues")) {
    url = rtrim(url, "/issues");
  }
  return url;
}
__name(normalizeGitHubUrl, "normalizeGitHubUrl");
export {
  normalizeGitHubUrl
};
//# sourceMappingURL=issueReporterUtil.js.map
