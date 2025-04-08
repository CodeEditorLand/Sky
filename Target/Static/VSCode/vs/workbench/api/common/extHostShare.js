var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtHostShareShape, IMainContext, IShareableItemDto, MainContext, MainThreadShareShape } from "./extHost.protocol.js";
import { DocumentSelector, Range } from "./extHostTypeConverters.js";
import { IURITransformer } from "../../../base/common/uriIpc.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
class ExtHostShare {
  constructor(mainContext, uriTransformer) {
    this.uriTransformer = uriTransformer;
    this.proxy = mainContext.getProxy(MainContext.MainThreadShare);
  }
  static {
    __name(this, "ExtHostShare");
  }
  static handlePool = 0;
  proxy;
  providers = /* @__PURE__ */ new Map();
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
