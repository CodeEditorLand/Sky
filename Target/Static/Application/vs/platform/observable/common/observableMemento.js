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
import { ObservableValue } from "../../../base/common/observableInternal/base.js";
import { DebugNameData } from "../../../base/common/observableInternal/debugName.js";
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
    this._store = new DisposableStore();
    this._didChange = false;
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
ObservableMemento = __decorate([
  __param(3, IStorageService)
], ObservableMemento);
export {
  ObservableMemento,
  observableMemento
};
//# sourceMappingURL=observableMemento.js.map
