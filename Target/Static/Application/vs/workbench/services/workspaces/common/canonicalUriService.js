var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ICanonicalUriService } from "../../../../platform/workspace/common/canonicalUri.js";
class CanonicalUriService {
  static {
    __name(this, "CanonicalUriService");
  }
  constructor() {
    this._providers = /* @__PURE__ */ new Map();
  }
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
registerSingleton(
  ICanonicalUriService,
  CanonicalUriService,
  1
  /* InstantiationType.Delayed */
);
export {
  CanonicalUriService
};
//# sourceMappingURL=canonicalUriService.js.map
