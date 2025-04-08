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
import { Emitter, Event } from "../../../base/common/event.js";
import { DisposableMap, DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { InstantiationType, registerSingleton } from "../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ExtHostContext, ExtHostEmbeddingsShape, MainContext, MainThreadEmbeddingsShape } from "../common/extHost.protocol.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
const IEmbeddingsService = createDecorator("embeddingsService");
class EmbeddingsService {
  static {
    __name(this, "EmbeddingsService");
  }
  _serviceBrand;
  providers;
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  constructor() {
    this.providers = /* @__PURE__ */ new Map();
  }
  get allProviders() {
    return this.providers.keys();
  }
  registerProvider(id, provider) {
    this.providers.set(id, provider);
    this._onDidChange.fire();
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this.providers.delete(id);
        this._onDidChange.fire();
      }, "dispose")
    };
  }
  computeEmbeddings(id, input, token) {
    const provider = this.providers.get(id);
    if (provider) {
      return provider.provideEmbeddings(input, token);
    } else {
      return Promise.reject(new Error(`No embeddings provider registered with id: ${id}`));
    }
  }
}
registerSingleton(IEmbeddingsService, EmbeddingsService, InstantiationType.Delayed);
let MainThreadEmbeddings = class {
  constructor(context, embeddingsService) {
    this.embeddingsService = embeddingsService;
    this._proxy = context.getProxy(ExtHostContext.ExtHostEmbeddings);
    this._store.add(embeddingsService.onDidChange(() => {
      this._proxy.$acceptEmbeddingModels(Array.from(embeddingsService.allProviders));
    }));
  }
  _store = new DisposableStore();
  _providers = this._store.add(new DisposableMap());
  _proxy;
  dispose() {
    this._store.dispose();
  }
  $registerEmbeddingProvider(handle, identifier) {
    const registration = this.embeddingsService.registerProvider(identifier, {
      provideEmbeddings: /* @__PURE__ */ __name((input, token) => {
        return this._proxy.$provideEmbeddings(handle, input, token);
      }, "provideEmbeddings")
    });
    this._providers.set(handle, registration);
  }
  $unregisterEmbeddingProvider(handle) {
    this._providers.deleteAndDispose(handle);
  }
  $computeEmbeddings(embeddingsModel, input, token) {
    return this.embeddingsService.computeEmbeddings(embeddingsModel, input, token);
  }
};
__name(MainThreadEmbeddings, "MainThreadEmbeddings");
MainThreadEmbeddings = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadEmbeddings),
  __decorateParam(1, IEmbeddingsService)
], MainThreadEmbeddings);
export {
  MainThreadEmbeddings
};
//# sourceMappingURL=mainThreadEmbeddings.js.map
