var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const ILanguageModelIgnoredFilesService = createDecorator("languageModelIgnoredFilesService");
class LanguageModelIgnoredFilesService {
  static {
    __name(this, "LanguageModelIgnoredFilesService");
  }
  _serviceBrand;
  _providers = /* @__PURE__ */ new Set();
  async fileIsIgnored(uri, token) {
    const provider = this._providers.values().next().value;
    return provider ? provider.isFileIgnored(uri, token) : false;
  }
  registerIgnoredFileProvider(provider) {
    this._providers.add(provider);
    return toDisposable(() => {
      this._providers.delete(provider);
    });
  }
}
export {
  ILanguageModelIgnoredFilesService,
  LanguageModelIgnoredFilesService
};
//# sourceMappingURL=ignoredFiles.js.map
