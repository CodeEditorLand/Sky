var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { ExtHostQuickDiffShape, IMainContext, MainContext, MainThreadQuickDiffShape } from "./extHost.protocol.js";
import { asPromise } from "../../../base/common/async.js";
import { DocumentSelector } from "./extHostTypeConverters.js";
import { IURITransformer } from "../../../base/common/uriIpc.js";
class ExtHostQuickDiff {
  constructor(mainContext, uriTransformer) {
    this.uriTransformer = uriTransformer;
    this.proxy = mainContext.getProxy(MainContext.MainThreadQuickDiff);
  }
  static {
    __name(this, "ExtHostQuickDiff");
  }
  static handlePool = 0;
  proxy;
  providers = /* @__PURE__ */ new Map();
  $provideOriginalResource(handle, uriComponents, token) {
    const uri = URI.revive(uriComponents);
    const provider = this.providers.get(handle);
    if (!provider) {
      return Promise.resolve(null);
    }
    return asPromise(() => provider.provideOriginalResource(uri, token)).then((r) => r || null);
  }
  registerQuickDiffProvider(selector, quickDiffProvider, label, rootUri) {
    const handle = ExtHostQuickDiff.handlePool++;
    this.providers.set(handle, quickDiffProvider);
    this.proxy.$registerQuickDiffProvider(handle, DocumentSelector.from(selector, this.uriTransformer), label, rootUri, quickDiffProvider.visible ?? true);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this.proxy.$unregisterQuickDiffProvider(handle);
        this.providers.delete(handle);
      }, "dispose")
    };
  }
}
export {
  ExtHostQuickDiff
};
//# sourceMappingURL=extHostQuickDiff.js.map
