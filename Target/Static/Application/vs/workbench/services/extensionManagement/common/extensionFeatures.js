var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
var Extensions;
(function(Extensions2) {
  Extensions2.ExtensionFeaturesRegistry = "workbench.registry.extensionFeatures";
})(Extensions || (Extensions = {}));
const IExtensionFeaturesManagementService = createDecorator("IExtensionFeaturesManagementService");
class ExtensionFeaturesRegistry {
  static {
    __name(this, "ExtensionFeaturesRegistry");
  }
  constructor() {
    this.extensionFeatures = /* @__PURE__ */ new Map();
  }
  registerExtensionFeature(descriptor) {
    if (this.extensionFeatures.has(descriptor.id)) {
      throw new Error(`Extension feature with id '${descriptor.id}' already exists`);
    }
    this.extensionFeatures.set(descriptor.id, descriptor);
    return {
      dispose: /* @__PURE__ */ __name(() => this.extensionFeatures.delete(descriptor.id), "dispose")
    };
  }
  getExtensionFeature(id) {
    return this.extensionFeatures.get(id);
  }
  getExtensionFeatures() {
    return Array.from(this.extensionFeatures.values());
  }
}
Registry.add(Extensions.ExtensionFeaturesRegistry, new ExtensionFeaturesRegistry());
export {
  Extensions,
  IExtensionFeaturesManagementService
};
//# sourceMappingURL=extensionFeatures.js.map
