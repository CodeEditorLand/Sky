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
import { ExtHostAiEmbeddingVectorShape, ExtHostContext, MainContext, MainThreadAiEmbeddingVectorShape } from "../common/extHost.protocol.js";
import { IAiEmbeddingVectorProvider, IAiEmbeddingVectorService } from "../../services/aiEmbeddingVector/common/aiEmbeddingVectorService.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
let MainThreadAiEmbeddingVector = class extends Disposable {
  constructor(context, _AiEmbeddingVectorService) {
    super();
    this._AiEmbeddingVectorService = _AiEmbeddingVectorService;
    this._proxy = context.getProxy(ExtHostContext.ExtHostAiEmbeddingVector);
  }
  _proxy;
  _registrations = this._register(new DisposableMap());
  $registerAiEmbeddingVectorProvider(model, handle) {
    const provider = {
      provideAiEmbeddingVector: /* @__PURE__ */ __name((strings, token) => {
        return this._proxy.$provideAiEmbeddingVector(
          handle,
          strings,
          token
        );
      }, "provideAiEmbeddingVector")
    };
    this._registrations.set(handle, this._AiEmbeddingVectorService.registerAiEmbeddingVectorProvider(model, provider));
  }
  $unregisterAiEmbeddingVectorProvider(handle) {
    this._registrations.deleteAndDispose(handle);
  }
};
__name(MainThreadAiEmbeddingVector, "MainThreadAiEmbeddingVector");
MainThreadAiEmbeddingVector = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadAiEmbeddingVector),
  __decorateParam(1, IAiEmbeddingVectorService)
], MainThreadAiEmbeddingVector);
export {
  MainThreadAiEmbeddingVector
};
//# sourceMappingURL=mainThreadAiEmbeddingVector.js.map
