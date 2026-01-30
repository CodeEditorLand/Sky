var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../../base/common/lifecycle.js";
class ResourcePool extends Disposable {
  static {
    __name(this, "ResourcePool");
  }
  get inUse() {
    return this._inUse;
  }
  constructor(_itemFactory) {
    super();
    this._itemFactory = _itemFactory;
    this.pool = [];
    this._inUse = /* @__PURE__ */ new Set();
  }
  get() {
    if (this.pool.length > 0) {
      const item2 = this.pool.pop();
      this._inUse.add(item2);
      return item2;
    }
    const item = this._register(this._itemFactory());
    this._inUse.add(item);
    return item;
  }
  release(item) {
    this._inUse.delete(item);
    this.pool.push(item);
  }
}
export {
  ResourcePool
};
//# sourceMappingURL=chatCollections.js.map
