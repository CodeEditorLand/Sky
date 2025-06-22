var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { observableValueOpts } from "./observables/observableValueOpts.js";
class ObservableSet {
  static {
    __name(this, "ObservableSet");
  }
  constructor() {
    this._data = /* @__PURE__ */ new Set();
    this._obs = observableValueOpts({ equalsFn: /* @__PURE__ */ __name(() => false, "equalsFn") }, this);
    this.observable = this._obs;
  }
  get size() {
    return this._data.size;
  }
  has(value) {
    return this._data.has(value);
  }
  add(value, tx) {
    const hadValue = this._data.has(value);
    if (!hadValue) {
      this._data.add(value);
      this._obs.set(this, tx);
    }
    return this;
  }
  delete(value, tx) {
    const result = this._data.delete(value);
    if (result) {
      this._obs.set(this, tx);
    }
    return result;
  }
  clear(tx) {
    if (this._data.size > 0) {
      this._data.clear();
      this._obs.set(this, tx);
    }
  }
  forEach(callbackfn, thisArg) {
    this._data.forEach((value, value2, _set) => {
      callbackfn.call(thisArg, value, value2, this);
    });
  }
  *entries() {
    for (const value of this._data) {
      yield [value, value];
    }
  }
  *keys() {
    yield* this._data.keys();
  }
  *values() {
    yield* this._data.values();
  }
  [Symbol.iterator]() {
    return this.values();
  }
  get [Symbol.toStringTag]() {
    return "ObservableSet";
  }
}
export {
  ObservableSet
};
//# sourceMappingURL=set.js.map
