var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { Disposable } from "../../../base/common/lifecycle.js";
import { IMeteredConnectionService } from "../../../platform/meteredConnection/common/meteredConnection.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
let MainThreadMeteredConnection = class MainThreadMeteredConnection2 extends Disposable {
  static {
    __name(this, "MainThreadMeteredConnection");
  }
  constructor(extHostContext, meteredConnectionService) {
    super();
    this.meteredConnectionService = meteredConnectionService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostMeteredConnection);
    this._proxy.$initializeIsConnectionMetered(this.meteredConnectionService.isConnectionMetered);
    this._register(this.meteredConnectionService.onDidChangeIsConnectionMetered((isMetered) => {
      this._proxy.$onDidChangeIsConnectionMetered(isMetered);
    }));
  }
};
MainThreadMeteredConnection = __decorate([
  extHostNamedCustomer(MainContext.MainThreadMeteredConnection),
  __param(1, IMeteredConnectionService)
], MainThreadMeteredConnection);
export {
  MainThreadMeteredConnection
};
//# sourceMappingURL=mainThreadMeteredConnection.js.map
