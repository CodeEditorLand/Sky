var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { accessibleViewIsShown } from "./accessibilityConfiguration.js";
import { AccessibilityHelpAction, AccessibleViewAction } from "./accessibleViewActions.js";
import { AccessibleViewType, AccessibleContentProvider, ExtensionContentProvider, IAccessibleViewService } from "../../../../platform/accessibility/browser/accessibleView.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
class AccesibleViewHelpContribution extends Disposable {
  static {
    __name(this, "AccesibleViewHelpContribution");
  }
  static ID;
  constructor() {
    super();
    this._register(AccessibilityHelpAction.addImplementation(115, "accessible-view-help", (accessor) => {
      accessor.get(IAccessibleViewService).showAccessibleViewHelp();
      return true;
    }, accessibleViewIsShown));
  }
}
class AccesibleViewContributions extends Disposable {
  static {
    __name(this, "AccesibleViewContributions");
  }
  static ID;
  constructor() {
    super();
    AccessibleViewRegistry.getImplementations().forEach((impl) => {
      const implementation = /* @__PURE__ */ __name((accessor) => {
        const provider = impl.getProvider(accessor);
        if (!provider) {
          return false;
        }
        try {
          accessor.get(IAccessibleViewService).show(provider);
          return true;
        } catch {
          provider.dispose();
          return false;
        }
      }, "implementation");
      if (impl.type === AccessibleViewType.View) {
        this._register(AccessibleViewAction.addImplementation(impl.priority, impl.name, implementation, impl.when));
      } else {
        this._register(AccessibilityHelpAction.addImplementation(impl.priority, impl.name, implementation, impl.when));
      }
    });
  }
}
export {
  AccesibleViewContributions,
  AccesibleViewHelpContribution
};
//# sourceMappingURL=accessibleViewContributions.js.map
