var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { DisposableMap } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { IQuickDiffService } from "../../contrib/scm/common/quickDiff.js";
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
let MainThreadQuickDiff = class MainThreadQuickDiff2 {
  static {
    __name(this, "MainThreadQuickDiff");
  }
  constructor(extHostContext, quickDiffService) {
    this.quickDiffService = quickDiffService;
    this.providerDisposables = new DisposableMap();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostQuickDiff);
  }
  async $registerQuickDiffProvider(handle, selector, id, label, rootUri) {
    const provider = {
      id,
      label,
      rootUri: URI.revive(rootUri),
      selector,
      kind: "contributed",
      getOriginalResource: /* @__PURE__ */ __name(async (uri) => {
        return URI.revive(await this.proxy.$provideOriginalResource(handle, uri, CancellationToken.None));
      }, "getOriginalResource")
    };
    const disposable = this.quickDiffService.addQuickDiffProvider(provider);
    this.providerDisposables.set(handle, disposable);
  }
  async $unregisterQuickDiffProvider(handle) {
    if (this.providerDisposables.has(handle)) {
      this.providerDisposables.deleteAndDispose(handle);
    }
  }
  dispose() {
    this.providerDisposables.dispose();
  }
};
MainThreadQuickDiff = __decorate([
  extHostNamedCustomer(MainContext.MainThreadQuickDiff),
  __param(1, IQuickDiffService)
], MainThreadQuickDiff);
export {
  MainThreadQuickDiff
};
//# sourceMappingURL=mainThreadQuickDiff.js.map
