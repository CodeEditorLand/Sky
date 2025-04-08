var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "./event.js";
import { Disposable } from "./lifecycle.js";
class ObservableDisposable extends Disposable {
  static {
    __name(this, "ObservableDisposable");
  }
  /**
   * Private emitter for the `onDispose` event.
   */
  _onDispose = this._register(new Emitter());
  /**
   * The event is fired when this object is disposed.
   * Note! Executes the callback immediately if already disposed.
   *
   * @param callback The callback function to be called on updates.
   */
  onDispose(callback) {
    if (this.disposed) {
      callback();
      return this;
    }
    this._register(this._onDispose.event(callback));
    return this;
  }
  /**
   * Tracks disposed state of this object.
   */
  _disposed = false;
  /**
   * Check if the current object was already disposed.
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Dispose current object if not already disposed.
   * @returns
   */
  dispose() {
    if (this.disposed) {
      return;
    }
    this._disposed = true;
    this._onDispose.fire();
    super.dispose();
  }
  /**
   * Assert that the current object was not yet disposed.
   *
   * @throws If the current object was already disposed.
   * @param error Error message or error object to throw if assertion fails.
   */
  assertNotDisposed(error) {
    assertNotDisposed(this, error);
  }
}
function assertNotDisposed(object, error) {
  if (!object.disposed) {
    return;
  }
  const errorToThrow = typeof error === "string" ? new Error(error) : error;
  throw errorToThrow;
}
__name(assertNotDisposed, "assertNotDisposed");
export {
  ObservableDisposable,
  assertNotDisposed
};
//# sourceMappingURL=observableDisposable.js.map
