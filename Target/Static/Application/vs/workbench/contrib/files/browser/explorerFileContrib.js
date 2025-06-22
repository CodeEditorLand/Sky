var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
var ExplorerExtensions;
(function(ExplorerExtensions2) {
  ExplorerExtensions2["FileContributionRegistry"] = "workbench.registry.explorer.fileContributions";
})(ExplorerExtensions || (ExplorerExtensions = {}));
class ExplorerFileContributionRegistry extends Disposable {
  static {
    __name(this, "ExplorerFileContributionRegistry");
  }
  constructor() {
    super(...arguments);
    this._onDidRegisterDescriptor = this._register(new Emitter());
    this.onDidRegisterDescriptor = this._onDidRegisterDescriptor.event;
    this.descriptors = [];
  }
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
Registry.add("workbench.registry.explorer.fileContributions", explorerFileContribRegistry);
export {
  ExplorerExtensions,
  explorerFileContribRegistry
};
//# sourceMappingURL=explorerFileContrib.js.map
