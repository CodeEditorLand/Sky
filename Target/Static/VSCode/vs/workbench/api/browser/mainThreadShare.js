var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IDisposable, dispose } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ExtHostContext, ExtHostShareShape, IDocumentFilterDto, MainContext, MainThreadShareShape } from "../common/extHost.protocol.js";
import { IShareProvider, IShareService, IShareableItem } from "../../contrib/share/common/share.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
let MainThreadShare = class {
  constructor(extHostContext, shareService) {
    this.shareService = shareService;
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostShare);
  }
  proxy;
  providers = /* @__PURE__ */ new Map();
  providerDisposables = /* @__PURE__ */ new Map();
  $registerShareProvider(handle, selector, id, label, priority) {
    const provider = {
      id,
      label,
      selector,
      priority,
      provideShare: /* @__PURE__ */ __name(async (item) => {
        const result = await this.proxy.$provideShare(handle, item, CancellationToken.None);
        return typeof result === "string" ? result : URI.revive(result);
      }, "provideShare")
    };
    this.providers.set(handle, provider);
    const disposable = this.shareService.registerShareProvider(provider);
    this.providerDisposables.set(handle, disposable);
  }
  $unregisterShareProvider(handle) {
    if (this.providers.has(handle)) {
      this.providers.delete(handle);
    }
    if (this.providerDisposables.has(handle)) {
      this.providerDisposables.delete(handle);
    }
  }
  dispose() {
    this.providers.clear();
    dispose(this.providerDisposables.values());
    this.providerDisposables.clear();
  }
};
__name(MainThreadShare, "MainThreadShare");
MainThreadShare = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadShare),
  __decorateParam(1, IShareService)
], MainThreadShare);
export {
  MainThreadShare
};
//# sourceMappingURL=mainThreadShare.js.map
