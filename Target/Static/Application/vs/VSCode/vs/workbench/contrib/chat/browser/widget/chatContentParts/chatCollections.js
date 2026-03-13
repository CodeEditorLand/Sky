var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ResourcePool {
  static {
    __name(this, "ResourcePool");
  }
  get inUse() {
    return this._inUse;
  }
  constructor(_itemFactory) {
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
    const item = this._itemFactory();
    this._inUse.add(item);
    return item;
  }
  release(item) {
    this._inUse.delete(item);
    this.pool.push(item);
  }
  /**
   * Clear and dispose the items in the pool that are not in use.
   */
  clear() {
    for (const item of this.pool) {
      item.dispose();
    }
    this.pool.length = 0;
  }
  dispose() {
    this.clear();
    for (const item of this._inUse) {
      item.dispose();
    }
    this._inUse.clear();
  }
}
export {
  ResourcePool
};
//# sourceMappingURL=chatCollections.js.map
