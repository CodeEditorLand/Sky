var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../base/common/lifecycle.js";
import { ExtHostStorage } from "./extHostStorage.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { DeferredPromise, RunOnceScheduler } from "../../../base/common/async.js";
class ExtensionMemento {
  static {
    __name(this, "ExtensionMemento");
  }
  _id;
  _shared;
  _storage;
  _init;
  _value;
  _storageListener;
  _deferredPromises = /* @__PURE__ */ new Map();
  _scheduler;
  constructor(id, global, storage) {
    this._id = id;
    this._shared = global;
    this._storage = storage;
    this._init = this._storage.initializeExtensionStorage(this._shared, this._id, /* @__PURE__ */ Object.create(null)).then((value) => {
      this._value = value;
      return this;
    });
    this._storageListener = this._storage.onDidChangeStorage((e) => {
      if (e.shared === this._shared && e.key === this._id) {
        this._value = e.value;
      }
    });
    this._scheduler = new RunOnceScheduler(() => {
      const records = this._deferredPromises;
      this._deferredPromises = /* @__PURE__ */ new Map();
      (async () => {
        try {
          await this._storage.setValue(this._shared, this._id, this._value);
          for (const value of records.values()) {
            value.complete();
          }
        } catch (e) {
          for (const value of records.values()) {
            value.error(e);
          }
        }
      })();
    }, 0);
  }
  keys() {
    return Object.entries(this._value ?? {}).filter(([, value]) => value !== void 0).map(([key]) => key);
  }
  get whenReady() {
    return this._init;
  }
  get(key, defaultValue) {
    let value = this._value[key];
    if (typeof value === "undefined") {
      value = defaultValue;
    }
    return value;
  }
  update(key, value) {
    if (value !== null && typeof value === "object") {
      this._value[key] = JSON.parse(JSON.stringify(value));
    } else {
      this._value[key] = value;
    }
    const record = this._deferredPromises.get(key);
    if (record !== void 0) {
      return record.p;
    }
    const promise = new DeferredPromise();
    this._deferredPromises.set(key, promise);
    if (!this._scheduler.isScheduled()) {
      this._scheduler.schedule();
    }
    return promise.p;
  }
  dispose() {
    this._storageListener.dispose();
  }
}
class ExtensionGlobalMemento extends ExtensionMemento {
  static {
    __name(this, "ExtensionGlobalMemento");
  }
  _extension;
  setKeysForSync(keys) {
    this._storage.registerExtensionStorageKeysToSync({ id: this._id, version: this._extension.version }, keys);
  }
  constructor(extensionDescription, storage) {
    super(extensionDescription.identifier.value, true, storage);
    this._extension = extensionDescription;
  }
}
export {
  ExtensionGlobalMemento,
  ExtensionMemento
};
//# sourceMappingURL=extHostMemento.js.map
