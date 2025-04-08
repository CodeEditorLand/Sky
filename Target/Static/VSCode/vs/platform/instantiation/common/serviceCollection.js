var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ServiceIdentifier } from "./instantiation.js";
import { SyncDescriptor } from "./descriptors.js";
class ServiceCollection {
  static {
    __name(this, "ServiceCollection");
  }
  _entries = /* @__PURE__ */ new Map();
  constructor(...entries) {
    for (const [id, service] of entries) {
      this.set(id, service);
    }
  }
  set(id, instanceOrDescriptor) {
    const result = this._entries.get(id);
    this._entries.set(id, instanceOrDescriptor);
    return result;
  }
  has(id) {
    return this._entries.has(id);
  }
  get(id) {
    return this._entries.get(id);
  }
}
export {
  ServiceCollection
};
//# sourceMappingURL=serviceCollection.js.map
