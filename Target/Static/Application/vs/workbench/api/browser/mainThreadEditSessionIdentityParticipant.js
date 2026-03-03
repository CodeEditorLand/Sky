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
import { localize } from "../../../nls.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { extHostCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { raceCancellationError } from "../../../base/common/async.js";
import { IEditSessionIdentityService } from "../../../platform/workspace/common/editSessions.js";
import { ExtHostContext } from "../common/extHost.protocol.js";
class ExtHostEditSessionIdentityCreateParticipant {
  static {
    __name(this, "ExtHostEditSessionIdentityCreateParticipant");
  }
  constructor(extHostContext) {
    this.timeout = 2e4;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostWorkspace);
  }
  async participate(workspaceFolder, token) {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error(localize("timeout.onWillCreateEditSessionIdentity", "Aborted onWillCreateEditSessionIdentity-event after 10000ms"))), this.timeout);
      this._proxy.$onWillCreateEditSessionIdentity(workspaceFolder.uri, token, this.timeout).then(resolve, reject);
    });
    return raceCancellationError(p, token);
  }
}
let EditSessionIdentityCreateParticipant = class EditSessionIdentityCreateParticipant2 {
  static {
    __name(this, "EditSessionIdentityCreateParticipant");
  }
  constructor(extHostContext, instantiationService, _editSessionIdentityService) {
    this._editSessionIdentityService = _editSessionIdentityService;
    this._saveParticipantDisposable = this._editSessionIdentityService.addEditSessionIdentityCreateParticipant(instantiationService.createInstance(ExtHostEditSessionIdentityCreateParticipant, extHostContext));
  }
  dispose() {
    this._saveParticipantDisposable.dispose();
  }
};
EditSessionIdentityCreateParticipant = __decorate([
  extHostCustomer,
  __param(1, IInstantiationService),
  __param(2, IEditSessionIdentityService)
], EditSessionIdentityCreateParticipant);
export {
  EditSessionIdentityCreateParticipant
};
//# sourceMappingURL=mainThreadEditSessionIdentityParticipant.js.map
