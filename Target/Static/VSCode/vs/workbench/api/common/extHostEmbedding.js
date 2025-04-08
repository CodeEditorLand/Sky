var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ExtHostEmbeddingsShape, IMainContext, MainContext, MainThreadEmbeddingsShape } from "./extHost.protocol.js";
class ExtHostEmbeddings {
  static {
    __name(this, "ExtHostEmbeddings");
  }
  _proxy;
  _provider = /* @__PURE__ */ new Map();
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _allKnownModels = /* @__PURE__ */ new Set();
  _handlePool = 0;
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadEmbeddings);
  }
  registerEmbeddingsProvider(_extension, embeddingsModel, provider) {
    if (this._allKnownModels.has(embeddingsModel)) {
      throw new Error("An embeddings provider for this model is already registered");
    }
    const handle = this._handlePool++;
    this._proxy.$registerEmbeddingProvider(handle, embeddingsModel);
    this._provider.set(handle, { id: embeddingsModel, provider });
    return toDisposable(() => {
      this._allKnownModels.delete(embeddingsModel);
      this._proxy.$unregisterEmbeddingProvider(handle);
      this._provider.delete(handle);
    });
  }
  async computeEmbeddings(embeddingsModel, input, token) {
    token ??= CancellationToken.None;
    let returnSingle = false;
    if (typeof input === "string") {
      input = [input];
      returnSingle = true;
    }
    const result = await this._proxy.$computeEmbeddings(embeddingsModel, input, token);
    if (result.length !== input.length) {
      throw new Error();
    }
    if (returnSingle) {
      if (result.length !== 1) {
        throw new Error();
      }
      return result[0];
    }
    return result;
  }
  async $provideEmbeddings(handle, input, token) {
    const data = this._provider.get(handle);
    if (!data) {
      return [];
    }
    const result = await data.provider.provideEmbeddings(input, token);
    if (!result) {
      return [];
    }
    return result;
  }
  get embeddingsModels() {
    return Array.from(this._allKnownModels);
  }
  $acceptEmbeddingModels(models) {
    this._allKnownModels = new Set(models);
    this._onDidChange.fire();
  }
}
export {
  ExtHostEmbeddings
};
//# sourceMappingURL=extHostEmbedding.js.map
