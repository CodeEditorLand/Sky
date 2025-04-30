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
import { Emitter } from "../../../base/common/event.js";
import { DisposableMap, DisposableStore } from "../../../base/common/lifecycle.js";
import { registerSingleton } from "../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
const IEmbeddingsService = createDecorator("embeddingsService");
class EmbeddingsService {
  static {
    __name(this, "EmbeddingsService");
  }
  constructor() {
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
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
registerSingleton(
  IEmbeddingsService,
  EmbeddingsService,
  1
  /* InstantiationType.Delayed */
);
let MainThreadEmbeddings = class MainThreadEmbeddings2 {
  static {
    __name(this, "MainThreadEmbeddings");
  }
  constructor(context, embeddingsService) {
    this.embeddingsService = embeddingsService;
    this._store = new DisposableStore();
    this._providers = this._store.add(new DisposableMap());
    this._proxy = context.getProxy(ExtHostContext.ExtHostEmbeddings);
    this._store.add(embeddingsService.onDidChange(() => {
      this._proxy.$acceptEmbeddingModels(Array.from(embeddingsService.allProviders));
    }));
  }
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
MainThreadEmbeddings = __decorate([
  extHostNamedCustomer(MainContext.MainThreadEmbeddings),
  __param(1, IEmbeddingsService)
], MainThreadEmbeddings);
export {
  MainThreadEmbeddings
};
//# sourceMappingURL=mainThreadEmbeddings.js.map
