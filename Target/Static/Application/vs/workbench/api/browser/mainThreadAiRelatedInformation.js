var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { IAiRelatedInformationService } from "../../services/aiRelatedInformation/common/aiRelatedInformation.js";
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
let MainThreadAiRelatedInformation = class MainThreadAiRelatedInformation2 extends Disposable {
  static {
    __name(this, "MainThreadAiRelatedInformation");
  }
  constructor(context, _aiRelatedInformationService) {
    super();
    this._aiRelatedInformationService = _aiRelatedInformationService;
    this._registrations = this._register(new DisposableMap());
    this._proxy = context.getProxy(ExtHostContext.ExtHostAiRelatedInformation);
  }
  $getAiRelatedInformation(query, types) {
    return this._aiRelatedInformationService.getRelatedInformation(query, types, CancellationToken.None);
  }
  $registerAiRelatedInformationProvider(handle, type) {
    const provider = {
      provideAiRelatedInformation: /* @__PURE__ */ __name((query, token) => {
        return this._proxy.$provideAiRelatedInformation(handle, query, token);
      }, "provideAiRelatedInformation")
    };
    this._registrations.set(handle, this._aiRelatedInformationService.registerAiRelatedInformationProvider(type, provider));
  }
  $unregisterAiRelatedInformationProvider(handle) {
    this._registrations.deleteAndDispose(handle);
  }
};
MainThreadAiRelatedInformation = __decorate([
  extHostNamedCustomer(MainContext.MainThreadAiRelatedInformation),
  __param(1, IAiRelatedInformationService)
], MainThreadAiRelatedInformation);
export {
  MainThreadAiRelatedInformation
};
//# sourceMappingURL=mainThreadAiRelatedInformation.js.map
