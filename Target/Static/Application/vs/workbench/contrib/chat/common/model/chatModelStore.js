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
import { Emitter } from "../../../../../base/common/event.js";
import { DisposableStore, ReferenceCollection } from "../../../../../base/common/lifecycle.js";
import { ObservableMap } from "../../../../../base/common/observable.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
let ChatModelStore = class ChatModelStore2 extends ReferenceCollection {
  static {
    __name(this, "ChatModelStore");
  }
  constructor(delegate, logService) {
    super();
    this.delegate = delegate;
    this.logService = logService;
    this._store = new DisposableStore();
    this._models = new ObservableMap();
    this._modelsToDispose = /* @__PURE__ */ new Set();
    this._pendingDisposals = /* @__PURE__ */ new Set();
    this._onDidDisposeModel = this._store.add(new Emitter());
    this.onDidDisposeModel = this._onDidDisposeModel.event;
    this._onDidCreateModel = this._store.add(new Emitter());
    this.onDidCreateModel = this._onDidCreateModel.event;
  }
  get observable() {
    return this._models.observable;
  }
  values() {
    return this._models.values();
  }
  /**
   * Get a ChatModel directly without acquiring a reference.
   */
  get(uri) {
    return this._models.get(this.toKey(uri));
  }
  has(uri) {
    return this._models.has(this.toKey(uri));
  }
  acquireExisting(uri) {
    const key = this.toKey(uri);
    if (!this._models.has(key)) {
      return void 0;
    }
    return this.acquire(key);
  }
  acquireOrCreate(props) {
    return this.acquire(this.toKey(props.sessionResource), props);
  }
  createReferencedObject(key, props) {
    this._modelsToDispose.delete(key);
    const existingModel = this._models.get(key);
    if (existingModel) {
      return existingModel;
    }
    if (!props) {
      throw new Error(`No start session props provided for chat session ${key}`);
    }
    this.logService.trace(`Creating chat session ${key}`);
    const model = this.delegate.createModel(props);
    if (model.sessionResource.toString() !== key) {
      throw new Error(`Chat session key mismatch for ${key}`);
    }
    this._models.set(key, model);
    this._onDidCreateModel.fire(model);
    return model;
  }
  destroyReferencedObject(key, object) {
    this._modelsToDispose.add(key);
    const promise = this.doDestroyReferencedObject(key, object);
    this._pendingDisposals.add(promise);
    promise.finally(() => {
      this._pendingDisposals.delete(promise);
    });
  }
  async doDestroyReferencedObject(key, object) {
    try {
      await this.delegate.willDisposeModel(object);
    } catch (error) {
      this.logService.error(error);
    } finally {
      if (this._modelsToDispose.has(key)) {
        this.logService.trace(`Disposing chat session ${key}`);
        this._models.delete(key);
        this._onDidDisposeModel.fire(object);
        object.dispose();
      }
      this._modelsToDispose.delete(key);
    }
  }
  /**
   * For test use only
   */
  async waitForModelDisposals() {
    await Promise.all(this._pendingDisposals);
  }
  toKey(uri) {
    return uri.toString();
  }
  dispose() {
    this._store.dispose();
    this._models.forEach((model) => model.dispose());
  }
};
ChatModelStore = __decorate([
  __param(1, ILogService)
], ChatModelStore);
export {
  ChatModelStore
};
//# sourceMappingURL=chatModelStore.js.map
