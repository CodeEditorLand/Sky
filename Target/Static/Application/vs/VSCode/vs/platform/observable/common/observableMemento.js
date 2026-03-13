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
import { strictEquals } from "../../../base/common/equals.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { DebugLocation } from "../../../base/common/observable.js";
import { DebugNameData } from "../../../base/common/observableInternal/debugName.js";
import { ObservableValue } from "../../../base/common/observableInternal/observables/observableValue.js";
import { IStorageService } from "../../storage/common/storage.js";
function observableMemento(opts) {
  return (scope, target, storageService) => {
    return new ObservableMemento(opts, scope, target, storageService);
  };
}
__name(observableMemento, "observableMemento");
let ObservableMemento = class ObservableMemento2 extends ObservableValue {
  static {
    __name(this, "ObservableMemento");
  }
  constructor(opts, storageScope, storageTarget, storageService) {
    const getStorageValue = /* @__PURE__ */ __name(() => {
      const fromStorage = storageService.get(opts.key, storageScope);
      if (fromStorage !== void 0) {
        try {
          return opts.fromStorage(fromStorage);
        } catch {
          return opts.defaultValue;
        }
      }
      return opts.defaultValue;
    }, "getStorageValue");
    const initialValue = getStorageValue();
    super(new DebugNameData(void 0, `storage/${opts.key}`, void 0), initialValue, strictEquals, DebugLocation.ofCaller());
    this.opts = opts;
    this.storageScope = storageScope;
    this.storageTarget = storageTarget;
    this.storageService = storageService;
    this._store = new DisposableStore();
    this._noStorageUpdateNeeded = false;
    const didChange = storageService.onDidChangeValue(storageScope, opts.key, this._store);
    this._store.add(didChange((e) => {
      if (e.external && e.key === opts.key) {
        this._noStorageUpdateNeeded = true;
        try {
          this.set(getStorageValue(), void 0);
        } finally {
          this._noStorageUpdateNeeded = false;
        }
      }
    }));
  }
  _setValue(newValue) {
    super._setValue(newValue);
    if (this._noStorageUpdateNeeded) {
      return;
    }
    const valueToStore = this.opts.toStorage(this.get());
    this.storageService.store(this.opts.key, valueToStore, this.storageScope, this.storageTarget);
  }
  dispose() {
    this._store.dispose();
  }
};
ObservableMemento = __decorate([
  __param(3, IStorageService)
], ObservableMemento);
export {
  ObservableMemento,
  observableMemento
};
//# sourceMappingURL=observableMemento.js.map
