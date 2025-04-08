var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IObservable, observableValue, transaction } from "./base.js";
import { derived } from "./derived.js";
class ObservableLazy {
  constructor(_computeValue) {
    this._computeValue = _computeValue;
  }
  static {
    __name(this, "ObservableLazy");
  }
  _value = observableValue(this, void 0);
  /**
   * The cached value.
   * Does not force a computation of the value.
   */
  get cachedValue() {
    return this._value;
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
  _value = observableValue(this, void 0);
  /**
   * The promise that this object wraps.
   */
  promise;
  /**
   * The current state of the promise.
   * Is `undefined` if the promise didn't resolve yet.
   */
  promiseResult = this._value;
  constructor(promise) {
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
  constructor(data, error) {
    this.data = data;
    this.error = error;
  }
  static {
    __name(this, "PromiseResult");
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
  constructor(_computePromise) {
    this._computePromise = _computePromise;
  }
  static {
    __name(this, "ObservableLazyPromise");
  }
  _lazyValue = new ObservableLazy(() => new ObservablePromise(this._computePromise()));
  /**
   * Does not enforce evaluation of the promise compute function.
   * Is undefined if the promise has not been computed yet.
   */
  cachedPromiseResult = derived(this, (reader) => this._lazyValue.cachedValue.read(reader)?.promiseResult.read(reader));
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
