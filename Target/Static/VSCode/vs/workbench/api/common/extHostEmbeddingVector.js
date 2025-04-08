var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ExtHostAiEmbeddingVectorShape, IMainContext, MainContext, MainThreadAiEmbeddingVectorShape } from "./extHost.protocol.js";
import { Disposable } from "./extHostTypes.js";
class ExtHostAiEmbeddingVector {
  static {
    __name(this, "ExtHostAiEmbeddingVector");
  }
  _AiEmbeddingVectorProviders = /* @__PURE__ */ new Map();
  _nextHandle = 0;
  _proxy;
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadAiEmbeddingVector);
  }
  async $provideAiEmbeddingVector(handle, strings, token) {
    if (this._AiEmbeddingVectorProviders.size === 0) {
      throw new Error("No embedding vector providers registered");
    }
    const provider = this._AiEmbeddingVectorProviders.get(handle);
    if (!provider) {
      throw new Error("Embedding vector provider not found");
    }
    const result = await provider.provideEmbeddingVector(strings, token);
    if (!result) {
      throw new Error("Embedding vector provider returned undefined");
    }
    return result;
  }
  registerEmbeddingVectorProvider(extension, model, provider) {
    const handle = this._nextHandle;
    this._nextHandle++;
    this._AiEmbeddingVectorProviders.set(handle, provider);
    this._proxy.$registerAiEmbeddingVectorProvider(model, handle);
    return new Disposable(() => {
      this._proxy.$unregisterAiEmbeddingVectorProvider(handle);
      this._AiEmbeddingVectorProviders.delete(handle);
    });
  }
}
export {
  ExtHostAiEmbeddingVector
};
//# sourceMappingURL=extHostEmbeddingVector.js.map
