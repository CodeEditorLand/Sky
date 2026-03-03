var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var LazyValueState;
(function(LazyValueState2) {
  LazyValueState2[LazyValueState2["Uninitialized"] = 0] = "Uninitialized";
  LazyValueState2[LazyValueState2["Running"] = 1] = "Running";
  LazyValueState2[LazyValueState2["Completed"] = 2] = "Completed";
})(LazyValueState || (LazyValueState = {}));
class Lazy {
  static {
    __name(this, "Lazy");
  }
  constructor(executor) {
    this.executor = executor;
    this._state = LazyValueState.Uninitialized;
  }
  /**
   * True if the lazy value has been resolved.
   */
  get hasValue() {
    return this._state === LazyValueState.Completed;
  }
  /**
   * Get the wrapped value.
   *
   * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
   * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
   */
  get value() {
    if (this._state === LazyValueState.Uninitialized) {
      this._state = LazyValueState.Running;
      try {
        this._value = this.executor();
      } catch (err) {
        this._error = err;
      } finally {
        this._state = LazyValueState.Completed;
      }
    } else if (this._state === LazyValueState.Running) {
      throw new Error("Cannot read the value of a lazy that is being initialized");
    }
    if (this._error) {
      throw this._error;
    }
    return this._value;
  }
  /**
   * Get the wrapped value without forcing evaluation.
   */
  get rawValue() {
    return this._value;
  }
}
export {
  Lazy
};
//# sourceMappingURL=lazy.js.map
