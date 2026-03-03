var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class TextAreaEditContextRegistryImpl {
  static {
    __name(this, "TextAreaEditContextRegistryImpl");
  }
  constructor() {
    this._textAreaEditContextMapping = /* @__PURE__ */ new Map();
  }
  register(ownerID, textAreaEditContext) {
    this._textAreaEditContextMapping.set(ownerID, textAreaEditContext);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._textAreaEditContextMapping.delete(ownerID);
      }, "dispose")
    };
  }
  get(ownerID) {
    return this._textAreaEditContextMapping.get(ownerID);
  }
}
const TextAreaEditContextRegistry = new TextAreaEditContextRegistryImpl();
export {
  TextAreaEditContextRegistry
};
//# sourceMappingURL=textAreaEditContextRegistry.js.map
