var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MainContext } from "./extHost.protocol.js";
import { DocumentSelector, Range } from "./extHostTypeConverters.js";
import { URI } from "../../../base/common/uri.js";
class ExtHostShare {
  static {
    __name(this, "ExtHostShare");
  }
  static {
    this.handlePool = 0;
  }
  constructor(mainContext, uriTransformer) {
    this.uriTransformer = uriTransformer;
    this.providers = /* @__PURE__ */ new Map();
    this.proxy = mainContext.getProxy(MainContext.MainThreadShare);
  }
  async $provideShare(handle, shareableItem, token) {
    const provider = this.providers.get(handle);
    const result = await provider?.provideShare({ selection: Range.to(shareableItem.selection), resourceUri: URI.revive(shareableItem.resourceUri) }, token);
    return result ?? void 0;
  }
  registerShareProvider(selector, provider) {
    const handle = ExtHostShare.handlePool++;
    this.providers.set(handle, provider);
    this.proxy.$registerShareProvider(handle, DocumentSelector.from(selector, this.uriTransformer), provider.id, provider.label, provider.priority);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this.proxy.$unregisterShareProvider(handle);
        this.providers.delete(handle);
      }, "dispose")
    };
  }
}
export {
  ExtHostShare
};
//# sourceMappingURL=extHostShare.js.map
