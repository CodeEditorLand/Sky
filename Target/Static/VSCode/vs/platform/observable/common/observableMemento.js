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
import { strictEquals } from "../../../base/common/equals.js";
import { DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { ObservableValue } from "../../../base/common/observableInternal/base.js";
import { DebugNameData } from "../../../base/common/observableInternal/debugName.js";
import { IStorageService, StorageScope, StorageTarget } from "../../storage/common/storage.js";
function observableMemento(opts) {
  return (scope, target, storageService) => {
    return new ObservableMemento(opts, scope, target, storageService);
  };
}
__name(observableMemento, "observableMemento");
let ObservableMemento = class extends ObservableValue {
  static {
    __name(this, "ObservableMemento");
  }
  _store = new DisposableStore();
  _didChange = false;
  constructor(opts, storageScope, storageTarget, storageService) {
    if (opts.defaultValue && typeof opts.defaultValue === "object") {
      opts.toStorage ??= (value) => JSON.stringify(value);
      opts.fromStorage ??= (value) => JSON.parse(value);
    }
    let initialValue = opts.defaultValue;
    const fromStorage = storageService.get(opts.key, storageScope);
    if (fromStorage !== void 0) {
      if (opts.fromStorage) {
        try {
          initialValue = opts.fromStorage(fromStorage);
        } catch {
          initialValue = opts.defaultValue;
        }
      }
    }
    super(new DebugNameData(void 0, `storage/${opts.key}`, void 0), initialValue, strictEquals);
    const didChange = storageService.onDidChangeValue(storageScope, opts.key, this._store);
    this._store.add(didChange((e) => {
      if (e.external && e.key === opts.key && !this._didChange) {
        this.set(opts.defaultValue, void 0);
      }
    }));
    this._store.add(storageService.onWillSaveState(() => {
      if (this._didChange) {
        this._didChange = false;
        const value = this.get();
        if (opts.toStorage) {
          storageService.store(opts.key, opts.toStorage(value), storageScope, storageTarget);
        } else {
          storageService.store(opts.key, String(value), storageScope, storageTarget);
        }
      }
    }));
  }
  _setValue(newValue) {
    super._setValue(newValue);
    this._didChange = true;
  }
  dispose() {
    this._store.dispose();
  }
};
ObservableMemento = __decorateClass([
  __decorateParam(3, IStorageService)
], ObservableMemento);
export {
  ObservableMemento,
  observableMemento
};
//# sourceMappingURL=observableMemento.js.map
