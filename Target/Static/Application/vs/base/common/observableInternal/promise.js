var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { observableValue, transaction } from "./base.js";
import { derived } from "./derived.js";
class ObservableLazy {
  static {
    __name(this, "ObservableLazy");
  }
  /**
   * The cached value.
   * Does not force a computation of the value.
   */
  get cachedValue() {
    return this._value;
  }
  constructor(_computeValue) {
    this._computeValue = _computeValue;
    this._value = observableValue(this, void 0);
  }
  /**
   * Returns the cached value.
   * Computes the value if the value has not been cached yet.
   */
  getValue() {
    let v = this._value.get();
    if (!v) {
      v = this._computeValue();
      this._value.set(v, void 0);
    }
    return v;
  }
}
class ObservablePromise {
  static {
    __name(this, "ObservablePromise");
  }
  static fromFn(fn) {
    return new ObservablePromise(fn());
  }
  constructor(promise) {
    this._value = observableValue(this, void 0);
    this.promiseResult = this._value;
    this.promise = promise.then((value) => {
      transaction((tx) => {
        this._value.set(new PromiseResult(value, void 0), tx);
      });
      return value;
    }, (error) => {
      transaction((tx) => {
        this._value.set(new PromiseResult(void 0, error), tx);
      });
      throw error;
    });
  }
}
class PromiseResult {
  static {
    __name(this, "PromiseResult");
  }
  constructor(data, error) {
    this.data = data;
    this.error = error;
  }
  /**
   * Returns the value if the promise resolved, otherwise throws the error.
   */
  getDataOrThrow() {
    if (this.error) {
      throw this.error;
    }
    return this.data;
  }
}
class ObservableLazyPromise {
  static {
    __name(this, "ObservableLazyPromise");
  }
  constructor(_computePromise) {
    this._computePromise = _computePromise;
    this._lazyValue = new ObservableLazy(() => new ObservablePromise(this._computePromise()));
    this.cachedPromiseResult = derived(this, (reader) => this._lazyValue.cachedValue.read(reader)?.promiseResult.read(reader));
  }
  getPromise() {
    return this._lazyValue.getValue().promise;
  }
}
export {
  ObservableLazy,
  ObservableLazyPromise,
  ObservablePromise,
  PromiseResult
};
//# sourceMappingURL=promise.js.map
