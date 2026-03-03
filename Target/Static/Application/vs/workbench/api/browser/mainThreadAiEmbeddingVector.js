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
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { IAiEmbeddingVectorService } from "../../services/aiEmbeddingVector/common/aiEmbeddingVectorService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
let MainThreadAiEmbeddingVector = class MainThreadAiEmbeddingVector2 extends Disposable {
  static {
    __name(this, "MainThreadAiEmbeddingVector");
  }
  constructor(context, _AiEmbeddingVectorService) {
    super();
    this._AiEmbeddingVectorService = _AiEmbeddingVectorService;
    this._registrations = this._register(new DisposableMap());
    this._proxy = context.getProxy(ExtHostContext.ExtHostAiEmbeddingVector);
  }
  $registerAiEmbeddingVectorProvider(model, handle) {
    const provider = {
      provideAiEmbeddingVector: /* @__PURE__ */ __name((strings, token) => {
        return this._proxy.$provideAiEmbeddingVector(handle, strings, token);
      }, "provideAiEmbeddingVector")
    };
    this._registrations.set(handle, this._AiEmbeddingVectorService.registerAiEmbeddingVectorProvider(model, provider));
  }
  $unregisterAiEmbeddingVectorProvider(handle) {
    this._registrations.deleteAndDispose(handle);
  }
};
MainThreadAiEmbeddingVector = __decorate([
  extHostNamedCustomer(MainContext.MainThreadAiEmbeddingVector),
  __param(1, IAiEmbeddingVectorService)
], MainThreadAiEmbeddingVector);
export {
  MainThreadAiEmbeddingVector
};
//# sourceMappingURL=mainThreadAiEmbeddingVector.js.map
