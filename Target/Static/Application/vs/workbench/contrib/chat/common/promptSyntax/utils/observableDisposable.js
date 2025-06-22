var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableStore, toDisposable } from "../../../../../../base/common/lifecycle.js";
class ObservableDisposable extends Disposable {
  static {
    __name(this, "ObservableDisposable");
  }
  constructor() {
    super(...arguments);
    this.store = this._register(new DisposableStore());
  }
  /**
   * Check if the current object is already has been disposed.
   */
  get isDisposed() {
    return this.store.isDisposed;
  }
  /**
   * The event is fired when this object is disposed.
   * Note! Executes the callback immediately if already disposed.
   *
   * @param callback The callback function to be called on updates.
   */
  onDispose(callback) {
    if (this.isDisposed) {
      const timeoutHandle = setTimeout(callback);
      return toDisposable(() => {
        clearTimeout(timeoutHandle);
      });
    }
    return this.store.add(toDisposable(callback));
  }
  /**
   * Adds disposable object(s) to the list of disposables
   * that will be disposed with this object.
   */
  addDisposables(...disposables) {
    for (const disposable of disposables) {
      this.store.add(disposable);
    }
    return this;
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
  if (!object.isDisposed) {
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
