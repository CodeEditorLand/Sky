var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SyncDescriptor } from "./descriptors.js";
import { BrandedService, ServiceIdentifier } from "./instantiation.js";
const _registry = [];
var InstantiationType = /* @__PURE__ */ ((InstantiationType2) => {
  InstantiationType2[InstantiationType2["Eager"] = 0] = "Eager";
  InstantiationType2[InstantiationType2["Delayed"] = 1] = "Delayed";
  return InstantiationType2;
})(InstantiationType || {});
function registerSingleton(id, ctorOrDescriptor, supportsDelayedInstantiation) {
  if (!(ctorOrDescriptor instanceof SyncDescriptor)) {
    ctorOrDescriptor = new SyncDescriptor(ctorOrDescriptor, [], Boolean(supportsDelayedInstantiation));
  }
  _registry.push([id, ctorOrDescriptor]);
}
__name(registerSingleton, "registerSingleton");
function getSingletonServiceDescriptors() {
  return _registry;
}
__name(getSingletonServiceDescriptors, "getSingletonServiceDescriptors");
export {
  InstantiationType,
  getSingletonServiceDescriptors,
  registerSingleton
};
//# sourceMappingURL=extensions.js.map
