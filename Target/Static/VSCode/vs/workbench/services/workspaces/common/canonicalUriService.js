var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ICanonicalUriService, ICanonicalUriProvider } from "../../../../platform/workspace/common/canonicalUri.js";
class CanonicalUriService {
  static {
    __name(this, "CanonicalUriService");
  }
  _providers = /* @__PURE__ */ new Map();
  registerCanonicalUriProvider(provider) {
    this._providers.set(provider.scheme, provider);
    return {
      dispose: /* @__PURE__ */ __name(() => this._providers.delete(provider.scheme), "dispose")
    };
  }
  async provideCanonicalUri(uri, targetScheme, token) {
    const provider = this._providers.get(uri.scheme);
    if (provider) {
      return provider.provideCanonicalUri(uri, targetScheme, token);
    }
    return void 0;
  }
}
registerSingleton(ICanonicalUriService, CanonicalUriService, InstantiationType.Delayed);
export {
  CanonicalUriService
};
//# sourceMappingURL=canonicalUriService.js.map
