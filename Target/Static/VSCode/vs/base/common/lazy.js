var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class Lazy {
  constructor(executor) {
    this.executor = executor;
  }
  static {
    __name(this, "Lazy");
  }
  _didRun = false;
  _value;
  _error;
  /**
   * True if the lazy value has been resolved.
   */
  get hasValue() {
    return this._didRun;
  }
  /**
   * Get the wrapped value.
   *
   * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
   * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
   */
  get value() {
    if (!this._didRun) {
      try {
        this._value = this.executor();
      } catch (err) {
        this._error = err;
      } finally {
        this._didRun = true;
      }
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
