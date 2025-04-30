var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableMap } from "../../base/common/lifecycle.js";
import { assertNotDisposed } from "./observableDisposable.js";
class ObjectCache extends Disposable {
  static {
    __name(this, "ObjectCache");
  }
  constructor(factory) {
    super();
    this.factory = factory;
    this.cache = this._register(new DisposableMap());
  }
  /**
   * Get an existing object from the cache. If a requested object is not yet
   * in the cache or is disposed already, the {@linkcode factory} callback is
   * called to create a new object.
   *
   * @throws if {@linkcode factory} callback returns a disposed object.
   * @param key - ID of the object in the cache
   */
  get(key) {
    let object = this.cache.get(key);
    if (object?.disposed) {
      this.cache.deleteAndLeak(key);
      object = void 0;
    }
    if (object) {
      assertNotDisposed(object, "Object must not be disposed.");
      return object;
    }
    object = this.factory(key);
    assertNotDisposed(object, "Newly created object must not be disposed.");
    object.onDispose(() => {
      this.cache.deleteAndLeak(key);
    });
    this.cache.set(key, object);
    return object;
  }
  /**
   * Remove an object from the cache by its key.
   *
   * @param key ID of the object to remove.
   * @param dispose Whether the removed object must be disposed.
   */
  remove(key, dispose) {
    if (dispose) {
      this.cache.deleteAndDispose(key);
      return this;
    }
    this.cache.deleteAndLeak(key);
    return this;
  }
}
export {
  ObjectCache
};
//# sourceMappingURL=objectCache.js.map
