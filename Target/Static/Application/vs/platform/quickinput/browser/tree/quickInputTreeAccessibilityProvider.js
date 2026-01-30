var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { getCodiconAriaLabel } from "../../../../base/common/iconLabels.js";
import { localize } from "../../../../nls.js";
class QuickTreeAccessibilityProvider {
  static {
    __name(this, "QuickTreeAccessibilityProvider");
  }
  constructor(onCheckedEvent) {
    this.onCheckedEvent = onCheckedEvent;
  }
  getWidgetAriaLabel() {
    return localize("quickTree", "Quick Tree");
  }
  getAriaLabel(element) {
    return element.ariaLabel || [element.label, element.description].map((s) => getCodiconAriaLabel(s)).filter((s) => !!s).join(", ");
  }
  getWidgetRole() {
    return "tree";
  }
  getRole(_element) {
    return "checkbox";
  }
  isChecked(element) {
    return {
      get value() {
        return element.checked === "mixed" ? "mixed" : !!element.checked;
      },
      onDidChange: /* @__PURE__ */ __name((e) => Event.filter(this.onCheckedEvent, (e2) => e2.item === element)((_) => e()), "onDidChange")
    };
  }
}
export {
  QuickTreeAccessibilityProvider
};
//# sourceMappingURL=quickInputTreeAccessibilityProvider.js.map
