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
import { localize } from "../../../nls.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { extHostCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { raceCancellationError } from "../../../base/common/async.js";
import { IEditSessionIdentityCreateParticipant, IEditSessionIdentityService } from "../../../platform/workspace/common/editSessions.js";
import { ExtHostContext, ExtHostWorkspaceShape } from "../common/extHost.protocol.js";
import { WorkspaceFolder } from "../../../platform/workspace/common/workspace.js";
class ExtHostEditSessionIdentityCreateParticipant {
  static {
    __name(this, "ExtHostEditSessionIdentityCreateParticipant");
  }
  _proxy;
  timeout = 1e4;
  constructor(extHostContext) {
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostWorkspace);
  }
  async participate(workspaceFolder, token) {
    const p = new Promise((resolve, reject) => {
      setTimeout(
        () => reject(new Error(localize("timeout.onWillCreateEditSessionIdentity", "Aborted onWillCreateEditSessionIdentity-event after 10000ms"))),
        this.timeout
      );
      this._proxy.$onWillCreateEditSessionIdentity(workspaceFolder.uri, token, this.timeout).then(resolve, reject);
    });
    return raceCancellationError(p, token);
  }
}
let EditSessionIdentityCreateParticipant = class {
  constructor(extHostContext, instantiationService, _editSessionIdentityService) {
    this._editSessionIdentityService = _editSessionIdentityService;
    this._saveParticipantDisposable = this._editSessionIdentityService.addEditSessionIdentityCreateParticipant(instantiationService.createInstance(ExtHostEditSessionIdentityCreateParticipant, extHostContext));
  }
  _saveParticipantDisposable;
  dispose() {
    this._saveParticipantDisposable.dispose();
  }
};
__name(EditSessionIdentityCreateParticipant, "EditSessionIdentityCreateParticipant");
EditSessionIdentityCreateParticipant = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IEditSessionIdentityService)
], EditSessionIdentityCreateParticipant);
export {
  EditSessionIdentityCreateParticipant
};
//# sourceMappingURL=mainThreadEditSessionIdentityParticipant.js.map
