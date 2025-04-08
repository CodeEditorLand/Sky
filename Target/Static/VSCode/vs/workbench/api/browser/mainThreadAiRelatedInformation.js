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
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { ExtHostAiRelatedInformationShape, ExtHostContext, MainContext, MainThreadAiRelatedInformationShape } from "../common/extHost.protocol.js";
import { RelatedInformationType } from "../common/extHostTypes.js";
import { IAiRelatedInformationProvider, IAiRelatedInformationService, RelatedInformationResult } from "../../services/aiRelatedInformation/common/aiRelatedInformation.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
let MainThreadAiRelatedInformation = class extends Disposable {
  constructor(context, _aiRelatedInformationService) {
    super();
    this._aiRelatedInformationService = _aiRelatedInformationService;
    this._proxy = context.getProxy(ExtHostContext.ExtHostAiRelatedInformation);
  }
  _proxy;
  _registrations = this._register(new DisposableMap());
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
__name(MainThreadAiRelatedInformation, "MainThreadAiRelatedInformation");
MainThreadAiRelatedInformation = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadAiRelatedInformation),
  __decorateParam(1, IAiRelatedInformationService)
], MainThreadAiRelatedInformation);
export {
  MainThreadAiRelatedInformation
};
//# sourceMappingURL=mainThreadAiRelatedInformation.js.map
