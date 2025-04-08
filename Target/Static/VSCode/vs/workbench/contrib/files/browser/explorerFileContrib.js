var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
var ExplorerExtensions = /* @__PURE__ */ ((ExplorerExtensions2) => {
  ExplorerExtensions2["FileContributionRegistry"] = "workbench.registry.explorer.fileContributions";
  return ExplorerExtensions2;
})(ExplorerExtensions || {});
class ExplorerFileContributionRegistry {
  static {
    __name(this, "ExplorerFileContributionRegistry");
  }
  _onDidRegisterDescriptor = new Emitter();
  onDidRegisterDescriptor = this._onDidRegisterDescriptor.event;
  descriptors = [];
  /** @inheritdoc */
  register(descriptor) {
    this.descriptors.push(descriptor);
    this._onDidRegisterDescriptor.fire(descriptor);
  }
  /**
   * Creates a new instance of all registered contributions.
   */
  create(insta, container, store) {
    return this.descriptors.map((d) => {
      const i = d.create(insta, container);
      store.add(i);
      return i;
    });
  }
}
const explorerFileContribRegistry = new ExplorerFileContributionRegistry();
Registry.add("workbench.registry.explorer.fileContributions" /* FileContributionRegistry */, explorerFileContribRegistry);
export {
  ExplorerExtensions,
  explorerFileContribRegistry
};
//# sourceMappingURL=explorerFileContrib.js.map
