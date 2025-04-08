var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { RawContextKey } from "../../contextkey/common/contextkey.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IAccessibilityService = createDecorator("accessibilityService");
var AccessibilitySupport = /* @__PURE__ */ ((AccessibilitySupport2) => {
  AccessibilitySupport2[AccessibilitySupport2["Unknown"] = 0] = "Unknown";
  AccessibilitySupport2[AccessibilitySupport2["Disabled"] = 1] = "Disabled";
  AccessibilitySupport2[AccessibilitySupport2["Enabled"] = 2] = "Enabled";
  return AccessibilitySupport2;
})(AccessibilitySupport || {});
const CONTEXT_ACCESSIBILITY_MODE_ENABLED = new RawContextKey("accessibilityModeEnabled", false);
function isAccessibilityInformation(obj) {
  return obj && typeof obj === "object" && typeof obj.label === "string" && (typeof obj.role === "undefined" || typeof obj.role === "string");
}
__name(isAccessibilityInformation, "isAccessibilityInformation");
const ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX = "ACCESSIBLE_VIEW_SHOWN_";
export {
  ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX,
  AccessibilitySupport,
  CONTEXT_ACCESSIBILITY_MODE_ENABLED,
  IAccessibilityService,
  isAccessibilityInformation
};
//# sourceMappingURL=accessibility.js.map
