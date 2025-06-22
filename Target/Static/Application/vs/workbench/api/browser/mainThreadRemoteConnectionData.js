var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { extHostCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext } from "../common/extHost.protocol.js";
import { IRemoteAuthorityResolverService } from "../../../platform/remote/common/remoteAuthorityResolver.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
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
let MainThreadRemoteConnectionData = class MainThreadRemoteConnectionData2 extends Disposable {
  static {
    __name(this, "MainThreadRemoteConnectionData");
  }
  constructor(extHostContext, _environmentService, remoteAuthorityResolverService) {
    super();
    this._environmentService = _environmentService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostExtensionService);
    const remoteAuthority = this._environmentService.remoteAuthority;
    if (remoteAuthority) {
      this._register(remoteAuthorityResolverService.onDidChangeConnectionData(() => {
        const connectionData = remoteAuthorityResolverService.getConnectionData(remoteAuthority);
        if (connectionData) {
          this._proxy.$updateRemoteConnectionData(connectionData);
        }
      }));
    }
  }
};
MainThreadRemoteConnectionData = __decorate([
  extHostCustomer,
  __param(1, IWorkbenchEnvironmentService),
  __param(2, IRemoteAuthorityResolverService)
], MainThreadRemoteConnectionData);
export {
  MainThreadRemoteConnectionData
};
//# sourceMappingURL=mainThreadRemoteConnectionData.js.map
