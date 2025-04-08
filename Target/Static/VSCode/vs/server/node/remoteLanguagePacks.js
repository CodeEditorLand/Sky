var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FileAccess } from "../../base/common/network.js";
import { join } from "../../base/common/path.js";
import { resolveNLSConfiguration } from "../../base/node/nls.js";
import { Promises } from "../../base/node/pfs.js";
import product from "../../platform/product/common/product.js";
const nlsMetadataPath = join(FileAccess.asFileUri("").fsPath);
const defaultMessagesFile = join(nlsMetadataPath, "nls.messages.json");
const nlsConfigurationCache = /* @__PURE__ */ new Map();
async function getNLSConfiguration(language, userDataPath) {
  if (!product.commit || !await Promises.exists(defaultMessagesFile)) {
    return {
      userLocale: "en",
      osLocale: "en",
      resolvedLanguage: "en",
      defaultMessagesFile,
      // NLS: below 2 are a relic from old times only used by vscode-nls and deprecated
      locale: "en",
      availableLanguages: {}
    };
  }
  const cacheKey = `${language}||${userDataPath}`;
  let result = nlsConfigurationCache.get(cacheKey);
  if (!result) {
    result = resolveNLSConfiguration({ userLocale: language, osLocale: language, commit: product.commit, userDataPath, nlsMetadataPath });
    nlsConfigurationCache.set(cacheKey, result);
  }
  return result;
}
__name(getNLSConfiguration, "getNLSConfiguration");
export {
  getNLSConfiguration
};
//# sourceMappingURL=remoteLanguagePacks.js.map
