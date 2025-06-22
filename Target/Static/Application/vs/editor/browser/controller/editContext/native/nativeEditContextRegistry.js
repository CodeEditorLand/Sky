var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class NativeEditContextRegistryImpl {
  static {
    __name(this, "NativeEditContextRegistryImpl");
  }
  constructor() {
    this._nativeEditContextMapping = /* @__PURE__ */ new Map();
  }
  register(ownerID, nativeEditContext) {
    this._nativeEditContextMapping.set(ownerID, nativeEditContext);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._nativeEditContextMapping.delete(ownerID);
      }, "dispose")
    };
  }
  get(ownerID) {
    return this._nativeEditContextMapping.get(ownerID);
  }
}
const NativeEditContextRegistry = new NativeEditContextRegistryImpl();
export {
  NativeEditContextRegistry
};
//# sourceMappingURL=nativeEditContextRegistry.js.map
