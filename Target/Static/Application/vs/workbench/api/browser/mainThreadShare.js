var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { dispose } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { IShareService } from "../../contrib/share/common/share.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
let MainThreadShare = class MainThreadShare2 {
  static {
    __name(this, "MainThreadShare");
  }
  constructor(extHostContext, shareService) {
    this.shareService = shareService;
    this.providers = /* @__PURE__ */ new Map();
    this.providerDisposables = /* @__PURE__ */ new Map();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostShare);
  }
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
MainThreadShare = __decorate([
  extHostNamedCustomer(MainContext.MainThreadShare),
  __param(1, IShareService)
], MainThreadShare);
export {
  MainThreadShare
};
//# sourceMappingURL=mainThreadShare.js.map
