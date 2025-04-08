var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class SyncDescriptor {
  static {
    __name(this, "SyncDescriptor");
  }
  ctor;
  staticArguments;
  supportsDelayedInstantiation;
  constructor(ctor, staticArguments = [], supportsDelayedInstantiation = false) {
    this.ctor = ctor;
    this.staticArguments = staticArguments;
    this.supportsDelayedInstantiation = supportsDelayedInstantiation;
  }
}
export {
  SyncDescriptor
};
//# sourceMappingURL=descriptors.js.map
