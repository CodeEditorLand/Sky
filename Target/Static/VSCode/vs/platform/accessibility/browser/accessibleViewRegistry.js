var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../base/common/lifecycle.js";
import { AccessibleViewType, AccessibleContentProvider, ExtensionContentProvider } from "./accessibleView.js";
import { ContextKeyExpression } from "../../contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../instantiation/common/instantiation.js";
const AccessibleViewRegistry = new class AccessibleViewRegistry2 {
  static {
    __name(this, "AccessibleViewRegistry");
  }
  _implementations = [];
  register(implementation) {
    this._implementations.push(implementation);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const idx = this._implementations.indexOf(implementation);
        if (idx !== -1) {
          this._implementations.splice(idx, 1);
        }
      }, "dispose")
    };
  }
  getImplementations() {
    return this._implementations;
  }
}();
export {
  AccessibleViewRegistry
};
//# sourceMappingURL=accessibleViewRegistry.js.map
